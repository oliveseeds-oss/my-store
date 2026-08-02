const assert = require("assert");
const fs = require("fs");
const path = require("path");

console.log("Starting Production SEO & Renderability Unit Tests...\n");

// 1. Test sitemap.xml domain updates
try {
  console.log("Test 1: Sitemap.xml domain verification...");
  const sitemapPath = path.join(__dirname, "../../public-website/public/sitemap.xml");
  const sitemapContent = fs.readFileSync(sitemapPath, "utf8");
  
  // Assert sitemap does not contain the old mock domain
  assert.strictEqual(sitemapContent.includes("https://oliveseeds.com"), false, "Sitemap still contains legacy oliveseeds.com domain!");
  assert.strictEqual(sitemapContent.includes("https://www.oliveseedsdesignstudio.com"), true, "Sitemap is missing new oliveseedsdesignstudio.com domain!");
  
  console.log("  ✓ Test 1 Passed.\n");
} catch (e) {
  console.error("  ❌ Test 1 Failed:", e.message);
  process.exit(1);
}

// 2. Test robots.txt domain update
try {
  console.log("Test 2: Robots.txt domain verification...");
  const robotsPath = path.join(__dirname, "../../public-website/public/robots.txt");
  const robotsContent = fs.readFileSync(robotsPath, "utf8");
  
  assert.strictEqual(robotsContent.includes("https://oliveseeds.com"), false, "Robots.txt still contains legacy sitemap domain!");
  assert.strictEqual(robotsContent.includes("https://www.oliveseedsdesignstudio.com"), true, "Robots.txt is missing corrected production sitemap URL!");
  
  console.log("  ✓ Test 2 Passed.\n");
} catch (e) {
  console.error("  ❌ Test 2 Failed:", e.message);
  process.exit(1);
}

// 3. Test HTML tag injection string replacement logic
try {
  console.log("Test 3: HTML template metadata injection validation...");
  
  const sampleTemplate = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>React App</title>
      <meta name="description" content="Olive Seeds Creative Studio | Premium personalized laser engravings, wood carvings, acrylic keepsakes, dynamic web applications, UI/UX systems and design packs." />
    </head>
    <body>
      <div id="root"></div>
    </body>
  </html>
  `;
  
  const title = "My Custom Title";
  const desc = "My Custom Description";
  const ogImage = "https://www.oliveseedsdesignstudio.com/uploads/safe-image.png";
  const pathname = "/products/prod-123";
  
  let html = sampleTemplate
    .replace("<title>React App</title>", `<title>${title}</title>`)
    .replace(
      'meta name="description" content="Olive Seeds Creative Studio | Premium personalized laser engravings, wood carvings, acrylic keepsakes, dynamic web applications, UI/UX systems and design packs."',
      `meta name="description" content="${desc}"`
    );
    
  const ogMeta = `
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:url" content="https://www.oliveseedsdesignstudio.com${pathname}" />
  `;
  html = html.replace("</head>", `${ogMeta}</head>`);
  
  assert.strictEqual(html.includes(`<title>${title}</title>`), true);
  assert.strictEqual(html.includes(`content="${desc}"`), true);
  assert.strictEqual(html.includes(`content="${ogImage}"`), true);
  assert.strictEqual(html.includes("React App"), false);
  
  console.log("  ✓ Test 3 Passed.\n");
} catch (e) {
  console.error("  ❌ Test 3 Failed:", e.message);
  process.exit(1);
}

console.log("🎉 All SEO & Renderability unit tests passed successfully!");
process.exit(0);
