const router = require("express").Router();
const db = require("../db");
const { verifyAdmin } = require("../middleware/auth");

router.get("/", async (req, res) => {
  const [rows] = await db.query("SELECT site_name, site_email, phone, address, currency, shipping_fee, free_shipping_above, razorpay_key, razorpay_secret, paypal_client_id, shiprocket_email, shiprocket_password FROM settings WHERE id = 1");
  const settings = rows[0] || {};
  res.json({
    ...settings,
    paypal_client_id: settings.paypal_client_id || process.env.PAYPAL_CLIENT_ID || "sb"
  });
});

router.put("/", verifyAdmin, async (req, res) => {
  const { site_name, site_email, phone, address, currency, shipping_fee, free_shipping_above, razorpay_key, razorpay_secret, paypal_client_id, shiprocket_email, shiprocket_password, admin_password } = req.body;
  
  let query = "UPDATE settings SET site_name=?, site_email=?, phone=?, address=?, currency=?, shipping_fee=?, free_shipping_above=?, razorpay_key=?, razorpay_secret=?, paypal_client_id=?, shiprocket_email=?, shiprocket_password=?";
  const params = [site_name, site_email, phone, address, currency, shipping_fee, free_shipping_above, razorpay_key, razorpay_secret, paypal_client_id, shiprocket_email, shiprocket_password];

  if (admin_password) {
    const bcrypt = require("bcryptjs");
    const hash = await bcrypt.hash(admin_password, 12);
    query += ", admin_password=?";
    params.push(hash);
  }

  query += " WHERE id=1";

  await db.query(query, params);
  res.json({ message: "Settings saved" });
});

module.exports = router;