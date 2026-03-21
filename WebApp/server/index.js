import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db/pool.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

function adminAuth(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: "Unauthorized" });
  next();
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
      tshirtsDelivered: parseInt(delivered.qty) || m.tshirts_delivered,
      happyClients: parseInt(delivered.clients) || m.happy_clients,
      expressDelivery: m.express_delivery,
      satisfactionRate: m.satisfaction_rate,
      totalLeads: parseInt(leads),
      totalOrders: parseInt(orders),
      totalProducts: parseInt(products),
      totalQuotes: parseInt(quotes),
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── AUTH ───
app.post("/api/auth/login", (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) res.json({ token: process.env.ADMIN_PASSWORD, role: "admin" });
  else res.status(401).json({ error: "Invalid password" });
});

// ─── Categories (with subcategory support) ───
app.get("/api/categories", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM categories ORDER BY parent_id NULLS FIRST, id");
  res.json(rows);
});
app.post("/api/categories", adminAuth, async (req, res) => {
  const { name, description, parent_id } = req.body;
  const { rows } = await pool.query("INSERT INTO categories (name, description, parent_id) VALUES ($1,$2,$3) RETURNING *", [name, description, parent_id || null]);
  res.json(rows[0]);
});
app.put("/api/categories/:id", adminAuth, async (req, res) => {
  const { name, description, parent_id } = req.body;
  const { rows } = await pool.query("UPDATE categories SET name=$1, description=$2, parent_id=$3 WHERE id=$4 RETURNING *", [name, description, parent_id || null, req.params.id]);
  res.json(rows[0]);
});
app.delete("/api/categories/:id", adminAuth, async (req, res) => {
  await pool.query("UPDATE categories SET parent_id=NULL WHERE parent_id=$1", [req.params.id]);
  await pool.query("DELETE FROM categories WHERE id=$1", [req.params.id]);
  res.json({ ok: true });
});

// ─── Payment Methods ───
app.get("/api/payment-methods", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM payment_methods ORDER BY is_default DESC, id");
  res.json(rows);
});
app.post("/api/payment-methods", adminAuth, async (req, res) => {
  const { type, label, bank_name, bank_account, bank_ifsc, bank_branch, upi_id, is_default } = req.body;
  if (is_default) await pool.query("UPDATE payment_methods SET is_default=false");
  const { rows } = await pool.query(
    "INSERT INTO payment_methods (type,label,bank_name,bank_account,bank_ifsc,bank_branch,upi_id,is_default) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
    [type || "bank", label, bank_name, bank_account, bank_ifsc, bank_branch, upi_id, is_default || false]
  );
  res.json(rows[0]);
});
app.put("/api/payment-methods/:id", adminAuth, async (req, res) => {
  const { type, label, bank_name, bank_account, bank_ifsc, bank_branch, upi_id, is_default } = req.body;
  if (is_default) await pool.query("UPDATE payment_methods SET is_default=false");
  const { rows } = await pool.query(
    "UPDATE payment_methods SET type=$1,label=$2,bank_name=$3,bank_account=$4,bank_ifsc=$5,bank_branch=$6,upi_id=$7,is_default=$8 WHERE id=$9 RETURNING *",
    [type, label, bank_name, bank_account, bank_ifsc, bank_branch, upi_id, is_default || false, req.params.id]
  );
  res.json(rows[0]);
});
app.delete("/api/payment-methods/:id", adminAuth, async (req, res) => {
  await pool.query("DELETE FROM payment_methods WHERE id=$1", [req.params.id]);
  res.json({ ok: true });
});

// ─── Products / Inventory ───
app.get("/api/products", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM product_types ORDER BY id DESC");
  res.json(rows);
});
app.post("/api/products", adminAuth, async (req, res) => {
  const { name, category, hsn_code, unit, price, stock } = req.body;
  const { rows } = await pool.query(
    "INSERT INTO product_types (name,category,hsn_code,unit,price,stock) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
    [name, category, hsn_code, unit, price || 0, stock || 0]
  );
  res.json(rows[0]);
});
app.put("/api/products/:id", adminAuth, async (req, res) => {
  const { name, category, hsn_code, unit, price, stock } = req.body;
  const { rows } = await pool.query(
    "UPDATE product_types SET name=$1,category=$2,hsn_code=$3,unit=$4,price=$5,stock=$6 WHERE id=$7 RETURNING *",
    [name, category, hsn_code, unit, price || 0, stock || 0, req.params.id]
  );
  res.json(rows[0]);
});
app.delete("/api/products/:id", adminAuth, async (req, res) => {
  await pool.query("DELETE FROM product_types WHERE id=$1", [req.params.id]);
  res.json({ ok: true });
});

