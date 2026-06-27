const router = require("express").Router();
const db = require("../db");
const { verifyMember } = require("../middleware/auth");

router.get("/product/:id", async (req, res) => {
  const { type } = req.query;
  const product_uid = req.params.id;
  const pType = type === "digital" ? "digital" : "physical";

  const [rows] = await db.query(
    `SELECT r.*, m.name as member_name FROM reviews r
     JOIN members m ON r.member_uid = m.member_uid
     WHERE r.product_uid = ? AND r.product_type = ? ORDER BY r.created_at DESC`,
    [product_uid, pType]
  );
  res.json(rows);
});

router.post("/", verifyMember, async (req, res) => {
  const { product_id, product_type, rating, title, comment } = req.body;
  const member_uid = req.member.member_uid;
  const pType = product_type === "digital" ? "digital" : "physical";

  try {
    await db.query(
      `INSERT INTO reviews (member_uid, product_uid, product_type, rating, title, comment, created_at)
       VALUES (?,?,?,?,?,?,NOW())`,
      [member_uid, product_id, pType, rating, title, comment]
    );

    const table = pType === "digital" ? "digital_products" : "products";

    const [[avg]] = await db.query(
      `SELECT AVG(rating) as avg, COUNT(*) as cnt FROM reviews
       WHERE product_uid = ? AND product_type = ?`, [product_id, pType]
    );

    await db.query(
      `UPDATE ${table} SET rating=?, review_count=? WHERE product_uid=?`,
      [parseFloat(avg.avg || 0).toFixed(2), avg.cnt, product_id]
    );

    res.json({ ok: true, message: "Review added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add review" });
  }
});

module.exports = router;