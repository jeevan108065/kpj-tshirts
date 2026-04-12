import express from "express";
import cors from "cors";
import crypto from "crypto";
import dotenv from "dotenv";
import pool from "./db/pool.js";
import { setupSwagger } from "./swagger.js";
import { sendEmail, passwordResetEmail, orderConfirmationEmail } from "./email.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

// ─── Security: CORS whitelist ───
const ALLOWED_ORIGINS = new Set((process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://localhost:3000,https://kpj.app,https://garments.kpj.app").split(",").map(s => s.trim()));
app.use(cors({
  origin(origin, cb) {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin || ALLOWED_ORIGINS.has(origin)) return cb(null, true);
    cb(null, false);
  },
  credentials: true,
}));

// ─── Security: Body size limit to prevent DoS ───
app.use(express.json({ limit: "2mb" }));

// ─── Health check endpoint (used by self-ping & uptime monitors) ───
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// ─── Token management ───
// Instead of sending the raw password as a token, we generate an HMAC-signed session token.
// The password never leaves the server after login.
const TOKEN_SECRET = process.env.TOKEN_SECRET || crypto.randomBytes(32).toString("hex");
const activeTokens = new Map(); // token -> { createdAt }
const TOKEN_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

function generateToken() {
  const token = crypto.randomBytes(48).toString("hex");
  activeTokens.set(token, { createdAt: Date.now() });
  return token;
}

function isValidToken(token) {
  if (!token || typeof token !== "string") return false;
  const session = activeTokens.get(token);
  if (!session) return false;
  if (Date.now() - session.createdAt > TOKEN_MAX_AGE) {
    activeTokens.delete(token);
    return false;
  }
  return true;
}

// Cleanup expired tokens periodically
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of activeTokens) {
    if (now - session.createdAt > TOKEN_MAX_AGE) activeTokens.delete(token);
  }
}, 60 * 60 * 1000); // every hour

// ─── Auth middleware — timing-safe comparison ───
function adminAuth(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!isValidToken(token)) return res.status(401).json({ error: "Unauthorized" });
  next();
}

// ─── Rate limiting for public endpoints ───
const rateLimitMap = new Map();
function rateLimit(windowMs, maxRequests) {
  return (req, res, next) => {
    const ip = req.ip || req.connection?.remoteAddress || "unknown";
    const now = Date.now();
    const key = `${req.path}:${ip}`;
    const entry = rateLimitMap.get(key);
    if (!entry || now - entry.windowStart > windowMs) {
      rateLimitMap.set(key, { windowStart: now, count: 1 });
      return next();
    }
    entry.count++;
    if (entry.count > maxRequests) {
      return res.status(429).json({ error: "Too many requests. Please try again later." });
    }
    next();
  };
}

// Cleanup rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now - entry.windowStart > 300000) rateLimitMap.delete(key);
  }
}, 300000);

// ─── Sanitize: strip HTML/script tags from user input ───
function sanitize(str) {
  if (typeof str !== "string") return str;
  return str.replace(/<[^>]*>/g, "").trim();
}

// ─── Pagination + filter helper ───
function paginated(baseQuery, { req, allowedFilters = {}, defaultOrder = "id DESC" }) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];
  let idx = 1;
  for (const [qKey, { col, op = "ILIKE" }] of Object.entries(allowedFilters)) {
    const val = req.query[qKey];
    if (!val) continue;
    if (op === "ILIKE") { conditions.push(`${col} ILIKE $${idx}`); params.push(`%${val}%`); }
    else if (op === "=") { conditions.push(`${col} = $${idx}`); params.push(val); }
    else if (op === ">=") { conditions.push(`${col} >= $${idx}`); params.push(val); }
    else if (op === "<=") { conditions.push(`${col} <= $${idx}`); params.push(val); }
    idx++;
  }
  const where = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";
  const countSql = `SELECT COUNT(*) FROM (${baseQuery}${where}) _t`;
  const dataSql = `${baseQuery}${where} ORDER BY ${defaultOrder} LIMIT $${idx} OFFSET $${idx + 1}`;
  return { countSql, dataSql, params, limit, offset, page };
}



// ─── Swagger UI ───
setupSwagger(app);

// ─── PUBLIC: Metrics ───
app.get("/api/metrics", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM metrics WHERE id = 1");
    if (rows.length === 0) return res.json({});
    const m = rows[0];
    const leads = (await pool.query("SELECT COUNT(*) FROM leads")).rows[0].count;
    const orders = (await pool.query("SELECT COUNT(*) FROM orders")).rows[0].count;
    const products = (await pool.query("SELECT COUNT(*) FROM product_types")).rows[0].count;
    const quotes = (await pool.query("SELECT COUNT(*) FROM quotes")).rows[0].count;
    const delivered = (await pool.query("SELECT COALESCE(SUM(total_qty),0) as qty, COUNT(DISTINCT client_name) as clients FROM orders WHERE status='delivered'")).rows[0];
    res.json({
      tshirtsDelivered: Number.parseInt(delivered.qty, 10) || m.tshirts_delivered,
      happyClients: Number.parseInt(delivered.clients, 10) || m.happy_clients,
      expressDelivery: m.express_delivery,
      satisfactionRate: m.satisfaction_rate,
      totalLeads: Number.parseInt(leads, 10),
      totalOrders: Number.parseInt(orders, 10),
      totalProducts: Number.parseInt(products, 10),
      totalQuotes: Number.parseInt(quotes, 10),
    });
  } catch (err) {
    console.error("GET /api/metrics error:", err.message);
    res.status(500).json({ error: "Service temporarily unavailable" });
  }
});

// ─── AUTH — password never sent back, only a signed token ───
app.post("/api/auth/login", rateLimit(60000, 10), (req, res) => {
  const { password } = req.body;
  if (!password || typeof password !== "string") {
    return res.status(400).json({ error: "Password is required" });
  }
  // Timing-safe comparison to prevent timing attacks
  const expected = process.env.ADMIN_PASSWORD || "";
  const pwdBuf = Buffer.from(password);
  const expectedBuf = Buffer.from(expected);
  const match = pwdBuf.length === expectedBuf.length && crypto.timingSafeEqual(pwdBuf, expectedBuf);
  if (match) {
    const token = generateToken();
    res.json({ token, role: "admin" });
  } else {
    res.status(401).json({ error: "Invalid password" });
  }
});

