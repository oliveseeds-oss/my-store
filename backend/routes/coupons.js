const router = require("express").Router();
const db = require("../db");
const { verifyAdmin } = require("../middleware/auth");

// POST /api/coupons/validate — check if coupon code is valid
router.post("/validate", async (req, res) => {
  const { code, cart_total, user_id } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Coupon code is required" });
  }

  try {
    const [rows] = await db.query(
      "SELECT * FROM coupons WHERE code = ? AND is_active = true",
      [code.trim().toUpperCase()]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Invalid coupon code" });
    }

    const coupon = rows[0];

    // Expiry check
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return res.status(400).json({ error: "This coupon code has expired" });
    }

    // Usage limit check
    if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
      return res.status(400).json({ error: "Coupon usage limit reached" });
    }

    // Minimum order value check
    const orderVal = parseFloat(cart_total || 0);
    const minVal = parseFloat(coupon.minimum_order_value || 0);

    if (orderVal < minVal) {
      return res.status(400).json({ error: `Minimum order of ₹${minVal} required for this coupon` });
    }

    // Calculate discount amount
    let discountAmount = 0;
    const couponVal = parseFloat(coupon.value);

    if (coupon.type === "percentage") {
      discountAmount = (orderVal * couponVal) / 100;
    } else {
      discountAmount = couponVal;
    }

    if (discountAmount > orderVal) {
      discountAmount = orderVal;
    }

    res.json({
      valid: true,
      coupon_id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount_amount: parseFloat(discountAmount.toFixed(2)),
      message: `Coupon applied! You save ₹${discountAmount.toFixed(2)}`
    });
  } catch (err) {
    console.error("Failed to validate coupon:", err);
    res.status(500).json({ error: "Failed to validate coupon" });
  }
});

// Admin: GET /api/admin/coupons — list all coupons
router.get("/admin/all", verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM coupons ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error("Failed to fetch coupons:", err);
    res.status(500).json({ error: "Failed to fetch coupons" });
  }
});

// Admin: POST /api/admin/coupons — create coupon
router.post("/admin/create", verifyAdmin, async (req, res) => {
  const { code, type, value, minimum_order_value, usage_limit, expires_at } = req.body;

  if (!code || !type || !value) {
    return res.status(400).json({ error: "Code, Type, and Value are required" });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO coupons (code, type, value, minimum_order_value, usage_limit, expires_at, is_active)
       VALUES (?, ?, ?, ?, ?, ?, true)`,
      [
        code.trim().toUpperCase(),
        type,
        parseFloat(value),
        parseFloat(minimum_order_value || 0),
        usage_limit ? parseInt(usage_limit) : null,
        expires_at || null
      ]
    );
    res.json({ id: result.insertId, message: "Coupon created successfully" });
  } catch (err) {
    console.error("Failed to create coupon:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Coupon code already exists" });
    }
    res.status(500).json({ error: "Failed to create coupon" });
  }
});

// Admin: PUT /api/admin/coupons/:id — edit / toggle coupon
router.put("/admin/:id", verifyAdmin, async (req, res) => {
  const { code, type, value, minimum_order_value, usage_limit, is_active, expires_at } = req.body;
  try {
    await db.query(
      `UPDATE coupons SET
        code = COALESCE(?, code),
        type = COALESCE(?, type),
        value = COALESCE(?, value),
        minimum_order_value = COALESCE(?, minimum_order_value),
        usage_limit = ?,
        is_active = COALESCE(?, is_active),
        expires_at = ?
       WHERE id = ?`,
      [
        code ? code.trim().toUpperCase() : null,
        type || null,
        value ? parseFloat(value) : null,
        minimum_order_value !== undefined ? parseFloat(minimum_order_value) : null,
        usage_limit !== undefined && usage_limit !== null ? parseInt(usage_limit) : null,
        is_active !== undefined ? (is_active ? 1 : 0) : null,
        expires_at || null,
        req.params.id
      ]
    );
    res.json({ message: "Coupon updated successfully" });
  } catch (err) {
    console.error("Failed to update coupon:", err);
    res.status(500).json({ error: "Failed to update coupon" });
  }
});

// Admin: DELETE /api/admin/coupons/:id — deactivate coupon
router.delete("/admin/:id", verifyAdmin, async (req, res) => {
  try {
    await db.query("UPDATE coupons SET is_active = false WHERE id = ?", [req.params.id]);
    res.json({ message: "Coupon deactivated successfully" });
  } catch (err) {
    console.error("Failed to deactivate coupon:", err);
    res.status(500).json({ error: "Failed to deactivate coupon" });
  }
});

module.exports = router;
