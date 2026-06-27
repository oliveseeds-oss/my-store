const router = require("express").Router();
const db = require("../db");
const { verifyAdmin } = require("../middleware/auth");

const parseJSON = (val) => {
  if (Array.isArray(val)) return val;
  if (!val) return [];
  try { return JSON.parse(val); } catch { return []; }
};

function generateProductUid() {
  const uniqueId = Math.floor(100000 + Math.random() * 900000);
  return `PRD-${uniqueId}`;
}

// PUBLIC — list with filters
router.get("/", async (req, res) => {
  const { category, search, tag, sort, minPrice, maxPrice, minRating } = req.query;
  let sql = `SELECT p.*, c.name as category_name
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.id
             WHERE p.is_active = TRUE`;
  const params = [];
  if (category) { sql += " AND c.name = ?"; params.push(category); }
  if (search) { sql += " AND p.name LIKE ?"; params.push(`%${search}%`); }
  if (minPrice) { sql += " AND COALESCE(p.discount_price, p.price) >= ?"; params.push(minPrice); }
  if (maxPrice) { sql += " AND COALESCE(p.discount_price, p.price) <= ?"; params.push(maxPrice); }
  if (minRating) { sql += " AND p.rating >= ?"; params.push(minRating); }
  if (tag) { sql += " AND JSON_CONTAINS(p.tags, JSON_QUOTE(?))"; params.push(tag); }
  if (sort === "price_asc") sql += " ORDER BY COALESCE(p.discount_price,p.price) ASC";
  else if (sort === "price_desc") sql += " ORDER BY COALESCE(p.discount_price,p.price) DESC";
  else if (sort === "rating") sql += " ORDER BY p.rating DESC";
  else sql += " ORDER BY p.created_at DESC";
  const [rows] = await db.query(sql, params);
  res.json(rows.map(r => ({ ...r, images: parseJSON(r.images), sizes: parseJSON(r.sizes), tags: parseJSON(r.tags) })));
});

// PUBLIC — single product
router.get("/:id", async (req, res) => {
  const [rows] = await db.query(
    `SELECT p.*, c.name as category_name
     FROM products p LEFT JOIN categories c ON p.category_id = c.id
     WHERE (p.product_uid = ? OR p.id = ?) AND p.is_active = TRUE`, [req.params.id, req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: "Not found" });
  const product = { ...rows[0], images: parseJSON(rows[0].images), sizes: parseJSON(rows[0].sizes), tags: parseJSON(rows[0].tags) };
  const [reviews] = await db.query(
    `SELECT r.*, m.name as member_name FROM reviews r
     JOIN members m ON r.member_uid = m.member_uid
     WHERE r.product_uid = ? AND r.product_type = 'physical' ORDER BY r.created_at DESC`,
    [product.product_uid]
  );
  product.reviews = reviews;
  const [related] = await db.query(
    `SELECT product_uid as id, name, price, discount_price, images, rating, review_count
     FROM products WHERE category_id = ? AND product_uid != ? AND is_active = TRUE LIMIT 6`,
    [product.category_id, product.product_uid]
  );
  product.related = related.map(r => ({ ...r, images: parseJSON(r.images) }));
  res.json(product);
});

// ADMIN — all
router.get("/admin/all", verifyAdmin, async (req, res) => {
  const [rows] = await db.query(
    `SELECT p.*, c.name as category_name FROM products p
     LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.created_at DESC`
  );
  res.json(rows.map(r => ({ ...r, images: parseJSON(r.images), sizes: parseJSON(r.sizes), tags: parseJSON(r.tags) })));
});

// ADMIN — add
router.post("/", verifyAdmin, async (req, res) => {
  const { product_uid, name, description, price, discount_price, category_id,
    stock, image_url, images, sizes, tags } = req.body;
  const final_uid = product_uid?.trim() || generateProductUid();
  await db.query(
    `INSERT INTO products
     (product_uid, name, description, price, discount_price, category_id, stock, image_url, images, sizes, tags)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [final_uid, name, description, price, discount_price || null,
      category_id || null, stock, image_url,
      JSON.stringify(images || []), JSON.stringify(sizes || []), JSON.stringify(tags || [])]
  );
  res.json({ product_id: final_uid, message: "Product added" });
});

// ADMIN — update
router.put("/:id", verifyAdmin, async (req, res) => {
  const { name, description, price, discount_price, category_id,
    stock, image_url, images, sizes, tags, is_active } = req.body;
  await db.query(
    `UPDATE products SET name=?, description=?, price=?, discount_price=?,
     category_id=?, stock=?, image_url=?, images=?, sizes=?, tags=?, is_active=? WHERE product_uid=? OR id=?`,
    [name, description, price, discount_price || null, category_id || null, stock, image_url,
      JSON.stringify(images || []), JSON.stringify(sizes || []), JSON.stringify(tags || []),
      is_active, req.params.id, req.params.id]
  );
  res.json({ message: "Updated" });
});

// ADMIN — delete
router.delete("/:id", verifyAdmin, async (req, res) => {
  await db.query("DELETE FROM products WHERE product_uid = ? OR id = ?", [req.params.id, req.params.id]);
  res.json({ message: "Deleted" });
});

module.exports = router;