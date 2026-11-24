import mongoose from "mongoose";

import Website from "../models/Website.js";
import Membership from "../models/Membership.js";
import MonitoringCheck from "../models/MonitoringCheck.js";

import { checkWebsite } from "../services/websiteMonitoringService.js";

// ========================================
// MANUALLY CHECK WEBSITE STATUS
// ========================================
export const runWebsiteCheck = async (req, res) => {
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

    if (website.verificationStatus !== "verified") {
      return res.status(400).json({
        success: false,
        message: "Please verify website ownership before monitoring.",
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

    const result = await checkWebsite(website);

    return res.status(200).json({
      success: true,
      message: "Website monitoring check completed.",
      result,
    });
  } catch (error) {
    console.error("Website Monitoring Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to complete website monitoring check.",
    });
  }
};

// ========================================
// GET WEBSITE MONITORING HISTORY
// ========================================
export const getWebsiteMonitoringHistory = async (req, res) => {
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

    // Check active workspace membership
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

    // Pagination
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 20),
    );

    const skip = (page - 1) * limit;

    // Retrieve monitoring history
    const [checks, total] = await Promise.all([
      MonitoringCheck.find({
        website: website._id,
        organization: website.organization,
      })
        .sort({ checkedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      MonitoringCheck.countDocuments({
        website: website._id,
        organization: website.organization,
      }),
    ]);

    return res.status(200).json({
      success: true,
      website: {
        id: website._id,
        name: website.name,
        url: website.url,
        lastStatus: website.lastStatus,
        lastCheckedAt: website.lastCheckedAt,
      },
      history: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        checks,
      },
    });
  } catch (error) {
    console.error("Monitoring History Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve monitoring history.",
    });
  }
};
