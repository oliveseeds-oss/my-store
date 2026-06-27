const router = require("express").Router();
const db = require("../db");
const https = require("https");
const { verifyAdmin } = require("../middleware/auth");

// Helper to fetch live rates from free public API relative to INR
function fetchRates() {
  return new Promise((resolve, reject) => {
    https.get("https://open.er-api.com/v6/latest/INR", (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on("error", reject);
  });
}

// GET all shipping countries with rates (admin gets all, public gets only shipping enabled)
router.get("/", async (req, res) => {
    const { active } = req.query;
    let query = "SELECT * FROM currency_rates";
    if (active === "1") {
        query += " WHERE shipping_allowed=TRUE";
    }
    query += " ORDER BY country_name";

    try {
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch currency rates" });
    }
});

// PUBLIC — shipping rule for country
router.get("/shipping/:code", async (req, res) => {
    const [rows] = await db.query(
        "SELECT * FROM shipping_rules WHERE country_code=?", [req.params.code]
    );
    res.json(rows[0] || { base_fee_inr: 60, free_above_inr: 999, tax_percent: 18, estimated_days: "7-14 business days" });
});

// ADMIN — update rate
router.put("/:id", verifyAdmin, async (req, res) => {
    const { rate_to_inr, shipping_allowed } = req.body;
    await db.query("UPDATE currency_rates SET rate_to_inr=?, shipping_allowed=?, updated_at=NOW() WHERE id=?",
        [rate_to_inr, shipping_allowed, req.params.id]);
    res.json({ message: "Rate updated" });
});

// ADMIN — sync live rates relative to INR
router.post("/sync", verifyAdmin, async (req, res) => {
    try {
        const data = await fetchRates();
        if (data.result !== "success" || !data.rates) {
            return res.status(400).json({ error: "Failed to fetch rates from Exchange Rate API" });
        }

        const rates = data.rates;
        const [dbRates] = await db.query("SELECT id, currency_code FROM currency_rates");

        for (const row of dbRates) {
            const code = row.currency_code;
            if (code === "INR") {
                await db.query(
                    "UPDATE currency_rates SET rate_to_inr=1.0, updated_at=NOW() WHERE id=?",
                    [row.id]
                );
            } else if (rates[code]) {
                // API rate is 1 INR = X Foreign Currency
                // Therefore, 1 Foreign Currency = 1 / X INR
                const rateToInr = 1 / rates[code];
                await db.query(
                    "UPDATE currency_rates SET rate_to_inr=?, updated_at=NOW() WHERE id=?",
                    [parseFloat(rateToInr).toFixed(4), row.id]
                );
            }
        }

        res.json({ ok: true, message: "Currency rates synced successfully!" });
    } catch (error) {
        console.error("Live currency sync failed:", error);
        res.status(500).json({ error: "Failed to sync rates in real-time" });
    }
});

module.exports = router;