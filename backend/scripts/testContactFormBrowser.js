import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  inspectContactFormPage,
  testLocalContactForm,
} from "../services/contactFormBrowserService.js";

// ==========================================
// LOCAL CONTACT FORM BROWSER TEST
// ==========================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testPagePath = path.join(
  __dirname,
  "../test-pages/contact-form-test.html",
);

// ==========================================
// START LOCAL TEST SERVER
// ==========================================

const server = http.createServer((req, res) => {
  try {
    const html = fs.readFileSync(testPagePath, "utf8");

    res.writeHead(200, {
      "Content-Type": "text/html",
    });

    res.end(html);
  } catch (error) {
    res.writeHead(500);
    res.end("Failed to load test page.");
  }
});

// ==========================================
// RUN TESTS
// ==========================================

server.listen(4179, "127.0.0.1", async () => {
  const testUrl = "http://127.0.0.1:4179";

  console.log("Local test page running.");

  try {
    // ==========================================
    // INSPECT FORM
    // ==========================================

    console.log("\n--- FORM INSPECTION TEST ---\n");

    const inspectionResult = await inspectContactFormPage(testUrl);

    console.log(JSON.stringify(inspectionResult, null, 2));

    // ==========================================
    // SUBMIT FORM
    // ==========================================

    console.log("\n--- FORM SUBMISSION TEST ---\n");

    const submissionResult = await testLocalContactForm(testUrl);

    console.log(JSON.stringify(submissionResult, null, 2));

    if (submissionResult.success) {
      console.log("\nSUCCESS: Automated form submission test passed!");
    } else {
      console.log("\nFAILED: Automated form submission test failed.");
    }
  } catch (error) {
    console.error("Test failed:", error.message);
  } finally {
    server.close(() => {
      console.log("\nLocal test server stopped.");
    });
  }
});
