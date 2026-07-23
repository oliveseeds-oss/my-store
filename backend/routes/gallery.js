const router = require("express").Router();
const db = require("../db");
const { verifyAdmin } = require("../middleware/auth");

// PUBLIC — List gallery items (supports filtering by style, category, industry, material)
router.get("/", async (req, res) => {
  const { style, category, industry, material } = req.query;
  let sql = "SELECT * FROM gallery";
  const params = [];
  const clauses = [];

  if (style) { clauses.push("style = ?"); params.push(style); }
  if (category) { clauses.push("category = ?"); params.push(category); }
  if (industry) { clauses.push("industry = ?"); params.push(industry); }
  if (material) { clauses.push("material = ?"); params.push(material); }

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

// ADMIN — Add gallery item
router.post("/", verifyAdmin, async (req, res) => {
  const { image_url, title, style, category, industry, material } = req.body;
  if (!image_url) {
    return res.status(400).json({ error: "Image URL is required" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO gallery (image_url, title, style, category, industry, material) VALUES (?,?,?,?,?,?)",
      [image_url, title || null, style || null, category || null, industry || null, material || null]
    );
    res.json({ id: result.insertId, message: "Showcase design image added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN — Delete gallery item
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    await db.query("DELETE FROM gallery WHERE id = ?", [req.params.id]);
    res.json({ message: "Showcase design image deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
