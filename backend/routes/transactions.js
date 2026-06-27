const router = require("express").Router();
const db = require("../db");
const { verifyAdmin } = require("../middleware/auth");

// GET /api/transactions - Unified ledger of all sales transactions
router.get("/", verifyAdmin, async (req, res) => {
  const { search, mode, status, from_date, to_date } = req.query;

  let query = `
    SELECT o.order_uid, o.invoice_uid, o.invoice_date as created_at, 
           COALESCE(o.guest_name, m.name, 'Guest') as customer_name,
           COALESCE(o.guest_email, m.email, '') as customer_email,
           o.subtotal, o.tax_amount, o.shipping_fee, o.total, 
           o.payment_mode, o.transaction_id, o.payment_status,
           o.status, o.type
    FROM (
      SELECT order_uid, invoice_uid, invoice_date, guest_name, guest_email, member_uid,
             subtotal, tax_amount, shipping_fee, total, payment_mode, transaction_id, payment_status,
             status, 'physical' as type
      FROM physical_orders
      
      UNION ALL
      
      SELECT order_uid, invoice_uid, invoice_date, guest_name, guest_email, member_uid,
             subtotal, tax_amount, 0 as shipping_fee, total, payment_mode, transaction_id, payment_status,
             status, 'digital' as type
      FROM digital_orders
    ) o
    LEFT JOIN members m ON o.member_uid = m.member_uid
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    query += ` AND (o.transaction_id LIKE ? OR o.order_uid LIKE ? OR o.invoice_uid LIKE ? OR o.guest_name LIKE ? OR m.name LIKE ? OR o.guest_email LIKE ?)`;
    const wildcard = `%${search}%`;
    params.push(wildcard, wildcard, wildcard, wildcard, wildcard, wildcard);
  }

  if (mode) {
    query += " AND o.payment_mode = ?";
    params.push(mode);
  }

  if (status) {
    query += " AND o.payment_status = ?";
    params.push(status);
  }

  if (from_date) {
    query += " AND DATE(o.invoice_date) >= ?";
    params.push(from_date);
  }

  if (to_date) {
    query += " AND DATE(o.invoice_date) <= ?";
    params.push(to_date);
  }

  query += " ORDER BY o.invoice_date DESC";

  try {
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Failed to load transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions ledger" });
  }
});

module.exports = router;
