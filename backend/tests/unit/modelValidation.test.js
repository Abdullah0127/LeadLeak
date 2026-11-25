import test from "node:test";
import assert from "node:assert/strict";

import Website from "../../models/Website.js";
import ContactFormMonitor from "../../models/ContactFormMonitor.js";

test("website model requires URL and organization fields", async () => {
  const website = new Website({ name: "Missing fields" });
  let error;
  try {
    await website.validate();
  } catch (validationError) {
    error = validationError;
  }

  assert.ok(error?.errors.url);
  assert.ok(error?.errors.organization);
});

test("contact form monitor validates supported form types", async () => {
  const monitor = new ContactFormMonitor({
    organization: "507f1f77bcf86cd799439011",
    website: "507f1f77bcf86cd799439012",
    name: "Test form",
    formUrl: "https://example.com/contact",
    formType: "unsupported",
  });
  let error;
  try {
    await monitor.validate();
  } catch (validationError) {
    error = validationError;
  }

  assert.ok(error?.errors.formType);
});
