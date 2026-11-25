import test from "node:test";
import assert from "node:assert/strict";

import MonitoringCheck from "../../models/MonitoringCheck.js";
import Website from "../../models/Website.js";
import { getWebsiteUptimeAnalytics } from "../../services/uptimeAnalyticsService.js";

test("returns null uptime and zero coverage when no observations exist", async () => {
  const originalFindById = Website.findById;
  const originalFind = MonitoringCheck.find;

  Website.findById = () => ({
    select: () => ({
      lean: async () => null,
    }),
  });

  MonitoringCheck.find = () => ({
    sort: () => ({
      select: () => ({
        lean: async () => [],
      }),
    }),
  });

  try {
    const result = await getWebsiteUptimeAnalytics({
      websiteId: "507f1f77bcf86cd799439011",
      organizationId: "507f1f77bcf86cd799439012",
      period: "24h",
    });

    assert.equal(result.uptime.percentage, null);
    assert.equal(result.coverage.percentage, 0);
    assert.equal(result.performance.averageResponseTimeMs, null);
    assert.equal(result.dataAvailable, false);
  } finally {
    Website.findById = originalFindById;
    MonitoringCheck.find = originalFind;
  }
});

test("rejects unsupported analytics periods", async () => {
  await assert.rejects(
    getWebsiteUptimeAnalytics({
      websiteId: "507f1f77bcf86cd799439011",
      organizationId: "507f1f77bcf86cd799439012",
      period: "1h",
    }),
    /Unsupported analytics period/,
  );
});
