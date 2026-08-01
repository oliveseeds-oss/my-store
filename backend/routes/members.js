const router = require("express").Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateMemberUid } = require("../utils/generateUid");
const { verifyAdmin, verifyMember } = require("../middleware/auth");
const { createRateLimiter } = require("../middleware/rateLimiter");

const loginLimiter = createRateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
const forgotPasswordLimiter = createRateLimiter(3, 15 * 60 * 1000); // 3 attempts per 15 minutes

// PUBLIC — register
router.post("/register", async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "Name, email and password are required" });

  const hash = await bcrypt.hash(password, 10);
  const member_uid = await generateMemberUid();

  try {
    // Insert with status = 'Pending Verification'
    await db.query(
      "INSERT INTO members (member_uid, name, email, password, phone, status) VALUES (?,?,?,?,?, 'Pending Verification')",
      [member_uid, name, email, hash, phone || null]
    );
    // Create empty profile row
    await db.query(
      "INSERT INTO member_profiles (member_uid, full_name, email, phone) VALUES (?,?,?,?)",
      [member_uid, name, email, phone || null]
    );
    
    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await db.query(
      "INSERT INTO otp_verifications (email, otp_code, purpose, expires_at) VALUES (?, ?, 'registration', DATE_ADD(NOW(), INTERVAL 15 MINUTE))",
      [email, otp]
    );

    // Print beautiful OTP box to console
    console.log(`
===================================================
🔒 OTP SECURITY SERVICE - ACTION REQUIRED
===================================================
Type:       Account Registration Verification
Email:      ${email}
OTP Code:   ${otp}
Expires In: 15 minutes
===================================================
    `);

    // Notify admin
    await db.query(
      "INSERT INTO notifications (type, title, message, link) VALUES (?,?,?,?)",
      ["new_member", "New member registered (Pending OTP)", `${name} (${email}) created account - pending OTP`, "/members"]
    );
    
    res.json({ message: "Registered successfully. OTP sent.", member_uid, dev_otp: otp });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY")
      return res.status(400).json({ error: "Email already registered" });
    res.status(500).json({ error: "Registration failed" });
  }
});

