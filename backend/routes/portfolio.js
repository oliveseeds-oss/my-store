const router = require("express").Router();
const db = require("../db");
const { verifyAdmin } = require("../middleware/auth");

// PUBLIC — List portfolio items (supports filtering by category)
router.get("/", async (req, res) => {
  const { category } = req.query;
  let sql = "SELECT * FROM portfolio";
  const params = [];
  const clauses = [];

  if (category) { clauses.push("category = ?"); params.push(category); }

  if (clauses.length > 0) {
    sql += " WHERE " + clauses.join(" AND ");
  }
  
  sql += " ORDER BY created_at DESC";

  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN — List all portfolio items
router.get("/admin/all", verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM portfolio ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN — Add portfolio item
router.post("/", verifyAdmin, async (req, res) => {
  const { image_url, title, description, category } = req.body;
  if (!image_url || !title) {
    return res.status(400).json({ error: "Image URL and Title are required" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO portfolio (image_url, title, description, category) VALUES (?,?,?,?)",
      [image_url, title, description || null, category || null]
    );
    res.json({ id: result.insertId, message: "Portfolio project added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN — Delete portfolio item
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    await db.query("DELETE FROM portfolio WHERE id = ?", [req.params.id]);
    res.json({ message: "Portfolio project deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
