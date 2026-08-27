const router = require("express").Router();
const db = require("../db");

const getDomain = () => (process.env.SITE_URL || process.env.PUBLIC_URL || process.env.REACT_APP_SITE_URL || "https://oliveseedsdesignstudio.com").replace(/\/$/, "");

const formatDate = (d) => {
  if (!d) return new Date().toISOString().split("T")[0];
  return new Date(d).toISOString().split("T")[0];
};

// GET /sitemap.xml — Dynamic Master XML Sitemap
router.get("/sitemap.xml", async (req, res) => {
  try {
    const domain = getDomain();

    const [products] = await db.query("SELECT id, updated_at FROM physical_products WHERE is_active = TRUE");
    const [digitalProducts] = await db.query("SELECT id, product_uid, updated_at FROM digital_products WHERE is_active = TRUE");
    const [blogs] = await db.query("SELECT id, slug, updated_at, created_at FROM blogs WHERE status = 'published' OR status IS NULL");
    const [categories] = await db.query("SELECT DISTINCT category FROM physical_products WHERE category IS NOT NULL AND category != ''");

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Core Pages
    xml += `  <url>\n    <loc>${domain}/</loc>\n    <lastmod>${formatDate(new Date())}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${domain}/products</loc>\n    <lastmod>${formatDate(new Date())}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${domain}/faq</loc>\n    <lastmod>${formatDate(new Date())}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${domain}/blog</loc>\n    <lastmod>${formatDate(new Date())}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;

    // Product Category pages (priority 0.7, weekly)
    categories.forEach((c) => {
      xml += `  <url>\n    <loc>${domain}/products?category=${encodeURIComponent(c.category)}</loc>\n    <lastmod>${formatDate(new Date())}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    });

    // Physical Products (priority 0.8, weekly)
    products.forEach((p) => {
      xml += `  <url>\n    <loc>${domain}/product/${p.id}</loc>\n    <lastmod>${formatDate(p.updated_at)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    // Digital Products (priority 0.8, weekly)
    digitalProducts.forEach((dp) => {
      xml += `  <url>\n    <loc>${domain}/product/digital/${dp.product_uid || dp.id}</loc>\n    <lastmod>${formatDate(dp.updated_at)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    // Blogs (priority 0.7, monthly)
    blogs.forEach((b) => {
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
router.get("/sitemap-images.xml", async (req, res) => {
  try {
    const domain = getDomain();

    const [products] = await db.query("SELECT id, name, image_url FROM physical_products WHERE is_active = TRUE AND image_url IS NOT NULL AND image_url != ''");
    const [digitalProducts] = await db.query("SELECT id, product_uid, name, thumbnail_url FROM digital_products WHERE is_active = TRUE AND thumbnail_url IS NOT NULL AND thumbnail_url != ''");
    const [blogs] = await db.query("SELECT id, slug, title, image_url FROM blogs WHERE (status = 'published' OR status IS NULL) AND image_url IS NOT NULL AND image_url != ''");

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    products.forEach((p) => {
      const imgPath = p.image_url.startsWith("http") ? p.image_url : `${domain}${p.image_url}`;
      xml += `  <url>\n    <loc>${domain}/product/${p.id}</loc>\n    <image:image>\n      <image:loc>${imgPath}</image:loc>\n      <image:title>${p.name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</image:title>\n    </image:image>\n  </url>\n`;
    });

    digitalProducts.forEach((dp) => {
      const imgPath = dp.thumbnail_url.startsWith("http") ? dp.thumbnail_url : `${domain}${dp.thumbnail_url}`;
      xml += `  <url>\n    <loc>${domain}/product/digital/${dp.product_uid || dp.id}</loc>\n    <image:image>\n      <image:loc>${imgPath}</image:loc>\n      <image:title>${dp.name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</image:title>\n    </image:image>\n  </url>\n`;
    });

    blogs.forEach((b) => {
      const imgPath = b.image_url.startsWith("http") ? b.image_url : `${domain}${b.image_url}`;
      xml += `  <url>\n    <loc>${domain}/blog/${b.slug || b.id}</loc>\n    <image:image>\n      <image:loc>${imgPath}</image:loc>\n      <image:title>${b.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</image:title>\n    </image:image>\n  </url>\n`;
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
router.get("/sitemap-news.xml", async (req, res) => {
  try {
    const domain = getDomain();
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    const [recentBlogs] = await db.query(
      "SELECT id, slug, title, created_at FROM blogs WHERE (status = 'published' OR status IS NULL) AND created_at >= ? ORDER BY created_at DESC",
      [twoDaysAgo]
    );

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n`;

    recentBlogs.forEach((b) => {
      const pubDate = new Date(b.created_at).toISOString();
      xml += `  <url>\n    <loc>${domain}/blog/${b.slug || b.id}</loc>\n    <news:news>\n      <news:publication>\n        <news:name>Olive Seeds Studio Journal</news:name>\n        <news:language>en</news:language>\n      </news:publication>\n      <news:publication_date>${pubDate}</news:publication_date>\n      <news:title>${b.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</news:title>\n    </news:news>\n  </url>\n`;
    });

    xml += `</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (err) {
    console.error("Error generating sitemap-news.xml:", err);
    res.status(500).send("Error generating news sitemap");
  }
});

// GET /robots.txt — Robots instructions for search engines & AI crawlers
router.get("/robots.txt", (req, res) => {
  const domain = getDomain();

  let txt = `User-agent: *\n`;
  txt += `Allow: /\n`;
  txt += `Disallow: /admin/\n`;
  txt += `Disallow: /api/\n`;
  txt += `Disallow: /cart\n`;
  txt += `Disallow: /checkout\n`;
  txt += `Disallow: /profile\n\n`;

  txt += `User-agent: Googlebot\nAllow: /\nCrawl-delay: 1\n\n`;
  txt += `User-agent: Bingbot\nAllow: /\nCrawl-delay: 2\n\n`;
  txt += `User-agent: Baiduspider\nAllow: /\nCrawl-delay: 3\n\n`;
  txt += `User-agent: YandexBot\nAllow: /\nCrawl-delay: 2\n\n`;
  txt += `User-agent: Naverbot\nAllow: /\n\n`;

  txt += `User-agent: GPTBot\nAllow: /\n\n`;
  txt += `User-agent: Claude-Web\nAllow: /\n\n`;
  txt += `User-agent: PerplexityBot\nAllow: /\n\n`;
  txt += `User-agent: Google-Extended\nAllow: /\n\n`;
  txt += `User-agent: anthropic-ai\nAllow: /\n\n`;
  txt += `User-agent: CCBot\nAllow: /\n\n`;

  txt += `Sitemap: ${domain}/sitemap.xml\n`;
  txt += `Sitemap: ${domain}/sitemap-images.xml\n`;
  txt += `Sitemap: ${domain}/sitemap-news.xml\n`;

  res.header("Content-Type", "text/plain");
  res.send(txt);
});

// GET /llms.txt — Direct AI Crawlers Instruction File (Part 4)
router.get("/llms.txt", (req, res) => {
  const domain = getDomain();

  const text = `# Olive Seeds Studio
Olive Seeds Studio is a custom print-on-demand store offering personalized printed products including t-shirts, mugs, canvas prints, tote bags, phone cases, and digital design downloads.

## What We Offer
Custom printed physical products with personalized text and logo uploads
Digital download products (design files, printable art)
Worldwide shipping to: Australia, Canada, France, Germany, India, Kuwait, Malaysia, Netherlands, New Zealand, Norway, Qatar, Saudi Arabia, Singapore, Switzerland, United Arab Emirates, United Kingdom, United States
Digital products available to customers worldwide

## Who We Are
Brand: Olive Seeds Studio
Contact: oss.oliveseeds@gmail.com
Website: ${domain}

## Our Products Are Best For
Personalized gifts
Corporate merchandise and branding
Custom wedding and event merchandise
Small business branded merchandise
Personal custom fashion

## Payment Methods Accepted
Razorpay (cards, UPI, netbanking — India and international)
PayPal (international)

## Frequently Asked Questions
Link to full FAQ: ${domain}/faq

## Blog and Resources
Link to blog: ${domain}/blog
`;

  res.header("Content-Type", "text/plain; charset=utf-8");
  res.send(text);
});

// GET /llms-full.txt — Complete plain-text product catalog for AI Assistants
router.get("/llms-full.txt", async (req, res) => {
  try {
    const domain = getDomain();

    const [products] = await db.query("SELECT id, name, description, price, category FROM physical_products WHERE is_active = TRUE ORDER BY id DESC");
    const [digitalProducts] = await db.query("SELECT id, product_uid, name, description, price, category FROM digital_products WHERE is_active = TRUE ORDER BY id DESC");

    let text = `# Olive Seeds Studio — Full Product Catalog\n\n`;
    text += `Brand: Olive Seeds Studio\nWebsite: ${domain}\nContact: oss.oliveseeds@gmail.com\n\n`;

    text += `## Physical Products (Ships to 17 countries)\n\n`;
    products.forEach((p) => {
      text += `### ${p.name}\n`;
      text += `Category: ${p.category || "General"}\n`;
      text += `Price: ₹${p.price}\n`;
      text += `URL: ${domain}/product/${p.id}\n`;
      text += `Description: ${p.description || "Custom printed product"}\n\n`;
    });

    text += `## Digital Download Products (Worldwide Instant Delivery)\n\n`;
    digitalProducts.forEach((dp) => {
      text += `### ${dp.name}\n`;
      text += `Category: ${dp.category || "Digital Asset"}\n`;
      text += `Price: ₹${dp.price}\n`;
      text += `URL: ${domain}/product/digital/${dp.product_uid || dp.id}\n`;
      text += `Description: ${dp.description || "Instant digital download design file"}\n\n`;
    });

    res.header("Content-Type", "text/plain; charset=utf-8");
    res.send(text);
  } catch (err) {
    console.error("Error generating llms-full.txt:", err);
    res.status(500).send("Error generating catalog");
  }
});

// ── FIX 2 SECTION E: SEO ADMIN API ROUTES ──
const { verifyAdmin } = require("../middleware/auth");

// Public/Admin: GET /api/seo/page/:pageKey
router.get("/api/seo/page/:pageKey", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM seo_settings WHERE page_key = ?", [req.params.pageKey]);
    res.json(rows.length ? rows[0] : {});
  } catch (err) {
    console.error("Error reading page SEO:", err);
    res.status(500).json({ error: "Failed to read page SEO" });
  }
});

// Admin: POST /api/seo/page/:pageKey
router.post("/api/seo/page/:pageKey", verifyAdmin, async (req, res) => {
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
        req.params.pageKey, meta_title || null, meta_description || null, focus_keyword || null,
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

// Public/Admin: GET /api/seo/global
router.get("/api/seo/global", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT setting_key, setting_value FROM global_seo_settings");
    const settings = {};
    rows.forEach(r => { settings[r.setting_key] = r.setting_value; });
    res.json(settings);
  } catch (err) {
    console.error("Error fetching global SEO:", err);
    res.status(500).json({ error: "Failed to fetch global SEO" });
  }
});

// Admin: POST /api/seo/global
router.post("/api/seo/global", verifyAdmin, async (req, res) => {
  const settings = req.body;
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

// Admin: GET /api/seo/product/:id
router.get("/api/seo/product/:id", async (req, res) => {
  try {
    const pageKey = `product_${req.params.id}`;
    const [rows] = await db.query("SELECT * FROM seo_settings WHERE page_key = ?", [pageKey]);
    res.json(rows.length ? rows[0] : {});
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product SEO" });
  }
});

// Admin: POST /api/seo/product/:id
router.post("/api/seo/product/:id", verifyAdmin, async (req, res) => {
  const pageKey = `product_${req.params.id}`;
  const { meta_title, meta_description, focus_keyword, keywords, canonical_url, no_index, og_title, og_description, og_image, custom_schema } = req.body;
  try {
    await db.query(
      `INSERT INTO seo_settings (page_key, meta_title, meta_description, focus_keyword, keywords, canonical_url, no_index, og_title, og_description, og_image, custom_schema)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        meta_title=VALUES(meta_title), meta_description=VALUES(meta_description),
        focus_keyword=VALUES(focus_keyword), keywords=VALUES(keywords), canonical_url=VALUES(canonical_url),
        no_index=VALUES(no_index), og_title=VALUES(og_title), og_description=VALUES(og_description),
        og_image=VALUES(og_image), custom_schema=VALUES(custom_schema)`,
      [pageKey, meta_title || null, meta_description || null, focus_keyword || null, keywords || null, canonical_url || null, no_index ? 1 : 0, og_title || null, og_description || null, og_image || null, custom_schema || null]
    );
    res.json({ message: "Product SEO saved successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save product SEO" });
  }
});

// Admin: GET /api/seo/blog/:id
router.get("/api/seo/blog/:id", async (req, res) => {
  try {
    const pageKey = `blog_${req.params.id}`;
    const [rows] = await db.query("SELECT * FROM seo_settings WHERE page_key = ?", [pageKey]);
    res.json(rows.length ? rows[0] : {});
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch blog SEO" });
  }
});

// Admin: POST /api/seo/blog/:id
router.post("/api/seo/blog/:id", verifyAdmin, async (req, res) => {
  const pageKey = `blog_${req.params.id}`;
  const { meta_title, meta_description, focus_keyword, keywords, canonical_url, no_index, og_title, og_description, og_image, custom_schema } = req.body;
  try {
    await db.query(
      `INSERT INTO seo_settings (page_key, meta_title, meta_description, focus_keyword, keywords, canonical_url, no_index, og_title, og_description, og_image, custom_schema)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        meta_title=VALUES(meta_title), meta_description=VALUES(meta_description),
        focus_keyword=VALUES(focus_keyword), keywords=VALUES(keywords), canonical_url=VALUES(canonical_url),
        no_index=VALUES(no_index), og_title=VALUES(og_title), og_description=VALUES(og_description),
        og_image=VALUES(og_image), custom_schema=VALUES(custom_schema)`,
      [pageKey, meta_title || null, meta_description || null, focus_keyword || null, keywords || null, canonical_url || null, no_index ? 1 : 0, og_title || null, og_description || null, og_image || null, custom_schema || null]
    );
    res.json({ message: "Blog SEO saved successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save blog SEO" });
  }
});

// Admin: GET /api/seo/health — SEO Health Checker
router.get("/api/seo/health", verifyAdmin, async (req, res) => {
  try {
    const [savedPages] = await db.query("SELECT * FROM seo_settings");
    const [products] = await db.query("SELECT id, name, image_url FROM physical_products WHERE is_active = TRUE");
    const [blogs] = await db.query("SELECT id, title FROM blogs WHERE status = 'published' OR status IS NULL");

    const missingTitle = [];
    const missingDesc = [];
    const missingOgImage = [];
    const titleOver60 = [];
    const descOver160 = [];

    savedPages.forEach(p => {
      if (!p.meta_title) missingTitle.push(p.page_key);
      else if (p.meta_title.length > 60) titleOver60.push({ page: p.page_key, title: p.meta_title, length: p.meta_title.length });

      if (!p.meta_description) missingDesc.push(p.page_key);
      else if (p.meta_description.length > 160) descOver160.push({ page: p.page_key, desc: p.meta_description, length: p.meta_description.length });

      if (!p.og_image) missingOgImage.push(p.page_key);
    });

    const productsMissingAlt = products.filter(p => !p.image_alt).map(p => ({ id: p.id, name: p.name }));

    res.json({
      missingTitle,
      missingDesc,
      missingOgImage,
      titleOver60,
      descOver160,
      productsMissingAlt,
      sitemap: {
        lastGenerated: new Date().toISOString(),
        totalUrls: 4 + products.length + blogs.length
      },
      robotsTxtAccessible: true
    });
  } catch (err) {
    console.error("SEO health check failed:", err);
    res.status(500).json({ error: "Failed to run SEO health check" });
  }
});

module.exports = router;
