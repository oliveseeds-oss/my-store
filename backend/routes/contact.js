const router = require("express").Router();
const db = require("../db");
const { verifyAdmin } = require("../middleware/auth");
const { createRateLimiter } = require("../middleware/rateLimiter");

// POST /api/contact — Rate-limited public contact submission
router.post("/", createRateLimiter(5, 15 * 60 * 1000), async (req, res) => {
  const { name, firstName, lastName, email, phone, subject, message } = req.body;

  const resolvedName = name || [firstName, lastName].filter(Boolean).join(" ");
  if (!resolvedName || typeof resolvedName !== "string" || !resolvedName.trim()) {
    return res.status(400).json({ error: "Name is required" });
  }

  if (!email || typeof email !== "string" || !/\S+@\S+\.\S+/.test(email.trim())) {
    return res.status(400).json({ error: "A valid email address is required" });
  }

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }

  const cleanName = resolvedName.trim().slice(0, 100);
  const cleanEmail = email.trim().toLowerCase().slice(0, 255);
  const cleanPhone = phone ? String(phone).trim().slice(0, 30) : null;
  const cleanSubject = subject ? String(subject).trim().slice(0, 200) : "General Inquiry";
  const cleanMessage = message.trim().slice(0, 5000);

  try {
    await db.query(
      "INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?,?,?,?,?)",
      [cleanName, cleanEmail, cleanPhone, cleanSubject, cleanMessage]
    );
    res.json({ message: "Message sent" });
  } catch (err) {
    console.error("Failed to save contact message:", err);
    res.status(500).json({ error: "Failed to send message. Please try again later." });
  }
});

router.get("/admin/all", verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM contact_messages ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error("Failed to fetch contact messages:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

router.put("/:id/read", verifyAdmin, async (req, res) => {
  try {
    await db.query("UPDATE contact_messages SET is_read = TRUE WHERE id = ?", [req.params.id]);
    res.json({ message: "Marked read" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update message" });
  }
});

router.put("/:id/status", verifyAdmin, async (req, res) => {
  const { status } = req.body;
  try {
    await db.query("UPDATE contact_messages SET status = ? WHERE id = ?", [status, req.params.id]);
    res.json({ message: "Status updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    await db.query("DELETE FROM contact_messages WHERE id = ?", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete message" });
  }
});

module.exports = router;