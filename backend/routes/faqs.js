const router = require("express").Router();
const db = require("../db");
const { verifyAdmin } = require("../middleware/auth");

// Public Endpoint: GET /api/faqs (returns published FAQs ordered by display_order)
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM faqs WHERE is_published = TRUE ORDER BY display_order ASC, id ASC");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching public FAQs:", err);
    res.status(500).json({ error: "Failed to fetch FAQs" });
  }
});

// Admin Endpoint: GET /api/admin/faqs (returns all FAQs for admin)
router.get("/admin/all", verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM faqs ORDER BY display_order ASC, id ASC");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching admin FAQs:", err);
    res.status(500).json({ error: "Failed to fetch admin FAQs" });
  }
});

// Admin Endpoint: POST /api/faqs
router.post("/", verifyAdmin, async (req, res) => {
  const { question, answer, category, display_order, is_published } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO faqs (question, answer, category, display_order, is_published) VALUES (?, ?, ?, ?, ?)",
      [question, answer, category || "General", display_order || 0, is_published !== false ? 1 : 0]
    );
    res.json({ id: result.insertId, message: "FAQ created successfully" });
  } catch (err) {
    console.error("Error creating FAQ:", err);
    res.status(500).json({ error: "Failed to create FAQ" });
  }
});

// Admin Endpoint: PUT /api/faqs/:id
router.put("/:id", verifyAdmin, async (req, res) => {
  const { question, answer, category, display_order, is_published } = req.body;
  try {
    await db.query(
      "UPDATE faqs SET question = ?, answer = ?, category = ?, display_order = ?, is_published = ? WHERE id = ?",
      [question, answer, category || "General", display_order || 0, is_published ? 1 : 0, req.params.id]
    );
    res.json({ message: "FAQ updated successfully" });
  } catch (err) {
    console.error("Error updating FAQ:", err);
    res.status(500).json({ error: "Failed to update FAQ" });
  }
});

// Admin Endpoint: DELETE /api/faqs/:id
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    await db.query("DELETE FROM faqs WHERE id = ?", [req.params.id]);
    res.json({ message: "FAQ deleted successfully" });
  } catch (err) {
    console.error("Error deleting FAQ:", err);
    res.status(500).json({ error: "Failed to delete FAQ" });
  }
});

module.exports = router;