// PUBLIC — verify OTP
router.post("/verify-otp", async (req, res) => {
  const { email, otp, purpose } = req.body;
  if (!email || !otp || !purpose) {
    return res.status(400).json({ error: "Email, OTP code and purpose are required" });
  }

  try {
    const [rows] = await db.query(
      `SELECT * FROM otp_verifications 
       WHERE email = ? AND otp_code = ? AND purpose = ? AND is_verified = FALSE AND expires_at > NOW() 
       ORDER BY created_at DESC LIMIT 1`,
      [email, otp, purpose]
    );

    if (!rows.length) {
      return res.status(400).json({ error: "Invalid or expired OTP code" });
    }

    const otpRecord = rows[0];

    // Mark OTP as verified
    await db.query("UPDATE otp_verifications SET is_verified = TRUE WHERE id = ?", [otpRecord.id]);

    if (purpose === "registration") {
      // Activate the account
      await db.query("UPDATE members SET status = 'Active' WHERE email = ?", [email]);
      // Update notifications
      await db.query(
        "INSERT INTO notifications (type, title, message, link) VALUES (?,?,?,?)",
        ["new_member", "Member verified account", `Member account activated: ${email}`, "/members"]
      );
    }

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("OTP verification failed:", error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
});

// PUBLIC — resend OTP
router.post("/resend-otp", async (req, res) => {
  const { email, purpose } = req.body;
  if (!email || !purpose) {
    return res.status(400).json({ error: "Email and purpose are required" });
  }

  try {
    const [members] = await db.query("SELECT * FROM members WHERE email = ?", [email]);
    if (!members.length) {
      return res.status(404).json({ error: "Account not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await db.query(
      "INSERT INTO otp_verifications (email, otp_code, purpose, expires_at) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))",
      [email, otp, purpose]
    );

    console.log(`
===================================================
🔒 OTP SECURITY SERVICE - ACTION REQUIRED (RESEND)
===================================================
Type:       OTP Resend (${purpose})
Email:      ${email}
OTP Code:   ${otp}
Expires In: 15 minutes
===================================================
    `);

    res.json({ message: "A new OTP code has been sent", dev_otp: otp });
  } catch (error) {
    console.error("Resend OTP failed:", error);
    res.status(500).json({ error: "Failed to resend OTP" });
  }
});

// PUBLIC — forgot password
router.post("/forgot-password", forgotPasswordLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const [members] = await db.query("SELECT * FROM members WHERE email = ?", [email]);
    if (!members.length) {
      return res.status(404).json({ error: "Account with this email does not exist" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await db.query(
      "INSERT INTO otp_verifications (email, otp_code, purpose, expires_at) VALUES (?, ?, 'password_reset', DATE_ADD(NOW(), INTERVAL 15 MINUTE))",
      [email, otp]
    );

    console.log(`
===================================================
🔒 OTP SECURITY SERVICE - ACTION REQUIRED
===================================================
Type:       Password Reset Request
Email:      ${email}
OTP Code:   ${otp}
Expires In: 15 minutes
===================================================
    `);

    res.json({ message: "Password reset OTP sent", dev_otp: otp });
  } catch (error) {
    console.error("Forgot password failed:", error);
    res.status(500).json({ error: "Failed to initiate password reset" });
  }
});

// PUBLIC — reset password
router.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ error: "Email and new password are required" });
  }

  try {
    // Verify that there is a successfully verified password_reset OTP for this email
    const [rows] = await db.query(
      `SELECT * FROM otp_verifications 
       WHERE email = ? AND purpose = 'password_reset' AND is_verified = TRUE AND expires_at > NOW() 
       ORDER BY created_at DESC LIMIT 1`,
      [email]
    );

    if (!rows.length) {
      return res.status(400).json({ error: "Unauthorized password reset. Please verify OTP first." });
    }

    const otpRecord = rows[0];

    // Reset password
    const hash = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE members SET password = ? WHERE email = ?", [hash, email]);

    // Mark the reset session OTP as fully completed/expired so it cannot be used again
    await db.query("UPDATE otp_verifications SET expires_at = NOW() WHERE id = ?", [otpRecord.id]);

    res.json({ message: "Password updated successfully! You can now log in." });
  } catch (error) {
    console.error("Reset password failed:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// PUBLIC — login
router.post("/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await db.query("SELECT * FROM members WHERE email = ?", [email]);
  if (!rows.length) return res.status(404).json({ error: "Email not found" });
  const member = rows[0];
  
  if (member.status === "Blocked")
    return res.status(403).json({ error: "Your account has been blocked. Contact support." });
    
  if (member.status === "Pending Verification") {
    return res.status(403).json({ 
      error: "Please verify your account using the OTP sent to your email.",
      status: "Pending Verification" 
    });
  }

  const match = await bcrypt.compare(password, member.password);
  if (!match) return res.status(401).json({ error: "Wrong password" });
  const token = jwt.sign(
    { id: member.id, member_uid: member.member_uid, email: member.email },
    process.env.JWT_SECRET, { expiresIn: "7d" }
  );
  res.json({
    token,
    member: { id: member.id, member_uid: member.member_uid, name: member.name, email: member.email }
  });
});

// PUBLIC — Google SSO Auto-registration/Login
router.post("/google-sso", async (req, res) => {
  const { email, name, google_id } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: "Google email and name are required" });
  }

  try {
    // 1. Check if member already exists
    let [rows] = await db.query("SELECT * FROM members WHERE email = ?", [email]);
    let member;

    if (!rows.length) {
      // 2. Auto-Register new Google OAuth user
      const member_uid = await generateMemberUid();
      const randomPassword = Math.random().toString(36).slice(-12) + "OAuth!9";
      const hash = await bcrypt.hash(randomPassword, 10);

      const [insertResult] = await db.query(
        "INSERT INTO members (member_uid, name, email, password, phone, status) VALUES (?,?,?,?,?, 'Active')",
        [member_uid, name, email, hash, null]
      );

      // Create empty profile row
      await db.query(
        "INSERT INTO member_profiles (member_uid, full_name, email, phone) VALUES (?,?,?,?)",
        [member_uid, name, email, null]
      );

      // Notify admin
      await db.query(
        "INSERT INTO notifications (type, title, message, link) VALUES (?,?,?,?)",
        ["new_member", "New member via Google SSO", `${name} (${email}) joined via Google Single Sign-On`, "/members"]
      );

      member = { id: insertResult.insertId, member_uid, name, email };
    } else {
      member = rows[0];
      if (member.status === "Blocked") {
        return res.status(403).json({ error: "Your account has been blocked. Contact support." });
      }
    }

    // 3. Issue Token
    const token = jwt.sign(
      { id: member.id, member_uid: member.member_uid, email: member.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      member: { id: member.id, member_uid: member.member_uid, name: member.name, email: member.email }
    });
  } catch (error) {
    console.error("Google SSO SSO Error:", error);
    res.status(500).json({ error: "Google SSO authentication failed" });
  }
});

// MEMBER — get full profile (members + member_profiles joined)
router.get("/profile", verifyMember, async (req, res) => {
  const [rows] = await db.query(
    `SELECT m.member_uid, m.name, m.email, m.phone, m.status, m.created_at,
            p.full_name, p.street_address, p.apt_suite, p.city, p.state,
            p.country, p.pincode
     FROM members m
     LEFT JOIN member_profiles p ON m.member_uid = p.member_uid
     WHERE m.member_uid = ?`,
    [req.member.member_uid]
  );
  if (!rows.length) return res.status(404).json({ error: "Not found" });
  res.json(rows[0]);
});

