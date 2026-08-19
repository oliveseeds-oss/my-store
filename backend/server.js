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
  app.use(cors());
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
  app.use("/api/payments", require("./routes/payments"));
  app.use("/api/wishlist", require("./routes/wishlist"));
  app.use("/api/transactions", require("./routes/transactions"));
  app.use("/api/seo", require("./routes/seo"));
  app.use("/api/gallery", require("./routes/gallery"));
  app.use("/api/catalog", require("./routes/catalog"));
  app.use("/api/portfolio", require("./routes/portfolio"));

  app.get("/", (req, res) => res.send("API running ✓"));

  app.listen(process.env.PORT || 5000, () => {
    console.log("Server running on port 5000");

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
  console.error("❌ Server startup crashed:", err.message);
  process.exit(1);
});