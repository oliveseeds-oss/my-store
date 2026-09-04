const router = require("express").Router();
const db = require("../db");
const { verifyAdmin } = require("../middleware/auth");

// PUBLIC — categories by type
router.get("/", async (req, res) => {
  const { type } = req.query;
  let sql = "SELECT * FROM categories";
  const params = [];
  if (type) { sql += " WHERE type = ? OR type = 'both'"; params.push(type); }
  sql += " ORDER BY name";
  const [rows] = await db.query(sql, params);
  res.json(rows);
});

// PUBLIC — products for a specific category id or slug
router.get("/:id/products", async (req, res) => {
  const catParam = req.params.id;
  try {
    let sql = `SELECT p.*, c.name as category_name
               FROM products p
               LEFT JOIN categories c ON p.category_id = c.id
               WHERE p.is_active = TRUE`;
    const params = [];
    if (/^\d+$/.test(catParam)) {
      sql += " AND (p.category_id = ? OR c.id = ?)";
      params.push(parseInt(catParam, 10), parseInt(catParam, 10));
    } else {
      const decoded = decodeURIComponent(catParam);
      sql += " AND (LOWER(c.name) = LOWER(?) OR LOWER(REPLACE(c.name, ' ', '-')) = LOWER(?))";
      params.push(decoded, decoded);
    }
    sql += " ORDER BY p.created_at DESC";
    const [rows] = await db.query(sql, params);
    const parseJSON = (val) => {
      if (Array.isArray(val)) return val;
      if (!val) return [];
      try { return JSON.parse(val); } catch { return []; }
    };
    res.json((rows || []).map(r => ({ ...r, images: parseJSON(r.images), sizes: parseJSON(r.sizes), tags: parseJSON(r.tags) })));
  } catch (err) {
    console.error("Error fetching category products:", err);
    res.status(500).json({ error: "Failed to fetch category products" });
  }
});

// ADMIN — all
router.get("/admin/all", verifyAdmin, async (req, res) => {
  const [rows] = await db.query("SELECT * FROM categories ORDER BY name");
  res.json(rows);
});

// ADMIN — add
router.post("/", verifyAdmin, async (req, res) => {
  const { name, type, description, image_url } = req.body;
  const [result] = await db.query(
    "INSERT INTO categories (name, type, description, image_url) VALUES (?,?,?,?)",
    [name, type || "physical", description, image_url || null]
  );
  res.json({ id: result.insertId });
});

// ADMIN — update
router.put("/:id", verifyAdmin, async (req, res) => {
  const { name, type, description, image_url } = req.body;
  await db.query(
    "UPDATE categories SET name=?, type=?, description=?, image_url=? WHERE id=?",
    [name, type, description, image_url || null, req.params.id]
  );
  res.json({ message: "Updated" });
});

// ADMIN — delete
router.delete("/:id", verifyAdmin, async (req, res) => {
  await db.query("DELETE FROM categories WHERE id = ?", [req.params.id]);
  res.json({ message: "Deleted" });
});

module.exports = router;