import mongoose from "mongoose";
import crypto from "node:crypto";

import Website from "../models/Website.js";
import Membership from "../models/Membership.js";
import Organization from "../models/Organization.js";
import ContactFormMonitor from "../models/ContactFormMonitor.js";
import { validatePublicWebsite } from "../utils/websiteSecurity.js";

// ========================================
// CREATE NEW WEBSITE
// ========================================
export const createWebsite = async (req, res) => {
  try {
    const { name, url, organizationId } = req.body;

    if (!mongoose.isValidObjectId(organizationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organization ID.",
      });
    }

    const membership = await Membership.findOne({
      user: req.user._id,
      organization: organizationId,
      status: "active",
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this workspace.",
      });
    }

    const organization = await Organization.findOne({
      _id: organizationId,
      isActive: true,
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found or inactive.",
      });
    }

    try {
      await validatePublicWebsite(url);
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError.message,
      });
    }

    const website = await Website.create({
      name: name || new URL(url).hostname,
      url,
      monitoringUrl: url,
      organization: organizationId,
      addedBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Website added successfully!",
      website,
    });
  } catch (error) {
    console.error("Create Website Error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This website already exists in this workspace.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to add website.",
    });
  }
};

// ========================================
// GET ALL WEBSITES IN A WORKSPACE
// ========================================
export const getWebsites = async (req, res) => {
  try {
    const { organizationId } = req.params;

    if (!mongoose.isValidObjectId(organizationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organization ID.",
      });
    }

    const membership = await Membership.findOne({
      user: req.user._id,
      organization: organizationId,
      status: "active",
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this workspace.",
      });
    }

    const websites = await Website.find({
      organization: organizationId,
      isArchived: { $ne: true },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: websites.length,
      websites,
    });
  } catch (error) {
    console.error("Get Websites Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve websites.",
    });
  }
};

// ========================================
// GET SINGLE WEBSITE
// ========================================
export const getWebsite = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid website ID.",
      });
    }

    const website = await Website.findById(id);

    if (!website) {
      return res.status(404).json({
        success: false,
        message: "Website not found.",
      });
    }

    if (website.isArchived) {
      return res.status(404).json({
        success: false,
        message: "Website not found.",
      });
    }

    const membership = await Membership.findOne({
      user: req.user._id,
      organization: website.organization,
      status: "active",
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this website.",
      });
    }

    return res.status(200).json({
      success: true,
      website,
    });
  } catch (error) {
    console.error("Get Website Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve website.",
    });
  }
};

// ========================================
// UPDATE WEBSITE
// ========================================
export const updateWebsite = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, url } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid website ID.",
      });
    }

    const website = await Website.findById(id);

    if (!website) {
      return res.status(404).json({
        success: false,
        message: "Website not found.",
      });
    }

    if (website.isArchived) {
      return res.status(404).json({
        success: false,
        message: "Website not found.",
      });
    }

    const membership = await Membership.findOne({
      user: req.user._id,
      organization: website.organization,
      status: "active",
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this website.",
      });
    }

    if (!["owner", "admin"].includes(membership.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update this website.",
      });
    }

    if (name !== undefined) website.name = name;

    if (url !== undefined) {
      try {
        await validatePublicWebsite(url);
      } catch (validationError) {
        return res.status(400).json({
          success: false,
          message: validationError.message,
        });
      }

      if (url !== website.url) {
        const changedAt = new Date();
        website.url = url;
        website.monitoringUrl = url;
        website.monitoringUrlChangedAt = changedAt;
        website.verificationStatus = "pending";
        website.verificationToken = crypto.randomBytes(32).toString("hex");
        website.verifiedAt = null;
        website.isMonitoringEnabled = false;
        website.lastStatus = "unknown";
        website.confirmedStatus = "unknown";
        website.lastCheckedAt = null;
        website.consecutiveFailures = 0;
      }
    }

    await website.save();

    return res.status(200).json({
      success: true,
      message: "Website updated successfully!",
      website,
    });
  } catch (error) {
    console.error("Update Website Error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This website already exists in this workspace.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update website.",
    });
  }
};

