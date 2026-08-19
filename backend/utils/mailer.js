const nodemailer = require("nodemailer");

const host = process.env.SMTP_HOST;
const port = parseInt(process.env.SMTP_PORT || "587");
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASSWORD;
const secure = process.env.SMTP_SECURE === "true";
const fromAddress = process.env.SMTP_FROM;

if (!host || !user || !pass || !fromAddress) {
  throw new Error("SMTP configuration is missing. Ensure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM are set.");
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: {
    user,
    pass,
  },
});

async function sendMail({ to, subject, text, html }) {
  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      text,
      html,
    });
    console.log(`✉️ Email sent successfully: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("✉️ Failed to send email:", error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  transporter,
  sendMail
};
