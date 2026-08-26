const router = require("express").Router();
const db = require("../db");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { verifyAdmin } = require("../middleware/auth");

const parseJSON = (val) => {
  if (Array.isArray(val)) return val;
  if (!val) return [];
  try { return JSON.parse(val); } catch { return []; }
};

function generateDigitalProductUid() {
  const uniqueId = crypto.randomInt(100000, 1000000);
  return `DPD-${uniqueId}`;
}

router.get("/download/:token", async (req, res) => {
  const { token } = req.params;
  try {
    let product_uid = null;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      product_uid = decoded.product_uid;
    } catch {
      product_uid = token;
    }
    
    const [rows] = await db.query(
      "SELECT file_url FROM digital_products WHERE product_uid = ? OR id = ?",
      [product_uid, product_uid]
    );
    if (!rows.length || !rows[0].file_url) {
      return res.status(404).send("File not found or product inactive.");
    }
    
    let fileUrl = rows[0].file_url.trim();

    // Ensure valid URL scheme for external links (e.g. Google Drive, Dropbox, Mega)
    if (!fileUrl.startsWith("/") && !fileUrl.startsWith("http://") && !fileUrl.startsWith("https://")) {
      fileUrl = `https://${fileUrl}`;
    }

    if (fileUrl.startsWith("/uploads/")) {
      const filePath = path.join(__dirname, "..", fileUrl);
      if (fs.existsSync(filePath)) {
        return res.download(filePath);
      }
    }

    return res.redirect(fileUrl);
  } catch (err) {
    console.error("Digital product download error:", err);
    res.status(400).send("Download link has expired or is invalid.");
  }
});

router.get("/", async (req, res) => {
  const { category, search, tag, sort, minPrice, maxPrice, minRating } = req.query;
  let sql = `SELECT d.*, c.name as category_name FROM digital_products d
             LEFT JOIN categories c ON d.category_id = c.id WHERE d.is_active = TRUE`;
  const params = [];
  if (category) { sql += " AND c.name = ?"; params.push(category); }
  if (search) { sql += " AND d.name LIKE ?"; params.push(`%${search}%`); }
  if (minPrice) { sql += " AND COALESCE(d.discount_price,d.price) >= ?"; params.push(minPrice); }
  if (maxPrice) { sql += " AND COALESCE(d.discount_price,d.price) <= ?"; params.push(maxPrice); }
  if (minRating) { sql += " AND d.rating >= ?"; params.push(minRating); }
  if (tag) { sql += " AND JSON_CONTAINS(d.tags, JSON_QUOTE(?))"; params.push(tag); }
  if (sort === "price_asc") sql += " ORDER BY COALESCE(d.discount_price,d.price) ASC";
  else if (sort === "price_desc") sql += " ORDER BY COALESCE(d.discount_price,d.price) DESC";
  else if (sort === "rating") sql += " ORDER BY d.rating DESC";
  else sql += " ORDER BY d.created_at DESC";
  const [rows] = await db.query(sql, params);
  res.json(rows.map(r => ({ ...r, images: parseJSON(r.images), tags: parseJSON(r.tags) })));
});

router.get("/:id", async (req, res) => {
  const [rows] = await db.query(
    `SELECT d.*, c.name as category_name FROM digital_products d
     LEFT JOIN categories c ON d.category_id = c.id
     WHERE (d.product_uid = ? OR d.id = ?) AND d.is_active = TRUE`, [req.params.id, req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: "Not found" });
  const product = { ...rows[0], images: parseJSON(rows[0].images), tags: parseJSON(rows[0].tags) };
  const [reviews] = await db.query(
    `SELECT r.*, m.name as member_name FROM reviews r
     JOIN members m ON r.member_uid = m.member_uid
     WHERE r.product_uid = ? AND r.product_type = 'digital' ORDER BY r.created_at DESC`,
    [product.product_uid]
  );
  product.reviews = reviews;
  const [related] = await db.query(
    `SELECT product_uid as id, name, price, discount_price, images, thumbnail_url, rating, review_count
     FROM digital_products WHERE category_id = ? AND product_uid != ? AND is_active = TRUE LIMIT 6`,
    [product.category_id, product.product_uid]
  );
  product.related = related.map(r => ({ ...r, images: parseJSON(r.images) }));
  res.json(product);
});

router.get("/admin/all", verifyAdmin, async (req, res) => {
  const [rows] = await db.query(
    `SELECT d.*, c.name as category_name FROM digital_products d
     LEFT JOIN categories c ON d.category_id = c.id ORDER BY d.created_at DESC`
  );
  res.json(rows.map(r => ({ ...r, images: parseJSON(r.images), tags: parseJSON(r.tags) })));
});

router.post("/", verifyAdmin, async (req, res) => {
  const { product_uid, name, description, price, discount_price, category_id,
    file_url, thumbnail_url, images, tags, file_size, file_format } = req.body;
  const final_uid = product_uid?.trim() || generateDigitalProductUid();
  await db.query(
    `INSERT INTO digital_products
     (product_uid, name, description, price, discount_price, category_id,
      file_url, thumbnail_url, images, tags, file_size, file_format)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [final_uid, name, description, price, discount_price || null,
      category_id || null, file_url, thumbnail_url,
      JSON.stringify(images || []), JSON.stringify(tags || []), file_size, file_format]
  );
  res.json({ product_id: final_uid, message: "Added" });
});

router.put("/:id", verifyAdmin, async (req, res) => {
  const { name, description, price, discount_price, category_id,
    file_url, thumbnail_url, images, tags, file_size, file_format, is_active } = req.body;
  await db.query(
    `UPDATE digital_products SET name=?, description=?, price=?, discount_price=?,
     category_id=?, file_url=?, thumbnail_url=?, images=?, tags=?,
     file_size=?, file_format=?, is_active=? WHERE product_uid=? OR id=?`,
    [name, description, price, discount_price || null, category_id || null,
      file_url, thumbnail_url, JSON.stringify(images || []), JSON.stringify(tags || []),
      file_size, file_format, is_active, req.params.id, req.params.id]
  );
  res.json({ message: "Updated" });
});

router.delete("/:id", verifyAdmin, async (req, res) => {
  await db.query("DELETE FROM digital_products WHERE product_uid = ? OR id = ?", [req.params.id, req.params.id]);
  res.json({ message: "Deleted" });
});

module.exports = router;