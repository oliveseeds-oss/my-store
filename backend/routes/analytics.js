const router = require("express").Router();
const db = require("../db");
const { verifyAdmin } = require("../middleware/auth");

// ─── COMPLETE DETAILED PERIOD REPORT ───────────────────────────────────────
router.get("/reports", verifyAdmin, async (req, res) => {
  const { period = "monthly" } = req.query;
  let interval = "INTERVAL 30 DAY";
  let labelFormat = "DATE_FORMAT(o.invoice_date, '%Y-%m-%d')";

  if (period === "daily") {
    interval = "INTERVAL 1 DAY";
    labelFormat = "DATE_FORMAT(o.invoice_date, '%H:00')";
  } else if (period === "weekly") {
    interval = "INTERVAL 7 DAY";
    labelFormat = "DATE_FORMAT(o.invoice_date, '%a %d')";
  } else if (period === "yearly") {
    interval = "INTERVAL 365 DAY";
    labelFormat = "DATE_FORMAT(o.invoice_date, '%b %Y')";
  }

  try {
    // 1. Core sales summary (total, taxes, shipping, count)
    const [salesSummary] = await db.query(
      `SELECT COALESCE(SUM(total), 0) as gross_sales,
              COALESCE(SUM(subtotal), 0) as net_sales,
              COALESCE(SUM(tax_amount), 0) as total_tax,
              COALESCE(SUM(shipping_fee), 0) as total_shipping,
              COUNT(*) as total_orders,
              COALESCE(AVG(total), 0) as aov
       FROM (
         SELECT invoice_date, total, subtotal, tax_amount, shipping_fee FROM physical_orders
         UNION ALL
         SELECT invoice_date, total, subtotal, tax_amount, 0 as shipping_fee FROM digital_orders
       ) o
       WHERE o.invoice_date >= DATE_SUB(NOW(), ${interval})`
    );

    const summary = salesSummary[0];
    summary.cgst = summary.total_tax / 2;
    summary.sgst = summary.total_tax / 2;

    // 2. Timeline sales for charts
    const [timeline] = await db.query(
      `SELECT ${labelFormat} as label,
              COALESCE(SUM(total), 0) as revenue,
              COUNT(*) as orders
       FROM (
         SELECT invoice_date, total FROM physical_orders
         UNION ALL
         SELECT invoice_date, total FROM digital_orders
       ) o
       WHERE o.invoice_date >= DATE_SUB(NOW(), ${interval})
       GROUP BY label
       ORDER BY MIN(o.invoice_date)`
    );

    // 3. Physical vs Digital splits
    const [splits] = await db.query(
      `SELECT type,
              COUNT(*) as count,
              COALESCE(SUM(total), 0) as revenue
       FROM (
         SELECT 'physical' as type, total, invoice_date FROM physical_orders
         UNION ALL
         SELECT 'digital' as type, total, invoice_date FROM digital_orders
       ) o
       WHERE o.invoice_date >= DATE_SUB(NOW(), ${interval})
       GROUP BY type`
    );

    // 4. Category splits
    const [categories] = await db.query(
      `SELECT COALESCE(c.name, 'Uncategorized') as category_name,
              SUM(item.qty) as units_sold,
              COALESCE(SUM(item.price * item.qty), 0) as revenue
       FROM (
         SELECT i.product_uid, i.qty, i.price, o.invoice_date, 'physical' as product_type 
         FROM physical_order_items i 
         JOIN physical_orders o ON i.order_uid = o.order_uid
         
         UNION ALL
         
         SELECT i.product_uid, i.qty, i.price, o.invoice_date, 'digital' as product_type 
         FROM digital_order_items i 
         JOIN digital_orders o ON i.order_uid = o.order_uid
       ) item
       LEFT JOIN products p ON item.product_uid = p.product_uid AND item.product_type = 'physical'
       LEFT JOIN digital_products dp ON item.product_uid = dp.product_uid AND item.product_type = 'digital'
       LEFT JOIN categories c ON c.id = COALESCE(p.category_id, dp.category_id)
       WHERE item.invoice_date >= DATE_SUB(NOW(), ${interval})
       GROUP BY category_name
       ORDER BY revenue DESC`
    );

    // 5. Traffic & Conversion rate
    const [traffic] = await db.query(
      `SELECT COUNT(DISTINCT session_id) as total_sessions,
              COUNT(*) as pageviews
       FROM visitor_logs
       WHERE visited_at >= DATE_SUB(NOW(), ${interval})`
    );

    const trafficStats = traffic[0] || { total_sessions: 0, pageviews: 0 };
    const sessions = trafficStats.total_sessions || 1;
    const conversionRate = ((summary.total_orders / sessions) * 100).toFixed(2);

    res.json({
      summary,
      timeline,
      splits,
      categories,
      traffic: {
        ...trafficStats,
        conversion_rate: conversionRate
      }
    });

  } catch (error) {
    console.error("Analytical reports failed:", error);
    res.status(500).json({ error: "Failed to compile analytical reports" });
  }
});

