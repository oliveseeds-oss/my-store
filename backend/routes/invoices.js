const router = require("express").Router();
const db = require("../db");
const { verifyAdmin, verifyMember } = require("../middleware/auth");

// GET /api/invoices/:order_id
router.get("/:order_id", async (req, res) => {
  const { order_id } = req.params;

  try {
    // 1. Search in physical orders first
    let [orders] = await db.query(
      `SELECT o.*, m.name as member_name, m.email as member_email, m.phone as member_phone
       FROM physical_orders o
       LEFT JOIN members m ON o.member_uid = m.member_uid
       WHERE o.order_uid = ? OR o.id = ?`,
      [order_id, order_id]
    );

    let type = "physical";
    let order = orders[0];
    let items = [];

    if (!order) {
      // 2. Search in digital orders
      [orders] = await db.query(
        `SELECT o.*, m.name as member_name, m.email as member_email, m.phone as member_phone
         FROM digital_orders o
         LEFT JOIN members m ON o.member_uid = m.member_uid
         WHERE o.order_uid = ? OR o.id = ?`,
        [order_id, order_id]
      );
      if (!orders.length) {
        return res.status(404).json({ error: "Order/Invoice not found" });
      }
      order = orders[0];
      type = "digital";
    }

    // Fetch items
    if (type === "physical") {
      [items] = await db.query(
        "SELECT * FROM physical_order_items WHERE order_uid = ?",
        [order.order_uid]
      );
    } else {
      [items] = await db.query(
        "SELECT * FROM digital_order_items WHERE order_uid = ?",
        [order.order_uid]
      );
    }

    // Fetch settings for store info
    const [settings] = await db.query("SELECT * FROM settings LIMIT 1");
    const store = settings.length ? settings[0] : {
      site_name: "MyStore",
      site_email: "support@mystore.com",
      phone: "+91 00000 00000",
      address: "123, Store Street, City - 600001",
    };

    const subtotal = parseFloat(order.subtotal || 0);
    const shipping = parseFloat(order.shipping_fee || 0);
    const taxAmount = parseFloat(order.tax_amount || 0);
    const cgst = taxAmount / 2;
    const sgst = taxAmount / 2;
    const grandTotal = parseFloat(order.total || 0);

    // Shipment information if physical
    let shipmentObj = null;
    if (type === "physical" && order.tracking_number) {
      shipmentObj = {
        tracking_number: order.tracking_number,
        partner: "Standard Shipping",
        status: order.status,
        estimated_delivery: null
      };
    }

    // Customer address string
    let customerAddress = "";
    if (type === "physical") {
      customerAddress = [
        order.delivery_street,
        order.delivery_apt,
        order.delivery_city,
        order.delivery_state,
        order.delivery_country,
        order.delivery_pincode
      ].filter(Boolean).join(", ");
    }

    res.json({
      invoice_number: order.invoice_uid || `INV-${new Date(order.invoice_date).getFullYear()}-${order.id}`,
      order_id: order.order_uid,
      invoice_date: order.invoice_date,
      due_date: null,
      status: order.status,
      store: {
        name: store.site_name || "MyStore",
        email: store.site_email || "support@mystore.com",
        phone: store.phone || "",
        address: store.address || "",
        gstin: "29AABCU9603R1ZX",
      },
      customer: {
        name: order.member_name || order.guest_name || "Guest",
        email: order.member_email || order.guest_email || "",
        phone: order.member_phone || order.guest_phone || "",
        address: customerAddress,
      },
      items: items.map((i) => ({
        product_name: i.product_name,
        qty: i.qty,
        unit_price: parseFloat(i.price || 0),
        total: parseFloat(i.price || 0) * i.qty,
        type: type,
        hsn_code: type === "digital" ? "9983" : "7117",
      })),
      pricing: {
        subtotal,
        shipping_fee: shipping,
        tax_rate_percent: 18,
        tax_amount: taxAmount,
        cgst,
        sgst,
        grand_total: grandTotal,
      },
      shipment: shipmentObj,
      payment_method: order.payment_mode || "Online Payment",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load invoice" });
  }
});

// ADMIN — List all invoices combined
router.get("/admin/all", verifyAdmin, async (req, res) => {
  const { search } = req.query;
  try {
    let sqlPhys = `
      SELECT o.id, o.invoice_date as created_at, COALESCE(o.guest_name, m.name) as guest_name, 
             COALESCE(o.guest_email, m.email) as guest_email, o.total, o.status,
             o.invoice_uid as invoice_number, 'physical' as type
      FROM physical_orders o
      LEFT JOIN members m ON o.member_uid = m.member_uid
    `;
    let sqlDigi = `
      SELECT o.id, o.invoice_date as created_at, COALESCE(o.guest_name, m.name) as guest_name, 
             COALESCE(o.guest_email, m.email) as guest_email, o.total, o.status,
             o.invoice_uid as invoice_number, 'digital' as type
      FROM digital_orders o
      LEFT JOIN members m ON o.member_uid = m.member_uid
    `;

    const [phys] = await db.query(sqlPhys);
    const [digi] = await db.query(sqlDigi);

    let all = [...phys, ...digi];

    if (search) {
      const q = search.toLowerCase();
      all = all.filter(o => 
        (o.guest_name && o.guest_name.toLowerCase().includes(q)) ||
        (o.guest_email && o.guest_email.toLowerCase().includes(q)) ||
        (o.invoice_number && o.invoice_number.toLowerCase().includes(q))
      );
    }

    all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(all);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

// MEMBER — My invoices combined
router.get("/member/my", verifyMember, async (req, res) => {
  const member_uid = req.member.member_uid;
  try {
    const [phys] = await db.query(
      `SELECT o.id, o.invoice_date as created_at, o.total, o.status,
              o.invoice_uid as invoice_number, 'physical' as type
       FROM physical_orders o WHERE o.member_uid = ?`,
      [member_uid]
    );
    const [digi] = await db.query(
      `SELECT o.id, o.invoice_date as created_at, o.total, o.status,
              o.invoice_uid as invoice_number, 'digital' as type
       FROM digital_orders o WHERE o.member_uid = ?`,
      [member_uid]
    );

    const all = [...phys, ...digi];
    all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(all);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch member invoices" });
  }
});

module.exports = router;