// This file contains only Swagger JSDoc annotations.
// Route handlers remain in index.js — swagger-jsdoc reads the comments here.

// ──────────────────────────────────────────────
// AUTH
// ──────────────────────────────────────────────

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Admin login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns bearer token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 role:
 *                   type: string
 *       401:
 *         description: Invalid password
 */

// ──────────────────────────────────────────────
// METRICS
// ──────────────────────────────────────────────

/**
 * @swagger
 * /api/metrics:
 *   get:
 *     tags: [Metrics]
 *     summary: Get public dashboard metrics
 *     responses:
 *       200:
 *         description: Metrics object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tshirtsDelivered:
 *                   type: integer
 *                 happyClients:
 *                   type: integer
 *                 expressDelivery:
 *                   type: string
 *                 satisfactionRate:
 *                   type: string
 *                 totalLeads:
 *                   type: integer
 *                 totalOrders:
 *                   type: integer
 *                 totalProducts:
 *                   type: integer
 *                 totalQuotes:
 *                   type: integer
 */

// ──────────────────────────────────────────────
// CATEGORIES
// ──────────────────────────────────────────────

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: List categories (paginated)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated category list
 *   post:
 *     tags: [Categories]
 *     summary: Create a category
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               parent_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Created category
 *
 * /api/categories/{id}:
 *   put:
 *     tags: [Categories]
 *     summary: Update a category
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               parent_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Updated category
 *   delete:
 *     tags: [Categories]
 *     summary: Delete a category
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deletion confirmed
 */

// ──────────────────────────────────────────────
// PAYMENT METHODS
// ──────────────────────────────────────────────

/**
 * @swagger
 * /api/payment-methods:
 *   get:
 *     tags: [Payment Methods]
 *     summary: List payment methods (paginated)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated payment methods
 *   post:
 *     tags: [Payment Methods]
 *     summary: Create a payment method
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [bank, upi]
 *               label:
 *                 type: string
 *               bank_name:
 *                 type: string
 *               bank_account:
 *                 type: string
 *               bank_ifsc:
 *                 type: string
 *               bank_branch:
 *                 type: string
 *               upi_id:
 *                 type: string
 *               is_default:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Created payment method
 *
 * /api/payment-methods/{id}:
 *   put:
 *     tags: [Payment Methods]
 *     summary: Update a payment method
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               label:
 *                 type: string
 *               bank_name:
 *                 type: string
 *               bank_account:
 *                 type: string
 *               bank_ifsc:
 *                 type: string
 *               bank_branch:
 *                 type: string
 *               upi_id:
 *                 type: string
 *               is_default:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated payment method
 *   delete:
 *     tags: [Payment Methods]
 *     summary: Delete a payment method
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deletion confirmed
 */

// ──────────────────────────────────────────────
// PRODUCTS
// ──────────────────────────────────────────────

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: List products (paginated)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated product list
 *   post:
 *     tags: [Products]
 *     summary: Create a product
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               hsn_code:
 *                 type: string
 *               unit:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Created product
 *
 * /api/products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Update a product
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               hsn_code:
 *                 type: string
 *               unit:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Updated product
 *   delete:
 *     tags: [Products]
 *     summary: Delete a product
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deletion confirmed
 */

// ──────────────────────────────────────────────
// LEADS
// ──────────────────────────────────────────────

/**
 * @swagger
 * /api/leads:
 *   get:
 *     tags: [Leads]
 *     summary: List leads (paginated, admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated lead list
 *       401:
 *         description: Unauthorized
 *   post:
 *     tags: [Leads]
 *     summary: Create a lead
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               product:
 *                 type: string
 *               quantity:
 *                 type: string
 *               status:
 *                 type: string
 *               source:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               comments:
 *                 type: string
 *     responses:
 *       200:
 *         description: Created lead
 *
 * /api/leads/{id}:
 *   put:
 *     tags: [Leads]
 *     summary: Update a lead
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               product:
 *                 type: string
 *               quantity:
 *                 type: string
 *               status:
 *                 type: string
 *               source:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               comments:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated lead
 *   delete:
 *     tags: [Leads]
 *     summary: Delete a lead
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deletion confirmed
 */

