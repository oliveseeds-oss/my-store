const router = require("express").Router();
const db = require("../db");
const { verifyAdmin } = require("../middleware/auth");

// PUBLIC — catalog by type
router.get("/", async (req, res) => {
  const { type } = req.query;
  let sql = "SELECT * FROM catalog";
  const params = [];
  if (type) { sql += " WHERE type = ? OR type = 'both'"; params.push(type); }
  sql += " ORDER BY name";
  const [rows] = await db.query(sql, params);
  res.json(rows);
});

// ADMIN — all
router.get("/admin/all", verifyAdmin, async (req, res) => {
  const [rows] = await db.query("SELECT * FROM catalog ORDER BY name");
  res.json(rows);
});

// ADMIN — add
router.post("/", verifyAdmin, async (req, res) => {
  const { name, type, description, image_url } = req.body;
  const [result] = await db.query(
    "INSERT INTO catalog (name, type, description, image_url) VALUES (?,?,?,?)",
    [name, type || "physical", description, image_url || null]
  );
  res.json({ id: result.insertId });
});

// ADMIN — update
router.put("/:id", verifyAdmin, async (req, res) => {
  const { name, type, description, image_url } = req.body;
  await db.query(
    "UPDATE catalog SET name=?, type=?, description=?, image_url=? WHERE id=?",
    [name, type, description, image_url || null, req.params.id]
  );
  res.json({ message: "Updated" });
});

// ADMIN — delete
router.delete("/:id", verifyAdmin, async (req, res) => {
  await db.query("DELETE FROM catalog WHERE id = ?", [req.params.id]);
  res.json({ message: "Deleted" });
});

module.exports = router;
