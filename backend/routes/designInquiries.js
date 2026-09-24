const router = require("express").Router();
const db = require("../db");
const { verifyAdmin } = require("../middleware/auth");
const { createRateLimiter } = require("../middleware/rateLimiter");

// POST /api/design-inquiries — Rate-limited public design inquiry
router.post("/", createRateLimiter(5, 15 * 60 * 1000), async (req, res) => {
  const { name, company, email, phone, project_type, budget_range, timeline, message } = req.body;
  
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Name is required." });
  }
  if (!email || typeof email !== "string" || !/\S+@\S+\.\S+/.test(email.trim())) {
    return res.status(400).json({ error: "A valid email address is required." });
  }
  if (!project_type || typeof project_type !== "string" || !project_type.trim()) {
    return res.status(400).json({ error: "Project type is required." });
  }
  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Message is required." });
  }

  const cleanName = name.trim().slice(0, 255);
  const cleanCompany = company ? String(company).trim().slice(0, 255) : null;
  const cleanEmail = email.trim().toLowerCase().slice(0, 255);
  const cleanPhone = phone ? String(phone).trim().slice(0, 50) : null;
  const cleanProjectType = project_type.trim().slice(0, 255);
  const cleanBudget = budget_range ? String(budget_range).trim().slice(0, 255) : null;
  const cleanTimeline = timeline ? String(timeline).trim().slice(0, 255) : null;
  const cleanMessage = message.trim().slice(0, 5000);

  try {
    await db.query(
      "INSERT INTO design_inquiries (name, company, email, phone, project_type, budget_range, timeline, message) VALUES (?,?,?,?,?,?,?,?)",
      [cleanName, cleanCompany, cleanEmail, cleanPhone, cleanProjectType, cleanBudget, cleanTimeline, cleanMessage]
    );
    res.json({ message: "Design service inquiry submitted successfully." });
  } catch (err) {
    console.error("Failed to submit design inquiry:", err);
    res.status(500).json({ error: "Failed to submit design inquiry." });
  }
});

router.get("/admin/all", verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM design_inquiries ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error("Failed to fetch design inquiries:", err);
    res.status(500).json({ error: "Failed to fetch inquiries" });
  }
});

router.put("/:id/read", verifyAdmin, async (req, res) => {
  try {
    await db.query("UPDATE design_inquiries SET is_read = TRUE WHERE id = ?", [req.params.id]);
    res.json({ message: "Marked read" });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark read" });
  }
});

router.put("/:id/status", verifyAdmin, async (req, res) => {
  const { status } = req.body;
  try {
    await db.query("UPDATE design_inquiries SET status = ? WHERE id = ?", [status, req.params.id]);
    res.json({ message: "Status updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    await db.query("DELETE FROM design_inquiries WHERE id = ?", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete inquiry" });
  }
});

module.exports = router;
