import nodemailer from "nodemailer";

// ==========================================
// EMAIL SERVICE
// ==========================================

// ==========================================
// CREATE SMTP TRANSPORTER
// ==========================================

const createTransporter = () => {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    throw new Error("SMTP configuration is incomplete.");
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: Number(process.env.SMTP_PORT) === 465,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// ==========================================
// VERIFY EMAIL CONNECTION
// ==========================================

export const verifyEmailConnection = async () => {
  const transporter = createTransporter();

  await transporter.verify();

  console.log("Email SMTP connection verified successfully.");

  return true;
};

// ==========================================
// SEND EMAIL
// ==========================================

export const sendEmail = async ({ to, subject, text, html }) => {
  if (!to || !subject || (!text && !html)) {
    throw new Error("Recipient, subject, and email content are required.");
  }

  const transporter = createTransporter();

  const result = await transporter.sendMail({
    from: {
      name: "LeadLeak",
      address: process.env.SMTP_USER,
    },
    to,
    subject,
    text,
    html,
  });

  console.log(`Email sent successfully to: ${to}`);

  return {
    messageId: result.messageId,
    accepted: result.accepted,
  };
};
