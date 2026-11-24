import dotenv from "dotenv";
import { verifyEmailConnection } from "../services/emailService.js";

dotenv.config();

const testEmail = async () => {
  try {
    await verifyEmailConnection();

    console.log("SUCCESS: Gmail SMTP is ready.");
  } catch (error) {
    console.error("EMAIL CONNECTION FAILED:", error.message);
  }
};

testEmail();
