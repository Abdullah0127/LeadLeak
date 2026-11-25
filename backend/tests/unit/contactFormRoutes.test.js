import test from "node:test";
import assert from "node:assert/strict";

import router from "../../routes/contactFormMonitorRoutes.js";

test("contact form monitor routes expose organization listing compatibility path", () => {
  const paths = router.stack
    .filter((layer) => layer.route)
    .flatMap((layer) => layer.route.path);

  assert.ok(paths.includes("/organization/:organizationId"));
  assert.ok(paths.includes("/:organizationId"));
  assert.ok(paths.includes("/:organizationId/:monitorId"));
  assert.ok(paths.includes("/:organizationId/:monitorId/test"));
});
