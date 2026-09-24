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

// ADMIN — Add gallery item (supports single image_url or multiple image_urls)
router.post("/", verifyAdmin, async (req, res) => {
  const { image_url, image_urls, title, style, category, industry, material, description } = req.body;
  
  // Extract all URLs
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

  if (urls.length === 0) {
    return res.status(400).json({ error: "At least one Image URL is required" });
  }

  try {
    const insertedIds = [];
    for (const url of urls) {
      const [result] = await db.query(
        "INSERT INTO gallery (image_url, title, style, category, industry, material, description) VALUES (?,?,?,?,?,?,?)",
        [url, title || null, style || null, category || null, industry || null, material || null, description || null]
      );
      insertedIds.push(result.insertId);
    }
    res.json({ ids: insertedIds, count: insertedIds.length, message: `${insertedIds.length} showcase design image(s) added` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN — Update gallery item
router.put("/:id", verifyAdmin, async (req, res) => {
  const { image_url, title, style, category, industry, material, description } = req.body;
  try {
    await db.query(
      "UPDATE gallery SET image_url=?, title=?, style=?, category=?, industry=?, material=?, description=? WHERE id=?",
      [image_url, title || null, style || null, category || null, industry || null, material || null, description || null, req.params.id]
    );
    res.json({ message: "Showcase design image updated" });
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