// ========================================
// ENABLE OR DISABLE WEBSITE MONITORING
// ========================================
export const toggleWebsiteMonitoring = async (req, res) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid website ID.",
      });
    }

    if (typeof enabled !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "The enabled field must be true or false.",
      });
    }

    const website = await Website.findById(id);

    if (!website) {
      return res.status(404).json({
        success: false,
        message: "Website not found.",
      });
    }

    if (website.isArchived) {
      return res.status(404).json({
        success: false,
        message: "Website not found.",
      });
    }

    // Check active workspace membership.
    const membership = await Membership.findOne({
      user: req.user._id,
      organization: website.organization,
      status: "active",
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this website.",
      });
    }

    // Only owners and admins can control monitoring.
    if (!["owner", "admin"].includes(membership.role)) {
      return res.status(403).json({
        success: false,
        message: "Only workspace owners and admins can manage monitoring.",
      });
    }

    // A website must be verified before monitoring can be enabled.
    if (enabled && website.verificationStatus !== "verified") {
      return res.status(400).json({
        success: false,
        message: "Please verify website ownership before enabling monitoring.",
      });
    }

    website.isMonitoringEnabled = enabled;

    await website.save();

    return res.status(200).json({
      success: true,
      message: enabled
        ? "Website monitoring enabled successfully."
        : "Website monitoring disabled successfully.",
      website: {
        _id: website._id,
        name: website.name,
        url: website.url,
        verificationStatus: website.verificationStatus,
        isMonitoringEnabled: website.isMonitoringEnabled,
      },
    });
  } catch (error) {
    console.error("Toggle Website Monitoring Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update website monitoring settings.",
    });
  }
};

// ========================================
// DELETE WEBSITE
// ========================================
export const deleteWebsite = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid website ID.",
      });
    }

    const website = await Website.findById(id);

    if (!website) {
      return res.status(404).json({
        success: false,
        message: "Website not found.",
      });
    }

    const membership = await Membership.findOne({
      user: req.user._id,
      organization: website.organization,
      status: "active",
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this website.",
      });
    }

    if (!["owner", "admin"].includes(membership.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this website.",
      });
    }

    if (website.isArchived) {
      return res.status(200).json({
        success: true,
        message: "Website deleted successfully!",
      });
    }

    const archivedAt = new Date();

    let session = null;

    try {
      session = await mongoose.startSession();
      await session.withTransaction(async () => {
        await ContactFormMonitor.updateMany(
          { organization: website.organization, website: website._id },
          {
            $set: {
              isArchived: true,
              archivedAt,
              isMonitoringEnabled: false,
            },
          },
          { session },
        );

        await Website.findByIdAndUpdate(
          website._id,
          {
            $set: {
              isArchived: true,
              archivedAt,
              archivedBy: req.user._id,
              isMonitoringEnabled: false,
              confirmedStatus: "unknown",
              lastStatus: "unknown",
              lastCheckedAt: null,
              consecutiveFailures: 0,
            },
          },
          { session, returnDocument: "after" },
        );
      });
    } catch (transactionError) {
      console.error(
        "Website archive transaction unavailable:",
        transactionError.message,
      );

      await ContactFormMonitor.updateMany(
        { organization: website.organization, website: website._id },
        {
          $set: {
            isArchived: true,
            archivedAt,
            isMonitoringEnabled: false,
          },
        },
      );

      await Website.findByIdAndUpdate(
        website._id,
        {
          $set: {
            isArchived: true,
            archivedAt,
            archivedBy: req.user._id,
            isMonitoringEnabled: false,
            confirmedStatus: "unknown",
            lastStatus: "unknown",
            lastCheckedAt: null,
            consecutiveFailures: 0,
          },
        },
        { returnDocument: "after" },
      );
    } finally {
      if (session) {
        await session.endSession();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Website deleted successfully!",
    });
  } catch (error) {
    console.error("Delete Website Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to delete website.",
    });
  }
};
