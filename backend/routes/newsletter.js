const router = require("express").Router();
const db = require("../db");
const { verifyAdmin } = require("../middleware/auth");

// POST /api/newsletter/subscribe — save email to DB, check for duplicate
router.post("/subscribe", async (req, res) => {
  const { email } = req.body;

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ error: "A valid email address is required" });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const [existing] = await db.query(
      "SELECT id, is_active FROM newsletter_subscribers WHERE email = ?",
      [cleanEmail]
    );

    if (existing.length > 0) {
      if (!existing[0].is_active) {
        await db.query("UPDATE newsletter_subscribers SET is_active = true WHERE id = ?", [existing[0].id]);
        return res.json({ message: "You are subscribed!" });
      }
      return res.status(400).json({ error: "You are already subscribed." });
    }

    await db.query(
      "INSERT INTO newsletter_subscribers (email, is_active) VALUES (?, true)",
      [cleanEmail]
    );

    res.json({ message: "You are subscribed!" });
  } catch (err) {
    console.error("Newsletter subscription error:", err);
    res.status(500).json({ error: "Failed to subscribe" });
  }
});

// Admin: GET /api/admin/newsletter — list all subscribers
router.get("/admin/all", verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Failed to fetch newsletter subscribers:", err);
    res.status(500).json({ error: "Failed to fetch subscribers" });
  }
});

// Admin: GET /api/admin/newsletter/export — download as CSV
router.get("/admin/export", verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT email, is_active, subscribed_at FROM newsletter_subscribers ORDER BY subscribed_at DESC"
    );

    let csvContent = "Email,Status,Subscribed At\n";
    rows.forEach((r) => {
      const status = r.is_active ? "Active" : "Unsubscribed";
      const date = new Date(r.subscribed_at).toISOString();
      csvContent += `"${r.email}","${status}","${date}"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="newsletter_subscribers.csv"');
    res.status(200).send(csvContent);
  } catch (err) {
    console.error("Failed to export newsletter subscribers:", err);
    res.status(500).json({ error: "Failed to export CSV" });
  }
});

// Admin: DELETE /api/admin/newsletter/:id — unsubscribe
router.delete("/admin/:id", verifyAdmin, async (req, res) => {
  try {
    await db.query("UPDATE newsletter_subscribers SET is_active = false WHERE id = ?", [req.params.id]);
    res.json({ message: "Subscriber unsubscribed successfully" });
  } catch (err) {
    console.error("Failed to unsubscribe user:", err);
    res.status(500).json({ error: "Failed to unsubscribe" });
  }
});

module.exports = router;
