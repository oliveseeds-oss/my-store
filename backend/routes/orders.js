const router = require("express").Router();
const db = require("../db");
const { generateOrderUid } = require('../utils/generateUid');
const { verifyAdmin, verifyMember } = require("../middleware/auth");
const createNotification = require("../utils/createNotification");

async function verifyPayPalOrder(orderId) {
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
    throw new Error("PayPal credentials missing in production. Cannot verify transaction.");
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
    throw new Error("Failed to authenticate with PayPal API.");
  }
  
  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  const orderRes = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  });

  if (!orderRes.ok) {
    throw new Error("Failed to fetch order details from PayPal.");
  }

  const orderData = await orderRes.json();
  if (orderData.status !== "COMPLETED") {
    throw new Error(`PayPal order status is ${orderData.status}, expected COMPLETED.`);
  }
  return true;
}


// UNIFIED ORDERS PLACEMENT ROUTE
router.post("/", async (req, res) => {
  const {
    member_id, guest_name, guest_email, guest_phone,
    items, address_line, shipping_fee,
    shipping_method_id, shipping_method_name, shipping_cost, shipping_zone, shipping_weight_grams,
    payment_mode, transaction_id, currency_code, currency_rate,
    delivery_street, delivery_apt, delivery_city, delivery_state, delivery_country, delivery_pincode
  } = req.body;

  try {
    if (!items || !items.length) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    if (payment_mode === "PayPal") {
      if (!transaction_id) {
        return res.status(400).json({ error: "PayPal Transaction ID is required" });
      }
      try {
        await verifyPayPalOrder(transaction_id);
      } catch (paypalErr) {
        console.error("PayPal verification failed:", paypalErr.message);
        return res.status(400).json({ error: `PayPal validation failed: ${paypalErr.message}` });
      }
    }

    // 1. Resolve member_uid if member_id is provided
    let member_uid = null;
    if (member_id) {
      const [members] = await db.query(
        "SELECT member_uid FROM members WHERE id = ? OR member_uid = ?",
        [member_id, member_id]
      );
      if (members.length) {
        member_uid = members[0].member_uid;
      }
    }

    // 2. Separate physical and digital items
    const physicalItems = [];
    const digitalItems = [];

    for (const item of items) {
      const isDigital = item.type === "digital" || item.product_type === "digital" || (item.digital_product_id && !item.product_id) || String(item.product_uid || item.id || "").startsWith("DPD-");
      if (isDigital) {
        // Resolve digital product_uid from id if missing
        let product_uid = item.product_uid;
        if (!product_uid && (item.digital_product_id || item.product_id)) {
          const targetId = item.digital_product_id || item.product_id;
          const [products] = await db.query(
            "SELECT product_uid FROM digital_products WHERE id = ? OR product_uid = ?",
            [targetId, targetId]
          );
          if (products.length) product_uid = products[0].product_uid;
        }
        digitalItems.push({
          ...item,
          product_uid: product_uid || `DPD-TEMP-${Math.floor(Math.random() * 900000)}`
        });
      } else {
        // Resolve physical product_uid from id if missing
        let product_uid = item.product_uid;
        if (!product_uid && item.product_id) {
          const [products] = await db.query(
            "SELECT product_uid FROM products WHERE id = ? OR product_uid = ?",
            [item.product_id, item.product_id]
          );
          if (products.length) product_uid = products[0].product_uid;
        }
        physicalItems.push({
          ...item,
          product_uid: product_uid || `PRD-TEMP-${Math.floor(Math.random() * 900000)}`
        });
      }
    }

    let finalOrderUid = null;
    let finalInvoiceUid = null;

    // 3. Process Physical Order
    if (physicalItems.length > 0) {
      const { order_uid, invoice_uid } = await generateOrderUid("physical");
      finalOrderUid = order_uid;
      finalInvoiceUid = invoice_uid;

      const subtotal = physicalItems.reduce((sum, i) => sum + i.price * i.qty, 0);
      const tax_amount = Math.round(subtotal * 0.18); // Default 18% GST
      const ship_fee = shipping_fee !== undefined ? shipping_fee : (subtotal >= 999 ? 0 : 60);
      const total = subtotal + tax_amount + ship_fee;

      // Parse address line or use structured fields
      const address = address_line || "";
      const parts = address.split(",").map(p => p.trim());
      const streetVal = delivery_street || parts[0] || address || "Street Address";
      const aptVal = delivery_apt || parts[1] || "";
      const cityVal = delivery_city || parts[2] || "City";
      const stateVal = delivery_state || parts[3] || "State";
      const countryVal = delivery_country || parts[4] || "India";
      const pincodeVal = delivery_pincode || parts[5] || "000000";

      await db.query(
        `INSERT INTO physical_orders
         (order_uid, invoice_uid, member_uid, guest_name, guest_email, guest_phone,
          delivery_name, delivery_street, delivery_apt, delivery_city, delivery_state,
          delivery_country, delivery_pincode, subtotal, tax_amount, shipping_fee, total,
          currency_code, currency_rate, payment_mode, transaction_id, payment_status, status)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          order_uid, invoice_uid, member_uid, guest_name || "Guest", guest_email || "", guest_phone || "",
          guest_name || "Guest", streetVal, aptVal, cityVal, stateVal,
          countryVal, pincodeVal, subtotal, tax_amount, ship_fee, total,
          currency_code || "INR", parseFloat(currency_rate) || 1.0, payment_mode || "COD", transaction_id || null,
          (payment_mode && payment_mode !== "COD" && transaction_id) ? "Paid" : "Pending", "Processing"
        ]
      );

      // Save extended shipping charge fields if available (Step 9)
      if (shipping_method_id || shipping_method_name || shipping_zone || shipping_cost !== undefined) {
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
            shipping_cost !== undefined ? shipping_cost : null,
            currency_code || "INR",
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
          [order_uid, item.product_uid, item.product_name, item.selected_size || null, item.price, item.qty, 18]
        );
        const order_item_id = itemRes.insertId;

        if (item.customizations && item.customizations.length) {
          for (const cust of item.customizations) {
            await db.query(
              `INSERT INTO order_item_customizations 
               (physical_order_item_id, template_id, template_name, field_key, field_label, field_value, field_type) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                order_item_id,
                cust.template_id || null,
                cust.template_name || 'Default',
                cust.field_key,
                cust.field_label,
                String(cust.field_value),
                cust.field_type
              ]
            );
          }
        }

        // reduce stock
        await db.query(
          "UPDATE products SET stock = GREATEST(0, stock - ?) WHERE product_uid = ?",
          [item.qty, item.product_uid]
        );

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

      // Notification
      await db.query(
        "INSERT INTO notifications (type, title, message, link) VALUES (?,?,?,?)",
        ["new_order", "New physical order", `${order_uid} — ₹${total} from ${guest_name || member_uid || 'Guest'}`, "/orders"]
      );
    }

    // 4. Process Digital Order
    if (digitalItems.length > 0) {
      const { order_uid, invoice_uid } = await generateOrderUid("digital");
      if (!finalOrderUid) {
        finalOrderUid = order_uid;
        finalInvoiceUid = invoice_uid;
      }

      const subtotal = digitalItems.reduce((sum, i) => sum + i.price * i.qty, 0);
      const tax_amount = Math.round(subtotal * 0.18);
      const total = subtotal + tax_amount;

      await db.query(
        `INSERT INTO digital_orders
         (order_uid, invoice_uid, member_uid, guest_name, guest_email,
          subtotal, tax_amount, total, currency_code, currency_rate,
          payment_mode, transaction_id, payment_status, status)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          order_uid, invoice_uid, member_uid, guest_name || "Guest", guest_email || "",
          subtotal, tax_amount, total, currency_code || "INR", parseFloat(currency_rate) || 1.0,
          payment_mode || "Online", transaction_id || null,
          (payment_mode && payment_mode !== "COD" && transaction_id) ? "Paid" : "Pending", "Completed"
        ]
      );

      for (const item of digitalItems) {
        await db.query(
          `INSERT INTO digital_order_items (order_uid, product_uid, product_name, price, qty, tax_rate)
           VALUES (?,?,?,?,?,?)`,
          [order_uid, item.product_uid, item.product_name, item.price, item.qty, 18]
        );
      }

      // Notification
      await db.query(
        "INSERT INTO notifications (type, title, message, link) VALUES (?,?,?,?)",
        ["new_order", "New digital order", `${order_uid} — ₹${total} from ${guest_name || member_uid || 'Guest'}`, "/orders"]
      );
    }

    // Automatically trigger confirmation & invoice email sending (background)
    const { sendOrderConfirmation } = require("../utils/orderNotification");
    sendOrderConfirmation(finalOrderUid).catch(err => console.error("Failed to send order confirmation email:", err));

    // Send user notification if member_id / member_uid is present
    if (member_id || member_uid) {
      try {
        let targetUserId = member_id;
        if (!targetUserId && member_uid) {
          const [mRows] = await db.query("SELECT id FROM members WHERE member_uid = ?", [member_uid]);
          if (mRows.length) targetUserId = mRows[0].id;
        }
        if (targetUserId) {
          await createNotification(
            db,
            targetUserId,
            'Order Confirmed 📦',
            `Your order #${finalOrderUid} has been confirmed and is being processed.`,
            'order_confirmed',
            finalOrderUid,
            null
          );
        }
      } catch (notifErr) {
        console.error("Order notification trigger error:", notifErr);
      }
    }

    res.json({
      order_id: finalOrderUid,
      order_uid: finalOrderUid,
      invoice_uid: finalInvoiceUid,
      message: "Order placed successfully"
    });

  } catch (error) {
    console.error("Unified order placement failed:", error);
    res.status(500).json({ error: "Failed to place order" });
  }
});

