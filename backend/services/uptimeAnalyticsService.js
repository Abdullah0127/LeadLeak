import MonitoringCheck from "../models/MonitoringCheck.js";
import Website from "../models/Website.js";

// ==========================================
// UPTIME ANALYTICS CONFIGURATION
// ==========================================

// Monitoring normally runs every 5 minutes.
// Allow up to 10 minutes for scheduling delays.
const MAX_OBSERVATION_AGE_MS = 10 * 60 * 1000;

const PERIODS = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

// ==========================================
// CALCULATE WEBSITE UPTIME ANALYTICS
// ==========================================

export const getWebsiteUptimeAnalytics = async ({
  websiteId,
  organizationId,
  period = "24h",
}) => {
  if (!PERIODS[period]) {
    throw new Error("Unsupported analytics period.");
  }

  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - PERIODS[period]);
  const website = await Website.findById(websiteId).select("monitoringUrlChangedAt").lean();
  const effectiveStartTime =
    website?.monitoringUrlChangedAt &&
    new Date(website.monitoringUrlChangedAt).getTime() > startTime.getTime()
      ? new Date(website.monitoringUrlChangedAt)
      : startTime;

  const totalDurationMs = endTime.getTime() - effectiveStartTime.getTime();

  // Fetch observations beginning slightly before the period.
  // A recent observation before the period can establish
  // the website's status at the beginning of the period.
  const queryStart = new Date(
    effectiveStartTime.getTime() - MAX_OBSERVATION_AGE_MS,
  );

  const checks = await MonitoringCheck.find({
    website: websiteId,
    organization: organizationId,
    checkedAt: {
      $gte: queryStart,
      $lte: endTime,
    },
  })
    .sort({ checkedAt: 1 })
    .select("status responseTime checkedAt httpStatusCode")
    .lean();

  let upDurationMs = 0;
  let downDurationMs = 0;

  // ==========================================
  // CALCULATE OBSERVED TIME INTERVALS
  // ==========================================

  for (let index = 0; index < checks.length; index++) {
    const currentCheck = checks[index];
    const checkedAt = new Date(currentCheck.checkedAt).getTime();

    const nextCheck = checks[index + 1];

    const nextCheckTime = nextCheck
      ? new Date(nextCheck.checkedAt).getTime()
      : endTime.getTime();

    // An observation remains valid only until the next check
    // or the maximum allowed observation age.
    const observationEnd = Math.min(
      nextCheckTime,
      checkedAt + MAX_OBSERVATION_AGE_MS,
      endTime.getTime(),
    );

    const intervalStart = Math.max(
      checkedAt,
      effectiveStartTime.getTime(),
    );

    const intervalDuration = Math.max(
      0,
      observationEnd - intervalStart,
    );

    if (currentCheck.status === "up") {
      upDurationMs += intervalDuration;
    } else if (currentCheck.status === "down") {
      downDurationMs += intervalDuration;
    }
  }

  // ==========================================
  // CALCULATE COVERAGE AND UNKNOWN TIME
  // ==========================================

  const knownDurationMs = upDurationMs + downDurationMs;

  const unknownDurationMs = Math.max(
    0,
    totalDurationMs - knownDurationMs,
  );

  const uptimePercentage =
    knownDurationMs > 0
      ? Number(
          ((upDurationMs / knownDurationMs) * 100).toFixed(3),
        )
      : null;

  const coveragePercentage = Number(
    ((knownDurationMs / totalDurationMs) * 100).toFixed(3),
  );

  // ==========================================
  // CALCULATE RESPONSE TIME
  // ==========================================

  const successfulResponseTimes = checks
    .filter(
      (check) =>
        check.status === "up" &&
        typeof check.responseTime === "number" &&
        Number.isFinite(check.responseTime) &&
        check.responseTime >= 0 &&
        new Date(check.checkedAt) >= effectiveStartTime,
    )
    .map((check) => check.responseTime);

  const averageResponseTime =
    successfulResponseTimes.length > 0
      ? Number(
          (
            successfulResponseTimes.reduce(
              (total, time) => total + time,
              0,
            ) / successfulResponseTimes.length
          ).toFixed(2),
        )
      : null;

  // ==========================================
  // RETURN ANALYTICS
  // ==========================================

  return {
    period,

    range: {
      start: effectiveStartTime,
      end: endTime,
    },

    uptime: {
      percentage: uptimePercentage,
      upDurationMs,
      downDurationMs,
      unknownDurationMs,
      knownDurationMs,
      totalDurationMs,
    },

    coverage: {
      percentage: coveragePercentage,
      observedDurationMs: knownDurationMs,
      missingDurationMs: unknownDurationMs,
    },

    performance: {
      averageResponseTimeMs: averageResponseTime,
      successfulChecksWithResponseTime:
        successfulResponseTimes.length,
    },

    checks: {
      total: checks.filter(
        (check) => new Date(check.checkedAt) >= effectiveStartTime,
      ).length,
    },

    dataAvailable: checks.length > 0,
  };
};
