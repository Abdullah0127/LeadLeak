import Website from "../models/Website.js";
import MonitoringCheck from "../models/MonitoringCheck.js";

import { secureWebsiteRequest } from "../utils/websiteSecurity.js";
import { checkSSLCertificate } from "./sslMonitoringService.js";

import {
  createWebsiteDownAlert,
  createWebsiteRecoveredAlert,
  createSSLExpiringAlert,
} from "./alertService.js";

// ==========================================
// WEBSITE MONITORING SERVICE
// ==========================================

const CHECK_TIMEOUT = 20000;
const MAX_REDIRECTS = 5;
const SSL_EXPIRY_WARNING_DAYS = 30;
const FAILURE_CONFIRMATION_COUNT = Math.max(
  1,
  Number.parseInt(process.env.FAILURE_CONFIRMATION_COUNT || "2", 10) || 2,
);
const activeWebsiteChecks = new Set();

const REDIRECT_STATUSES = [301, 302, 303, 307, 308];

// ==========================================
// SECURE WEBSITE REQUEST
// ==========================================

const fetchWebsite = async (websiteUrl, signal) => {
  let currentUrl = websiteUrl;

  for (let attempt = 0; attempt <= MAX_REDIRECTS; attempt++) {
    const response = await secureWebsiteRequest({
      url: currentUrl,
      method: "GET",
      signal,
      timeoutMs: CHECK_TIMEOUT,
      maxBytes: 1024 * 1024,
      headers: {
        "User-Agent": "LeadLeak-Monitor/1.0",
      },
    });

    if (REDIRECT_STATUSES.includes(response.status)) {
      const location = response.headers.get("location");

      response.destroy();

      if (!location) {
        throw new Error("Website returned a redirect without a destination.");
      }

      if (attempt === MAX_REDIRECTS) {
        throw new Error("Website exceeded the maximum redirect limit.");
      }

      const baseUrl = new URL(currentUrl);
      currentUrl = new URL(location, baseUrl).toString();

      continue;
    }

    return response;
  }

  throw new Error("Unable to complete the website request.");
};

// ==========================================
// CHECK WEBSITE STATUS
// ==========================================

