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

// ADMIN — Add portfolio item (supports single image_url or multiple image_urls)
router.post("/", verifyAdmin, async (req, res) => {
  const { image_url, image_urls, title, description, category } = req.body;
  
  let urls = [];
  if (Array.isArray(image_urls)) {
    urls = image_urls.map(u => String(u || "").trim()).filter(Boolean);
  } else if (typeof image_urls === "string" && image_urls.trim()) {
    urls = image_urls.split(/[\n,]+/).map(u => u.trim()).filter(Boolean);
  }
  if (image_url && typeof image_url === "string" && image_url.trim()) {
    const splitUrls = image_url.split(/[\n,]+/).map(u => u.trim()).filter(Boolean);
    urls.push(...splitUrls);
  }
  urls = [...new Set(urls)];

  if (urls.length === 0 || !title) {
    return res.status(400).json({ error: "At least one Image URL and Title are required" });
  }

  try {
    const insertedIds = [];
    for (const url of urls) {
      const [result] = await db.query(
        "INSERT INTO portfolio (image_url, title, description, category) VALUES (?,?,?,?)",
        [url, title, description || null, category || null]
      );
      insertedIds.push(result.insertId);
    }
    res.json({ id: insertedIds[0], ids: insertedIds, count: insertedIds.length, message: `${insertedIds.length} portfolio project(s) added` });
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
