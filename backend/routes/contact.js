const router = require("express").Router();
const db = require("../db");
const { verifyAdmin } = require("../middleware/auth");

router.post("/", async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  await db.query(
    "INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?,?,?,?,?)",
    [name, email, phone, subject, message]
  );
  res.json({ message: "Message sent" });
});

router.get("/admin/all", verifyAdmin, async (req, res) => {
  const [rows] = await db.query("SELECT * FROM contact_messages ORDER BY created_at DESC");
  res.json(rows);
});

router.put("/:id/read", verifyAdmin, async (req, res) => {
  await db.query("UPDATE contact_messages SET is_read = TRUE WHERE id = ?", [req.params.id]);
  res.json({ message: "Marked read" });
});

router.delete("/:id", verifyAdmin, async (req, res) => {
  await db.query("DELETE FROM contact_messages WHERE id = ?", [req.params.id]);
  res.json({ message: "Deleted" });
});

module.exports = router;