// ─── REVENUE ANALYTICS ─────────────────────────────────────────────────────
router.get("/revenue", verifyAdmin, async (req, res) => {
  const { period = "30d", group_by = "day" } = req.query;
  const days = period === "90d" ? 90 : period === "7d" ? 7 : period === "1y" ? 365 : 30;

  const groupSql = group_by === "week"
    ? "YEARWEEK(created_at)"
    : group_by === "month"
    ? "DATE_FORMAT(created_at, '%Y-%m')"
    : "DATE(created_at)";

  const labelSql = group_by === "week"
    ? "MIN(DATE(created_at))"
    : group_by === "month"
    ? "DATE_FORMAT(created_at, '%b %Y')"
    : "DATE(created_at)";

  try {
    const [revenue] = await db.query(
      `SELECT ${labelSql} as label,
              SUM(total) as revenue,
              COUNT(*) as orders,
              AVG(total) as avg_order_value
       FROM (
         SELECT invoice_date as created_at, total FROM physical_orders
         UNION ALL
         SELECT invoice_date as created_at, total FROM digital_orders
       ) as orders
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY ${groupSql}
       ORDER BY MIN(created_at)`,
      [days]
    );

    const [totals] = await db.query(
      `SELECT SUM(total) as total_revenue,
              COUNT(*) as total_orders,
              AVG(total) as avg_order_value,
              SUM(shipping_fee) as total_shipping
       FROM (
         SELECT invoice_date as created_at, total, shipping_fee FROM physical_orders
         UNION ALL
         SELECT invoice_date as created_at, total, 0 as shipping_fee FROM digital_orders
       ) as orders 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [days]
    );

    // Compare to previous period
    const [prev] = await db.query(
      `SELECT SUM(total) as revenue, COUNT(*) as orders
       FROM (
         SELECT invoice_date as created_at, total FROM physical_orders
         UNION ALL
         SELECT invoice_date as created_at, total FROM digital_orders
       ) as orders
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
         AND created_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [days * 2, days]
    );

    const currRevenue = totals[0]?.total_revenue || 0;
    const prevRevenue = prev[0]?.revenue || 1;
    const revenueGrowth = ((currRevenue - prevRevenue) / prevRevenue * 100).toFixed(1);

    res.json({
      chart: revenue,
      totals: totals[0] || { total_revenue: 0, total_orders: 0, avg_order_value: 0, total_shipping: 0 },
      growth: { revenue: revenueGrowth, period: `vs previous ${days} days` },
    });
  } catch (error) {
    console.error("Revenue analytics failed:", error);
    res.status(500).json({ error: "Failed to load revenue analytics" });
  }
});

