const router = require("express").Router();
const db = require("../db");
const { verifyAdmin } = require("../middleware/auth");

const SHIPPING_PARTNERS = {
  delhivery: {
    name: "Delhivery",
    trackUrl: "https://www.delhivery.com/track/package/",
  },
  shiprocket: {
    name: "Shiprocket",
    trackUrl: "https://app.shiprocket.in/tracking/",
  },
  bluedart: {
    name: "Blue Dart",
    trackUrl: "https://www.bluedart.com/tracking",
  },
  dtdc: {
    name: "DTDC",
    trackUrl: "https://www.dtdc.in/track.asp?",
  },
};

const STEPS_MAP = {
  "Processing": "Picked Up",
  "Shipped": "In Transit",
  "Delivered": "Delivered",
  "Cancelled": "Failed"
};

// Helper to fetch tracking events from Shiprocket if applicable
async function fetchTrackingEvents(trackingNumber, partner, defaultEvents, currentStatus) {
  let events = [...defaultEvents];
  let trackingStatus = currentStatus;
  const partnerInfo = SHIPPING_PARTNERS[partner] || SHIPPING_PARTNERS.delhivery;
  let trackingUrl = `${partnerInfo.trackUrl}${trackingNumber}`;
  let courierName = partnerInfo.name;

  if (partner === "shiprocket") {
    try {
      const { getShiprocketToken, request } = require("../utils/shiprocket");
      const token = await getShiprocketToken();
      const resData = await request(
        `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${trackingNumber}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (resData && resData.tracking_data && resData.tracking_data.track_status === 1) {
        const shipInfo = resData.tracking_data.shipment_track[0] || {};
        trackingStatus = shipInfo.current_status || trackingStatus;
        trackingUrl = shipInfo.tracking_url || trackingUrl;
        courierName = shipInfo.courier_name || courierName;
        if (shipInfo.scans && Array.isArray(shipInfo.scans) && shipInfo.scans.length) {
          events = shipInfo.scans.map(s => ({
            status: s.activity || s.status,
            location: s.location || "In Transit",
            event_time: s.date || s.timestamp,
            description: s.activity || ""
          }));
        }
      }
    } catch (trackErr) {
      console.error("Failed to query Shiprocket tracking API:", trackErr.message);
    }
  }

  return { events, trackingStatus, trackingUrl, courierName };
}

// POST /api/shipping/calculate
router.post("/calculate", async (req, res) => {
  const { origin_pincode, dest_pincode, weight_kg, declared_value, items } = req.body;

  if (!dest_pincode) return res.status(400).json({ error: "Destination pincode required" });

  const subtotal = items ? items.reduce((s, i) => s + i.price * i.qty, 0) : declared_value || 0;

  const destPrefix = String(dest_pincode).substring(0, 2);
  const originPrefix = String(origin_pincode || "600").substring(0, 2);

  let zone = "D";
  if (destPrefix === originPrefix) zone = "A";
  else if (Math.abs(parseInt(destPrefix) - parseInt(originPrefix)) <= 10) zone = "B";
  else if (Math.abs(parseInt(destPrefix) - parseInt(originPrefix)) <= 30) zone = "C";

  const weight = weight_kg || 0.5;
  const zoneRates = { A: 40, B: 60, C: 80, D: 100 };
  const baseRate = zoneRates[zone];
  const additionalKg = Math.max(0, weight - 0.5);
  const perKgRate = { A: 20, B: 30, C: 40, D: 50 };
  const shippingFee = Math.ceil(baseRate + additionalKg * perKgRate[zone]);

  const freeShippingThreshold = 999;
  const finalShipping = subtotal >= freeShippingThreshold ? 0 : shippingFee;

  const deliveryDays = { A: "1-2", B: "2-3", C: "3-5", D: "5-7" };

  res.json({
    origin_pincode: origin_pincode || "600001",
    dest_pincode,
    zone,
    weight_kg: weight,
    subtotal,
    shipping_fee: finalShipping,
    shipping_fee_original: shippingFee,
    free_shipping_applied: subtotal >= freeShippingThreshold,
    free_shipping_threshold: freeShippingThreshold,
    total: subtotal + finalShipping,
    estimated_delivery_days: deliveryDays[zone],
    available_partners: [
      { id: "delhivery", name: "Delhivery", rate: finalShipping, days: deliveryDays[zone] },
      { id: "shiprocket", name: "Shiprocket", rate: finalShipping + 10, days: deliveryDays[zone] },
      { id: "dtdc", name: "DTDC", rate: finalShipping + 5, days: deliveryDays[zone] },
    ],
  });
});

// POST /api/shipping/create (Admin)
router.post("/create", verifyAdmin, async (req, res) => {
  const { order_id, partner, tracking_number, notes } = req.body;

  if (!order_id || !tracking_number) {
    return res.status(400).json({ error: "Order ID and tracking number required" });
  }

  try {
    const [orders] = await db.query(
      "SELECT id, order_uid, member_uid, guest_name FROM physical_orders WHERE order_uid = ? OR id = ?",
      [order_id, order_id]
    );

    if (!orders.length) {
      return res.status(404).json({ error: "Physical order not found" });
    }

    const order = orders[0];

    await db.query(
      "UPDATE physical_orders SET status = 'Shipped', tracking_number = ?, updated_at = NOW() WHERE id = ?",
      [tracking_number, order.id]
    );

    const [existingShipment] = await db.query("SELECT id FROM shipments WHERE order_id = ?", [order.id]);
    if (existingShipment.length) {
      await db.query(
        "UPDATE shipments SET partner = ?, tracking_number = ?, updated_at = NOW() WHERE order_id = ?",
        [partner || "delhivery", tracking_number, order.id]
      );
    } else {
      await db.query(
        "INSERT INTO shipments (order_id, partner, tracking_number, status, created_at, updated_at) VALUES (?, ?, ?, 'In Transit', NOW(), NOW())",
        [order.id, partner || "delhivery", tracking_number]
      );
    }

    if (order.member_uid) {
      await db.query(
        "INSERT INTO member_notifications (member_id, type, title, message, created_at) VALUES ((SELECT id FROM members WHERE member_uid = ?), 'shipping', 'Your order has been shipped!', ?, NOW())",
        [order.member_uid, `Order #${order.order_uid} is on its way. Tracking: ${tracking_number}`]
      );
    }

    await db.query(
      "INSERT INTO notifications (type, title, message, link, created_at) VALUES ('shipping', 'Shipment Created', ?, '/orders', NOW())",
      [`Order #${order.order_uid} shipped via ${partner || 'Delhivery'}. AWB: ${tracking_number}`]
    );

    res.json({ message: "Shipment created successfully", tracking_number });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create shipment" });
  }
});

