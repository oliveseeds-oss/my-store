const express = require("express");
const db = require("../db");
const { verifyAdmin } = require("../middleware/auth");

const shippingRatesRouter = express.Router();
const adminShippingRatesRouter = express.Router();

// Helper: Get exchange rate for currency_code (1 INR = X currency_code)
async function getCurrencyMultiplier(targetCurrency) {
  if (!targetCurrency || targetCurrency.toUpperCase() === "INR") {
    return 1.0;
  }
  try {
    const [rows] = await db.query(
      "SELECT rate_to_inr FROM currency_rates WHERE currency_code = ? LIMIT 1",
      [targetCurrency.toUpperCase()]
    );
    if (rows.length > 0 && parseFloat(rows[0].rate_to_inr) > 0) {
      return parseFloat(rows[0].rate_to_inr);
    }
  } catch (err) {
    console.error("Error looking up currency multiplier:", err.message);
  }
  return 1.0;
}

// Helper: Calculate shipping cost given parameters
function computeShippingCost({
  baseRate,
  firstWeightGrams,
  firstWeightRate,
  additionalWeightGrams,
  additionalWeightRate,
  freeShippingAbove,
  totalWeightGrams,
  orderValue
}) {
  const weight = Math.max(1, parseInt(totalWeightGrams, 10) || 500);
  const val = parseFloat(orderValue) || 0;
  const freeAbove = freeShippingAbove !== null && freeShippingAbove !== undefined ? parseFloat(freeShippingAbove) : null;

  if (freeAbove !== null && freeAbove > 0 && val >= freeAbove) {
    return {
      shippingCost: 0,
      isFree: true,
      breakdown: { baseRate: 0, firstWeightCost: 0, extraWeightCost: 0, extraUnits: 0, reason: "Order value qualifies for free shipping" }
    };
  }

  const base = parseFloat(baseRate) || 0;
  const firstSlabGrams = parseInt(firstWeightGrams, 10) || 500;
  const firstSlabRate = parseFloat(firstWeightRate) || 0;
  const extraUnitGrams = Math.max(1, parseInt(additionalWeightGrams, 10) || 500);
  const extraUnitRate = parseFloat(additionalWeightRate) || 0;

  if (weight <= firstSlabGrams) {
    const cost = Math.round((base + firstSlabRate) * 100) / 100;
    return {
      shippingCost: cost,
      isFree: cost === 0,
      breakdown: { baseRate: base, firstWeightCost: firstSlabRate, extraWeightCost: 0, extraUnits: 0 }
    };
  }

  const extraWeight = weight - firstSlabGrams;
  const extraUnits = Math.ceil(extraWeight / extraUnitGrams);
  const extraCost = extraUnits * extraUnitRate;
  const totalCost = Math.round((base + firstSlabRate + extraCost) * 100) / 100;

  return {
    shippingCost: totalCost,
    isFree: totalCost === 0,
    breakdown: {
      baseRate: base,
      firstWeightCost: firstSlabRate,
      extraUnits,
      extraUnitGrams,
      extraUnitRate,
      extraWeightCost: extraCost
    }
  };
}

// ─────────────────────────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────────────────────────

/**
 * POST /api/shipping-rates/calculate
 * Calculate shipping options for order
 */
