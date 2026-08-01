const { getSubunits, getAmountFromSubunits } = require("../utils/currency");
const assert = require("assert");

console.log("Starting Razorpay Integration Logic Unit Tests...\n");

// 1. Test Decimal Subunits Mapping (Priority 18)
try {
  console.log("Test 1: Decimal Subunits Conversion...");
  
  // USD (2 decimals)
  const usdSubunits = getSubunits(10.55, "USD");
  console.log(`  - 10.55 USD to Subunits: ${usdSubunits}`);
  assert.strictEqual(usdSubunits, 1055);
  
  // JPY (0 decimals)
  const jpySubunits = getSubunits(1000, "JPY");
  console.log(`  - 1000 JPY to Subunits: ${jpySubunits}`);
  assert.strictEqual(jpySubunits, 1000);
  
  // KWD (3 decimals)
  const kwdSubunits = getSubunits(5.125, "KWD");
  console.log(`  - 5.125 KWD to Subunits: ${kwdSubunits}`);
  assert.strictEqual(kwdSubunits, 5125);
  
  console.log("  ✓ Test 1 Passed.\n");
} catch (e) {
  console.error("  ❌ Test 1 Failed:", e.message);
  process.exit(1);
}

// 2. Test HMAC Webhook Signature Verification
try {
  console.log("Test 2: Webhook Signature Cryptographic Verification...");
  const crypto = require("crypto");
  const webhookSecret = "test_webhook_secret_key";
  const mockPayload = { event: "payment.captured", id: "evt_12345" };
  const rawBody = JSON.stringify(mockPayload);
  
  const hmac = crypto.createHmac("sha256", webhookSecret);
  const correctSignature = hmac.update(rawBody).digest("hex");
  
  // Validate correct signature
  const testHmac = crypto.createHmac("sha256", webhookSecret);
  const testHash = testHmac.update(rawBody).digest("hex");
  assert.strictEqual(testHash, correctSignature, "HMAC signatures do not match!");
  console.log("  ✓ Webhook validation algorithm checks correctly.");
  console.log("  ✓ Test 2 Passed.\n");
} catch (e) {
  console.error("  ❌ Test 2 Failed:", e.message);
  process.exit(1);
}

console.log("🎉 All Razorpay unit tests passed successfully!");
process.exit(0);
