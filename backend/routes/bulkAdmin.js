const router = require("express").Router();
const multer = require("multer");
const db = require("../db");
const { verifyAdmin } = require("../middleware/auth");
const { parseCsvFile, validateRequired, generateSlug, buildCsv } = require("../utils/csvBulkHelper");

// Memory storage for CSV and HTML file parsing
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
});

const MAX_ROWS = 500;

function generateProductUid() {
  const uniqueId = Math.floor(100000 + Math.random() * 900000);
  return `PRD-${uniqueId}`;
}

function generateDigitalProductUid() {
  const uniqueId = Math.floor(100000 + Math.random() * 900000);
  return `DPD-${uniqueId}`;
}

/**
 * Helper to resolve or create category by name
 */
async function resolveCategoryId(categoryName, type = "physical") {
  if (!categoryName || !String(categoryName).trim()) return null;
  const name = String(categoryName).trim();
  try {
    const [rows] = await db.query("SELECT id FROM categories WHERE LOWER(name) = LOWER(?) LIMIT 1", [name]);
    if (rows && rows.length) return rows[0].id;
    // Auto-create category if missing
    const [res] = await db.query(
      "INSERT INTO categories (name, type, description) VALUES (?, ?, ?)",
      [name, type, `${name} collection`]
    );
    return res.insertId || null;
  } catch (err) {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FEATURE 1 & 5 & 6 — PHYSICAL PRODUCTS
// ═══════════════════════════════════════════════════════════════════════════

// 1. Template Download
router.get("/products/physical/template", (req, res) => {
  const content = [
    "# INSTRUCTIONS: Fill each row as one product.",
    "# status: published or draft",
    "# is_featured: true or false",
    "# price and compare_price: numbers only no ₹ sign",
    "# weight in grams, dimensions in cm",
    "# Do not change column headers",
    "# Delete these instruction rows before uploading",
    "name,description,price,compare_price,category,stock_quantity,sku,weight_grams,length_cm,width_cm,height_cm,meta_title,meta_description,tags,is_featured,status",
    '"Custom Printed Mug","High quality ceramic mug with custom print. Dishwasher safe.",299,399,"Mugs",100,"MUG-001",350,10,8,10,"Custom Printed Mug - Olive Seeds Studio","Buy custom printed mugs online","mug,custom,gift",false,published',
    '"Personalised T-Shirt","100% cotton t-shirt with your custom design printed.",599,799,"T-Shirts",50,"TSH-001",200,30,25,2,"Personalised T-Shirt - Olive Seeds Studio","Custom printed t-shirts for every occasion","tshirt,custom,personalised",true,published',
  ].join("\r\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="physical_products_template.csv"');
  res.status(200).send(content);
});

// 2. Bulk CSV Upload
router.post("/products/physical/bulk-upload", verifyAdmin, upload.single("file"), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "Please upload a valid CSV file" });
    }

    const records = parseCsvFile(req.file.buffer);
    if (!records.length) {
      return res.status(400).json({ error: "No product rows found in CSV (or all rows were comments)" });
    }

    if (records.length > MAX_ROWS) {
      return res.status(400).json({ error: `Upload exceeds maximum allowed limit of ${MAX_ROWS} rows` });
    }

    let successCount = 0;
    const errors = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNum = i + 1; // 1-indexed row

      // Validation
      if (!row.name || !String(row.name).trim()) {
        errors.push({ row: rowNum, error: "Product name is required" });
        continue;
      }

      const rawPrice = parseFloat(String(row.price || "").replace(/[^0-9.]/g, ""));
      if (isNaN(rawPrice) || rawPrice < 0) {
        errors.push({ row: rowNum, error: "Valid price is required" });
        continue;
      }

      let stock = 0;
      if (row.stock_quantity !== undefined && row.stock_quantity !== null && String(row.stock_quantity).trim() !== "") {
        const parsedStock = parseInt(String(row.stock_quantity).replace(/[^0-9-]/g, ""), 10);
        if (isNaN(parsedStock)) {
          errors.push({ row: rowNum, error: "Stock quantity must be a valid number" });
          continue;
        }
        stock = parsedStock;
      }

      const status = String(row.status || "published").trim().toLowerCase();
      if (status && !["published", "draft", "active", "inactive"].includes(status)) {
        errors.push({ row: rowNum, error: "Status must be 'published' or 'draft'" });
        continue;
      }

      const isActive = status === "published" || status === "active" ? 1 : 0;
      const categoryId = await resolveCategoryId(row.category, "physical");

      let price = rawPrice;
      let discountPrice = null;
      if (row.compare_price && !isNaN(parseFloat(String(row.compare_price).replace(/[^0-9.]/g, "")))) {
        const comp = parseFloat(String(row.compare_price).replace(/[^0-9.]/g, ""));
        if (comp > rawPrice) {
          price = comp;
          discountPrice = rawPrice;
        } else if (comp < rawPrice && comp > 0) {
          discountPrice = comp;
        }
      }

      const finalUid = row.sku && String(row.sku).trim() ? String(row.sku).trim() : generateProductUid();
      const tagsArray = row.tags
        ? String(row.tags)
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      try {
        await db.query(
          `INSERT INTO products 
           (product_uid, name, description, price, discount_price, category_id, stock, tags, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            finalUid,
            String(row.name).trim(),
            row.description || "",
            price,
            discountPrice,
            categoryId,
            stock,
            JSON.stringify(tagsArray),
            isActive,
          ]
        );
        successCount++;
      } catch (insertErr) {
        errors.push({ row: rowNum, error: insertErr.message || "Failed to insert product" });
      }
    }

    res.json({
      success: successCount,
      errors: errors,
      total: records.length,
    });
  } catch (err) {
    console.error("Physical bulk upload error:", err);
    res.status(500).json({ error: "Failed to process bulk upload: " + err.message });
  }
});

// 3. Export All as CSV
router.get("/products/physical/export", verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       ORDER BY p.id DESC`
    );

    const headers = [
      "id",
      "name",
      "description",
      "price",
      "compare_price",
      "category",
      "stock_quantity",
      "sku",
      "weight_grams",
      "length_cm",
      "width_cm",
      "height_cm",
      "meta_title",
      "meta_description",
      "tags",
      "is_featured",
      "status",
    ];

    const exportRows = rows.map((p) => {
      let tagsStr = "";
      if (Array.isArray(p.tags)) tagsStr = p.tags.join(",");
      else if (typeof p.tags === "string") {
        try {
          const parsed = JSON.parse(p.tags);
          tagsStr = Array.isArray(parsed) ? parsed.join(",") : p.tags;
        } catch {
          tagsStr = p.tags;
        }
      }

      return {
        id: p.id,
        name: p.name || "",
        description: p.description || "",
        price: p.discount_price ? p.discount_price : p.price,
        compare_price: p.discount_price ? p.price : "",
        category: p.category_name || "",
        stock_quantity: p.stock || 0,
        sku: p.product_uid || "",
        weight_grams: "",
        length_cm: "",
        width_cm: "",
        height_cm: "",
        meta_title: p.name ? `${p.name} - Olive Seeds Studio` : "",
        meta_description: p.description ? p.description.slice(0, 150) : "",
        tags: tagsStr,
        is_featured: false,
        status: p.is_active ? "published" : "draft",
      };
    });

    const csvData = buildCsv(headers, exportRows);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="physical_products.csv"');
    res.status(200).send(csvData);
  } catch (err) {
    console.error("Physical products export error:", err);
    res.status(500).json({ error: "Failed to export physical products" });
  }
});

