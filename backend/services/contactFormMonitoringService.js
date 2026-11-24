import mongoose from "mongoose";

import ContactFormMonitor from "../models/ContactFormMonitor.js";
import Website from "../models/Website.js";

import { validatePublicWebsite } from "../utils/websiteSecurity.js";

// ==========================================
// CONTACT FORM MONITORING SERVICE
// ==========================================

// ==========================================
// VALIDATE FORM MONITOR CONFIGURATION
// ==========================================

export const validateContactFormMonitor = async ({
  organization,
  website,
  name,
  formUrl,
  formType,
}) => {
  if (!organization || !mongoose.isValidObjectId(organization)) {
    throw new Error("Valid organization ID is required.");
  }

  if (!website || !mongoose.isValidObjectId(website)) {
    throw new Error("Valid website ID is required.");
  }

  if (!name || !name.trim()) {
    throw new Error("Form monitor name is required.");
  }

  if (!formUrl || !formUrl.trim()) {
    throw new Error("Form URL is required.");
  }

  const allowedFormTypes = ["elementor", "contact_form_7", "custom"];

  if (!allowedFormTypes.includes(formType)) {
    throw new Error("Invalid contact form type.");
  }

  // ==========================================
  // VERIFY WEBSITE OWNERSHIP
  // ==========================================

  const websiteRecord = await Website.findOne({
    _id: website,
    organization,
    verificationStatus: "verified",
  });

  if (!websiteRecord) {
    throw new Error("Verified website not found for this organization.");
  }

  // ==========================================
  // VALIDATE FORM URL SECURITY
  // ==========================================

  const validatedUrl = await validatePublicWebsite(formUrl);

  if (!validatedUrl) {
    throw new Error("Form URL failed security validation.");
  }

  // ==========================================
  // ENSURE FORM URL BELONGS TO WEBSITE
  // ==========================================

  const websiteHost = new URL(websiteRecord.url).hostname;
  const formHost = new URL(validatedUrl).hostname;

  if (websiteHost !== formHost) {
    throw new Error("Form URL must belong to the monitored website.");
  }

  return {
    websiteRecord,
    validatedUrl,
  };
};

// ==========================================
// CREATE CONTACT FORM MONITOR
// ==========================================

export const createContactFormMonitor = async (data) => {
  const { organization, website, name, formUrl, formType } = data;

  const { validatedUrl } = await validateContactFormMonitor({
    organization,
    website,
    name,
    formUrl,
    formType,
  });

  const monitor = await ContactFormMonitor.create({
    organization,
    website,
    name,
    formUrl: validatedUrl,
    formType,
    isMonitoringEnabled: false,
    lastStatus: "unknown",
  });

  return monitor;
};

// ==========================================
// GET ORGANIZATION FORM MONITORS
// ==========================================

export const getOrganizationFormMonitors = async (organizationId) => {
  if (!mongoose.isValidObjectId(organizationId)) {
    throw new Error("Invalid organization ID.");
  }

  return ContactFormMonitor.find({
    organization: organizationId,
  })
    .populate("website", "name url")
    .sort({ createdAt: -1 });
};

// ==========================================
// GET SINGLE FORM MONITOR
// ==========================================

export const getContactFormMonitor = async (monitorId, organizationId) => {
  if (
    !mongoose.isValidObjectId(monitorId) ||
    !mongoose.isValidObjectId(organizationId)
  ) {
    throw new Error("Invalid ID.");
  }

  return ContactFormMonitor.findOne({
    _id: monitorId,
    organization: organizationId,
  }).populate("website", "name url");
};

// ==========================================
// DELETE CONTACT FORM MONITOR
// ==========================================

export const deleteContactFormMonitor = async (monitorId, organizationId) => {
  if (
    !mongoose.isValidObjectId(monitorId) ||
    !mongoose.isValidObjectId(organizationId)
  ) {
    throw new Error("Invalid ID.");
  }

  return ContactFormMonitor.findOneAndDelete({
    _id: monitorId,
    organization: organizationId,
  });
};