shippingRatesRouter.post("/calculate", async (req, res) => {
  try {
    const { country_code, total_weight_grams, order_value, currency_code } = req.body;
    if (!country_code) {
      return res.status(400).json({ error: "country_code is required" });
    }

    const upperCode = country_code.trim().toUpperCase();
    const weight = Math.max(1, parseInt(total_weight_grams, 10) || 500);
    const orderVal = parseFloat(order_value) || 0;
    const targetCurrency = (currency_code || "INR").toUpperCase();
    const exchangeMultiplier = await getCurrencyMultiplier(targetCurrency);

    // 1. Get Country Name from shipping_countries or fallback
    let countryName = upperCode;
    try {
      const [cRows] = await db.query(
        "SELECT country_name FROM shipping_countries WHERE country_code = ?",
        [upperCode]
      );
      if (cRows.length) countryName = cRows[0].country_name;
    } catch (e) {}

    // 2. Check for country overrides first
    const [overrides] = await db.query(
      `SELECT sco.*, sm.method_name, sm.method_code, sm.estimated_days_min, sm.estimated_days_max
       FROM shipping_country_overrides sco
       JOIN shipping_methods sm ON sco.method_id = sm.id
       WHERE sco.country_code = ? AND sco.is_active = TRUE AND sm.is_active = TRUE`,
      [upperCode]
    );

    let methodsOutput = [];
    let appliedSource = "zone";
    let matchedZoneName = "Rest of World";

    if (overrides.length > 0) {
      appliedSource = "override";
      matchedZoneName = `Custom Override (${countryName})`;

      for (const ov of overrides) {
        const calc = computeShippingCost({
          baseRate: ov.base_rate,
          firstWeightGrams: ov.first_weight_grams,
          firstWeightRate: ov.first_weight_rate,
          additionalWeightGrams: ov.additional_weight_grams,
          additionalWeightRate: ov.additional_weight_rate,
          freeShippingAbove: ov.free_shipping_above,
          totalWeightGrams: weight,
          orderValue: orderVal
        });

        const costInr = calc.shippingCost;
        const convertedCost = Math.round((costInr * exchangeMultiplier) * 100) / 100;
        const freeAboveInr = ov.free_shipping_above !== null ? parseFloat(ov.free_shipping_above) : null;
        const freeAboveConverted = freeAboveInr !== null ? Math.round((freeAboveInr * exchangeMultiplier) * 100) / 100 : null;

        methodsOutput.push({
          method_id: ov.method_id,
          method_name: ov.method_name,
          method_code: ov.method_code,
          estimated_days: `${ov.estimated_days_min}-${ov.estimated_days_max} days`,
          shipping_cost: convertedCost,
          shipping_cost_inr: costInr,
          free_shipping_above: freeAboveInr,
          free_shipping_above_converted: freeAboveConverted,
          is_free: calc.isFree,
          breakdown: calc.breakdown
        });
      }
    } else {
      // 3. Find Zone for this country
      const [zoneRows] = await db.query(
        `SELECT sz.id, sz.zone_name
         FROM shipping_zone_countries szc
         JOIN shipping_zones sz ON szc.zone_id = sz.id
         WHERE szc.country_code = ? AND sz.is_active = TRUE
         LIMIT 1`,
        [upperCode]
      );

      let zoneId = null;
      if (zoneRows.length > 0) {
        zoneId = zoneRows[0].id;
        matchedZoneName = zoneRows[0].zone_name;
      } else {
        // Fallback to "Rest of World" zone if country has no direct assignment
        const [rowZone] = await db.query(
          "SELECT id, zone_name FROM shipping_zones WHERE zone_name LIKE '%Rest of World%' AND is_active = TRUE LIMIT 1"
        );
        if (rowZone.length > 0) {
          zoneId = rowZone[0].id;
          matchedZoneName = rowZone[0].zone_name;
        }
      }

      if (zoneId) {
        const [rates] = await db.query(
          `SELECT sr.*, sm.method_name, sm.method_code, sm.estimated_days_min, sm.estimated_days_max
           FROM shipping_rates sr
           JOIN shipping_methods sm ON sr.method_id = sm.id
           WHERE sr.zone_id = ? AND sr.is_active = TRUE AND sm.is_active = TRUE`,
          [zoneId]
        );

        for (const r of rates) {
          const calc = computeShippingCost({
            baseRate: r.base_rate,
            firstWeightGrams: r.first_weight_grams,
            firstWeightRate: r.first_weight_rate,
            additionalWeightGrams: r.additional_weight_grams,
            additionalWeightRate: r.additional_weight_rate,
            freeShippingAbove: r.free_shipping_above,
            totalWeightGrams: weight,
            orderValue: orderVal
          });

          const costInr = calc.shippingCost;
          const convertedCost = Math.round((costInr * exchangeMultiplier) * 100) / 100;
          const freeAboveInr = r.free_shipping_above !== null ? parseFloat(r.free_shipping_above) : null;
          const freeAboveConverted = freeAboveInr !== null ? Math.round((freeAboveInr * exchangeMultiplier) * 100) / 100 : null;

          methodsOutput.push({
            method_id: r.method_id,
            method_name: r.method_name,
            method_code: r.method_code,
            estimated_days: `${r.estimated_days_min}-${r.estimated_days_max} days`,
            shipping_cost: convertedCost,
            shipping_cost_inr: costInr,
            free_shipping_above: freeAboveInr,
            free_shipping_above_converted: freeAboveConverted,
            is_free: calc.isFree,
            breakdown: calc.breakdown
          });
        }
      }
    }

    res.json({
      country_code: upperCode,
      country_name: countryName,
      zone: matchedZoneName,
      source: appliedSource,
      currency: targetCurrency,
      exchange_rate: exchangeMultiplier,
      methods: methodsOutput
    });
  } catch (error) {
    console.error("Shipping calculate error:", error);
    res.status(500).json({ error: "Failed to calculate shipping rates" });
  }
});

/**
 * GET /api/shipping-rates/country/:country_code
 * Quick rate estimates for product detail page
 */
