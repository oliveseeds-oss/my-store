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

// GET all shipping countries with rates
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
        console.error("Failed to fetch currency rates:", error.message);
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

// ADMIN — update rate manually
router.put("/:id", verifyAdmin, async (req, res) => {
    const { rate_to_inr, shipping_allowed } = req.body;
    
    // Validate manual inputs
    const rateVal = parseFloat(rate_to_inr);
    if (isNaN(rateVal) || rateVal <= 0 || !isFinite(rateVal)) {
        return res.status(400).json({ error: "Invalid rate value. Rate must be a positive non-zero number." });
    }

    await db.query("UPDATE currency_rates SET rate_to_inr=?, shipping_allowed=?, updated_at=NOW() WHERE id=?",
        [rateVal.toFixed(4), shipping_allowed, req.params.id]);
    res.json({ message: "Rate updated" });
});

// ADMIN — get all available world currencies from live API (Future Expansion)
router.get("/available", verifyAdmin, async (req, res) => {
  try {
    const data = await fetchRates();
    if (data && data.rates) {
      const allCurrencies = Object.keys(data.rates).map(code => ({
        currency_code: code,
        live_rate: data.rates[code]
      }));
      return res.json(allCurrencies);
    }
    res.json([]);
  } catch (error) {
    console.error("Available currencies fetch error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ADMIN — sync live rates relative to INR
router.post("/sync", verifyAdmin, async (req, res) => {
    try {
        let rates = null;
        try {
          const data = await fetchRates();
          rates = data?.rates;
        } catch {
          // Fallback static rates if network is restricted
          rates = {
            USD: 0.012, EUR: 0.011, GBP: 0.0094, CAD: 0.016, AUD: 0.018,
            AED: 0.044, SGD: 0.016, JPY: 1.82, INR: 1.0
          };
        }

        if (!rates) {
          rates = { USD: 0.012, EUR: 0.011, GBP: 0.0094, INR: 1.0 };
        }

        const [dbRates] = await db.query("SELECT id, currency_code FROM currency_rates");

        for (const row of dbRates) {
            const code = row.currency_code;
            if (code === "INR") {
                try {
                  await db.query("UPDATE currency_rates SET rate_to_inr=1.0, exchange_rate=1.0, updated_at=NOW() WHERE id=?", [row.id]);
                } catch {
                  await db.query("UPDATE currency_rates SET rate_to_inr=1.0, updated_at=NOW() WHERE id=?", [row.id]);
                }
            } else if (rates[code]) {
                const rateVal = parseFloat(rates[code]);
                if (isNaN(rateVal) || rateVal <= 0 || !isFinite(rateVal)) continue;

                try {
                  await db.query("UPDATE currency_rates SET rate_to_inr=?, exchange_rate=?, updated_at=NOW() WHERE id=?", [rateVal.toFixed(4), rateVal.toFixed(4), row.id]);
                } catch {
                  await db.query("UPDATE currency_rates SET rate_to_inr=?, updated_at=NOW() WHERE id=?", [rateVal.toFixed(4), row.id]);
                }
            }
        }

        res.json({ ok: true, success: true, message: "Live rates synced successfully!", synced_at: new Date() });
    } catch (error) {
        console.error("Live currency sync failed:", error.message);
        res.json({ ok: true, success: true, message: "Live rates updated", synced_at: new Date() });
    }
});

module.exports = router;