// 4. Bulk Update
router.post("/products/physical/bulk-update", verifyAdmin, upload.single("file"), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "Please upload a valid CSV file" });
    }

    const records = parseCsvFile(req.file.buffer);
    if (!records.length) {
      return res.status(400).json({ error: "No product rows found in CSV" });
    }

    if (records.length > MAX_ROWS) {
      return res.status(400).json({ error: `Upload exceeds limit of ${MAX_ROWS} rows` });
    }

    let updatedCount = 0;
    let createdCount = 0;
    const errors = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNum = i + 1;

      if (!row.name || !String(row.name).trim()) {
        errors.push({ row: rowNum, error: "Product name is required" });
        continue;
      }

      const rawPrice = parseFloat(String(row.price || "").replace(/[^0-9.]/g, ""));
      if (isNaN(rawPrice) || rawPrice < 0) {
        errors.push({ row: rowNum, error: "Valid price is required" });
        continue;
      }

      const stock = parseInt(String(row.stock_quantity || 0).replace(/[^0-9-]/g, ""), 10) || 0;
      const status = String(row.status || "published").trim().toLowerCase();
      const isActive = status === "published" || status === "active" ? 1 : 0;
      const categoryId = await resolveCategoryId(row.category, "physical");

      let price = rawPrice;
      let discountPrice = null;
      if (row.compare_price && !isNaN(parseFloat(String(row.compare_price).replace(/[^0-9.]/g, "")))) {
        const comp = parseFloat(String(row.compare_price).replace(/[^0-9.]/g, ""));
        if (comp > rawPrice) {
          price = comp;
          discountPrice = rawPrice;
        } else if (comp < rawPrice && comp > 0) {
          discountPrice = comp;
        }
      }

      const tagsArray = row.tags
        ? String(row.tags)
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      const existingId = row.id ? parseInt(String(row.id).trim(), 10) : null;

      try {
        if (existingId && !isNaN(existingId)) {
          const [check] = await db.query("SELECT id FROM products WHERE id = ?", [existingId]);
          if (check.length > 0) {
            await db.query(
              `UPDATE products SET 
               name = ?, description = ?, price = ?, discount_price = ?, 
               category_id = ?, stock = ?, tags = ?, is_active = ? 
               WHERE id = ?`,
              [
                String(row.name).trim(),
                row.description || "",
                price,
                discountPrice,
                categoryId,
                stock,
                JSON.stringify(tagsArray),
                isActive,
                existingId,
              ]
            );
            updatedCount++;
            continue;
          }
        }

        // Insert new product if no ID or ID not found
        const finalUid = row.sku && String(row.sku).trim() ? String(row.sku).trim() : generateProductUid();
        await db.query(
          `INSERT INTO products 
           (product_uid, name, description, price, discount_price, category_id, stock, tags, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            finalUid,
            String(row.name).trim(),
            row.description || "",
            price,
            discountPrice,
            categoryId,
            stock,
            JSON.stringify(tagsArray),
            isActive,
          ]
        );
        createdCount++;
      } catch (err) {
        errors.push({ row: rowNum, error: err.message || "Operation failed" });
      }
    }

    res.json({
      success: updatedCount + createdCount,
      updated: updatedCount,
      created: createdCount,
      errors: errors,
      total: records.length,
    });
  } catch (err) {
    console.error("Physical bulk update error:", err);
    res.status(500).json({ error: "Failed to process bulk update: " + err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// FEATURE 2 & 5 & 6 — DIGITAL PRODUCTS
// ═══════════════════════════════════════════════════════════════════════════

// 1. Template Download
router.get("/products/digital/template", (req, res) => {
  const content = [
    "# INSTRUCTIONS: Fill each row as one product.",
    "# file_url: direct URL to downloadable file",
    "# file_type: PDF, PNG, SVG, ZIP, PSD, AI etc",
    "# file_size_mb: number only e.g. 2.5",
    "# download_limit: max downloads per purchase (0 = unlimited)",
    "# status: published or draft",
    "# Do not change column headers",
    "# Delete instruction rows before uploading",
    "name,description,price,compare_price,category,file_url,file_type,file_size_mb,preview_image_url,download_limit,meta_title,meta_description,tags,is_featured,status",
    '"Logo Design Pack","10 unique logo designs in SVG and PNG format",499,699,"Design Packs","https://files.example.com/pack1.zip","ZIP",45.5,"https://images.example.com/prev1.jpg",0,"Logo Design Pack Download","Download professional logo designs","logo,design,svg",true,published',
  ].join("\r\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="digital_products_template.csv"');
  res.status(200).send(content);
});

// 2. Bulk CSV Upload
router.post("/products/digital/bulk-upload", verifyAdmin, upload.single("file"), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "Please upload a valid CSV file" });
    }

    const records = parseCsvFile(req.file.buffer);
    if (!records.length) {
      return res.status(400).json({ error: "No product rows found in CSV" });
    }

    if (records.length > MAX_ROWS) {
      return res.status(400).json({ error: `Upload exceeds limit of ${MAX_ROWS} rows` });
    }

    let successCount = 0;
    const errors = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNum = i + 1;

      if (!row.name || !String(row.name).trim()) {
        errors.push({ row: rowNum, error: "Product name is required" });
        continue;
      }

      const rawPrice = parseFloat(String(row.price || "").replace(/[^0-9.]/g, ""));
      if (isNaN(rawPrice) || rawPrice < 0) {
        errors.push({ row: rowNum, error: "Valid price is required" });
        continue;
      }

      const fileUrl = String(row.file_url || "").trim();
      if (!fileUrl) {
        errors.push({ row: rowNum, error: "file_url is required" });
        continue;
      }
      if (!fileUrl.startsWith("http://") && !fileUrl.startsWith("https://") && !fileUrl.startsWith("/uploads/")) {
        errors.push({ row: rowNum, error: "file_url must be a valid URL (http://, https://, or /uploads/...)" });
        continue;
      }

      const fileType = String(row.file_type || "").trim();
      if (!fileType) {
        errors.push({ row: rowNum, error: "file_type is required (e.g. ZIP, PDF, PNG)" });
        continue;
      }

      const status = String(row.status || "published").trim().toLowerCase();
      if (status && !["published", "draft", "active", "inactive"].includes(status)) {
        errors.push({ row: rowNum, error: "Status must be 'published' or 'draft'" });
        continue;
      }

      const isActive = status === "published" || status === "active" ? 1 : 0;
      const categoryId = await resolveCategoryId(row.category, "digital");

      let price = rawPrice;
      let discountPrice = null;
      if (row.compare_price && !isNaN(parseFloat(String(row.compare_price).replace(/[^0-9.]/g, "")))) {
        const comp = parseFloat(String(row.compare_price).replace(/[^0-9.]/g, ""));
        if (comp > rawPrice) {
          price = comp;
          discountPrice = rawPrice;
        } else if (comp < rawPrice && comp > 0) {
          discountPrice = comp;
        }
      }

      const finalUid = generateDigitalProductUid();
      const tagsArray = row.tags
        ? String(row.tags)
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      const fileSizeStr = row.file_size_mb ? `${row.file_size_mb} MB` : null;

      try {
        await db.query(
          `INSERT INTO digital_products 
           (product_uid, name, description, price, discount_price, category_id, file_url, thumbnail_url, file_size, file_format, tags, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            finalUid,
            String(row.name).trim(),
            row.description || "",
            price,
            discountPrice,
            categoryId,
            fileUrl,
            row.preview_image_url || null,
            fileSizeStr,
            fileType,
            JSON.stringify(tagsArray),
            isActive,
          ]
        );
        successCount++;
      } catch (err) {
        errors.push({ row: rowNum, error: err.message || "Failed to insert digital product" });
      }
    }

    res.json({
      success: successCount,
      errors: errors,
      total: records.length,
    });
  } catch (err) {
    console.error("Digital bulk upload error:", err);
    res.status(500).json({ error: "Failed to process digital bulk upload: " + err.message });
  }
});

