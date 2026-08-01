const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { verifyAdmin } = require("../middleware/auth");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Memory storage to inspect magic bytes BEFORE writing to disk (Priority 1)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Hard limit 5MB (Priority 12)
});

// Magic bytes validation function (Priority 6)
function checkMagicBytes(buffer) {
  if (!buffer || buffer.length < 4) return false;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return "jpg";
  }
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return "png";
  }
  // WEBP: RIFF (bytes 0-3) and WEBP (bytes 8-11)
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    return "webp";
  }

  return null;
}

// Secure upload endpoint
router.post("/file", verifyAdmin, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const { buffer, originalname, mimetype } = req.file;

  // 1. Sanitize filename & reject path traversal components (Priority 8)
  const baseName = path.basename(originalname);
  if (baseName !== originalname || originalname.includes("..") || originalname.includes("/") || originalname.includes("\\")) {
    return res.status(400).json({ error: "Invalid filename format" });
  }

  // 2. Validate extension is permitted (Priority 4/5)
  const ext = path.extname(baseName).toLowerCase().replace(".", "");
  const allowedExts = ["jpg", "jpeg", "png", "webp"];
  if (!allowedExts.includes(ext)) {
    return res.status(400).json({ error: "File extension not allowed." });
  }

  // 3. Validate MIME-type (Priority 6)
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedMimeTypes.includes(mimetype)) {
    return res.status(400).json({ error: "MIME type not allowed." });
  }

  // 4. Validate Magic Bytes / File Content (Priority 6)
  const detectedType = checkMagicBytes(buffer);
  if (!detectedType) {
    return res.status(400).json({ error: "Invalid image content. Executable or script files are strictly blocked." });
  }

  // 5. Generate safe server-side filename (Priority 7)
  const safeFilename = crypto.randomBytes(16).toString("hex") + "." + detectedType;
  const destinationPath = path.join(uploadDir, safeFilename);

  try {
    // Write safe file to disk
    fs.writeFileSync(destinationPath, buffer);

    const relativePath = `/uploads/${safeFilename}`;
    return res.json({
      url: relativePath,
      filename: safeFilename,
      message: "File uploaded successfully",
    });
  } catch (error) {
    console.error("File write failure:", error.message);
    // Safe error message (Priority 13)
    return res.status(500).json({ error: "Internal server error saving file." });
  }
});

module.exports = router;
