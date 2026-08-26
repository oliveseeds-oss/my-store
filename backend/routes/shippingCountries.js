const router = require("express").Router();
const db = require("../db");
const { verifyAdmin } = require("../middleware/auth");

// Public Endpoint: GET /api/shipping-countries/enabled (returns only enabled country codes list)
router.get("/shipping-countries/enabled", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT country_code, country_name FROM shipping_countries WHERE is_enabled = TRUE");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching enabled shipping countries:", err);
    res.status(500).json({ error: "Failed to fetch enabled shipping countries" });
  }
});

// Admin Endpoint: GET /api/admin/shipping-countries (returns all stored countries with enabled status)
router.get("/admin/shipping-countries", verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, country_code, country_name, is_enabled, created_at, updated_at FROM shipping_countries ORDER BY country_name ASC");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching admin shipping countries:", err);
    res.status(500).json({ error: "Failed to fetch admin shipping countries" });
  }
});

// Admin Endpoint: PUT /api/admin/shipping-countries/:code (toggle is_enabled true/false for a country)
router.put("/admin/shipping-countries/:code", verifyAdmin, async (req, res) => {
  const { code } = req.params;
  const { is_enabled, country_name } = req.body;
  const upperCode = code.toUpperCase();

  try {
    const [existing] = await db.query("SELECT * FROM shipping_countries WHERE country_code = ?", [upperCode]);
    if (existing.length > 0) {
      await db.query("UPDATE shipping_countries SET is_enabled = ? WHERE country_code = ?", [is_enabled ? 1 : 0, upperCode]);
    } else {
      await db.query("INSERT INTO shipping_countries (country_code, country_name, is_enabled) VALUES (?, ?, ?)", [
        upperCode,
        country_name || upperCode,
        is_enabled ? 1 : 0
      ]);
    }

    const [updated] = await db.query("SELECT * FROM shipping_countries WHERE country_code = ?", [upperCode]);
    res.json({ message: "Shipping country updated successfully", country: updated[0] });
  } catch (err) {
    console.error("Error updating shipping country:", err);
    res.status(500).json({ error: "Failed to update shipping country" });
  }
});

module.exports = router;
