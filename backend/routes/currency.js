const router = require("express").Router();
const db = require("../db");
const https = require("https");
const { verifyAdmin } = require("../middleware/auth");

// Helper to fetch live rates from free public APIs (returns rates where 1 INR = X foreign currency units)
function fetchRates() {
  return new Promise((resolve, reject) => {
    const urls = [
      "https://open.er-api.com/v6/latest/USD",
      "https://open.er-api.com/v6/latest/INR",
      "https://api.exchangerate-api.com/v4/latest/INR",
      "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/inr.json"
    ];

    const tryFetch = (index) => {
      if (index >= urls.length) {
        return reject(new Error("All exchange rate APIs failed"));
      }

      const options = {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
      };

      https.get(urls[index], options, (res) => {
        let data = "";
        res.on("data", chunk => data += chunk);
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed && parsed.rates) {
              if (parsed.base_code === "USD" && parsed.rates.INR) {
                // 1 USD = usdToInr INR (e.g. 83.5 INR)
                // Therefore: 1 INR = (1 / usdToInr) USD (e.g. 0.011976 USD)
                const usdToInr = parsed.rates.INR;
                const ratesRelativeToInr = {};
                for (const [code, usdRate] of Object.entries(parsed.rates)) {
                  // usdRate is units of 'code' per 1 USD
                  // units of 'code' per 1 INR = usdRate / usdToInr
                  ratesRelativeToInr[code] = usdRate / usdToInr;
                }
                resolve({ rates: ratesRelativeToInr });
              } else {
                resolve({ rates: parsed.rates });
              }
            } else if (parsed && parsed.inr) {
              resolve({ rates: parsed.inr });
            } else {
              tryFetch(index + 1);
            }
          } catch (e) {
            tryFetch(index + 1);
          }
        });
      }).on("error", () => tryFetch(index + 1));
    };

    tryFetch(0);
  });
}

// Major world currencies metadata for automatic autofill and live lookup
const WORLD_CURRENCIES_METADATA = {
  USD: { country_name: "United States", country_code: "US", currency_symbol: "$", flag_emoji: "🇺🇸" },
  EUR: { country_name: "Eurozone", country_code: "EU", currency_symbol: "€", flag_emoji: "🇪🇺" },
  GBP: { country_name: "United Kingdom", country_code: "GB", currency_symbol: "£", flag_emoji: "🇬🇧" },
  AED: { country_name: "United Arab Emirates", country_code: "AE", currency_symbol: "د.إ", flag_emoji: "🇦🇪" },
  SAR: { country_name: "Saudi Arabia", country_code: "SA", currency_symbol: "﷼", flag_emoji: "🇸🇦" },
  SGD: { country_name: "Singapore", country_code: "SG", currency_symbol: "S$", flag_emoji: "🇸🇬" },
  MYR: { country_name: "Malaysia", country_code: "MY", currency_symbol: "RM", flag_emoji: "🇲🇾" },
  AUD: { country_name: "Australia", country_code: "AU", currency_symbol: "A$", flag_emoji: "🇦🇺" },
  CAD: { country_name: "Canada", country_code: "CA", currency_symbol: "C$", flag_emoji: "🇨🇦" },
  JPY: { country_name: "Japan", country_code: "JP", currency_symbol: "¥", flag_emoji: "🇯🇵" },
  CHF: { country_name: "Switzerland", country_code: "CH", currency_symbol: "CHF", flag_emoji: "🇨🇭" },
  NZD: { country_name: "New Zealand", country_code: "NZ", currency_symbol: "NZ$", flag_emoji: "🇳🇿" },
  CNY: { country_name: "China", country_code: "CN", currency_symbol: "¥", flag_emoji: "🇨🇳" },
  HKD: { country_name: "Hong Kong", country_code: "HK", currency_symbol: "HK$", flag_emoji: "🇭🇰" },
  KWD: { country_name: "Kuwait", country_code: "KW", currency_symbol: "KD", flag_emoji: "🇰🇼" },
  BHD: { country_name: "Bahrain", country_code: "BH", currency_symbol: "BD", flag_emoji: "🇧🇭" },
  QAR: { country_name: "Qatar", country_code: "QA", currency_symbol: "QR", flag_emoji: "🇶🇦" },
  OMR: { country_name: "Oman", country_code: "OM", currency_symbol: "OMR", flag_emoji: "🇴🇲" },
  THB: { country_name: "Thailand", country_code: "TH", currency_symbol: "฿", flag_emoji: "🇹🇭" },
  IDR: { country_name: "Indonesia", country_code: "ID", currency_symbol: "Rp", flag_emoji: "🇮🇩" },
  KRW: { country_name: "South Korea", country_code: "KR", currency_symbol: "₩", flag_emoji: "🇰🇷" },
  ZAR: { country_name: "South Africa", country_code: "ZA", currency_symbol: "R", flag_emoji: "🇿🇦" },
  BRL: { country_name: "Brazil", country_code: "BR", currency_symbol: "R$", flag_emoji: "🇧🇷" },
  MXN: { country_name: "Mexico", country_code: "MX", currency_symbol: "$", flag_emoji: "🇲🇽" },
  SEK: { country_name: "Sweden", country_code: "SE", currency_symbol: "kr", flag_emoji: "🇸🇪" },
  NOK: { country_name: "Norway", country_code: "NO", currency_symbol: "kr", flag_emoji: "🇳🇴" },
  DKK: { country_name: "Denmark", country_code: "DK", currency_symbol: "kr", flag_emoji: "🇩🇰" },
  PLN: { country_name: "Poland", country_code: "PL", currency_symbol: "zł", flag_emoji: "🇵🇱" },
  PHP: { country_name: "Philippines", country_code: "PH", currency_symbol: "₱", flag_emoji: "🇵🇭" },
  TRY: { country_name: "Turkey", country_code: "TR", currency_symbol: "₺", flag_emoji: "🇹🇷" },
  ILS: { country_name: "Israel", country_code: "IL", currency_symbol: "₪", flag_emoji: "🇮🇱" },
  INR: { country_name: "India", country_code: "IN", currency_symbol: "₹", flag_emoji: "🇮🇳" }
};

