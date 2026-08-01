const router = require("express").Router();
const db = require("../db");
const { verifyAdmin } = require("../middleware/auth");

router.get("/", async (req, res) => {
  const [rows] = await db.query("SELECT site_name, site_email, phone, address, currency, shipping_fee, free_shipping_above, razorpay_key, razorpay_secret, paypal_client_id, shiprocket_email, shiprocket_password FROM settings WHERE id = 1");
  const settings = rows[0] || {};
  
  // Mask shiprocket password
  if (settings.shiprocket_password) {
    settings.shiprocket_password = "••••••••";
  }
  // Mask razorpay secret
  if (settings.razorpay_secret) {
    settings.razorpay_secret = "••••••••";
  }
  
  res.json({
    ...settings,
    paypal_client_id: settings.paypal_client_id || process.env.PAYPAL_CLIENT_ID || "sb",
    google_client_id: process.env.GOOGLE_CLIENT_ID || "874744414734-mockclientid.apps.googleusercontent.com"
  });
});

router.put("/", verifyAdmin, async (req, res) => {
  const { site_name, site_email, phone, address, currency, shipping_fee, free_shipping_above, razorpay_key, razorpay_secret, paypal_client_id, shiprocket_email, shiprocket_password, admin_password } = req.body;
  
  // Handle shiprocket credential decryption/encryption migration
  const [current] = await db.query("SELECT shiprocket_password, razorpay_secret FROM settings WHERE id = 1");
  
  let finalPassword = shiprocket_password;
  if (shiprocket_password === "••••••••") {
    finalPassword = current[0]?.shiprocket_password || null;
  } else if (shiprocket_password) {
    const { encrypt } = require("../utils/shiprocket");
    finalPassword = encrypt(shiprocket_password);
  }

  // Handle razorpay secret encryption/decryption migration
  let finalRazorpaySecret = razorpay_secret;
  if (razorpay_secret === "••••••••") {
    finalRazorpaySecret = current[0]?.razorpay_secret || null;
  } else if (razorpay_secret) {
    const { encrypt } = require("../utils/shiprocket");
    finalRazorpaySecret = encrypt(razorpay_secret);
  }

  let query = "UPDATE settings SET site_name=?, site_email=?, phone=?, address=?, currency=?, shipping_fee=?, free_shipping_above=?, razorpay_key=?, razorpay_secret=?, paypal_client_id=?, shiprocket_email=?, shiprocket_password=?";
  const params = [site_name, site_email, phone, address, currency, shipping_fee, free_shipping_above, razorpay_key, finalRazorpaySecret, paypal_client_id, shiprocket_email, finalPassword];

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

router.post("/test-shiprocket", verifyAdmin, async (req, res) => {
  const { shiprocket_email, shiprocket_password } = req.body;
  try {
    let email = shiprocket_email;
    let password = shiprocket_password;

    if (password === "••••••••") {
      const [rows] = await db.query("SELECT shiprocket_email, shiprocket_password FROM settings WHERE id = 1");
      if (rows.length) {
        email = shiprocket_email || rows[0].shiprocket_email;
        const { decrypt } = require("../utils/shiprocket");
        password = decrypt(rows[0].shiprocket_password);
      }
    }

    if (!email || !password) {
      return res.json({ success: false, message: "Credentials not configured." });
    }

    const { request } = require("../utils/shiprocket");
    const loginRes = await request(
      "https://apiv2.shiprocket.in/v1/external/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
      { email, password }
    );

    if (loginRes.token) {
      const expiresAt = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000);
      await db.query(
        "UPDATE settings SET shiprocket_token = ?, shiprocket_token_expires = ? WHERE id = 1",
        [loginRes.token, expiresAt]
      );
      return res.json({ success: true, message: "Shiprocket connection successful." });
    } else {
      return res.json({ success: false, message: "Shiprocket connection failed: Invalid response." });
    }
  } catch (error) {
    console.error("Test connection failed:", error.message);
    return res.json({ success: false, message: `Shiprocket connection failed: ${error.message}` });
  }
});

router.post("/test-razorpay", verifyAdmin, async (req, res) => {
  const { razorpay_key, razorpay_secret } = req.body;
  try {
    let keyId = razorpay_key;
    let keySecret = razorpay_secret;

    if (keySecret === "••••••••") {
      const [rows] = await db.query("SELECT razorpay_key, razorpay_secret FROM settings WHERE id = 1");
      if (rows.length) {
        keyId = razorpay_key || rows[0].razorpay_key;
        const { decrypt } = require("../utils/shiprocket");
        keySecret = decrypt(rows[0].razorpay_secret);
      }
    }

    if (!keyId || !keySecret) {
      return res.json({ success: false, message: "Credentials not configured." });
    }

    const { request } = require("../utils/shiprocket");
    const authHeader = "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    
    const rzpRes = await request(
      "https://api.razorpay.com/v1/orders?count=1",
      {
        method: "GET",
        headers: {
          Authorization: authHeader
        }
      }
    );

    if (rzpRes && rzpRes.items) {
      return res.json({ success: true, message: "Razorpay connection successful." });
    } else {
      return res.json({ success: false, message: "Razorpay connection failed: Invalid response." });
    }
  } catch (error) {
    console.error("Razorpay test connection failed:", error.message);
    return res.json({ success: false, message: `Razorpay connection failed: ${error.message}` });
  }
});

module.exports = router;