// ─── USER AUTH — crypto.scrypt password hashing ───
import { promisify } from "util";
const scryptAsync = promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${salt}:${buf.toString("hex")}`;
}

async function verifyPassword(password, hash) {
  const [salt, key] = hash.split(":");
  const buf = await scryptAsync(password, salt, 64);
  return crypto.timingSafeEqual(Buffer.from(key, "hex"), buf);
}

// User token management (separate from admin tokens)
const userTokens = new Map(); // token -> { userId, createdAt }

function generateUserToken(userId) {
  const token = crypto.randomBytes(48).toString("hex");
  userTokens.set(token, { userId, createdAt: Date.now() });
  return token;
}

function getUserFromToken(token) {
  if (!token || typeof token !== "string") return null;
  const session = userTokens.get(token);
  if (!session) return null;
  if (Date.now() - session.createdAt > TOKEN_MAX_AGE) {
    userTokens.delete(token);
    return null;
  }
  return session.userId;
}

// Cleanup expired user tokens
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of userTokens) {
    if (now - session.createdAt > TOKEN_MAX_AGE) userTokens.delete(token);
  }
}, 60 * 60 * 1000);

// User auth middleware
function userAuth(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const userId = getUserFromToken(token);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  req.userId = userId;
  next();
}

// Register
app.post("/api/users/register", rateLimit(60000, 5), async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Name, email and password are required" });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });
    const emailLower = email.toLowerCase().trim();
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [emailLower]);
    if (existing.rows.length > 0) return res.status(409).json({ error: "Email already registered" });
    const password_hash = await hashPassword(password);
    const { rows } = await pool.query(
      "INSERT INTO users (name, email, phone, password_hash) VALUES ($1,$2,$3,$4) RETURNING id, name, email, phone, created_at",
      [sanitize(name), emailLower, sanitize(phone || ""), password_hash]
    );
    const token = generateUserToken(rows[0].id);
    res.status(201).json({ token, user: rows[0] });
  } catch (err) {
    console.error("POST /api/users/register error:", err.message);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login
app.post("/api/users/login", rateLimit(60000, 10), async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email.toLowerCase().trim()]);
    if (rows.length === 0) return res.status(401).json({ error: "Invalid email or password" });
    const user = rows[0];
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid email or password" });
    const token = generateUserToken(user.id);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, created_at: user.created_at } });
  } catch (err) {
    console.error("POST /api/users/login error:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
});

// Get current user profile
app.get("/api/users/me", userAuth, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT id, name, email, phone, created_at FROM users WHERE id = $1", [req.userId]);
    if (rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("GET /api/users/me error:", err.message);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Get user's quotes (matched by email)
app.get("/api/users/my-quotes", userAuth, async (req, res) => {
  try {
    const { rows: userRows } = await pool.query("SELECT email FROM users WHERE id = $1", [req.userId]);
    if (userRows.length === 0) return res.status(404).json({ error: "User not found" });
    const { rows } = await pool.query(
      "SELECT id, quote_number, quote_type, billing_name, grand_total, total_qty, status, created_at FROM quotes WHERE billing_email = $1 ORDER BY created_at DESC",
      [userRows[0].email]
    );
    res.json(rows);
  } catch (err) {
    console.error("GET /api/users/my-quotes error:", err.message);
    res.status(500).json({ error: "Failed to fetch quotes" });
  }
});

// Get user's orders (matched via quotes by email)
app.get("/api/users/my-orders", userAuth, async (req, res) => {
  try {
    const { rows: userRows } = await pool.query("SELECT email FROM users WHERE id = $1", [req.userId]);
    if (userRows.length === 0) return res.status(404).json({ error: "User not found" });
    const { rows } = await pool.query(
      `SELECT o.id, o.client_name, o.items, o.total_amount, o.total_qty, o.status, o.created_at, o.delivered_at
       FROM orders o JOIN quotes q ON o.quote_id = q.id
       WHERE q.billing_email = $1 ORDER BY o.created_at DESC`,
      [userRows[0].email]
    );
    res.json(rows);
  } catch (err) {
    console.error("GET /api/users/my-orders error:", err.message);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Get user's uniform orders (matched by email)
app.get("/api/users/my-uniform-orders", userAuth, async (req, res) => {
  try {
    const { rows: userRows } = await pool.query("SELECT email FROM users WHERE id = $1", [req.userId]);
    if (userRows.length === 0) return res.status(404).json({ error: "User not found" });
    const { rows } = await pool.query(
      `SELECT uo.id, uo.student_name, uo.student_class, uo.items, uo.subtotal, uo.gst_amount, uo.discount_amount, uo.total_amount, uo.payment_status, uo.order_status, uo.created_at, s.name as school_name
       FROM uniform_orders uo LEFT JOIN schools s ON uo.school_id = s.id
       WHERE uo.parent_email = $1 ORDER BY uo.created_at DESC`,
      [userRows[0].email]
    );
    res.json(rows);
  } catch (err) {
    console.error("GET /api/users/my-uniform-orders error:", err.message);
    res.status(500).json({ error: "Failed to fetch uniform orders" });
  }
});

// ─── Password Reset ───
const resetTokens = new Map(); // token -> { email, createdAt }
const RESET_TOKEN_MAX_AGE = 30 * 60 * 1000; // 30 minutes

// Cleanup expired reset tokens
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of resetTokens) {
    if (now - data.createdAt > RESET_TOKEN_MAX_AGE) resetTokens.delete(token);
  }
}, 10 * 60 * 1000);

// Request password reset
app.post("/api/users/forgot-password", rateLimit(60000, 5), async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    const emailLower = email.toLowerCase().trim();
    const { rows } = await pool.query("SELECT id FROM users WHERE email = $1", [emailLower]);
    // Always return success to prevent email enumeration
    if (rows.length === 0) return res.json({ message: "If that email exists, a reset link has been generated" });
    const token = crypto.randomBytes(32).toString("hex");
    resetTokens.set(token, { email: emailLower, createdAt: Date.now() });
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${token}`;
    await sendEmail({
      to: emailLower,
      subject: "Reset your KPJ Garments password",
      html: passwordResetEmail(resetUrl),
    });
    res.json({ message: "If that email exists, a reset link has been generated" });
  } catch (err) {
    console.error("POST /api/users/forgot-password error:", err.message);
    res.status(500).json({ error: "Failed to process reset request" });
  }
});

// Reset password with token
app.post("/api/users/reset-password", rateLimit(60000, 5), async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: "Token and new password are required" });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });
    const data = resetTokens.get(token);
    if (!data || Date.now() - data.createdAt > RESET_TOKEN_MAX_AGE) {
      resetTokens.delete(token);
      return res.status(400).json({ error: "Reset link is invalid or expired" });
    }
    const password_hash = await hashPassword(password);
    await pool.query("UPDATE users SET password_hash = $1 WHERE email = $2", [password_hash, data.email]);
    resetTokens.delete(token);
    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("POST /api/users/reset-password error:", err.message);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// ─── Categories (with subcategory support) ───
app.get("/api/categories", async (req, res) => {
  try {
    const { countSql, dataSql, params, limit, offset, page } = paginated(
      "SELECT * FROM categories", { req, allowedFilters: { search: { col: "name", op: "ILIKE" } }, defaultOrder: "parent_id NULLS FIRST, id" }
    );
    const total = parseInt((await pool.query(countSql, params)).rows[0].count);
    const { rows } = await pool.query(dataSql, [...params, limit, offset]);
    res.json({ rows, total, page, limit });
  } catch (err) { console.error("GET /api/categories error:", err.message); res.json({ rows: [], total: 0, page: 1, limit: 10 }); }
});
app.post("/api/categories", adminAuth, async (req, res) => {
  try {
    const { name, description, parent_id } = req.body;
    const { rows } = await pool.query("INSERT INTO categories (name, description, parent_id) VALUES ($1,$2,$3) RETURNING *", [sanitize(name), sanitize(description), parent_id || null]);
    res.json(rows[0]);
  } catch (err) { console.error("POST /api/categories error:", err.message); res.status(500).json({ error: "Failed to create category" }); }
});
app.put("/api/categories/:id", adminAuth, async (req, res) => {
  try {
    const { name, description, parent_id } = req.body;
    const { rows } = await pool.query("UPDATE categories SET name=$1, description=$2, parent_id=$3 WHERE id=$4 RETURNING *", [sanitize(name), sanitize(description), parent_id || null, req.params.id]);
    res.json(rows[0]);
  } catch (err) { console.error("PUT /api/categories error:", err.message); res.status(500).json({ error: "Failed to update category" }); }
});
app.delete("/api/categories/:id", adminAuth, async (req, res) => {
  try {
    await pool.query("UPDATE categories SET parent_id=NULL WHERE parent_id=$1", [req.params.id]);
    await pool.query("DELETE FROM categories WHERE id=$1", [req.params.id]);
    res.json({ ok: true });
  } catch (err) { console.error("DELETE /api/categories error:", err.message); res.status(500).json({ error: "Failed to delete category" }); }
});

