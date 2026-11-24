import mongoose from "mongoose";

import Membership from "../models/Membership.js";

import {
  createContactFormMonitor,
  getOrganizationFormMonitors,
  getContactFormMonitor,
  deleteContactFormMonitor,
} from "../services/contactFormMonitoringService.js";

import { testLocalContactForm } from "../services/contactFormBrowserService.js";

import { saveContactFormCheck } from "../services/contactFormCheckService.js";

// ==========================================
// CONTACT FORM MONITOR CONTROLLER
// ==========================================

// ==========================================
// VERIFY ORGANIZATION MEMBERSHIP
// ==========================================

const verifyOrganizationMembership = async (userId, organizationId) => {
  return Membership.findOne({
    user: userId,
    organization: organizationId,
    status: "active",
  });
};

// ==========================================
// CREATE CONTACT FORM MONITOR
// ==========================================

export const createFormMonitor = async (req, res) => {
  try {
    const { organization, website, name, formUrl, formType } = req.body;

    if (!mongoose.isValidObjectId(organization)) {
      return res.status(400).json({
        success: false,
        message: "Valid organization ID is required.",
      });
    }

    const membership = await verifyOrganizationMembership(
      req.user._id,
      organization,
    );

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You are not an active member of this organization.",
      });
    }

    const monitor = await createContactFormMonitor({
      organization,
      website,
      name,
      formUrl,
      formType,
    });

    return res.status(201).json({
      success: true,
      message: "Contact form monitor created successfully.",
      monitor,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET ORGANIZATION FORM MONITORS
// ==========================================

export const getOrganizationFormMonitorsController = async (req, res) => {
  try {
    const { organizationId } = req.params;

    if (!mongoose.isValidObjectId(organizationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organization ID.",
      });
    }

    const membership = await verifyOrganizationMembership(
      req.user._id,
      organizationId,
    );

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You are not an active member of this organization.",
      });
    }

    const monitors = await getOrganizationFormMonitors(organizationId);

    return res.status(200).json({
      success: true,
      total: monitors.length,
      monitors,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET SINGLE CONTACT FORM MONITOR
// ==========================================

export const getFormMonitor = async (req, res) => {
  try {
    const { monitorId, organizationId } = req.params;

    if (
      !mongoose.isValidObjectId(monitorId) ||
      !mongoose.isValidObjectId(organizationId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid monitor or organization ID.",
      });
    }

    const membership = await verifyOrganizationMembership(
      req.user._id,
      organizationId,
    );

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You are not an active member of this organization.",
      });
    }

    const monitor = await getContactFormMonitor(monitorId, organizationId);

    if (!monitor) {
      return res.status(404).json({
        success: false,
        message: "Contact form monitor not found.",
      });
    }

    return res.status(200).json({
      success: true,
      monitor,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// MANUALLY TEST CONTACT FORM
// ==========================================

export const runContactFormTest = async (req, res) => {
  try {
    const { organizationId, monitorId } = req.params;

    if (
      !mongoose.isValidObjectId(organizationId) ||
      !mongoose.isValidObjectId(monitorId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid organization or monitor ID.",
      });
    }

    // ==========================================
    // VERIFY ORGANIZATION MEMBERSHIP
    // ==========================================

    const membership = await verifyOrganizationMembership(
      req.user._id,
      organizationId,
    );

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You are not an active member of this organization.",
      });
    }

    // ==========================================
    // FIND MONITOR
    // ==========================================

    const monitor = await getContactFormMonitor(monitorId, organizationId);

    if (!monitor) {
      return res.status(404).json({
        success: false,
        message: "Contact form monitor not found.",
      });
    }

    // ==========================================
    // RUN CONTROLLED LOCAL TEST
    // ==========================================

    const result = await testLocalContactForm(monitor.formUrl);

    // ==========================================
    // SAVE TEST HISTORY
    // ==========================================

    const savedCheck = await saveContactFormCheck({
      organization: monitor.organization,
      website: monitor.website,
      contactFormMonitor: monitor._id,
      result,
    });

    // ==========================================
    // RETURN TEST RESULT
    // ==========================================

    return res.status(200).json({
      success: result.result === "working",
      message:
        result.result === "working"
          ? "Contact form test completed successfully."
          : "Contact form test failed.",
      result,
      check: savedCheck,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// DELETE CONTACT FORM MONITOR
// ==========================================

export const deleteFormMonitor = async (req, res) => {
  try {
    const { monitorId, organizationId } = req.params;

    if (
      !mongoose.isValidObjectId(monitorId) ||
      !mongoose.isValidObjectId(organizationId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid monitor or organization ID.",
      });
    }

    const membership = await verifyOrganizationMembership(
      req.user._id,
      organizationId,
    );

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You are not an active member of this organization.",
      });
    }

    const monitor = await deleteContactFormMonitor(monitorId, organizationId);

    if (!monitor) {
      return res.status(404).json({
        success: false,
        message: "Contact form monitor not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact form monitor deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
