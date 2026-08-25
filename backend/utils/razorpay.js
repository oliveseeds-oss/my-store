const db = require("../db");
const crypto = require("crypto");
const { decrypt, request } = require("./shiprocket");

// Retrieve decrypted Razorpay credentials (with fallback to env vars)
async function getRazorpayCredentials() {
  const [rows] = await db.query("SELECT razorpay_key, razorpay_secret FROM settings WHERE id = 1");
  const settings = rows[0] || {};
  
  let keyId = settings.razorpay_key || process.env.RAZORPAY_KEY_ID;
  let keySecret = null;
  
  if (settings.razorpay_secret) {
    try {
      keySecret = decrypt(settings.razorpay_secret);
    } catch (e) {
      keySecret = settings.razorpay_secret;
    }
  }
  
  if (!keySecret || keySecret.includes("your_razorpay") || keySecret === "••••••••") {
    keySecret = process.env.RAZORPAY_KEY_SECRET;
  }
  
  if (!keyId || keyId.includes("your_razorpay")) {
    keyId = process.env.RAZORPAY_KEY_ID;
  }

  if (!keyId || !keySecret) {
    throw new Error("Razorpay Key ID or Key Secret is not configured in settings or environment.");
  }
  return { keyId, keySecret };
}

// 1. Create Razorpay Order server-side (POST /v1/orders)
async function createRazorpayOrder(amount, currency, receipt) {
  const { keyId, keySecret } = await getRazorpayCredentials();
  const authHeader = "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const payload = {
    amount, // In minor units (cents, paise, etc.)
    currency,
    receipt,
    payment_capture: 1 // Auto-capture payments
  };

  try {
    const res = await request(
      "https://api.razorpay.com/v1/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader
        }
      },
      payload
    );
    return res;
  } catch (error) {
    console.error("Razorpay Order Creation Error:", error.message);
    throw new Error(`Failed to create order on Razorpay: ${error.message}`);
  }
}

// 2. Cryptographically verify signature (HMAC SHA256)
async function verifyRazorpaySignature(orderId, paymentId, signature) {
  const { keySecret } = await getRazorpayCredentials();
  
  const text = orderId + "|" + paymentId;
  const generatedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(text)
    .digest("hex");

  return generatedSignature === signature;
}

// 3. Capture/Verify Payment Status from API
async function verifyPaymentOnRazorpay(paymentId, expectedAmount, expectedCurrency) {
  const { keyId, keySecret } = await getRazorpayCredentials();
  const authHeader = "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  try {
    const payment = await request(
      `https://api.razorpay.com/v1/payments/${paymentId}`,
      {
        method: "GET",
        headers: {
          Authorization: authHeader
        }
      }
    );

    if (!payment || payment.status !== "captured") {
      throw new Error(`Payment is not in captured status. Current status: ${payment ? payment.status : "unknown"}`);
    }

    // Razorpay amount is returned in minor units
    if (parseInt(payment.amount) !== parseInt(expectedAmount)) {
      throw new Error(`Payment amount mismatch. Expected: ${expectedAmount}, Actual: ${payment.amount}`);
    }

    if (payment.currency !== expectedCurrency) {
      throw new Error(`Payment currency mismatch. Expected: ${expectedCurrency}, Actual: ${payment.currency}`);
    }

    return true;
  } catch (error) {
    console.error("Razorpay Payment API Verification Failed:", error.message);
    throw error;
  }
}

// 4. Create Refund server-side (POST /v1/payments/:id/refund)
async function refundRazorpayPayment(paymentId, amount = null) {
  const { keyId, keySecret } = await getRazorpayCredentials();
  const authHeader = "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const payload = {};
  if (amount !== null) {
    payload.amount = amount; // Minor units
  }

  try {
    const res = await request(
      `https://api.razorpay.com/v1/payments/${paymentId}/refund`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader
        }
      },
      payload
    );
    return res;
  } catch (error) {
    console.error("Razorpay Refund Request Error:", error.message);
    throw new Error(`Razorpay Refund failed: ${error.message}`);
  }
}

module.exports = {
  getRazorpayCredentials,
  createRazorpayOrder,
  verifyRazorpaySignature,
  verifyPaymentOnRazorpay,
  refundRazorpayPayment
};
