const router = require("express").Router();
const db = require("../db");
const { verifyAdmin } = require("../middleware/auth");

// ADMIN — get all (unread first)
router.get("/", verifyAdmin, async (req, res) => {
    const [rows] = await db.query(
        "SELECT * FROM notifications ORDER BY is_read ASC, created_at DESC LIMIT 50"
    );
    res.json(rows);
});

// ADMIN — mark all read
router.put("/read-all", verifyAdmin, async (req, res) => {
    await db.query("UPDATE notifications SET is_read=TRUE");
    res.json({ message: "All marked read" });
});

// ADMIN — mark one read
router.put("/:id/read", verifyAdmin, async (req, res) => {
    await db.query("UPDATE notifications SET is_read=TRUE WHERE id=?", [req.params.id]);
    res.json({ message: "Marked read" });
});

// PUBLIC — website visitor ping (creates notification max once per 30 mins per IP)
router.post("/visitor", async (req, res) => {
    const { page } = req.body;
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    // Limit to 1 notification per IP per 30 minutes
    const [recent] = await db.query(
        `SELECT id FROM notifications WHERE type='visitor' AND message LIKE ?
     AND created_at > DATE_SUB(NOW(), INTERVAL 30 MINUTE) LIMIT 1`,
        [`%${ip}%`]
    );
    if (!recent.length) {
        await db.query(
            "INSERT INTO notifications (type, title, message) VALUES (?,?,?)",
            ["visitor", "New website visitor", `Visitor from ${ip} on page: ${page || "/"}`]
        );
    }
    res.json({ ok: true });
});

module.exports = router;