export const checkWebsite = async (website) => {
  if (website.isArchived) {
    return {
      success: false,
      skipped: true,
      websiteId: website._id,
      websiteUrl: website.url,
      status: "unknown",
      checkedAt: new Date(),
    };
  }

  const websiteKey = String(website._id);

  if (activeWebsiteChecks.has(websiteKey)) {
    return {
      success: false,
      skipped: true,
      websiteId: website._id,
      websiteUrl: website.url,
      status: website.confirmedStatus || website.lastStatus || "unknown",
      checkedAt: new Date(),
    };
  }

  activeWebsiteChecks.add(websiteKey);

  let checkTimeout;

  try {
  const startTime = Date.now();

  // Get the previous monitoring result.
  const previousCheck = await MonitoringCheck.findOne({
    website: website._id,
    organization: website.organization,
    ...(website.monitoringUrlChangedAt
      ? { checkedAt: { $gte: website.monitoringUrlChangedAt } }
      : {}),
  }).sort({ checkedAt: -1 });

  let observedStatus = "down";
  let httpStatusCode = null;
  let responseTime = null;
  let errorMessage = null;

  let sslStatus = "unknown";
  let sslExpiresAt = null;
  let sslError = null;

  const controller = new AbortController();

  checkTimeout = setTimeout(() => {
    controller.abort(new Error("Website check timed out."));
  }, CHECK_TIMEOUT);

  // ==========================================
  // CHECK WEBSITE AVAILABILITY
  // ==========================================

  try {
    const response = await fetchWebsite(website.url, controller.signal);

    responseTime = Date.now() - startTime;
    httpStatusCode = response.status;

    observedStatus =
      response.status >= 200 && response.status < 400 ? "up" : "down";

    if (observedStatus === "down") {
      errorMessage = `Server returned HTTP ${response.status}.`;
    }

    response.destroy();
  } catch (error) {
    responseTime = Date.now() - startTime;

    if (error.name === "AbortError") {
      errorMessage = "Website request timed out.";
    } else {
      errorMessage = error.message || "Website could not be reached.";
    }
  }

  // ==========================================
  // CHECK SSL CERTIFICATE
  // ==========================================

  try {
    const remainingTime = Math.max(1, CHECK_TIMEOUT - (Date.now() - startTime));
    const sslResult = await checkSSLCertificate(website.url, {
      signal: controller.signal,
      timeoutMs: remainingTime,
    });

    sslStatus = sslResult.sslStatus;
    sslExpiresAt = sslResult.sslExpiresAt || null;
    sslError = sslResult.sslError || null;
  } catch (error) {
    sslStatus = "unknown";
    sslError = error.message || "SSL check failed.";

    console.error("SSL Monitoring Error:", error.message);
  }

  clearTimeout(checkTimeout);

  const previousConfirmedStatus =
    website.confirmedStatus ||
    (previousCheck?.status === "up" || previousCheck?.status === "down"
      ? previousCheck.status
      : "unknown");

  let status = previousConfirmedStatus;
  let consecutiveFailures = Number(website.consecutiveFailures) || 0;

  if (observedStatus === "up") {
    consecutiveFailures = 0;
    status = "up";
  } else {
    consecutiveFailures += 1;

    if (consecutiveFailures >= FAILURE_CONFIRMATION_COUNT) {
      status = "down";
    } else if (previousConfirmedStatus === "down") {
      status = "down";
    } else {
      status = "unknown";
    }
  }

  // ==========================================
  // SAVE MONITORING HISTORY
  // ==========================================

  const monitoringCheck = await MonitoringCheck.create({
    website: website._id,
    organization: website.organization,
    monitoredUrl: website.monitoringUrl || website.url,
    status,
    httpStatusCode,
    responseTime,
    sslStatus,
    sslExpiresAt,
    sslError,
    errorMessage,
    checkedAt: new Date(),
  });

  // ==========================================
  // UPDATE CONFIRMED WEBSITE STATUS
  // ==========================================

  website.lastCheckedAt = monitoringCheck.checkedAt;
  website.lastStatus = status;
  website.confirmedStatus = status;
  website.consecutiveFailures = consecutiveFailures;

  await website.save();

  // ==========================================
  // CREATE STATUS CHANGE ALERTS
  // ==========================================

  try {
    if (previousConfirmedStatus !== "down" && status === "down") {
      await createWebsiteDownAlert(website);

      console.log(`Website DOWN alert created: ${website.url}`);
    }

    if (previousConfirmedStatus === "down" && status === "up") {
      await createWebsiteRecoveredAlert(website);

      console.log(`Website RECOVERED alert created: ${website.url}`);
    }
  } catch (error) {
    console.error("Status Alert Creation Error:", error.message);
  }

  // ==========================================
  // CHECK SSL EXPIRATION WARNING
  // ==========================================

  if (sslStatus === "valid" && sslExpiresAt) {
    const currentTime = Date.now();
    const expiryTime = new Date(sslExpiresAt).getTime();

    const warningPeriod = SSL_EXPIRY_WARNING_DAYS * 24 * 60 * 60 * 1000;

    const remainingTime = expiryTime - currentTime;

    // Create an alert when the certificate expires
    // within the next 30 days.
    if (remainingTime > 0 && remainingTime <= warningPeriod) {
      try {
        const alert = await createSSLExpiringAlert(website, sslExpiresAt);

        if (alert) {
          console.log(`SSL expiration alert checked: ${website.url}`);
        }
      } catch (error) {
        console.error("SSL Expiration Alert Error:", error.message);
      }
    }
  }

  // ==========================================
  // RETURN MONITORING RESULT
  // ==========================================

  const result = {
    success: true,
    websiteId: website._id,
    websiteUrl: website.url,
    status,
    httpStatusCode,
    responseTime,
    sslStatus,
    sslExpiresAt,
    sslError,
    errorMessage,
    checkedAt: monitoringCheck.checkedAt,
  };

  activeWebsiteChecks.delete(websiteKey);
  return result;
  } catch (error) {
    console.error(`Website monitoring check failed for ${website.url}:`, error.message);
    throw error;
  } finally {
    clearTimeout(checkTimeout);
    activeWebsiteChecks.delete(websiteKey);
  }
};
