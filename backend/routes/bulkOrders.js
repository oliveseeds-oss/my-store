const router = require("express").Router();
const db = require("../db");
const { verifyAdmin } = require("../middleware/auth");
const { createRateLimiter } = require("../middleware/rateLimiter");

// POST /api/bulk-orders — Rate-limited public bulk order inquiry
router.post("/", createRateLimiter(5, 15 * 60 * 1000), async (req, res) => {
  const { name, email, phone, company, product_type, quantity, message } = req.body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Name is required" });
  }

  if (!email || typeof email !== "string" || !/\S+@\S+\.\S+/.test(email.trim())) {
    return res.status(400).json({ error: "A valid email address is required" });
  }

  const cleanName = name.trim().slice(0, 255);
  const cleanEmail = email.trim().toLowerCase().slice(0, 255);
  const cleanPhone = phone ? String(phone).trim().slice(0, 50) : null;
  const cleanCompany = company ? String(company).trim().slice(0, 255) : null;
  const cleanProductType = product_type ? String(product_type).trim().slice(0, 255) : null;
  const cleanQty = quantity ? Math.max(1, parseInt(quantity, 10) || 10) : 10;
  const cleanMessage = message ? String(message).trim().slice(0, 5000) : null;

  try {
    await db.query(
      "INSERT INTO bulk_orders (name, email, phone, company, product_type, quantity, message) VALUES (?,?,?,?,?,?,?)",
      [cleanName, cleanEmail, cleanPhone, cleanCompany, cleanProductType, cleanQty, cleanMessage]
    );
    res.json({ message: "Bulk order request submitted successfully." });
  } catch (err) {
    console.error("Failed to submit bulk order:", err);
    res.status(500).json({ error: "Failed to submit bulk order request." });
  }
});

router.get("/admin/all", verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM bulk_orders ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error("Failed to fetch bulk orders:", err);
    res.status(500).json({ error: "Failed to fetch bulk orders" });
  }
});

router.put("/:id/read", verifyAdmin, async (req, res) => {
  try {
    await db.query("UPDATE bulk_orders SET is_read = TRUE WHERE id = ?", [req.params.id]);
    res.json({ message: "Marked read" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update bulk order" });
  }
});

router.put("/:id/status", verifyAdmin, async (req, res) => {
  const { status } = req.body;
  try {
    await db.query("UPDATE bulk_orders SET status = ? WHERE id = ?", [status, req.params.id]);
    res.json({ message: "Status updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    await db.query("DELETE FROM bulk_orders WHERE id = ?", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete bulk order" });
  }
});

module.exports = router;
