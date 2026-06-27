const router = require("express").Router();
const db = require("../db");
const { verifyAdmin } = require("../middleware/auth");

router.get("/active", async (req, res) => {
  const { placement } = req.query;
  let sql = "SELECT * FROM ads WHERE is_active = TRUE";
  const params = [];
  if (placement) { sql += " AND placement = ?"; params.push(placement); }
  const [rows] = await db.query(sql, params);
  res.json(rows);
});

router.get("/admin/all", verifyAdmin, async (req, res) => {
  const [rows] = await db.query("SELECT * FROM ads ORDER BY created_at DESC");
  res.json(rows);
});

router.post("/", verifyAdmin, async (req, res) => {
  const { title, image_url, link_url, placement, is_active } = req.body;
  const [result] = await db.query(
    "INSERT INTO ads (title, image_url, link_url, placement, is_active) VALUES (?,?,?,?,?)",
    [title, image_url, link_url, placement, is_active]
  );
  res.json({ id: result.insertId });
});

router.put("/:id", verifyAdmin, async (req, res) => {
  const { is_active } = req.body;
  await db.query("UPDATE ads SET is_active = ? WHERE id = ?", [is_active, req.params.id]);
  res.json({ message: "Updated" });
});

router.delete("/:id", verifyAdmin, async (req, res) => {
  await db.query("DELETE FROM ads WHERE id = ?", [req.params.id]);
  res.json({ message: "Deleted" });
});

module.exports = router;