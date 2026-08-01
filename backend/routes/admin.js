const router = require("express").Router();
const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { createRateLimiter } = require("../middleware/rateLimiter");

const loginLimiter = createRateLimiter(5, 15 * 60 * 1000); // 5 attempts max per 15 minutes

router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await db.query("SELECT * FROM settings WHERE id = 1");
    const settings = rows[0];

    const match = settings ? await bcrypt.compare(password, settings.admin_password) : false;

    if (username === "admin" && match) {
      const token = jwt.sign(
        { role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      // Must return { token, username }
      res.json({ token, username: "admin" });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;