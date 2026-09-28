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
      let globalTags = "";

      try {
        // Fetch global SEO settings to inject verification tags
        const globalSeo = await getBackendData("/seo/global");
        if (globalSeo) {
           if (globalSeo.google_verify_code) globalTags += `<meta name="google-site-verification" content="${globalSeo.google_verify_code}" />\n`;
           if (globalSeo.pinterest_verify_code) globalTags += `<meta name="p:domain_verify" content="${globalSeo.pinterest_verify_code}" />\n`;
           if (globalSeo.bing_verify_code) globalTags += `<meta name="msvalidate.01" content="${globalSeo.bing_verify_code}" />\n`;
           if (globalSeo.yandex_verify_code) globalTags += `<meta name="yandex-verification" content="${globalSeo.yandex_verify_code}" />\n`;
           if (globalSeo.baidu_verify_code) globalTags += `<meta name="baidu-site-verification" content="${globalSeo.baidu_verify_code}" />\n`;
           
           if (globalSeo.ga4_id) {
              globalTags += `<script async src="https://www.googletagmanager.com/gtag/js?id=${globalSeo.ga4_id}"></script>
              <script>
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${globalSeo.ga4_id}');
              </script>\n`;
           }
        }

        // Intercept paths and inject tags dynamically
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

              // Apply custom SEO from SEO Manager if saved
              const productSeo = await getBackendData(`/seo/product/${prodId}`);
              if (productSeo && Object.keys(productSeo).length > 0) {
                if (productSeo.meta_title) title = productSeo.meta_title;
                if (productSeo.meta_description) desc = productSeo.meta_description;
                if (productSeo.og_image) ogImage = productSeo.og_image;
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
        } else if (pathname.startsWith("/blog/")) {
          const blogId = pathname.split("/")[2];
          if (blogId) {
             const blogSeo = await getBackendData(`/seo/blog/${blogId}`);
             if (blogSeo && Object.keys(blogSeo).length > 0) {
                if (blogSeo.meta_title) title = blogSeo.meta_title;
                if (blogSeo.meta_description) desc = blogSeo.meta_description;
                if (blogSeo.og_image) ogImage = blogSeo.og_image;
             }
          }
        } else {
          // Fetch dynamic static page SEO settings from db
          let activePage = "home";
          if (pathname.startsWith("/about")) activePage = "about";
          else if (pathname.startsWith("/contact")) activePage = "contact";
          else if (pathname.startsWith("/service")) activePage = "service";
          else if (pathname.startsWith("/blog")) activePage = "blog"; // Note it was 'blogs' before but the key is 'blog' in STATIC_PAGES
          else if (pathname.startsWith("/catalog")) activePage = "catalog"; // previously it used 'products', but STATIC_PAGES uses 'catalog' for /catalog
          else if (pathname.startsWith("/products")) activePage = "products";
          else if (pathname.startsWith("/digital")) activePage = "digital";

          // Fixed the URL to match backend's /seo/page/:pageKey
          const seoData = await getBackendData(`/seo/page/${activePage}`);
          if (seoData && Object.keys(seoData).length > 0) {
            title = seoData.meta_title || seoData.title || title;
            desc = seoData.meta_description || desc;
            if (seoData.og_image) ogImage = seoData.og_image;
          }
        }
      } catch (e) {
        console.error("Meta injection failure:", e.message);
      }

      // Perform string injection into template HTML
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

      // Inject standard Open Graph and Global tags
      const ogMeta = `
      ${globalTags}
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
