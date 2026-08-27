const router = require("express").Router();
const db = require("../db");
const { verifyAdmin } = require("../middleware/auth");

router.get("/", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM blogs ORDER BY created_at DESC");
  res.json(rows);
});

router.get("/:idOrSlug", async (req, res) => {
  const param = req.params.idOrSlug;
  const isNumeric = /^\d+$/.test(param);
  const query = isNumeric
    ? "SELECT * FROM blogs WHERE id = ? OR slug = ?"
    : "SELECT * FROM blogs WHERE slug = ? OR id = ?";
  const [rows] = await db.query(query, [param, param]);
  if (!rows.length) return res.status(404).json({ error: "Blog post not found" });
  res.json(rows[0]);
});

router.post("/", verifyAdmin, async (req, res) => {
  const {
    title, content, category, author, image_url,
    slug, tags, meta_title, meta_description, focus_keyword,
    canonical_url, og_title, og_description, og_image, no_index, status
  } = req.body;

  const generatedSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  const [result] = await db.query(
    `INSERT INTO blogs (
      title, content, category, author, image_url,
      slug, tags, meta_title, meta_description, focus_keyword,
      canonical_url, og_title, og_description, og_image, no_index, status
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      title, content, category || "General", author || "Admin", image_url || "",
      generatedSlug, tags || "", meta_title || title, meta_description || "", focus_keyword || "",
      canonical_url || "", og_title || meta_title || title, og_description || meta_description || "",
      og_image || image_url || "", no_index ? 1 : 0, status || "published"
    ]
  );
  res.json({ id: result.insertId, slug: generatedSlug });
});

router.put("/:id", verifyAdmin, async (req, res) => {
  const {
    title, content, category, author, image_url,
    slug, tags, meta_title, meta_description, focus_keyword,
    canonical_url, og_title, og_description, og_image, no_index, status
  } = req.body;

  const generatedSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  await db.query(
    `UPDATE blogs SET 
      title=?, content=?, category=?, author=?, image_url=?,
      slug=?, tags=?, meta_title=?, meta_description=?, focus_keyword=?,
      canonical_url=?, og_title=?, og_description=?, og_image=?, no_index=?, status=?
    WHERE id=?`,
    [
      title, content, category || "General", author || "Admin", image_url || "",
      generatedSlug, tags || "", meta_title || title, meta_description || "", focus_keyword || "",
      canonical_url || "", og_title || meta_title || title, og_description || meta_description || "",
      og_image || image_url || "", no_index ? 1 : 0, status || "published",
      req.params.id
    ]
  );
  res.json({ message: "Updated successfully" });
});

router.delete("/:id", verifyAdmin, async (req, res) => {
  await db.query("DELETE FROM blogs WHERE id = ?", [req.params.id]);
  res.json({ message: "Deleted" });
});

module.exports = router;