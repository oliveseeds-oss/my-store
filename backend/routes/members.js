const router = require("express").Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { generateMemberUid } = require("../utils/generateUid");
const { verifyAdmin, verifyMember } = require("../middleware/auth");
const { createRateLimiter } = require("../middleware/rateLimiter");
const { sendMail } = require("../utils/mailer");

// Run schema extensions
db.query("ALTER TABLE members ADD COLUMN failed_otp_attempts INT DEFAULT 0").catch(() => {});
db.query("ALTER TABLE members ADD COLUMN locked_until DATETIME DEFAULT NULL").catch(() => {});

const loginLimiter = createRateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
const forgotPasswordLimiter = createRateLimiter(3, 15 * 60 * 1000); // 3 attempts per 15 minutes
const otpRateLimiter = createRateLimiter(5, 60 * 60 * 1000); // Max 5 requests per hour

// PUBLIC — register
router.post("/register", otpRateLimiter, async (req, res) => {
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
    const otp = crypto.randomInt(100000, 1000000).toString();
    await db.query(
      "INSERT INTO otp_verifications (email, otp_code, purpose, expires_at) VALUES (?, ?, 'registration', DATE_ADD(NOW(), INTERVAL 10 MINUTE))",
      [email, otp]
    );

    // Send real registration OTP email
    console.log(`✉️ Sending Account registration OTP to ${email}: ${otp}`);
    await sendMail({
      to: email,
      subject: "Verify your Olive Seeds account - OTP Code",
      text: `Welcome to Olive Seeds Studio! Use verification code ${otp} to activate your account. Code is valid for 10 minutes.`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 16px; background-color: #FAF9F6; color: #0D1512;">
          <h2 style="text-align: center; color: #0D1512; font-family: sans-serif; font-weight: 800;">Verify Your Account</h2>
          <p style="font-size: 14px; line-height: 1.5;">Hello ${name},</p>
          <p style="font-size: 14px; line-height: 1.5;">Thank you for registering at <strong>Olive Seeds Studio</strong>. To activate your account and access your dashboard, please verify your email using the secure 6-digit code below:</p>
          <div style="background-color: #ffffff; padding: 20px; text-align: center; border-radius: 12px; margin: 25px 0; border: 1px solid rgba(27,57,49,0.15);">
            <span style="font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #d97706;">${otp}</span>
          </div>
          <p style="font-size: 12px; color: #78716c; text-align: center; margin-top: 20px;">This security code is active for <strong>10 minutes</strong>. If you did not register for this account, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 25px 0;" />
          <p style="font-size: 11px; text-align: center; color: #a8a29e;">© 2026 Olive Seeds Studio. All rights reserved.</p>
        </div>
      `
    });

    // Notify admin
    await db.query(
      "INSERT INTO notifications (type, title, message, link) VALUES (?,?,?,?)",
      ["new_member", "New member registered (Pending OTP)", `${name} (${email}) created account - pending OTP`, "/members"]
    );
    
    res.json({ message: "Registered successfully. OTP sent.", member_uid });
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
    // Check account lockout
    const [members] = await db.query("SELECT id, failed_otp_attempts, locked_until FROM members WHERE email = ?", [email]);
    if (members.length) {
      const member = members[0];
      if (member.locked_until && new Date(member.locked_until) > new Date()) {
        const remaining = Math.ceil((new Date(member.locked_until) - new Date()) / 1000 / 60);
        return res.status(403).json({ error: `Account is locked due to multiple failed OTP attempts. Try again in ${remaining} minutes.` });
      }
    }

    const [rows] = await db.query(
      `SELECT * FROM otp_verifications 
       WHERE email = ? AND otp_code = ? AND purpose = ? AND is_verified = FALSE AND expires_at > NOW() 
       ORDER BY created_at DESC LIMIT 1`,
      [email, otp, purpose]
    );

    if (!rows.length) {
      if (members.length) {
        const nextAttempts = members[0].failed_otp_attempts + 1;
        if (nextAttempts >= 5) {
          await db.query(
            "UPDATE members SET failed_otp_attempts = 0, locked_until = DATE_ADD(NOW(), INTERVAL 30 MINUTE) WHERE email = ?",
            [email]
          );
          return res.status(403).json({ error: "Too many incorrect attempts. Account locked for 30 minutes." });
        } else {
          await db.query("UPDATE members SET failed_otp_attempts = ? WHERE email = ?", [nextAttempts, email]);
          return res.status(400).json({ error: `Invalid or expired OTP code. ${5 - nextAttempts} attempts remaining.` });
        }
      }
      return res.status(400).json({ error: "Invalid or expired OTP code" });
    }

    const otpRecord = rows[0];

    // Mark OTP as verified & reset lock attempts
    await db.query("UPDATE otp_verifications SET is_verified = TRUE WHERE id = ?", [otpRecord.id]);
    await db.query("UPDATE members SET failed_otp_attempts = 0, locked_until = NULL WHERE email = ?", [email]);

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
router.post("/resend-otp", otpRateLimiter, async (req, res) => {
  const { email, purpose } = req.body;
  if (!email || !purpose) {
    return res.status(400).json({ error: "Email and purpose are required" });
  }

  try {
    const [members] = await db.query("SELECT * FROM members WHERE email = ?", [email]);
    if (!members.length) {
      return res.status(404).json({ error: "Account not found" });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    await db.query(
      "INSERT INTO otp_verifications (email, otp_code, purpose, expires_at) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))",
      [email, otp, purpose]
    );

    // Send real resent OTP email
    console.log(`✉️ Sending Resent OTP to ${email}: ${otp} (${purpose})`);
    await sendMail({
      to: email,
      subject: `Resent Verification Code: ${purpose === 'registration' ? 'Activate Account' : 'Password Reset'}`,
      text: `Your requested OTP code is ${otp}. It is valid for 10 minutes.`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 16px; background-color: #FAF9F6; color: #0D1512;">
          <h2 style="text-align: center; color: #0D1512; font-family: sans-serif; font-weight: 800;">Verification Code</h2>
          <p style="font-size: 14px; line-height: 1.5;">Hello,</p>
          <p style="font-size: 14px; line-height: 1.5;">You requested a new security verification code for your account. Please enter the code below to complete your action (${purpose === 'registration' ? 'Registration' : 'Password Reset'}):</p>
          <div style="background-color: #ffffff; padding: 20px; text-align: center; border-radius: 12px; margin: 25px 0; border: 1px solid rgba(27,57,49,0.15);">
            <span style="font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #d97706;">${otp}</span>
          </div>
          <p style="font-size: 12px; color: #78716c; text-align: center; margin-top: 20px;">This security code is active for <strong>10 minutes</strong>. If you did not make this request, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 25px 0;" />
          <p style="font-size: 11px; text-align: center; color: #a8a29e;">© 2026 Olive Seeds Studio. All rights reserved.</p>
        </div>
      `
    });

    res.json({ message: "A new OTP code has been sent" });
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

    const otp = crypto.randomInt(100000, 1000000).toString();
    await db.query(
      "INSERT INTO otp_verifications (email, otp_code, purpose, expires_at) VALUES (?, ?, 'password_reset', DATE_ADD(NOW(), INTERVAL 10 MINUTE))",
      [email, otp]
    );

    // Send real forgot password OTP email
    console.log(`✉️ Sending Forgot Password OTP to ${email}: ${otp}`);
    await sendMail({
      to: email,
      subject: "Reset your Olive Seeds password - OTP Code",
      text: `You requested a password reset. Use security code ${otp} to reset your password. Code is valid for 10 minutes.`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 16px; background-color: #FAF9F6; color: #0D1512;">
          <h2 style="text-align: center; color: #0D1512; font-family: sans-serif; font-weight: 800;">Password Reset Request</h2>
          <p style="font-size: 14px; line-height: 1.5;">Hello,</p>
          <p style="font-size: 14px; line-height: 1.5;">We received a request to reset the password for your account at <strong>Olive Seeds Studio</strong>. Use the security verification code below to set a new password:</p>
          <div style="background-color: #ffffff; padding: 20px; text-align: center; border-radius: 12px; margin: 25px 0; border: 1px solid rgba(27,57,49,0.15);">
            <span style="font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #d97706;">${otp}</span>
          </div>
          <p style="font-size: 12px; color: #78716c; text-align: center; margin-top: 20px;">This security code is active for <strong>10 minutes</strong>. If you did not request a password reset, you can safely ignore this email and your password will remain unchanged.</p>
          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 25px 0;" />
          <p style="font-size: 11px; text-align: center; color: #a8a29e;">© 2026 Olive Seeds Studio. All rights reserved.</p>
        </div>
      `
    });

    res.json({ message: "Password reset OTP sent" });
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
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ error: "Google ID Token is required" });
  }

  try {
    const crypto = require("crypto");
    const { request } = require("../utils/shiprocket");

    // 1. Verify token with Google's API (Priority 7)
    const googleRes = await request(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
      { method: "GET" }
    );

    if (!googleRes || googleRes.error) {
      return res.status(400).json({ error: "Invalid Google token." });
    }

    const { email, name, email_verified, aud, iss } = googleRes;

    // Validate email verification status
    if (email_verified !== "true" && email_verified !== true) {
      return res.status(400).json({ error: "Google account email is not verified." });
    }

    // Verify audience matches our Client ID (from process.env.GOOGLE_CLIENT_ID or defaults)
    const expectedClientId = process.env.GOOGLE_CLIENT_ID || "874744414734-mockclientid.apps.googleusercontent.com";
    if (aud !== expectedClientId) {
      return res.status(400).json({ error: "Audience client ID mismatch." });
    }

    // Verify Issuer
    const allowedIssuers = ["https://accounts.google.com", "accounts.google.com"];
    if (!allowedIssuers.includes(iss)) {
      return res.status(400).json({ error: "Invalid token issuer." });
    }

    // 2. Check if member already exists
    let [rows] = await db.query("SELECT * FROM members WHERE email = ?", [email]);
    let member;

    if (!rows.length) {
      // 3. Auto-Register new Google OAuth user
      const member_uid = await generateMemberUid();
      const randomPassword = crypto.randomBytes(16).toString("hex") + "OAuth!9";
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

    // 4. Issue Token
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
    console.error("Google Token Verification Error:", error.message);
    res.status(500).json({ error: "Google SSO verification failed" });
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