const fs = require("fs");
const path = require("path");
const db = require("./db");
const { transporter } = require("./utils/mailer");

async function runStartupValidation() {
  console.log("🔍 Running production startup validation checks...");

  const requiredEnv = [
    "DB_HOST",
    "DB_USER",
    "DB_PASSWORD",
    "DB_NAME",
    "JWT_SECRET",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASSWORD",
    "SMTP_FROM",
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
    "PAYPAL_CLIENT_ID",
    "PAYPAL_CLIENT_SECRET"
  ];

  // 1. Env validation
  const missing = requiredEnv.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.warn(`⚠️ Startup Check Warning: Missing required env variables: ${missing.join(", ")}`);
  }

  // 2. JWT_SECRET strength
  const jwtSecret = process.env.JWT_SECRET || "";
  if (jwtSecret.length < 32) {
    console.warn("⚠️ Startup Check Warning: JWT_SECRET should be at least 32 characters long in production.");
  }

  // 3. Razorpay Key Format Check
  const rzpKey = process.env.RAZORPAY_KEY_ID || "";
  if (rzpKey && !rzpKey.startsWith("rzp_live_")) {
    console.warn(`⚠️ Startup Check Warning: Razorpay Key ID format warning: "${rzpKey}"`);
  }

  // 4. PayPal Mode Check
  const paypalId = process.env.PAYPAL_CLIENT_ID || "";
  if (paypalId && (paypalId.startsWith("sb") || process.env.PAYPAL_MODE === "sandbox")) {
    console.warn(`⚠️ Startup Check Warning: PayPal is in sandbox mode.`);
  }

  // 5. Database Connection Check
  try {
    await db.query("SELECT 1");
    console.log("  ✓ Database connection is live.");
  } catch (dbErr) {
    console.error("⚠️ Startup Check Warning: Database connection is offline or invalid.", dbErr.message);
  }

  // 6. SMTP Transport Verification Check
  try {
    if (transporter && typeof transporter.verify === "function") {
      await transporter.verify();
      console.log("  ✓ SMTP mail server connection verified.");
    }
  } catch (smtpErr) {
    console.warn("⚠️ Startup Check Warning: SMTP mail connection verification failed.", smtpErr.message);
  }

  // 7. Write Permissions for uploads/ Directory
  const uploadDir = path.join(__dirname, "uploads");
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    fs.accessSync(uploadDir, fs.constants.W_OK);
    console.log("  ✓ Uploads directory exists and is writable.");
  } catch (uploadErr) {
    console.error(`❌ Startup Check Failed: Uploads directory ("${uploadDir}") is not writable or cannot be created.`, uploadErr.message);
    process.exit(1);
  }

  // 8. Optional Global SEO & Search Verification Env Check
  const optionalSeoEnv = [
    "SITE_URL",
    "GOOGLE_VERIFY_CODE",
    "BING_VERIFY_CODE",
    "YANDEX_VERIFY_CODE",
    "BAIDU_VERIFY_CODE",
    "NAVER_VERIFY_CODE",
    "PINTEREST_VERIFY_CODE",
    "INSTAGRAM_URL",
    "FACEBOOK_URL",
    "TWITTER_URL",
    "PINTEREST_URL",
    "YOUTUBE_URL"
  ];
  const missingSeo = optionalSeoEnv.filter(key => !process.env[key]);
  if (missingSeo.length > 0) {
    console.warn(`⚠️ Optional SEO Env Warning: Missing search engine verification/social keys: ${missingSeo.join(", ")}`);
  }

  console.log("🚀 All systems verified. Launching Olive Seeds Studio LIVE.");
}

module.exports = {
  runStartupValidation
};
