const router = require("express").Router();
const db = require("../db");
const { verifyMember, verifyAdmin } = require("../middleware/auth");

// Public: GET /api/reviews/:product_id — get approved reviews for a product
router.get("/:product_id", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, m.name as user_name FROM product_reviews r
       JOIN members m ON r.user_id = m.id
       WHERE r.product_id = ? AND r.is_approved = true ORDER BY r.created_at DESC`,
      [req.params.product_id]
    );
    res.json(rows);
  } catch (err) {
    // Fallback if joined table fails
    const [rows] = await db.query(
      "SELECT * FROM product_reviews WHERE product_id = ? AND is_approved = true ORDER BY created_at DESC",
      [req.params.product_id]
    );
    res.json(rows);
  }
});

// Member: Check if member has purchased this product (GET /api/reviews/check-purchased/:product_id)
router.get("/check-purchased/:product_id", verifyMember, async (req, res) => {
  try {
    const userId = req.member.id;
    const productId = req.params.product_id;

    // Check completed orders containing this product
    const [orders] = await db.query(
      `SELECT o.id FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       WHERE (o.member_id = ? OR o.user_id = ?) AND oi.product_id = ? AND (o.status = 'delivered' OR o.status = 'completed' OR o.payment_status = 'paid')`,
      [userId, userId, productId]
    );

    res.json({ hasPurchased: orders.length > 0 });
  } catch (err) {
    console.error("Error checking purchased status:", err);
    res.json({ hasPurchased: false });
  }
});

// Member: POST /api/reviews — submit review (logged in users only, must have purchased)
router.post("/", verifyMember, async (req, res) => {
  const { product_id, rating, review_text } = req.body;
  const userId = req.member.id;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5 stars" });
  }

  try {
    // Verify purchase
    const [orders] = await db.query(
      `SELECT o.id FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       WHERE (o.member_id = ? OR o.user_id = ?) AND oi.product_id = ? AND (o.status = 'delivered' OR o.status = 'completed' OR o.payment_status = 'paid')`,
      [userId, userId, product_id]
    );

    if (orders.length === 0) {
      return res.status(403).json({ error: "You must have a completed order for this product to write a review." });
    }

    const [result] = await db.query(
      "INSERT INTO product_reviews (product_id, user_id, rating, review_text, is_approved) VALUES (?, ?, ?, ?, false)",
      [product_id, userId, rating, review_text || ""]
    );

    res.json({ id: result.insertId, message: "Review submitted! It will appear once approved by admin." });
  } catch (err) {
    console.error("Failed to submit review:", err);
    res.status(500).json({ error: "Failed to submit review" });
  }
});

// Admin: GET /api/admin/reviews AND GET /api/reviews/admin/all — get all reviews
const fetchAdminReviews = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, COALESCE(p.name, dp.name, 'Product') as product_name, COALESCE(m.name, m.full_name, 'Customer') as customer_name, m.email as customer_email
       FROM product_reviews r
       LEFT JOIN products p ON r.product_id = p.id
       LEFT JOIN digital_products dp ON r.product_id = dp.id
       LEFT JOIN members m ON r.user_id = m.id
       ORDER BY r.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Failed to fetch admin reviews:", err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

router.get("/admin/all", verifyAdmin, fetchAdminReviews);
router.get("/admin/reviews", verifyAdmin, fetchAdminReviews);

// Admin: PUT /api/admin/reviews/:id/approve — approve a review
router.put("/admin/:id/approve", verifyAdmin, async (req, res) => {
  try {
    await db.query("UPDATE product_reviews SET is_approved = true WHERE id = ?", [req.params.id]);
    res.json({ message: "Review approved successfully" });
  } catch (err) {
    console.error("Failed to approve review:", err);
    res.status(500).json({ error: "Failed to approve review" });
  }
});

// Admin: DELETE /api/admin/reviews/:id — delete a review
router.delete("/admin/:id", verifyAdmin, async (req, res) => {
  try {
    await db.query("DELETE FROM product_reviews WHERE id = ?", [req.params.id]);
    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    console.error("Failed to delete review:", err);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

module.exports = router;