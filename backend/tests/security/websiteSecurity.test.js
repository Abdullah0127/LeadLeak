import test from "node:test";
import assert from "node:assert/strict";

import {
  isPublicIP,
  validatePublicWebsite,
} from "../../utils/websiteSecurity.js";

test("blocks private and reserved IPv4 ranges", () => {
  for (const ip of [
    "127.0.0.1",
    "10.0.0.1",
    "172.16.0.1",
    "192.168.1.1",
    "169.254.169.254",
    "0.0.0.0",
  ]) {
    assert.equal(isPublicIP(ip), false, ip);
  }
});

test("blocks loopback, private, and link-local IPv6", () => {
  for (const ip of ["::1", "fc00::1", "fd00::1", "fe80::1"]) {
    assert.equal(isPublicIP(ip), false, ip);
  }
});

test("rejects local hostnames and private URLs", async () => {
  await assert.rejects(
    validatePublicWebsite("http://127.0.0.1:4179"),
    /Private or reserved|Local websites/,
  );
  await assert.rejects(
    validatePublicWebsite("http://localhost:4179"),
    /Local websites/,
  );
  await assert.rejects(
    validatePublicWebsite("file:///tmp/test"),
    /Only HTTP and HTTPS/,
  );
  await assert.rejects(
    validatePublicWebsite("http://user:pass@example.com"),
    /credentials/,
  );
});