// GET /api/shipping/track/:tracking_number
router.get("/track/:tracking_number", async (req, res) => {
  const { tracking_number } = req.params;

  try {
    const [orders] = await db.query(
      `SELECT o.*, m.name as member_name, m.email as member_email
       FROM physical_orders o
       LEFT JOIN members m ON o.member_uid = m.member_uid
       WHERE o.tracking_number = ?`,
      [tracking_number]
    );

    if (!orders.length) {
      return res.status(404).json({ error: "Tracking number not found" });
    }

    const order = orders[0];
    
    // Fetch actual partner info
    const [shipmentRows] = await db.query("SELECT partner FROM shipments WHERE order_id = ?", [order.id]);
    const partner = (shipmentRows.length && shipmentRows[0].partner) || "delhivery";
    const partnerInfo = SHIPPING_PARTNERS[partner] || SHIPPING_PARTNERS.delhivery;

    let trackingStatus = STEPS_MAP[order.status] || "Picked Up";

    const customerAddress = [
      order.delivery_street,
      order.delivery_apt,
      order.delivery_city,
      order.delivery_state,
      order.delivery_country,
      order.delivery_pincode
    ].filter(Boolean).join(", ");

    const defaultEvents = [
      {
        status: "Order Placed",
        location: "Online",
        event_time: order.invoice_date,
        description: "Your order has been placed successfully."
      }
    ];

    if (order.status === "Shipped" || order.status === "Delivered") {
      defaultEvents.unshift({
        status: "Picked Up",
        location: "Warehouse",
        event_time: order.updated_at || order.invoice_date,
        description: "Package picked up by courier partner."
      });
      defaultEvents.unshift({
        status: "In Transit",
        location: "Hub",
        event_time: order.updated_at || order.invoice_date,
        description: "Package is in transit."
      });
    }

    if (order.status === "Delivered") {
      defaultEvents.unshift({
        status: "Delivered",
        location: "Destination",
        event_time: order.updated_at,
        description: "Package delivered successfully."
      });
    }

    // Load actual tracker data
    const trackingDetails = await fetchTrackingEvents(tracking_number, partner, defaultEvents, trackingStatus);

    res.json({
      tracking_number,
      partner,
      partner_name: trackingDetails.courierName,
      partner_track_url: trackingDetails.trackingUrl,
      order_id: order.order_uid,
      status: trackingDetails.trackingStatus,
      estimated_delivery: null,
      order_date: order.invoice_date,
      recipient: order.delivery_name || order.guest_name || "Guest",
      delivery_address: customerAddress,
      events: trackingDetails.events
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to track shipment" });
  }
});

// PUT /api/shipping/:id/status (Admin manual update)
router.put("/:id/status", verifyAdmin, async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  try {
    let orderStatus = "Processing";
    if (status === "In Transit" || status === "Picked Up" || status === "Out for Delivery") {
      orderStatus = "Shipped";
    } else if (status === "Delivered") {
      orderStatus = "Delivered";
    } else if (status === "Failed" || status === "Returned") {
      orderStatus = "Cancelled";
    }

    await db.query(
      "UPDATE physical_orders SET status = ?, updated_at = NOW() WHERE tracking_number = ? OR id = ?",
      [orderStatus, id, id]
    );

    res.json({ message: "Status updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update status" });
  }
});

// GET /api/shipping/admin/all (Admin)
router.get("/admin/all", verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT o.id, o.order_uid, o.tracking_number, o.status, o.total, o.delivery_name as guest_name, o.guest_email,
              CONCAT(o.delivery_street, ', ', o.delivery_city) as address_line, COALESCE(s.partner, 'delhivery') as partner, o.updated_at as created_at
       FROM physical_orders o
       LEFT JOIN shipments s ON o.id = s.order_id
       WHERE o.tracking_number IS NOT NULL
       ORDER BY o.updated_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch shipments" });
  }
});

