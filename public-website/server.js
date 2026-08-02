const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3001;
const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || "http://backend:5000/api";

const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".xml": "application/xml"
};

// Safe helper to perform internal HTTP GET requests to backend container
function getBackendData(urlPath) {
  return new Promise((resolve) => {
    http.get(`${BACKEND_URL}${urlPath}`, { timeout: 1500 }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(null);
        }
      });
    }).on("error", () => {
      resolve(null);
    });
  });
}

// Server listener
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // Determine file paths in React build folder
  const buildDir = path.join(__dirname, "build");
  let filePath = path.join(buildDir, pathname);

  // If path is folder/root, default to index.html
  if (pathname === "/" || !path.extname(filePath)) {
    filePath = path.join(buildDir, "index.html");
  }

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    filePath = path.join(buildDir, "index.html");
  }

  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || "application/octet-stream";

  // Check if we are serving index.html to inject SEO (Priority 7 - Prerendering)
  if (filePath.endsWith("index.html")) {
    fs.readFile(filePath, "utf8", async (err, content) => {
      if (err) {
        res.writeHead(500);
        return res.end("Error loading index.html template.");
      }

      let title = "Oliveseeds Creative Studio | Premium Custom Engravings & UI/UX Services";
      let desc = "Oliveseeds Creative Studio offers premium personalized laser engravings, custom gifts, acrylic and wood keepsakes, alongside professional UI/UX design systems.";
      let ogImage = "https://www.oliveseedsdesignstudio.com/logo512.png";
      let jsonLd = "";

      // Intercept paths and inject tags dynamically (Priority 7/9)
      try {
        if (pathname.startsWith("/products/")) {
          const prodId = pathname.split("/")[2];
          if (prodId) {
            const product = await getBackendData(`/products/${prodId}`);
            if (product) {
              title = `${product.name} | Custom Engravings | Oliveseeds Studio`;
              desc = `${product.name} by Oliveseeds Studio. ${product.description || ""}`;
              if (product.image_url) {
                ogImage = `https://www.oliveseedsdesignstudio.com${product.image_url}`;
              }
              jsonLd = `
              <script type="application/ld+json">
              {
                "@context": "https://schema.org",
                "@type": "Product",
                "name": "${product.name}",
                "image": "${ogImage}",
                "description": "${desc.replace(/"/g, '\\"')}",
                "sku": "${product.product_uid || 'PROD-' + product.id}",
                "offers": {
                  "@type": "Offer",
                  "url": "https://www.oliveseedsdesignstudio.com${pathname}",
                  "priceCurrency": "INR",
                  "price": "${product.price}",
                  "availability": "${product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'}"
                }
              }
              </script>`;
            }
          }
        } else if (pathname.startsWith("/digital/")) {
          const prodId = pathname.split("/")[2];
          if (prodId) {
            const product = await getBackendData(`/digital-products/${prodId}`);
            if (product) {
              title = `${product.name} | Creative Assets | Oliveseeds Studio`;
              desc = `${product.name} by Oliveseeds Studio. ${product.description || ""}`;
              if (product.thumbnail_url) {
                ogImage = `https://www.oliveseedsdesignstudio.com${product.thumbnail_url}`;
              }
              jsonLd = `
              <script type="application/ld+json">
              {
                "@context": "https://schema.org",
                "@type": "Product",
                "name": "${product.name}",
                "image": "${ogImage}",
                "description": "${desc.replace(/"/g, '\\"')}",
                "sku": "${product.product_uid || 'DIGITAL-' + product.id}",
                "offers": {
                  "@type": "Offer",
                  "url": "https://www.oliveseedsdesignstudio.com${pathname}",
                  "priceCurrency": "INR",
                  "price": "${product.price}",
                  "availability": "https://schema.org/InStock"
                }
              }
              </script>`;
            }
          }
        } else {
          // Fetch dynamic static page SEO settings from db (Priority 6)
          let activePage = "home";
          if (pathname.startsWith("/about")) activePage = "about";
          else if (pathname.startsWith("/contact")) activePage = "contact";
          else if (pathname.startsWith("/service")) activePage = "service";
          else if (pathname.startsWith("/blog")) activePage = "blogs";
          else if (pathname.startsWith("/catalog")) activePage = "products";

          const seoData = await getBackendData(`/seo/${activePage}`);
          if (seoData) {
            title = seoData.title.includes("Olive Seeds") ? seoData.title : `${seoData.title} | Olive Seeds`;
            desc = seoData.meta_description || desc;
          }
        }
      } catch (e) {
        console.error("Meta injection failure:", e.message);
      }

      // Perform string injection into template HTML (Priority 3/4/9/6)
      let html = content
        .replace("<title>React App</title>", `<title>${title}</title>`)
        .replace(
          'meta name="description" content="Olive Seeds Creative Studio | Premium personalized laser engravings, wood carvings, acrylic keepsakes, dynamic web applications, UI/UX systems and design packs."',
          `meta name="description" content="${desc.replace(/"/g, '&quot;')}"`
        )
        .replace(
          '<div id="root"></div>',
          `${jsonLd}<div id="root"></div>`
        );

      // Inject standard Open Graph tags if missing (Priority 9)
      const ogMeta = `
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="${desc.replace(/"/g, '&quot;')}" />
      <meta property="og:image" content="${ogImage}" />
      <meta property="og:url" content="https://www.oliveseedsdesignstudio.com${pathname}" />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      `;
      html = html.replace("</head>", `${ogMeta}</head>`);

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(html);
    });
  } else {
    // Serve standard static files
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404);
        res.end("File not found");
      } else {
        res.writeHead(200, { "Content-Type": contentType });
        res.end(content);
      }
    });
  }
});

server.listen(PORT, () => {
  console.log(`Frontend Static & SEO Server running on port ${PORT}`);
});
