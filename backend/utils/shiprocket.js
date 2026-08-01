const https = require("https");
const crypto = require("crypto");
const db = require("../db");

const ENCRYPTION_KEY = process.env.SHIPROCKET_ENCRYPTION_KEY || process.env.JWT_SECRET || "OliveSeeds_2026_SuperSecret_ChangeOSS";

// AES-256-GCM Encryption Helpers
function encrypt(text) {
  if (!text) return "";
  const key = crypto.createHash("sha256").update(String(ENCRYPTION_KEY)).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

function decrypt(encryptedText) {
  if (!encryptedText) return "";
  const parts = encryptedText.split(":");
  if (parts.length !== 3) {
    // Return plaintext if it's legacy/unencrypted
    return encryptedText;
  }
  const [ivHex, authTagHex, encryptedHex] = parts;
  try {
    const key = crypto.createHash("sha256").update(String(ENCRYPTION_KEY)).digest();
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    console.error("Decryption failed, returning original value:", err.message);
    return encryptedText;
  }
}

// Simple native https request promise wrapper with timeout handling
function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const timeoutMs = options.timeout || 10000; // 10s default timeout
    
    // Ensure timeout parameter isn't passed down as options directly to https.request
    const reqOptions = { ...options };
    delete reqOptions.timeout;

    const req = https.request(url, reqOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(parsed.message || `Request failed with status ${res.statusCode}: ${data}`));
          }
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            reject(new Error(`Request failed with status ${res.statusCode}: ${data}`));
          }
        }
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error(`Connection timed out after ${timeoutMs}ms`));
    });

    if (body) {
      req.write(typeof body === "string" ? body : JSON.stringify(body));
    }
    req.end();
  });
}

// Authenticate and retrieve Shiprocket token (cached or fresh)
async function getShiprocketToken() {
  const [rows] = await db.query(
    "SELECT shiprocket_email, shiprocket_password, shiprocket_token, shiprocket_token_expires FROM settings WHERE id = 1"
  );
  if (!rows.length) {
    throw new Error("Store settings record not found.");
  }
  const settings = rows[0];

  const email = settings.shiprocket_email;
  // Decrypt password securely
  const password = decrypt(settings.shiprocket_password);

  if (!email || !password) {
    throw new Error("Shiprocket email or password not configured in store settings.");
  }

  // If token exists and has not expired (leave 5 min buffer)
  if (
    settings.shiprocket_token &&
    settings.shiprocket_token_expires &&
    new Date(settings.shiprocket_token_expires).getTime() > Date.now() + 5 * 60 * 1000
  ) {
    return settings.shiprocket_token;
  }

  console.log("Fetching new Shiprocket API token...");
  try {
    const res = await request(
      "https://apiv2.shiprocket.in/v1/external/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
      { email, password }
    );

    if (!res.token) {
      throw new Error("Authentication failed: No token returned from Shiprocket.");
    }

    // Set expiry to 9 days from now (Shiprocket tokens usually last 10 days)
    const expiresAt = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000);
    
    await db.query(
      "UPDATE settings SET shiprocket_token = ?, shiprocket_token_expires = ? WHERE id = 1",
      [res.token, expiresAt]
    );

    return res.token;
  } catch (error) {
    console.error("Shiprocket Login Error:", error.message);
    throw new Error(`Shiprocket login failed: ${error.message}`);
  }
}

// Create Shiprocket order and assign AWB tracking code
async function shipOrderWithShiprocket(order, items) {
  const token = await getShiprocketToken();

  // Format order items for Shiprocket
  const shiprocketItems = items.map((item) => ({
    name: item.product_name || "Custom Engraved Item",
    sku: item.product_uid || `SKU-${item.id}`,
    units: parseInt(item.qty) || 1,
    selling_price: parseFloat(item.price) || 0,
    discount: 0,
    tax: 0,
    hsn: ""
  }));

  // Map payment method
  const isCOD = order.payment_mode === "COD";
  const paymentMethod = isCOD ? "COD" : "Prepaid";

  const orderDate = new Date(order.invoice_date || order.created_at || Date.now())
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  const payload = {
    order_id: order.order_uid,
    order_date: orderDate,
    pickup_location: "Primary",
    billing_customer_name: order.delivery_name || order.guest_name || "Guest Customer",
    billing_last_name: "",
    billing_address: order.delivery_street || "Street Address",
    billing_address_2: order.delivery_apt || "",
    billing_city: order.delivery_city || "City",
    billing_pincode: order.delivery_pincode || "110001",
    billing_state: order.delivery_state || "State",
    billing_country: order.delivery_country || "India",
    billing_email: order.guest_email || "customer@example.com",
    billing_phone: order.guest_phone || order.phone || "9999999999",
    shipping_is_billing: true,
    order_items: shiprocketItems,
    payment_method: paymentMethod,
    sub_total: parseFloat(order.subtotal) || 0,
    length: 10,  // default parcel size cm (Missing from DB products schema)
    breadth: 10,
    height: 10,
    weight: 0.5   // default parcel weight kg (Missing from DB products schema)
  };

  console.log("Sending adhoc order to Shiprocket:", JSON.stringify(payload, null, 2));

  // 1. Create order
  const orderRes = await request(
    "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
    payload
  );

  if (!orderRes.shipment_id) {
    throw new Error(`Failed to create order in Shiprocket: ${JSON.stringify(orderRes)}`);
  }

  const shipmentId = orderRes.shipment_id;
  const shiprocketOrderId = orderRes.order_id;
  console.log(`Created Shiprocket order successfully. Shipment ID: ${shipmentId}, Order ID: ${shiprocketOrderId}`);

  // 2. Assign AWB tracking number
  const awbRes = await request(
    "https://apiv2.shiprocket.in/v1/external/courier/assign/awb",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
    { shipment_id: shipmentId }
  );

  const responseInfo = awbRes.response || {};
  const awbCode = responseInfo.data?.awb_code;

  if (!awbCode) {
    throw new Error(`Failed to assign AWB in Shiprocket: ${JSON.stringify(awbRes)}`);
  }

  console.log(`Assigned Shiprocket AWB: ${awbCode}`);
  return {
    shipment_id: shipmentId,
    shiprocket_order_id: shiprocketOrderId,
    awb_code: awbCode,
    courier_name: responseInfo.data?.courier_name || "Shiprocket Partner"
  };
}

module.exports = {
  encrypt,
  decrypt,
  request,
  getShiprocketToken,
  shipOrderWithShiprocket
};