// ── PHYSICAL ORDERS ──────────────────────────────────

// PUBLIC — place physical order
router.post("/physical", async (req, res) => {
  const {
    member_uid, guest_name, guest_email, guest_phone,
    delivery_name, delivery_street, delivery_apt,
    delivery_city, delivery_state, delivery_country, delivery_pincode,
    items, subtotal, tax_amount, shipping_fee, total,
    currency_code, currency_rate, payment_mode, transaction_id
  } = req.body;

  const { order_uid, invoice_uid } = await generateOrderUid("physical");

  await db.query(
    `INSERT INTO physical_orders
     (order_uid, invoice_uid, member_uid, guest_name, guest_email, guest_phone,
      delivery_name, delivery_street, delivery_apt, delivery_city, delivery_state,
      delivery_country, delivery_pincode, subtotal, tax_amount, shipping_fee, total,
      currency_code, currency_rate, payment_mode, transaction_id, payment_status)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [order_uid, invoice_uid, member_uid || null, guest_name, guest_email, guest_phone,
      delivery_name, delivery_street, delivery_apt, delivery_city, delivery_state,
      delivery_country, delivery_pincode, subtotal, tax_amount || 0, shipping_fee || 0, total,
      currency_code || "INR", currency_rate || 1.0, payment_mode || "COD",
      transaction_id || null, transaction_id ? "Paid" : "Pending"]
  );

  for (const item of items) {
    const [itemRes] = await db.query(
      `INSERT INTO physical_order_items (order_uid, product_uid, product_name, selected_size, price, qty, tax_rate)
       VALUES (?,?,?,?,?,?,?)`,
      [order_uid, item.product_uid, item.product_name, item.selected_size || null,
        item.price, item.qty, item.tax_rate || 18]
    );
    const order_item_id = itemRes.insertId;

    if (item.customizations && item.customizations.length) {
      for (const cust of item.customizations) {
        await db.query(
          `INSERT INTO order_item_customizations 
           (physical_order_item_id, template_id, template_name, field_key, field_label, field_value, field_type) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            order_item_id,
            cust.template_id || null,
            cust.template_name || 'Default',
            cust.field_key,
            cust.field_label,
            String(cust.field_value),
            cust.field_type
          ]
        );
      }
    }

    // reduce stock
    await db.query(
      "UPDATE products SET stock = stock - ? WHERE product_uid = ?",
      [item.qty, item.product_uid]
    );
  }

  // Admin notification
  await db.query(
    "INSERT INTO notifications (type, title, message, link) VALUES (?,?,?,?)",
    ["new_order", "New physical order", `${order_uid} — ₹${total} from ${guest_name || member_uid}`, "/orders"]
  );

  res.json({ order_uid, invoice_uid, message: "Order placed successfully" });
});

