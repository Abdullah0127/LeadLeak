import dotenv from "dotenv";
import { sendEmail } from "../services/emailService.js";

dotenv.config();

const testEmailSending = async () => {
  try {
    await sendEmail({
      to: process.env.SMTP_USER,
      subject: "LeadLeak - Email Delivery Test",
      text: `
Hello!

This is a test email from LeadLeak.

Your Gmail SMTP email delivery is working successfully.

Regards,
LeadLeak Team
      `.trim(),
      html: `
        <h2>LeadLeak Email Test</h2>
        <p>Your Gmail SMTP email delivery is working successfully.</p>
        <p>LeadLeak is ready for email notification testing.</p>
      `,
    });

    console.log("SUCCESS: Test email sent successfully.");
  } catch (error) {
    console.error("EMAIL SENDING FAILED:", error.message);
  }
};

testEmailSending();
