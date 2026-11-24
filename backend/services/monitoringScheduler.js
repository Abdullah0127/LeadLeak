import cron from "node-cron";

import Website from "../models/Website.js";
import Alert from "../models/Alert.js";

import { checkWebsite } from "./websiteMonitoringService.js";
import { sendAlertEmail } from "./alertEmailService.js";

import {
  MAX_DELIVERY_ATTEMPTS,
  EMAIL_SENDING_TIMEOUT_MINUTES,
} from "../constants/alertConfig.js";

// ==========================================
// AUTOMATIC MONITORING SCHEDULER
// ==========================================

let isMonitoringRunning = false;
let scheduledTask = null;

// ==========================================
// RECOVER STUCK EMAIL DELIVERIES
// ==========================================

const recoverStuckEmailDeliveries = async () => {
  try {
    const staleBefore = new Date(
      Date.now() - EMAIL_SENDING_TIMEOUT_MINUTES * 60 * 1000,
    );

    const stuckAlerts = await Alert.find({
      status: "sending",
      sendingAt: {
        $lte: staleBefore,
      },
    })
      .sort({ sendingAt: 1 })
      .limit(50);

    if (stuckAlerts.length === 0) {
      return;
    }

    console.log(`Found ${stuckAlerts.length} stuck email delivery attempt(s).`);

    for (const alert of stuckAlerts) {
      const canRetry = alert.deliveryAttempts < MAX_DELIVERY_ATTEMPTS;

      const nextRetryAt = canRetry ? new Date() : null;

      const recoveredAlert = await Alert.findOneAndUpdate(
        {
          _id: alert._id,
          status: "sending",
          sendingAt: alert.sendingAt,
        },
        {
          $set: {
            status: canRetry ? "pending" : "failed",
            sendingAt: null,
            nextRetryAt,
            lastDeliveryError:
              "Email delivery process stopped or timed out during an attempt.",
          },
        },
        {
          returnDocument: "after",
        },
      );

      if (recoveredAlert) {
        console.log(
          canRetry
            ? `Recovered alert ${alert._id}. It is ready for retry.`
            : `Alert ${alert._id} reached its retry limit and was marked as failed.`,
        );
      }
    }
  } catch (error) {
    console.error("Stuck email recovery error:", error.message);
  }
};

// ==========================================
// PROCESS PENDING EMAIL RETRIES
// ==========================================

const processPendingEmailRetries = async () => {
  try {
    const pendingAlerts = await Alert.find({
      status: "pending",

      deliveryAttempts: {
        $gte: 0,
        $lt: MAX_DELIVERY_ATTEMPTS,
      },

      nextRetryAt: {
        $lte: new Date(),
      },
    })
      .sort({ nextRetryAt: 1 })
      .limit(50);

    console.log(`Found ${pendingAlerts.length} email(s) ready for retry.`);

    for (const alert of pendingAlerts) {
      try {
        await sendAlertEmail(alert);
      } catch (error) {
        console.error(
          `Email retry failed for alert ${alert._id}:`,
          error.message,
        );
      }
    }
  } catch (error) {
    console.error("Email retry scheduler error:", error.message);
  }
};

// ==========================================
// START AUTOMATIC SCHEDULER
// ==========================================

export const startMonitoringScheduler = () => {
  if (scheduledTask) {
    console.log("Automatic monitoring scheduler is already running.");
    return scheduledTask;
  }

  scheduledTask = cron.schedule("*/5 * * * *", async () => {
    if (isMonitoringRunning) {
      console.log("Previous monitoring cycle is still running.");
      return;
    }

    isMonitoringRunning = true;

    console.log("Starting automatic monitoring cycle...");

    try {
      // Recover alerts left in sending state
      await recoverStuckEmailDeliveries();

      // Process failed email deliveries ready for retry
      await processPendingEmailRetries();

      // Find verified websites with monitoring enabled
      const websites = await Website.find({
        verificationStatus: "verified",
        isMonitoringEnabled: true,
      });

      console.log(`Found ${websites.length} websites to monitor.`);

      // Monitor websites one by one
      for (const website of websites) {
        try {
          const result = await checkWebsite(website);

          console.log(
            `Monitoring result: ${website.url} - ${result.status.toUpperCase()}`,
          );
        } catch (error) {
          console.error(`Monitoring failed for ${website.url}:`, error.message);
        }
      }

      console.log("Automatic monitoring cycle completed.");
    } catch (error) {
      console.error("Automatic monitoring scheduler error:", error);
    } finally {
      isMonitoringRunning = false;
    }
  });

  console.log(
    "Automatic monitoring and email retry scheduler started (every 5 minutes).",
  );

  return scheduledTask;
};
