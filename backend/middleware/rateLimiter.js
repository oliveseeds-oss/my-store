const attemptsMap = new Map();

/**
 * Lightweight, in-memory IP-based rate limiting middleware.
 * @param {number} maxAttempts Maximum requests allowed in timeframe
 * @param {number} windowMs Timeframe window in milliseconds
 */
function createRateLimiter(maxAttempts, windowMs) {
  return (req, res, next) => {
    // Obtain client IP address securely
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip;
    const now = Date.now();

    if (!attemptsMap.has(ip)) {
      attemptsMap.set(ip, []);
    }

    // Filter attempts within the time window
    const timestamps = attemptsMap.get(ip).filter(timestamp => now - timestamp < windowMs);
    timestamps.push(now);
    attemptsMap.set(ip, timestamps);

    if (timestamps.length > maxAttempts) {
      return res.status(429).json({
        error: "Too many attempts. Please wait before trying again."
      });
    }

    next();
  };
}

module.exports = { createRateLimiter };
