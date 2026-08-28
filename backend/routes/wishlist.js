const router = require("express").Router();
const db = require("../db");
const { verifyMember } = require("../middleware/auth");

// Helper to get member identifier
const getMemberId = (req) => {
  return req.member?.id || req.member?.member_id || 0;
};

// GET /api/wishlist — get current user wishlist details
router.get("/", verifyMember, async (req, res) => {
  const userId = getMemberId(req);
  try {
    const [items] = await db.query(
      `SELECT w.id as wishlist_id, w.created_at as saved_at, w.product_id, w.product_uid, COALESCE(w.product_type, w.type, 'physical') as type,
              COALESCE(p.id, phys.id, dp.id, w.product_id) as id,
              COALESCE(p.product_uid, phys.product_uid, dp.product_uid, w.product_uid, CAST(w.product_id AS CHAR)) as product_uid,
              COALESCE(p.name, phys.name, dp.name, 'Saved Item') as name,
              COALESCE(p.price, phys.price, dp.price, 0) as price,
              COALESCE(p.discount_price, phys.discount_price, dp.discount_price, NULL) as discount_price,
              COALESCE(p.description, phys.description, dp.description, '') as description,
              COALESCE(p.image_url, phys.image_url, dp.image_url, '') as image,
              COALESCE(p.image_url, phys.image_url, dp.image_url, '') as image_url,
              COALESCE(p.category, phys.category, dp.category, 'General') as category,
              COALESCE(p.stock, phys.stock, 99) as stock,
              COALESCE(p.product_uid, phys.product_uid, dp.product_uid, CAST(w.product_id AS CHAR)) as slug
       FROM wishlists w
       LEFT JOIN products p ON (w.product_uid IS NOT NULL AND w.product_uid != '' AND w.product_uid = p.product_uid) OR (w.product_id IS NOT NULL AND w.product_id != 0 AND w.product_id = p.id)
       LEFT JOIN physical_products phys ON (w.product_uid IS NOT NULL AND w.product_uid != '' AND w.product_uid = phys.product_uid) OR (w.product_id IS NOT NULL AND w.product_id != 0 AND w.product_id = phys.id)
       LEFT JOIN digital_products dp ON (w.product_uid IS NOT NULL AND w.product_uid != '' AND w.product_uid = dp.product_uid) OR (w.product_id IS NOT NULL AND w.product_id != 0 AND w.product_id = dp.id) OR (w.digital_id IS NOT NULL AND w.digital_id != 0 AND w.digital_id = dp.id)
       WHERE (w.user_id = ? OR w.member_id = ?) ORDER BY w.created_at DESC`,
      [userId, userId]
    );
    res.json(items);
  } catch (error) {
    console.error("Failed to fetch wishlist:", error);
    res.status(500).json({ error: "Failed to get wishlist" });
  }
});

// GET /api/wishlist/my — array of all saved IDs & product_uids as strings
router.get("/my", verifyMember, async (req, res) => {
  const userId = getMemberId(req);
  try {
    const [items] = await db.query(
      "SELECT product_id, product_uid, digital_id FROM wishlists WHERE (user_id = ? OR member_id = ?)",
      [userId, userId]
    );
    const savedList = [];
    items.forEach(i => {
      if (i.product_uid) savedList.push(String(i.product_uid));
      if (i.product_id && i.product_id !== 0) savedList.push(String(i.product_id));
      if (i.digital_id && i.digital_id !== 0) savedList.push(String(i.digital_id));
    });
    res.json(Array.from(new Set(savedList)));
  } catch (error) {
    res.json([]);
  }
});

// POST /api/wishlist/add — add via body { product_id, product_uid, product_type }
router.post("/add", verifyMember, async (req, res) => {
  const userId = getMemberId(req);
  const { product_id, product_uid, product_type } = req.body;
  const targetUid = product_uid ? String(product_uid) : (product_id ? String(product_id) : null);
  const targetId = typeof product_id === "number" ? product_id : (!isNaN(product_uid) && product_uid !== null ? parseInt(product_uid) : 0);
  const pType = product_type || "physical";

  if (!targetUid && !targetId) {
    return res.status(400).json({ error: "Product identifier required" });
  }

  try {
    // Check if already in wishlist
    const [existing] = await db.query(
      "SELECT id FROM wishlists WHERE (user_id = ? OR member_id = ?) AND ((product_uid = ? AND product_uid IS NOT NULL) OR (product_id = ? AND product_id != 0))",
      [userId, userId, targetUid, targetId]
    );
    if (existing.length === 0) {
      await db.query(
        "INSERT INTO wishlists (user_id, member_id, product_id, product_uid, product_type) VALUES (?, ?, ?, ?, ?)",
        [userId, userId, targetId, targetUid, pType]
      );
    }
    res.json({ message: "added", saved: true });
  } catch (error) {
    console.error("Failed to add to wishlist:", error);
    res.status(500).json({ error: "Failed to add to wishlist" });
  }
});

// POST /api/wishlist/:product_id — add to wishlist by param
router.post("/:product_id", verifyMember, async (req, res) => {
  const userId = getMemberId(req);
  const paramVal = req.params.product_id;
  const isNum = !isNaN(paramVal);
  const targetId = isNum ? parseInt(paramVal) : 0;
  const targetUid = String(paramVal);

  try {
    const [existing] = await db.query(
      "SELECT id FROM wishlists WHERE (user_id = ? OR member_id = ?) AND ((product_uid = ? AND product_uid IS NOT NULL) OR (product_id = ? AND product_id != 0))",
      [userId, userId, targetUid, targetId]
    );
    if (existing.length === 0) {
      await db.query(
        "INSERT INTO wishlists (user_id, member_id, product_id, product_uid, product_type) VALUES (?, ?, ?, ?, 'physical')",
        [userId, userId, targetId, targetUid]
      );
    }
    res.json({ message: "added", saved: true });
  } catch (error) {
    console.error("Failed to add to wishlist:", error);
    res.status(500).json({ error: "Failed to add to wishlist" });
  }
});

// DELETE /api/wishlist/:product_id — remove from wishlist
router.delete("/:product_id", verifyMember, async (req, res) => {
  const userId = getMemberId(req);
  const paramVal = req.params.product_id;

  try {
    await db.query(
      "DELETE FROM wishlists WHERE (user_id = ? OR member_id = ?) AND (product_id = ? OR product_uid = ? OR id = ?)",
      [userId, userId, paramVal, paramVal, paramVal]
    );
    res.json({ message: "removed", saved: false });
  } catch (error) {
    console.error("Failed to remove from wishlist:", error);
    res.status(500).json({ error: "Failed to remove from wishlist" });
  }
});

module.exports = router;