import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  inspectContactFormPage,
  testLocalContactForm,
} from "../../services/contactFormBrowserService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testPagePath = path.join(
  __dirname,
  "../../test-pages/contact-form-test.html",
);

test("controlled local contact form can be inspected and submitted", async () => {
  const html = fs.readFileSync(testPagePath, "utf8");
  const server = http.createServer((req, res) => {
    if (req.url === "/submit" && req.method === "POST") {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end('<div id="form-result">Message sent successfully!</div>');
      return;
    }

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(4179, "127.0.0.1", resolve);
  });

  try {
    const url = "http://127.0.0.1:4179/";
    const inspection = await inspectContactFormPage(url);
    const submission = await testLocalContactForm(url);

    assert.equal(inspection.success, true);
    assert.equal(inspection.pageStatus, 200);
    assert.equal(inspection.formsFound, 1);
    assert.equal(submission.success, true);
    assert.equal(submission.result, "working");
    assert.equal(submission.pageStatus, 200);
    assert.equal(typeof submission.responseTime, "number");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
