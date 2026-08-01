const { encrypt, decrypt, request } = require("../utils/shiprocket");
const assert = require("assert");

console.log("Starting Shiprocket Integration Logic Unit Tests...\n");

// 1. Test Encryption/Decryption
try {
  console.log("Test 1: AES-256-GCM Encryption/Decryption...");
  const rawText = "SecretPassword123!";
  const encryptedText = encrypt(rawText);
  
  console.log(`  - Raw: "${rawText}"`);
  console.log(`  - Encrypted: "${encryptedText}"`);
  
  const decryptedText = decrypt(encryptedText);
  console.log(`  - Decrypted: "${decryptedText}"`);
  
  assert.strictEqual(decryptedText, rawText, "Decrypted text does not match raw input!");
  console.log("  ✓ Test 1 Passed.\n");
} catch (e) {
  console.error("  ❌ Test 1 Failed:", e.message);
  process.exit(1);
}

// 2. Test Legacy/Plaintext Decryption Fallback
try {
  console.log("Test 2: Legacy Plaintext Decryption Fallback...");
  const plainText = "MyPlaintextSecretPassword";
  const decrypted = decrypt(plainText);
  console.log(`  - Input: "${plainText}"`);
  console.log(`  - Decrypted: "${decrypted}"`);
  
  assert.strictEqual(decrypted, plainText, "Plaintext fallback failed!");
  console.log("  ✓ Test 2 Passed.\n");
} catch (e) {
  console.error("  ❌ Test 2 Failed:", e.message);
  process.exit(1);
}

// 3. Test Timeout Handling
try {
  console.log("Test 3: Request Timeout Handling...");
  // Hitting an endpoint that doesn't exist or a slow port to trigger timeout
  request("https://httpbin.org/delay/5", { timeout: 1000 })
    .then(() => {
      console.error("  ❌ Test 3 Failed: Request succeeded instead of timing out!");
      process.exit(1);
    })
    .catch((err) => {
      console.log(`  - Correctly timed out with error: "${err.message}"`);
      assert(err.message.includes("timed out") || err.message.includes("timeout"), "Error message not showing timeout!");
      console.log("  ✓ Test 3 Passed.\n");
      runNext();
    });
} catch (e) {
  console.error("  ❌ Test 3 Failed Setup:", e.message);
  process.exit(1);
}

function runNext() {
  console.log("🎉 All unit tests passed successfully!");
  process.exit(0);
}