// ─── Leads ───
app.get("/api/leads", adminAuth, async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM leads ORDER BY id DESC");
  res.json(rows);
});
app.post("/api/leads", adminAuth, async (req, res) => {
  const { name, phone, email, product, quantity, status, source } = req.body;
  const { rows } = await pool.query(
    "INSERT INTO leads (name,phone,email,product,quantity,status,source) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",
    [name, phone, email, product, quantity, status || "new", source || "website"]
  );
  res.json(rows[0]);
});
app.put("/api/leads/:id", adminAuth, async (req, res) => {
  const { name, phone, email, product, quantity, status, source } = req.body;
  const { rows } = await pool.query(
    "UPDATE leads SET name=$1,phone=$2,email=$3,product=$4,quantity=$5,status=$6,source=$7,updated_at=NOW() WHERE id=$8 RETURNING *",
    [name, phone, email, product, quantity, status, source, req.params.id]
  );
  res.json(rows[0]);
});
app.delete("/api/leads/:id", adminAuth, async (req, res) => {
  await pool.query("DELETE FROM leads WHERE id=$1", [req.params.id]);
  res.json({ ok: true });
});

// ─── Quotes / Invoices ───
app.get("/api/quotes", adminAuth, async (req, res) => {
  const { rows } = await pool.query(`
    SELECT q.*, pm.label as payment_label, pm.type as payment_type,
           pm.bank_name as pm_bank_name, pm.bank_account as pm_bank_account,
           pm.bank_ifsc as pm_bank_ifsc, pm.bank_branch as pm_bank_branch, pm.upi_id as pm_upi_id
    FROM quotes q LEFT JOIN payment_methods pm ON q.payment_method_id = pm.id
    ORDER BY q.id DESC
  `);
  res.json(rows);
});

app.get("/api/quotes/next-number", adminAuth, async (req, res) => {
  const type = req.query.type || "tax_invoice";
  if (type === "tax_invoice") {
    const { rows } = await pool.query("SELECT next_val FROM invoice_counter WHERE id='tax_invoice'");
    const num = rows[0]?.next_val || 1;
    res.json({ quoteNumber: `KPJ-INV-${String(num).padStart(4, "0")}`, nextVal: num });
  } else {
    // Sample quotation — peek at counter but don't lock
    const { rows } = await pool.query("SELECT next_val FROM invoice_counter WHERE id='tax_invoice'");
    const num = rows[0]?.next_val || 1;
    res.json({ quoteNumber: `KPJ-SQ-${String(num).padStart(4, "0")}`, nextVal: num });
  }
});

app.post("/api/quotes", adminAuth, async (req, res) => {
  const q = req.body;
  const isTax = q.quote_type === "tax_invoice";

  let quoteNumber = q.quote_number;
  // For tax invoices, atomically claim the next number
  if (isTax) {
    const ctr = await pool.query("UPDATE invoice_counter SET next_val = next_val + 1 WHERE id='tax_invoice' RETURNING next_val");
    const num = (ctr.rows[0].next_val - 1); // we just incremented, so use prev
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
});

// Convert sample quotation to tax invoice
app.post("/api/quotes/:id/convert", adminAuth, async (req, res) => {
  const q = req.body;
  // Atomically claim next tax invoice number
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
});

// Update quote/invoice
app.put("/api/quotes/:id", adminAuth, async (req, res) => {
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
});

app.delete("/api/quotes/:id", adminAuth, async (req, res) => {
  await pool.query("DELETE FROM quotes WHERE id=$1", [req.params.id]);
  res.json({ ok: true });
});

// ─── Orders ───
app.get("/api/orders", adminAuth, async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM orders ORDER BY id DESC");
  res.json(rows);
});
app.post("/api/orders", adminAuth, async (req, res) => {
  const { client_name, items, total_amount, total_qty, status } = req.body;
  const { rows } = await pool.query(
    "INSERT INTO orders (client_name,items,total_amount,total_qty,status) VALUES ($1,$2,$3,$4,$5) RETURNING *",
    [client_name, items, total_amount || 0, total_qty || 0, status || "pending"]
  );
  res.json(rows[0]);
});
app.put("/api/orders/:id", adminAuth, async (req, res) => {
  const { client_name, items, total_amount, total_qty, status } = req.body;
  let deliveredAt = null;
  if (status === "delivered") {
    const existing = (await pool.query("SELECT delivered_at FROM orders WHERE id=$1", [req.params.id])).rows[0];
    deliveredAt = existing?.delivered_at || new Date().toISOString();
  }
  const { rows } = await pool.query(
    "UPDATE orders SET client_name=$1,items=$2,total_amount=$3,total_qty=$4,status=$5,delivered_at=$6 WHERE id=$7 RETURNING *",
    [client_name, items, total_amount || 0, total_qty || 0, status, deliveredAt, req.params.id]
  );
  res.json(rows[0]);
});
app.delete("/api/orders/:id", adminAuth, async (req, res) => {
  await pool.query("DELETE FROM orders WHERE id=$1", [req.params.id]);
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`KPJ API running on port ${PORT}`));
