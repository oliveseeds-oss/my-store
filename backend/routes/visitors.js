const router = require("express").Router();
const db = require("../db");
const { verifyAdmin } = require("../middleware/auth");

// ─── LOG VISITOR (PUBLIC — called from frontend) ───────────────────────────
// POST /api/visitors/track
router.post("/track", async (req, res) => {
  const {
    page, referrer, session_id,
    geo_country, geo_city, geo_region,
    device_type, browser, os,
    screen_width, screen_height,
    utm_source, utm_medium, utm_campaign,
  } = req.body;

  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "unknown";
  const userAgent = req.headers["user-agent"] || "";

  try {
    await db.query(
      `INSERT INTO visitor_logs
       (ip, session_id, page, referrer, geo_country, geo_city, geo_region,
        device_type, browser, os, screen_width, screen_height,
        utm_source, utm_medium, utm_campaign, user_agent, visited_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW())`,
      [ip, session_id || null, page || "/", referrer || null,
       geo_country || null, geo_city || null, geo_region || null,
       device_type || "Desktop", browser || null, os || null,
       screen_width || null, screen_height || null,
       utm_source || null, utm_medium || null, utm_campaign || null,
       userAgent]
    );
    res.json({ ok: true });
  } catch {
    res.json({ ok: false }); // silently fail
  }
});

// ─── VISITOR DASHBOARD (Admin) ─────────────────────────────────────────────
// GET /api/visitors/admin/dashboard
router.get("/admin/dashboard", verifyAdmin, async (req, res) => {
  const { period = "7d" } = req.query;
  const days = period === "30d" ? 30 : period === "1d" ? 1 : 7;

  const [totalVisits] = await db.query(
    `SELECT COUNT(*) as total, COUNT(DISTINCT session_id) as unique_visitors,
            COUNT(DISTINCT ip) as unique_ips
     FROM visitor_logs WHERE visited_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
    [days]
  );

  const [byDay] = await db.query(
    `SELECT DATE(visited_at) as date,
            COUNT(*) as visits,
            COUNT(DISTINCT session_id) as unique_visitors
     FROM visitor_logs
     WHERE visited_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
     GROUP BY DATE(visited_at) ORDER BY date`,
    [days]
  );

  const [byPage] = await db.query(
    `SELECT page, COUNT(*) as visits
     FROM visitor_logs
     WHERE visited_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
     GROUP BY page ORDER BY visits DESC LIMIT 10`,
    [days]
  );

  const [byDevice] = await db.query(
    `SELECT device_type, COUNT(*) as count
     FROM visitor_logs
     WHERE visited_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
     GROUP BY device_type`,
    [days]
  );

  const [byBrowser] = await db.query(
    `SELECT browser, COUNT(*) as count
     FROM visitor_logs
     WHERE visited_at >= DATE_SUB(NOW(), INTERVAL ? DAY) AND browser IS NOT NULL
     GROUP BY browser ORDER BY count DESC LIMIT 8`,
    [days]
  );

  const [byCountry] = await db.query(
    `SELECT geo_country, COUNT(*) as count
     FROM visitor_logs
     WHERE visited_at >= DATE_SUB(NOW(), INTERVAL ? DAY) AND geo_country IS NOT NULL
     GROUP BY geo_country ORDER BY count DESC LIMIT 10`,
    [days]
  );

  const [byCity] = await db.query(
    `SELECT geo_city, geo_country, COUNT(*) as count
     FROM visitor_logs
     WHERE visited_at >= DATE_SUB(NOW(), INTERVAL ? DAY) AND geo_city IS NOT NULL
     GROUP BY geo_city, geo_country ORDER BY count DESC LIMIT 10`,
    [days]
  );

  const [byReferrer] = await db.query(
    `SELECT referrer, COUNT(*) as count
     FROM visitor_logs
     WHERE visited_at >= DATE_SUB(NOW(), INTERVAL ? DAY) AND referrer IS NOT NULL AND referrer != ''
     GROUP BY referrer ORDER BY count DESC LIMIT 10`,
    [days]
  );

  const [byOs] = await db.query(
    `SELECT os, COUNT(*) as count
     FROM visitor_logs
     WHERE visited_at >= DATE_SUB(NOW(), INTERVAL ? DAY) AND os IS NOT NULL
     GROUP BY os ORDER BY count DESC LIMIT 8`,
    [days]
  );

  const [recentVisitors] = await db.query(
    `SELECT ip, page, geo_country, geo_city, device_type, browser, os, visited_at
     FROM visitor_logs
     ORDER BY visited_at DESC LIMIT 20`
  );

  const [byHour] = await db.query(
    `SELECT HOUR(visited_at) as hour, COUNT(*) as count
     FROM visitor_logs
     WHERE visited_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
     GROUP BY HOUR(visited_at) ORDER BY hour`
  );

  res.json({
    summary: totalVisits[0],
    by_day: byDay,
    by_page: byPage,
    by_device: byDevice,
    by_browser: byBrowser,
    by_country: byCountry,
    by_city: byCity,
    by_referrer: byReferrer,
    by_os: byOs,
    by_hour: byHour,
    recent_visitors: recentVisitors,
    period: days,
  });
});

// ─── LIVE VISITOR COUNT (Admin) ─────────────────────────────────────────────
router.get("/admin/live", verifyAdmin, async (req, res) => {
  const [live] = await db.query(
    `SELECT COUNT(DISTINCT session_id) as active_now
     FROM visitor_logs WHERE visited_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)`
  );
  res.json(live[0]);
});

module.exports = router;