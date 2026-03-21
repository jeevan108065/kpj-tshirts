import pool from "./pool.js";

const SQL = `
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(100),
  hsn_code VARCHAR(20),
  unit VARCHAR(20) DEFAULT 'Pcs',
  price NUMERIC(12,2) DEFAULT 0,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200),
  phone VARCHAR(20),
  email VARCHAR(200),
  product VARCHAR(200),
  quantity VARCHAR(50),
  status VARCHAR(20) DEFAULT 'new',
  source VARCHAR(50) DEFAULT 'website',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_methods (
  id SERIAL PRIMARY KEY,
  type VARCHAR(10) NOT NULL DEFAULT 'bank',
  label VARCHAR(100),
  bank_name VARCHAR(100),
  bank_account VARCHAR(50),
  bank_ifsc VARCHAR(20),
  bank_branch VARCHAR(100),
  upi_id VARCHAR(100),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_counter (
  id VARCHAR(20) PRIMARY KEY,
  next_val INTEGER NOT NULL DEFAULT 1
);
INSERT INTO invoice_counter (id, next_val) VALUES ('tax_invoice', 1) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS quotes (
  id SERIAL PRIMARY KEY,
  quote_number VARCHAR(30) UNIQUE,
  quote_type VARCHAR(20) DEFAULT 'tax_invoice',
  lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
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
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  quote_id INTEGER REFERENCES quotes(id) ON DELETE SET NULL,
  client_name VARCHAR(200),
  items TEXT,
  total_amount NUMERIC(12,2) DEFAULT 0,
  total_qty INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS metrics (
  id INTEGER PRIMARY KEY DEFAULT 1,
  tshirts_delivered INTEGER DEFAULT 0,
  happy_clients INTEGER DEFAULT 0,
  express_delivery VARCHAR(10) DEFAULT '48hr',
  satisfaction_rate VARCHAR(10) DEFAULT '100%',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default categories if empty
INSERT INTO categories (name, description)
SELECT * FROM (VALUES
  ('T-Shirts', 'Cotton, poly-cotton, premium tees'),
  ('Promotional T-Shirts', 'Event, campaign, branded tees'),
  ('Sublimation T-Shirts', 'All-over print, DTF, sublimation'),
  ('Uniforms', 'Corporate, school, industrial uniforms'),
  ('Tracks & Tracksuits', 'Track pants, joggers, tracksuits')
) AS v(name, description)
WHERE NOT EXISTS (SELECT 1 FROM categories LIMIT 1);

-- Seed metrics row
INSERT INTO metrics (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
`;

// Migration: add new columns to existing tables if they don't exist
const MIGRATE = `
-- categories: add parent_id
DO $$ BEGIN
  ALTER TABLE categories ADD COLUMN parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id SERIAL PRIMARY KEY,
  type VARCHAR(10) NOT NULL DEFAULT 'bank',
  label VARCHAR(100),
  bank_name VARCHAR(100),
  bank_account VARCHAR(50),
  bank_ifsc VARCHAR(20),
  bank_branch VARCHAR(100),
  upi_id VARCHAR(100),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- invoice_counter table
CREATE TABLE IF NOT EXISTS invoice_counter (
  id VARCHAR(20) PRIMARY KEY,
  next_val INTEGER NOT NULL DEFAULT 1
);
INSERT INTO invoice_counter (id, next_val) VALUES ('tax_invoice', 1) ON CONFLICT (id) DO NOTHING;

-- quotes: add new columns
DO $$ BEGIN ALTER TABLE quotes ADD COLUMN quote_type VARCHAR(20) DEFAULT 'tax_invoice'; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE quotes ADD COLUMN billing_name VARCHAR(200); EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE quotes ADD COLUMN billing_address TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE quotes ADD COLUMN billing_gstin VARCHAR(20); EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE quotes ADD COLUMN billing_phone VARCHAR(20); EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE quotes ADD COLUMN billing_email VARCHAR(200); EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE quotes ADD COLUMN shipping_name VARCHAR(200); EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE quotes ADD COLUMN shipping_address TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE quotes ADD COLUMN shipping_phone VARCHAR(20); EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE quotes ADD COLUMN payment_method_id INTEGER REFERENCES payment_methods(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- Migrate old data: copy client_name -> billing_name etc if billing_name is null
UPDATE quotes SET billing_name = client_name WHERE billing_name IS NULL AND client_name IS NOT NULL;
UPDATE quotes SET billing_address = client_address WHERE billing_address IS NULL AND client_address IS NOT NULL;
UPDATE quotes SET billing_gstin = client_gstin WHERE billing_gstin IS NULL AND client_gstin IS NOT NULL;
UPDATE quotes SET billing_phone = client_phone WHERE billing_phone IS NULL AND client_phone IS NOT NULL;

-- Sync invoice counter to existing tax invoices
UPDATE invoice_counter SET next_val = GREATEST(next_val, COALESCE((SELECT COUNT(*)+1 FROM quotes WHERE quote_type='tax_invoice'), 1)) WHERE id='tax_invoice';
`;

async function init() {
  try {
    await pool.query(SQL);
    console.log("Base tables created.");
    await pool.query(MIGRATE);
    console.log("Migrations applied successfully.");
  } catch (err) {
    console.error("DB init error:", err.message);
  } finally {
    await pool.end();
  }
}

init();