// ─── TOP PRODUCTS ──────────────────────────────────────────────────────────
router.get("/top-products", verifyAdmin, async (req, res) => {
  const { period = "30d", limit = 10 } = req.query;
  const days = period === "90d" ? 90 : period === "7d" ? 7 : 30;

  try {
    const [physical] = await db.query(
      `SELECT oi.product_name, oi.product_uid as product_id,
              SUM(oi.qty) as units_sold,
              SUM(oi.price * oi.qty) as revenue,
              COUNT(DISTINCT oi.order_uid) as orders
       FROM physical_order_items oi
       JOIN physical_orders o ON oi.order_uid = o.order_uid
       WHERE o.invoice_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY oi.product_name, oi.product_uid
       ORDER BY revenue DESC LIMIT ?`,
      [days, parseInt(limit)]
    );

    const [digital] = await db.query(
      `SELECT oi.product_name, oi.product_uid as digital_product_id,
              SUM(oi.qty) as units_sold,
              SUM(oi.price * oi.qty) as revenue,
              COUNT(DISTINCT oi.order_uid) as orders
       FROM digital_order_items oi
       JOIN digital_orders o ON oi.order_uid = o.order_uid
       WHERE o.invoice_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY oi.product_name, oi.product_uid
       ORDER BY revenue DESC LIMIT ?`,
      [days, parseInt(limit)]
    );

    res.json({ physical, digital });
  } catch (error) {
    console.error("Top products analytics failed:", error);
    res.status(500).json({ error: "Failed to load top products" });
  }
});