shippingRatesRouter.get("/country/:country_code", async (req, res) => {
  try {
    const { country_code } = req.params;
    const { weight_grams, currency_code } = req.query;
    const upperCode = country_code.trim().toUpperCase();
    const weight = parseInt(weight_grams, 10) || 500;
    const targetCurrency = (currency_code || "INR").toUpperCase();
    const exchangeMultiplier = await getCurrencyMultiplier(targetCurrency);

    // Call internal calculation logic with default weight
    let countryName = upperCode;
    try {
      const [cRows] = await db.query(
        "SELECT country_name FROM shipping_countries WHERE country_code = ?",
        [upperCode]
      );
      if (cRows.length) countryName = cRows[0].country_name;
    } catch (e) {}

    // Check override first
    const [overrides] = await db.query(
      `SELECT sco.*, sm.method_name, sm.method_code, sm.estimated_days_min, sm.estimated_days_max
       FROM shipping_country_overrides sco
       JOIN shipping_methods sm ON sco.method_id = sm.id
       WHERE sco.country_code = ? AND sco.is_active = TRUE AND sm.is_active = TRUE`,
      [upperCode]
    );

    let rates = [];
    let zoneName = "Rest of World";

    if (overrides.length > 0) {
      zoneName = `Override (${countryName})`;
      rates = overrides;
    } else {
      const [zoneRows] = await db.query(
        `SELECT sz.id, sz.zone_name
         FROM shipping_zone_countries szc
         JOIN shipping_zones sz ON szc.zone_id = sz.id
         WHERE szc.country_code = ? AND sz.is_active = TRUE
         LIMIT 1`,
        [upperCode]
      );

      let zoneId = zoneRows.length ? zoneRows[0].id : null;
      if (zoneRows.length) zoneName = zoneRows[0].zone_name;

      if (!zoneId) {
        const [rowZone] = await db.query(
          "SELECT id, zone_name FROM shipping_zones WHERE zone_name LIKE '%Rest of World%' AND is_active = TRUE LIMIT 1"
        );
        if (rowZone.length) {
          zoneId = rowZone[0].id;
          zoneName = rowZone[0].zone_name;
        }
      }

      if (zoneId) {
        const [zoneRates] = await db.query(
          `SELECT sr.*, sm.method_name, sm.method_code, sm.estimated_days_min, sm.estimated_days_max
           FROM shipping_rates sr
           JOIN shipping_methods sm ON sr.method_id = sm.id
           WHERE sr.zone_id = ? AND sr.is_active = TRUE AND sm.is_active = TRUE`,
          [zoneId]
        );
        rates = zoneRates;
      }
    }

    const methodsOutput = rates.map(r => {
      const calc = computeShippingCost({
        baseRate: r.base_rate,
        firstWeightGrams: r.first_weight_grams,
        firstWeightRate: r.first_weight_rate,
        additionalWeightGrams: r.additional_weight_grams,
        additionalWeightRate: r.additional_weight_rate,
        freeShippingAbove: r.free_shipping_above,
        totalWeightGrams: weight,
        orderValue: 0
      });

      const costInr = calc.shippingCost;
      const convertedCost = Math.round((costInr * exchangeMultiplier) * 100) / 100;
      const freeAboveInr = r.free_shipping_above !== null ? parseFloat(r.free_shipping_above) : null;
      const freeAboveConverted = freeAboveInr !== null ? Math.round((freeAboveInr * exchangeMultiplier) * 100) / 100 : null;

      return {
        method_id: r.method_id,
        method_name: r.method_name,
        method_code: r.method_code,
        estimated_days: `${r.estimated_days_min}-${r.estimated_days_max} days`,
        shipping_cost: convertedCost,
        shipping_cost_inr: costInr,
        free_shipping_above: freeAboveInr,
        free_shipping_above_converted: freeAboveConverted
      };
    });

    res.json({
      country_code: upperCode,
      country_name: countryName,
      zone: zoneName,
      currency: targetCurrency,
      methods: methodsOutput
    });
  } catch (error) {
    console.error("Country shipping estimate error:", error);
    res.status(500).json({ error: "Failed to fetch country shipping estimates" });
  }
});

/**
 * GET /api/shipping-rates/product-weights/:product_id
 * Public lookup for product weight
 */
shippingRatesRouter.get("/product-weights/:product_id", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT weight_grams, length_cm, width_cm, height_cm FROM product_shipping_weight WHERE product_id = ?",
      [req.params.product_id]
    );
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.json({ weight_grams: 500, length_cm: null, width_cm: null, height_cm: null });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product weight" });
  }
});

// ─────────────────────────────────────────────────────────────
// ADMIN ROUTES (All protected with verifyAdmin)
// ─────────────────────────────────────────────────────────────

// ── 1. ZONES ──
adminShippingRatesRouter.get("/zones", verifyAdmin, async (req, res) => {
  try {
    const [zones] = await db.query("SELECT * FROM shipping_zones ORDER BY id ASC");
    const [countries] = await db.query("SELECT * FROM shipping_zone_countries ORDER BY country_name ASC");

    const countriesByZone = {};
    for (const c of countries) {
      if (!countriesByZone[c.zone_id]) countriesByZone[c.zone_id] = [];
      countriesByZone[c.zone_id].push(c);
    }

    const results = zones.map(z => ({
      ...z,
      countries: countriesByZone[z.id] || [],
      country_count: (countriesByZone[z.id] || []).length
    }));

    res.json(results);
  } catch (error) {
    console.error("Admin fetch zones error:", error);
    res.status(500).json({ error: "Failed to fetch zones" });
  }
});

adminShippingRatesRouter.post("/zones", verifyAdmin, async (req, res) => {
  try {
    const { zone_name, zone_description, is_active } = req.body;
    if (!zone_name) return res.status(400).json({ error: "Zone name is required" });

    const [insertResult] = await db.query(
      "INSERT INTO shipping_zones (zone_name, zone_description, is_active) VALUES (?, ?, ?)",
      [zone_name.trim(), zone_description || "", is_active !== false]
    );
    const [newZone] = await db.query("SELECT * FROM shipping_zones WHERE id = ?", [insertResult.insertId]);
    res.status(201).json(newZone[0]);
  } catch (error) {
    console.error("Admin create zone error:", error);
    res.status(500).json({ error: "Failed to create zone" });
  }
});

adminShippingRatesRouter.put("/zones/:id", verifyAdmin, async (req, res) => {
  try {
    const { zone_name, zone_description, is_active } = req.body;
    const zoneId = req.params.id;

    await db.query(
      "UPDATE shipping_zones SET zone_name = COALESCE(?, zone_name), zone_description = COALESCE(?, zone_description), is_active = COALESCE(?, is_active) WHERE id = ?",
      [zone_name, zone_description, is_active, zoneId]
    );
    const [updated] = await db.query("SELECT * FROM shipping_zones WHERE id = ?", [zoneId]);
    res.json(updated[0]);
  } catch (error) {
    console.error("Admin update zone error:", error);
    res.status(500).json({ error: "Failed to update zone" });
  }
});

adminShippingRatesRouter.delete("/zones/:id", verifyAdmin, async (req, res) => {
  try {
    const zoneId = req.params.id;
    await db.query("DELETE FROM shipping_zones WHERE id = ?", [zoneId]);
    res.json({ success: true, message: "Zone deleted successfully" });
  } catch (error) {
    console.error("Admin delete zone error:", error);
    res.status(500).json({ error: "Failed to delete zone" });
  }
});

