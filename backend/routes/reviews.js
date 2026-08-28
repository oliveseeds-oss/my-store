const router = require("express").Router();
const db = require("../db");
const { verifyMember, verifyAdmin } = require("../middleware/auth");

// Public: GET /api/reviews/:product_id — get approved reviews for a product
router.get("/:product_id", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, COALESCE(m.name, m.full_name, 'Customer') as user_name FROM product_reviews r
       LEFT JOIN members m ON (r.user_id = m.id OR r.user_id = m.member_uid)
       WHERE (r.product_id = ? OR r.product_id = (SELECT id FROM physical_products WHERE product_uid = ? LIMIT 1) OR r.product_id = (SELECT id FROM digital_products WHERE product_uid = ? LIMIT 1))
       AND (r.is_approved = true OR r.is_approved = 1) ORDER BY r.created_at DESC`,
      [req.params.product_id, req.params.product_id, req.params.product_id]
    );
    res.json(rows);
  } catch (err) {
    res.json([]);
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

// Member: POST /api/reviews — submit review (logged in users only)
router.post("/", verifyMember, async (req, res) => {
  const { product_id, digital_product_id, product_type, rating, title, comment, review_text } = req.body;
  const memberUid = req.member.member_uid || req.member.id;
  const userId = req.member.id;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5 stars" });
  }

  const reviewContent = comment || review_text || "";
  const reviewTitle = title || "";
  const type = product_type || (digital_product_id ? "digital" : "physical");
  const targetId = digital_product_id || product_id;

  try {
    // Try inserting into `reviews` table first (which supports product_uid/member_uid & title/comment)
    try {
      // Find product_uid if targetId is numeric ID
      let pUid = targetId;
      if (type === "digital") {
        const [pRows] = await db.query("SELECT product_uid FROM digital_products WHERE id = ? OR product_uid = ?", [targetId, targetId]);
        if (pRows.length) pUid = pRows[0].product_uid;
      } else {
        const [pRows] = await db.query("SELECT product_uid FROM physical_products WHERE id = ? OR product_uid = ?", [targetId, targetId]);
        if (pRows.length) pUid = pRows[0].product_uid;
      }

      const [result] = await db.query(
        "INSERT INTO reviews (member_uid, product_uid, product_type, rating, title, comment) VALUES (?, ?, ?, ?, ?, ?)",
        [memberUid, pUid, type, rating, reviewTitle, reviewContent]
      );
      return res.json({ id: result.insertId, message: "Review submitted successfully!" });
    } catch (e1) {
      // Fallback to product_reviews table if `reviews` table structure differs
      const [result] = await db.query(
        "INSERT INTO product_reviews (product_id, user_id, rating, review_text, is_approved) VALUES (?, ?, ?, ?, true)",
        [targetId, userId, rating, reviewContent]
      );
      return res.json({ id: result.insertId, message: "Review submitted successfully!" });
    }
  } catch (err) {
    console.error("Failed to submit review:", err);
    res.status(500).json({ error: "Failed to submit review" });
  }
});

// Admin: GET /api/admin/reviews AND GET /api/reviews/admin/all — get all reviews
const fetchAdminReviews = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, 
              COALESCE(pp.name, dp.name, 'Product') as product_name, 
              COALESCE(m.name, m.full_name, 'Customer') as customer_name, 
              m.email as customer_email
       FROM product_reviews r
       LEFT JOIN physical_products pp ON r.product_id = pp.id
       LEFT JOIN digital_products dp ON r.product_id = dp.id
       LEFT JOIN members m ON (r.user_id = m.id OR r.user_id = m.member_uid)
       ORDER BY r.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    try {
      const [simpleRows] = await db.query("SELECT * FROM product_reviews ORDER BY created_at DESC");
      res.json(simpleRows);
    } catch {
      res.json([]);
    }
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