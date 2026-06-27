const router = require("express").Router();
const db = require("../db");
const { verifyAdmin } = require("../middleware/auth");

// PUBLIC — categories by type
router.get("/", async (req, res) => {
  const { type } = req.query;
  let sql = "SELECT * FROM categories";
  const params = [];
  if (type) { sql += " WHERE type = ? OR type = 'both'"; params.push(type); }
  sql += " ORDER BY name";
  const [rows] = await db.query(sql, params);
  res.json(rows);
});

// ADMIN — all
router.get("/admin/all", verifyAdmin, async (req, res) => {
  const [rows] = await db.query("SELECT * FROM categories ORDER BY name");
  res.json(rows);
});

// ADMIN — add
router.post("/", verifyAdmin, async (req, res) => {
  const { name, type, description } = req.body;
  const [result] = await db.query(
    "INSERT INTO categories (name, type, description) VALUES (?,?,?)",
    [name, type || "physical", description]
  );
  res.json({ id: result.insertId });
});

// ADMIN — update
router.put("/:id", verifyAdmin, async (req, res) => {
  const { name, type, description } = req.body;
  await db.query(
    "UPDATE categories SET name=?, type=?, description=? WHERE id=?",
    [name, type, description, req.params.id]
  );
  res.json({ message: "Updated" });
});

// ADMIN — delete
router.delete("/:id", verifyAdmin, async (req, res) => {
  await db.query("DELETE FROM categories WHERE id = ?", [req.params.id]);
  res.json({ message: "Deleted" });
});

module.exports = router;