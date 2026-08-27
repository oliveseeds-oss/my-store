const router = require("express").Router();
const db = require("../db");

// GET /sitemap.xml — Dynamic Sitemap Generator (Update 5)
router.get("/sitemap.xml", async (req, res) => {
  try {
    const domain = (process.env.PUBLIC_URL || process.env.REACT_APP_SITE_URL || "https://oliveseedsdesignstudio.com").replace(/\/$/, "");

    // Fetch published physical products
    const [products] = await db.query("SELECT id, updated_at FROM physical_products WHERE is_active = TRUE");

    // Fetch published digital products
    const [digitalProducts] = await db.query("SELECT id, product_uid, updated_at FROM digital_products WHERE is_active = TRUE");

    // Fetch published blog posts
    const [blogs] = await db.query("SELECT id, slug, updated_at, created_at FROM blogs WHERE status = 'published' OR status IS NULL");

    const formatDate = (d) => {
      if (!d) return new Date().toISOString().split("T")[0];
      return new Date(d).toISOString().split("T")[0];
    };

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static Core Pages
    xml += `  <url>\n    <loc>${domain}/</loc>\n    <lastmod>${formatDate(new Date())}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${domain}/products</loc>\n    <lastmod>${formatDate(new Date())}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${domain}/faq</loc>\n    <lastmod>${formatDate(new Date())}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${domain}/blog</loc>\n    <lastmod>${formatDate(new Date())}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;

    // Physical Products
    products.forEach((p) => {
      xml += `  <url>\n    <loc>${domain}/product/${p.id}</loc>\n    <lastmod>${formatDate(p.updated_at)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    // Digital Products
    digitalProducts.forEach((dp) => {
      xml += `  <url>\n    <loc>${domain}/product/digital/${dp.product_uid || dp.id}</loc>\n    <lastmod>${formatDate(dp.updated_at)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    // Blog Posts
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

// GET /robots.txt — Robots instructions (Update 5)
router.get("/robots.txt", (req, res) => {
  const domain = (process.env.PUBLIC_URL || process.env.REACT_APP_SITE_URL || "https://oliveseedsdesignstudio.com").replace(/\/$/, "");
  const txt = `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: ${domain}/sitemap.xml\n`;
  res.header("Content-Type", "text/plain");
  res.send(txt);
});

module.exports = router;
