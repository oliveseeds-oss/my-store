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

module.exports = router;
