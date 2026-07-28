const router = require("express").Router();
const db = require("../db");
const { verifyAdmin } = require("../middleware/auth");

router.post("/", async (req, res) => {
  const { name, company, email, phone, project_type, budget_range, timeline, message } = req.body;
  
  if (!name || !company || !email || !project_type || !message) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  await db.query(
    "INSERT INTO digital_inquiries (name, company, email, phone, project_type, budget_range, timeline, message) VALUES (?,?,?,?,?,?,?,?)",
    [name, company, email, phone, project_type, budget_range, timeline, message]
  );
  
  res.json({ message: "Digital project inquiry submitted successfully." });
});

router.get("/admin/all", verifyAdmin, async (req, res) => {
  const [rows] = await db.query("SELECT * FROM digital_inquiries ORDER BY created_at DESC");
  res.json(rows);
});

router.put("/:id/read", verifyAdmin, async (req, res) => {
  await db.query("UPDATE digital_inquiries SET is_read = TRUE WHERE id = ?", [req.params.id]);
  res.json({ message: "Marked read" });
});

router.put("/:id/status", verifyAdmin, async (req, res) => {
  const { status } = req.body;
  await db.query("UPDATE digital_inquiries SET status = ? WHERE id = ?", [status, req.params.id]);
  res.json({ message: "Status updated" });
});

router.delete("/:id", verifyAdmin, async (req, res) => {
  await db.query("DELETE FROM digital_inquiries WHERE id = ?", [req.params.id]);
  res.json({ message: "Deleted" });
});

module.exports = router;
