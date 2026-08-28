const router = require("express").Router();
const db = require("../db");
const { verifyMember, verifyAdmin } = require("../middleware/auth");
const createNotification = require("../utils/createNotification");

// Helper to format reviewer name (first name + last initial or first name)
function formatReviewerName(fullName) {
  if (!fullName) return "Anonymous";
  const parts = fullName.trim().split(" ");
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
}

// GET /api/reviews/can-review/:product_id — Auth required
router.get("/can-review/:product_id", verifyMember, async (req, res) => {
  try {
    const userId = req.member.id;
    const memberUid = req.member.member_uid;
    const productId = req.params.product_id;

    // Check if user already reviewed this product
    const [existing] = await db.query(
      `SELECT id FROM product_reviews WHERE user_id = ? AND (product_id = ? OR product_id = (SELECT id FROM physical_products WHERE product_uid = ? LIMIT 1) OR product_id = (SELECT id FROM digital_products WHERE product_uid = ? LIMIT 1))`,
      [userId, productId, productId, productId]
    );

    const alreadyReviewed = existing.length > 0;

    // Check paid orders containing this product
    const [physicalOrders] = await db.query(
      `SELECT o.id FROM physical_orders o
       JOIN physical_order_items oi ON o.id = oi.order_id
       WHERE (o.member_uid = ? OR o.member_uid = ?) AND (oi.product_id = ? OR oi.product_uid = ?) 
       AND (o.payment_status = 'Paid' OR o.payment_status = 'paid' OR o.status = 'Completed' OR o.status = 'delivered')`,
      [memberUid, String(userId), productId, productId]
    );

    const [digitalOrders] = await db.query(
      `SELECT o.id FROM digital_orders o
       JOIN digital_order_items oi ON o.order_uid = oi.order_uid
       WHERE (o.member_uid = ? OR o.member_uid = ?) AND (oi.product_uid = ?) 
       AND (o.payment_status = 'Paid' OR o.payment_status = 'paid' OR o.status = 'Completed')`,
      [memberUid, String(userId), productId]
    );

    const hasPurchased = physicalOrders.length > 0 || digitalOrders.length > 0;
    const canReview = hasPurchased && !alreadyReviewed;

    res.json({ canReview, alreadyReviewed, hasPurchased });
  } catch (err) {
    console.error("Error checking can-review:", err);
    res.json({ canReview: false, alreadyReviewed: false, hasPurchased: false });
  }
});

// GET /api/reviews/check-purchased/:product_id — Alias endpoint
router.get("/check-purchased/:product_id", verifyMember, async (req, res) => {
  try {
    const userId = req.member.id;
    const memberUid = req.member.member_uid;
    const productId = req.params.product_id;

    const [orders] = await db.query(
      `SELECT o.id FROM physical_orders o
       JOIN physical_order_items oi ON o.id = oi.order_id
       WHERE (o.member_uid = ? OR o.member_uid = ?) AND (oi.product_id = ? OR oi.product_uid = ?)
       AND (o.payment_status = 'Paid' OR o.payment_status = 'paid' OR o.status = 'Completed')`,
      [memberUid, String(userId), productId, productId]
    );

    res.json({ hasPurchased: orders.length > 0 });
  } catch (err) {
    res.json({ hasPurchased: false });
  }
});

// GET /api/reviews/:product_id — Public fetch approved reviews for a product
router.get("/:product_id", async (req, res) => {
  try {
    const productId = req.params.product_id;
    const [rows] = await db.query(
      `SELECT r.id, r.product_id, r.user_id, r.rating, r.review_text, r.created_at, r.is_approved,
              COALESCE(m.full_name, m.name, 'Valued Customer') as raw_name
       FROM product_reviews r
       LEFT JOIN members m ON (r.user_id = m.id OR r.user_id = m.member_uid)
       WHERE (r.product_id = ? OR r.product_id = (SELECT id FROM physical_products WHERE product_uid = ? LIMIT 1) OR r.product_id = (SELECT id FROM digital_products WHERE product_uid = ? LIMIT 1))
       AND (r.is_approved = true OR r.is_approved = 1)
       ORDER BY r.created_at DESC`,
      [productId, productId, productId]
    );

    const formattedReviews = rows.map((r) => ({
      id: r.id,
      rating: r.rating,
      review_text: r.review_text,
      created_at: r.created_at,
      reviewer_name: formatReviewerName(r.raw_name)
    }));

    const total = formattedReviews.length;
    const avgSum = formattedReviews.reduce((sum, r) => sum + r.rating, 0);
    const average = total > 0 ? parseFloat((avgSum / total).toFixed(1)) : 0;

    res.json({
      reviews: formattedReviews,
      average: average,
      average_rating: average,
      total: total,
      total_reviews: total
    });
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.json({ reviews: [], average: 0, average_rating: 0, total: 0, total_reviews: 0 });
  }
});