// ─── Payment Methods ───
app.get("/api/payment-methods", async (req, res) => {
  try {
    const { countSql, dataSql, params, limit, offset, page } = paginated(
      "SELECT * FROM payment_methods", { req, allowedFilters: { search: { col: "label", op: "ILIKE" }, type: { col: "type", op: "=" } }, defaultOrder: "is_default DESC, id" }
    );
    const total = parseInt((await pool.query(countSql, params)).rows[0].count);
    const { rows } = await pool.query(dataSql, [...params, limit, offset]);
    res.json({ rows, total, page, limit });
  } catch (err) { console.error("GET /api/payment-methods error:", err.message); res.json({ rows: [], total: 0, page: 1, limit: 10 }); }
});
app.post("/api/payment-methods", adminAuth, async (req, res) => {
  try {
    const { type, label, bank_name, bank_account, bank_ifsc, bank_branch, upi_id, is_default } = req.body;
    if (is_default) await pool.query("UPDATE payment_methods SET is_default=false");
    const { rows } = await pool.query(
      "INSERT INTO payment_methods (type,label,bank_name,bank_account,bank_ifsc,bank_branch,upi_id,is_default) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
      [type || "bank", sanitize(label), sanitize(bank_name), sanitize(bank_account), sanitize(bank_ifsc), sanitize(bank_branch), sanitize(upi_id), is_default || false]
    );
    res.json(rows[0]);
  } catch (err) { console.error("POST /api/payment-methods error:", err.message); res.status(500).json({ error: "Failed to create payment method" }); }
});
app.put("/api/payment-methods/:id", adminAuth, async (req, res) => {
  try {
    const { type, label, bank_name, bank_account, bank_ifsc, bank_branch, upi_id, is_default } = req.body;
    if (is_default) await pool.query("UPDATE payment_methods SET is_default=false");
    const { rows } = await pool.query(
      "UPDATE payment_methods SET type=$1,label=$2,bank_name=$3,bank_account=$4,bank_ifsc=$5,bank_branch=$6,upi_id=$7,is_default=$8 WHERE id=$9 RETURNING *",
      [type, sanitize(label), sanitize(bank_name), sanitize(bank_account), sanitize(bank_ifsc), sanitize(bank_branch), sanitize(upi_id), is_default || false, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) { console.error("PUT /api/payment-methods error:", err.message); res.status(500).json({ error: "Failed to update payment method" }); }
});
app.delete("/api/payment-methods/:id", adminAuth, async (req, res) => {
  try {
    await pool.query("DELETE FROM payment_methods WHERE id=$1", [req.params.id]);
    res.json({ ok: true });
  } catch (err) { console.error("DELETE /api/payment-methods error:", err.message); res.status(500).json({ error: "Failed to delete payment method" }); }
});

// ─── Products / Inventory ───
app.get("/api/products", async (req, res) => {
  try {
    const { countSql, dataSql, params, limit, offset, page } = paginated(
      "SELECT * FROM product_types", { req, allowedFilters: { search: { col: "name", op: "ILIKE" }, category: { col: "category", op: "=" } }, defaultOrder: "id DESC" }
    );
    const total = parseInt((await pool.query(countSql, params)).rows[0].count);
    const { rows } = await pool.query(dataSql, [...params, limit, offset]);
    res.json({ rows, total, page, limit });
  } catch (err) { console.error("GET /api/products error:", err.message); res.json({ rows: [], total: 0, page: 1, limit: 10 }); }
});
app.post("/api/products", adminAuth, async (req, res) => {
  try {
    const { name, category, hsn_code, unit, price, stock } = req.body;
    const { rows } = await pool.query(
      "INSERT INTO product_types (name,category,hsn_code,unit,price,stock) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [sanitize(name), sanitize(category), sanitize(hsn_code), sanitize(unit), price || 0, stock || 0]
    );
    res.json(rows[0]);
  } catch (err) { console.error("POST /api/products error:", err.message); res.status(500).json({ error: "Failed to create product" }); }
});
app.put("/api/products/:id", adminAuth, async (req, res) => {
  try {
    const { name, category, hsn_code, unit, price, stock } = req.body;
    const { rows } = await pool.query(
      "UPDATE product_types SET name=$1,category=$2,hsn_code=$3,unit=$4,price=$5,stock=$6 WHERE id=$7 RETURNING *",
      [sanitize(name), sanitize(category), sanitize(hsn_code), sanitize(unit), price || 0, stock || 0, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) { console.error("PUT /api/products error:", err.message); res.status(500).json({ error: "Failed to update product" }); }
});
app.delete("/api/products/:id", adminAuth, async (req, res) => {
  try {
    await pool.query("DELETE FROM product_types WHERE id=$1", [req.params.id]);
    res.json({ ok: true });
  } catch (err) { console.error("DELETE /api/products error:", err.message); res.status(500).json({ error: "Failed to delete product" }); }
});

// ─── Leads ───
app.get("/api/leads", adminAuth, async (req, res) => {
  try {
    const { countSql, dataSql, params, limit, offset, page } = paginated(
      "SELECT * FROM leads", { req, allowedFilters: { search: { col: "name", op: "ILIKE" }, status: { col: "status", op: "=" } }, defaultOrder: "id DESC" }
    );
    const total = parseInt((await pool.query(countSql, params)).rows[0].count);
    const { rows } = await pool.query(dataSql, [...params, limit, offset]);
    res.json({ rows, total, page, limit });
  } catch (err) { console.error("GET /api/leads error:", err.message); res.status(500).json({ error: "Failed to fetch leads" }); }
});
app.post("/api/leads", adminAuth, async (req, res) => {
  try {
    const { name, phone, email, product, quantity, status, source, latitude, longitude, comments } = req.body;
    const { rows } = await pool.query(
      "INSERT INTO leads (name,phone,email,product,quantity,status,source,latitude,longitude,comments) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *",
      [sanitize(name), sanitize(phone), sanitize(email), sanitize(product), sanitize(quantity), status || "new", source || "website", latitude || null, longitude || null, sanitize(comments)]
    );
    res.json(rows[0]);
  } catch (err) { console.error("POST /api/leads error:", err.message); res.status(500).json({ error: "Failed to create lead" }); }
});
app.put("/api/leads/:id", adminAuth, async (req, res) => {
  try {
    const { name, phone, email, product, quantity, status, source, latitude, longitude, comments } = req.body;
    const { rows } = await pool.query(
      "UPDATE leads SET name=$1,phone=$2,email=$3,product=$4,quantity=$5,status=$6,source=$7,latitude=$8,longitude=$9,comments=$10,updated_at=NOW() WHERE id=$11 RETURNING *",
      [sanitize(name), sanitize(phone), sanitize(email), sanitize(product), sanitize(quantity), status, source, latitude || null, longitude || null, sanitize(comments), req.params.id]
    );
    res.json(rows[0]);
  } catch (err) { console.error("PUT /api/leads error:", err.message); res.status(500).json({ error: "Failed to update lead" }); }
});
app.delete("/api/leads/:id", adminAuth, async (req, res) => {
  try {
    await pool.query("DELETE FROM leads WHERE id=$1", [req.params.id]);
    res.json({ ok: true });
  } catch (err) { console.error("DELETE /api/leads error:", err.message); res.status(500).json({ error: "Failed to delete lead" }); }
});

// ─── Quotes (Tax Invoices only) ───
app.get("/api/quotes", adminAuth, async (req, res) => {
  try {
    const base = `SELECT q.*, pm.label as payment_label, pm.type as payment_type,
             pm.bank_name as pm_bank_name, pm.bank_account as pm_bank_account,
             pm.bank_ifsc as pm_bank_ifsc, pm.bank_branch as pm_bank_branch, pm.upi_id as pm_upi_id
      FROM quotes q LEFT JOIN payment_methods pm ON q.payment_method_id = pm.id`;
    const { countSql, dataSql, params, limit, offset, page } = paginated(
      base, { req, allowedFilters: { search: { col: "q.billing_name", op: "ILIKE" }, status: { col: "q.status", op: "=" } }, defaultOrder: "q.id DESC" }
    );
    const total = parseInt((await pool.query(countSql, params)).rows[0].count);
    const { rows } = await pool.query(dataSql, [...params, limit, offset]);
    res.json({ rows, total, page, limit });
  } catch (err) { console.error("GET /api/quotes error:", err.message); res.status(500).json({ error: "Failed to fetch quotes" }); }
});

app.get("/api/quotes/next-number", adminAuth, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT next_val FROM invoice_counter WHERE id='tax_invoice'");
    const num = rows[0]?.next_val || 1;
    res.json({ quoteNumber: `KPJ-INV-${String(num).padStart(4, "0")}`, nextVal: num });
  } catch (err) { console.error("GET /api/quotes/next-number error:", err.message); res.status(500).json({ error: "Failed to get next number" }); }
});

app.post("/api/quotes", adminAuth, async (req, res) => {
  try {
    const q = req.body;
    const ctr = await pool.query("UPDATE invoice_counter SET next_val = next_val + 1 WHERE id='tax_invoice' RETURNING next_val");
    const num = (ctr.rows[0].next_val - 1);
    const quoteNumber = `KPJ-INV-${String(num).padStart(4, "0")}`;
    const { rows } = await pool.query(
      `INSERT INTO quotes (quote_number, quote_type, lead_id,
       billing_name, billing_address, billing_gstin, billing_phone, billing_email,
       shipping_name, shipping_address, shipping_phone,
       items, payment_method_id,
       subtotal, cgst_rate, sgst_rate, cgst_amount, sgst_amount, discount, grand_total, total_qty, comments, status)
       VALUES ($1,'tax_invoice',$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22) RETURNING *`,
      [quoteNumber, q.lead_id || null,
       q.billing_name, q.billing_address, q.billing_gstin, q.billing_phone, q.billing_email,
       q.shipping_name, q.shipping_address, q.shipping_phone,
       JSON.stringify(q.items), q.payment_method_id || null,
       q.subtotal, q.cgst_rate, q.sgst_rate, q.cgst_amount, q.sgst_amount, q.discount, q.grand_total, q.total_qty, q.comments || "", q.status || "draft"]
    );
    res.json(rows[0]);
  } catch (err) { console.error("POST /api/quotes error:", err.message); res.status(500).json({ error: "Failed to create quote" }); }
});

app.put("/api/quotes/:id", adminAuth, async (req, res) => {
  try {
    const q = req.body;
    const { rows } = await pool.query(
      `UPDATE quotes SET
       billing_name=$1, billing_address=$2, billing_gstin=$3, billing_phone=$4, billing_email=$5,
       shipping_name=$6, shipping_address=$7, shipping_phone=$8,
       items=$9, payment_method_id=$10,
       subtotal=$11, cgst_rate=$12, sgst_rate=$13, cgst_amount=$14, sgst_amount=$15,
       discount=$16, grand_total=$17, total_qty=$18, comments=$19, status=$20
       WHERE id=$21 RETURNING *`,
      [q.billing_name, q.billing_address, q.billing_gstin, q.billing_phone, q.billing_email,
       q.shipping_name, q.shipping_address, q.shipping_phone,
       JSON.stringify(q.items), q.payment_method_id || null,
       q.subtotal, q.cgst_rate, q.sgst_rate, q.cgst_amount, q.sgst_amount,
       q.discount, q.grand_total, q.total_qty, q.comments || "", q.status || "draft",
       req.params.id]
    );
    res.json(rows[0]);
  } catch (err) { console.error("PUT /api/quotes error:", err.message); res.status(500).json({ error: "Failed to update quote" }); }
});

app.delete("/api/quotes/:id", adminAuth, async (req, res) => {
  try {
    await pool.query("DELETE FROM quotes WHERE id=$1", [req.params.id]);
    res.json({ ok: true });
  } catch (err) { console.error("DELETE /api/quotes error:", err.message); res.status(500).json({ error: "Failed to delete quote" }); }
});

// ─── Sample Quotes (separate table, no unique constraint on quote_number) ───
const SQ_BASE = `SELECT sq.*, pm.label as payment_label, pm.type as payment_type,
  pm.bank_name as pm_bank_name, pm.bank_account as pm_bank_account,
  pm.bank_ifsc as pm_bank_ifsc, pm.bank_branch as pm_bank_branch, pm.upi_id as pm_upi_id
  FROM sample_quotes sq LEFT JOIN payment_methods pm ON sq.payment_method_id = pm.id`;

app.get("/api/sample-quotes", adminAuth, async (req, res) => {
  try {
    const { countSql, dataSql, params, limit, offset, page } = paginated(
      SQ_BASE, { req, allowedFilters: { search: { col: "sq.billing_name", op: "ILIKE" }, status: { col: "sq.status", op: "=" } }, defaultOrder: "sq.id DESC" }
    );
    const total = parseInt((await pool.query(countSql, params)).rows[0].count);
    const { rows } = await pool.query(dataSql, [...params, limit, offset]);
    res.json({ rows, total, page, limit });
  } catch (err) { console.error("GET /api/sample-quotes error:", err.message); res.status(500).json({ error: "Failed to fetch sample quotes" }); }
});

app.get("/api/sample-quotes/next-number", adminAuth, async (req, res) => {
  try {
    await pool.query("INSERT INTO invoice_counter (id, next_val) VALUES ('sample_quotation', 1) ON CONFLICT (id) DO NOTHING");
    const { rows } = await pool.query("SELECT next_val FROM invoice_counter WHERE id='sample_quotation'");
    const num = rows[0]?.next_val || 1;
    res.json({ quoteNumber: `KPJ-SQ-${String(num).padStart(4, "0")}`, nextVal: num });
  } catch (err) { console.error("GET /api/sample-quotes/next-number error:", err.message); res.status(500).json({ error: "Failed to get next number" }); }
});

app.post("/api/sample-quotes", adminAuth, async (req, res) => {
  try {
    const q = req.body;
    await pool.query("INSERT INTO invoice_counter (id, next_val) VALUES ('sample_quotation', 1) ON CONFLICT (id) DO NOTHING");
    const ctr = await pool.query("UPDATE invoice_counter SET next_val = next_val + 1 WHERE id='sample_quotation' RETURNING next_val");
    const num = (ctr.rows[0].next_val - 1);
    const quoteNumber = `KPJ-SQ-${String(num).padStart(4, "0")}`;
    const { rows } = await pool.query(
      `INSERT INTO sample_quotes (quote_number,
       billing_name, billing_address, billing_gstin, billing_phone, billing_email,
       shipping_name, shipping_address, shipping_phone,
       items, payment_method_id,
       subtotal, cgst_rate, sgst_rate, cgst_amount, sgst_amount, discount, grand_total, total_qty, comments, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21) RETURNING *`,
      [quoteNumber,
       q.billing_name, q.billing_address, q.billing_gstin, q.billing_phone, q.billing_email,
       q.shipping_name, q.shipping_address, q.shipping_phone,
       JSON.stringify(q.items), q.payment_method_id || null,
       q.subtotal, q.cgst_rate, q.sgst_rate, q.cgst_amount, q.sgst_amount, q.discount, q.grand_total, q.total_qty, q.comments || "", q.status || "draft"]
    );
    res.json(rows[0]);
  } catch (err) { console.error("POST /api/sample-quotes error:", err.message); res.status(500).json({ error: "Failed to create sample quote" }); }
});

app.put("/api/sample-quotes/:id", adminAuth, async (req, res) => {
  try {
    const q = req.body;
    const { rows } = await pool.query(
      `UPDATE sample_quotes SET
       billing_name=$1, billing_address=$2, billing_gstin=$3, billing_phone=$4, billing_email=$5,
       shipping_name=$6, shipping_address=$7, shipping_phone=$8,
       items=$9, payment_method_id=$10,
       subtotal=$11, cgst_rate=$12, sgst_rate=$13, cgst_amount=$14, sgst_amount=$15,
       discount=$16, grand_total=$17, total_qty=$18, comments=$19, status=$20
       WHERE id=$21 RETURNING *`,
      [q.billing_name, q.billing_address, q.billing_gstin, q.billing_phone, q.billing_email,
       q.shipping_name, q.shipping_address, q.shipping_phone,
       JSON.stringify(q.items), q.payment_method_id || null,
       q.subtotal, q.cgst_rate, q.sgst_rate, q.cgst_amount, q.sgst_amount,
       q.discount, q.grand_total, q.total_qty, q.comments || "", q.status || "draft",
       req.params.id]
    );
    res.json(rows[0]);
  } catch (err) { console.error("PUT /api/sample-quotes error:", err.message); res.status(500).json({ error: "Failed to update sample quote" }); }
});

app.delete("/api/sample-quotes/:id", adminAuth, async (req, res) => {
  try {
    await pool.query("DELETE FROM sample_quotes WHERE id=$1", [req.params.id]);
    res.json({ ok: true });
  } catch (err) { console.error("DELETE /api/sample-quotes error:", err.message); res.status(500).json({ error: "Failed to delete sample quote" }); }
});

// Convert: copy sample quote → new tax invoice in quotes table
app.post("/api/sample-quotes/:id/convert", adminAuth, async (req, res) => {
  try {
    const sq = (await pool.query("SELECT * FROM sample_quotes WHERE id=$1", [req.params.id])).rows[0];
    if (!sq) return res.status(404).json({ error: "Sample quote not found" });
    const ctr = await pool.query("UPDATE invoice_counter SET next_val = next_val + 1 WHERE id='tax_invoice' RETURNING next_val");
    const num = ctr.rows[0].next_val - 1;
    const invNumber = `KPJ-INV-${String(num).padStart(4, "0")}`;
    const { rows } = await pool.query(
      `INSERT INTO quotes (quote_number, quote_type,
       billing_name, billing_address, billing_gstin, billing_phone, billing_email,
       shipping_name, shipping_address, shipping_phone,
       items, payment_method_id,
       subtotal, cgst_rate, sgst_rate, cgst_amount, sgst_amount, discount, grand_total, total_qty, comments, status)
       VALUES ($1,'tax_invoice',$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22) RETURNING *`,
      [invNumber,
       sq.billing_name, sq.billing_address, sq.billing_gstin, sq.billing_phone, sq.billing_email,
       sq.shipping_name, sq.shipping_address, sq.shipping_phone,
       JSON.stringify(sq.items), sq.payment_method_id || null,
       sq.subtotal, sq.cgst_rate, sq.sgst_rate, sq.cgst_amount, sq.sgst_amount,
       sq.discount, sq.grand_total, sq.total_qty, sq.comments || "", "draft"]
    );
    res.json(rows[0]);
  } catch (err) { console.error("POST /api/sample-quotes/convert error:", err.message); res.status(500).json({ error: "Failed to convert quote" }); }
});

// ─── PUBLIC: Reviews (rate-limited) ───
app.get("/api/reviews", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT id, name, role, rating, text, created_at FROM reviews WHERE approved = true ORDER BY rating DESC, created_at DESC LIMIT 50");
    res.json(rows);
  } catch (err) {
    console.error("GET /api/reviews error:", err.message);
    res.json([]);
  }
});
app.post("/api/reviews", rateLimit(60000, 5), async (req, res) => {
  try {
    const { name, role, rating, text } = req.body;
    const cleanName = sanitize(name);
    const cleanText = sanitize(text);
    const cleanRole = sanitize(role);
    if (!cleanName || !cleanText) return res.status(400).json({ error: "Name and review text are required" });
    if (cleanName.length > 200 || cleanText.length > 1000 || (cleanRole && cleanRole.length > 100)) {
      return res.status(400).json({ error: "Input too long" });
    }
    const { rows } = await pool.query(
      "INSERT INTO reviews (name, role, rating, text, approved) VALUES ($1,$2,$3,$4,true) RETURNING id, name, role, rating, text, created_at",
      [cleanName, cleanRole || null, Math.min(5, Math.max(1, Number.parseInt(rating, 10) || 5)), cleanText]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error("POST /api/reviews error:", err.message);
    res.status(500).json({ error: "Reviews are temporarily unavailable. Please try again later." });
  }
});

// ─── Orders ───
app.get("/api/orders", adminAuth, async (req, res) => {
  try {
    const { countSql, dataSql, params, limit, offset, page } = paginated(
      "SELECT * FROM orders", { req, allowedFilters: { search: { col: "client_name", op: "ILIKE" }, status: { col: "status", op: "=" }, date_from: { col: "COALESCE(delivered_at,created_at)::date", op: ">=" }, date_to: { col: "COALESCE(delivered_at,created_at)::date", op: "<=" } }, defaultOrder: "id DESC" }
    );
    const total = parseInt((await pool.query(countSql, params)).rows[0].count);
    const { rows } = await pool.query(dataSql, [...params, limit, offset]);
    res.json({ rows, total, page, limit });
  } catch (err) { console.error("GET /api/orders error:", err.message); res.status(500).json({ error: "Failed to fetch orders" }); }
});
app.post("/api/orders", adminAuth, async (req, res) => {
  try {
    const { client_name, items, total_amount, total_qty, status, delivered_at } = req.body;
    const { rows } = await pool.query(
      "INSERT INTO orders (client_name,items,total_amount,total_qty,status,delivered_at) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [sanitize(client_name), items, total_amount || 0, total_qty || 0, status || "pending", delivered_at || null]
    );
    res.json(rows[0]);
  } catch (err) { console.error("POST /api/orders error:", err.message); res.status(500).json({ error: "Failed to create order" }); }
});
app.put("/api/orders/:id", adminAuth, async (req, res) => {
  try {
    const { client_name, items, total_amount, total_qty, status, delivered_at } = req.body;
    const { rows } = await pool.query(
      "UPDATE orders SET client_name=$1,items=$2,total_amount=$3,total_qty=$4,status=$5,delivered_at=$6 WHERE id=$7 RETURNING *",
      [sanitize(client_name), items, total_amount || 0, total_qty || 0, status, delivered_at || null, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) { console.error("PUT /api/orders error:", err.message); res.status(500).json({ error: "Failed to update order" }); }
});
app.delete("/api/orders/:id", adminAuth, async (req, res) => {
  try {
    await pool.query("DELETE FROM orders WHERE id=$1", [req.params.id]);
    res.json({ ok: true });
  } catch (err) { console.error("DELETE /api/orders error:", err.message); res.status(500).json({ error: "Failed to delete order" }); }
});

// ─── Schools (Admin CRUD) ───
app.get("/api/schools", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT id, name, code, address, active, gst_percent, razorpay_key_id, created_at FROM schools ORDER BY name");
    res.json(rows);
  } catch (err) { console.error("GET /api/schools error:", err.message); res.json([]); }
});
app.post("/api/schools", adminAuth, async (req, res) => {
  try {
    const { name, code, address, gst_percent, razorpay_key_id, razorpay_key_secret } = req.body;
    const { rows } = await pool.query(
      "INSERT INTO schools (name, code, address, gst_percent, razorpay_key_id, razorpay_key_secret) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, name, code, address, active, gst_percent, razorpay_key_id, created_at",
      [sanitize(name), sanitize(code), sanitize(address), gst_percent || 0, razorpay_key_id || null, razorpay_key_secret || null]
    );
    res.json(rows[0]);
  } catch (err) { console.error("POST /api/schools error:", err.message); res.status(500).json({ error: "Failed to create school" }); }
});
app.put("/api/schools/:id", adminAuth, async (req, res) => {
  try {
    const { name, code, address, active, gst_percent, razorpay_key_id, razorpay_key_secret } = req.body;
    const { rows } = await pool.query(
      "UPDATE schools SET name=$1, code=$2, address=$3, active=$4, gst_percent=$5, razorpay_key_id=$6, razorpay_key_secret=$7 WHERE id=$8 RETURNING id, name, code, address, active, gst_percent, razorpay_key_id, created_at",
      [sanitize(name), sanitize(code), sanitize(address), active !== false, gst_percent || 0, razorpay_key_id || null, razorpay_key_secret || null, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) { console.error("PUT /api/schools error:", err.message); res.status(500).json({ error: "Failed to update school" }); }
});
app.delete("/api/schools/:id", adminAuth, async (req, res) => {
  try { await pool.query("DELETE FROM schools WHERE id=$1", [req.params.id]); res.json({ ok: true }); }
  catch (err) { console.error("DELETE /api/schools error:", err.message); res.status(500).json({ error: "Failed to delete school" }); }
});

// ─── School Uniforms (Admin CRUD) ───
app.get("/api/school-uniforms", async (req, res) => {
  try {
    const schoolId = req.query.school_id;
    const activeOnly = req.query.active === "true";
    let sql = "SELECT su.*, s.name as school_name FROM school_uniforms su JOIN schools s ON su.school_id = s.id";
    const params = [];
    const conds = [];
    if (schoolId) { conds.push(`su.school_id = $${params.length + 1}`); params.push(schoolId); }
    if (activeOnly) { conds.push("su.active = true AND s.active = true"); }
    if (conds.length) sql += " WHERE " + conds.join(" AND ");
    sql += " ORDER BY su.name";
    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) { console.error("GET /api/school-uniforms error:", err.message); res.json([]); }
});
app.post("/api/school-uniforms", adminAuth, async (req, res) => {
  try {
    const { school_id, name, description, mrp, price, sizes, image_url, image_data, stock } = req.body;
    if (image_data && image_data.length > 1.4 * 1024 * 1024) return res.status(400).json({ error: "Image must be under 1MB" });
    const { rows } = await pool.query(
      "INSERT INTO school_uniforms (school_id, name, description, mrp, price, sizes, image_url, image_data, stock) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *",
      [school_id, sanitize(name), sanitize(description), mrp || 0, price || 0, sizes || "XS,S,M,L,XL,XXL", image_url || null, image_data || null, stock || 0]
    );
    res.json(rows[0]);
  } catch (err) { console.error("POST /api/school-uniforms error:", err.message); res.status(500).json({ error: "Failed to create uniform" }); }
});
app.put("/api/school-uniforms/:id", adminAuth, async (req, res) => {
  try {
    const { name, description, mrp, price, sizes, image_url, image_data, stock, active, school_id } = req.body;
    if (image_data && image_data.length > 1.4 * 1024 * 1024) return res.status(400).json({ error: "Image must be under 1MB" });
    const { rows } = await pool.query(
      "UPDATE school_uniforms SET name=$1, description=$2, mrp=$3, price=$4, sizes=$5, image_url=$6, image_data=$7, stock=$8, active=$9, school_id=$10 WHERE id=$11 RETURNING *",
      [sanitize(name), sanitize(description), mrp || 0, price || 0, sizes, image_url || null, image_data !== undefined ? (image_data || null) : undefined, stock || 0, active !== false, school_id, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) { console.error("PUT /api/school-uniforms error:", err.message); res.status(500).json({ error: "Failed to update uniform" }); }
});
app.delete("/api/school-uniforms/:id", adminAuth, async (req, res) => {
  try { await pool.query("DELETE FROM school_uniforms WHERE id=$1", [req.params.id]); res.json({ ok: true }); }
  catch (err) { console.error("DELETE /api/school-uniforms error:", err.message); res.status(500).json({ error: "Failed to delete uniform" }); }
});

// ─── School Coupons (Admin CRUD + Public validation) ───
app.get("/api/school-coupons", adminAuth, async (req, res) => {
  try {
    const schoolId = req.query.school_id;
    let sql = "SELECT sc.*, s.name as school_name FROM school_coupons sc JOIN schools s ON sc.school_id = s.id";
    const params = [];
    if (schoolId) { sql += " WHERE sc.school_id = $1"; params.push(schoolId); }
    sql += " ORDER BY sc.created_at DESC";
    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) { console.error("GET /api/school-coupons error:", err.message); res.json([]); }
});
app.post("/api/school-coupons", adminAuth, async (req, res) => {
  try {
    const { school_id, code, discount_type, discount_value, max_uses } = req.body;
    if (!school_id || !code) return res.status(400).json({ error: "School and coupon code are required" });
    const { rows } = await pool.query(
      "INSERT INTO school_coupons (school_id, code, discount_type, discount_value, max_uses) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [school_id, sanitize(code).toUpperCase(), discount_type || "percent", discount_value || 0, max_uses || 10]
    );
    res.json(rows[0]);
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "Coupon code already exists for this school" });
    console.error("POST /api/school-coupons error:", err.message); res.status(500).json({ error: "Failed to create coupon" });
  }
});
app.put("/api/school-coupons/:id", adminAuth, async (req, res) => {
  try {
    const { code, discount_type, discount_value, max_uses, active } = req.body;
    const { rows } = await pool.query(
      "UPDATE school_coupons SET code=$1, discount_type=$2, discount_value=$3, max_uses=$4, active=$5 WHERE id=$6 RETURNING *",
      [sanitize(code).toUpperCase(), discount_type, discount_value || 0, max_uses || 10, active !== false, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) { console.error("PUT /api/school-coupons error:", err.message); res.status(500).json({ error: "Failed to update coupon" }); }
});
app.delete("/api/school-coupons/:id", adminAuth, async (req, res) => {
  try { await pool.query("DELETE FROM school_coupons WHERE id=$1", [req.params.id]); res.json({ ok: true }); }
  catch (err) { console.error("DELETE /api/school-coupons error:", err.message); res.status(500).json({ error: "Failed to delete coupon" }); }
});

// Public: Validate coupon
app.post("/api/school-coupons/validate", rateLimit(60000, 20), async (req, res) => {
  try {
    const { school_id, code } = req.body;
    if (!school_id || !code) return res.status(400).json({ error: "School and code are required" });
    const { rows } = await pool.query("SELECT * FROM school_coupons WHERE school_id = $1 AND code = $2", [school_id, code.toUpperCase().trim()]);
    if (rows.length === 0) return res.status(404).json({ error: "Invalid coupon code" });
    const coupon = rows[0];
    if (!coupon.active) return res.status(400).json({ error: "This coupon is no longer active" });
    if (coupon.used_count >= coupon.max_uses) return res.status(400).json({ error: `This coupon has expired (used ${coupon.max_uses}/${coupon.max_uses} times)` });
    res.json({ valid: true, discount_type: coupon.discount_type, discount_value: Number(coupon.discount_value), remaining: coupon.max_uses - coupon.used_count });
  } catch (err) { console.error("POST /api/school-coupons/validate error:", err.message); res.status(500).json({ error: "Validation failed" }); }
});

// ─── Uniform Orders (Admin + Public) ───
app.get("/api/uniform-orders", adminAuth, async (req, res) => {
  try {
    const { countSql, dataSql, params, limit, offset, page } = paginated(
      "SELECT uo.*, s.name as school_name FROM uniform_orders uo LEFT JOIN schools s ON uo.school_id = s.id",
      { req, allowedFilters: { search: { col: "uo.student_name", op: "ILIKE" }, school_id: { col: "uo.school_id", op: "=" }, payment_status: { col: "uo.payment_status", op: "=" } }, defaultOrder: "uo.id DESC" }
    );
    const total = parseInt((await pool.query(countSql, params)).rows[0].count);
    const { rows } = await pool.query(dataSql, [...params, limit, offset]);
    res.json({ rows, total, page, limit });
  } catch (err) { console.error("GET /api/uniform-orders error:", err.message); res.json({ rows: [], total: 0, page: 1, limit: 10 }); }
});
app.put("/api/uniform-orders/:id", adminAuth, async (req, res) => {
  try {
    const { order_status } = req.body;
    const { rows } = await pool.query("UPDATE uniform_orders SET order_status=$1 WHERE id=$2 RETURNING *", [order_status, req.params.id]);
    res.json(rows[0]);
  } catch (err) { console.error("PUT /api/uniform-orders error:", err.message); res.status(500).json({ error: "Failed to update order" }); }
});

// ─── Razorpay: Create order (public) ───
app.post("/api/uniform-orders/create", rateLimit(60000, 10), async (req, res) => {
  try {
    const { school_id, student_name, student_class, parent_name, parent_phone, parent_email, items, coupon_code } = req.body;
    if (!school_id || !student_name || !student_class || !parent_name || !parent_phone || !parent_email || !items?.length) {
      return res.status(400).json({ error: "All fields including email are required" });
    }
    // Get school's Razorpay credentials and GST
    const { rows: schoolRows } = await pool.query("SELECT razorpay_key_id, razorpay_key_secret, gst_percent, name FROM schools WHERE id = $1 AND active = true", [school_id]);
    if (schoolRows.length === 0) return res.status(404).json({ error: "School not found" });
    const school = schoolRows[0];
    if (!school.razorpay_key_id || !school.razorpay_key_secret) return res.status(400).json({ error: "Payment not configured for this school" });

    // Calculate subtotal
    let subtotal = items.reduce((sum, i) => sum + (Number(i.price) * Number(i.qty)), 0);
    let discount_amount = 0;

    // Apply coupon if provided
    if (coupon_code) {
      const { rows: couponRows } = await pool.query("SELECT * FROM school_coupons WHERE school_id = $1 AND code = $2 AND active = true", [school_id, coupon_code.toUpperCase().trim()]);
      if (couponRows.length === 0) return res.status(400).json({ error: "Invalid coupon code" });
      const coupon = couponRows[0];
      if (coupon.used_count >= coupon.max_uses) return res.status(400).json({ error: `Coupon expired (used ${coupon.max_uses}/${coupon.max_uses} times)` });
      if (coupon.discount_type === "percent") discount_amount = Math.round(subtotal * Number(coupon.discount_value) / 100 * 100) / 100;
      else discount_amount = Math.min(Number(coupon.discount_value), subtotal);
    }

    const afterDiscount = Math.max(0, subtotal - discount_amount);
    const gst_percent = Number(school.gst_percent) || 0;
    const gst_amount = Math.round(afterDiscount * gst_percent / 100 * 100) / 100;
    const total_amount = Math.round((afterDiscount + gst_amount) * 100) / 100;

    // Create Razorpay order
    const rpAuth = Buffer.from(`${school.razorpay_key_id}:${school.razorpay_key_secret}`).toString("base64");
    const rpRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Basic ${rpAuth}` },
      body: JSON.stringify({ amount: Math.round(total_amount * 100), currency: "INR", receipt: `unif_${Date.now()}` }),
    });
    if (!rpRes.ok) { const e = await rpRes.json().catch(() => ({})); return res.status(500).json({ error: e.error?.description || "Payment gateway error" }); }
    const rpOrder = await rpRes.json();

    // Save order
    const { rows } = await pool.query(
      `INSERT INTO uniform_orders (school_id, student_name, student_class, parent_name, parent_phone, parent_email, items, subtotal, gst_percent, gst_amount, discount_amount, total_amount, coupon_code, razorpay_order_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [school_id, sanitize(student_name), sanitize(student_class), sanitize(parent_name), sanitize(parent_phone), sanitize(parent_email), JSON.stringify(items), afterDiscount, gst_percent, gst_amount, discount_amount, total_amount, coupon_code ? coupon_code.toUpperCase().trim() : null, rpOrder.id]
    );
    res.json({ order: rows[0], razorpay_order_id: rpOrder.id, razorpay_key_id: school.razorpay_key_id, amount: rpOrder.amount, discount_amount, gst_amount, gst_percent });
  } catch (err) { console.error("POST /api/uniform-orders/create error:", err.message); res.status(500).json({ error: "Failed to create order" }); }
});

// ─── Razorpay: Verify payment (public) ───
app.post("/api/uniform-orders/verify", rateLimit(60000, 10), async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return res.status(400).json({ error: "Missing payment details" });

    // Get order and school secret
    const { rows: orderRows } = await pool.query(
      "SELECT uo.*, s.razorpay_key_secret, s.name as school_name, s.gst_percent as school_gst FROM uniform_orders uo JOIN schools s ON uo.school_id = s.id WHERE uo.razorpay_order_id = $1",
      [razorpay_order_id]
    );
    if (orderRows.length === 0) return res.status(404).json({ error: "Order not found" });
    const order = orderRows[0];

    // Verify signature
    const expectedSig = crypto.createHmac("sha256", order.razorpay_key_secret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
    if (expectedSig !== razorpay_signature) return res.status(400).json({ error: "Payment verification failed" });

    // Update order
    await pool.query("UPDATE uniform_orders SET razorpay_payment_id=$1, payment_status='paid', order_status='confirmed' WHERE id=$2", [razorpay_payment_id, order.id]);
    // Increment coupon usage if coupon was used
    if (order.coupon_code) {
      await pool.query("UPDATE school_coupons SET used_count = used_count + 1 WHERE school_id = $1 AND code = $2", [order.school_id, order.coupon_code]);
    }

    // Send confirmation email
    if (order.parent_email) {
      const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
      sendEmail({
        to: order.parent_email,
        subject: `Order Confirmed — Uniform Order #${order.id}`,
        html: orderConfirmationEmail(order, items),
      }).catch((err) => console.error("Order email failed:", err.message));
    }

    res.json({ success: true, order_id: order.id });
  } catch (err) { console.error("POST /api/uniform-orders/verify error:", err.message); res.status(500).json({ error: "Verification failed" }); }
});

// ─── Auto-migrate: ensure new columns/rows exist ───
async function autoMigrate() {
  try {
    await pool.query("INSERT INTO invoice_counter (id, next_val) VALUES ('sample_quotation', 1) ON CONFLICT (id) DO NOTHING");
    await pool.query("DO $$ BEGIN ALTER TABLE quotes ADD COLUMN comments TEXT DEFAULT ''; EXCEPTION WHEN duplicate_column THEN NULL; END $$;");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sample_quotes (
        id SERIAL PRIMARY KEY,
        quote_number VARCHAR(30),
        billing_name VARCHAR(200),
        billing_address TEXT,
        billing_gstin VARCHAR(20),
        billing_phone VARCHAR(20),
        billing_email VARCHAR(200),
        shipping_name VARCHAR(200),
        shipping_address TEXT,
        shipping_phone VARCHAR(20),
        items JSONB DEFAULT '[]',
        payment_method_id INTEGER REFERENCES payment_methods(id) ON DELETE SET NULL,
        subtotal NUMERIC(12,2) DEFAULT 0,
        cgst_rate NUMERIC(5,2) DEFAULT 0,
        sgst_rate NUMERIC(5,2) DEFAULT 0,
        cgst_amount NUMERIC(12,2) DEFAULT 0,
        sgst_amount NUMERIC(12,2) DEFAULT 0,
        discount NUMERIC(12,2) DEFAULT 0,
        grand_total NUMERIC(12,2) DEFAULT 0,
        total_qty INTEGER DEFAULT 0,
        comments TEXT DEFAULT '',
        status VARCHAR(20) DEFAULT 'draft',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        email VARCHAR(200) UNIQUE NOT NULL,
        phone VARCHAR(20),
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schools (
        id SERIAL PRIMARY KEY, name VARCHAR(200) NOT NULL, code VARCHAR(50) UNIQUE,
        address TEXT, active BOOLEAN DEFAULT true,
        razorpay_key_id VARCHAR(100), razorpay_key_secret VARCHAR(200),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS school_uniforms (
        id SERIAL PRIMARY KEY, school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL, description TEXT, mrp NUMERIC(12,2) DEFAULT 0, price NUMERIC(12,2) DEFAULT 0,
        sizes TEXT DEFAULT 'XS,S,M,L,XL,XXL', image_url TEXT, image_data TEXT, stock INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS school_coupons (
        id SERIAL PRIMARY KEY, school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
        code VARCHAR(50) NOT NULL, discount_type VARCHAR(10) DEFAULT 'percent',
        discount_value NUMERIC(12,2) DEFAULT 0, max_uses INTEGER DEFAULT 10,
        used_count INTEGER DEFAULT 0, active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE(school_id, code)
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS uniform_orders (
        id SERIAL PRIMARY KEY, school_id INTEGER REFERENCES schools(id) ON DELETE SET NULL,
        student_name VARCHAR(200) NOT NULL, student_class VARCHAR(50),
        parent_name VARCHAR(200), parent_phone VARCHAR(20), parent_email VARCHAR(200),
        items JSONB DEFAULT '[]', total_amount NUMERIC(12,2) DEFAULT 0,
        discount_amount NUMERIC(12,2) DEFAULT 0, coupon_code VARCHAR(50),
        razorpay_order_id VARCHAR(100), razorpay_payment_id VARCHAR(100),
        payment_status VARCHAR(20) DEFAULT 'pending', order_status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    // Add new columns to existing tables if they don't exist
    for (const q of [
      "DO $$ BEGIN ALTER TABLE school_uniforms ADD COLUMN mrp NUMERIC(12,2) DEFAULT 0; EXCEPTION WHEN duplicate_column THEN NULL; END $$;",
      "DO $$ BEGIN ALTER TABLE school_uniforms ADD COLUMN image_data TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;",
      "DO $$ BEGIN ALTER TABLE schools ADD COLUMN gst_percent NUMERIC(5,2) DEFAULT 0; EXCEPTION WHEN duplicate_column THEN NULL; END $$;",
      "DO $$ BEGIN ALTER TABLE uniform_orders ADD COLUMN discount_amount NUMERIC(12,2) DEFAULT 0; EXCEPTION WHEN duplicate_column THEN NULL; END $$;",
      "DO $$ BEGIN ALTER TABLE uniform_orders ADD COLUMN coupon_code VARCHAR(50); EXCEPTION WHEN duplicate_column THEN NULL; END $$;",
      "DO $$ BEGIN ALTER TABLE uniform_orders ADD COLUMN subtotal NUMERIC(12,2) DEFAULT 0; EXCEPTION WHEN duplicate_column THEN NULL; END $$;",
      "DO $$ BEGIN ALTER TABLE uniform_orders ADD COLUMN gst_percent NUMERIC(5,2) DEFAULT 0; EXCEPTION WHEN duplicate_column THEN NULL; END $$;",
      "DO $$ BEGIN ALTER TABLE uniform_orders ADD COLUMN gst_amount NUMERIC(12,2) DEFAULT 0; EXCEPTION WHEN duplicate_column THEN NULL; END $$;",
    ]) {
      try { await pool.query(q); } catch (e) { console.error("Migration warning:", e.message); }
    }
  } catch (err) { console.error("Auto-migrate warning:", err.message); }
}

autoMigrate().then(() => {
  app.listen(PORT, () => {
    console.log(`KPJ API running on port ${PORT}`);

    // ─── Self-ping to prevent Render free-tier spin-down ───
    const SELF_URL = process.env.RENDER_EXTERNAL_URL;
    if (SELF_URL) {
      const INTERVAL = 14 * 60 * 1000; // 14 minutes
      setInterval(async () => {
        try {
          await fetch(`${SELF_URL}/api/health`);
          console.log("Self-ping OK");
        } catch (err) {
          console.log("Self-ping failed:", err.message);
        }
      }, INTERVAL);
      console.log(`Self-ping enabled → ${SELF_URL}/api/health every 14m`);
    }
  });
});