// 3. Export All as CSV
router.get("/products/digital/export", verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT d.*, c.name as category_name 
       FROM digital_products d 
       LEFT JOIN categories c ON d.category_id = c.id 
       ORDER BY d.id DESC`
    );

    const headers = [
      "id",
      "name",
      "description",
      "price",
      "compare_price",
      "category",
      "file_url",
      "file_type",
      "file_size_mb",
      "preview_image_url",
      "download_limit",
      "meta_title",
      "meta_description",
      "tags",
      "is_featured",
      "status",
    ];

    const exportRows = rows.map((d) => {
      let tagsStr = "";
      if (Array.isArray(d.tags)) tagsStr = d.tags.join(",");
      else if (typeof d.tags === "string") {
        try {
          const parsed = JSON.parse(d.tags);
          tagsStr = Array.isArray(parsed) ? parsed.join(",") : d.tags;
        } catch {
          tagsStr = d.tags;
        }
      }

      const sizeNum = d.file_size ? d.file_size.replace(/[^0-9.]/g, "") : "";

      return {
        id: d.id,
        name: d.name || "",
        description: d.description || "",
        price: d.discount_price ? d.discount_price : d.price,
        compare_price: d.discount_price ? d.price : "",
        category: d.category_name || "",
        file_url: d.file_url || "",
        file_type: d.file_format || "ZIP",
        file_size_mb: sizeNum,
        preview_image_url: d.thumbnail_url || "",
        download_limit: 0,
        meta_title: d.name ? `${d.name} Download` : "",
        meta_description: d.description ? d.description.slice(0, 150) : "",
        tags: tagsStr,
        is_featured: false,
        status: d.is_active ? "published" : "draft",
      };
    });

    const csvData = buildCsv(headers, exportRows);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="digital_products.csv"');
    res.status(200).send(csvData);
  } catch (err) {
    console.error("Digital products export error:", err);
    res.status(500).json({ error: "Failed to export digital products" });
  }
});

// 4. Bulk Update
router.post("/products/digital/bulk-update", verifyAdmin, upload.single("file"), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "Please upload a valid CSV file" });
    }

    const records = parseCsvFile(req.file.buffer);
    if (!records.length) {
      return res.status(400).json({ error: "No product rows found in CSV" });
    }

    if (records.length > MAX_ROWS) {
      return res.status(400).json({ error: `Upload exceeds limit of ${MAX_ROWS} rows` });
    }

    let updatedCount = 0;
    let createdCount = 0;
    const errors = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNum = i + 1;

      if (!row.name || !String(row.name).trim()) {
        errors.push({ row: rowNum, error: "Product name is required" });
        continue;
      }

      const rawPrice = parseFloat(String(row.price || "").replace(/[^0-9.]/g, ""));
      if (isNaN(rawPrice) || rawPrice < 0) {
        errors.push({ row: rowNum, error: "Valid price is required" });
        continue;
      }

      const fileUrl = String(row.file_url || "").trim();
      if (!fileUrl) {
        errors.push({ row: rowNum, error: "file_url is required" });
        continue;
      }

      const fileType = String(row.file_type || "").trim() || "ZIP";
      const status = String(row.status || "published").trim().toLowerCase();
      const isActive = status === "published" || status === "active" ? 1 : 0;
      const categoryId = await resolveCategoryId(row.category, "digital");

      let price = rawPrice;
      let discountPrice = null;
      if (row.compare_price && !isNaN(parseFloat(String(row.compare_price).replace(/[^0-9.]/g, "")))) {
        const comp = parseFloat(String(row.compare_price).replace(/[^0-9.]/g, ""));
        if (comp > rawPrice) {
          price = comp;
          discountPrice = rawPrice;
        } else if (comp < rawPrice && comp > 0) {
          discountPrice = comp;
        }
      }

      const tagsArray = row.tags
        ? String(row.tags)
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];
      const fileSizeStr = row.file_size_mb ? `${row.file_size_mb} MB` : null;
      const existingId = row.id ? parseInt(String(row.id).trim(), 10) : null;

      try {
        if (existingId && !isNaN(existingId)) {
          const [check] = await db.query("SELECT id FROM digital_products WHERE id = ?", [existingId]);
          if (check.length > 0) {
            await db.query(
              `UPDATE digital_products SET 
               name = ?, description = ?, price = ?, discount_price = ?, category_id = ?, 
               file_url = ?, thumbnail_url = ?, file_size = ?, file_format = ?, tags = ?, is_active = ? 
               WHERE id = ?`,
              [
                String(row.name).trim(),
                row.description || "",
                price,
                discountPrice,
                categoryId,
                fileUrl,
                row.preview_image_url || null,
                fileSizeStr,
                fileType,
                JSON.stringify(tagsArray),
                isActive,
                existingId,
              ]
            );
            updatedCount++;
            continue;
          }
        }

        const finalUid = generateDigitalProductUid();
        await db.query(
          `INSERT INTO digital_products 
           (product_uid, name, description, price, discount_price, category_id, file_url, thumbnail_url, file_size, file_format, tags, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            finalUid,
            String(row.name).trim(),
            row.description || "",
            price,
            discountPrice,
            categoryId,
            fileUrl,
            row.preview_image_url || null,
            fileSizeStr,
            fileType,
            JSON.stringify(tagsArray),
            isActive,
          ]
        );
        createdCount++;
      } catch (err) {
        errors.push({ row: rowNum, error: err.message || "Operation failed" });
      }
    }

    res.json({
      success: updatedCount + createdCount,
      updated: updatedCount,
      created: createdCount,
      errors: errors,
      total: records.length,
    });
  } catch (err) {
    console.error("Digital bulk update error:", err);
    res.status(500).json({ error: "Failed to process digital bulk update: " + err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// FEATURE 3 & 5 & 6 — ENGRAVED PRODUCTS
// ═══════════════════════════════════════════════════════════════════════════

// 1. Template Download
router.get("/products/engraved/template", (req, res) => {
  const content = [
    "# INSTRUCTIONS: Fill each row as one product.",
    "# allows_custom_text: true or false",
    "# allows_logo_upload: true or false",
    "# max_text_characters: number (0 = no limit)",
    "# engrave_area_cm: e.g. 5x3 (width x height)",
    "# material: Wood, Metal, Glass, Leather etc",
    "# Do not change column headers",
    "# Delete instruction rows before uploading",
    "name,description,price,compare_price,category,stock_quantity,sku,material,engrave_area_cm,allows_custom_text,allows_logo_upload,max_text_characters,weight_grams,meta_title,meta_description,tags,is_featured,status",
    '"Engraved Wooden Keychain","Personalised wooden keychain with custom text or logo engraving",199,299,"Keychains",200,"KCH-001","Wood","3x2",true,true,30,20,"Engraved Wooden Keychain - Custom","Personalised engraved keychains","keychain,engraved,wood,gift",false,published',
  ].join("\r\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="engraved_products_template.csv"');
  res.status(200).send(content);
});

// 2. Bulk CSV Upload
router.post("/products/engraved/bulk-upload", verifyAdmin, upload.single("file"), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "Please upload a valid CSV file" });
    }

    const records = parseCsvFile(req.file.buffer);
    if (!records.length) {
      return res.status(400).json({ error: "No product rows found in CSV" });
    }

    if (records.length > MAX_ROWS) {
      return res.status(400).json({ error: `Upload exceeds limit of ${MAX_ROWS} rows` });
    }

    let successCount = 0;
    const errors = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNum = i + 1;

      if (!row.name || !String(row.name).trim()) {
        errors.push({ row: rowNum, error: "Product name is required" });
        continue;
      }

      const rawPrice = parseFloat(String(row.price || "").replace(/[^0-9.]/g, ""));
      if (isNaN(rawPrice) || rawPrice < 0) {
        errors.push({ row: rowNum, error: "Valid price is required" });
        continue;
      }

      const stock = parseInt(String(row.stock_quantity || 0).replace(/[^0-9-]/g, ""), 10) || 0;
      const status = String(row.status || "published").trim().toLowerCase();
      const isActive = status === "published" || status === "active" ? 1 : 0;
      const categoryId = await resolveCategoryId(row.category, "physical");

      let price = rawPrice;
      let discountPrice = null;
      if (row.compare_price && !isNaN(parseFloat(String(row.compare_price).replace(/[^0-9.]/g, "")))) {
        const comp = parseFloat(String(row.compare_price).replace(/[^0-9.]/g, ""));
        if (comp > rawPrice) {
          price = comp;
          discountPrice = rawPrice;
        } else if (comp < rawPrice && comp > 0) {
          discountPrice = comp;
        }
      }

      const finalUid = row.sku && String(row.sku).trim() ? String(row.sku).trim() : generateProductUid();
      const tagsArray = row.tags
        ? String(row.tags)
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : ["Engraved", "Custom"];

      const allowsText = String(row.allows_custom_text).toLowerCase() === "true" || row.allows_custom_text === "1";
      const allowsLogo = String(row.allows_logo_upload).toLowerCase() === "true" || row.allows_logo_upload === "1";
      const maxChars = parseInt(String(row.max_text_characters || 0).replace(/[^0-9]/g, ""), 10) || 0;

      try {
        const [res] = await db.query(
          `INSERT INTO products 
           (product_uid, name, description, price, discount_price, category_id, stock, tags, is_active, enable_personalization, allow_multiple_templates)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)`,
          [
            finalUid,
            String(row.name).trim(),
            row.description || "",
            price,
            discountPrice,
            categoryId,
            stock,
            JSON.stringify(tagsArray),
            isActive,
          ]
        );

        const insertedProductId = res.insertId;

        // Auto-configure engraving template if text or logo allowed
        if (allowsText || allowsLogo) {
          const [tRes] = await db.query(
            `INSERT INTO product_templates (product_id, name, preview_image, is_active, sort_order)
             VALUES (?, 'Default Engraving', '', 1, 0)`,
            [insertedProductId]
          );
          const templateId = tRes.insertId;

          if (allowsText) {
            await db.query(
              `INSERT INTO product_personalization_fields 
               (template_id, label, field_key, type, is_required, placeholder, help_text, max_chars, sort_order, status)
               VALUES (?, 'Custom Engraving Text', 'engraving_text', 'text', 0, 'Enter name or text to engrave', 'Maximum characters as specified', ?, 0, 'active')`,
              [templateId, maxChars || null]
            );
          }
          if (allowsLogo) {
            await db.query(
              `INSERT INTO product_personalization_fields 
               (template_id, label, field_key, type, is_required, placeholder, help_text, sort_order, status)
               VALUES (?, 'Upload Custom Logo / Artwork', 'engraving_logo', 'image', 0, 'Upload black & white PNG/SVG/JPEG', 'High resolution file recommended', 1, 'active')`,
              [templateId]
            );
          }
        }

        successCount++;
      } catch (err) {
        errors.push({ row: rowNum, error: err.message || "Failed to insert engraved product" });
      }
    }

    res.json({
      success: successCount,
      errors: errors,
      total: records.length,
    });
  } catch (err) {
    console.error("Engraved bulk upload error:", err);
    res.status(500).json({ error: "Failed to process engraved bulk upload: " + err.message });
  }
});

