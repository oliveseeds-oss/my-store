const router = require("express").Router();
const db = require("../db");
const { verifyAdmin, verifyMember } = require("../middleware/auth");

// ─── MEMBER — GET MY NOTIFICATIONS ────────────────────────────────────────
router.get("/member/my", verifyMember, async (req, res) => {
  const memberId = req.member.member_id;
  const [rows] = await db.query(
    "SELECT * FROM member_notifications WHERE member_id=? ORDER BY created_at DESC LIMIT 50",
    [memberId]
  );
  res.json(rows);
});

// ─── MEMBER — MARK READ ────────────────────────────────────────────────────
router.put("/member/:id/read", verifyMember, async (req, res) => {
  const memberId = req.member.member_id;
  await db.query(
    "UPDATE member_notifications SET is_read=1 WHERE id=? AND member_id=?",
    [req.params.id, memberId]
  );
  res.json({ ok: true });
});

// ─── MEMBER — MARK ALL READ ────────────────────────────────────────────────
router.put("/member/read-all", verifyMember, async (req, res) => {
  const memberId = req.member.member_id;
  await db.query("UPDATE member_notifications SET is_read=1 WHERE member_id=?", [memberId]);
  res.json({ ok: true });
});

// ─── MEMBER — UNREAD COUNT ─────────────────────────────────────────────────
router.get("/member/unread-count", verifyMember, async (req, res) => {
  const memberId = req.member.member_id;
  const [rows] = await db.query(
    "SELECT COUNT(*) as count FROM member_notifications WHERE member_id=? AND is_read=0",
    [memberId]
  );
  res.json({ count: rows[0].count });
});

// ─── ADMIN — SEND NOTIFICATION TO MEMBER ──────────────────────────────────
router.post("/admin/send", verifyAdmin, async (req, res) => {
  const { member_id, type, title, message } = req.body;
  if (!title || !message) return res.status(400).json({ error: "Title and message required" });

  if (member_id === "all") {
    // Broadcast to all members
    const [members] = await db.query("SELECT id FROM members WHERE status='Active'");
    for (const m of members) {
      await db.query(
        "INSERT INTO member_notifications (member_id, type, title, message) VALUES (?,?,?,?)",
        [m.id, type || "admin", title, message]
      );
    }
    res.json({ message: `Sent to ${members.length} members` });
  } else {
    await db.query(
      "INSERT INTO member_notifications (member_id, type, title, message) VALUES (?,?,?,?)",
      [member_id, type || "admin", title, message]
    );
    res.json({ message: "Notification sent" });
  }
});

// ─── ADMIN — GET ALL MEMBER NOTIFICATIONS ─────────────────────────────────
router.get("/admin/all", verifyAdmin, async (req, res) => {
  const [rows] = await db.query(
    `SELECT mn.*, m.name as member_name, m.email as member_email
     FROM member_notifications mn
     JOIN members m ON mn.member_id = m.id
     ORDER BY mn.created_at DESC LIMIT 100`
  );
  res.json(rows);
});

module.exports = router;