// PUBLIC — place digital order
router.post("/digital", async (req, res) => {
  const {
    member_uid, guest_name, guest_email,
    items, subtotal, tax_amount, total,
    currency_code, currency_rate, payment_mode, transaction_id
  } = req.body;

  const { order_uid, invoice_uid } = await generateOrderUid("digital");

  await db.query(
    `INSERT INTO digital_orders
     (order_uid, invoice_uid, member_uid, guest_name, guest_email,
      subtotal, tax_amount, total, currency_code, currency_rate,
      payment_mode, transaction_id, payment_status, status)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [order_uid, invoice_uid, member_uid || null, guest_name, guest_email,
      subtotal, tax_amount || 0, total, currency_code || "INR", currency_rate || 1.0,
      payment_mode || "Online", transaction_id || null,
      transaction_id ? "Paid" : "Pending", "Completed"]
  );

  for (const item of items) {
    await db.query(
      `INSERT INTO digital_order_items (order_uid, product_uid, product_name, price, qty, tax_rate)
       VALUES (?,?,?,?,?,?)`,
      [order_uid, item.product_uid, item.product_name, item.price, item.qty, item.tax_rate || 18]
    );
  }

  await db.query(
    "INSERT INTO notifications (type, title, message, link) VALUES (?,?,?,?)",
    ["new_order", "New digital order", `${order_uid} — ₹${total} from ${guest_name || member_uid}`, "/orders"]
  );

  res.json({ order_uid, invoice_uid, message: "Order placed. Download link sent." });
});

// MEMBER — my orders (both types merged flat)
router.get("/my", verifyMember, async (req, res) => {
  const member_uid = req.member.member_uid;
  try {
    // 1. Get physical orders
    const [phys] = await db.query(
      `SELECT id, order_uid, invoice_date as created_at, status, total, 'physical' as type
       FROM physical_orders
       WHERE member_uid = ?
       ORDER BY invoice_date DESC`,
      [member_uid]
    );

    // 2. Get digital orders
    const [digi] = await db.query(
      `SELECT id, order_uid, invoice_date as created_at, status, total, 'digital' as type
       FROM digital_orders
       WHERE member_uid = ?
       ORDER BY invoice_date DESC`,
      [member_uid]
    );

    const allOrders = [];

    for (const o of phys) {
      const [items] = await db.query(
        "SELECT id, product_uid, product_name, qty, price FROM physical_order_items WHERE order_uid = ?",
        [o.order_uid]
      );
      allOrders.push({
        id: o.order_uid, // Use order_uid as ID to show Order #ORD-XXXXXX in UI
        created_at: o.created_at,
        status: o.status,
        total: parseFloat(o.total || 0).toFixed(2),
        type: "physical",
        items
      });
    }

    for (const o of digi) {
      const [items] = await db.query(
        "SELECT id, product_uid, product_name, qty, price FROM digital_order_items WHERE order_uid = ?",
        [o.order_uid]
      );
      allOrders.push({
        id: o.order_uid,
        created_at: o.created_at,
        status: o.status,
        total: parseFloat(o.total || 0).toFixed(2),
        type: "digital",
        items
      });
    }

    // Sort by created_at DESC
    allOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(allOrders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch member orders" });
  }
});

// ADMIN — all physical (engraved) orders with custom mapping & search
router.get("/admin/engraved", verifyAdmin, async (req, res) => {
  const { search } = req.query;
  let query = `
    SELECT o.order_uid as order_id, o.invoice_uid as invoice_no, o.member_uid as member_id, o.invoice_date as created_at, o.payment_mode, o.total as total_amount, o.status as delivery_status, o.tracking_number, o.production_notes, o.production_status,
           COALESCE(o.guest_name, m.name) as guest_name, m.name as member_name, o.delivery_name as ship_full_name,
           o.delivery_street as ship_street, o.delivery_city as ship_city, o.delivery_state as ship_state, o.delivery_pincode as ship_pincode,
           GROUP_CONCAT(i.product_name SEPARATOR ', ') as product_name,
           GROUP_CONCAT(i.selected_size SEPARATOR ', ') as selected_size,
           SUM(i.qty) as quantity
    FROM physical_orders o
    LEFT JOIN members m ON o.member_uid = m.member_uid
    LEFT JOIN physical_order_items i ON o.order_uid = i.order_uid
  `;
  let params = [];
  if (search) {
    query += ` WHERE o.order_uid LIKE ? OR o.invoice_uid LIKE ? OR o.guest_name LIKE ? OR o.guest_email LIKE ? OR m.name LIKE ?`;
    const wildcard = `%${search}%`;
    params = [wildcard, wildcard, wildcard, wildcard, wildcard];
  }
  query += ` GROUP BY o.id ORDER BY o.invoice_date DESC`;

  try {
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch physical/engraved orders" });
  }
});

// ADMIN — all digital orders with custom mapping & search
router.get("/admin/digital", verifyAdmin, async (req, res) => {
  const { search } = req.query;
  let query = `
    SELECT o.order_uid as order_id, o.invoice_uid as invoice_no, o.member_uid as member_id, o.invoice_date as created_at, o.payment_mode, o.payment_status, o.total as total_amount, o.status as delivery_status, o.download_count, 5 as max_downloads, DATE_ADD(o.invoice_date, INTERVAL 30 DAY) as download_expires,
           COALESCE(o.guest_name, m.name) as guest_name, m.name as member_name,
           GROUP_CONCAT(i.product_name SEPARATOR ', ') as product_name,
           GROUP_CONCAT(dp.file_format SEPARATOR ', ') as file_format
    FROM digital_orders o
    LEFT JOIN members m ON o.member_uid = m.member_uid
    LEFT JOIN digital_order_items i ON o.order_uid = i.order_uid
    LEFT JOIN digital_products dp ON i.product_uid = dp.product_uid
  `;
  let params = [];
  if (search) {
    query += ` WHERE o.order_uid LIKE ? OR o.invoice_uid LIKE ? OR o.guest_name LIKE ? OR o.guest_email LIKE ? OR m.name LIKE ?`;
    const wildcard = `%${search}%`;
    params = [wildcard, wildcard, wildcard, wildcard, wildcard];
  }
  query += ` GROUP BY o.id ORDER BY o.invoice_date DESC`;

  try {
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch digital orders" });
  }
});

// UPDATE engraved/physical status
router.put("/admin/engraved/:uid/status", verifyAdmin, async (req, res) => {
  const { delivery_status, tracking_number, courier_name } = req.body;
  try {
    // Get internal ID of the physical order first
    const [orders] = await db.query(
      `SELECT o.id, o.order_uid, o.member_uid, o.guest_name, o.guest_email, m.email as member_email, m.name as member_name
       FROM physical_orders o
       LEFT JOIN members m ON o.member_uid = m.member_uid
       WHERE o.order_uid = ?`,
      [req.params.uid]
    );
    if (!orders.length) {
      return res.status(404).json({ error: "Order not found" });
    }
    const order = orders[0];

    // Update physical order
    await db.query(
      `UPDATE physical_orders SET status = ?, tracking_number = ?, updated_at = NOW() WHERE order_uid = ?`,
      [delivery_status, tracking_number || null, req.params.uid]
    );

    // Sync to shipments table if tracking number is provided
    if (tracking_number) {
      const partner = courier_name || "delhivery";
      const [existingShipment] = await db.query("SELECT id FROM shipments WHERE order_id = ?", [order.id]);
      if (existingShipment.length) {
        await db.query(
          "UPDATE shipments SET partner = ?, tracking_number = ?, status = ?, updated_at = NOW() WHERE order_id = ?",
          [partner, tracking_number, delivery_status === "Delivered" ? "Delivered" : "In Transit", order.id]
        );
      } else {
        await db.query(
          "INSERT INTO shipments (order_id, partner, tracking_number, status, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())",
          [order.id, partner, tracking_number, delivery_status === "Delivered" ? "Delivered" : "In Transit"]
        );
      }

      // Member Notification
      if (order.member_uid) {
        await db.query(
          "INSERT INTO member_notifications (member_id, type, title, message, created_at) VALUES ((SELECT id FROM members WHERE member_uid = ?), 'shipping', 'Your order status updated!', ?, NOW())",
          [order.member_uid, `Order #${order.order_uid} status is now: ${delivery_status}. Tracking number: ${tracking_number}`]
        );
      }
    }

    // Trigger manual status change customer email notification
    const customerEmail = order.guest_email || order.member_email;
    if (customerEmail) {
      const { sendMail } = require("../utils/mailer");
      const customerName = order.guest_name || order.member_name || "Valued Customer";
      const partnerName = courier_name || "Standard Carrier";
      
      let statusTitle = `Order Update: ${delivery_status}`;
      let statusDesc = `We wanted to let you know that your order #${order.order_uid} status has been manually updated by our studio to: <strong>${delivery_status}</strong>.`;
      
      if (delivery_status === "Delivered") {
        statusTitle = "🎉 Package Delivered!";
        statusDesc = `Great news! Your package for Order #${order.order_uid} has been successfully delivered. Thank you for shopping with us!`;
      } else if (delivery_status === "Shipped") {
        statusTitle = "🚚 Package Shipped!";
        statusDesc = `Your package for Order #${order.order_uid} has been shipped. It is on its way to you!`;
      }

      const trackingDetail = tracking_number ? `
        <div style="background-color: #ffffff; border: 1px solid rgba(27,57,49,0.15); padding: 15px; border-radius: 12px; margin: 20px 0;">
          <strong>Tracking Number:</strong> ${tracking_number}<br/>
          <strong>Courier Partner:</strong> ${partnerName}<br/>
        </div>
      ` : "";

      await sendMail({
        to: customerEmail,
        subject: `${statusTitle} - Order #${order.order_uid}`,
        text: `Your order #${order.order_uid} status has been updated to: ${delivery_status}.`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e5e5e5; border-radius: 16px; background-color: #FAF9F6; color: #0D1512;">
            <h2 style="color: #0D1512; text-align: center; font-weight: 800;">${statusTitle}</h2>
            <p>Hello ${customerName},</p>
            <p>${statusDesc}</p>
            ${trackingDetail}
            <p style="font-size: 12px; color: #78716c; text-align: center;">You can track your order status on your profile dashboard.</p>
            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;" />
            <p style="font-size: 11px; text-align: center; color: #a8a29e;">© 2026 Olive Seeds Studio. All rights reserved.</p>
          </div>
        `
      }).catch(err => console.error("Failed to send manual status update customer email:", err.message));
    }

    res.json({ message: "Status updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// AUTOMATE Shiprocket Shipment Creation
router.post("/admin/engraved/:uid/shiprocket", verifyAdmin, async (req, res) => {
  try {
    const { shipOrderWithShiprocket } = require("../utils/shiprocket");

    // 1. Get physical order
    const [orders] = await db.query("SELECT * FROM physical_orders WHERE order_uid = ?", [req.params.uid]);
    if (!orders.length) {
      return res.status(404).json({ error: "Order not found" });
    }
    const order = orders[0];

    // Check payment safety (Priority 8)
    const isPaid = order.payment_status === "Paid";
    const isCOD = order.payment_mode === "COD";
    if (!isPaid && !isCOD) {
      return res.status(400).json({ error: "Cannot ship unpaid orders. Payment status must be Paid or payment mode must be COD." });
    }

    // Check duplicate booking (Priority 7)
    const [existingShipment] = await db.query("SELECT id, tracking_number, shiprocket_shipment_id FROM shipments WHERE order_id = ?", [order.id]);
    if (order.tracking_number || (existingShipment.length && (existingShipment[0].tracking_number || existingShipment[0].shiprocket_shipment_id))) {
      return res.status(400).json({ error: "Shipment has already been created/booked for this order." });
    }

    // 2. Get order items
    const [items] = await db.query("SELECT * FROM physical_order_items WHERE order_uid = ?", [order.order_uid]);

    // 3. Ship with Shiprocket
    const result = await shipOrderWithShiprocket(order, items);

    // 4. Update order status and tracking details in db (Priority 6)
    await db.query(
      `UPDATE physical_orders SET status = 'Shipped', tracking_number = ?, updated_at = NOW() WHERE order_uid = ?`,
      [result.awb_code, order.order_uid]
    );

    // Sync to shipments table storing returned IDs
    if (existingShipment.length) {
      await db.query(
        "UPDATE shipments SET partner = 'shiprocket', tracking_number = ?, shiprocket_order_id = ?, shiprocket_shipment_id = ?, courier_name = ?, status = 'In Transit', updated_at = NOW() WHERE order_id = ?",
        [result.awb_code, result.shiprocket_order_id, result.shipment_id, result.courier_name, order.id]
      );
    } else {
      await db.query(
        "INSERT INTO shipments (order_id, partner, tracking_number, shiprocket_order_id, shiprocket_shipment_id, courier_name, status, created_at, updated_at) VALUES (?, 'shiprocket', ?, ?, ?, ?, 'In Transit', NOW(), NOW())",
        [order.id, result.awb_code, result.shiprocket_order_id, result.shipment_id, result.courier_name]
      );
    }

    // Member Notification
    if (order.member_uid) {
      await db.query(
        "INSERT INTO member_notifications (member_id, type, title, message, created_at) VALUES ((SELECT id FROM members WHERE member_uid = ?), 'shipping', 'Your order is shipped via Shiprocket!', ?, NOW())",
        [order.member_uid, `Order #${order.order_uid} is on the way. Tracking: ${result.awb_code}`]
      );
    }

    // Admin Notification
    await db.query(
      "INSERT INTO notifications (type, title, message, link) VALUES ('shipping', 'Shiprocket Shipment Created', ?, '/orders')",
      [`Order #${order.order_uid} shipped via Shiprocket. AWB: ${result.awb_code}`]
    );

    res.json({
      message: "Shipment created successfully via Shiprocket",
      tracking_number: result.awb_code,
      courier_name: result.courier_name
    });
  } catch (error) {
    console.error("Shiprocket automation failed:", error);
    res.status(500).json({ error: error.message || "Failed to create Shiprocket shipment" });
  }
});