// ── 2. ZONE COUNTRIES ──
adminShippingRatesRouter.get("/zones/:id/countries", verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM shipping_zone_countries WHERE zone_id = ? ORDER BY country_name ASC",
      [req.params.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch zone countries" });
  }
});

adminShippingRatesRouter.post("/zones/:id/countries", verifyAdmin, async (req, res) => {
  try {
    const zoneId = req.params.id;
    const { country_code, country_name, countries } = req.body;

    // Support single or multiple array assignment
    const list = Array.isArray(countries) ? countries : [{ country_code, country_name }];

    for (const item of list) {
      if (!item.country_code) continue;
      const code = item.country_code.toUpperCase();
      const name = item.country_name || code;

      // Countries can only be in ONE zone at a time — remove from any existing zone
      await db.query("DELETE FROM shipping_zone_countries WHERE country_code = ?", [code]);

      // Assign to this zone
      await db.query(
        "INSERT INTO shipping_zone_countries (zone_id, country_code, country_name) VALUES (?, ?, ?)",
        [zoneId, code, name]
      );
    }

    const [updated] = await db.query(
      "SELECT * FROM shipping_zone_countries WHERE zone_id = ? ORDER BY country_name ASC",
      [zoneId]
    );
    res.json({ success: true, countries: updated });
  } catch (error) {
    console.error("Assign countries error:", error);
    res.status(500).json({ error: "Failed to assign countries to zone" });
  }
});

adminShippingRatesRouter.delete("/zones/:id/countries/:country_code", verifyAdmin, async (req, res) => {
  try {
    await db.query(
      "DELETE FROM shipping_zone_countries WHERE zone_id = ? AND country_code = ?",
      [req.params.id, req.params.country_code.toUpperCase()]
    );
    res.json({ success: true, message: "Country removed from zone" });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove country from zone" });
  }
});

// ── 3. SHIPPING METHODS ──
adminShippingRatesRouter.get("/methods", verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM shipping_methods ORDER BY id ASC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch shipping methods" });
  }
});

adminShippingRatesRouter.post("/methods", verifyAdmin, async (req, res) => {
  try {
    const { method_name, method_code, description, estimated_days_min, estimated_days_max, is_active } = req.body;
    if (!method_name) return res.status(400).json({ error: "Method name is required" });

    const code = (method_code || method_name.toLowerCase().replace(/[^a-z0-9]+/g, "-")).trim();

    const [insertResult] = await db.query(
      "INSERT INTO shipping_methods (method_name, method_code, description, estimated_days_min, estimated_days_max, is_active) VALUES (?, ?, ?, ?, ?, ?)",
      [method_name.trim(), code, description || "", parseInt(estimated_days_min, 10) || 1, parseInt(estimated_days_max, 10) || 7, is_active !== false]
    );
    const [newMethod] = await db.query("SELECT * FROM shipping_methods WHERE id = ?", [insertResult.insertId]);
    res.status(201).json(newMethod[0]);
  } catch (error) {
    console.error("Create method error:", error);
    res.status(500).json({ error: "Failed to create shipping method" });
  }
});