// POST /api/reviews — Submit review (Auth required)
router.post("/", verifyMember, async (req, res) => {
  const { product_id, digital_product_id, rating, review_text, comment } = req.body;
  const userId = req.member.id;
  const targetId = product_id || digital_product_id;

  if (!targetId) {
    return res.status(400).json({ error: "Product ID is required" });
  }

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5 stars" });
  }

  const text = (review_text || comment || "").trim();
  if (text.length < 10) {
    return res.status(400).json({ error: "Review must be at least 10 characters long" });
  }

  try {
    // Resolve numeric product ID if targetId is product_uid string
    let numericProductId = targetId;
    if (isNaN(targetId)) {
      const [pRows] = await db.query(
        "SELECT id FROM physical_products WHERE product_uid = ? UNION SELECT id FROM digital_products WHERE product_uid = ?",
        [targetId, targetId]
      );
      if (pRows.length) numericProductId = pRows[0].id;
    }

    // Check duplicate review
    const [existing] = await db.query(
      "SELECT id FROM product_reviews WHERE user_id = ? AND product_id = ?",
      [userId, numericProductId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "You have already submitted a review for this product." });
    }

    // Insert review with is_approved = false
    const [result] = await db.query(
      "INSERT INTO product_reviews (product_id, user_id, rating, review_text, is_approved) VALUES (?, ?, ?, ?, false)",
      [numericProductId, userId, rating, text]
    );

    res.json({ success: true, id: result.insertId, message: "Thank you! Your review is pending approval." });
  } catch (err) {
    console.error("Failed to submit review:", err);
    res.status(500).json({ error: "Failed to submit review" });
  }
});

// Admin: GET /api/admin/reviews - Admin auth required
const fetchAdminReviews = async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT r.*, 
             COALESCE(pp.name, dp.name, 'Product') as product_name, 
             COALESCE(m.full_name, m.name, 'Customer') as customer_name, 
             m.email as customer_email
      FROM product_reviews r
      LEFT JOIN physical_products pp ON r.product_id = pp.id
      LEFT JOIN digital_products dp ON r.product_id = dp.id
      LEFT JOIN members m ON (r.user_id = m.id OR r.user_id = m.member_uid)
    `;

    const params = [];
    if (status === "pending") {
      query += " WHERE (r.is_approved = false OR r.is_approved = 0)";
    } else if (status === "approved") {
      query += " WHERE (r.is_approved = true OR r.is_approved = 1)";
    }

    query += " ORDER BY r.created_at DESC";

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching admin reviews:", err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

router.get("/admin/all", verifyAdmin, fetchAdminReviews);
router.get("/admin/reviews", verifyAdmin, fetchAdminReviews);
router.get("/admin", verifyAdmin, fetchAdminReviews);

// Admin: PUT /api/admin/reviews/:id/approve - Approve review & notify user
const approveReview = async (req, res) => {
  const reviewId = req.params.id;
  try {
    await db.query("UPDATE product_reviews SET is_approved = true WHERE id = ?", [reviewId]);

    // Notify user when review is approved (Step 2E)
    try {
      const [reviewRows] = await db.query("SELECT * FROM product_reviews WHERE id = ?", [reviewId]);
      if (reviewRows.length) {
        const rev = reviewRows[0];
        const userId = rev.user_id;

        const [productRows] = await db.query(
          "SELECT name FROM physical_products WHERE id = ? UNION SELECT name FROM digital_products WHERE id = ?",
          [rev.product_id, rev.product_id]
        );
        const productName = productRows[0]?.name || "your product";

        await createNotification(
          db,
          userId,
          "Your Review is Live 🎉",
          `Your review for "${productName}" has been approved and is now visible.`,
          "general",
          null,
          rev.product_id
        );
      }
    } catch (notifErr) {
      console.error("Failed to send review approval notification:", notifErr);
    }

    res.json({ success: true, message: "Review approved successfully" });
  } catch (err) {
    console.error("Failed to approve review:", err);
    res.status(500).json({ error: "Failed to approve review" });
  }
};

router.put("/admin/:id/approve", verifyAdmin, approveReview);
router.put("/:id/approve", verifyAdmin, approveReview);

// Admin: DELETE /api/admin/reviews/:id - Delete review
const deleteReview = async (req, res) => {
  try {
    await db.query("DELETE FROM product_reviews WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Review deleted successfully" });
  } catch (err) {
    console.error("Failed to delete review:", err);
    res.status(500).json({ error: "Failed to delete review" });
  }
};

router.delete("/admin/:id", verifyAdmin, deleteReview);
router.delete("/:id", verifyAdmin, deleteReview);

module.exports = router;