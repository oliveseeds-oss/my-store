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
  const { name, type, description, image_url, image_urls } = req.body;
  
  let urls = [];
  if (Array.isArray(image_urls)) {
    urls = image_urls.map(u => String(u || "").trim()).filter(Boolean);
  } else if (typeof image_urls === "string" && image_urls.trim()) {
    urls = image_urls.split(/[\n,]+/).map(u => u.trim()).filter(Boolean);
  }
  if (image_url && typeof image_url === "string" && image_url.trim()) {
    const splitUrls = image_url.split(/[\n,]+/).map(u => u.trim()).filter(Boolean);
    urls.push(...splitUrls);
  }
  urls = [...new Set(urls)];

  if (urls.length > 1) {
    const insertedIds = [];
    for (const url of urls) {
      const [result] = await db.query(
        "INSERT INTO catalog (name, type, description, image_url) VALUES (?,?,?,?)",
        [name, type || "physical", description, url]
      );
      insertedIds.push(result.insertId);
    }
    return res.json({ id: insertedIds[0], ids: insertedIds, count: insertedIds.length, message: `${insertedIds.length} collections added` });
  }

  const [result] = await db.query(
    "INSERT INTO catalog (name, type, description, image_url) VALUES (?,?,?,?)",
    [name, type || "physical", description, urls[0] || image_url || null]
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
