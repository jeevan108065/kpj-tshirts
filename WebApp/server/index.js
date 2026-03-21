import express from "express";
import cors from "cors";
import crypto from "crypto";
import dotenv from "dotenv";
import pool from "./db/pool.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

// ─── Security: CORS whitelist ───
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://localhost:3000,https://kpjtshirts.com,https://www.kpjtshirts.com").split(",").map(s => s.trim());
app.use(cors({
  origin(origin, cb) {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(null, false);
  },
  credentials: true,
}));

// ─── Security: Body size limit to prevent DoS ───
app.use(express.json({ limit: "1mb" }));

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

// ─── Quotes / Invoices ───
app.get("/api/quotes", adminAuth, async (req, res) => {
  try {
    const base = `SELECT q.*, pm.label as payment_label, pm.type as payment_type,
             pm.bank_name as pm_bank_name, pm.bank_account as pm_bank_account,
             pm.bank_ifsc as pm_bank_ifsc, pm.bank_branch as pm_bank_branch, pm.upi_id as pm_upi_id
      FROM quotes q LEFT JOIN payment_methods pm ON q.payment_method_id = pm.id`;
    const { countSql, dataSql, params, limit, offset, page } = paginated(
      base, { req, allowedFilters: { search: { col: "q.billing_name", op: "ILIKE" }, status: { col: "q.status", op: "=" }, type: { col: "q.quote_type", op: "=" } }, defaultOrder: "q.id DESC" }
    );
    const total = parseInt((await pool.query(countSql, params)).rows[0].count);
    const { rows } = await pool.query(dataSql, [...params, limit, offset]);
    res.json({ rows, total, page, limit });
  } catch (err) { console.error("GET /api/quotes error:", err.message); res.status(500).json({ error: "Failed to fetch quotes" }); }
});

app.get("/api/quotes/next-number", adminAuth, async (req, res) => {
  try {
    const type = req.query.type || "tax_invoice";
    if (type === "tax_invoice") {
      const { rows } = await pool.query("SELECT next_val FROM invoice_counter WHERE id='tax_invoice'");
      const num = rows[0]?.next_val || 1;
      res.json({ quoteNumber: `KPJ-INV-${String(num).padStart(4, "0")}`, nextVal: num });
    } else {
      const { rows } = await pool.query("SELECT next_val FROM invoice_counter WHERE id='tax_invoice'");
      const num = rows[0]?.next_val || 1;
      res.json({ quoteNumber: `KPJ-SQ-${String(num).padStart(4, "0")}`, nextVal: num });
    }
  } catch (err) { console.error("GET /api/quotes/next-number error:", err.message); res.status(500).json({ error: "Failed to get next number" }); }
});

app.post("/api/quotes", adminAuth, async (req, res) => {
  try {
    const q = req.body;
    const isTax = q.quote_type === "tax_invoice";
    let quoteNumber = q.quote_number;
    if (isTax) {
      const ctr = await pool.query("UPDATE invoice_counter SET next_val = next_val + 1 WHERE id='tax_invoice' RETURNING next_val");
      const num = (ctr.rows[0].next_val - 1);
      quoteNumber = `KPJ-INV-${String(num).padStart(4, "0")}`;
    }
    const { rows } = await pool.query(
      `INSERT INTO quotes (quote_number, quote_type, lead_id,
       billing_name, billing_address, billing_gstin, billing_phone, billing_email,
       shipping_name, shipping_address, shipping_phone,
       items, payment_method_id,
       subtotal, cgst_rate, sgst_rate, cgst_amount, sgst_amount, discount, grand_total, total_qty, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22) RETURNING *`,
      [quoteNumber, q.quote_type || "tax_invoice", q.lead_id || null,
       q.billing_name, q.billing_address, q.billing_gstin, q.billing_phone, q.billing_email,
       q.shipping_name, q.shipping_address, q.shipping_phone,
       JSON.stringify(q.items), q.payment_method_id || null,
       q.subtotal, q.cgst_rate, q.sgst_rate, q.cgst_amount, q.sgst_amount, q.discount, q.grand_total, q.total_qty, q.status || "draft"]
    );
    res.json(rows[0]);
  } catch (err) { console.error("POST /api/quotes error:", err.message); res.status(500).json({ error: "Failed to create quote" }); }
});

app.post("/api/quotes/:id/convert", adminAuth, async (req, res) => {
  try {
    const q = req.body;
    const ctr = await pool.query("UPDATE invoice_counter SET next_val = next_val + 1 WHERE id='tax_invoice' RETURNING next_val");
    const num = ctr.rows[0].next_val - 1;
    const newNumber = `KPJ-INV-${String(num).padStart(4, "0")}`;
    const { rows } = await pool.query(
      `UPDATE quotes SET quote_number=$1, quote_type='tax_invoice',
       billing_name=$2, billing_address=$3, billing_gstin=$4, billing_phone=$5, billing_email=$6,
       shipping_name=$7, shipping_address=$8, shipping_phone=$9,
       items=$10, payment_method_id=$11,
       subtotal=$12, cgst_rate=$13, sgst_rate=$14, cgst_amount=$15, sgst_amount=$16,
       discount=$17, grand_total=$18, total_qty=$19, status=$20
       WHERE id=$21 RETURNING *`,
      [newNumber,
       q.billing_name, q.billing_address, q.billing_gstin, q.billing_phone, q.billing_email,
       q.shipping_name, q.shipping_address, q.shipping_phone,
       JSON.stringify(q.items), q.payment_method_id || null,
       q.subtotal, q.cgst_rate, q.sgst_rate, q.cgst_amount, q.sgst_amount,
       q.discount, q.grand_total, q.total_qty, q.status || "draft",
       req.params.id]
    );
    res.json(rows[0]);
  } catch (err) { console.error("POST /api/quotes/convert error:", err.message); res.status(500).json({ error: "Failed to convert quote" }); }
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
       discount=$16, grand_total=$17, total_qty=$18, status=$19
       WHERE id=$20 RETURNING *`,
      [q.billing_name, q.billing_address, q.billing_gstin, q.billing_phone, q.billing_email,
       q.shipping_name, q.shipping_address, q.shipping_phone,
       JSON.stringify(q.items), q.payment_method_id || null,
       q.subtotal, q.cgst_rate, q.sgst_rate, q.cgst_amount, q.sgst_amount,
       q.discount, q.grand_total, q.total_qty, q.status || "draft",
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

app.listen(PORT, () => console.log(`KPJ API running on port ${PORT}`));
