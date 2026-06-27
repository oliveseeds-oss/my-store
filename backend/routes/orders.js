const router = require("express").Router();
const db = require("../db");
const { generateOrderUid } = require('../utils/generateUid');
const { verifyAdmin, verifyMember } = require("../middleware/auth");


// UNIFIED ORDERS PLACEMENT ROUTE
router.post("/", async (req, res) => {
  const {
    member_id, guest_name, guest_email, guest_phone,
    items, address_line, shipping_fee
  } = req.body;

  try {
    if (!items || !items.length) {
      return res.status(400).json({ error: "Cart is empty" });
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
      if (item.type === "physical" || item.product_id !== null) {
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
      } else {
        // Resolve digital product_uid from id if missing
        let product_uid = item.product_uid;
        if (!product_uid && item.digital_product_id) {
          const [products] = await db.query(
            "SELECT product_uid FROM digital_products WHERE id = ? OR product_uid = ?",
            [item.digital_product_id, item.digital_product_id]
          );
          if (products.length) product_uid = products[0].product_uid;
        }
        digitalItems.push({
          ...item,
          product_uid: product_uid || `DPD-TEMP-${Math.floor(Math.random() * 900000)}`
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

      // Parse address line
      const address = address_line || "";
      const parts = address.split(",").map(p => p.trim());
      const delivery_street = parts[0] || address || "Street Address";
      const delivery_apt = parts[1] || "";
      const delivery_city = parts[2] || "City";
      const delivery_state = parts[3] || "State";
      const delivery_country = parts[4] || "India";
      const delivery_pincode = parts[5] || "000000";

      await db.query(
        `INSERT INTO physical_orders
         (order_uid, invoice_uid, member_uid, guest_name, guest_email, guest_phone,
          delivery_name, delivery_street, delivery_apt, delivery_city, delivery_state,
          delivery_country, delivery_pincode, subtotal, tax_amount, shipping_fee, total,
          currency_code, currency_rate, payment_mode, transaction_id, payment_status, status)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          order_uid, invoice_uid, member_uid, guest_name || "Guest", guest_email || "", guest_phone || "",
          guest_name || "Guest", delivery_street, delivery_apt, delivery_city, delivery_state,
          delivery_country, delivery_pincode, subtotal, tax_amount, ship_fee, total,
          "INR", 1.0, "COD", null, "Pending", "Processing"
        ]
      );

      for (const item of physicalItems) {
        await db.query(
          `INSERT INTO physical_order_items (order_uid, product_uid, product_name, selected_size, price, qty, tax_rate)
           VALUES (?,?,?,?,?,?,?)`,
          [order_uid, item.product_uid, item.product_name, item.selected_size || null, item.price, item.qty, 18]
        );
        // reduce stock
        await db.query(
          "UPDATE products SET stock = GREATEST(0, stock - ?) WHERE product_uid = ?",
          [item.qty, item.product_uid]
        );
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
          subtotal, tax_amount, total, "INR", 1.0,
          "Online", null, "Pending", "Completed"
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
    await db.query(
      `INSERT INTO physical_order_items (order_uid, product_uid, product_name, selected_size, price, qty, tax_rate)
       VALUES (?,?,?,?,?,?,?)`,
      [order_uid, item.product_uid, item.product_name, item.selected_size || null,
        item.price, item.qty, item.tax_rate || 18]
    );
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
    SELECT o.order_uid as order_id, o.invoice_uid as invoice_no, o.member_uid as member_id, o.invoice_date as created_at, o.payment_mode, o.total as total_amount, o.status as delivery_status, o.tracking_number, 
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
    const [orders] = await db.query("SELECT id, order_uid, member_uid FROM physical_orders WHERE order_uid = ?", [req.params.uid]);
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

    res.json({ message: "Status updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update order status" });
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

module.exports = router;