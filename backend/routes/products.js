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
const getProductsList = async (req, res) => {
  const { category, category_id, search, tag, sort, minPrice, maxPrice, minRating } = req.query;
  const catParam = req.params.slug || category_id || category;
  try {
    let sql = `SELECT p.*, c.name as category_name
               FROM products p
               LEFT JOIN categories c ON p.category_id = c.id
               WHERE p.is_active = TRUE`;
    const params = [];
    const isBestSellerFilter = catParam && [
      "best sellers",
      "best-sellers",
      "best seller",
      "best-seller",
      "⭐ best sellers"
    ].includes(String(catParam).trim().toLowerCase());

    if (isBestSellerFilter) {
      // Check if any products have the "Best Seller" tag
      const [tagCheck] = await db.query(
        "SELECT COUNT(*) as cnt FROM products WHERE is_active = TRUE AND (tags LIKE '%Best Seller%' OR tags LIKE '%best seller%')"
      ).catch(() => [[{ cnt: 0 }]]);
      const hasTaggedBestSellers = tagCheck && tagCheck[0] && tagCheck[0].cnt > 0;
      if (hasTaggedBestSellers) {
        sql += " AND (p.tags LIKE '%Best Seller%' OR p.tags LIKE '%best seller%')";
      }
    } else if (catParam && catParam !== "all" && catParam !== "All Products") {
      const cleanCat = String(catParam).trim();
      if (/^\d+$/.test(cleanCat)) {
        sql += " AND (p.category_id = ? OR c.id = ?)";
        params.push(parseInt(cleanCat, 10), parseInt(cleanCat, 10));
      } else {
        const decoded = decodeURIComponent(cleanCat);
        // Check if an exact match exists in categories table
        const [catCheck] = await db.query(
          "SELECT COUNT(*) as cnt FROM categories WHERE (LOWER(name) = LOWER(?) OR LOWER(REPLACE(name, ' ', '-')) = LOWER(?) OR LOWER(REPLACE(name, '-', ' ')) = LOWER(?))",
          [decoded, decoded, decoded]
        ).catch(() => [[{ cnt: 0 }]]);
        const hasExactCategory = catCheck && catCheck[0] && catCheck[0].cnt > 0;

        if (hasExactCategory) {
          sql += " AND (LOWER(c.name) = LOWER(?) OR LOWER(REPLACE(c.name, ' ', '-')) = LOWER(?) OR LOWER(REPLACE(c.name, '-', ' ')) = LOWER(?))";
          params.push(decoded, decoded, decoded);
        } else {
          // Flexible fallback: match keywords across category name, tags, or product name
          const stopWords = ["and", "for", "the", "collection", "products", "item", "items"];
          const keywords = decoded.toLowerCase().split(/[\s-]+/).filter(w => w.length > 2 && !stopWords.includes(w));
          if (keywords.length > 0) {
            const kwClauses = keywords.map(() => "(LOWER(c.name) LIKE ? OR LOWER(p.tags) LIKE ? OR LOWER(p.name) LIKE ?)").join(" OR ");
            sql += ` AND (${kwClauses})`;
            keywords.forEach(w => params.push(`%${w}%`, `%${w}%`, `%${w}%`));
          } else {
            sql += " AND (LOWER(c.name) = LOWER(?) OR LOWER(REPLACE(c.name, ' ', '-')) = LOWER(?))";
            params.push(decoded, decoded);
          }
        }
      }
    }
    if (search) { sql += " AND p.name LIKE ?"; params.push(`%${search}%`); }
    if (minPrice) { sql += " AND COALESCE(p.discount_price, p.price) >= ?"; params.push(minPrice); }
    if (maxPrice) { sql += " AND COALESCE(p.discount_price, p.price) <= ?"; params.push(maxPrice); }
    if (minRating) { sql += " AND p.rating >= ?"; params.push(minRating); }
    if (tag) {
      const cleanTag = String(tag).trim();
      if (cleanTag === "Best Seller" || cleanTag === "best-sellers" || cleanTag === "best-seller") {
        sql += " AND (p.tags LIKE '%Best Seller%' OR p.tags LIKE '%best seller%')";
      } else if (cleanTag === "New Arrival" || cleanTag === "new-arrival") {
        sql += " AND (p.tags LIKE '%New Arrival%' OR p.tags LIKE '%new arrival%')";
      } else if (cleanTag === "Limited Edition" || cleanTag === "limited-edition") {
        sql += " AND (p.tags LIKE '%Limited Edition%' OR p.tags LIKE '%limited edition%')";
      } else if (cleanTag === "Top Rated" || cleanTag === "top-rated") {
        sql += " AND (p.tags LIKE '%Top Rated%' OR p.tags LIKE '%top rated%' OR COALESCE(p.rating, 0) >= 4)";
      } else if (cleanTag === "Flash Sale" || cleanTag === "flash-sale") {
        sql += " AND (p.tags LIKE '%Flash Sale%' OR p.tags LIKE '%flash sale%' OR (p.discount_price IS NOT NULL AND p.discount_price > 0))";
      } else if (cleanTag === "Staff Pick" || cleanTag === "staff-pick") {
        sql += " AND (p.tags LIKE '%Staff Pick%' OR p.tags LIKE '%staff pick%')";
      } else {
        sql += " AND (p.tags LIKE ? OR p.tags LIKE ?)";
        params.push(`%"${cleanTag}"%`, `%${cleanTag}%`);
      }
    }
    if (sort === "price_asc") sql += " ORDER BY COALESCE(p.discount_price,p.price) ASC";
    else if (sort === "price_desc") sql += " ORDER BY COALESCE(p.discount_price,p.price) DESC";
    else if (sort === "rating" || isBestSellerFilter) {
      sql += " ORDER BY (CASE WHEN p.tags LIKE '%Best Seller%' OR p.tags LIKE '%best seller%' THEN 1 ELSE 0 END) DESC, COALESCE(p.rating, 0) DESC, p.created_at DESC";
    }
    else sql += " ORDER BY p.created_at DESC";
    
    let [rows] = await db.query(sql, params).catch(err => {
      console.error("Products query error:", err);
      return [[]];
    });
    if (!rows || !rows.length) {
      // Fallback query on physical_products if legacy table exists
      try {
        let physSql = "SELECT * FROM physical_products WHERE 1=1";
        const physParams = [];
        if (catParam && catParam !== "all" && catParam !== "All Products" && !isBestSellerFilter) {
          physSql += " AND (category = ? OR category_id = ?)";
          physParams.push(catParam, catParam);
        }
        if (search) { physSql += " AND name LIKE ?"; physParams.push(`%${search}%`); }
        if (tag) { physSql += " AND tags LIKE ?"; physParams.push(`%${tag}%`); }
        if (isBestSellerFilter) {
          const [physTagCheck] = await db.query(
            "SELECT COUNT(*) as cnt FROM physical_products WHERE (tags LIKE '%Best Seller%' OR tags LIKE '%best seller%')"
          ).catch(() => [[{ cnt: 0 }]]);
          if (physTagCheck && physTagCheck[0] && physTagCheck[0].cnt > 0) {
            physSql += " AND (tags LIKE '%Best Seller%' OR tags LIKE '%best seller%')";
          }
          physSql += " ORDER BY (CASE WHEN tags LIKE '%Best Seller%' OR tags LIKE '%best seller%' THEN 1 ELSE 0 END) DESC, COALESCE(rating, 0) DESC, id DESC";
        } else {
          physSql += " ORDER BY id DESC";
        }
        const [pRows] = await db.query(physSql, physParams);
        if (pRows && pRows.length) rows = pRows;
      } catch {
        // Ignore if physical_products doesn't exist
      }
      if (!rows) rows = [];
    }

    res.json(rows.map(r => ({ ...r, images: parseJSON(r.images), sizes: parseJSON(r.sizes), tags: parseJSON(r.tags) })));
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

router.get("/", getProductsList);
router.get("/category/:slug", getProductsList);

// PUBLIC — single product
router.get("/:id", async (req, res) => {
  try {
    let [rows] = await db.query(
      `SELECT p.*, c.name as category_name
       FROM products p LEFT JOIN categories c ON p.category_id = c.id
       WHERE (p.product_uid = ? OR p.id = ?) AND p.is_active = TRUE`, [req.params.id, req.params.id]
    );

    if (!rows.length) {
      const [physRows] = await db.query(
        "SELECT * FROM physical_products WHERE (product_uid = ? OR id = ?) AND is_active = TRUE",
        [req.params.id, req.params.id]
      );
      rows = physRows;
    }

    if (!rows.length) return res.status(404).json({ error: "Not found" });
    const product = { ...rows[0], images: parseJSON(rows[0].images), sizes: parseJSON(rows[0].sizes), tags: parseJSON(rows[0].tags) };
    
    // Load personalization templates and fields
    const [templates] = await db.query(
      "SELECT * FROM product_templates WHERE product_id = ? AND is_active = TRUE ORDER BY sort_order ASC",
      [product.id]
    ).catch(() => [[]]);

    for (let t of (templates || [])) {
      const [fields] = await db.query(
        "SELECT * FROM product_personalization_fields WHERE template_id = ? AND status = 'active' ORDER BY sort_order ASC",
        [t.id]
      ).catch(() => [[]]);
      t.fields = (fields || []).map(f => ({ ...f, options: parseJSON(f.options) }));
    }
    product.templates = templates || [];
    res.json(product);
  } catch (err) {
    console.error("Error fetching product detail:", err);
    res.status(500).json({ error: "Failed to fetch product details" });
  }
});

// PUBLIC — GET /api/products/:id/related (Feature 5)
router.get("/:id/related", async (req, res) => {
  try {
    const [pRows] = await db.query(
      "SELECT id, category, category_id FROM physical_products WHERE id = ? OR product_uid = ?",
      [req.params.id, req.params.id]
    );

    const currentId = pRows.length ? pRows[0].id : req.params.id;
    const category = pRows.length ? pRows[0].category : null;

    let query = "SELECT * FROM physical_products WHERE is_active = TRUE AND id != ?";
    let params = [currentId];

    if (category) {
      query += " AND category = ?";
      params.push(category);
    }

    query += " ORDER BY created_at DESC LIMIT 4";
    let [rows] = await db.query(query, params);

    // Fallback if less than 4 category matches
    if (rows.length < 4) {
      const [fallbackRows] = await db.query(
        "SELECT * FROM physical_products WHERE is_active = TRUE AND id != ? ORDER BY created_at DESC LIMIT 4",
        [currentId]
      );
      rows = fallbackRows;
    }

    res.json(rows);
  } catch (err) {
    console.error("Error fetching related products:", err);
    res.status(500).json({ error: "Failed to fetch related products" });
  }
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
  try {
    let [rows] = await db.query(
      `SELECT p.*, c.name as category_name FROM products p
       LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.id DESC`
    ).catch(() => [[]]);

    let [physRows] = await db.query(
      "SELECT *, category as category_name FROM physical_products ORDER BY id DESC"
    ).catch(() => [[]]);

    const combined = [...(rows || []), ...(physRows || [])];
    res.json(combined.map(r => ({ ...r, images: parseJSON(r.images), sizes: parseJSON(r.sizes), tags: parseJSON(r.tags) })));
  } catch (err) {
    console.error("Error fetching admin all products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
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