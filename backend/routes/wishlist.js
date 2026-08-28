const router = require("express").Router();
const db = require("../db");
const { verifyMember } = require("../middleware/auth");

// GET /api/wishlist — get current user wishlist details
router.get("/", verifyMember, async (req, res) => {
  const userId = req.member.id;
  try {
    const [items] = await db.query(
      `SELECT w.id as wishlist_id, w.created_at as saved_at, w.product_id, w.product_uid, COALESCE(w.product_type, 'physical') as type,
              COALESCE(p.id, dp.id, w.product_id) as id,
              COALESCE(p.product_uid, dp.product_uid, w.product_uid, CAST(w.product_id AS CHAR)) as product_uid,
              COALESCE(p.name, dp.name, 'Saved Item') as name,
              COALESCE(p.price, dp.price, 0) as price,
              COALESCE(p.discount_price, dp.discount_price, NULL) as discount_price,
              COALESCE(p.description, dp.description, '') as description,
              COALESCE(p.image_url, dp.image_url, '') as image,
              COALESCE(p.category, dp.category, 'General') as category,
              COALESCE(p.stock, 99) as stock,
              COALESCE(p.product_uid, dp.product_uid, CAST(w.product_id AS CHAR)) as slug
       FROM wishlists w
       LEFT JOIN physical_products p ON (w.product_uid = p.product_uid OR (w.product_id = p.id AND w.product_id != 0))
       LEFT JOIN digital_products dp ON (w.product_uid = dp.product_uid OR (w.product_id = dp.id AND w.product_id != 0))
       WHERE w.user_id = ? ORDER BY w.created_at DESC`,
      [userId]
    );
    res.json(items);
  } catch (error) {
    console.error("Failed to fetch wishlist:", error);
    res.status(500).json({ error: "Failed to get wishlist" });
  }
});

// GET /api/wishlist/my — legacy compatibility array of saved IDs & product_uids
router.get("/my", verifyMember, async (req, res) => {
  const userId = req.member.id;
  try {
    const [items] = await db.query("SELECT product_id, product_uid FROM wishlists WHERE user_id = ?", [userId]);
    const savedList = items.map(i => i.product_uid || i.product_id).filter(Boolean);
    res.json(savedList);
  } catch (error) {
    res.json([]);
  }
});

// POST /api/wishlist/add — add via body { product_id, product_uid, product_type }
router.post("/add", verifyMember, async (req, res) => {
  const userId = req.member.id;
  const { product_id, product_uid, product_type } = req.body;
  const targetUid = product_uid || (product_id ? String(product_id) : null);
  const targetId = typeof product_id === "number" ? product_id : 0;
  const pType = product_type || "physical";

  if (!targetUid && !targetId) {
    return res.status(400).json({ error: "Product identifier required" });
  }

  try {
    await db.query(
      "INSERT IGNORE INTO wishlists (user_id, product_id, product_uid, product_type) VALUES (?, ?, ?, ?)",
      [userId, targetId, targetUid, pType]
    );
    res.json({ message: "added", saved: true });
  } catch (error) {
    console.error("Failed to add to wishlist:", error);
    res.status(500).json({ error: "Failed to add to wishlist" });
  }
});

// POST /api/wishlist/:product_id — add to wishlist by param
router.post("/:product_id", verifyMember, async (req, res) => {
  const userId = req.member.id;
  const paramVal = req.params.product_id;
  const isNum = !isNaN(paramVal);
  const targetId = isNum ? parseInt(paramVal) : 0;
  const targetUid = String(paramVal);

  try {
    await db.query(
      "INSERT IGNORE INTO wishlists (user_id, product_id, product_uid, product_type) VALUES (?, ?, ?, 'physical')",
      [userId, targetId, targetUid]
    );
    res.json({ message: "added", saved: true });
  } catch (error) {
    console.error("Failed to add to wishlist:", error);
    res.status(500).json({ error: "Failed to add to wishlist" });
  }
});

// DELETE /api/wishlist/:product_id — remove from wishlist
router.delete("/:product_id", verifyMember, async (req, res) => {
  const userId = req.member.id;
  const paramVal = req.params.product_id;

  try {
    await db.query(
      "DELETE FROM wishlists WHERE user_id = ? AND (product_id = ? OR product_uid = ?)",
      [userId, paramVal, paramVal]
    );
    res.json({ message: "removed", saved: false });
  } catch (error) {
    console.error("Failed to remove from wishlist:", error);
    res.status(500).json({ error: "Failed to remove from wishlist" });
  }
});

module.exports = router;