adminShippingRatesRouter.put("/methods/:id", verifyAdmin, async (req, res) => {
  try {
    const { method_name, method_code, description, estimated_days_min, estimated_days_max, is_active } = req.body;
    const methodId = req.params.id;

    await db.query(
      `UPDATE shipping_methods SET
        method_name = COALESCE(?, method_name),
        method_code = COALESCE(?, method_code),
        description = COALESCE(?, description),
        estimated_days_min = COALESCE(?, estimated_days_min),
        estimated_days_max = COALESCE(?, estimated_days_max),
        is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [method_name, method_code, description, estimated_days_min, estimated_days_max, is_active, methodId]
    );
    const [updated] = await db.query("SELECT * FROM shipping_methods WHERE id = ?", [methodId]);
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to update shipping method" });
  }
});

adminShippingRatesRouter.delete("/methods/:id", verifyAdmin, async (req, res) => {
  try {
    await db.query("DELETE FROM shipping_methods WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Shipping method deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete shipping method" });
  }
});

// ── 4. RATES PER ZONE ──
adminShippingRatesRouter.get("/rates", verifyAdmin, async (req, res) => {
  try {
    const { zone_id } = req.query;
    let query = `
      SELECT sr.*, sz.zone_name, sm.method_name, sm.method_code, sm.estimated_days_min, sm.estimated_days_max
      FROM shipping_rates sr
      JOIN shipping_zones sz ON sr.zone_id = sz.id
      JOIN shipping_methods sm ON sr.method_id = sm.id
    `;
    const params = [];
    if (zone_id) {
      query += " WHERE sr.zone_id = ?";
      params.push(zone_id);
    }
    query += " ORDER BY sr.zone_id ASC, sr.method_id ASC";

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Fetch rates error:", error);
    res.status(500).json({ error: "Failed to fetch rates" });
  }
});

adminShippingRatesRouter.post("/rates", verifyAdmin, async (req, res) => {
  try {
    const {
      zone_id,
      method_id,
      base_rate,
      first_weight_grams,
      first_weight_rate,
      additional_weight_grams,
      additional_weight_rate,
      free_shipping_above,
      minimum_order_value,
      rate_currency,
      is_active
    } = req.body;

    if (!zone_id || !method_id) {
      return res.status(400).json({ error: "zone_id and method_id are required" });
    }

    const freeAbove = free_shipping_above === "" || free_shipping_above === null || free_shipping_above === undefined ? null : parseFloat(free_shipping_above);

    const [insertResult] = await db.query(
      `INSERT INTO shipping_rates
        (zone_id, method_id, base_rate, first_weight_grams, first_weight_rate, additional_weight_grams, additional_weight_rate, free_shipping_above, minimum_order_value, rate_currency, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        base_rate = VALUES(base_rate),
        first_weight_grams = VALUES(first_weight_grams),
        first_weight_rate = VALUES(first_weight_rate),
        additional_weight_grams = VALUES(additional_weight_grams),
        additional_weight_rate = VALUES(additional_weight_rate),
        free_shipping_above = VALUES(free_shipping_above),
        minimum_order_value = VALUES(minimum_order_value),
        rate_currency = VALUES(rate_currency),
        is_active = VALUES(is_active)`,
      [
        zone_id,
        method_id,
        parseFloat(base_rate) || 0,
        parseInt(first_weight_grams, 10) || 500,
        parseFloat(first_weight_rate) || 0,
        parseInt(additional_weight_grams, 10) || 500,
        parseFloat(additional_weight_rate) || 0,
        freeAbove,
        parseFloat(minimum_order_value) || 0,
        rate_currency || "INR",
        is_active !== false
      ]
    );

    // Log to history
    await db.query(
      "INSERT INTO shipping_rate_history (rate_id, zone_id, method_id, old_base_rate, new_base_rate, changed_by, change_note) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [insertResult.insertId, zone_id, method_id, 0, parseFloat(base_rate) || 0, req.admin?.email || "Admin", "Rate created/upserted"]
    ).catch(() => {});

    res.status(201).json({ success: true, message: "Rate saved successfully" });
  } catch (error) {
    console.error("Save rate error:", error);
    res.status(500).json({ error: "Failed to save rate" });
  }
});

adminShippingRatesRouter.put("/rates/:id", verifyAdmin, async (req, res) => {
  try {
    const rateId = req.params.id;
    const {
      base_rate,
      first_weight_grams,
      first_weight_rate,
      additional_weight_grams,
      additional_weight_rate,
      free_shipping_above,
      minimum_order_value,
      rate_currency,
      is_active,
      change_note
    } = req.body;

    const [existing] = await db.query("SELECT * FROM shipping_rates WHERE id = ?", [rateId]);
    if (!existing.length) return res.status(404).json({ error: "Rate not found" });

    const oldBase = existing[0].base_rate;
    const newBase = base_rate !== undefined ? parseFloat(base_rate) : oldBase;
    const freeAbove = free_shipping_above === "" || free_shipping_above === null ? null : parseFloat(free_shipping_above);

    await db.query(
      `UPDATE shipping_rates SET
        base_rate = COALESCE(?, base_rate),
        first_weight_grams = COALESCE(?, first_weight_grams),
        first_weight_rate = COALESCE(?, first_weight_rate),
        additional_weight_grams = COALESCE(?, additional_weight_grams),
        additional_weight_rate = COALESCE(?, additional_weight_rate),
        free_shipping_above = ?,
        minimum_order_value = COALESCE(?, minimum_order_value),
        rate_currency = COALESCE(?, rate_currency),
        is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [
        newBase,
        first_weight_grams,
        first_weight_rate,
        additional_weight_grams,
        additional_weight_rate,
        freeAbove,
        minimum_order_value,
        rate_currency,
        is_active,
        rateId
      ]
    );

    // Log to rate history (Step 7)
    if (parseFloat(oldBase) !== parseFloat(newBase)) {
      await db.query(
        "INSERT INTO shipping_rate_history (rate_id, zone_id, method_id, old_base_rate, new_base_rate, changed_by, change_note) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [rateId, existing[0].zone_id, existing[0].method_id, oldBase, newBase, req.admin?.email || "Admin", change_note || "Manual update"]
      ).catch(() => {});
    }

    const [updated] = await db.query("SELECT * FROM shipping_rates WHERE id = ?", [rateId]);
    res.json(updated[0]);
  } catch (error) {
    console.error("Update rate error:", error);
    res.status(500).json({ error: "Failed to update rate" });
  }
});

adminShippingRatesRouter.delete("/rates/:id", verifyAdmin, async (req, res) => {
  try {
    await db.query("DELETE FROM shipping_rates WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Rate deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete rate" });
  }
});

// ── 5. COUNTRY OVERRIDES ──
adminShippingRatesRouter.get("/overrides", verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT sco.*, sm.method_name, sm.method_code
       FROM shipping_country_overrides sco
       JOIN shipping_methods sm ON sco.method_id = sm.id
       ORDER BY sco.country_name ASC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch overrides" });
  }
});

adminShippingRatesRouter.post("/overrides", verifyAdmin, async (req, res) => {
  try {
    const {
      country_code,
      country_name,
      method_id,
      base_rate,
      first_weight_grams,
      first_weight_rate,
      additional_weight_grams,
      additional_weight_rate,
      free_shipping_above,
      rate_currency,
      is_active
    } = req.body;

    if (!country_code || !method_id) {
      return res.status(400).json({ error: "country_code and method_id are required" });
    }

    const freeAbove = free_shipping_above === "" || free_shipping_above === null ? null : parseFloat(free_shipping_above);

    await db.query(
      `INSERT INTO shipping_country_overrides
        (country_code, country_name, method_id, base_rate, first_weight_grams, first_weight_rate, additional_weight_grams, additional_weight_rate, free_shipping_above, rate_currency, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        country_name = VALUES(country_name),
        method_id = VALUES(method_id),
        base_rate = VALUES(base_rate),
        first_weight_grams = VALUES(first_weight_grams),
        first_weight_rate = VALUES(first_weight_rate),
        additional_weight_grams = VALUES(additional_weight_grams),
        additional_weight_rate = VALUES(additional_weight_rate),
        free_shipping_above = VALUES(free_shipping_above),
        rate_currency = VALUES(rate_currency),
        is_active = VALUES(is_active)`,
      [
        country_code.toUpperCase(),
        country_name || country_code.toUpperCase(),
        method_id,
        parseFloat(base_rate) || 0,
        parseInt(first_weight_grams, 10) || 500,
        parseFloat(first_weight_rate) || 0,
        parseInt(additional_weight_grams, 10) || 500,
        parseFloat(additional_weight_rate) || 0,
        freeAbove,
        rate_currency || "INR",
        is_active !== false
      ]
    );

    res.status(201).json({ success: true, message: "Country override saved" });
  } catch (error) {
    console.error("Save override error:", error);
    res.status(500).json({ error: "Failed to save country override" });
  }
});

