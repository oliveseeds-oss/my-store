const router = require("express").Router();
const db = require("../db");
const { verifyAdmin } = require("../middleware/auth");

router.post("/", async (req, res) => {
  const { name, email, phone, company, product_type, quantity, message } = req.body;
  await db.query(
    "INSERT INTO bulk_orders (name, email, phone, company, product_type, quantity, message) VALUES (?,?,?,?,?,?,?)",
    [name, email, phone, company, product_type, quantity || 10, message]
  );
  res.json({ message: "Bulk order request submitted successfully." });
});

router.get("/admin/all", verifyAdmin, async (req, res) => {
  const [rows] = await db.query("SELECT * FROM bulk_orders ORDER BY created_at DESC");
  res.json(rows);
});

router.put("/:id/read", verifyAdmin, async (req, res) => {
  await db.query("UPDATE bulk_orders SET is_read = TRUE WHERE id = ?", [req.params.id]);
  res.json({ message: "Marked read" });
});

router.delete("/:id", verifyAdmin, async (req, res) => {
  await db.query("DELETE FROM bulk_orders WHERE id = ?", [req.params.id]);
  res.json({ message: "Deleted" });
});

module.exports = router;