// ──────────────────────────────────────────────
// QUOTES
// ──────────────────────────────────────────────

/**
 * @swagger
 * /api/quotes:
 *   get:
 *     tags: [Quotes]
 *     summary: List quotes/invoices (paginated, admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [tax_invoice, sales_quotation] }
 *     responses:
 *       200:
 *         description: Paginated quote list
 *   post:
 *     tags: [Quotes]
 *     summary: Create a quote or invoice
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quote_type:
 *                 type: string
 *                 enum: [tax_invoice, sales_quotation]
 *               quote_number:
 *                 type: string
 *               lead_id:
 *                 type: integer
 *               billing_name:
 *                 type: string
 *               billing_address:
 *                 type: string
 *               billing_gstin:
 *                 type: string
 *               billing_phone:
 *                 type: string
 *               billing_email:
 *                 type: string
 *               shipping_name:
 *                 type: string
 *               shipping_address:
 *                 type: string
 *               shipping_phone:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *               payment_method_id:
 *                 type: integer
 *               subtotal:
 *                 type: number
 *               cgst_rate:
 *                 type: number
 *               sgst_rate:
 *                 type: number
 *               cgst_amount:
 *                 type: number
 *               sgst_amount:
 *                 type: number
 *               discount:
 *                 type: number
 *               grand_total:
 *                 type: number
 *               total_qty:
 *                 type: integer
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Created quote
 *
 * /api/quotes/next-number:
 *   get:
 *     tags: [Quotes]
 *     summary: Get next quote/invoice number
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [tax_invoice, sales_quotation] }
 *     responses:
 *       200:
 *         description: Next number info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 quoteNumber:
 *                   type: string
 *                 nextVal:
 *                   type: integer
 *
 * /api/quotes/{id}:
 *   put:
 *     tags: [Quotes]
 *     summary: Update a quote
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Updated quote
 *   delete:
 *     tags: [Quotes]
 *     summary: Delete a quote
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deletion confirmed
 *
 * /api/quotes/{id}/convert:
 *   post:
 *     tags: [Quotes]
 *     summary: Convert a sales quotation to tax invoice
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Converted quote
 */

// ──────────────────────────────────────────────
// REVIEWS
// ──────────────────────────────────────────────

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     tags: [Reviews]
 *     summary: Get approved reviews (public)
 *     responses:
 *       200:
 *         description: Array of approved reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   role:
 *                     type: string
 *                   rating:
 *                     type: integer
 *                   text:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *   post:
 *     tags: [Reviews]
 *     summary: Submit a review (public, rate-limited)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, text]
 *             properties:
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Created review
 *       400:
 *         description: Validation error

 *       429:
 *         description: Rate limit exceeded
 */

// ──────────────────────────────────────────────
// ORDERS
// ──────────────────────────────────────────────

/**
 * @swagger
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: List orders (paginated, admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: date_from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: date_to
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Paginated order list
 *   post:
 *     tags: [Orders]
 *     summary: Create an order
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [client_name]
 *             properties:
 *               client_name:
 *                 type: string
 *               items:
 *                 type: object
 *               total_amount:
 *                 type: number
 *               total_qty:
 *                 type: integer
 *               status:
 *                 type: string
 *               delivered_at:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Created order
 *
 * /api/orders/{id}:
 *   put:
 *     tags: [Orders]
 *     summary: Update an order
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               client_name:
 *                 type: string
 *               items:
 *                 type: object
 *               total_amount:
 *                 type: number
 *               total_qty:
 *                 type: integer
 *               status:
 *                 type: string
 *               delivered_at:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Updated order
 *   delete:
 *     tags: [Orders]
 *     summary: Delete an order
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deletion confirmed
 */
