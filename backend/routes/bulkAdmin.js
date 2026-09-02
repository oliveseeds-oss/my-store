const router = require("express").Router();
const multer = require("multer");
const db = require("../db");
const { verifyAdmin } = require("../middleware/auth");
const { parseCsvFile, normalizeRow, generateSlug, buildCsv } = require("../utils/csvBulkHelper");

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
// 1. PHYSICAL PRODUCTS BULK SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

// A. Download Template CSV (Exact match to Products.jsx form fields)
router.get("/products/physical/template", (req, res) => {
  const content = [
    "# OLIVE SEEDS STUDIO — Products Bulk Upload Template",
    "# HOW TO USE:",
    "# 1. Fill each row as one product",
    "# 2. Do not change column headers (Row 11)",
    "# 3. Delete rows starting with # before uploading",
    "# 4. Required fields marked with *",
    "# 5. Images upload separately after bulk import (or paste public image URLs here if already hosted)",
    "# Category allowed values: Mugs, T-Shirts, Wooden Frames, Keychains, Nameplates, Home Decor",
    "# Show on Website (Active): true or false (default: true)",
    "#",
    "Product ID / SKU,Product Name *,Category,Stock Quantity,Original Price (₹) *,Discount Price (₹),Main Image URL,Additional Image URLs,Available Sizes,Tags,Description,Show on Website (Active)",
    '"MUG-001","Custom Printed Ceramic Mug","Mugs",100,399,299,"https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd","https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd,https://images.unsplash.com/photo-1577937927133-66ef06acdf18","Standard (325ml), Large (450ml)","Best Seller, Custom, Gift","High quality ceramic mug with custom permanent print. Microwave and dishwasher safe.",true',
    '"TSH-001","Personalised Premium Cotton T-Shirt","T-Shirts",50,799,599,"https://images.unsplash.com/photo-1521572267360-ee0c2909d518","https://images.unsplash.com/photo-1521572267360-ee0c2909d518","Small, Medium, Large, XL, XXL","New Arrival, Apparel, Summer","100% combed cotton biowashed t-shirt tailored for comfort with high resolution custom print.",true',
  ].join("\r\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="products_template.csv"');
  res.status(200).send(content);
});

// B. Bulk CSV Upload
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
      const rawRow = records[i];
      const norm = normalizeRow(rawRow);
      const rowNum = i + 1;

      // Product Name validation
      const name = norm.product_name || norm.name;
      if (!name) {
        errors.push({ row: rowNum, error: "Product Name is required" });
        continue;
      }

      // Price validation
      const rawPriceStr = norm.original_price || norm.price;
      const price = parseFloat(String(rawPriceStr || "").replace(/[^0-9.]/g, ""));
      if (isNaN(price) || price < 0) {
        errors.push({ row: rowNum, error: "Original Price (₹) must be a valid number" });
        continue;
      }

      // Discount price
      let discountPrice = null;
      const rawDiscountStr = norm.discount_price || norm.compare_price;
      if (rawDiscountStr && String(rawDiscountStr).trim() !== "") {
        const parsedDiscount = parseFloat(String(rawDiscountStr).replace(/[^0-9.]/g, ""));
        if (!isNaN(parsedDiscount) && parsedDiscount > 0) {
          discountPrice = parsedDiscount;
        }
      }

      // Stock quantity
      let stock = 0;
      const rawStockStr = norm.stock_quantity || norm.stock_qty || norm.stock;
      if (rawStockStr && String(rawStockStr).trim() !== "") {
        const parsedStock = parseInt(String(rawStockStr).replace(/[^0-9-]/g, ""), 10);
        if (isNaN(parsedStock)) {
          errors.push({ row: rowNum, error: "Stock Quantity must be a valid number" });
          continue;
        }
        stock = parsedStock;
      }

      // Category
      const categoryName = norm.category;
      const categoryId = await resolveCategoryId(categoryName, "physical");

      // SKU / product_uid
      const finalUid = norm.product_id_sku || norm.sku || norm.product_uid || generateProductUid();

      // Images
      const mainImageUrl = norm.main_image_url || norm.image_url || norm.image || "";
      const additionalImagesStr = norm.additional_image_urls || norm.images || "";
      const imagesArray = additionalImagesStr
        ? additionalImagesStr.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      if (mainImageUrl && !imagesArray.includes(mainImageUrl)) {
        imagesArray.unshift(mainImageUrl);
      }

      // Sizes
      const sizesStr = norm.available_sizes || norm.sizes || "";
      const sizesArray = sizesStr
        ? sizesStr.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      // Tags
      const tagsStr = norm.tags || "";
      const tagsArray = tagsStr
        ? tagsStr.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      // Description
      const description = norm.description || "";

      // Active status
      const activeVal = norm.show_on_website_active !== undefined ? norm.show_on_website_active : norm.is_active;
      let isActive = 1;
      if (
        activeVal === "false" ||
        activeVal === "0" ||
        activeVal === "draft" ||
        norm.status === "draft" ||
        norm.status === "inactive"
      ) {
        isActive = 0;
      }

      try {
        await db.query(
          `INSERT INTO products 
           (product_uid, name, description, price, discount_price, category_id, stock, image_url, images, sizes, tags, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            finalUid,
            name,
            description,
            price,
            discountPrice,
            categoryId,
            stock,
            mainImageUrl,
            JSON.stringify(imagesArray),
            JSON.stringify(sizesArray),
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

// C. Export All Physical Products (Matching exact upload columns with id as Col 1)
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
      "Product ID / SKU",
      "Product Name",
      "Category",
      "Stock Quantity",
      "Original Price (₹)",
      "Discount Price (₹)",
      "Main Image URL",
      "Additional Image URLs",
      "Available Sizes",
      "Tags",
      "Description",
      "Show on Website (Active)",
    ];

    const exportRows = rows.map((p) => {
      let addlImagesStr = "";
      if (Array.isArray(p.images)) {
        addlImagesStr = p.images.join(", ");
      } else if (typeof p.images === "string" && p.images.startsWith("[")) {
        try {
          const parsed = JSON.parse(p.images);
          addlImagesStr = Array.isArray(parsed) ? parsed.join(", ") : p.images;
        } catch {
          addlImagesStr = p.images;
        }
      }

      let sizesStr = "";
      if (Array.isArray(p.sizes)) {
        sizesStr = p.sizes.join(", ");
      } else if (typeof p.sizes === "string" && p.sizes.startsWith("[")) {
        try {
          const parsed = JSON.parse(p.sizes);
          sizesStr = Array.isArray(parsed) ? parsed.join(", ") : p.sizes;
        } catch {
          sizesStr = p.sizes;
        }
      }

      let tagsStr = "";
      if (Array.isArray(p.tags)) {
        tagsStr = p.tags.join(", ");
      } else if (typeof p.tags === "string" && p.tags.startsWith("[")) {
        try {
          const parsed = JSON.parse(p.tags);
          tagsStr = Array.isArray(parsed) ? parsed.join(", ") : p.tags;
        } catch {
          tagsStr = p.tags;
        }
      }

      return {
        id: p.id,
        "Product ID / SKU": p.product_uid || "",
        "Product Name": p.name || "",
        Category: p.category_name || "",
        "Stock Quantity": p.stock || 0,
        "Original Price (₹)": p.price || 0,
        "Discount Price (₹)": p.discount_price || "",
        "Main Image URL": p.image_url || "",
        "Additional Image URLs": addlImagesStr,
        "Available Sizes": sizesStr,
        Tags: tagsStr,
        Description: p.description || "",
        "Show on Website (Active)": p.is_active ? "true" : "false",
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

// D. Bulk Update Physical Products
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
      const rawRow = records[i];
      const norm = normalizeRow(rawRow);
      const rowNum = i + 1;

      const name = norm.product_name || norm.name;
      if (!name) {
        errors.push({ row: rowNum, error: "Product Name is required" });
        continue;
      }

      const rawPriceStr = norm.original_price || norm.price;
      const price = parseFloat(String(rawPriceStr || "").replace(/[^0-9.]/g, ""));
      if (isNaN(price) || price < 0) {
        errors.push({ row: rowNum, error: "Original Price (₹) must be a valid number" });
        continue;
      }

      let discountPrice = null;
      const rawDiscountStr = norm.discount_price || norm.compare_price;
      if (rawDiscountStr && String(rawDiscountStr).trim() !== "") {
        const parsedDiscount = parseFloat(String(rawDiscountStr).replace(/[^0-9.]/g, ""));
        if (!isNaN(parsedDiscount) && parsedDiscount > 0) discountPrice = parsedDiscount;
      }

      const stock = parseInt(String(norm.stock_quantity || norm.stock_qty || norm.stock || 0).replace(/[^0-9-]/g, ""), 10) || 0;
      const categoryId = await resolveCategoryId(norm.category, "physical");
      const mainImageUrl = norm.main_image_url || norm.image_url || norm.image || "";
      const additionalImagesStr = norm.additional_image_urls || norm.images || "";
      const imagesArray = additionalImagesStr ? additionalImagesStr.split(",").map((s) => s.trim()).filter(Boolean) : [];
      if (mainImageUrl && !imagesArray.includes(mainImageUrl)) imagesArray.unshift(mainImageUrl);

      const sizesArray = (norm.available_sizes || norm.sizes || "").split(",").map((s) => s.trim()).filter(Boolean);
      const tagsArray = (norm.tags || "").split(",").map((s) => s.trim()).filter(Boolean);
      const description = norm.description || "";
      const activeVal = norm.show_on_website_active !== undefined ? norm.show_on_website_active : norm.is_active;
      let isActive = 1;
      if (activeVal === "false" || activeVal === "0" || activeVal === "draft" || norm.status === "draft") isActive = 0;

      const existingId = norm.id ? parseInt(String(norm.id).trim(), 10) : null;

      try {
        if (existingId && !isNaN(existingId)) {
          const [check] = await db.query("SELECT id FROM products WHERE id = ?", [existingId]);
          if (check.length > 0) {
            await db.query(
              `UPDATE products SET 
               name = ?, description = ?, price = ?, discount_price = ?, 
               category_id = ?, stock = ?, image_url = ?, images = ?, sizes = ?, tags = ?, is_active = ? 
               WHERE id = ?`,
              [
                name,
                description,
                price,
                discountPrice,
                categoryId,
                stock,
                mainImageUrl,
                JSON.stringify(imagesArray),
                JSON.stringify(sizesArray),
                JSON.stringify(tagsArray),
                isActive,
                existingId,
              ]
            );
            updatedCount++;
            continue;
          }
        }

        // Insert new
        const finalUid = norm.product_id_sku || norm.sku || norm.product_uid || generateProductUid();
        await db.query(
          `INSERT INTO products 
           (product_uid, name, description, price, discount_price, category_id, stock, image_url, images, sizes, tags, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            finalUid,
            name,
            description,
            price,
            discountPrice,
            categoryId,
            stock,
            mainImageUrl,
            JSON.stringify(imagesArray),
            JSON.stringify(sizesArray),
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
// 2. DIGITAL PRODUCTS BULK SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

// A. Download Template CSV (Exact match to DigitalProducts.jsx form fields)
router.get("/products/digital/template", (req, res) => {
  const content = [
    "# OLIVE SEEDS STUDIO — Digital Products Bulk Upload Template",
    "# HOW TO USE:",
    "# 1. Fill each row as one digital product",
    "# 2. Do not change column headers (Row 11)",
    "# 3. Delete rows starting with # before uploading",
    "# 4. Required fields marked with *",
    "# 5. Upload actual files to your server/drive first, then paste the file URL in Download File URL column",
    "# Category allowed values: Design Templates, Notion Kits, Figma Systems, Vector Assets, 3D Mockups",
    "# File Format examples: ZIP, PDF, PNG, SVG, AI, PSD, FIG",
    "#",
    "Product ID / SKU,Product Name *,Category,File Format,Original Price (₹) *,Discount Price (₹),File Size,Download File URL *,Thumbnail URL,Preview Image URLs,Tags,Description,Show on Website (Active)",
    '"DPD-101","Luxury Brand Identity & Logo Kit","Design Templates","AI, PNG, SVG, PDF, PSD",999,499,"85 MB","https://files.example.com/logo-kit.zip","https://images.unsplash.com/photo-1626785774573-4b799315345d","https://images.unsplash.com/photo-1626785774573-4b799315345d,https://images.unsplash.com/photo-1600132806370-bf17e65e942f","Best Seller, Top Rated, Branding","Comprehensive vector branding system including 20+ logo lockups, color palettes, and brand guidelines.",true',
    '"DPD-102","Ultimate Creator Notion Workspace Tracker","Notion Kits","Notion Template",699,299,"2.5 MB","https://notion.so/templates/creator-tracker","https://images.unsplash.com/photo-1517842645767-c639042777db","https://images.unsplash.com/photo-1517842645767-c639042777db","Trending, Notion, Productivity","Complete content production calendar, finances tracker, and social media planner built inside Notion.",true',
  ].join("\r\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="digital_products_template.csv"');
  res.status(200).send(content);
});

// B. Bulk CSV Upload
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
      const rawRow = records[i];
      const norm = normalizeRow(rawRow);
      const rowNum = i + 1;

      // Product Name
      const name = norm.product_name || norm.name;
      if (!name) {
        errors.push({ row: rowNum, error: "Product Name is required" });
        continue;
      }

      // Price
      const rawPriceStr = norm.original_price || norm.price;
      const price = parseFloat(String(rawPriceStr || "").replace(/[^0-9.]/g, ""));
      if (isNaN(price) || price < 0) {
        errors.push({ row: rowNum, error: "Original Price (₹) must be a valid number" });
        continue;
      }

      // Download File URL
      const fileUrl = norm.download_file_url || norm.file_url;
      if (!fileUrl) {
        errors.push({ row: rowNum, error: "Download File URL is required" });
        continue;
      }
      if (!fileUrl.startsWith("http://") && !fileUrl.startsWith("https://") && !fileUrl.startsWith("/uploads/")) {
        errors.push({ row: rowNum, error: "Download File URL must be a valid URL (http://, https://, or /uploads/...)" });
        continue;
      }

      // Discount price
      let discountPrice = null;
      const rawDiscountStr = norm.discount_price || norm.compare_price;
      if (rawDiscountStr && String(rawDiscountStr).trim() !== "") {
        const parsedDiscount = parseFloat(String(rawDiscountStr).replace(/[^0-9.]/g, ""));
        if (!isNaN(parsedDiscount) && parsedDiscount > 0) discountPrice = parsedDiscount;
      }

      const fileFormat = norm.file_format || norm.file_type || "ZIP";
      const fileSize = norm.file_size || norm.file_size_mb || "";
      const categoryId = await resolveCategoryId(norm.category, "digital");
      const finalUid = norm.product_id_sku || norm.sku || norm.product_uid || generateDigitalProductUid();
      const thumbnailUrl = norm.thumbnail_url || norm.preview_image_url || "";
      const previewImagesStr = norm.preview_image_urls || norm.images || "";
      const imagesArray = previewImagesStr ? previewImagesStr.split(",").map((s) => s.trim()).filter(Boolean) : [];
      if (thumbnailUrl && !imagesArray.includes(thumbnailUrl)) imagesArray.unshift(thumbnailUrl);

      const tagsArray = (norm.tags || "").split(",").map((s) => s.trim()).filter(Boolean);
      const description = norm.description || "";
      const activeVal = norm.show_on_website_active !== undefined ? norm.show_on_website_active : norm.is_active;
      let isActive = 1;
      if (activeVal === "false" || activeVal === "0" || activeVal === "draft" || norm.status === "draft") isActive = 0;

      try {
        await db.query(
          `INSERT INTO digital_products 
           (product_uid, name, description, price, discount_price, category_id, file_url, thumbnail_url, images, file_size, file_format, tags, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            finalUid,
            name,
            description,
            price,
            discountPrice,
            categoryId,
            fileUrl,
            thumbnailUrl,
            JSON.stringify(imagesArray),
            fileSize,
            fileFormat,
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

// C. Export All Digital Products
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
      "Product ID / SKU",
      "Product Name",
      "Category",
      "File Format",
      "Original Price (₹)",
      "Discount Price (₹)",
      "File Size",
      "Download File URL",
      "Thumbnail URL",
      "Preview Image URLs",
      "Tags",
      "Description",
      "Show on Website (Active)",
    ];

    const exportRows = rows.map((d) => {
      let previewImagesStr = "";
      if (Array.isArray(d.images)) {
        previewImagesStr = d.images.join(", ");
      } else if (typeof d.images === "string" && d.images.startsWith("[")) {
        try {
          const parsed = JSON.parse(d.images);
          previewImagesStr = Array.isArray(parsed) ? parsed.join(", ") : d.images;
        } catch {
          previewImagesStr = d.images;
        }
      }

      let tagsStr = "";
      if (Array.isArray(d.tags)) {
        tagsStr = d.tags.join(", ");
      } else if (typeof d.tags === "string" && d.tags.startsWith("[")) {
        try {
          const parsed = JSON.parse(d.tags);
          tagsStr = Array.isArray(parsed) ? parsed.join(", ") : d.tags;
        } catch {
          tagsStr = d.tags;
        }
      }

      return {
        id: d.id,
        "Product ID / SKU": d.product_uid || "",
        "Product Name": d.name || "",
        Category: d.category_name || "",
        "File Format": d.file_format || "ZIP",
        "Original Price (₹)": d.price || 0,
        "Discount Price (₹)": d.discount_price || "",
        "File Size": d.file_size || "",
        "Download File URL": d.file_url || "",
        "Thumbnail URL": d.thumbnail_url || "",
        "Preview Image URLs": previewImagesStr,
        Tags: tagsStr,
        Description: d.description || "",
        "Show on Website (Active)": d.is_active ? "true" : "false",
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

// D. Bulk Update Digital Products
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
      const rawRow = records[i];
      const norm = normalizeRow(rawRow);
      const rowNum = i + 1;

      const name = norm.product_name || norm.name;
      if (!name) {
        errors.push({ row: rowNum, error: "Product Name is required" });
        continue;
      }

      const rawPriceStr = norm.original_price || norm.price;
      const price = parseFloat(String(rawPriceStr || "").replace(/[^0-9.]/g, ""));
      if (isNaN(price) || price < 0) {
        errors.push({ row: rowNum, error: "Original Price (₹) must be a valid number" });
        continue;
      }

      const fileUrl = norm.download_file_url || norm.file_url;
      if (!fileUrl) {
        errors.push({ row: rowNum, error: "Download File URL is required" });
        continue;
      }

      let discountPrice = null;
      const rawDiscountStr = norm.discount_price || norm.compare_price;
      if (rawDiscountStr && String(rawDiscountStr).trim() !== "") {
        const parsedDiscount = parseFloat(String(rawDiscountStr).replace(/[^0-9.]/g, ""));
        if (!isNaN(parsedDiscount) && parsedDiscount > 0) discountPrice = parsedDiscount;
      }

      const fileFormat = norm.file_format || norm.file_type || "ZIP";
      const fileSize = norm.file_size || norm.file_size_mb || "";
      const categoryId = await resolveCategoryId(norm.category, "digital");
      const thumbnailUrl = norm.thumbnail_url || norm.preview_image_url || "";
      const previewImagesStr = norm.preview_image_urls || norm.images || "";
      const imagesArray = previewImagesStr ? previewImagesStr.split(",").map((s) => s.trim()).filter(Boolean) : [];
      if (thumbnailUrl && !imagesArray.includes(thumbnailUrl)) imagesArray.unshift(thumbnailUrl);

      const tagsArray = (norm.tags || "").split(",").map((s) => s.trim()).filter(Boolean);
      const description = norm.description || "";
      const activeVal = norm.show_on_website_active !== undefined ? norm.show_on_website_active : norm.is_active;
      let isActive = 1;
      if (activeVal === "false" || activeVal === "0" || activeVal === "draft" || norm.status === "draft") isActive = 0;

      const existingId = norm.id ? parseInt(String(norm.id).trim(), 10) : null;

      try {
        if (existingId && !isNaN(existingId)) {
          const [check] = await db.query("SELECT id FROM digital_products WHERE id = ?", [existingId]);
          if (check.length > 0) {
            await db.query(
              `UPDATE digital_products SET 
               name = ?, description = ?, price = ?, discount_price = ?, category_id = ?, 
               file_url = ?, thumbnail_url = ?, images = ?, file_size = ?, file_format = ?, tags = ?, is_active = ? 
               WHERE id = ?`,
              [
                name,
                description,
                price,
                discountPrice,
                categoryId,
                fileUrl,
                thumbnailUrl,
                JSON.stringify(imagesArray),
                fileSize,
                fileFormat,
                JSON.stringify(tagsArray),
                isActive,
                existingId,
              ]
            );
            updatedCount++;
            continue;
          }
        }

        const finalUid = norm.product_id_sku || norm.sku || norm.product_uid || generateDigitalProductUid();
        await db.query(
          `INSERT INTO digital_products 
           (product_uid, name, description, price, discount_price, category_id, file_url, thumbnail_url, images, file_size, file_format, tags, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            finalUid,
            name,
            description,
            price,
            discountPrice,
            categoryId,
            fileUrl,
            thumbnailUrl,
            JSON.stringify(imagesArray),
            fileSize,
            fileFormat,
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
// 3. BLOG POSTS BULK SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

// A. Download Template CSV (Exact match to Blog.jsx form fields)
router.get("/blogs/template", (req, res) => {
  const content = [
    "# OLIVE SEEDS STUDIO — Blog Posts Bulk Upload Template",
    "# HOW TO USE:",
    "# 1. Fill each row as one blog post",
    "# 2. Do not change column headers (Row 11)",
    "# 3. Delete rows starting with # before uploading",
    "# 4. Slug auto-generated from Title if left empty",
    "# 5. Content column accepts HTML or formatted text",
    "# 6. For complex rich articles with custom styles, use the HTML file upload method in Admin",
    "# 7. Required fields marked with *",
    "#",
    "Post Title *,URL Slug,Category,Author,Tags,Content (HTML) *,Featured / Cover Image URL,Meta Title *,Meta Description *,Focus Keyword,Canonical URL,OG Title,OG Description,OG Image URL,No-index Post,Publish Status",
    '"5 Best Custom Gift Ideas for 2026","5-best-custom-gift-ideas-2026","Gift Ideas","Master Crafter","gifts,custom,laser,engraving","<h2>Top Personalised Gifts</h2><p>Discover our favorite artisan handcrafted treasures designed for unforgettable occasions.</p>","https://images.unsplash.com/photo-1544816155-12df9643f363","5 Best Custom Gift Ideas for 2026 | Olive Seeds Studio","Explore top personalized handcrafted gift ideas for birthdays, weddings, and anniversaries from Olive Seeds Studio.","custom gift ideas","https://oliveseedsdesignstudio.com/blog/5-best-custom-gift-ideas-2026","5 Best Custom Gift Ideas for 2026","Handcrafted bespoke gifts guide","https://images.unsplash.com/photo-1544816155-12df9643f363",false,published',
  ].join("\r\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="blogs_template.csv"');
  res.status(200).send(content);
});

// B. Option 1: Bulk CSV Upload
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
      const rawRow = records[i];
      const norm = normalizeRow(rawRow);
      const rowNum = i + 1;

      // Post Title
      const title = norm.post_title || norm.title;
      if (!title) {
        errors.push({ row: rowNum, error: "Post Title is required" });
        continue;
      }

      // Content
      const content = norm.content_html || norm.content;
      if (!content) {
        errors.push({ row: rowNum, error: "Content (HTML) is required" });
        continue;
      }

      const rawSlug = norm.url_slug || norm.slug;
      const slug = rawSlug ? generateSlug(rawSlug) : generateSlug(title);
      const category = norm.category || "General";
      const author = norm.author || norm.author_name || "Admin";
      const tags = norm.tags || "";
      const imageUrl = norm.featured_cover_image_url || norm.featured_image_url || norm.image_url || norm.image || "";
      const metaTitle = norm.meta_title || title;
      const metaDesc = norm.meta_description || content.replace(/<[^>]+>/g, "").slice(0, 160);
      const focusKeyword = norm.focus_keyword || "";
      const canonicalUrl = norm.canonical_url || "";
      const ogTitle = norm.og_title || metaTitle;
      const ogDesc = norm.og_description || metaDesc;
      const ogImage = norm.og_image_url || norm.og_image || imageUrl;
      const noIndex = norm.no_index_post === "true" || norm.no_index_post === "1" || norm.no_index === "1" ? 1 : 0;
      const status = norm.publish_status || norm.status || "published";

      try {
        await db.query(
          `INSERT INTO blogs 
           (title, content, category, author, image_url, slug, tags, meta_title, meta_description, focus_keyword, canonical_url, og_title, og_description, og_image, no_index, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            title,
            content,
            category,
            author,
            imageUrl,
            slug,
            tags,
            metaTitle,
            metaDesc,
            focusKeyword,
            canonicalUrl,
            ogTitle,
            ogDesc,
            ogImage,
            noIndex,
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

// C. Option 2: Multi-HTML Files Bulk Upload
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

        const metaTitle = extractMeta("title") || extractMeta("meta_title");
        const metaCategory = extractMeta("category");
        const metaTags = extractMeta("tags");
        const metaStatus = extractMeta("status") || extractMeta("publish_status");
        const metaExcerpt = extractMeta("excerpt") || extractMeta("meta_description");
        const metaAuthor = extractMeta("author");
        const metaFocusKeyword = extractMeta("focus_keyword");
        const metaCanonicalUrl = extractMeta("canonical_url");
        const metaOgTitle = extractMeta("og_title");
        const metaOgDesc = extractMeta("og_description");
        const metaOgImage = extractMeta("og_image") || extractMeta("image");

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
        const metaDescription = metaExcerpt || "";

        // Remove top comment block from HTML content for cleaner storage
        const cleanContent = rawContent.replace(/^(\s*<!--[\s\S]*?-->\s*)+/i, "").trim() || rawContent;

        await db.query(
          `INSERT INTO blogs 
           (title, content, category, author, slug, tags, meta_title, meta_description, focus_keyword, canonical_url, og_title, og_description, og_image, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            title,
            cleanContent,
            category,
            author,
            cleanSlug,
            tags,
            metaTitle || title,
            metaDescription,
            metaFocusKeyword || "",
            metaCanonicalUrl || "",
            metaOgTitle || metaTitle || title,
            metaOgDesc || metaDescription,
            metaOgImage || "",
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

// D. Export All Blog Posts
router.get("/blogs/export", verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM blogs ORDER BY id DESC");

    const headers = [
      "id",
      "Post Title",
      "URL Slug",
      "Category",
      "Author",
      "Tags",
      "Content (HTML)",
      "Featured / Cover Image URL",
      "Meta Title",
      "Meta Description",
      "Focus Keyword",
      "Canonical URL",
      "OG Title",
      "OG Description",
      "OG Image URL",
      "No-index Post",
      "Publish Status",
    ];

    const exportRows = rows.map((b) => ({
      id: b.id,
      "Post Title": b.title || "",
      "URL Slug": b.slug || "",
      Category: b.category || "General",
      Author: b.author || "Admin",
      Tags: b.tags || "",
      "Content (HTML)": b.content || "",
      "Featured / Cover Image URL": b.image_url || "",
      "Meta Title": b.meta_title || b.title || "",
      "Meta Description": b.meta_description || "",
      "Focus Keyword": b.focus_keyword || "",
      "Canonical URL": b.canonical_url || "",
      "OG Title": b.og_title || b.meta_title || b.title || "",
      "OG Description": b.og_description || b.meta_description || "",
      "OG Image URL": b.og_image || b.image_url || "",
      "No-index Post": b.no_index ? "true" : "false",
      "Publish Status": b.status || "published",
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

// E. Bulk Update Blog Posts
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
      const rawRow = records[i];
      const norm = normalizeRow(rawRow);
      const rowNum = i + 1;

      const title = norm.post_title || norm.title;
      if (!title) {
        errors.push({ row: rowNum, error: "Post Title is required" });
        continue;
      }

      const content = norm.content_html || norm.content;
      if (!content) {
        errors.push({ row: rowNum, error: "Content (HTML) is required" });
        continue;
      }

      const rawSlug = norm.url_slug || norm.slug;
      const slug = rawSlug ? generateSlug(rawSlug) : generateSlug(title);
      const category = norm.category || "General";
      const author = norm.author || norm.author_name || "Admin";
      const tags = norm.tags || "";
      const imageUrl = norm.featured_cover_image_url || norm.featured_image_url || norm.image_url || norm.image || "";
      const metaTitle = norm.meta_title || title;
      const metaDesc = norm.meta_description || "";
      const focusKeyword = norm.focus_keyword || "";
      const canonicalUrl = norm.canonical_url || "";
      const ogTitle = norm.og_title || metaTitle;
      const ogDesc = norm.og_description || metaDesc;
      const ogImage = norm.og_image_url || norm.og_image || imageUrl;
      const noIndex = norm.no_index_post === "true" || norm.no_index_post === "1" || norm.no_index === "1" ? 1 : 0;
      const status = norm.publish_status || norm.status || "published";
      const existingId = norm.id ? parseInt(String(norm.id).trim(), 10) : null;

      try {
        if (existingId && !isNaN(existingId)) {
          const [check] = await db.query("SELECT id FROM blogs WHERE id = ?", [existingId]);
          if (check.length > 0) {
            await db.query(
              `UPDATE blogs SET 
               title = ?, content = ?, category = ?, author = ?, image_url = ?, 
               slug = ?, tags = ?, meta_title = ?, meta_description = ?, focus_keyword = ?, 
               canonical_url = ?, og_title = ?, og_description = ?, og_image = ?, no_index = ?, status = ? 
               WHERE id = ?`,
              [
                title,
                content,
                category,
                author,
                imageUrl,
                slug,
                tags,
                metaTitle,
                metaDesc,
                focusKeyword,
                canonicalUrl,
                ogTitle,
                ogDesc,
                ogImage,
                noIndex,
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
           (title, content, category, author, image_url, slug, tags, meta_title, meta_description, focus_keyword, canonical_url, og_title, og_description, og_image, no_index, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            title,
            content,
            category,
            author,
            imageUrl,
            slug,
            tags,
            metaTitle,
            metaDesc,
            focusKeyword,
            canonicalUrl,
            ogTitle,
            ogDesc,
            ogImage,
            noIndex,
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
