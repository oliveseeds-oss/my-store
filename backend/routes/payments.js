const router = require("express").Router();
const db = require("../db");
const { verifyAdmin } = require("../middleware/auth");
const { generateOrderUid } = require("../utils/generateUid");
const {
  createRazorpayOrder,
  verifyRazorpaySignature,
  verifyPaymentOnRazorpay,
  refundRazorpayPayment
} = require("../utils/razorpay");
const { getSubunits, getAmountFromSubunits } = require("../utils/currency");

// 1. Create secure pending order & Razorpay order server-side
router.post("/orders/create", async (req, res) => {
  const {
    member_id, guest_name, guest_email, guest_phone,
    items, address_line, currency_code, shipping_fee,
    shipping_method_id, shipping_method_name, shipping_cost, shipping_zone, shipping_weight_grams,
    delivery_street, delivery_apt, delivery_city, delivery_state, delivery_country, delivery_pincode
  } = req.body;

  try {
    if (!items || !items.length) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Load store base settings
    const [settingsRows] = await db.query(
      "SELECT currency, shipping_fee, free_shipping_above, razorpay_key FROM settings WHERE id = 1"
    );
    const storeSettings = settingsRows[0] || {};
    const baseCurrency = storeSettings.currency || "INR";

    // Resolve currency rate
    let targetCurrency = currency_code || baseCurrency;
    let conversionRate = 1.0;
    if (targetCurrency !== baseCurrency) {
      const [rateRows] = await db.query(
        "SELECT rate_to_inr FROM currency_rates WHERE currency_code = ?",
        [targetCurrency]
      );
      if (rateRows.length) {
        conversionRate = parseFloat(rateRows[0].rate_to_inr) || 1.0;
      } else {
        targetCurrency = baseCurrency; // Fallback
      }
    }

    // Separate physical and digital items
    const physicalItems = [];
    const digitalItems = [];

    // Server-side authoritative validation and recalculation
    let subtotalInBase = 0;

    for (const item of items) {
      if (item.type === "digital" || (item.digital_product_id && !item.product_id)) {
        const [products] = await db.query(
          "SELECT id, product_uid, name, price, is_active FROM digital_products WHERE id = ? OR product_uid = ?",
          [item.digital_product_id || item.product_id, item.product_uid || null]
        );
        if (!products.length || !products[0].is_active) {
          return res.status(400).json({ error: `Digital asset ${item.product_name} is unavailable.` });
        }
        const product = products[0];
        const price = parseFloat(product.price);
        subtotalInBase += price * item.qty;
        digitalItems.push({
          ...item,
          product_uid: product.product_uid,
          price // Overwrite with server authoritative price
        });
      } else {
        const [products] = await db.query(
          "SELECT id, product_uid, name, price, stock, is_active FROM products WHERE id = ? OR product_uid = ?",
          [item.product_id, item.product_uid || null]
        );
        if (!products.length || !products[0].is_active) {
          return res.status(400).json({ error: `Product ${item.product_name} is no longer available.` });
        }
        const product = products[0];
        if (product.stock < item.qty) {
          return res.status(400).json({ error: `Insufficient stock for product: ${product.name}` });
        }
        
        const price = parseFloat(product.price);
        subtotalInBase += price * item.qty;
        physicalItems.push({
          ...item,
          product_uid: product.product_uid,
          price // Overwrite with server authoritative price
        });
      }
    }

    // Calculations in Base (INR)
    const taxInBase = Math.round(subtotalInBase * 0.18);
    const configuredShipping = parseFloat(storeSettings.shipping_fee) || 60;
    const freeShippingThreshold = parseFloat(storeSettings.free_shipping_above) || 999;
    const finalShippingInBase = subtotalInBase >= freeShippingThreshold ? 0 : configuredShipping;

    // Apply conversion to target currency
    const totalInBase = subtotalInBase + taxInBase + finalShippingInBase;
    const subtotalConverted = subtotalInBase * conversionRate;
    const taxConverted = taxInBase * conversionRate;
    const shippingConverted = finalShippingInBase * conversionRate;
    const finalTotalConverted = totalInBase * conversionRate;

    // Resolve member_uid
    let member_uid = null;
    if (member_id) {
      const [members] = await db.query("SELECT member_uid FROM members WHERE id = ? OR member_uid = ?", [member_id, member_id]);
      if (members.length) member_uid = members[0].member_uid;
    }

    // Process order generation
    let finalOrderUid = null;
    let finalInvoiceUid = null;

    if (physicalItems.length > 0) {
      const { order_uid, invoice_uid } = await generateOrderUid("physical");
      finalOrderUid = order_uid;
      finalInvoiceUid = invoice_uid;

      // Parse address line or use structured fields
      const address = address_line || "";
      const parts = address.split(",").map(p => p.trim());
      const streetVal = delivery_street || parts[0] || address || "Street Address";
      const aptVal = delivery_apt || parts[1] || "";
      const cityVal = delivery_city || parts[2] || "City";
      const stateVal = delivery_state || parts[3] || "State";
      const countryVal = delivery_country || parts[4] || "India";
      const pincodeVal = delivery_pincode || parts[5] || "000000";

      // Call Razorpay Order Creation server-side
      const amountInMinorUnits = getSubunits(finalTotalConverted, targetCurrency);
      const rzpOrder = await createRazorpayOrder(amountInMinorUnits, targetCurrency, order_uid);

      const insertPhysicalOrder = async (includeRazorpayCol = true) => {
        if (includeRazorpayCol) {
          return await db.query(
            `INSERT INTO physical_orders
             (order_uid, invoice_uid, member_uid, guest_name, guest_email, guest_phone,
              delivery_name, delivery_street, delivery_apt, delivery_city, delivery_state,
              delivery_country, delivery_pincode, subtotal, tax_amount, shipping_fee, total,
              currency_code, currency_rate, payment_mode, transaction_id, payment_status, status, razorpay_order_id)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              order_uid, invoice_uid, member_uid, guest_name || "Guest", guest_email || "", guest_phone || "",
              guest_name || "Guest", streetVal, aptVal, cityVal, stateVal,
              countryVal, pincodeVal, subtotalConverted, taxConverted, shippingConverted, finalTotalConverted,
              targetCurrency, conversionRate, "Razorpay", rzpOrder.id, "Pending", "Processing", rzpOrder.id
            ]
          );
        } else {
          return await db.query(
            `INSERT INTO physical_orders
             (order_uid, invoice_uid, member_uid, guest_name, guest_email, guest_phone,
              delivery_name, delivery_street, delivery_apt, delivery_city, delivery_state,
              delivery_country, delivery_pincode, subtotal, tax_amount, shipping_fee, total,
              currency_code, currency_rate, payment_mode, transaction_id, payment_status, status)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              order_uid, invoice_uid, member_uid, guest_name || "Guest", guest_email || "", guest_phone || "",
              guest_name || "Guest", streetVal, aptVal, cityVal, stateVal,
              countryVal, pincodeVal, subtotalConverted, taxConverted, shippingConverted, finalTotalConverted,
              targetCurrency, conversionRate, "Razorpay", rzpOrder.id, "Pending", "Processing"
            ]
          );
        }
      };

      try {
        await insertPhysicalOrder(true);
      } catch (insertErr) {
        if (insertErr.code === "ER_BAD_FIELD_ERROR" || insertErr.errno === 1054 || String(insertErr.message).includes("razorpay_order_id")) {
          console.warn("Attempting schema recovery for physical_orders missing column...");
          await db.query("ALTER TABLE physical_orders ADD COLUMN razorpay_order_id VARCHAR(255) DEFAULT NULL").catch(() => {});
          try {
            await insertPhysicalOrder(true);
          } catch (retryErr) {
            await insertPhysicalOrder(false);
          }
        } else {
          throw insertErr;
        }
      }

      // Save extended shipping charge fields if available (Step 9)
      if (shipping_method_id || shipping_method_name || shipping_zone) {
        await db.query(
          `UPDATE physical_orders SET
            shipping_method_id = COALESCE(?, shipping_method_id),
            shipping_method_name = COALESCE(?, shipping_method_name),
            shipping_cost = COALESCE(?, shipping_cost),
            shipping_cost_currency = COALESCE(?, shipping_cost_currency),
            shipping_weight_grams = COALESCE(?, shipping_weight_grams),
            shipping_zone = COALESCE(?, shipping_zone)
           WHERE order_uid = ?`,
          [
            shipping_method_id || null,
            shipping_method_name || null,
            shipping_cost !== undefined ? shipping_cost : shippingConverted,
            targetCurrency || "INR",
            shipping_weight_grams || null,
            shipping_zone || null,
            order_uid
          ]
        ).catch(() => {});
      }

      for (const item of physicalItems) {
        const [itemRes] = await db.query(
          `INSERT INTO physical_order_items (order_uid, product_uid, product_name, selected_size, price, qty, tax_rate)
           VALUES (?,?,?,?,?,?,?)`,
          [order_uid, item.product_uid, item.product_name, item.selected_size || null, item.price * conversionRate, item.qty, 18]
        );
        const order_item_id = itemRes.insertId;

        if (item.customizations && item.customizations.length) {
          for (const cust of item.customizations) {
            await db.query(
              `INSERT INTO order_item_customizations 
               (physical_order_item_id, template_id, template_name, field_key, field_label, field_value, field_type) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [order_item_id, cust.template_id || null, cust.template_name || 'Default', cust.field_key, cust.field_label, String(cust.field_value), cust.field_type]
            );
          }
        }

        // Reduce stock
        await db.query("UPDATE products SET stock = GREATEST(0, stock - ?) WHERE product_uid = ?", [item.qty, item.product_uid]);

        // Check if stock has dropped below 5
        try {
          const [stockCheck] = await db.query(
            "SELECT name, stock FROM products WHERE product_uid = ?",
            [item.product_uid]
          );
          if (stockCheck.length && stockCheck[0].stock < 5) {
            const currentStock = stockCheck[0].stock;
            const productName = stockCheck[0].name;
            const { sendMail } = require("../utils/mailer");
            sendMail({
              to: "oss.oliveseeds@gmail.com",
              subject: `⚠️ LOW STOCK WARNING: "${productName}"`,
              text: `Low stock alert: The stock level for "${productName}" (UID: ${item.product_uid}) has dropped to ${currentStock}. Please restock soon.`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f5c2c2; border-radius: 12px; background-color: #fff5f5; color: #9c0006;">
                  <h3 style="margin-top: 0; color: #9c0006;">⚠️ Low Stock Inventory Alert</h3>
                  <p>Hello Admin,</p>
                  <p>This is an automated warning that stock levels for a product have dropped below 5 units:</p>
                  <div style="background-color: #ffffff; border: 1px solid #f5c2c2; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <strong>Product Name:</strong> ${productName}<br/>
                    <strong>Product UID:</strong> ${item.product_uid}<br/>
                    <strong>Remaining Stock:</strong> <span style="font-size: 16px; font-weight: bold; color: #d90429;">${currentStock} units</span>
                  </div>
                  <p style="font-size: 12px; color: #5c6266;">Please login to your admin dashboard to adjust inventory levels.</p>
                </div>
              `
            }).catch(err => console.error("Failed to send low stock alert:", err.message));
          }
        } catch (stockErr) {
          console.error("Failed to query stock for low stock warning:", stockErr.message);
        }
      }

      return res.json({
        success: true,
        order_id: finalOrderUid,
        razorpay_order_id: rzpOrder.id,
        amount: amountInMinorUnits,
        currency: targetCurrency,
        key_id: storeSettings.razorpay_key
      });
    }

    if (digitalItems.length > 0) {
      const { order_uid, invoice_uid } = await generateOrderUid("digital");
      finalOrderUid = order_uid;
      finalInvoiceUid = invoice_uid;

      // Call Razorpay Order Creation server-side
      const amountInMinorUnits = getSubunits(finalTotalConverted, targetCurrency);
      const rzpOrder = await createRazorpayOrder(amountInMinorUnits, targetCurrency, order_uid);

      const insertDigitalOrder = async (includeRazorpayCol = true) => {
        if (includeRazorpayCol) {
          return await db.query(
            `INSERT INTO digital_orders
             (order_uid, invoice_uid, member_uid, guest_name, guest_email,
              subtotal, tax_amount, total, currency_code, currency_rate,
              payment_mode, transaction_id, payment_status, status, razorpay_order_id)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              order_uid, invoice_uid, member_uid, guest_name || "Guest", guest_email || "",
              subtotalConverted, taxConverted, finalTotalConverted, targetCurrency, conversionRate,
              "Razorpay", rzpOrder.id, "Pending", "Completed", rzpOrder.id
            ]
          );
        } else {
          return await db.query(
            `INSERT INTO digital_orders
             (order_uid, invoice_uid, member_uid, guest_name, guest_email,
              subtotal, tax_amount, total, currency_code, currency_rate,
              payment_mode, transaction_id, payment_status, status)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              order_uid, invoice_uid, member_uid, guest_name || "Guest", guest_email || "",
              subtotalConverted, taxConverted, finalTotalConverted, targetCurrency, conversionRate,
              "Razorpay", rzpOrder.id, "Pending", "Completed"
            ]
          );
        }
      };

      try {
        await insertDigitalOrder(true);
      } catch (insertErr) {
        if (insertErr.code === "ER_BAD_FIELD_ERROR" || insertErr.errno === 1054 || String(insertErr.message).includes("razorpay_order_id")) {
          console.warn("Attempting schema recovery for digital_orders missing column...");
          await db.query("ALTER TABLE digital_orders ADD COLUMN razorpay_order_id VARCHAR(255) DEFAULT NULL").catch(() => {});
          try {
            await insertDigitalOrder(true);
          } catch (retryErr) {
            await insertDigitalOrder(false);
          }
        } else {
          throw insertErr;
        }
      }

      for (const item of digitalItems) {
        await db.query(
          `INSERT INTO digital_order_items (order_uid, product_uid, product_name, price, qty, tax_rate)
           VALUES (?,?,?,?,?,?)`,
          [order_uid, item.product_uid, item.product_name, item.price * conversionRate, item.qty, 18]
        );
      }

      return res.json({
        success: true,
        order_id: finalOrderUid,
        razorpay_order_id: rzpOrder.id,
        amount: amountInMinorUnits,
        currency: targetCurrency,
        key_id: storeSettings.razorpay_key
      });
    }

    return res.status(400).json({ error: "Invalid order parameters." });
  } catch (error) {
    console.error("Server-side Order creation failed:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 2. Cryptographic Payment Verification Route (HMAC & API checking)
router.post("/verify", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: "Missing verification parameters." });
  }

  try {
    // 1. HMAC Signature validation (Priority 10)
    const validSig = await verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!validSig) {
      return res.status(400).json({ error: "Payment verification failed: Invalid cryptographic signature." });
    }

    // 2. Find matching order record (idempotency check)
    let orderTable = "physical_orders";
    let orders = [];
    try {
      [orders] = await db.query(
        "SELECT * FROM physical_orders WHERE razorpay_order_id = ? OR transaction_id = ?",
        [razorpay_order_id, razorpay_order_id]
      );
    } catch {
      [orders] = await db.query(
        "SELECT * FROM physical_orders WHERE transaction_id = ?",
        [razorpay_order_id]
      );
    }
    
    if (!orders.length) {
      orderTable = "digital_orders";
      try {
        [orders] = await db.query(
          "SELECT * FROM digital_orders WHERE razorpay_order_id = ? OR transaction_id = ?",
          [razorpay_order_id, razorpay_order_id]
        );
      } catch {
        [orders] = await db.query(
          "SELECT * FROM digital_orders WHERE transaction_id = ?",
          [razorpay_order_id]
        );
      }
    }

    if (!orders.length) {
      return res.status(404).json({ error: "Associated order not found." });
    }

    const order = orders[0];

    // If order is already paid, return early (idempotency)
    if (order.payment_status === "Paid") {
      return res.json({ success: true, message: "Payment already verified.", order_id: order.order_uid });
    }

    // 3. Double-check with Razorpay API (Priority 11)
    const expectedAmountMinor = getSubunits(order.total, order.currency_code);
    await verifyPaymentOnRazorpay(razorpay_payment_id, expectedAmountMinor, order.currency_code);

    // 4. Update Database
    try {
      await db.query(
        `UPDATE ${orderTable} SET payment_status = 'Paid', transaction_id = ?, razorpay_payment_id = ?, razorpay_signature = ?, payment_verified_at = NOW() WHERE id = ?`,
        [razorpay_payment_id, razorpay_payment_id, razorpay_signature, order.id]
      );
    } catch (updateErr) {
      await db.query(
        `UPDATE ${orderTable} SET payment_status = 'Paid', transaction_id = ? WHERE id = ?`,
        [razorpay_payment_id, order.id]
      );
    }

    // Sync to legacy shipments table if physical order (prepaid ready)
    if (orderTable === "physical_orders") {
      const [existingShipment] = await db.query("SELECT id FROM shipments WHERE order_id = ?", [order.id]);
      if (!existingShipment.length) {
        await db.query(
          "INSERT INTO shipments (order_id, partner, tracking_number, status, created_at, updated_at) VALUES (?, 'shiprocket', '', 'Picked Up', NOW(), NOW())"
        , [order.id]);
      }
    }

    // Send notifications
    await db.query(
      "INSERT INTO notifications (type, title, message, link) VALUES ('payment', 'Payment Verified', ?, '/orders')",
      [`Payment of ${order.currency_code} ${order.total} verified successfully for Order #${order.order_uid}`]
    ).catch(() => {
      return db.query(
        "INSERT INTO notifications (type, title, message) VALUES ('payment', 'Payment Verified', ?)",
        [`Payment of ${order.currency_code} ${order.total} verified successfully for Order #${order.order_uid}`]
      ).catch(() => {});
    });

    // Trigger email confirmation & invoice dispatch (background)
    const { sendOrderConfirmation } = require("../utils/orderNotification");
    sendOrderConfirmation(order.order_uid).catch(err => console.error("Failed to send order confirmation email:", err));

    return res.json({ success: true, message: "Payment verified successfully.", order_id: order.order_uid });
  } catch (error) {
    console.error("Verification endpoint failure:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 3. Admin Refund Action Endpoint (Priority 22)
router.post("/refund", verifyAdmin, async (req, res) => {
  const { order_uid, amount } = req.body;

  if (!order_uid) {
    return res.status(400).json({ error: "Order UID required." });
  }

  try {
    let orderTable = "physical_orders";
    let [orders] = await db.query("SELECT * FROM physical_orders WHERE order_uid = ?", [order_uid]);
    if (!orders.length) {
      orderTable = "digital_orders";
      [orders] = await db.query("SELECT * FROM digital_orders WHERE order_uid = ?", [order_uid]);
    }

    if (!orders.length) {
      return res.status(404).json({ error: "Order not found." });
    }

    const order = orders[0];

    if (order.payment_status !== "Paid" || !order.razorpay_payment_id) {
      return res.status(400).json({ error: "Only fully Paid transactions can be refunded." });
    }

    const refundAmountInSubunits = amount ? getSubunits(amount, order.currency_code) : getSubunits(order.total, order.currency_code);
    
    // Call Razorpay Refund API
    const refundRes = await refundRazorpayPayment(order.razorpay_payment_id, refundAmountInSubunits);

    // Save to Database
    const refundDecimal = getAmountFromSubunits(refundRes.amount, order.currency_code);
    
    await db.query(
      `UPDATE ${orderTable} SET refund_id = ?, refund_amount = ?, refund_status = ?, refund_at = NOW(), payment_status = 'Refunded' WHERE id = ?`,
      [refundRes.id, refundDecimal, refundRes.status || "processed", order.id]
    );

    res.json({ success: true, message: "Refund processed successfully.", refund_id: refundRes.id });
  } catch (error) {
    console.error("Refund processing error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 4. Secure Webhook endpoint with validation (Priority 13/14)
router.post("/razorpay/webhook", async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  
  // Signature Validation using Webhook Secret
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  
  if (webhookSecret && signature) {
    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha256", webhookSecret);
    const hash = hmac.update(req.rawBody || JSON.stringify(req.body)).digest("hex");
    
    if (hash !== signature) {
      return res.status(400).json({ error: "Invalid webhook signature." });
    }
  }

  const event = req.body.event;
  const payload = req.body.payload;

  if (!event || !payload) {
    return res.status(400).json({ error: "Invalid webhook payload." });
  }

  try {
    // Process payment.captured or order.paid
    if (event === "payment.captured" || event === "order.paid") {
      const paymentObj = payload.payment?.entity || {};
      const rzpOrderId = paymentObj.order_id;
      const rzpPaymentId = paymentObj.id;

      if (rzpOrderId) {
        // Find pending order
        let orderTable = "physical_orders";
        let [orders] = await db.query("SELECT * FROM physical_orders WHERE razorpay_order_id = ?", [rzpOrderId]);
        if (!orders.length) {
          orderTable = "digital_orders";
          [orders] = await db.query("SELECT * FROM digital_orders WHERE razorpay_order_id = ?", [rzpOrderId]);
        }

        if (orders.length) {
          const order = orders[0];
          if (order.payment_status !== "Paid") {
            // Verify amounts are matching
            if (parseInt(paymentObj.amount) === getSubunits(order.total, order.currency_code)) {
              await db.query(
                `UPDATE ${orderTable} SET payment_status = 'Paid', transaction_id = ?, razorpay_payment_id = ?, payment_verified_at = NOW() WHERE id = ?`,
                [rzpPaymentId, rzpPaymentId, order.id]
              );
              // Trigger email confirmation & invoice dispatch (background)
              const { sendOrderConfirmation } = require("../utils/orderNotification");
              sendOrderConfirmation(order.order_uid).catch(err => console.error("Failed to send order confirmation email via webhook:", err));
            }
          }
        }
      }
    }

    // Process refund events
    if (event === "refund.processed" || event === "refund.created") {
      const refundObj = payload.refund?.entity || {};
      const rzpPaymentId = refundObj.payment_id;
      const refundId = refundObj.id;

      let orderTable = "physical_orders";
      let [orders] = await db.query("SELECT * FROM physical_orders WHERE razorpay_payment_id = ?", [rzpPaymentId]);
      if (!orders.length) {
        orderTable = "digital_orders";
        [orders] = await db.query("SELECT * FROM digital_orders WHERE razorpay_payment_id = ?", [rzpPaymentId]);
      }

      if (orders.length) {
        const order = orders[0];
        const refundDecimal = getAmountFromSubunits(refundObj.amount, order.currency_code);
        await db.query(
          `UPDATE ${orderTable} SET refund_id = ?, refund_amount = ?, refund_status = ?, refund_at = NOW(), payment_status = 'Refunded' WHERE id = ?`,
          [refundId, refundDecimal, refundObj.status || "processed", order.id]
        );
      }
    }

    return res.status(200).json({ success: true, message: "Webhook processed." });
  } catch (error) {
    console.error("Razorpay webhook parsing failed:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// Helper to get PayPal Access Token
async function getPayPalAccessToken() {
  const [rows] = await db.query("SELECT paypal_client_id, paypal_client_secret FROM settings WHERE id = 1");
  let clientId = rows[0]?.paypal_client_id || process.env.PAYPAL_CLIENT_ID;
  let clientSecret = rows[0]?.paypal_client_secret;

  if (clientSecret) {
    const { decrypt } = require("../utils/shiprocket");
    clientSecret = decrypt(clientSecret);
  } else {
    clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  }

  clientId = (clientId || "").trim();
  clientSecret = (clientSecret || "").trim();

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials missing in store settings.");
  }

  const isLive = !clientId.startsWith("sb") && process.env.PAYPAL_MODE !== "sandbox";
  const baseUrl = isLive ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${auth}`
    }
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    console.error("PayPal token request failed:", errText);
    throw new Error("Failed to authenticate with PayPal.");
  }

  const tokenData = await tokenRes.json();
  return { accessToken: tokenData.access_token, baseUrl };
}

// 5. PayPal v2 Server-Side Order Creation (for React SDK v6)
router.post("/paypal/create-order", async (req, res) => {
  const { amount, currency_code } = req.body;
  try {
    const { accessToken, baseUrl } = await getPayPalAccessToken();

    let numAmount = parseFloat(amount);
    if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
      numAmount = 1.00;
    }
    const formattedAmount = numAmount.toFixed(2);
    const validCurrency = (currency_code && typeof currency_code === "string" && currency_code.trim()) 
      ? currency_code.trim().toUpperCase() 
      : "USD";

    const orderPayload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: "default",
          description: "Olive Seeds Studio Order",
          amount: {
            currency_code: validCurrency,
            value: formattedAmount
          }
        }
      ]
    };

    const orderRes = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(orderPayload)
    });

    const orderData = await orderRes.json();
    if (!orderRes.ok) {
      console.error("PayPal order create error:", JSON.stringify(orderData, null, 2));
      const issueDetails = Array.isArray(orderData.details)
        ? orderData.details.map(d => `${d.issue || d.field || ""}: ${d.description || ""}`).join("; ")
        : "";
      return res.status(orderRes.status).json({ 
        error: issueDetails || orderData.message || "Failed to create PayPal order.",
        details: orderData.details,
        name: orderData.name,
        debug_id: orderData.debug_id
      });
    }

    return res.json({ orderId: orderData.id });
  } catch (err) {
    console.error("Server PayPal create order error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// 6. PayPal v2 Server-Side Order Capture (for React SDK v6)
router.post("/paypal/capture-order", async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) {
    return res.status(400).json({ error: "PayPal order ID is required." });
  }

  try {
    const { accessToken, baseUrl } = await getPayPalAccessToken();

    const captureRes = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });

    const captureData = await captureRes.json();
    if (!captureRes.ok) {
      if (captureData.details && captureData.details.some(d => d.issue === "ORDER_ALREADY_CAPTURED")) {
        return res.json({ success: true, alreadyCaptured: true });
      }
      console.error("PayPal capture error:", captureData);
      return res.status(captureRes.status).json({ error: captureData.message || "Failed to capture PayPal payment." });
    }

    return res.json({ success: true, captureId: captureData.id, status: captureData.status });
  } catch (err) {
    console.error("Server PayPal capture error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
