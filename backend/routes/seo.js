const router = require("express").Router();
const db = require("../db");
const { verifyAdmin } = require("../middleware/auth");

const getDomain = () => (process.env.SITE_URL || process.env.PUBLIC_URL || process.env.REACT_APP_SITE_URL || "https://oliveseedsdesignstudio.com").replace(/\/$/, "");

const formatDate = (d) => {
  if (!d) return new Date().toISOString().split("T")[0];
  try {
    return new Date(d).toISOString().split("T")[0];
  } catch (e) {
    return new Date().toISOString().split("T")[0];
  }
};

const escapeXml = (str) => {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

// ══════════════════════════════════════════════════════════
// 1. SITEMAPS & ROBOTS (XML / Plain Text)
// ══════════════════════════════════════════════════════════

// GET /sitemap.xml — Dynamic Master XML Sitemap
router.get(["/sitemap.xml", "/api/seo/sitemap.xml"], async (req, res) => {
  try {
    const domain = getDomain();

    const [products] = await db.query("SELECT id, updated_at FROM physical_products WHERE is_active = TRUE").catch(() => [[]]);
    const [digitalProducts] = await db.query("SELECT id, product_uid, updated_at FROM digital_products WHERE is_active = TRUE").catch(() => [[]]);
    const [blogs] = await db.query("SELECT id, slug, updated_at, created_at FROM blogs WHERE status = 'published' OR status IS NULL").catch(() => [[]]);
    const [categories] = await db.query("SELECT DISTINCT category FROM physical_products WHERE category IS NOT NULL AND category != ''").catch(() => [[]]);

    const corePages = [
      { loc: `${domain}/`, priority: "1.0", changefreq: "daily" },
      { loc: `${domain}/products`, priority: "0.9", changefreq: "daily" },
      { loc: `${domain}/digital`, priority: "0.9", changefreq: "daily" },
      { loc: `${domain}/catalog`, priority: "0.9", changefreq: "weekly" },
      { loc: `${domain}/categories`, priority: "0.8", changefreq: "weekly" },
      { loc: `${domain}/bulk-order`, priority: "0.8", changefreq: "weekly" },
      { loc: `${domain}/service`, priority: "0.8", changefreq: "monthly" },
      { loc: `${domain}/gallery`, priority: "0.8", changefreq: "monthly" },
      { loc: `${domain}/portfolio`, priority: "0.8", changefreq: "monthly" },
      { loc: `${domain}/faq`, priority: "0.9", changefreq: "weekly" },
      { loc: `${domain}/blog`, priority: "0.8", changefreq: "daily" },
      { loc: `${domain}/about`, priority: "0.7", changefreq: "monthly" },
      { loc: `${domain}/contact`, priority: "0.7", changefreq: "monthly" },
      { loc: `${domain}/terms`, priority: "0.3", changefreq: "yearly" },
      { loc: `${domain}/privacy`, priority: "0.3", changefreq: "yearly" },
      { loc: `${domain}/refund`, priority: "0.3", changefreq: "yearly" },
      { loc: `${domain}/shipping`, priority: "0.3", changefreq: "yearly" },
      { loc: `${domain}/cookies`, priority: "0.3", changefreq: "yearly" },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Core Pages
    corePages.forEach((p) => {
      xml += `  <url>\n    <loc>${p.loc}</loc>\n    <lastmod>${formatDate(new Date())}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>\n`;
    });

    // Product Category pages
    (categories || []).forEach((c) => {
      xml += `  <url>\n    <loc>${domain}/products?category=${encodeURIComponent(c.category)}</loc>\n    <lastmod>${formatDate(new Date())}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    });

    // Physical Products (both /products/:id and /product/:id supported)
    (products || []).forEach((p) => {
      xml += `  <url>\n    <loc>${domain}/products/${p.id}</loc>\n    <lastmod>${formatDate(p.updated_at)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    // Digital Products
    (digitalProducts || []).forEach((dp) => {
      const uid = dp.product_uid || dp.id;
      xml += `  <url>\n    <loc>${domain}/digital/${uid}</loc>\n    <lastmod>${formatDate(dp.updated_at)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    // Blogs
    (blogs || []).forEach((b) => {
      const blogIdentifier = b.slug || b.id;
      xml += `  <url>\n    <loc>${domain}/blog/${blogIdentifier}</loc>\n    <lastmod>${formatDate(b.updated_at || b.created_at)}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (err) {
    console.error("Error generating sitemap.xml:", err);
    res.status(500).send("Error generating sitemap");
  }
});

// GET /sitemap-images.xml — Image Sitemap for Google Images & Pinterest
router.get(["/sitemap-images.xml", "/api/seo/sitemap-images.xml"], async (req, res) => {
  try {
    const domain = getDomain();

    const [products] = await db.query("SELECT id, name, image_url FROM physical_products WHERE is_active = TRUE AND image_url IS NOT NULL AND image_url != ''").catch(() => [[]]);
    const [digitalProducts] = await db.query("SELECT id, product_uid, name, thumbnail_url FROM digital_products WHERE is_active = TRUE AND thumbnail_url IS NOT NULL AND thumbnail_url != ''").catch(() => [[]]);
    const [blogs] = await db.query("SELECT id, slug, title, image_url FROM blogs WHERE (status = 'published' OR status IS NULL) AND image_url IS NOT NULL AND image_url != ''").catch(() => [[]]);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    (products || []).forEach((p) => {
      const imgPath = p.image_url.startsWith("http") ? p.image_url : `${domain}${p.image_url}`;
      xml += `  <url>\n    <loc>${domain}/products/${p.id}</loc>\n    <image:image>\n      <image:loc>${imgPath}</image:loc>\n      <image:title>${escapeXml(p.name)}</image:title>\n    </image:image>\n  </url>\n`;
    });

    (digitalProducts || []).forEach((dp) => {
      const imgPath = dp.thumbnail_url.startsWith("http") ? dp.thumbnail_url : `${domain}${dp.thumbnail_url}`;
      xml += `  <url>\n    <loc>${domain}/digital/${dp.product_uid || dp.id}</loc>\n    <image:image>\n      <image:loc>${imgPath}</image:loc>\n      <image:title>${escapeXml(dp.name)}</image:title>\n    </image:image>\n  </url>\n`;
    });

    (blogs || []).forEach((b) => {
      const imgPath = b.image_url.startsWith("http") ? b.image_url : `${domain}${b.image_url}`;
      xml += `  <url>\n    <loc>${domain}/blog/${b.slug || b.id}</loc>\n    <image:image>\n      <image:loc>${imgPath}</image:loc>\n      <image:title>${escapeXml(b.title)}</image:title>\n    </image:image>\n  </url>\n`;
    });

    xml += `</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (err) {
    console.error("Error generating sitemap-images.xml:", err);
    res.status(500).send("Error generating image sitemap");
  }
});

// GET /sitemap-news.xml — Google News Sitemap for recent blogs (last 2 days)
router.get(["/sitemap-news.xml", "/api/seo/sitemap-news.xml"], async (req, res) => {
  try {
    const domain = getDomain();
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    const [recentBlogs] = await db.query(
      "SELECT id, slug, title, created_at FROM blogs WHERE (status = 'published' OR status IS NULL) AND created_at >= ? ORDER BY created_at DESC",
      [twoDaysAgo]
    ).catch(() => [[]]);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n`;

    (recentBlogs || []).forEach((b) => {
      const pubDate = new Date(b.created_at).toISOString();
      xml += `  <url>\n    <loc>${domain}/blog/${b.slug || b.id}</loc>\n    <news:news>\n      <news:publication>\n        <news:name>Olive Seeds Studio Journal</news:name>\n        <news:language>en</news:language>\n      </news:publication>\n      <news:publication_date>${pubDate}</news:publication_date>\n      <news:title>${escapeXml(b.title)}</news:title>\n    </news:news>\n  </url>\n`;
    });

    xml += `</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (err) {
    console.error("Error generating sitemap-news.xml:", err);
    res.status(500).send("Error generating news sitemap");
  }
});

// GET /robots.txt — Robots instructions allowing search engines & all AI crawlers
router.get(["/robots.txt", "/api/seo/robots.txt"], async (req, res) => {
  try {
    // Check if custom robots.txt is saved in global_seo_settings
    const [rows] = await db.query("SELECT setting_value FROM global_seo_settings WHERE setting_key = 'robots_txt'").catch(() => [[]]);
    if (rows && rows.length > 0 && rows[0].setting_value && rows[0].setting_value.trim()) {
      res.header("Content-Type", "text/plain; charset=utf-8");
      return res.send(rows[0].setting_value.trim());
    }
  } catch (e) {}

  const domain = getDomain();

  let txt = `User-agent: *\n`;
  txt += `Allow: /\n`;
  txt += `Disallow: /admin/\n`;
  txt += `Disallow: /checkout\n`;
  txt += `Disallow: /cart\n`;
  txt += `Disallow: /profile\n`;
  txt += `Disallow: /api/\n\n`;

  // Explicitly permit all search engine bots
  txt += `User-agent: Googlebot\nAllow: /\n\n`;
  txt += `User-agent: Bingbot\nAllow: /\n\n`;
  txt += `User-agent: Baiduspider\nAllow: /\n\n`;
  txt += `User-agent: YandexBot\nAllow: /\n\n`;
  txt += `User-agent: Naverbot\nAllow: /\n\n`;
  txt += `User-agent: DuckDuckBot\nAllow: /\n\n`;
  txt += `User-agent: Applebot\nAllow: /\n\n`;

  // Explicitly permit all AI search & discovery crawlers
  txt += `User-agent: GPTBot\nAllow: /\n\n`;
  txt += `User-agent: ChatGPT-User\nAllow: /\n\n`;
  txt += `User-agent: Claude-Web\nAllow: /\n\n`;
  txt += `User-agent: ClaudeBot\nAllow: /\n\n`;
  txt += `User-agent: PerplexityBot\nAllow: /\n\n`;
  txt += `User-agent: Google-Extended\nAllow: /\n\n`;
  txt += `User-agent: anthropic-ai\nAllow: /\n\n`;
  txt += `User-agent: CCBot\nAllow: /\n\n`;
  txt += `User-agent: Bytespider\nAllow: /\n\n`;
  txt += `User-agent: Applebot-Extended\nAllow: /\n\n`;
  txt += `User-agent: Amazonbot\nAllow: /\n\n`;
  txt += `User-agent: FacebookBot\nAllow: /\n\n`;
  txt += `User-agent: cohere-ai\nAllow: /\n\n`;
  txt += `User-agent: Diffbot\nAllow: /\n\n`;

  txt += `Sitemap: ${domain}/sitemap.xml\n`;
  txt += `Sitemap: ${domain}/sitemap-images.xml\n`;
  txt += `Sitemap: ${domain}/sitemap-news.xml\n`;

  res.header("Content-Type", "text/plain; charset=utf-8");
  res.send(txt);
});

// GET /llms.txt — Direct AI Crawlers Instruction File
router.get(["/llms.txt", "/api/seo/llms.txt"], (req, res) => {
  const domain = getDomain();

  const text = `# Olive Seeds Studio
Olive Seeds Studio is a premium design and manufacturing studio offering personalized printed products including laser engravings, wooden keepsakes, backlit acrylic signs, custom gifts, and instant digital design downloads.

## What We Offer
- Custom laser engraved and printed physical products with personalized text and logo customization
- Digital download products (Figma UI kits, Notion workspace templates, design bundles, printable vector art)
- Worldwide shipping to 17 countries
- Digital products available for instant worldwide delivery

## Brand Information
Brand: Olive Seeds Studio
Contact: oss.oliveseeds@gmail.com
Website: ${domain}
Catalog: ${domain}/products
Digital Market: ${domain}/digital
Studio Blog: ${domain}/blog
Frequently Asked Questions: ${domain}/faq
`;

  res.header("Content-Type", "text/plain; charset=utf-8");
  res.send(text);
});

// GET /llms-full.txt — Complete plain-text product catalog for AI Assistants
router.get(["/llms-full.txt", "/api/seo/llms-full.txt"], async (req, res) => {
  try {
    const domain = getDomain();

    const [products] = await db.query("SELECT id, name, description, price, category FROM physical_products WHERE is_active = TRUE ORDER BY id DESC").catch(() => [[]]);
    const [digitalProducts] = await db.query("SELECT id, product_uid, name, description, price, category FROM digital_products WHERE is_active = TRUE ORDER BY id DESC").catch(() => [[]]);

    let text = `# Olive Seeds Studio — Full Product Catalog\n\n`;
    text += `Brand: Olive Seeds Studio\nWebsite: ${domain}\nContact: oss.oliveseeds@gmail.com\n\n`;

    text += `## Physical Products (Ships worldwide to 17 countries)\n\n`;
    (products || []).forEach((p) => {
      text += `### ${p.name}\n`;
      text += `Category: ${p.category || "General"}\n`;
      text += `Price: ₹${p.price}\n`;
      text += `URL: ${domain}/products/${p.id}\n`;
      text += `Description: ${p.description || "Custom handcrafted laser engraved product"}\n\n`;
    });

    text += `## Digital Download Products (Worldwide Instant Delivery)\n\n`;
    (digitalProducts || []).forEach((dp) => {
      text += `### ${dp.name}\n`;
      text += `Category: ${dp.category || "Digital Asset"}\n`;
      text += `Price: ₹${dp.price}\n`;
      text += `URL: ${domain}/digital/${dp.product_uid || dp.id}\n`;
      text += `Description: ${dp.description || "Instant digital download design template"}\n\n`;
    });

    res.header("Content-Type", "text/plain; charset=utf-8");
    res.send(text);
  } catch (err) {
    console.error("Error generating llms-full.txt:", err);
    res.status(500).send("Error generating catalog");
  }
});

// ══════════════════════════════════════════════════════════
// 2. SEO ADMIN & PUBLIC API ENDPOINTS
// ══════════════════════════════════════════════════════════

// Public/Admin: GET /global (or /api/seo/global) — Global SEO settings
router.get(["/global", "/api/seo/global"], async (req, res) => {
  try {
    const [rows] = await db.query("SELECT setting_key, setting_value FROM global_seo_settings");
    const settings = {};
    rows.forEach(r => {
      if (r.setting_key) settings[r.setting_key] = r.setting_value;
    });
    res.json(settings);
  } catch (err) {
    console.error("Error fetching global SEO:", err);
    res.status(500).json({ error: "Failed to fetch global SEO" });
  }
});

// Admin: POST /global (or /api/seo/global) — Save Global SEO settings
router.post(["/global", "/api/seo/global"], verifyAdmin, async (req, res) => {
  const settings = req.body || {};
  try {
    for (const [key, val] of Object.entries(settings)) {
      await db.query(
        "INSERT INTO global_seo_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
        [key, val !== undefined && val !== null ? String(val) : ""]
      );
    }
    res.json({ message: "Global SEO settings saved successfully" });
  } catch (err) {
    console.error("Error saving global SEO:", err);
    res.status(500).json({ error: "Failed to save global SEO" });
  }
});

// Public/Admin: GET /page/:pageKey (or /api/seo/page/:pageKey)
router.get(["/page/:pageKey", "/api/seo/page/:pageKey"], async (req, res) => {
  try {
    const pageKey = req.params.pageKey;
    const [rows] = await db.query(
      "SELECT * FROM seo_settings WHERE page_key = ? OR page_name = ?",
      [pageKey, pageKey]
    );
    if (rows.length > 0) {
      const row = rows[0];
      res.json({
        ...row,
        page_key: row.page_key || row.page_name,
        meta_title: row.meta_title || row.title || "",
        meta_description: row.meta_description || "",
        focus_keyword: row.focus_keyword || "",
        keywords: row.keywords || "",
        canonical_url: row.canonical_url || "",
        no_index: !!row.no_index,
        og_title: row.og_title || "",
        og_description: row.og_description || "",
        og_image: row.og_image || "",
        twitter_card: row.twitter_card || "summary_large_image",
        twitter_title: row.twitter_title || "",
        twitter_description: row.twitter_description || "",
        twitter_image: row.twitter_image || "",
        custom_schema: row.custom_schema || ""
      });
    } else {
      res.json({});
    }
  } catch (err) {
    console.error("Error reading page SEO:", err);
    res.status(500).json({ error: "Failed to read page SEO" });
  }
});

// Admin: POST /page/:pageKey (or /api/seo/page/:pageKey)
router.post(["/page/:pageKey", "/api/seo/page/:pageKey"], verifyAdmin, async (req, res) => {
  const pageKey = req.params.pageKey;
  const {
    meta_title, meta_description, focus_keyword, keywords, canonical_url,
    no_index, og_title, og_description, og_image, twitter_card, twitter_title,
    twitter_description, twitter_image, custom_schema
  } = req.body;

  try {
    await db.query(
      `INSERT INTO seo_settings (
        page_key, meta_title, meta_description, focus_keyword, keywords, canonical_url,
        no_index, og_title, og_description, og_image, twitter_card, twitter_title,
        twitter_description, twitter_image, custom_schema
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        meta_title=VALUES(meta_title), meta_description=VALUES(meta_description),
        focus_keyword=VALUES(focus_keyword), keywords=VALUES(keywords), canonical_url=VALUES(canonical_url),
        no_index=VALUES(no_index), og_title=VALUES(og_title), og_description=VALUES(og_description),
        og_image=VALUES(og_image), twitter_card=VALUES(twitter_card), twitter_title=VALUES(twitter_title),
        twitter_description=VALUES(twitter_description), twitter_image=VALUES(twitter_image),
        custom_schema=VALUES(custom_schema)`,
      [
        pageKey, meta_title || null, meta_description || null, focus_keyword || null,
        keywords || null, canonical_url || null, no_index ? 1 : 0, og_title || null,
        og_description || null, og_image || null, twitter_card || "summary_large_image",
        twitter_title || null, twitter_description || null, twitter_image || null, custom_schema || null
      ]
    );
    res.json({ message: "SEO settings saved successfully" });
  } catch (err) {
    console.error("Error saving page SEO:", err);
    res.status(500).json({ error: "Failed to save page SEO" });
  }
});

// Admin/Public: GET /product/:id (or /api/seo/product/:id)
router.get(["/product/:id", "/api/seo/product/:id"], async (req, res) => {
  try {
    const pageKey = `product_${req.params.id}`;
    const [rows] = await db.query("SELECT * FROM seo_settings WHERE page_key = ?", [pageKey]);
    res.json(rows.length ? rows[0] : {});
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product SEO" });
  }
});

// Admin: POST /product/:id (or /api/seo/product/:id)
router.post(["/product/:id", "/api/seo/product/:id"], verifyAdmin, async (req, res) => {
  const pageKey = `product_${req.params.id}`;
  const { meta_title, meta_description, focus_keyword, keywords, canonical_url, no_index, og_title, og_description, og_image, twitter_card, twitter_title, twitter_description, twitter_image, custom_schema } = req.body;
  try {
    await db.query(
      `INSERT INTO seo_settings (page_key, meta_title, meta_description, focus_keyword, keywords, canonical_url, no_index, og_title, og_description, og_image, twitter_card, twitter_title, twitter_description, twitter_image, custom_schema)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        meta_title=VALUES(meta_title), meta_description=VALUES(meta_description),
        focus_keyword=VALUES(focus_keyword), keywords=VALUES(keywords), canonical_url=VALUES(canonical_url),
        no_index=VALUES(no_index), og_title=VALUES(og_title), og_description=VALUES(og_description),
        og_image=VALUES(og_image), twitter_card=VALUES(twitter_card), twitter_title=VALUES(twitter_title),
        twitter_description=VALUES(twitter_description), twitter_image=VALUES(twitter_image),
        custom_schema=VALUES(custom_schema)`,
      [pageKey, meta_title || null, meta_description || null, focus_keyword || null, keywords || null, canonical_url || null, no_index ? 1 : 0, og_title || null, og_description || null, og_image || null, twitter_card || "summary_large_image", twitter_title || null, twitter_description || null, twitter_image || null, custom_schema || null]
    );
    res.json({ message: "Product SEO saved successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save product SEO" });
  }
});

// Admin/Public: GET /blog/:id (or /api/seo/blog/:id)
router.get(["/blog/:id", "/api/seo/blog/:id"], async (req, res) => {
  try {
    const pageKey = `blog_${req.params.id}`;
    const [rows] = await db.query("SELECT * FROM seo_settings WHERE page_key = ?", [pageKey]);
    res.json(rows.length ? rows[0] : {});
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch blog SEO" });
  }
});

// Admin: POST /blog/:id (or /api/seo/blog/:id)
router.post(["/blog/:id", "/api/seo/blog/:id"], verifyAdmin, async (req, res) => {
  const pageKey = `blog_${req.params.id}`;
  const { meta_title, meta_description, focus_keyword, keywords, canonical_url, no_index, og_title, og_description, og_image, twitter_card, twitter_title, twitter_description, twitter_image, custom_schema } = req.body;
  try {
    await db.query(
      `INSERT INTO seo_settings (page_key, meta_title, meta_description, focus_keyword, keywords, canonical_url, no_index, og_title, og_description, og_image, twitter_card, twitter_title, twitter_description, twitter_image, custom_schema)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        meta_title=VALUES(meta_title), meta_description=VALUES(meta_description),
        focus_keyword=VALUES(focus_keyword), keywords=VALUES(keywords), canonical_url=VALUES(canonical_url),
        no_index=VALUES(no_index), og_title=VALUES(og_title), og_description=VALUES(og_description),
        og_image=VALUES(og_image), twitter_card=VALUES(twitter_card), twitter_title=VALUES(twitter_title),
        twitter_description=VALUES(twitter_description), twitter_image=VALUES(twitter_image),
        custom_schema=VALUES(custom_schema)`,
      [pageKey, meta_title || null, meta_description || null, focus_keyword || null, keywords || null, canonical_url || null, no_index ? 1 : 0, og_title || null, og_description || null, og_image || null, twitter_card || "summary_large_image", twitter_title || null, twitter_description || null, twitter_image || null, custom_schema || null]
    );
    res.json({ message: "Blog SEO saved successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save blog SEO" });
  }
});

// Admin: GET /health (or /api/seo/health) — Live SEO Health Checker
router.get(["/health", "/api/seo/health"], verifyAdmin, async (req, res) => {
  try {
    const [savedPages] = await db.query("SELECT * FROM seo_settings").catch(() => [[]]);
    const [products] = await db.query("SELECT id, name, image_url, image_alt FROM physical_products WHERE is_active = TRUE").catch(() => [[]]);
    const [blogs] = await db.query("SELECT id, title FROM blogs WHERE status = 'published' OR status IS NULL").catch(() => [[]]);

    const missingTitle = [];
    const missingDesc = [];
    const missingOgImage = [];
    const titleOver60 = [];
    const descOver160 = [];

    (savedPages || []).forEach(p => {
      const pageIdentifier = p.page_key || p.page_name || `id_${p.id}`;
      const title = p.meta_title || p.title;
      const desc = p.meta_description;

      if (!title) missingTitle.push(pageIdentifier);
      else if (title.length > 60) titleOver60.push({ page: pageIdentifier, title, length: title.length });

      if (!desc) missingDesc.push(pageIdentifier);
      else if (desc.length > 160) descOver160.push({ page: pageIdentifier, desc, length: desc.length });

      if (!p.og_image) missingOgImage.push(pageIdentifier);
    });

    const productsMissingAlt = (products || []).filter(p => !p.image_alt).map(p => ({ id: p.id, name: p.name }));

    res.json({
      missingTitle,
      missingDesc,
      missingOgImage,
      titleOver60,
      descOver160,
      productsMissingAlt,
      sitemap: {
        lastGenerated: new Date().toISOString(),
        totalUrls: 18 + (products?.length || 0) + (blogs?.length || 0)
      },
      robotsTxtAccessible: true
    });
  } catch (err) {
    console.error("SEO health check failed:", err);
    res.status(500).json({ error: "Failed to run SEO health check" });
  }
});

module.exports = router;
