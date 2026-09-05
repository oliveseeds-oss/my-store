const router = require("express").Router();
const db = require("../db");
const { verifyMember, verifyAdmin, optionalMember } = require("../middleware/auth");

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

// GET /api/notifications - Auth required
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

// PUT /api/notifications/read-all - Auth required
router.put("/read-all", verifyMember, async (req, res) => {
  try {
    const userId = req.member.id;
    await db.query(
      "UPDATE notifications SET is_read = true WHERE user_id = ?",
      [userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error marking all read:", err);
    res.status(500).json({ error: "Failed to mark all as read" });
  }
});

// PUT /api/notifications/:id/read - Auth required
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

// DELETE /api/notifications/:id - Auth required
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

// Legacy/Admin direct routes support
router.post("/admin/broadcast", verifyAdmin, handleBroadcast);
router.get("/admin/broadcasts", verifyAdmin, handleGetBroadcasts);

// PUBLIC — website visitor ping
router.post("/visitor", async (req, res) => {
  const { page } = req.body;
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  try {
    const [recent] = await db.query(
      `SELECT id FROM notifications WHERE type='visitor' AND message LIKE ?
       AND created_at > DATE_SUB(NOW(), INTERVAL 30 MINUTE) LIMIT 1`,
      [`%${ip}%`]
    );
    if (!recent.length) {
      await db.query(
        "INSERT INTO notifications (user_id, type, title, message) VALUES (0, ?, ?, ?)",
        ["visitor", "New website visitor", `Visitor from ${ip} on page: ${page || "/"}`]
      );
    }
    res.json({ ok: true });
  } catch {
    res.json({ ok: true });
  }
});

module.exports = router;