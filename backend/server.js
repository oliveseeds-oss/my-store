require("dotenv").config();
const { runStartupValidation } = require("./startup-check");

async function startServer() {
  // 1. Run startup check before initializing routes or starting server
  await runStartupValidation();

  // 2. Initialize application
  const express = require("express");
  const cors = require("cors");
  const path = require("path");

  const app = express();

  const corsOptions = {
    origin: function (origin, callback) {
      const allowedOrigins = [
        "https://adminosspanel.oliveseedsdesignstudio.com",
        "https://oliveseedsdesignstudio.com",
        "https://www.oliveseedsdesignstudio.com",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://localhost:5174"
      ];
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith("oliveseedsdesignstudio.com")) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy: Origin not allowed: " + origin));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Cache-Control",
      "Pragma",
      "X-Access-Token"
    ],
    credentials: true,
    optionsSuccessStatus: 200,
    preflightContinue: false
  };

  app.use(cors(corsOptions));
  app.options(/(.*)/, cors(corsOptions));

  // Fallback explicit preflight handler for reverse proxies
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, Pragma, X-Access-Token");
    }
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
    next();
  });

  app.use(express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  }));

  // Serve uploads statically
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  // Routes
  app.use("/api/uploads", require("./routes/uploads"));
  app.use("/api/admin", require("./routes/admin"));
  app.use("/api/products", require("./routes/products"));
  app.use("/api/digital-products", require("./routes/digitalProducts"));
  app.use("/api/orders", require("./routes/orders"));
  app.use("/api/members", require("./routes/members"));
  app.use("/api/blogs", require("./routes/blogs"));
  app.use("/api/contact", require("./routes/contact"));
  app.use("/api/bulk-orders", require("./routes/bulkOrders"));
  app.use("/api/design-inquiries", require("./routes/designInquiries"));
  app.use("/api/digital-inquiries", require("./routes/digitalInquiries"));
  app.use("/api/ads", require("./routes/ads"));
  app.use("/api/analytics", require("./routes/analytics"));
  app.use("/api/settings", require("./routes/settings"));
  app.use("/api/categories", require("./routes/categories"));
  app.use("/api/reviews", require("./routes/reviews"));
  app.use("/api/currency", require("./routes/currency"));
  app.use("/api/notifications", require("./routes/notifications"));
  app.use("/api/visitors", require("./routes/visitors"));
  app.use("/api/invoices", require("./routes/invoices"));
  app.use("/api/shipping", require("./routes/shipping"));
  app.use("/api", require("./routes/shippingCountries"));
  app.use("/api/payments", require("./routes/payments"));
  app.use("/api/wishlist", require("./routes/wishlist"));
  app.use("/api/transactions", require("./routes/transactions"));
  app.use("/api/faqs", require("./routes/faqs"));
  app.use("/api/coupons", require("./routes/coupons"));
  app.use("/api/bulk-inquiry", require("./routes/bulkInquiries"));
  app.use("/api/newsletter", require("./routes/newsletter"));
  app.use("/api/gallery", require("./routes/gallery"));
  app.use("/api/catalog", require("./routes/catalog"));
  app.use("/api/portfolio", require("./routes/portfolio"));

  const feedsRouter = require("./routes/feeds");
  app.use("/feeds", feedsRouter);
  app.use("/api/feeds", feedsRouter);

  const seoRouter = require("./routes/seo");
  app.use("/api/seo", seoRouter);
  app.get("/sitemap.xml", (req, res) => seoRouter(req, res));
  app.get("/sitemap-images.xml", (req, res) => seoRouter(req, res));
  app.get("/sitemap-news.xml", (req, res) => seoRouter(req, res));
  app.get("/robots.txt", (req, res) => seoRouter(req, res));
  app.get("/llms.txt", (req, res) => seoRouter(req, res));
  app.get("/llms-full.txt", (req, res) => seoRouter(req, res));

  app.get("/", (req, res) => res.send("API running ✓"));

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);

    // Start background cart recovery scheduler loop (runs every 30 minutes)
    const { runCartRecovery } = require("./utils/cartRecovery");
    setTimeout(() => {
      runCartRecovery().catch(err => console.error("Startup cart recovery failed:", err.message));
    }, 5000);
    setInterval(() => {
      runCartRecovery().catch(err => console.error("Interval cart recovery failed:", err.message));
    }, 30 * 60 * 1000);
  });
}

startServer().catch(err => {
  console.error("❌ Server startup crashed:", err);
  process.exit(1);
});