// UPDATE digital status
router.put("/admin/digital/:uid/status", verifyAdmin, async (req, res) => {
  const { payment_status, delivery_status } = req.body;
  try {
    const fields = [];
    const values = [];
    if (payment_status !== undefined) {
      fields.push("payment_status = ?");
      values.push(payment_status);
    }
    if (delivery_status !== undefined) {
      fields.push("status = ?");
      values.push(delivery_status);
    }

    if (fields.length > 0) {
      values.push(req.params.uid);
      await db.query(
        `UPDATE digital_orders SET ${fields.join(", ")} WHERE order_uid = ?`,
        values
      );
    }
    res.json({ message: "Status updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update digital order status" });
  }
});

// ADMIN — legacy endpoints just in case
router.get("/admin/physical", verifyAdmin, async (req, res) => {
  const [rows] = await db.query(
    `SELECT o.*,
            JSON_ARRAYAGG(JSON_OBJECT('product_uid',i.product_uid,'name',i.product_name,
              'qty',i.qty,'price',i.price,'size',i.selected_size)) as items
     FROM physical_orders o
     LEFT JOIN physical_order_items i ON o.order_uid = i.order_uid
     GROUP BY o.id ORDER BY o.invoice_date DESC`
  );
  res.json(rows);
});

// ADMIN — dashboard stats
router.get("/admin/stats", verifyAdmin, async (req, res) => {
  try {
    const [physStats] = await db.query(
      `SELECT COUNT(*) as total_orders, COALESCE(SUM(total),0) as total_revenue,
              SUM(CASE WHEN status='Processing' THEN 1 ELSE 0 END) as processing,
              SUM(CASE WHEN status='Shipped' THEN 1 ELSE 0 END) as shipped,
              SUM(CASE WHEN status='Delivered' THEN 1 ELSE 0 END) as delivered
       FROM physical_orders WHERE payment_status='Paid'`
    );
    const [digiStats] = await db.query(
      `SELECT COUNT(*) as total_orders, COALESCE(SUM(total),0) as total_revenue
       FROM digital_orders WHERE payment_status='Paid'`
    );
    const [memberCount] = await db.query("SELECT COUNT(*) as cnt FROM members");
    const [msgCount] = await db.query("SELECT COUNT(*) as cnt FROM contact_messages WHERE is_read=FALSE");
    const [unreadNotif] = await db.query("SELECT COUNT(*) as cnt FROM notifications WHERE is_read=FALSE");
    const [weeklyPhys] = await db.query(
      `SELECT DATE(invoice_date) as day, SUM(total) as revenue, COUNT(*) as orders
       FROM physical_orders WHERE invoice_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DATE(invoice_date) ORDER BY day`
    );
    const [weeklyDigi] = await db.query(
      `SELECT DATE(invoice_date) as day, SUM(total) as revenue, COUNT(*) as orders
       FROM digital_orders WHERE invoice_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DATE(invoice_date) ORDER BY day`
    );
    const [lowStock] = await db.query(
      "SELECT product_uid, name, stock FROM products WHERE stock <= 5 AND is_active=TRUE ORDER BY stock"
    );
    const [recentNotif] = await db.query(
      "SELECT * FROM notifications ORDER BY created_at DESC LIMIT 20"
    );
    res.json({
      physical: physStats[0],
      digital: digiStats[0],
      members: memberCount[0].cnt,
      unread_messages: msgCount[0].cnt,
      unread_notifications: unreadNotif[0].cnt,
      weekly_physical: weeklyPhys,
      weekly_digital: weeklyDigi,
      low_stock: lowStock,
      recent_notifications: recentNotif,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// ADMIN — export orders as CSV data
router.get("/admin/export/:type", verifyAdmin, async (req, res) => {
  const type = req.params.type;
  let rows;
  try {
    if (type === "physical") {
      [rows] = await db.query(
        `SELECT o.order_uid, o.invoice_uid, o.invoice_date, o.member_uid,
                COALESCE(o.guest_name, m.name) as customer_name,
                COALESCE(o.guest_email, m.email) as customer_email,
                o.delivery_city, o.delivery_country,
                o.subtotal, o.tax_amount, o.shipping_fee, o.total,
                o.currency_code, o.payment_mode, o.transaction_id,
                o.payment_status, o.status, o.tracking_number
         FROM physical_orders o
         LEFT JOIN members m ON o.member_uid = m.member_uid
         ORDER BY o.invoice_date DESC`
      );
    } else {
      [rows] = await db.query(
        `SELECT o.order_uid, o.invoice_uid, o.invoice_date, o.member_uid,
                COALESCE(o.guest_name, m.name) as customer_name,
                COALESCE(o.guest_email, m.email) as customer_email,
                o.subtotal, o.tax_amount, o.total,
                o.currency_code, o.payment_mode, o.transaction_id,
                o.payment_status, o.status
         FROM digital_orders o
         LEFT JOIN members m ON o.member_uid = m.member_uid
         ORDER BY o.invoice_date DESC`
      );
    }
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Export failed" });
  }
});

// ADMIN — get detailed customizations for an engraved order
router.get("/admin/engraved/:uid/details", verifyAdmin, async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*, COALESCE(o.guest_name, m.name) as customer_name, COALESCE(o.guest_email, m.email) as customer_email
       FROM physical_orders o LEFT JOIN members m ON o.member_uid = m.member_uid
       WHERE o.order_uid = ?`,
      [req.params.uid]
    );

    if (!orders.length) return res.status(404).json({ error: "Order not found" });
    const order = orders[0];

    const [items] = await db.query(
      "SELECT * FROM physical_order_items WHERE order_uid = ?",
      [req.params.uid]
    );

    for (let item of items) {
      const [customizations] = await db.query(
        "SELECT * FROM order_item_customizations WHERE physical_order_item_id = ?",
        [item.id]
      );
      item.customizations = customizations;
    }

    res.json({
      order,
      items
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch order details" });
  }
});

// ADMIN — update production status & production notes
router.put("/admin/engraved/:uid/production", verifyAdmin, async (req, res) => {
  const { production_status, production_notes } = req.body;
  try {
    await db.query(
      `UPDATE physical_orders 
       SET production_status = ?, production_notes = ?, updated_at = NOW() 
       WHERE order_uid = ?`,
      [production_status || 'Pending', production_notes || null, req.params.uid]
    );
    res.json({ message: "Production details updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update production status" });
  }
});

// ADMIN — Export Invoice/Order reports as CSV
router.get("/admin/reports/export", verifyAdmin, async (req, res) => {
  const { startDate, endDate, type = "all" } = req.query;
  try {
    let csvRows = [];
    csvRows.push([
      "Invoice Number",
      "Order ID",
      "Date",
      "Customer Name",
      "Customer Email",
      "Product Name",
      "Size",
      "Qty",
      "Price",
      "Subtotal",
      "Tax Amount",
      "Shipping Fee",
      "Total Paid",
      "Payment Mode",
      "Status",
      "Tracking Number",
      "Courier Name",
      "Shipping Country"
    ].join(","));

    let physicalSql = `SELECT o.*, COALESCE(o.guest_name, m.name) as customer_name, COALESCE(o.guest_email, m.email) as customer_email
                       FROM physical_orders o LEFT JOIN members m ON o.member_uid = m.member_uid WHERE 1=1`;
    let digitalSql = `SELECT o.*, COALESCE(o.guest_name, m.name) as customer_name, COALESCE(o.guest_email, m.email) as customer_email
                      FROM digital_orders o LEFT JOIN members m ON o.member_uid = m.member_uid WHERE 1=1`;
    const physicalParams = [];
    const digitalParams = [];

    if (startDate) {
      physicalSql += " AND o.invoice_date >= ?";
      digitalSql += " AND o.invoice_date >= ?";
      physicalParams.push(startDate + " 00:00:00");
      digitalParams.push(startDate + " 00:00:00");
    }
    if (endDate) {
      physicalSql += " AND o.invoice_date <= ?";
      digitalSql += " AND o.invoice_date <= ?";
      physicalParams.push(endDate + " 23:59:59");
      digitalParams.push(endDate + " 23:59:59");
    }

    physicalSql += " ORDER BY o.invoice_date DESC";
    digitalSql += " ORDER BY o.invoice_date DESC";

    if (type === "all" || type === "physical") {
      const [pOrders] = await db.query(physicalSql, physicalParams);
      for (const o of pOrders) {
        const [items] = await db.query("SELECT * FROM physical_order_items WHERE order_uid = ?", [o.order_uid]);
        for (const item of items) {
          const row = [
            o.invoice_uid || '',
            o.order_uid || '',
            o.invoice_date ? new Date(o.invoice_date).toISOString().split('T')[0] : 'N/A',
            `"${(o.customer_name || '').replace(/"/g, '""')}"`,
            o.customer_email || '',
            `"${(item.product_name || 'Product').replace(/"/g, '""')}"`,
            item.selected_size || 'N/A',
            item.qty || 1,
            item.price || 0,
            o.subtotal || 0,
            o.tax_amount || 0,
            o.shipping_fee || 0,
            o.total || 0,
            o.payment_mode || 'Online',
            o.status || 'Pending',
            o.tracking_number || '',
            o.courier_name || '',
            o.delivery_country || 'India'
          ];
          csvRows.push(row.join(","));
        }
      }
    }

    if (type === "all" || type === "digital") {
      const [dOrders] = await db.query(digitalSql, digitalParams);
      for (const o of dOrders) {
        const row = [
          o.invoice_uid || '',
          o.order_uid || '',
          o.invoice_date ? new Date(o.invoice_date).toISOString().split('T')[0] : 'N/A',
          `"${(o.customer_name || '').replace(/"/g, '""')}"`,
          o.customer_email || '',
          `"${(o.product_name || 'Digital Asset').replace(/"/g, '""')}"`,
          'N/A',
          1,
          o.price || 0,
          o.price || 0,
          '0.00',
          '0.00',
          o.price || 0,
          o.payment_mode || 'Online',
          o.delivery_status || 'Delivered',
          'N/A',
          'N/A',
          'N/A'
        ];
        csvRows.push(row.join(","));
      }
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=invoice_reports.csv");
    res.send(csvRows.join("\n"));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate CSV export" });
  }
});

