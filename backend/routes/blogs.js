const router = require("express").Router();
const db = require("../db");
const { verifyAdmin } = require("../middleware/auth");

router.get("/", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM blogs ORDER BY created_at DESC");
  res.json(rows);
});

router.get("/:id", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM blogs WHERE id = ?", [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "Not found" });
  res.json(rows[0]);
});

router.post("/", verifyAdmin, async (req, res) => {
  const { title, content, category, author, image_url } = req.body;
  const [result] = await db.query(
    "INSERT INTO blogs (title, content, category, author, image_url) VALUES (?,?,?,?,?)",
    [title, content, category, author, image_url]
  );
  res.json({ id: result.insertId });
});

router.put("/:id", verifyAdmin, async (req, res) => {
  const { title, content, category, author, image_url } = req.body;
  await db.query(
    "UPDATE blogs SET title=?, content=?, category=?, author=?, image_url=? WHERE id=?",
    [title, content, category, author, image_url, req.params.id]
  );
  res.json({ message: "Updated" });
});

router.delete("/:id", verifyAdmin, async (req, res) => {
  await db.query("DELETE FROM blogs WHERE id = ?", [req.params.id]);
  res.json({ message: "Deleted" });
});

module.exports = router;