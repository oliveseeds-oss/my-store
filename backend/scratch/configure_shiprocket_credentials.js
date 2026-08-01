const db = require("../db");
const { encrypt } = require("../utils/shiprocket");

async function run() {
  const email = "oliveseeds.oss@gmail.com";
  const rawPassword = "ObwVrRKr&9$$1M3GPT6%Wn*LaYQps3FP";
  const encryptedPassword = encrypt(rawPassword);

  console.log("Configuring Shiprocket Credentials...");
  console.log(`Email: ${email}`);
  console.log(`Encrypted Password Hash: ${encryptedPassword}`);

  try {
    await db.query(
      "UPDATE settings SET shiprocket_email = ?, shiprocket_password = ? WHERE id = 1",
      [email, encryptedPassword]
    );
    console.log("✅ Credentials successfully written and encrypted in settings table.");
  } catch (err) {
    console.error("❌ Database connection failed. If running inside Docker, run this script inside the container:");
    console.error(`   Error details: ${err.message}`);
  } finally {
    process.exit(0);
  }
}

run();
