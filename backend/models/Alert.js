import mongoose from "mongoose";

// ==========================================
// ALERT MODEL
// ==========================================

const alertSchema = new mongoose.Schema(
  {
    // Organization receiving the alert
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    // Website related to this alert
    website: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Website",
      required: true,
    },

    // Type of alert
    type: {
      type: String,
      enum: ["website_down", "website_recovered", "ssl_expiring"],
      required: true,
    },

    // Alert title
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Alert message
    message: {
      type: String,
      required: true,
    },

    // SSL certificate expiration date
    sslExpiresAt: {
      type: Date,
      default: null,
    },

    // Notification delivery status
    status: {
      type: String,
      enum: ["pending", "sending", "sent", "failed"],
      default: "pending",
    },

    // Email addresses receiving this alert
    recipientEmails: {
      type: [String],
      default: [],
    },

    // Legacy single recipient field
    recipientEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },

    // Total number of email delivery attempts
    deliveryAttempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Most recent email delivery error
    lastDeliveryError: {
      type: String,
      default: null,
    },

    // Earliest time the next retry can happen
    nextRetryAt: {
      type: Date,
      default: null,
    },

    // When an email delivery attempt started
    sendingAt: {
      type: Date,
      default: null,
    },

    // When the notification was successfully sent
    sentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// ==========================================
// ALERT INDEXES
// ==========================================

// Retrieve an organization's latest alerts
alertSchema.index({
  organization: 1,
  createdAt: -1,
});

// Find alerts eligible for email retries
alertSchema.index({
  status: 1,
  nextRetryAt: 1,
  deliveryAttempts: 1,
});

// Find email deliveries stuck in sending state
alertSchema.index({
  status: 1,
  sendingAt: 1,
});

// Prevent duplicate SSL alerts for the same website
// and certificate expiration date.
alertSchema.index(
  {
    website: 1,
    type: 1,
    sslExpiresAt: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      type: "ssl_expiring",
      sslExpiresAt: { $type: "date" },
    },
  },
);

const Alert = mongoose.model("Alert", alertSchema);

export default Alert;