adminShippingRatesRouter.put("/overrides/:id", verifyAdmin, async (req, res) => {
  try {
    const overrideId = req.params.id;
    const {
      method_id,
      base_rate,
      first_weight_grams,
      first_weight_rate,
      additional_weight_grams,
      additional_weight_rate,
      free_shipping_above,
      is_active
    } = req.body;

    const freeAbove = free_shipping_above === "" || free_shipping_above === null ? null : parseFloat(free_shipping_above);

    await db.query(
      `UPDATE shipping_country_overrides SET
        method_id = COALESCE(?, method_id),
        base_rate = COALESCE(?, base_rate),
        first_weight_grams = COALESCE(?, first_weight_grams),
        first_weight_rate = COALESCE(?, first_weight_rate),
        additional_weight_grams = COALESCE(?, additional_weight_grams),
        additional_weight_rate = COALESCE(?, additional_weight_rate),
        free_shipping_above = ?,
        is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [
        method_id,
        base_rate,
        first_weight_grams,
        first_weight_rate,
        additional_weight_grams,
        additional_weight_rate,
        freeAbove,
        is_active,
        overrideId
      ]
    );
    res.json({ success: true, message: "Country override updated" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update override" });
  }
});

adminShippingRatesRouter.delete("/overrides/:id", verifyAdmin, async (req, res) => {
  try {
    await db.query("DELETE FROM shipping_country_overrides WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Country override deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete country override" });
  }
});

// ── 6. PRODUCT WEIGHTS ──
adminShippingRatesRouter.get("/weights", verifyAdmin, async (req, res) => {
  try {
    const { missing_only, search } = req.query;

    let query = `
      SELECT p.id, p.product_uid, p.name, p.price, p.image_url,
             psw.weight_grams, psw.length_cm, psw.width_cm, psw.height_cm,
             (psw.weight_grams IS NOT NULL) AS has_custom_weight
      FROM products p
      LEFT JOIN product_shipping_weight psw ON p.id = psw.product_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += " AND (p.name LIKE ? OR p.product_uid LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    if (missing_only === "1" || missing_only === "true") {
      query += " AND psw.weight_grams IS NULL";
    }

    query += " ORDER BY p.id DESC";

    const [rows] = await db.query(query, params);

    // Summary counts
    const [counts] = await db.query(`
      SELECT
        COUNT(p.id) as total_products,
        COUNT(psw.id) as set_count,
        (COUNT(p.id) - COUNT(psw.id)) as missing_count
      FROM products p
      LEFT JOIN product_shipping_weight psw ON p.id = psw.product_id
    `);

    res.json({
      products: rows.map(r => ({
        ...r,
        weight_grams: r.weight_grams !== null ? r.weight_grams : 500
      })),
      summary: counts[0]
    });
  } catch (error) {
    console.error("Fetch weights error:", error);
    res.status(500).json({ error: "Failed to fetch product weights" });
  }
});

adminShippingRatesRouter.get("/weights/:product_id", verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM product_shipping_weight WHERE product_id = ?",
      [req.params.product_id]
    );
    if (rows.length) {
      res.json(rows[0]);
    } else {
      res.json({ product_id: parseInt(req.params.product_id, 10), weight_grams: 500, length_cm: null, width_cm: null, height_cm: null });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch weight" });
  }
});

adminShippingRatesRouter.post("/weights", verifyAdmin, async (req, res) => {
  try {
    const { product_id, weight_grams, length_cm, width_cm, height_cm } = req.body;
    if (!product_id) return res.status(400).json({ error: "product_id is required" });

    await db.query(
      `INSERT INTO product_shipping_weight (product_id, weight_grams, length_cm, width_cm, height_cm)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        weight_grams = VALUES(weight_grams),
        length_cm = VALUES(length_cm),
        width_cm = VALUES(width_cm),
        height_cm = VALUES(height_cm)`,
      [
        product_id,
        parseInt(weight_grams, 10) || 500,
        length_cm !== null && length_cm !== "" ? parseFloat(length_cm) : null,
        width_cm !== null && width_cm !== "" ? parseFloat(width_cm) : null,
        height_cm !== null && height_cm !== "" ? parseFloat(height_cm) : null
      ]
    );

    res.json({ success: true, message: "Product weight saved" });
  } catch (error) {
    console.error("Save product weight error:", error);
    res.status(500).json({ error: "Failed to save product weight" });
  }
});

