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
    items, address_line, currency_code, shipping_fee
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
      if (item.type === "physical" || item.product_id !== null) {
        const [products] = await db.query(
          "SELECT id, product_uid, name, price, stock, is_active FROM products WHERE id = ? OR product_uid = ?",
          [item.product_id, item.product_uid]
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
      } else {
        const [products] = await db.query(
          "SELECT id, product_uid, name, price, is_active FROM digital_products WHERE id = ? OR product_uid = ?",
          [item.digital_product_id, item.product_uid]
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

      // Parse address line
      const address = address_line || "";
      const parts = address.split(",").map(p => p.trim());
      const delivery_street = parts[0] || address || "Street Address";
      const delivery_apt = parts[1] || "";
      const delivery_city = parts[2] || "City";
      const delivery_state = parts[3] || "State";
      const delivery_country = parts[4] || "India";
      const delivery_pincode = parts[5] || "000000";

      // Call Razorpay Order Creation server-side
      const amountInMinorUnits = getSubunits(finalTotalConverted, targetCurrency);
      const rzpOrder = await createRazorpayOrder(amountInMinorUnits, targetCurrency, order_uid);

      await db.query(
        `INSERT INTO physical_orders
         (order_uid, invoice_uid, member_uid, guest_name, guest_email, guest_phone,
          delivery_name, delivery_street, delivery_apt, delivery_city, delivery_state,
          delivery_country, delivery_pincode, subtotal, tax_amount, shipping_fee, total,
          currency_code, currency_rate, payment_mode, transaction_id, payment_status, status, razorpay_order_id)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          order_uid, invoice_uid, member_uid, guest_name || "Guest", guest_email || "", guest_phone || "",
          guest_name || "Guest", delivery_street, delivery_apt, delivery_city, delivery_state,
          delivery_country, delivery_pincode, subtotalConverted, taxConverted, shippingConverted, finalTotalConverted,
          targetCurrency, conversionRate, "Razorpay", null, "Pending", "Processing", rzpOrder.id
        ]
      );

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

      await db.query(
        `INSERT INTO digital_orders
         (order_uid, invoice_uid, member_uid, guest_name, guest_email,
          subtotal, tax_amount, total, currency_code, currency_rate,
          payment_mode, transaction_id, payment_status, status, razorpay_order_id)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          order_uid, invoice_uid, member_uid, guest_name || "Guest", guest_email || "",
          subtotalConverted, taxConverted, finalTotalConverted, targetCurrency, conversionRate,
          "Razorpay", null, "Pending", "Completed", rzpOrder.id
        ]
      );

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
    let [orders] = await db.query("SELECT * FROM physical_orders WHERE razorpay_order_id = ?", [razorpay_order_id]);
    
    if (!orders.length) {
      orderTable = "digital_orders";
      [orders] = await db.query("SELECT * FROM digital_orders WHERE razorpay_order_id = ?", [razorpay_order_id]);
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
    await db.query(
      `UPDATE ${orderTable} SET payment_status = 'Paid', transaction_id = ?, razorpay_payment_id = ?, razorpay_signature = ?, payment_verified_at = NOW() WHERE id = ?`,
      [razorpay_payment_id, razorpay_payment_id, razorpay_signature, order.id]
    );

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
    );

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
    // Buffer body mapping
    const rawBody = JSON.stringify(req.body);
    const hash = hmac.update(rawBody).digest("hex");
    
    if (hash !== signature) {
      return res.status(401).json({ error: "Invalid webhook signature." });
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

module.exports = router;