// ─── TRAFFIC ANALYTICS ────────────────────────────────────────────────────
router.get("/traffic", verifyAdmin, async (req, res) => {
  const { period = "30d" } = req.query;
  const days = period === "90d" ? 90 : period === "7d" ? 7 : 30;

  try {
    const [daily] = await db.query(
      `SELECT DATE(visited_at) as date,
              COUNT(*) as pageviews,
              COUNT(DISTINCT session_id) as sessions,
              COUNT(DISTINCT ip) as unique_visitors
       FROM visitor_logs
       WHERE visited_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY DATE(visited_at) ORDER BY date`,
      [days]
    );

    const [totals] = await db.query(
      `SELECT COUNT(*) as total_pageviews,
              COUNT(DISTINCT session_id) as total_sessions,
              COUNT(DISTINCT ip) as unique_visitors
       FROM visitor_logs WHERE visited_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [days]
    );

    res.json({ chart: daily, totals: totals[0] || { total_pageviews: 0, total_sessions: 0, unique_visitors: 0 } });
  } catch (error) {
    console.error("Traffic analytics failed:", error);
    res.status(500).json({ error: "Failed to load traffic analytics" });
  }
});

// ─── MEMBER ANALYTICS ─────────────────────────────────────────────────────
router.get("/members", verifyAdmin, async (req, res) => {
  try {
    const [registration] = await db.query(
      `SELECT DATE(created_at) as date, COUNT(*) as new_members
       FROM members
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at) ORDER BY date`
    );

    const [topSpenders] = await db.query(
      `SELECT m.name, m.email, m.member_uid,
              COUNT(o.order_uid) as orders,
              SUM(o.total) as total_spent
       FROM members m
       JOIN (
         SELECT order_uid, member_uid, total FROM physical_orders
         UNION ALL
         SELECT order_uid, member_uid, total FROM digital_orders
       ) o ON m.member_uid = o.member_uid
       GROUP BY m.id ORDER BY total_spent DESC LIMIT 10`
    );

    const [totals] = await db.query(
      `SELECT COUNT(*) as total,
              SUM(CASE WHEN status='Active' THEN 1 ELSE 0 END) as active,
              SUM(CASE WHEN status='Blocked' THEN 1 ELSE 0 END) as blocked,
              SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as new_this_month
       FROM members`
    );

    res.json({ registration, top_spenders: topSpenders, totals: totals[0] || { total: 0, active: 0, blocked: 0, new_this_month: 0 } });
  } catch (error) {
    console.error("Member analytics failed:", error);
    res.status(500).json({ error: "Failed to load member analytics" });
  }
});

// ─── FULL REPORT EXPORT ────────────────────────────────────────────────────
router.get("/export", verifyAdmin, async (req, res) => {
  const { type = "orders", period = "30d" } = req.query;
  const days = parseInt(period) || 30;

  let data = [];

  try {
    if (type === "orders") {
      const [rows] = await db.query(
        `SELECT o.id, o.created_at, o.guest_name, o.guest_email, o.guest_phone,
                o.total, o.shipping_fee, o.status, o.address_line,
                o.products
         FROM (
           SELECT po.order_uid as id, po.invoice_date as created_at, po.guest_name, po.guest_email, po.guest_phone,
                  po.total, po.shipping_fee, po.status, po.delivery_street as address_line,
                  GROUP_CONCAT(pi.product_name SEPARATOR ', ') as products
           FROM physical_orders po
           LEFT JOIN physical_order_items pi ON po.order_uid = pi.order_uid
           WHERE po.invoice_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
           GROUP BY po.id
           
           UNION ALL
           
           SELECT do.order_uid as id, do.invoice_date as created_at, do.guest_name, do.guest_email, '' as guest_phone,
                  do.total, 0 as shipping_fee, do.status, '' as address_line,
                  GROUP_CONCAT(di.product_name SEPARATOR ', ') as products
           FROM digital_orders do
           LEFT JOIN digital_order_items di ON do.order_uid = di.order_uid
           WHERE do.invoice_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
           GROUP BY do.id
         ) o
         ORDER BY o.created_at DESC`,
        [days, days]
      ).catch(() => [[]]);
      data = rows || [];
    } else if (type === "products") {
      const [rows] = await db.query(
        `SELECT product_name, SUM(qty) as units, SUM(price*qty) as revenue, type
         FROM (
           SELECT pi.product_name, pi.qty, pi.price, 'physical' as type, po.invoice_date
           FROM physical_order_items pi
           JOIN physical_orders po ON pi.order_uid = po.order_uid
           
           UNION ALL
           
           SELECT di.product_name, di.qty, di.price, 'digital' as type, do.invoice_date
           FROM digital_order_items di
           JOIN digital_orders do ON di.order_uid = do.order_uid
         ) as all_items
         WHERE invoice_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
         GROUP BY product_name, type
         ORDER BY revenue DESC`,
        [days]
      ).catch(() => [[]]);
      data = rows || [];
    } else if (type === "members") {
      const [rows] = await db.query(
        `SELECT m.member_uid, m.name, m.email, m.phone, m.status, m.created_at,
                COUNT(o.order_uid) as total_orders, COALESCE(SUM(o.total),0) as total_spent
         FROM members m
         LEFT JOIN (
           SELECT order_uid, member_uid, total FROM physical_orders
           UNION ALL
           SELECT order_uid, member_uid, total FROM digital_orders
         ) o ON m.member_uid = o.member_uid
         GROUP BY m.id ORDER BY total_spent DESC`
      ).catch(() => [[]]);
      data = rows || [];
    }

    if (req.query.format === "csv") {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="export_${type}_${period}.csv"`);
      if (!data.length) return res.send("No data");
      const headers = Object.keys(data[0]).join(",");
      const rowsCsv = data.map(row => Object.values(row).map(val => `"${String(val ?? "").replace(/"/g, '""')}"`).join(","));
      return res.send([headers, ...rowsCsv].join("\n"));
    }

    res.json({ type, period: `${days} days`, count: data.length, data });
  } catch (error) {
    console.error("Export report failed:", error);
    res.status(500).json({ error: "Failed to compile report export" });
  }
});

// ─── INVENTORY ANALYTICS ──────────────────────────────────────────────────
router.get("/inventory", verifyAdmin, async (req, res) => {
  try {
    const [lowStock] = await db.query(
      "SELECT id, name, stock, price, product_uid FROM products WHERE stock <= 10 AND is_active=TRUE ORDER BY stock"
    );
    const [outOfStock] = await db.query(
      "SELECT id, name, product_uid FROM products WHERE stock = 0 AND is_active=TRUE"
    );
    const [totalProducts] = await db.query(
      "SELECT COUNT(*) as total, SUM(stock) as total_units, AVG(price) as avg_price FROM products WHERE is_active=TRUE"
    );

    res.json({
      low_stock: lowStock,
      out_of_stock: outOfStock,
      totals: totalProducts[0] || { total: 0, total_units: 0, avg_price: 0 },
    });
  } catch (error) {
    console.error("Inventory analytics failed:", error);
    res.status(500).json({ error: "Failed to load inventory analytics" });
  }
});

module.exports = router;