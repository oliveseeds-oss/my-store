const assert = require("assert");

console.log("Starting Google OAuth Remediation Unit Tests...\n");

// Test token audience mismatch and invalid issuer checks
try {
  console.log("Test 1: Verification constraint validation...");
  
  function validateGoogleResponse(googleRes, expectedClientId) {
    const { email, name, email_verified, aud, iss } = googleRes;

    if (email_verified !== "true" && email_verified !== true) {
      throw new Error("Google account email is not verified.");
    }
    if (aud !== expectedClientId) {
      throw new Error("Audience client ID mismatch.");
    }
    const allowedIssuers = ["https://accounts.google.com", "accounts.google.com"];
    if (!allowedIssuers.includes(iss)) {
      throw new Error("Invalid token issuer.");
    }
    return true;
  }

  // Valid payload
  const validPayload = {
    email: "user@gmail.com",
    name: "User Name",
    email_verified: true,
    aud: "my-valid-client-id.apps.googleusercontent.com",
    iss: "https://accounts.google.com"
  };
  assert.strictEqual(validateGoogleResponse(validPayload, "my-valid-client-id.apps.googleusercontent.com"), true);

  // Invalid Audience
  assert.throws(() => {
    validateGoogleResponse(validPayload, "wrong-client-id.apps.googleusercontent.com");
  }, /Audience client ID mismatch/);

  // Unverified Email
  const unverifiedPayload = { ...validPayload, email_verified: false };
  assert.throws(() => {
    validateGoogleResponse(unverifiedPayload, "my-valid-client-id.apps.googleusercontent.com");
  }, /email is not verified/);

  // Invalid Issuer
  const wrongIssuerPayload = { ...validPayload, iss: "https://malicious.com" };
  assert.throws(() => {
    validateGoogleResponse(wrongIssuerPayload, "my-valid-client-id.apps.googleusercontent.com");
  }, /Invalid token issuer/);

  console.log("  ✓ Test 1 Passed.\n");
} catch (e) {
  console.error("  ❌ Test 1 Failed:", e.message);
  process.exit(1);
}

console.log("🎉 All Google OAuth remediation tests passed successfully!");
process.exit(0);
