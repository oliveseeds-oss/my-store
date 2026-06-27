const router = require("express").Router();
const db = require("../db");
const { verifyAdmin } = require("../middleware/auth");

// GET /api/seo - Fetch all pages SEO configs
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM seo_settings");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/seo/:page - Fetch SEO for specific page
router.get("/:page", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM seo_settings WHERE page_name = ?", [req.params.page]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "SEO setting not found for this page" });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/seo/:page - Update SEO config for specific page (Admin secured)
router.put("/:page", verifyAdmin, async (req, res) => {
  const { title, meta_description, keywords, og_title, og_description, og_image, image_alt } = req.body;
  try {
    const [result] = await db.query(
      `UPDATE seo_settings 
       SET title = ?, meta_description = ?, keywords = ?, og_title = ?, og_description = ?, og_image = ?, image_alt = ? 
       WHERE page_name = ?`,
      [title, meta_description, keywords, og_title, og_description, og_image, image_alt, req.params.page]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "SEO setting not found or no changes made" });
    }
    res.json({ message: "SEO settings updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
