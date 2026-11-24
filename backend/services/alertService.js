import Alert from "../models/Alert.js";

import { sendAlertEmail } from "./alertEmailService.js";

// ==========================================
// ALERT SERVICE
// ==========================================

// ==========================================
// CREATE ALERT AND SEND EMAIL
// ==========================================

const createAndNotifyAlert = async (alertData) => {
  // Create alert in MongoDB first
  const alert = await Alert.create(alertData);

  // Load website details for the email
  try {
    const populatedAlert = await Alert.findById(alert._id).populate(
      "website",
      "name url",
    );

    await sendAlertEmail(populatedAlert);
  } catch (error) {
    // Email failure must not interrupt website monitoring
    console.error("Could not process alert email:", error.message);
  }

  return alert;
};

// ==========================================
// CREATE WEBSITE DOWN ALERT
// ==========================================

export const createWebsiteDownAlert = async (website) => {
  return createAndNotifyAlert({
    organization: website.organization,
    website: website._id,
    type: "website_down",
    title: "Website is down",
    message: `${website.url} is currently down and could not be reached successfully.`,
    status: "pending",
  });
};

// ==========================================
// CREATE WEBSITE RECOVERED ALERT
// ==========================================

export const createWebsiteRecoveredAlert = async (website) => {
  return createAndNotifyAlert({
    organization: website.organization,
    website: website._id,
    type: "website_recovered",
    title: "Website has recovered",
    message: `${website.url} is back online and responding successfully.`,
    status: "pending",
  });
};

// ==========================================
// CREATE SSL EXPIRATION ALERT
// ==========================================

export const createSSLExpiringAlert = async (website, expiresAt) => {
  const expiryDate = new Date(expiresAt);

  if (Number.isNaN(expiryDate.getTime())) {
    throw new Error("Invalid SSL certificate expiration date.");
  }

  // Check whether an alert already exists for this certificate
  const existingAlert = await Alert.findOne({
    website: website._id,
    type: "ssl_expiring",
    sslExpiresAt: expiryDate,
  });

  if (existingAlert) {
    return existingAlert;
  }

  const formattedDate = expiryDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  try {
    return await createAndNotifyAlert({
      organization: website.organization,
      website: website._id,
      type: "ssl_expiring",
      title: "SSL certificate expiring soon",
      message: `The SSL certificate for ${website.url} will expire on ${formattedDate}. Please renew it before expiration.`,
      sslExpiresAt: expiryDate,
      status: "pending",
    });
  } catch (error) {
    // Another monitoring check may have created the same alert
    if (error.code === 11000) {
      return await Alert.findOne({
        website: website._id,
        type: "ssl_expiring",
        sslExpiresAt: expiryDate,
      });
    }

    throw error;
  }
};
