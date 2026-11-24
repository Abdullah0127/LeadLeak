import mongoose from "mongoose";

import Website from "../models/Website.js";
import Membership from "../models/Membership.js";

import { getWebsiteUptimeAnalytics } from "../services/uptimeAnalyticsService.js";

// ==========================================
// GET WEBSITE UPTIME ANALYTICS
// ==========================================

export const getWebsiteUptime = async (req, res) => {
  try {
    const { id } = req.params;
    const period = req.query.period || "24h";

    // ==========================================
    // VALIDATE WEBSITE ID
    // ==========================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid website ID.",
      });
    }

    // ==========================================
    // VALIDATE ANALYTICS PERIOD
    // ==========================================

    const supportedPeriods = ["24h", "7d", "30d"];

    if (!supportedPeriods.includes(period)) {
      return res.status(400).json({
        success: false,
        message: "Invalid period. Supported periods are 24h, 7d, and 30d.",
      });
    }

    // ==========================================
    // FIND WEBSITE
    // ==========================================

    const website = await Website.findById(id);

    if (!website) {
      return res.status(404).json({
        success: false,
        message: "Website not found.",
      });
    }

    // ==========================================
    // VERIFY ORGANIZATION MEMBERSHIP
    // ==========================================

    const membership = await Membership.findOne({
      user: req.user._id,
      organization: website.organization,
      status: "active",
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view this website's analytics.",
      });
    }

    // ==========================================
    // CALCULATE WEBSITE ANALYTICS
    // ==========================================

    const analytics = await getWebsiteUptimeAnalytics({
      websiteId: website._id,
      organizationId: website.organization,
      period,
    });

    // ==========================================
    // SUCCESS RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,
      message: "Website uptime analytics retrieved successfully.",

      website: {
        id: website._id,
        name: website.name,
        url: website.url,
      },

      analytics,
    });
  } catch (error) {
    console.error("Get website uptime analytics error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve website uptime analytics.",
    });
  }
};
