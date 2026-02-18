// Email Utility
const nodemailer = require('nodemailer');

const getTransporter = () => {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_SECURE
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === 'true',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
};

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = getTransporter();
  if (!transporter) {
    console.log('[email] SMTP not configured; skipping send.');
    return false;
  }

  const from = process.env.SMTP_FROM || 'no-reply@facilitypro.local';
  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html
  });
  return true;
};

module.exports = {
  sendEmail
};
