import Membership from "../models/Membership.js";
import Alert from "../models/Alert.js";
import Website from "../models/Website.js";

import { sendEmail } from "./emailService.js";

import {
  MAX_DELIVERY_ATTEMPTS,
  RETRY_DELAY_MINUTES,
} from "../constants/alertConfig.js";

// ==========================================
// ALERT EMAIL SERVICE
// ==========================================

// ==========================================
// ESCAPE HTML CONTENT
// ==========================================

const escapeHTML = (value = "") => {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
};

// ==========================================
// SEND ALERT EMAIL
// ==========================================

export const sendAlertEmail = async (alert) => {
  let claimedAlert;

  try {
    // Atomically claim the alert.
    // Only one process can claim a pending alert.
    claimedAlert = await Alert.findOneAndUpdate(
      {
        _id: alert._id,
        status: "pending",
        deliveryAttempts: {
          $lt: MAX_DELIVERY_ATTEMPTS,
        },
      },
      {
        $inc: {
          deliveryAttempts: 1,
        },
        $set: {
          status: "sending",
          sendingAt: new Date(),
          nextRetryAt: null,
        },
      },
      {
        returnDocument: "after",
      },
    );

    if (!claimedAlert) {
      return {
        success: false,
        message:
          "Alert is already being processed, sent, or has reached its retry limit.",
      };
    }

    // ==========================================
    // FIND ACTIVE ORGANIZATION MEMBERSHIPS
    // ==========================================

    const memberships = await Membership.find({
      organization: claimedAlert.organization,
      status: "active",
    }).populate({
      path: "user",
      match: {
        isActive: true,
      },
      select: "name email",
    });

    // Get unique recipient email addresses
    const recipients = [
      ...new Set(
        memberships.map((membership) => membership.user?.email).filter(Boolean),
      ),
    ];

    if (recipients.length === 0) {
      throw new Error(
        "No active organization members with valid email addresses were found.",
      );
    }

    // ==========================================
    // GET WEBSITE DETAILS
    // ==========================================

    // A populated website has a URL.
    // Otherwise, retrieve it using the stored ObjectId.
    const website = alert.website?.url
      ? alert.website
      : await Website.findById(claimedAlert.website);

    const websiteUrl = website?.url || "Website details unavailable";

    // ==========================================
    // PREPARE EMAIL CONTENT
    // ==========================================

    const safeTitle = escapeHTML(claimedAlert.title);
    const safeMessage = escapeHTML(claimedAlert.message);
    const safeWebsiteUrl = escapeHTML(websiteUrl);

    // ==========================================
    // SEND NOTIFICATION EMAIL
    // ==========================================

    const emailResult = await sendEmail({
      to: recipients,

      subject: `LeadLeak Alert: ${claimedAlert.title}`,

      text: `
Hello,

${claimedAlert.title}

${claimedAlert.message}

Website: ${websiteUrl}

This notification was generated automatically by LeadLeak.

Regards,
LeadLeak Team
      `.trim(),

      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; color: #252525;">
          <h2 style="color: #782F40;">${safeTitle}</h2>

          <p>${safeMessage}</p>

          <p>
            <strong>Website:</strong>
            ${safeWebsiteUrl}
          </p>

          <hr style="border: 0; border-top: 1px solid #E8DFD3; margin: 24px 0;" />

          <p style="color: #625D59; font-size: 13px;">
            This notification was generated automatically by LeadLeak.
          </p>
        </div>
      `,
    });

    // ==========================================
    // SAVE SUCCESSFUL DELIVERY
    // ==========================================

    // Update only if this process still owns the claim.
    const sentAlert = await Alert.findOneAndUpdate(
      {
        _id: claimedAlert._id,
        status: "sending",
        sendingAt: claimedAlert.sendingAt,
      },
      {
        $set: {
          status: "sent",
          recipientEmails: recipients,
          recipientEmail: recipients[0],
          sentAt: new Date(),
          lastDeliveryError: null,
          nextRetryAt: null,
          sendingAt: null,
        },
      },
      {
        returnDocument: "after",
      },
    );

    if (!sentAlert) {
      console.error(
        `Email was sent for alert ${claimedAlert._id}, but its delivery status could not be updated because its claim changed.`,
      );
    }

    console.log(
      `Alert email sent successfully to ${recipients.length} organization member(s).`,
    );

    return {
      success: true,
      recipients,
      messageId: emailResult?.messageId,
      attempts: claimedAlert.deliveryAttempts,
    };
  } catch (error) {
    console.error("Alert email delivery failed:", error.message);

    // ==========================================
    // HANDLE DELIVERY FAILURE
    // ==========================================

    if (claimedAlert) {
      const attempts = claimedAlert.deliveryAttempts;

      const canRetry = attempts < MAX_DELIVERY_ATTEMPTS;

      const nextRetryAt = canRetry
        ? new Date(Date.now() + RETRY_DELAY_MINUTES * 60 * 1000)
        : null;

      try {
        // Update only if this process still owns the claim.
        const failedAlert = await Alert.findOneAndUpdate(
          {
            _id: claimedAlert._id,
            status: "sending",
            sendingAt: claimedAlert.sendingAt,
          },
          {
            $set: {
              status: canRetry ? "pending" : "failed",
              lastDeliveryError: error.message,
              nextRetryAt,
              sendingAt: null,
            },
          },
          {
            returnDocument: "after",
          },
        );

        if (!failedAlert) {
          console.error(
            `Could not update alert ${claimedAlert._id}: its delivery claim has changed.`,
          );
        } else if (canRetry) {
          console.log(
            `Email retry scheduled for ${nextRetryAt.toISOString()}.`,
          );
        } else {
          console.error(
            `Email delivery permanently failed after ${attempts} attempts.`,
          );
        }
      } catch (updateError) {
        console.error(
          "Could not update alert delivery status:",
          updateError.message,
        );
      }
    }

    return {
      success: false,
      error: error.message,
      attempts: claimedAlert?.deliveryAttempts || 0,
    };
  }
};
