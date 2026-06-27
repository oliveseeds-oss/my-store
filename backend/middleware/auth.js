const jwt = require("jsonwebtoken");

function verifyAdmin(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") throw new Error("Not admin");
    req.admin = decoded;
    next();
  } catch (err) {
    console.error("verifyAdmin failed:", err.message, "Token:", token);
    res.status(403).json({ error: "Invalid or expired token" });
  }
}

function verifyMember(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const member_uid = decoded.member_uid || decoded.member_id;
    if (!member_uid) throw new Error("Not a member token");
    req.member = { ...decoded, member_uid };
    next();
  } catch (err) {
    console.error("verifyMember failed:", err.message, "Token:", token);
    res.status(403).json({ error: "Invalid or expired token" });
  }
}

module.exports = { verifyAdmin, verifyMember };