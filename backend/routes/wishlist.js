const router = require("express").Router();
const db = require("../db");
const { verifyMember } = require("../middleware/auth");

// GET /api/wishlist/my
router.get("/my", verifyMember, async (req, res) => {
  const member_uid = req.member.member_uid;
  try {
    const [items] = await db.query(
      `SELECT w.*, 
              p.name as product_name, p.price as product_price, p.image_url as product_image,
              dp.name as digital_name, dp.price as digital_price, dp.thumbnail_url as digital_image
       FROM wishlist w
       LEFT JOIN products p ON w.product_uid = p.product_uid AND w.product_type = 'physical'
       LEFT JOIN digital_products dp ON w.product_uid = dp.product_uid AND w.product_type = 'digital'
       WHERE w.member_uid = ?`,
      [member_uid]
    );
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get wishlist" });
  }
});

// POST /api/wishlist/add
router.post("/add", verifyMember, async (req, res) => {
  const member_uid = req.member.member_uid;
  const { product_uid, product_type } = req.body;
  const pType = product_type === "digital" ? "digital" : "physical";

  if (!product_uid) {
    return res.status(400).json({ error: "product_uid is required" });
  }

  try {
    // Insert if not exists (using manual check to be perfectly compatible and safe)
    const [existing] = await db.query(
      "SELECT id FROM wishlist WHERE member_uid = ? AND product_uid = ?",
      [member_uid, product_uid]
    );
    if (!existing.length) {
      await db.query(
        "INSERT INTO wishlist (member_uid, product_uid, product_type) VALUES (?, ?, ?)",
        [member_uid, product_uid, pType]
      );
    }
    res.json({ ok: true, message: "Added to wishlist" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add to wishlist" });
  }
});

// DELETE /api/wishlist/:id
router.delete("/:id", verifyMember, async (req, res) => {
  const member_uid = req.member.member_uid;
  try {
    await db.query(
      "DELETE FROM wishlist WHERE member_uid = ? AND (id = ? OR product_uid = ?)",
      [member_uid, req.params.id, req.params.id]
    );
    res.json({ ok: true, message: "Removed from wishlist" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to remove" });
  }
});

module.exports = router;