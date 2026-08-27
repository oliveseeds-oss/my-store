const router = require("express").Router();
const db = require("../db");
const { verifyMember } = require("../middleware/auth");

// GET /api/wishlist — get current user wishlist
router.get("/", verifyMember, async (req, res) => {
  const userId = req.member.id;
  try {
    const [items] = await db.query(
      `SELECT w.id as wishlist_id, w.created_at as saved_at,
              p.id, p.name, p.price, p.description, p.image_url, p.category, p.stock
       FROM wishlists w
       JOIN physical_products p ON w.product_id = p.id
       WHERE w.user_id = ? ORDER BY w.created_at DESC`,
      [userId]
    );
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get wishlist" });
  }
});

// GET /api/wishlist/my — legacy compatibility
router.get("/my", verifyMember, async (req, res) => {
  const userId = req.member.id;
  try {
    const [items] = await db.query("SELECT * FROM wishlists WHERE user_id = ?", [userId]);
    res.json(items);
  } catch (error) {
    res.json([]);
  }
});

// POST /api/wishlist/:product_id — add to wishlist (logged in only)
router.post("/:product_id", verifyMember, async (req, res) => {
  const userId = req.member.id;
  const productId = req.params.product_id;

  try {
    await db.query(
      "INSERT IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)",
      [userId, productId]
    );
    res.json({ message: "Added to wishlist" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add to wishlist" });
  }
});

// DELETE /api/wishlist/:product_id — remove from wishlist
router.delete("/:product_id", verifyMember, async (req, res) => {
  const userId = req.member.id;
  const productId = req.params.product_id;

  try {
    await db.query(
      "DELETE FROM wishlists WHERE user_id = ? AND product_id = ?",
      [userId, productId]
    );
    res.json({ message: "Removed from wishlist" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to remove from wishlist" });
  }
});

module.exports = router;