const router = require("express").Router();
const db = require("../db");
const mailer = require("../mailer");
const { verifyAdmin } = require("../middleware/auth");

// POST /api/bulk-inquiry — submit inquiry (public, no auth needed)
router.post("/", async (req, res) => {
  const { full_name, email, phone, company_name, product_interest, quantity, message } = req.body;

  if (!full_name || !email) {
    return res.status(400).json({ error: "Full Name and Email are required" });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO bulk_inquiries (full_name, email, phone, company_name, product_interest, quantity, message, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'new')`,
      [
        full_name,
        email,
        phone || null,
        company_name || null,
        product_interest || null,
        quantity ? parseInt(quantity) : null,
        message || null
      ]
    );

    // Send email notification to oss.oliveseeds@gmail.com using existing mailer
    try {
      if (mailer && typeof mailer.sendMail === "function") {
        await mailer.sendMail({
          to: "oss.oliveseeds@gmail.com",
          subject: `📦 New Bulk Order Inquiry from ${full_name}`,
          text: `You have received a new bulk order inquiry!

Name: ${full_name}
Email: ${email}
Phone: ${phone || "N/A"}
Company: ${company_name || "N/A"}
Quantity: ${quantity || "N/A"}
Products Interested: ${product_interest || "N/A"}

Message:
${message || "No message provided"}`
        });
      }
    } catch (mailErr) {
      console.error("Non-fatal: Failed to send bulk inquiry notification email:", mailErr);
    }

    res.json({
      id: result.insertId,
      message: "Thank you! We will contact you within 24 hours."
    });
  } catch (err) {
    console.error("Failed to submit bulk inquiry:", err);
    res.status(500).json({ error: "Failed to submit bulk inquiry" });
  }
});

// Admin: GET /api/admin/bulk-inquiries — list all inquiries
router.get("/admin/all", verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM bulk_inquiries ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error("Failed to fetch bulk inquiries:", err);
    res.status(500).json({ error: "Failed to fetch bulk inquiries" });
  }
});

// Admin: PUT /api/admin/bulk-inquiries/:id/status — update status
router.put("/admin/:id/status", verifyAdmin, async (req, res) => {
  const { status } = req.body;
  if (!["new", "contacted", "closed"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  try {
    await db.query("UPDATE bulk_inquiries SET status = ? WHERE id = ?", [status, req.params.id]);
    res.json({ message: "Inquiry status updated successfully" });
  } catch (err) {
    console.error("Failed to update inquiry status:", err);
    res.status(500).json({ error: "Failed to update inquiry status" });
  }
});

module.exports = router;
