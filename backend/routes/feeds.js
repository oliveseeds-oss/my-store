const router = require("express").Router();
const db = require("../db");

// In-memory feed cache (1 hour duration)
const cache = {
  google: { data: null, timestamp: 0, count: 0 },
  pinterest: { data: null, timestamp: 0, count: 0 },
  facebook: { data: null, timestamp: 0, count: 0 },
  bing: { data: null, timestamp: 0, count: 0 }
};

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

const getDomain = () => (process.env.SITE_URL || process.env.PUBLIC_URL || process.env.REACT_APP_SITE_URL || "https://oliveseedsdesignstudio.com").replace(/\/$/, "");

const stripHtml = (html) => {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
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

const mapGoogleCategory = (catName) => {
  if (!catName) return "Apparel &amp; Accessories";
  const lower = catName.toLowerCase();
  if (lower.includes("shirt") || lower.includes("apparel") || lower.includes("cloth")) return "Apparel &amp; Accessories &gt; Clothing";
  if (lower.includes("mug") || lower.includes("drinkware") || lower.includes("cup")) return "Home &amp; Garden &gt; Kitchen &amp; Dining &gt; Tableware &gt; Drinkware";
  if (lower.includes("canvas") || lower.includes("art") || lower.includes("print") || lower.includes("decor")) return "Home &amp; Garden &gt; Decor &gt; Artwork";
  if (lower.includes("digital") || lower.includes("template") || lower.includes("download")) return "Arts &amp; Entertainment &gt; Party &amp; Celebration";
  return "Apparel &amp; Accessories";
};

async function generateXmlFeed(feedType) {
  const domain = getDomain();

  let physicalProducts = [];
  let digitalProducts = [];

  try {
    const [pRows] = await db.query("SELECT * FROM products WHERE is_active = TRUE ORDER BY id DESC").catch(() => [[]]);
    if (pRows && pRows.length) {
      physicalProducts = pRows;
    } else {
      const [physRows] = await db.query("SELECT * FROM physical_products WHERE is_active = TRUE ORDER BY id DESC").catch(() => [[]]);
      physicalProducts = physRows || [];
    }
  } catch (e) {
    physicalProducts = [];
  }

  try {
    const [dRows] = await db.query("SELECT * FROM digital_products WHERE is_active = TRUE ORDER BY id DESC").catch(() => [[]]);
    digitalProducts = dRows || [];
  } catch (e) {
    digitalProducts = [];
  }

  let items = [];
  let count = 0;

  // Process Physical Products
  physicalProducts.forEach((p) => {
    count++;
    const fullImgUrl = p.image_url ? (p.image_url.startsWith("http") ? p.image_url : `${domain}${p.image_url}`) : `${domain}/logo192.png`;
    const secImgUrl = p.image_url_2 ? (p.image_url_2.startsWith("http") ? p.image_url_2 : `${domain}${p.image_url_2}`) : null;
    const availability = (p.stock === 0 || p.stock === "0") ? "out of stock" : "in stock";
    const googleCategory = mapGoogleCategory(p.category);

    let itemXml = `    <item>\n`;
    itemXml += `      <g:id>PHYSICAL-${p.id}</g:id>\n`;
    itemXml += `      <g:title>${escapeXml(p.name)}</g:title>\n`;
    itemXml += `      <g:description>${escapeXml(stripHtml(p.description || p.name))}</g:description>\n`;
    itemXml += `      <g:link>${domain}/product/${p.id}</g:link>\n`;
    itemXml += `      <g:image_link>${escapeXml(fullImgUrl)}</g:image_link>\n`;
    if (secImgUrl) {
      itemXml += `      <g:additional_image_link>${escapeXml(secImgUrl)}</g:additional_image_link>\n`;
    }
    itemXml += `      <g:price>${p.price} INR</g:price>\n`;
    itemXml += `      <g:availability>${availability}</g:availability>\n`;
    itemXml += `      <g:condition>new</g:condition>\n`;
    itemXml += `      <g:brand>Olive Seeds Studio</g:brand>\n`;
    itemXml += `      <g:identifier_exists>no</g:identifier_exists>\n`;
    itemXml += `      <g:product_type>${escapeXml(p.category || "Custom Printed Product")}</g:product_type>\n`;
    if (feedType === "pinterest") {
      itemXml += `      <g:google_product_category>${googleCategory}</g:google_product_category>\n`;
    }
    itemXml += `      <g:shipping>\n        <g:country>IN</g:country>\n        <g:price>0 INR</g:price>\n      </g:shipping>\n`;
    itemXml += `      <g:custom_label_0>custom-print</g:custom_label_0>\n`;
    itemXml += `    </item>`;
    items.push(itemXml);
  });

  // Process Digital Products (Excluded from Pinterest feed)
  if (feedType !== "pinterest") {
    digitalProducts.forEach((dp) => {
      count++;
      const fullImgUrl = dp.thumbnail_url ? (dp.thumbnail_url.startsWith("http") ? dp.thumbnail_url : `${domain}${dp.thumbnail_url}`) : `${domain}/logo192.png`;

      let itemXml = `    <item>\n`;
      itemXml += `      <g:id>DIGITAL-${dp.product_uid || dp.id}</g:id>\n`;
      itemXml += `      <g:title>${escapeXml(dp.name)}</g:title>\n`;
      itemXml += `      <g:description>${escapeXml(stripHtml(dp.description || dp.name))}</g:description>\n`;
      itemXml += `      <g:link>${domain}/product/digital/${dp.product_uid || dp.id}</g:link>\n`;
      itemXml += `      <g:image_link>${escapeXml(fullImgUrl)}</g:image_link>\n`;
      itemXml += `      <g:price>${dp.price} INR</g:price>\n`;
      itemXml += `      <g:availability>in stock</g:availability>\n`;
      itemXml += `      <g:condition>new</g:condition>\n`;
      itemXml += `      <g:brand>Olive Seeds Studio</g:brand>\n`;
      itemXml += `      <g:identifier_exists>no</g:identifier_exists>\n`;
      itemXml += `      <g:product_type>Digital Download</g:product_type>\n`;
      itemXml += `      <g:shipping>\n        <g:country>IN</g:country>\n        <g:price>0 INR</g:price>\n      </g:shipping>\n`;
      itemXml += `      <g:custom_label_0>digital-download</g:custom_label_0>\n`;
      itemXml += `    </item>`;
      items.push(itemXml);
    });
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">\n`;
  xml += `  <channel>\n`;
  xml += `    <title>Olive Seeds Studio</title>\n`;
  xml += `    <link>${domain}</link>\n`;
  xml += `    <description>Custom printed products &amp; digital downloads</description>\n`;
  xml += items.join("\n") + "\n";
  xml += `  </channel>\n`;
  xml += `</rss>`;

  return { xml, count };
}

async function getCachedFeed(feedType, forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cache[feedType].data && (now - cache[feedType].timestamp) < CACHE_DURATION) {
    return cache[feedType];
  }

  const { xml, count } = await generateXmlFeed(feedType);
  cache[feedType] = {
    data: xml,
    timestamp: now,
    count
  };
  return cache[feedType];
}

// ROUTE 1: GET /feeds/google-shopping.xml
router.get("/google-shopping.xml", async (req, res) => {
  try {
    const feed = await getCachedFeed("google", req.query.refresh === "true");
    res.header("Content-Type", "application/xml; charset=utf-8");
    res.send(feed.data);
  } catch (err) {
    console.error("Error serving Google Shopping feed:", err);
    res.status(500).send("Error generating Google Shopping feed");
  }
});

// ROUTE 2: GET /feeds/pinterest.xml
router.get("/pinterest.xml", async (req, res) => {
  try {
    const feed = await getCachedFeed("pinterest", req.query.refresh === "true");
    res.header("Content-Type", "application/xml; charset=utf-8");
    res.send(feed.data);
  } catch (err) {
    console.error("Error serving Pinterest feed:", err);
    res.status(500).send("Error generating Pinterest feed");
  }
});

// ROUTE 3: GET /feeds/facebook.xml
router.get("/facebook.xml", async (req, res) => {
  try {
    const feed = await getCachedFeed("facebook", req.query.refresh === "true");
    res.header("Content-Type", "application/xml; charset=utf-8");
    res.send(feed.data);
  } catch (err) {
    console.error("Error serving Facebook feed:", err);
    res.status(500).send("Error generating Facebook feed");
  }
});

// ROUTE 4: GET /feeds/bing.xml
router.get("/bing.xml", async (req, res) => {
  try {
    const feed = await getCachedFeed("bing", req.query.refresh === "true");
    res.header("Content-Type", "application/xml; charset=utf-8");
    res.send(feed.data);
  } catch (err) {
    console.error("Error serving Bing Shopping feed:", err);
    res.status(500).send("Error generating Bing Shopping feed");
  }
});

// ROUTE 6 (ADMIN API): GET /api/admin/feeds/status
router.get("/status/all", async (req, res) => {
  try {
    const google = await getCachedFeed("google");
    const pinterest = await getCachedFeed("pinterest");
    const facebook = await getCachedFeed("facebook");
    const bing = await getCachedFeed("bing");

    res.json({
      google: { count: google.count, timestamp: google.timestamp },
      pinterest: { count: pinterest.count, timestamp: pinterest.timestamp },
      facebook: { count: facebook.count, timestamp: facebook.timestamp },
      bing: { count: bing.count, timestamp: bing.timestamp }
    });
  } catch (err) {
    console.error("Error getting feed status:", err);
    res.status(500).json({ error: "Failed to get feed status" });
  }
});

// ROUTE 6 (ADMIN API): POST /api/admin/feeds/regenerate
router.post("/regenerate", async (req, res) => {
  try {
    await getCachedFeed("google", true);
    await getCachedFeed("pinterest", true);
    await getCachedFeed("facebook", true);
    await getCachedFeed("bing", true);
    res.json({ message: "All feeds regenerated successfully" });
  } catch (err) {
    console.error("Error regenerating feeds:", err);
    res.status(500).json({ error: "Failed to regenerate feeds" });
  }
});

module.exports = router;