// GET all shipping countries with rates
router.get("/", async (req, res) => {
    const { active } = req.query;
    let query = "SELECT * FROM currency_rates";
    if (active === "1") {
        query += " WHERE shipping_allowed=TRUE";
    }
    query += " ORDER BY country_name";

    try {
        // Fetch live rates and update DB synchronously
        try {
          const liveData = await fetchRates();
          if (liveData && liveData.rates) {
            const [currentDb] = await db.query("SELECT id, currency_code FROM currency_rates");
            for (const r of currentDb) {
              if (r.currency_code === "INR") {
                await db.query("UPDATE currency_rates SET rate_to_inr=1.0, updated_at=NOW() WHERE id=?", [r.id]).catch(() => {});
              } else if (liveData.rates[r.currency_code]) {
                const val = parseFloat(liveData.rates[r.currency_code]);
                if (!isNaN(val) && val > 0) {
                  await db.query("UPDATE currency_rates SET rate_to_inr=?, updated_at=NOW() WHERE id=?", [val.toFixed(6), r.id]).catch(() => {});
                }
              }
            }
          }
        } catch (e) {
          // Fallback to current DB rows if offline
        }

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

// ADMIN — get all available world currencies from live API with presets
router.get("/available", verifyAdmin, async (req, res) => {
  try {
    let ratesMap = {};
    try {
      const data = await fetchRates();
      if (data && data.rates) {
        ratesMap = data.rates;
      }
    } catch (e) {
      console.warn("Could not fetch live rates for available currencies, using presets:", e.message);
    }

    // Combine preset world currencies and all live rate codes
    const allCodes = Array.from(new Set([
      ...Object.keys(WORLD_CURRENCIES_METADATA),
      ...Object.keys(ratesMap)
    ])).filter(c => c && c.length === 3);

    const availableList = allCodes.map(code => {
      const upperCode = code.toUpperCase();
      const preset = WORLD_CURRENCIES_METADATA[upperCode] || {};
      const rate = ratesMap[upperCode] || (upperCode === "INR" ? 1.0 : null);

      return {
        currency_code: upperCode,
        country_name: preset.country_name || upperCode,
        country_code: preset.country_code || upperCode.substring(0, 2),
        currency_symbol: preset.currency_symbol || upperCode,
        flag_emoji: preset.flag_emoji || "🌐",
        live_rate: rate ? parseFloat(rate) : null,
        inr_equivalent: rate && rate > 0 ? (1 / rate).toFixed(2) : null
      };
    });

    // Sort: priority to presets with flags, then alphabetical
    availableList.sort((a, b) => {
      if (a.currency_code === "INR") return -1;
      if (b.currency_code === "INR") return 1;
      return a.country_name.localeCompare(b.country_name);
    });

    res.json(availableList);
  } catch (error) {
    console.error("Available currencies fetch error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ADMIN — add new currency to conversion list (Connected with Live Sync)
router.post("/", verifyAdmin, async (req, res) => {
  try {
    let { country_name, country_code, currency_code, currency_symbol, flag_emoji, rate_to_inr, shipping_allowed } = req.body;

    if (!currency_code || !country_name) {
      return res.status(400).json({ error: "Country name and currency code are required" });
    }

    currency_code = String(currency_code).trim().toUpperCase();
    country_code = String(country_code || currency_code.substring(0, 2)).trim().toUpperCase();
    country_name = String(country_name).trim();
    currency_symbol = String(currency_symbol || currency_code).trim();
    flag_emoji = String(flag_emoji || "🌐").trim();
    const isAllowed = shipping_allowed === false || shipping_allowed === 0 || shipping_allowed === "0" ? 0 : 1;

    let finalRate = parseFloat(rate_to_inr);
    if (isNaN(finalRate) || finalRate <= 0) {
      // Auto-fetch rate from live rate API relative to INR
      try {
        const live = await fetchRates();
        if (live && live.rates && live.rates[currency_code]) {
          finalRate = parseFloat(live.rates[currency_code]);
        }
      } catch (err) {
        console.warn("Live rate auto-fetch on add currency fallback:", err.message);
      }
    }

    if (isNaN(finalRate) || finalRate <= 0) {
      finalRate = currency_code === "INR" ? 1.0 : 0.01;
    }

    // Check if currency/country pair already exists
    const [existing] = await db.query(
      "SELECT id FROM currency_rates WHERE currency_code = ? AND (country_code = ? OR country_name = ?)",
      [currency_code, country_code, country_name]
    );

    if (existing.length > 0) {
      await db.query(
        "UPDATE currency_rates SET country_name=?, country_code=?, currency_symbol=?, flag_emoji=?, rate_to_inr=?, shipping_allowed=?, updated_at=NOW() WHERE id=?",
        [country_name, country_code, currency_symbol, flag_emoji, finalRate.toFixed(6), isAllowed, existing[0].id]
      );
      return res.json({
        ok: true,
        message: `Updated existing conversion rate for ${currency_code} (${country_name})`,
        id: existing[0].id,
        currency_code,
        rate_to_inr: finalRate
      });
    }

    const [insertResult] = await db.query(
      `INSERT INTO currency_rates (country_name, country_code, currency_code, currency_symbol, flag_emoji, rate_to_inr, shipping_allowed, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [country_name, country_code, currency_code, currency_symbol, flag_emoji, finalRate.toFixed(6), isAllowed]
    );

    res.json({
      ok: true,
      message: `Currency ${currency_code} added successfully and linked to live sync!`,
      id: insertResult.insertId,
      currency_code,
      country_name,
      rate_to_inr: finalRate
    });
  } catch (err) {
    console.error("Add currency error:", err);
    res.status(500).json({ error: `Failed to add currency: ${err.message}` });
  }
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
        [rateVal.toFixed(6), shipping_allowed, req.params.id]);
    res.json({ message: "Rate updated successfully" });
});

// ADMIN — delete/remove currency (except base INR)
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    const [row] = await db.query("SELECT currency_code, country_name FROM currency_rates WHERE id = ?", [req.params.id]);
    if (!row.length) {
      return res.status(404).json({ error: "Currency not found" });
    }
    if (row[0].currency_code === "INR") {
      return res.status(400).json({ error: "Cannot delete base store currency INR" });
    }
    await db.query("DELETE FROM currency_rates WHERE id = ?", [req.params.id]);
    res.json({ ok: true, message: `Removed ${row[0].currency_code} (${row[0].country_name}) from conversion list` });
  } catch (err) {
    console.error("Delete currency error:", err);
    res.status(500).json({ error: `Failed to delete currency: ${err.message}` });
  }
});

// ADMIN — sync live rates relative to INR for ALL currencies in conversion list
router.post("/sync", verifyAdmin, async (req, res) => {
    try {
        const data = await fetchRates();
        const rates = data?.rates;

        if (!rates) {
          return res.status(500).json({ error: "Could not fetch live exchange rates from financial APIs" });
        }

        const [dbRates] = await db.query("SELECT id, currency_code FROM currency_rates");
        let updatedCount = 0;

        for (const row of dbRates) {
            const code = row.currency_code;
            if (code === "INR") {
                await db.query("UPDATE currency_rates SET rate_to_inr=1.0, updated_at=NOW() WHERE id=?", [row.id]).catch(() => {});
                updatedCount++;
            } else if (rates[code]) {
                const rateVal = parseFloat(rates[code]);
                if (isNaN(rateVal) || rateVal <= 0 || !isFinite(rateVal)) continue;

                await db.query("UPDATE currency_rates SET rate_to_inr=?, updated_at=NOW() WHERE id=?", [rateVal.toFixed(6), row.id]).catch(() => {});
                updatedCount++;
            }
        }

        res.json({
          ok: true,
          success: true,
          message: `Live exchange rates synchronized successfully for ${updatedCount} currencies!`,
          synced_at: new Date(),
          total_synced: updatedCount
        });
    } catch (error) {
        console.error("Live currency sync failed:", error.message);
        res.status(500).json({ error: `Live currency sync failed: ${error.message}` });
    }
});

module.exports = router;