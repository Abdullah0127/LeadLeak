import dotenv from "dotenv";
import mongoose from "mongoose";

import ContactFormMonitor from "../models/ContactFormMonitor.js";
import ContactFormCheck from "../models/ContactFormCheck.js";
import { saveContactFormCheck } from "../services/contactFormCheckService.js";
import dns from "node:dns";

dotenv.config();

// ==========================================
// TEST DATABASE SAVING
// ==========================================

const runTest = async () => {
  let temporaryMonitorId;

  try {
    // Fix Node.js DNS resolution for MongoDB Atlas
    dns.setServers(["8.8.8.8", "1.1.1.1"]);

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected.");

    // ==========================================
    // CREATE TEMPORARY TEST IDS
    // ==========================================

    const organizationId = new mongoose.Types.ObjectId();
    const websiteId = new mongoose.Types.ObjectId();

    // ==========================================
    // CREATE TEMPORARY MONITOR
    // ==========================================

    const monitor = await ContactFormMonitor.create({
      organization: organizationId,
      website: websiteId,
      name: "Temporary Database Test",
      formUrl: "http://127.0.0.1:4179/",
      formType: "custom",
      isMonitoringEnabled: false,
      lastStatus: "unknown",
    });

    temporaryMonitorId = monitor._id;

    console.log("Temporary monitor created.");

    // ==========================================
    // SIMULATE A SUCCESSFUL TEST RESULT
    // ==========================================

    const simulatedResult = {
      result: "working",
      responseTime: 250,
      pageStatus: 200,
      successMessage: "Message sent successfully!",
      error: null,
    };

    // ==========================================
    // SAVE TEST RESULT
    // ==========================================

    const savedCheck = await saveContactFormCheck({
      organization: organizationId,
      website: websiteId,
      contactFormMonitor: monitor._id,
      result: simulatedResult,
    });

    // ==========================================
    // VERIFY SAVED HISTORY
    // ==========================================

    const history = await ContactFormCheck.findById(savedCheck._id);

    const updatedMonitor = await ContactFormMonitor.findById(monitor._id);

    console.log("\n--- DATABASE HISTORY TEST ---");

    console.log({
      saved: Boolean(history),
      status: history?.status,
      responseTime: history?.responseTime,
      httpStatus: history?.httpStatus,
      successMessage: history?.successMessage,
    });

    console.log("\n--- MONITOR UPDATE TEST ---");

    console.log({
      lastStatus: updatedMonitor?.lastStatus,
      lastResponseTime: updatedMonitor?.lastResponseTime,
      lastCheckedAt: updatedMonitor?.lastCheckedAt,
      lastError: updatedMonitor?.lastError,
    });

    // ==========================================
    // VERIFY RESULTS
    // ==========================================

    const testPassed =
      history?.status === "working" &&
      history?.responseTime === 250 &&
      history?.httpStatus === 200 &&
      updatedMonitor?.lastStatus === "working" &&
      updatedMonitor?.lastResponseTime === 250;

    if (testPassed) {
      console.log("\nSUCCESS: Database saving test passed!");
    } else {
      console.log("\nFAILED: Database verification failed.");
    }
  } catch (error) {
    console.error("\nTEST ERROR:", error.message);
  } finally {
    // ==========================================
    // CLEAN UP TEMPORARY TEST DATA
    // ==========================================

    if (temporaryMonitorId) {
      await ContactFormCheck.deleteMany({
        contactFormMonitor: temporaryMonitorId,
      });

      await ContactFormMonitor.findByIdAndDelete(temporaryMonitorId);

      console.log("\nTemporary test data cleaned up.");
    }

    await mongoose.disconnect();

    console.log("MongoDB disconnected.");
  }
};

runTest();
