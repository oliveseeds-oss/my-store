const https = require("https");
const db = require("../db");

// Simple native https request promise wrapper
function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
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
  const password = settings.shiprocket_password;

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

  // Get new token
  console.log("Fetching new Shiprocket API token...");
  try {
    const res = await request(
      "https://apiv2.shiprocket.in/v2/console/api/login",
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
    length: 10,  // default parcel size cm
    breadth: 10,
    height: 10,
    weight: 0.5   // default parcel weight kg
  };

  console.log("Sending adhoc order to Shiprocket:", JSON.stringify(payload, null, 2));

  // 1. Create order
  const orderRes = await request(
    "https://apiv2.shiprocket.in/v2/console/api/orders/create/adhoc",
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
  console.log(`Created Shiprocket order successfully. Shipment ID: ${shipmentId}`);

  // 2. Assign AWB tracking number
  const awbRes = await request(
    "https://apiv2.shiprocket.in/v2/console/api/courier/assign/awb",
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
    awb_code: awbCode,
    courier_name: responseInfo.data?.courier_name || "Shiprocket Partner"
  };
}

module.exports = {
  getShiprocketToken,
  shipOrderWithShiprocket
};