adminShippingRatesRouter.put("/weights/:product_id", verifyAdmin, async (req, res) => {
  try {
    const productId = req.params.product_id;
    const { weight_grams, length_cm, width_cm, height_cm } = req.body;

    await db.query(
      `INSERT INTO product_shipping_weight (product_id, weight_grams, length_cm, width_cm, height_cm)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        weight_grams = VALUES(weight_grams),
        length_cm = VALUES(length_cm),
        width_cm = VALUES(width_cm),
        height_cm = VALUES(height_cm)`,
      [
        productId,
        parseInt(weight_grams, 10) || 500,
        length_cm !== null && length_cm !== "" ? parseFloat(length_cm) : null,
        width_cm !== null && width_cm !== "" ? parseFloat(width_cm) : null,
        height_cm !== null && height_cm !== "" ? parseFloat(height_cm) : null
      ]
    );

    res.json({ success: true, message: "Product weight updated" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update product weight" });
  }
});

// Set default 500g for all products missing weight
adminShippingRatesRouter.post("/weights/set-default", verifyAdmin, async (req, res) => {
  try {
    await db.query(`
      INSERT INTO product_shipping_weight (product_id, weight_grams)
      SELECT p.id, 500
      FROM products p
      LEFT JOIN product_shipping_weight psw ON p.id = psw.product_id
      WHERE psw.id IS NULL
    `);
    res.json({ success: true, message: "Default weight (500g) applied to all products without weight." });
  } catch (error) {
    res.status(500).json({ error: "Failed to set default weights" });
  }
});

// Export Product Weights as CSV
adminShippingRatesRouter.get("/weights/export-csv", verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.id as product_id, p.name as product_name,
             COALESCE(psw.weight_grams, 500) as weight_grams,
             psw.length_cm, psw.width_cm, psw.height_cm
      FROM products p
      LEFT JOIN product_shipping_weight psw ON p.id = psw.product_id
      ORDER BY p.id ASC
    `);

    let csv = "product_id,product_name,weight_grams,length_cm,width_cm,height_cm\n";
    for (const r of rows) {
      const escapedName = `"${(r.product_name || "").replace(/"/g, '""')}"`;
      csv += `${r.product_id},${escapedName},${r.weight_grams},${r.length_cm || ""},${r.width_cm || ""},${r.height_cm || ""}\n`;
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="product_weights.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: "Failed to export weights CSV" });
  }
});

// Bulk Import Product Weights CSV
adminShippingRatesRouter.post("/weights/import-csv", verifyAdmin, async (req, res) => {
  try {
    const { items } = req.body; // Expecting array of { product_id, weight_grams, length_cm, width_cm, height_cm }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Invalid or empty CSV items array" });
    }

    let updatedCount = 0;
    for (const item of items) {
      if (!item.product_id) continue;
      const weight = parseInt(item.weight_grams, 10) || 500;
      const len = item.length_cm ? parseFloat(item.length_cm) : null;
      const wid = item.width_cm ? parseFloat(item.width_cm) : null;
      const hgt = item.height_cm ? parseFloat(item.height_cm) : null;

      await db.query(
        `INSERT INTO product_shipping_weight (product_id, weight_grams, length_cm, width_cm, height_cm)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
          weight_grams = VALUES(weight_grams),
          length_cm = VALUES(length_cm),
          width_cm = VALUES(width_cm),
          height_cm = VALUES(height_cm)`,
        [item.product_id, weight, len, wid, hgt]
      );
      updatedCount++;
    }

    res.json({ success: true, message: `Successfully imported weights for ${updatedCount} products.` });
  } catch (error) {
    console.error("CSV import error:", error);
    res.status(500).json({ error: "Failed to import product weights" });
  }
});