// MEMBER — update profile
router.put("/profile", verifyMember, async (req, res) => {
  const { full_name, street_address, apt_suite, city, state, country, pincode, phone, email } = req.body;
  await db.query(
    `UPDATE member_profiles SET full_name=?, street_address=?, apt_suite=?,
     city=?, state=?, country=?, pincode=?, phone=?, email=? WHERE member_uid=?`,
    [full_name, street_address, apt_suite, city, state, country, pincode, phone, email,
      req.member.member_uid]
  );
  if (phone) await db.query("UPDATE members SET phone=? WHERE member_uid=?",
    [phone, req.member.member_uid]);
  res.json({ message: "Profile updated" });
});

// ADMIN — all members with profile
router.get("/admin/all", verifyAdmin, async (req, res) => {
  const [rows] = await db.query(
    `SELECT m.member_uid as member_id, m.name as full_name, m.email, m.phone, m.status, m.created_at,
            p.city, p.state, p.country,
            (SELECT COUNT(*) FROM physical_orders WHERE member_uid = m.member_uid) as phys_orders,
            (SELECT COUNT(*) FROM digital_orders WHERE member_uid = m.member_uid) as digi_orders
     FROM members m
     LEFT JOIN member_profiles p ON m.member_uid = p.member_uid
     ORDER BY m.created_at DESC`
  );
  res.json(rows);
});

// ADMIN — single member detail (comprehensive audit logs)
router.get("/admin/:uid", verifyAdmin, async (req, res) => {
  const uid = req.params.uid;
  try {
    const [memberRows] = await db.query(
      `SELECT m.*, p.full_name, p.street_address, p.apt_suite,
              p.city, p.state, p.country, p.pincode
       FROM members m LEFT JOIN member_profiles p ON m.member_uid = p.member_uid
       WHERE m.member_uid = ?`, [uid]
    );
    if (!memberRows.length) return res.status(404).json({ error: "Not found" });
    const m = memberRows[0];

    // Fetch physical orders with aggregated product names and tracking
    const [physOrders] = await db.query(
      `SELECT o.*, 
              GROUP_CONCAT(i.product_name SEPARATOR ', ') as product_names,
              SUM(i.qty) as total_qty
       FROM physical_orders o
       LEFT JOIN physical_order_items i ON o.order_uid = i.order_uid
       WHERE o.member_uid = ?
       GROUP BY o.id
       ORDER BY o.invoice_date DESC`, [uid]
    );

    // Fetch digital orders with aggregated product names
    const [digiOrders] = await db.query(
      `SELECT o.*, 
              GROUP_CONCAT(i.product_name SEPARATOR ', ') as product_names,
              SUM(i.qty) as total_qty
       FROM digital_orders o
       LEFT JOIN digital_order_items i ON o.order_uid = i.order_uid
       WHERE o.member_uid = ?
       GROUP BY o.id
       ORDER BY o.invoice_date DESC`, [uid]
    );

    res.json({
      member: {
        member_id: m.member_uid,
        full_name: m.full_name || m.name,
        email: m.email,
        phone: m.phone,
        street: m.street_address,
        apt_suite: m.apt_suite,
        city: m.city,
        state: m.state,
        country: m.country,
        pincode: m.pincode,
        status: m.status,
        created_at: m.created_at
      },
      stats: {
        env_orders: physOrders.length,
        env_spend: physOrders.reduce((sum, o) => sum + Number(o.total || 0), 0),
        dig_orders: digiOrders.length,
        dig_spend: digiOrders.reduce((sum, o) => sum + Number(o.total || 0), 0)
      },
      engraved_orders: physOrders.map(o => ({
        order_id: o.order_uid,
        delivery_status: o.status,
        product_name: o.product_names || "Custom Physical Product",
        quantity: o.total_qty || 1,
        invoice_no: o.invoice_uid,
        total_amount: o.total,
        tracking_number: o.tracking_number,
        created_at: o.invoice_date
      })),
      digital_orders: digiOrders.map(o => ({
        order_id: o.order_uid,
        payment_status: o.payment_status || "Paid",
        product_name: o.product_names || "Digital Download Product",
        quantity: o.total_qty || 1,
        invoice_no: o.invoice_uid,
        total_amount: o.total,
        download_count: o.download_count || 0,
        max_downloads: 5,
        created_at: o.invoice_date
      }))
    });
  } catch (error) {
    console.error("Member detail fetch failed:", error);
    res.status(500).json({ error: "Failed to fetch member details" });
  }
});

// ADMIN — toggle status
router.put("/admin/:uid/status", verifyAdmin, async (req, res) => {
  await db.query("UPDATE members SET status=? WHERE member_uid=?",
    [req.body.status, req.params.uid]);
  res.json({ message: "Status updated" });
});

module.exports = router;