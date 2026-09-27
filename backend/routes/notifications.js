const router = require("express").Router();
const db = require("../db");
const jwt = require("jsonwebtoken");
const { verifyMember, verifyAdmin, optionalMember } = require("../middleware/auth");

// Helper to detect if an IP is private/local
function isPrivateIp(ip) {
  if (!ip || ip === "unknown") return true;
  if (ip === "::1" || ip === "127.0.0.1" || ip === "localhost") return true;
  if (ip.startsWith("10.") || ip.startsWith("192.168.")) return true;
  if (ip.startsWith("172.")) {
    const parts = ip.split(".");
    const second = parseInt(parts[1], 10);
    if (second >= 16 && second <= 31) return true;
  }
  return false;
}

// GET /api/notifications/unread-count - Optional auth (returns 0 if guest/invalid token)
router.get("/unread-count", optionalMember, async (req, res) => {
  if (!req.member || !req.member.id) {
    return res.json({ count: 0 });
  }
  try {
    const userId = req.member.id;
    const [rows] = await db.query(
      "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = false",
      [userId]
    );
    res.json({ count: rows[0]?.count || 0 });
  } catch (err) {
    console.error("Error fetching unread count:", err);
    res.json({ count: 0 });
  }
});

// GET /api/notifications - Auth required for members
router.get("/", verifyMember, async (req, res) => {
  try {
    const userId = req.member.id;
    const [rows] = await db.query(
      `SELECT id, title, message, type, is_read, created_at, related_order_id, related_product_id 
       FROM notifications 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// GET /api/notifications/admin/all - Admin auth
router.get("/admin/all", verifyAdmin, async (req, res) => {
  const { type, unread_only, limit = 50 } = req.query;
  try {
    let query = "SELECT * FROM notifications";
    const params = [];
    const conditions = [];

    if (type && type !== "all") {
      conditions.push("type = ?");
      params.push(type);
    }
    if (unread_only === "true" || unread_only === "1") {
      conditions.push("is_read = false");
    }
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY created_at DESC LIMIT ?";
    params.push(parseInt(limit, 10) || 50);

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching admin notifications:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// PUT /api/notifications/admin/read-all - Admin auth
router.put("/admin/read-all", verifyAdmin, async (req, res) => {
  try {
    const [result] = await db.query("UPDATE notifications SET is_read = true WHERE is_read = false");
    res.json({ success: true, count: result.affectedRows });
  } catch (err) {
    console.error("Error marking all read by admin:", err);
    res.status(500).json({ error: "Failed to mark all as read" });
  }
});

// PUT /api/notifications/admin/:id/read - Admin auth
router.put("/admin/:id/read", verifyAdmin, async (req, res) => {
  try {
    await db.query("UPDATE notifications SET is_read = true WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Error marking single notification read by admin:", err);
    res.status(500).json({ error: "Failed to mark as read" });
  }
});

// DELETE /api/notifications/admin/clear-all - Admin auth (clear all alerts or by type)
router.delete("/admin/clear-all", verifyAdmin, async (req, res) => {
  const { type, scope } = req.query;
  try {
    let result;
    if (type === "visitor") {
      [result] = await db.query("DELETE FROM notifications WHERE type = 'visitor'");
    } else if (scope === "read") {
      [result] = await db.query("DELETE FROM notifications WHERE is_read = true");
    } else if (scope === "visitors_only") {
      [result] = await db.query("DELETE FROM notifications WHERE type = 'visitor'");
    } else {
      // Clear all system & visitor alerts (user_id = 0 or general system alerts)
      [result] = await db.query("DELETE FROM notifications WHERE user_id = 0 OR user_id IS NULL OR type = 'visitor'");
    }
    res.json({ success: true, count: result.affectedRows, message: "Alerts cleared successfully" });
  } catch (err) {
    console.error("Error clearing notifications:", err);
    res.status(500).json({ error: "Failed to clear notifications" });
  }
});

// DELETE /api/notifications/admin/:id - Admin auth
router.delete("/admin/:id", verifyAdmin, async (req, res) => {
  try {
    await db.query("DELETE FROM notifications WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting notification by admin:", err);
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

// PUT /api/notifications/read-all - Supports both Admin and Member tokens cleanly
router.put("/read-all", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === "admin") {
      // Admin: mark all notifications as read!
      await db.query("UPDATE notifications SET is_read = true WHERE is_read = false");
      return res.json({ success: true, role: "admin" });
    } else {
      // Member: mark member's notifications as read
      const userId = decoded.member_uid || decoded.member_id || decoded.id;
      await db.query("UPDATE notifications SET is_read = true WHERE user_id = ?", [userId]);
      return res.json({ success: true, role: "member" });
    }
  } catch (err) {
    console.error("Error marking all read:", err.message);
    res.status(401).json({ error: "Invalid token" });
  }
});

// PUT /api/notifications/:id/read - Member auth
router.put("/:id/read", verifyMember, async (req, res) => {
  try {
    const userId = req.member.id;
    await db.query(
      "UPDATE notifications SET is_read = true WHERE id = ? AND user_id = ?",
      [req.params.id, userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error marking notification read:", err);
    res.status(500).json({ error: "Failed to mark notification read" });
  }
});

// DELETE /api/notifications/:id - Member auth
router.delete("/:id", verifyMember, async (req, res) => {
  try {
    const userId = req.member.id;
    await db.query(
      "DELETE FROM notifications WHERE id = ? AND user_id = ?",
      [req.params.id, userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting notification:", err);
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

// POST /api/admin/notifications/broadcast - Admin auth required
const handleBroadcast = async (req, res) => {
  try {
    const { title, message, type } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: "Title and message are required" });
    }

    const nType = type || "new_arrival";
    const [members] = await db.query("SELECT id FROM members");
    let sentTo = 0;

    if (members.length > 0) {
      const values = members.map(m => [m.id, title, message, nType]);
      await db.query(
        "INSERT INTO notifications (user_id, title, message, type) VALUES ?",
        [values]
      );
      sentTo = members.length;
    }

    await db.query(
      "INSERT INTO broadcast_notifications (title, message, type, sent_count) VALUES (?, ?, ?, ?)",
      [title, message, nType, sentTo]
    );

    res.json({ success: true, sent_to: sentTo });
  } catch (err) {
    console.error("Error sending broadcast:", err);
    res.status(500).json({ error: "Failed to send broadcast" });
  }
};

// GET /api/admin/notifications/broadcasts - Admin auth required
const handleGetBroadcasts = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM broadcast_notifications ORDER BY created_at DESC LIMIT 20"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching broadcasts:", err);
    res.status(500).json({ error: "Failed to fetch broadcasts" });
  }
};

router.post("/broadcast", verifyAdmin, handleBroadcast);
router.get("/broadcasts", verifyAdmin, handleGetBroadcasts);
router.post("/admin/broadcast", verifyAdmin, handleBroadcast);
router.get("/admin/broadcasts", verifyAdmin, handleGetBroadcasts);

// PUBLIC — website visitor ping with rich City, County/State, Country geolocation
router.post("/visitor", async (req, res) => {
  const { page, city, region, country, country_code } = req.body || {};

  // Extract clean client IP
  let rawIp = req.headers["cf-connecting-ip"] ||
              req.headers["x-real-ip"] ||
              (req.headers["x-forwarded-for"] ? req.headers["x-forwarded-for"].split(",")[0].trim() : null) ||
              req.socket.remoteAddress || "unknown";

  if (rawIp.startsWith("::ffff:")) {
    rawIp = rawIp.replace("::ffff:", "");
  }
  const ip = rawIp.trim();

  // Cloudflare headers fallback
  const cfCity = req.headers["cf-ipcity"];
  const cfRegion = req.headers["cf-region"] || req.headers["cf-region-code"];
  const cfCountry = req.headers["cf-ipcountry"];

  let resolvedCity = city || cfCity || "";
  let resolvedRegion = region || cfRegion || "";
  let resolvedCountry = country || cfCountry || "";

  // If location is missing and client IP is public, run a rapid server-side geo lookup (1.2s max)
  if ((!resolvedCity || !resolvedCountry) && !isPrivateIp(ip)) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,countryCode`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData && geoData.status === "success") {
          resolvedCity = resolvedCity || geoData.city || "";
          resolvedRegion = resolvedRegion || geoData.regionName || "";
          resolvedCountry = resolvedCountry || geoData.country || "";
        }
      }
    } catch (e) {
      // Safe fallback on lookup failure
    }
  }

  // Format clean location string (e.g., "Chennai, Tamil Nadu, India")
  const locationParts = [resolvedCity, resolvedRegion, resolvedCountry].filter(Boolean);
  const locationStr = locationParts.length > 0
    ? locationParts.join(", ")
    : (isPrivateIp(ip) ? "Local Network / Admin" : `IP ${ip}`);

  const titleLocation = resolvedCity
    ? `${resolvedCity}, ${resolvedCountry || ""}`.trim().replace(/,\s*$/, "")
    : (resolvedCountry || (isPrivateIp(ip) ? "Local Visitor" : "Online Visitor"));

  const notifTitle = `New Visitor: ${titleLocation}`;
  const notifMessage = `Visitor from ${locationStr} viewed ${page || "/"} (${ip})`;

  try {
    // 30-minute throttle for the same IP to prevent flooding alerts
    const [recent] = await db.query(
      `SELECT id FROM notifications 
       WHERE type = 'visitor' 
         AND (message LIKE ? OR message LIKE ?)
         AND created_at > DATE_SUB(NOW(), INTERVAL 30 MINUTE)
       LIMIT 1`,
      [`%${ip}%`, `%${locationStr}%`]
    );

    if (!recent.length) {
      await db.query(
        `INSERT INTO notifications (user_id, type, title, message, link, is_read) 
         VALUES (0, 'visitor', ?, ?, ?, false)`,
        [notifTitle, notifMessage, page || "/"]
      );

      // Auto-purge visitor notifications older than 14 days to keep DB neat & fast
      await db.query(
        "DELETE FROM notifications WHERE type = 'visitor' AND created_at < DATE_SUB(NOW(), INTERVAL 14 DAY)"
      ).catch(() => {});
    }

    // Also update visitor_logs table for the Visitor Tracking analytics page
    await db.query(
      `INSERT INTO visitor_logs 
       (ip, page, geo_city, geo_region, geo_country, visited_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [ip, page || "/", resolvedCity || null, resolvedRegion || null, resolvedCountry || null]
    ).catch(() => {});

    res.json({ ok: true, location: locationStr });
  } catch (err) {
    console.error("Visitor notification error:", err);
    res.json({ ok: true });
  }
});

module.exports = router;