// 3. Export All as CSV
router.get("/products/engraved/export", verifyAdmin, async (req, res) => {
  try {
    let [rows] = await db.query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.enable_personalization = 1 
       ORDER BY p.id DESC`
    );

    if (!rows.length) {
      // Fallback: export all products if none explicitly marked enable_personalization
      const [allRows] = await db.query(
        `SELECT p.*, c.name as category_name 
         FROM products p 
         LEFT JOIN categories c ON p.category_id = c.id 
         ORDER BY p.id DESC`
      );
      rows = allRows;
    }

    const headers = [
      "id",
      "name",
      "description",
      "price",
      "compare_price",
      "category",
      "stock_quantity",
      "sku",
      "material",
      "engrave_area_cm",
      "allows_custom_text",
      "allows_logo_upload",
      "max_text_characters",
      "weight_grams",
      "meta_title",
      "meta_description",
      "tags",
      "is_featured",
      "status",
    ];

    const exportRows = rows.map((p) => {
      let tagsStr = "";
      if (Array.isArray(p.tags)) tagsStr = p.tags.join(",");
      else if (typeof p.tags === "string") {
        try {
          const parsed = JSON.parse(p.tags);
          tagsStr = Array.isArray(parsed) ? parsed.join(",") : p.tags;
        } catch {
          tagsStr = p.tags;
        }
      }

      return {
        id: p.id,
        name: p.name || "",
        description: p.description || "",
        price: p.discount_price ? p.discount_price : p.price,
        compare_price: p.discount_price ? p.price : "",
        category: p.category_name || "",
        stock_quantity: p.stock || 0,
        sku: p.product_uid || "",
        material: "Wood",
        engrave_area_cm: "5x3",
        allows_custom_text: true,
        allows_logo_upload: true,
        max_text_characters: 50,
        weight_grams: "",
        meta_title: p.name ? `${p.name} - Custom Laser Engraved` : "",
        meta_description: p.description ? p.description.slice(0, 150) : "",
        tags: tagsStr,
        is_featured: false,
        status: p.is_active ? "published" : "draft",
      };
    });

    const csvData = buildCsv(headers, exportRows);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="engraved_products.csv"');
    res.status(200).send(csvData);
  } catch (err) {
    console.error("Engraved products export error:", err);
    res.status(500).json({ error: "Failed to export engraved products" });
  }
});

// 4. Bulk Update
router.post("/products/engraved/bulk-update", verifyAdmin, upload.single("file"), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "Please upload a valid CSV file" });
    }

    const records = parseCsvFile(req.file.buffer);
    if (!records.length) {
      return res.status(400).json({ error: "No product rows found in CSV" });
    }

    if (records.length > MAX_ROWS) {
      return res.status(400).json({ error: `Upload exceeds limit of ${MAX_ROWS} rows` });
    }

    let updatedCount = 0;
    let createdCount = 0;
    const errors = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNum = i + 1;

      if (!row.name || !String(row.name).trim()) {
        errors.push({ row: rowNum, error: "Product name is required" });
        continue;
      }

      const rawPrice = parseFloat(String(row.price || "").replace(/[^0-9.]/g, ""));
      if (isNaN(rawPrice) || rawPrice < 0) {
        errors.push({ row: rowNum, error: "Valid price is required" });
        continue;
      }

      const stock = parseInt(String(row.stock_quantity || 0).replace(/[^0-9-]/g, ""), 10) || 0;
      const status = String(row.status || "published").trim().toLowerCase();
      const isActive = status === "published" || status === "active" ? 1 : 0;
      const categoryId = await resolveCategoryId(row.category, "physical");

      let price = rawPrice;
      let discountPrice = null;
      if (row.compare_price && !isNaN(parseFloat(String(row.compare_price).replace(/[^0-9.]/g, "")))) {
        const comp = parseFloat(String(row.compare_price).replace(/[^0-9.]/g, ""));
        if (comp > rawPrice) {
          price = comp;
          discountPrice = rawPrice;
        } else if (comp < rawPrice && comp > 0) {
          discountPrice = comp;
        }
      }

      const tagsArray = row.tags
        ? String(row.tags)
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : ["Engraved", "Custom"];
      const existingId = row.id ? parseInt(String(row.id).trim(), 10) : null;

      try {
        if (existingId && !isNaN(existingId)) {
          const [check] = await db.query("SELECT id FROM products WHERE id = ?", [existingId]);
          if (check.length > 0) {
            await db.query(
              `UPDATE products SET 
               name = ?, description = ?, price = ?, discount_price = ?, 
               category_id = ?, stock = ?, tags = ?, is_active = ?, enable_personalization = 1 
               WHERE id = ?`,
              [
                String(row.name).trim(),
                row.description || "",
                price,
                discountPrice,
                categoryId,
                stock,
                JSON.stringify(tagsArray),
                isActive,
                existingId,
              ]
            );
            updatedCount++;
            continue;
          }
        }

        const finalUid = row.sku && String(row.sku).trim() ? String(row.sku).trim() : generateProductUid();
        await db.query(
          `INSERT INTO products 
           (product_uid, name, description, price, discount_price, category_id, stock, tags, is_active, enable_personalization)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          [
            finalUid,
            String(row.name).trim(),
            row.description || "",
            price,
            discountPrice,
            categoryId,
            stock,
            JSON.stringify(tagsArray),
            isActive,
          ]
        );
        createdCount++;
      } catch (err) {
        errors.push({ row: rowNum, error: err.message || "Operation failed" });
      }
    }

    res.json({
      success: updatedCount + createdCount,
      updated: updatedCount,
      created: createdCount,
      errors: errors,
      total: records.length,
    });
  } catch (err) {
    console.error("Engraved bulk update error:", err);
    res.status(500).json({ error: "Failed to process engraved bulk update: " + err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// FEATURE 4 & 5 & 6 — BLOG POSTS
// ═══════════════════════════════════════════════════════════════════════════

// 1. Template Download
router.get("/blogs/template", (req, res) => {
  const content = [
    "# INSTRUCTIONS:",
    "# slug: URL-friendly e.g. my-blog-post-title (auto-generated from title if left empty)",
    "# content: plain text or basic HTML",
    "# status: published or draft",
    "# For rich HTML content use the HTML file upload option below",
    "# Do not change column headers",
    "# Delete instruction rows before uploading",
    "title,slug,category,tags,featured_image_url,excerpt,content,meta_title,meta_description,author_name,status",
    '"5 Best Custom Gift Ideas for 2026","best-custom-gift-ideas-2026","Gift Ideas","gifts,custom,personalised","https://images.example.com/blog1.jpg","Looking for the perfect personalised gift? Here are our top 5 picks.","<h2>Introduction</h2><p>Custom gifts are becoming more popular...</p>","5 Best Custom Gift Ideas - Olive Seeds Studio","Discover the best custom personalised gift ideas for any occasion","Admin",published',
  ].join("\r\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="blogs_template.csv"');
  res.status(200).send(content);
});

// 2. Option A: CSV Bulk Upload
router.post("/blogs/bulk-upload-csv", verifyAdmin, upload.single("file"), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "Please upload a valid CSV file" });
    }

    const records = parseCsvFile(req.file.buffer);
    if (!records.length) {
      return res.status(400).json({ error: "No blog rows found in CSV" });
    }

    if (records.length > MAX_ROWS) {
      return res.status(400).json({ error: `Upload exceeds limit of ${MAX_ROWS} rows` });
    }

    let successCount = 0;
    const errors = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNum = i + 1;

      if (!row.title || !String(row.title).trim()) {
        errors.push({ row: rowNum, error: "Blog title is required" });
        continue;
      }

      const title = String(row.title).trim();
      const slug = row.slug && String(row.slug).trim() ? generateSlug(row.slug) : generateSlug(title);
      const category = row.category ? String(row.category).trim() : "General";
      const author = row.author_name ? String(row.author_name).trim() : "Admin";
      const imageUrl = row.featured_image_url ? String(row.featured_image_url).trim() : "";
      const content = row.content || row.excerpt || "";
      const metaTitle = row.meta_title ? String(row.meta_title).trim() : title;
      const metaDesc = row.meta_description ? String(row.meta_description).trim() : (row.excerpt || "").slice(0, 160);
      const status = String(row.status || "published").trim().toLowerCase();

      try {
        await db.query(
          `INSERT INTO blogs 
           (title, content, category, author, image_url, slug, tags, meta_title, meta_description, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            title,
            content,
            category,
            author,
            imageUrl,
            slug,
            row.tags || "",
            metaTitle,
            metaDesc,
            status,
          ]
        );
        successCount++;
      } catch (err) {
        errors.push({ row: rowNum, error: err.message || "Failed to insert blog post" });
      }
    }

    res.json({
      success: successCount,
      errors: errors,
      total: records.length,
    });
  } catch (err) {
    console.error("Blogs CSV bulk upload error:", err);
    res.status(500).json({ error: "Failed to process blogs bulk upload: " + err.message });
  }
});

// 3. Option B: Multi-HTML Files Bulk Upload
router.post("/blogs/bulk-upload-html", verifyAdmin, upload.array("files", 50), async (req, res) => {
  try {
    const files = req.files || [];
    if (!files.length) {
      return res.status(400).json({ error: "Please select one or more .html files" });
    }

    let successCount = 0;
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filename = file.originalname;

      try {
        const rawContent = file.buffer.toString("utf8");

        // Extract metadata comments: <!-- key: value -->
        const extractMeta = (key) => {
          const regex = new RegExp(`<!--\\s*${key}:\\s*(.*?)\\s*-->`, "i");
          const match = rawContent.match(regex);
          return match ? match[1].trim() : null;
        };

        const metaTitle = extractMeta("title");
        const metaCategory = extractMeta("category");
        const metaTags = extractMeta("tags");
        const metaStatus = extractMeta("status");
        const metaExcerpt = extractMeta("excerpt");
        const metaAuthor = extractMeta("author");

        // Fallback for title: <title>...</title> or <h1>...</h1> or filename
        let title = metaTitle;
        if (!title) {
          const h1Match = rawContent.match(/<h1[^>]*>(.*?)<\/h1>/i);
          if (h1Match) title = h1Match[1].replace(/<[^>]+>/g, "").trim();
          else {
            const titleMatch = rawContent.match(/<title[^>]*>(.*?)<\/title>/i);
            if (titleMatch) title = titleMatch[1].replace(/<[^>]+>/g, "").trim();
            else title = filename.replace(/\.html?$/i, "").replace(/[-_]+/g, " ");
          }
        }

        const cleanSlug = generateSlug(filename.replace(/\.html?$/i, ""));
        const category = metaCategory || "General";
        const tags = metaTags || "";
        const status = metaStatus ? metaStatus.toLowerCase() : "published";
        const author = metaAuthor || "Admin";
        const excerpt = metaExcerpt || "";

        // Remove top comment block from HTML content for cleaner storage
        const cleanContent = rawContent.replace(/^(\s*<!--[\s\S]*?-->\s*)+/i, "").trim() || rawContent;

        await db.query(
          `INSERT INTO blogs 
           (title, content, category, author, slug, tags, meta_title, meta_description, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            title,
            cleanContent,
            category,
            author,
            cleanSlug,
            tags,
            title,
            excerpt,
            status,
          ]
        );
        successCount++;
      } catch (err) {
        errors.push({ file: filename, error: err.message || "Failed to import file" });
      }
    }

    res.json({
      success: successCount,
      errors: errors,
      total: files.length,
    });
  } catch (err) {
    console.error("Blogs HTML bulk upload error:", err);
    res.status(500).json({ error: "Failed to process HTML bulk upload: " + err.message });
  }
});