// ── 7. RATE PREVIEW & CALCULATOR ──
adminShippingRatesRouter.post("/preview", verifyAdmin, async (req, res) => {
  try {
    const { country_code, total_weight_grams, order_value, currency_code } = req.body;
    const upperCode = (country_code || "IN").trim().toUpperCase();
    const weight = Math.max(1, parseInt(total_weight_grams, 10) || 500);
    const orderVal = parseFloat(order_value) || 0;
    const targetCurrency = (currency_code || "INR").toUpperCase();
    const exchangeMultiplier = await getCurrencyMultiplier(targetCurrency);

    // Fetch country name
    let countryName = upperCode;
    const [cRows] = await db.query("SELECT country_name FROM shipping_countries WHERE country_code = ?", [upperCode]);
    if (cRows.length) countryName = cRows[0].country_name;

    // Check override first
    const [overrides] = await db.query(
      `SELECT sco.*, sm.method_name, sm.method_code, sm.estimated_days_min, sm.estimated_days_max
       FROM shipping_country_overrides sco
       JOIN shipping_methods sm ON sco.method_id = sm.id
       WHERE sco.country_code = ? AND sco.is_active = TRUE AND sm.is_active = TRUE`,
      [upperCode]
    );

    let methodsOutput = [];
    let matchedSource = "zone";
    let matchedZoneName = "Rest of World";
    let zoneId = null;

    if (overrides.length > 0) {
      matchedSource = "override";
      matchedZoneName = `Custom Country Override (${countryName})`;
      for (const ov of overrides) {
        const calc = computeShippingCost({
          baseRate: ov.base_rate,
          firstWeightGrams: ov.first_weight_grams,
          firstWeightRate: ov.first_weight_rate,
          additionalWeightGrams: ov.additional_weight_grams,
          additionalWeightRate: ov.additional_weight_rate,
          freeShippingAbove: ov.free_shipping_above,
          totalWeightGrams: weight,
          orderValue: orderVal
        });

        const costInr = calc.shippingCost;
        const convertedCost = Math.round((costInr * exchangeMultiplier) * 100) / 100;

        methodsOutput.push({
          method_id: ov.method_id,
          method_name: ov.method_name,
          method_code: ov.method_code,
          estimated_days: `${ov.estimated_days_min}-${ov.estimated_days_max} days`,
          shipping_cost: convertedCost,
          shipping_cost_inr: costInr,
          is_free: calc.isFree,
          free_shipping_above: ov.free_shipping_above,
          breakdown: calc.breakdown
        });
      }
    } else {
      const [zRows] = await db.query(
        `SELECT sz.id, sz.zone_name
         FROM shipping_zone_countries szc
         JOIN shipping_zones sz ON szc.zone_id = sz.id
         WHERE szc.country_code = ? AND sz.is_active = TRUE
         LIMIT 1`,
        [upperCode]
      );

      if (zRows.length > 0) {
        zoneId = zRows[0].id;
        matchedZoneName = zRows[0].zone_name;
      } else {
        const [rowZone] = await db.query("SELECT id, zone_name FROM shipping_zones WHERE zone_name LIKE '%Rest of World%' LIMIT 1");
        if (rowZone.length) {
          zoneId = rowZone[0].id;
          matchedZoneName = rowZone[0].zone_name;
        }
      }

      if (zoneId) {
        const [rates] = await db.query(
          `SELECT sr.*, sm.method_name, sm.method_code, sm.estimated_days_min, sm.estimated_days_max
           FROM shipping_rates sr
           JOIN shipping_methods sm ON sr.method_id = sm.id
           WHERE sr.zone_id = ? AND sr.is_active = TRUE AND sm.is_active = TRUE`,
          [zoneId]
        );

        for (const r of rates) {
          const calc = computeShippingCost({
            baseRate: r.base_rate,
            firstWeightGrams: r.first_weight_grams,
            firstWeightRate: r.first_weight_rate,
            additionalWeightGrams: r.additional_weight_grams,
            additionalWeightRate: r.additional_weight_rate,
            freeShippingAbove: r.free_shipping_above,
            totalWeightGrams: weight,
            orderValue: orderVal
          });

          const costInr = calc.shippingCost;
          const convertedCost = Math.round((costInr * exchangeMultiplier) * 100) / 100;

          methodsOutput.push({
            method_id: r.method_id,
            method_name: r.method_name,
            method_code: r.method_code,
            estimated_days: `${r.estimated_days_min}-${r.estimated_days_max} days`,
            shipping_cost: convertedCost,
            shipping_cost_inr: costInr,
            is_free: calc.isFree,
            free_shipping_above: r.free_shipping_above,
            breakdown: calc.breakdown
          });
        }
      }
    }

    res.json({
      country_code: upperCode,
      country_name: countryName,
      zone: matchedZoneName,
      source: matchedSource,
      currency: targetCurrency,
      exchange_rate: exchangeMultiplier,
      order_value: orderVal,
      total_weight_grams: weight,
      methods: methodsOutput
    });
  } catch (error) {
    console.error("Admin preview error:", error);
    res.status(500).json({ error: "Failed to preview shipping rates" });
  }
});

// ── 8. RATE CHANGE HISTORY (Step 7) ──
adminShippingRatesRouter.get("/history", verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT srh.*, sz.zone_name, sm.method_name
      FROM shipping_rate_history srh
      LEFT JOIN shipping_zones sz ON srh.zone_id = sz.id
      LEFT JOIN shipping_methods sm ON srh.method_id = sm.id
      ORDER BY srh.changed_at DESC
      LIMIT 10
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch rate history" });
  }
});

// ── 9. BULK RATE UPDATE BY PERCENTAGE (Step 7) ──
adminShippingRatesRouter.post("/bulk-update-percent", verifyAdmin, async (req, res) => {
  try {
    const { percentage, zone_id, preview_only } = req.body;
    const pct = parseFloat(percentage);
    if (isNaN(pct)) return res.status(400).json({ error: "Valid percentage is required" });

    let query = `
      SELECT sr.*, sz.zone_name, sm.method_name
      FROM shipping_rates sr
      JOIN shipping_zones sz ON sr.zone_id = sz.id
      JOIN shipping_methods sm ON sr.method_id = sm.id
    `;
    const params = [];
    if (zone_id && zone_id !== "all") {
      query += " WHERE sr.zone_id = ?";
      params.push(zone_id);
    }

    const [rates] = await db.query(query, params);

    const changes = rates.map(r => {
      const oldBase = parseFloat(r.base_rate);
      const newBase = Math.round((oldBase * (1 + pct / 100)) * 100) / 100;
      return {
        rate_id: r.id,
        zone_id: r.zone_id,
        zone_name: r.zone_name,
        method_name: r.method_name,
        old_base_rate: oldBase,
        new_base_rate: newBase
      };
    });

    if (preview_only) {
      return res.json({ preview: true, percentage: pct, changes });
    }

    // Apply changes
    for (const c of changes) {
      await db.query("UPDATE shipping_rates SET base_rate = ? WHERE id = ?", [c.new_base_rate, c.rate_id]);
      await db.query(
        "INSERT INTO shipping_rate_history (rate_id, zone_id, old_base_rate, new_base_rate, changed_by, change_note) VALUES (?, ?, ?, ?, ?, ?)",
        [c.rate_id, c.zone_id, c.old_base_rate, c.new_base_rate, req.admin?.email || "Admin", `Bulk ${pct}% update`]
      ).catch(() => {});
    }

    res.json({ success: true, message: `Updated ${changes.length} rates by ${pct}%.`, changes });
  } catch (error) {
    console.error("Bulk rate update error:", error);
    res.status(500).json({ error: "Failed to apply bulk rate update" });
  }
});

module.exports = { shippingRatesRouter, adminShippingRatesRouter };
