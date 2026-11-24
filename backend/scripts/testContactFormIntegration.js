import dotenv from "dotenv";
import dns from "node:dns";
import mongoose from "mongoose";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

import ContactFormMonitor from "../models/ContactFormMonitor.js";
import ContactFormCheck from "../models/ContactFormCheck.js";

import { testLocalContactForm } from "../services/contactFormBrowserService.js";
import { saveContactFormCheck } from "../services/contactFormCheckService.js";

dotenv.config();

// ==========================================
// INTEGRATION TEST
// BROWSER + DATABASE
// ==========================================

const runTest = async () => {
  let server;
  let temporaryMonitorId;

  try {
    // ==========================================
    // DNS WORKAROUND
    // ==========================================

    dns.setServers(["8.8.8.8", "1.1.1.1"]);

    // ==========================================
    // CONNECT DATABASE
    // ==========================================

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected.");

    // ==========================================
    // START LOCAL TEST SERVER
    // ==========================================

    const testPagePath = path.join(
      process.cwd(),
      "test-pages",
      "contact-form-test.html",
    );

    server = http.createServer((req, res) => {
      fs.readFile(testPagePath, (error, content) => {
        if (error) {
          res.writeHead(500);
          res.end("Test page could not be loaded.");
          return;
        }

        res.writeHead(200, {
          "Content-Type": "text/html",
        });

        res.end(content);
      });
    });

    await new Promise((resolve, reject) => {
      server.once("error", reject);

      server.listen(4179, "127.0.0.1", resolve);
    });

    console.log("Local test server running.");

    // ==========================================
    // CREATE TEMPORARY MONITOR
    // ==========================================

    const organizationId = new mongoose.Types.ObjectId();
    const websiteId = new mongoose.Types.ObjectId();

    const monitor = await ContactFormMonitor.create({
      organization: organizationId,
      website: websiteId,
      name: "Integration Test Monitor",
      formUrl: "http://127.0.0.1:4179/",
      formType: "custom",
      isMonitoringEnabled: false,
      lastStatus: "unknown",
    });

    temporaryMonitorId = monitor._id;

    console.log("Temporary monitor created.");

    // ==========================================
    // RUN REAL BROWSER FORM TEST
    // ==========================================

    console.log("\nRunning browser form test...");

    const result = await testLocalContactForm("http://127.0.0.1:4179/");

    console.log("\n--- BROWSER TEST RESULT ---");

    console.log(result);

    // ==========================================
    // SAVE RESULT TO DATABASE
    // ==========================================

    const savedCheck = await saveContactFormCheck({
      organization: organizationId,
      website: websiteId,
      contactFormMonitor: monitor._id,
      result,
    });

    // ==========================================
    // VERIFY DATABASE
    // ==========================================

    const history = await ContactFormCheck.findById(savedCheck._id);

    const updatedMonitor = await ContactFormMonitor.findById(monitor._id);

    console.log("\n--- SAVED HISTORY ---");

    console.log({
      status: history?.status,
      responseTime: history?.responseTime,
      httpStatus: history?.httpStatus,
      successMessage: history?.successMessage,
    });

    console.log("\n--- UPDATED MONITOR ---");

    console.log({
      lastStatus: updatedMonitor?.lastStatus,
      lastResponseTime: updatedMonitor?.lastResponseTime,
      lastCheckedAt: updatedMonitor?.lastCheckedAt,
      lastError: updatedMonitor?.lastError,
    });

    // ==========================================
    // VERIFY INTEGRATION
    // ==========================================

    const testPassed =
      result.result === "working" &&
      history?.status === "working" &&
      history?.httpStatus === 200 &&
      typeof history?.responseTime === "number" &&
      updatedMonitor?.lastStatus === "working";

    if (testPassed) {
      console.log("\nSUCCESS: Browser + MongoDB integration passed!");
    } else {
      console.log("\nFAILED: Integration verification failed.");
    }
  } catch (error) {
    console.error("\nINTEGRATION TEST ERROR:", error.message);
  } finally {
    // ==========================================
    // CLEAN DATABASE TEST RECORDS
    // ==========================================

    if (temporaryMonitorId) {
      await ContactFormCheck.deleteMany({
        contactFormMonitor: temporaryMonitorId,
      });

      await ContactFormMonitor.findByIdAndDelete(temporaryMonitorId);

      console.log("\nTemporary database records cleaned.");
    }

    // ==========================================
    // STOP LOCAL SERVER
    // ==========================================

    if (server) {
      await new Promise((resolve) => {
        server.close(resolve);
      });

      console.log("Local test server stopped.");
    }

    // ==========================================
    // DISCONNECT DATABASE
    // ==========================================

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();

      console.log("MongoDB disconnected.");
    }
  }
};

runTest();