// GET /api/shipping/order/:order_id (Public tracking by order UID/ID)
router.get("/order/:order_id", async (req, res) => {
  const { order_id } = req.params;

  try {
    const [orders] = await db.query(
      `SELECT o.*, m.name as member_name, m.email as member_email
       FROM physical_orders o
       LEFT JOIN members m ON o.member_uid = m.member_uid
       WHERE o.order_uid = ? OR o.id = ?`,
      [order_id, order_id]
    );

    if (!orders.length) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = orders[0];

    if (!order.tracking_number) {
      return res.json({ status: "Not yet shipped", order_id: order.order_uid });
    }

    const [shipmentRows] = await db.query("SELECT partner FROM shipments WHERE order_id = ?", [order.id]);
    const partner = (shipmentRows.length && shipmentRows[0].partner) || "delhivery";

    let trackingStatus = STEPS_MAP[order.status] || "Picked Up";

    const customerAddress = [
      order.delivery_street,
      order.delivery_apt,
      order.delivery_city,
      order.delivery_state,
      order.delivery_country,
      order.delivery_pincode
    ].filter(Boolean).join(", ");

    const defaultEvents = [
      {
        status: "Order Placed",
        location: "Online",
        event_time: order.invoice_date,
        description: "Your order has been placed successfully."
      }
    ];

    if (order.status === "Shipped" || order.status === "Delivered") {
      defaultEvents.unshift({
        status: "Picked Up",
        location: "Warehouse",
        event_time: order.updated_at || order.invoice_date,
        description: "Package picked up by courier partner."
      });
      defaultEvents.unshift({
        status: "In Transit",
        location: "Hub",
        event_time: order.updated_at || order.invoice_date,
        description: "Package is in transit."
      });
    }

    if (order.status === "Delivered") {
      defaultEvents.unshift({
        status: "Delivered",
        location: "Destination",
        event_time: order.updated_at,
        description: "Package delivered successfully."
      });
    }

    const trackingDetails = await fetchTrackingEvents(order.tracking_number, partner, defaultEvents, trackingStatus);

    res.json({
      tracking_number: order.tracking_number,
      partner,
      partner_name: trackingDetails.courierName,
      partner_track_url: trackingDetails.trackingUrl,
      order_id: order.order_uid,
      status: trackingDetails.trackingStatus,
      estimated_delivery: null,
      order_date: order.invoice_date,
      recipient: order.delivery_name || order.guest_name || "Guest",
      delivery_address: customerAddress,
      events: trackingDetails.events
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get shipment for order" });
  }
});

// POST /api/shipping/webhook/shiprocket
router.post("/webhook/shiprocket", async (req, res) => {
  const signature = req.headers["x-shiprocket-signature"];
  const token = process.env.SHIPROCKET_WEBHOOK_TOKEN;

  if (token && signature) {
    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha256", token);
    const hash = hmac.update(req.rawBody || JSON.stringify(req.body)).digest("hex");
    if (hash !== signature) {
      return res.status(401).json({ error: "Invalid signature" });
    }
  }

  const { awb, current_status, shipment_id, courier_name } = req.body;
  if (!awb) {
    return res.status(400).json({ error: "AWB code is required" });
  }

  try {
    let orderStatus = "Shipped";
    let shipmentStatus = "In Transit";

    const normalizedStatus = String(current_status).toLowerCase().trim();
    if (normalizedStatus.includes("deliver")) {
      orderStatus = "Delivered";
      shipmentStatus = "Delivered";
    } else if (normalizedStatus.includes("return") || normalizedStatus.includes("rto")) {
      orderStatus = "Cancelled";
      shipmentStatus = "Returned";
    } else if (normalizedStatus.includes("fail") || normalizedStatus.includes("cancel")) {
      orderStatus = "Cancelled";
      shipmentStatus = "Failed";
    } else if (normalizedStatus.includes("out for delivery")) {
      shipmentStatus = "Out for Delivery";
    } else if (normalizedStatus.includes("pick")) {
      shipmentStatus = "Picked Up";
    }

    const [shipmentRows] = await db.query(
      "SELECT id, order_id FROM shipments WHERE tracking_number = ? OR shiprocket_shipment_id = ?",
      [awb, shipment_id]
    );

    if (!shipmentRows.length) {
      return res.status(404).json({ error: "Shipment not found in local database." });
    }

    const shipment = shipmentRows[0];

    const updateParams = [shipmentStatus, current_status, courier_name];
    let updateQuery = "UPDATE shipments SET status = ?, notes = ?, courier_name = COALESCE(?, courier_name), last_tracking_update = NOW()";
    
    if (shipmentStatus === "Delivered") {
      updateQuery += ", delivered_at = NOW()";
    }
    updateQuery += " WHERE id = ?";
    updateParams.push(shipment.id);

    await db.query(updateQuery, updateParams);

    await db.query(
      "UPDATE physical_orders SET status = ?, updated_at = NOW() WHERE id = ?",
      [orderStatus, shipment.order_id]
    );

    // Save event to history events log table
    await db.query(
      "INSERT INTO shipment_events (shipment_id, status, description, event_time) VALUES (?, ?, ?, NOW())",
      [shipment.id, shipmentStatus, `Webhook update: ${current_status}`]
    );

    // Fetch order details to send automated email update to customer
    try {
      const [orders] = await db.query(
        `SELECT o.*, m.email as member_email, m.name as member_name 
         FROM physical_orders o 
         LEFT JOIN members m ON o.member_uid = m.member_uid 
         WHERE o.id = ?`,
        [shipment.order_id]
      );
      if (orders.length) {
        const order = orders[0];
        const customerEmail = order.guest_email || order.member_email;
        if (customerEmail) {
          const { sendMail } = require("../utils/mailer");
          const customerName = order.guest_name || order.member_name || "Valued Customer";
          
          let statusTitle = `Shipment Update: ${shipmentStatus}`;
          let statusDesc = `We wanted to let you know that your order #${order.order_uid} tracking status has been updated to: <strong>${shipmentStatus}</strong> (${current_status}).`;
          
          if (shipmentStatus === "Delivered") {
            statusTitle = "🎉 Package Delivered!";
            statusDesc = `Great news! Your package for Order #${order.order_uid} has been successfully delivered. Thank you for shopping with us!`;
          } else if (shipmentStatus === "Out for Delivery") {
            statusTitle = "🚚 Package Out for Delivery!";
            statusDesc = `Your package for Order #${order.order_uid} is out for delivery today. Please make sure someone is available to receive it.`;
          }
          
          await sendMail({
            to: customerEmail,
            subject: `${statusTitle} - Order #${order.order_uid}`,
            text: `Shipment update for Order #${order.order_uid}: ${shipmentStatus} (${current_status}).`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 16px; background-color: #FAF9F6; color: #0D1512;">
                <h2 style="color: #0D1512; text-align: center; font-weight: 800;">${statusTitle}</h2>
                <p>Hello ${customerName},</p>
                <p>${statusDesc}</p>
                <div style="background-color: #ffffff; border: 1px solid rgba(27,57,49,0.15); padding: 15px; border-radius: 12px; margin: 20px 0;">
                  <strong>AWB tracking code:</strong> ${awb}<br/>
                  <strong>Courier Partner:</strong> ${courier_name || 'Shiprocket Partner'}<br/>
                  <strong>Latest Status Notes:</strong> ${current_status}
                </div>
                <p style="font-size: 12px; color: #78716c; text-align: center;">You can track your parcel live on our website or directly with the courier partner.</p>
                <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;" />
                <p style="font-size: 11px; text-align: center; color: #a8a29e;">© 2026 Olive Seeds Studio. All rights reserved.</p>
              </div>
            `
          });
        }
      }
    } catch (mailErr) {
      console.error("Failed to trigger automated tracking update email:", mailErr.message);
    }

    return res.status(200).json({ success: true, message: "Status updated successfully." });
  } catch (error) {
    console.error("Webhook processing error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/shipping/tax-rates
router.get("/tax-rates", (req, res) => {
  res.json({
    rates: [
      { label: "No Tax", rate: 0, code: "NONE" },
      { label: "GST 5%", rate: 5, code: "GST_5" },
      { label: "GST 12%", rate: 12, code: "GST_12" },
      { label: "GST 18%", rate: 18, code: "GST_18" },
      { label: "GST 28%", rate: 28, code: "GST_28" },
    ],
    default: "GST_18",
  });
});

// GET /api/shipping/partners
router.get("/partners", (req, res) => {
  res.json(Object.entries(SHIPPING_PARTNERS).map(([id, p]) => ({ id, ...p })));
});

module.exports = router;