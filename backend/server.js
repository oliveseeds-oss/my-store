const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploads statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/uploads", require("./routes/uploads"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/products", require("./routes/products"));
app.use("/api/digital-products", require("./routes/digitalProducts"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/members", require("./routes/members"));
app.use("/api/blogs", require("./routes/blogs"));
app.use("/api/contact", require("./routes/contact"));
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
app.use("/api/wishlist", require("./routes/wishlist"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/seo", require("./routes/seo"));
app.use("/api/gallery", require("./routes/gallery"));

app.get("/", (req, res) => res.send("API running ✓"));
app.listen(process.env.PORT || 5000, () =>
  console.log("Server running on port 5000")
);