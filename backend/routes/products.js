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
  
  // Load personalization templates and fields
  const [templates] = await db.query(
    "SELECT * FROM product_templates WHERE product_id = ? AND is_active = TRUE ORDER BY sort_order ASC",
    [product.id]
  );
  for (let t of templates) {
    const [fields] = await db.query(
      "SELECT * FROM product_personalization_fields WHERE template_id = ? AND status = 'active' ORDER BY sort_order ASC",
      [t.id]
    );
    t.fields = fields.map(f => ({ ...f, options: parseJSON(f.options) }));
  }
  product.templates = templates;

  const [reviews] = await db.query(
    `SELECT r.*, m.name as member_name FROM reviews r
     JOIN members m ON r.member_uid = m.member_uid
     WHERE r.product_uid = ? AND r.product_type = 'physical' ORDER BY r.created_at DESC`,
    [product.product_uid]
  );
  product.reviews = reviews;
  let [related] = await db.query(
    `SELECT product_uid as id, name, price, discount_price, images, rating, review_count
     FROM products WHERE category_id = ? AND product_uid != ? AND is_active = TRUE LIMIT 6`,
     [product.category_id, product.product_uid]
  );
  if (related.length === 0) {
    [related] = await db.query(
      `SELECT product_uid as id, name, price, discount_price, images, rating, review_count
       FROM products WHERE product_uid != ? AND is_active = TRUE LIMIT 6`,
       [product.product_uid]
    );
  }
  product.related = related.map(r => ({ ...r, images: parseJSON(r.images) }));
  res.json(product);
});

// ADMIN — get personalization settings
router.get("/admin/:id/personalization", verifyAdmin, async (req, res) => {
  try {
    const [products] = await db.query("SELECT id, enable_personalization, allow_multiple_templates FROM products WHERE id = ? OR product_uid = ?", [req.params.id, req.params.id]);
    if (!products.length) return res.status(404).json({ error: "Product not found" });
    const product = products[0];

    const [templates] = await db.query(
      "SELECT * FROM product_templates WHERE product_id = ? ORDER BY sort_order ASC",
      [product.id]
    );
    for (let t of templates) {
      const [fields] = await db.query(
        "SELECT * FROM product_personalization_fields WHERE template_id = ? ORDER BY sort_order ASC",
        [t.id]
      );
      t.fields = fields.map(f => ({ ...f, options: parseJSON(f.options) }));
    }
    
    res.json({
      enable_personalization: !!product.enable_personalization,
      allow_multiple_templates: !!product.allow_multiple_templates,
      templates
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch personalization settings" });
  }
});

// ADMIN — save personalization settings
router.post("/admin/:id/personalization", verifyAdmin, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { enable_personalization, allow_multiple_templates, templates } = req.body;
    
    // Resolve product ID
    const [products] = await connection.query("SELECT id FROM products WHERE id = ? OR product_uid = ?", [req.params.id, req.params.id]);
    if (!products.length) {
      await connection.rollback();
      return res.status(404).json({ error: "Product not found" });
    }
    const product_id = products[0].id;

    // Update products table
    await connection.query(
      "UPDATE products SET enable_personalization = ?, allow_multiple_templates = ? WHERE id = ?",
      [enable_personalization ? 1 : 0, allow_multiple_templates ? 1 : 0, product_id]
    );

    // Delete existing templates (which cascades to fields)
    await connection.query("DELETE FROM product_templates WHERE product_id = ?", [product_id]);

    if (enable_personalization && templates && templates.length) {
      for (const t of templates) {
        const [tempRes] = await connection.query(
          `INSERT INTO product_templates 
           (product_id, name, preview_image, background_image, is_active, sort_order) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [product_id, t.name, t.preview_image, t.background_image || null, t.is_active !== false ? 1 : 0, t.sort_order || 0]
        );
        const template_id = tempRes.insertId;

        if (t.fields && t.fields.length) {
          for (const f of t.fields) {
            await connection.query(
              `INSERT INTO product_personalization_fields 
               (template_id, label, field_key, type, is_required, placeholder, help_text, 
                min_chars, max_chars, default_value, sort_order, status, options,
                x_pos, y_pos, font_family, font_size, font_color, text_align, max_width, rotation) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                template_id,
                f.label,
                f.field_key,
                f.type,
                f.is_required ? 1 : 0,
                f.placeholder || null,
                f.help_text || null,
                f.min_chars !== undefined && f.min_chars !== "" ? parseInt(f.min_chars) : null,
                f.max_chars !== undefined && f.max_chars !== "" ? parseInt(f.max_chars) : null,
                f.default_value !== undefined ? String(f.default_value) : null,
                f.sort_order || 0,
                f.status || 'active',
                f.options ? JSON.stringify(f.options) : null,
                f.x_pos !== undefined && f.x_pos !== "" ? parseInt(f.x_pos) : null,
                f.y_pos !== undefined && f.y_pos !== "" ? parseInt(f.y_pos) : null,
                f.font_family || null,
                f.font_size !== undefined && f.font_size !== "" ? parseInt(f.font_size) : null,
                f.font_color || null,
                f.text_align || 'left',
                f.max_width !== undefined && f.max_width !== "" ? parseInt(f.max_width) : null,
                f.rotation !== undefined && f.rotation !== "" ? parseInt(f.rotation) : null
              ]
            );
          }
        }
      }
    }

    await connection.commit();
    res.json({ message: "Personalization settings saved successfully" });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: "Failed to save personalization settings" });
  } finally {
    connection.release();
  }
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