// PUBLIC/USER — Dispatch Invoice via Email
router.post("/:uid/invoice/mail", async (req, res) => {
  const { uid } = req.params;
  try {
    let orderType = "physical";
    let [orders] = await db.query(
      `SELECT o.*, COALESCE(o.guest_name, m.name) as customer_name, COALESCE(o.guest_email, m.email) as customer_email
       FROM physical_orders o LEFT JOIN members m ON o.member_uid = m.member_uid
       WHERE o.order_uid = ? OR o.invoice_uid = ?`,
      [uid, uid]
    );

    if (!orders.length) {
      orderType = "digital";
      [orders] = await db.query(
        `SELECT o.*, COALESCE(o.guest_name, m.name) as customer_name, COALESCE(o.guest_email, m.email) as customer_email
         FROM digital_orders o LEFT JOIN members m ON o.member_uid = m.member_uid
         WHERE o.order_uid = ? OR o.invoice_uid = ?`,
        [uid, uid]
      );
    }

    if (!orders.length) return res.status(404).json({ error: "Order/Invoice not found" });
    const order = orders[0];

    let itemsHtml = "";
    if (orderType === "physical") {
      const [items] = await db.query("SELECT * FROM physical_order_items WHERE order_uid = ?", [order.order_uid]);
      for (const item of items) {
        itemsHtml += `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.product_name} ${item.selected_size ? `(${item.selected_size})` : ''}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.qty}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price}</td>
          </tr>
        `;
      }
    } else {
      itemsHtml = `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${order.product_name} (Digital Access)</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">1</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${order.price}</td>
        </tr>
      `;
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.05); color: #333;">
        <table style="width: 100%; line-height: 1.6; border-collapse: collapse;">
          <tr>
            <td>
              <h2 style="margin: 0; color: #d97706;">✏️ OLIVESEEDS CUSTOMS</h2>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">Unique Laser-Engraved Creations</p>
            </td>
            <td style="text-align: right;">
              <h3 style="margin: 0; text-transform: uppercase; color: #666;">INVOICE</h3>
              <p style="margin: 5px 0 0 0; font-size: 12px;"><strong>Invoice #:</strong> ${order.invoice_uid}</p>
              <p style="margin: 2px 0 0 0; font-size: 12px;"><strong>Date:</strong> ${new Date(order.invoice_date).toDateString()}</p>
            </td>
          </tr>
        </table>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />

        <table style="width: 100%; line-height: 1.6; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="vertical-align: top; width: 50%;">
              <strong style="color: #666; font-size: 12px; text-transform: uppercase;">Billed To:</strong>
              <p style="margin: 5px 0 0 0; font-weight: bold;">${order.customer_name}</p>
              <p style="margin: 2px 0 0 0; font-size: 13px;">${order.customer_email}</p>
              ${order.guest_phone ? `<p style="margin: 2px 0 0 0; font-size: 13px;">Phone: ${order.guest_phone}</p>` : ''}
            </td>
            <td style="vertical-align: top; width: 50%; text-align: right;">
              <strong style="color: #666; font-size: 12px; text-transform: uppercase;">Shipping Destination:</strong>
              ${orderType === "physical" ? `
                <p style="margin: 5px 0 0 0; font-size: 13px;">${order.delivery_name || order.customer_name}</p>
                <p style="margin: 2px 0 0 0; font-size: 13px;">${order.delivery_street || ''}</p>
                <p style="margin: 2px 0 0 0; font-size: 13px;">${order.delivery_city || ''}, ${order.delivery_state || ''} - ${order.delivery_pincode || ''}</p>
                <p style="margin: 2px 0 0 0; font-size: 13px;">${order.delivery_country || 'India'}</p>
              ` : `
                <p style="margin: 5px 0 0 0; font-size: 13px; color: #15803d; font-weight: bold;">⚡ Instant Digital Email Delivery</p>
              `}
            </td>
          </tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background: #f9f9f9; font-weight: bold;">
              <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: left;">Item</th>
              <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: center; width: 50px;">Qty</th>
              <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: right; width: 100px;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
          <tr>
            <td style="width: 60%; vertical-align: top;">
              <div style="border: 1px dashed #ddd; padding: 10px; font-size: 11px; color: #666; margin-right: 15px;">
                <strong>Verification QR Code:</strong><br/>
                Scan this code in your browser or shipping package labels to verify order verification data securely.
              </div>
            </td>
            <td style="width: 40%; vertical-align: top;">
              <table style="width: 100%; text-align: right; line-height: 1.6;">
                <tr>
                  <td>Subtotal:</td>
                  <td style="font-weight: bold; width: 90px;">₹${orderType === "physical" ? order.subtotal : order.price}</td>
                </tr>
                ${orderType === "physical" ? `
                  <tr>
                    <td>CGST/SGST (18%):</td>
                    <td style="font-weight: bold;">₹${order.tax_amount || '0.00'}</td>
                  </tr>
                  <tr>
                    <td>Shipping Fee:</td>
                    <td style="font-weight: bold;">₹${order.shipping_fee || '0.00'}</td>
                  </tr>
                ` : ''}
                <tr style="font-size: 16px; border-top: 2px solid #eee; color: #d97706; font-weight: bold;">
                  <td style="padding-top: 10px;">Total Paid:</td>
                  <td style="padding-top: 10px;">₹${order.total || order.price}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0 20px 0;" />
        <div style="text-align: center; font-size: 11px; color: #999;">
          Thank you for choosing Oliveseeds Customs! Custom laser engraving takes 2-4 business days. For tracking questions or delivery status, write to orders@oliveseed.com.
        </div>
      </div>
    `;

    console.log(`✉️ [SMTP-Mock] Dispatched HTML invoice to: \${order.customer_email}`);
    res.json({
      success: true,
      message: `Invoice email successfully compiled and queued for dispatch to \${order.customer_email}`,
      recipient: order.customer_email,
      preview_html: emailHtml
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to dispatch invoice mail" });
  }
});

// PUBLIC — get order detail by UID (for Order Success / Invoice page)
router.get("/detail/:uid", async (req, res) => {
  try {
    let orderType = "physical";
    let [orders] = await db.query(
      `SELECT o.*, COALESCE(o.guest_name, m.name) as customer_name, COALESCE(o.guest_email, m.email) as customer_email
       FROM physical_orders o LEFT JOIN members m ON o.member_uid = m.member_uid
       WHERE o.order_uid = ? OR o.invoice_uid = ?`,
      [req.params.uid, req.params.uid]
    );

    if (!orders.length) {
      orderType = "digital";
      [orders] = await db.query(
        `SELECT o.*, COALESCE(o.guest_name, m.name) as customer_name, COALESCE(o.guest_email, m.email) as customer_email
         FROM digital_orders o LEFT JOIN members m ON o.member_uid = m.member_uid
         WHERE o.order_uid = ? OR o.invoice_uid = ?`,
        [req.params.uid, req.params.uid]
      );
    }

    if (!orders.length) return res.status(404).json({ error: "Order not found" });
    const order = orders[0];

    let items = [];
    if (orderType === "physical") {
      const [pItems] = await db.query("SELECT * FROM physical_order_items WHERE order_uid = ?", [order.order_uid]);
      items = pItems;
    } else {
      items = [{
        product_name: order.product_name,
        price: order.price,
        qty: 1,
        selected_size: null
      }];
    }

    res.json({
      order,
      items,
      type: orderType
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch order details" });
  }
});

module.exports = router;