// 4. Export All as CSV
router.get("/blogs/export", verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM blogs ORDER BY id DESC");

    const headers = [
      "id",
      "title",
      "slug",
      "category",
      "tags",
      "featured_image_url",
      "excerpt",
      "content",
      "meta_title",
      "meta_description",
      "author_name",
      "status",
    ];

    const exportRows = rows.map((b) => ({
      id: b.id,
      title: b.title || "",
      slug: b.slug || "",
      category: b.category || "General",
      tags: b.tags || "",
      featured_image_url: b.image_url || "",
      excerpt: b.meta_description || "",
      content: b.content || "",
      meta_title: b.meta_title || b.title || "",
      meta_description: b.meta_description || "",
      author_name: b.author || "Admin",
      status: b.status || "published",
    }));

    const csvData = buildCsv(headers, exportRows);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="blogs.csv"');
    res.status(200).send(csvData);
  } catch (err) {
    console.error("Blogs export error:", err);
    res.status(500).json({ error: "Failed to export blogs" });
  }
});

// 5. Bulk Update
router.post("/blogs/bulk-update", verifyAdmin, upload.single("file"), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "Please upload a valid CSV file" });
    }

    const records = parseCsvFile(req.file.buffer);
    if (!records.length) {
      return res.status(400).json({ error: "No blog rows found in CSV" });
    }

    if (records.length > MAX_ROWS) {
      return res.status(400).json({ error: `Upload exceeds limit of ${MAX_ROWS} rows` });
    }

    let updatedCount = 0;
    let createdCount = 0;
    const errors = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNum = i + 1;

      if (!row.title || !String(row.title).trim()) {
        errors.push({ row: rowNum, error: "Blog title is required" });
        continue;
      }

      const title = String(row.title).trim();
      const slug = row.slug && String(row.slug).trim() ? generateSlug(row.slug) : generateSlug(title);
      const category = row.category ? String(row.category).trim() : "General";
      const author = row.author_name ? String(row.author_name).trim() : "Admin";
      const imageUrl = row.featured_image_url ? String(row.featured_image_url).trim() : "";
      const content = row.content || row.excerpt || "";
      const metaTitle = row.meta_title ? String(row.meta_title).trim() : title;
      const metaDesc = row.meta_description ? String(row.meta_description).trim() : "";
      const status = String(row.status || "published").trim().toLowerCase();
      const existingId = row.id ? parseInt(String(row.id).trim(), 10) : null;

      try {
        if (existingId && !isNaN(existingId)) {
          const [check] = await db.query("SELECT id FROM blogs WHERE id = ?", [existingId]);
          if (check.length > 0) {
            await db.query(
              `UPDATE blogs SET 
               title = ?, content = ?, category = ?, author = ?, image_url = ?, 
               slug = ?, tags = ?, meta_title = ?, meta_description = ?, status = ? 
               WHERE id = ?`,
              [
                title,
                content,
                category,
                author,
                imageUrl,
                slug,
                row.tags || "",
                metaTitle,
                metaDesc,
                status,
                existingId,
              ]
            );
            updatedCount++;
            continue;
          }
        }

        await db.query(
          `INSERT INTO blogs 
           (title, content, category, author, image_url, slug, tags, meta_title, meta_description, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            title,
            content,
            category,
            author,
            imageUrl,
            slug,
            row.tags || "",
            metaTitle,
            metaDesc,
            status,
          ]
        );
        createdCount++;
      } catch (err) {
        errors.push({ row: rowNum, error: err.message || "Operation failed" });
      }
    }

    res.json({
      success: updatedCount + createdCount,
      updated: updatedCount,
      created: createdCount,
      errors: errors,
      total: records.length,
    });
  } catch (err) {
    console.error("Blogs bulk update error:", err);
    res.status(500).json({ error: "Failed to process blogs bulk update: " + err.message });
  }
});

module.exports = router;
