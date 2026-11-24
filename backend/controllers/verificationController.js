import crypto from "node:crypto";

import Website from "../models/Website.js";
import Membership from "../models/Membership.js";
import { secureWebsiteRequest } from "../utils/websiteSecurity.js";

// ==========================================
// FETCH WEBSITE HTML
// ==========================================

const fetchWebsiteHTML = async (websiteUrl) => {
  let currentUrl = websiteUrl;
  const controller = new AbortController();
  const deadline = Date.now() + 15000;
  const timeout = setTimeout(
    () => controller.abort(new Error("Website verification timed out.")),
    deadline - Date.now(),
  );

  try {
    for (let attempt = 0; attempt < 4; attempt++) {
      const remainingTime = deadline - Date.now();
      if (remainingTime <= 0) {
        throw new Error("Website verification timed out.");
      }

      const response = await secureWebsiteRequest({
        url: currentUrl,
        method: "GET",
        timeoutMs: remainingTime,
        maxBytes: 1024 * 1024,
        signal: controller.signal,
        headers: {
          "User-Agent": "LeadLeak-Website-Verification/1.0",
          Accept: "text/html",
        },
      });

      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        response.destroy();

        if (!location || attempt === 3) {
          throw new Error("Too many website redirects.");
        }

        currentUrl = new URL(location, new URL(currentUrl)).toString();
        continue;
      }

      try {
        if (!response.ok) {
          throw new Error(`Website returned HTTP status ${response.status}.`);
        }

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.toLowerCase().includes("text/html")) {
          throw new Error("The website did not return an HTML page.");
        }

        const contentLength = Number(
          response.headers.get("content-length") || 0,
        );
        if (
          !Number.isFinite(contentLength) ||
          contentLength > 1024 * 1024 ||
          response.body.length > 1024 * 1024
        ) {
          throw new Error("Website HTML is too large or has an invalid size.");
        }

        const html = await response.text();
        if (!html.trim()) {
          throw new Error("Website returned an empty HTML response.");
        }
        return html;
      } finally {
        response.destroy();
      }
    }

    throw new Error("Unable to reach the website.");
  } finally {
    clearTimeout(timeout);
  }
};

// ==========================================
// EXTRACT VERIFICATION META TAG TOKEN
// ==========================================

const getVerificationMetaToken = (html) => {
  const metaTags =
    html.match(/<meta\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi) || [];

  for (const tag of metaTags) {
    const attributes = new Map();
    const attributePattern =
      /([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;
    let match;

    while ((match = attributePattern.exec(tag))) {
      attributes.set(
        match[1].toLowerCase(),
        match[2] ?? match[3] ?? match[4],
      );
    }

    if (
      attributes.get("name")?.toLowerCase() === "leadleak-verification" &&
      attributes.has("content")
    ) {
      return attributes.get("content");
    }
  }

  return null;
};

// ==========================================
// CHECK WEBSITE MEMBERSHIP
// ==========================================

const checkWebsitePermission = async (website, userId) => {
  const membership = await Membership.findOne({
    user: userId,
    organization: website.organization,
    status: "active",
  });

  if (!membership) {
    return {
      allowed: false,
      message: "You do not have access to this website.",
    };
  }

  if (!["owner", "admin"].includes(membership.role)) {
    return {
      allowed: false,
      message: "Only workspace owners and admins can verify websites.",
    };
  }

  return { allowed: true };
};

// ==========================================
// START WEBSITE VERIFICATION
// ==========================================

export const startWebsiteVerification = async (req, res) => {
  try {
    const { id } = req.params;

    const website = await Website.findById(id).select("+verificationToken");

    if (!website) {
      return res.status(404).json({
        success: false,
        message: "Website not found.",
      });
    }

    if (website.isArchived) {
      return res.status(404).json({
        success: false,
        message: "Archived websites cannot be verified.",
      });
    }

    const permission = await checkWebsitePermission(website, req.user._id);

    if (!permission.allowed) {
      return res.status(403).json({
        success: false,
        message: permission.message,
      });
    }

    // GENERATE A FRESH TOKEN
    const verificationToken = crypto.randomBytes(32).toString("hex");

    website.verificationToken = verificationToken;
    website.verificationStatus = "pending";
    website.verificationMethod = "meta_tag";
    website.verifiedAt = null;
    website.isMonitoringEnabled = false;

    await website.save();

    const metaTag = `<meta name="leadleak-verification" content="${verificationToken}" />`;

    return res.status(200).json({
      success: true,
      message: "Website verification token generated successfully.",

      verification: {
        websiteId: website._id,
        websiteUrl: website.url,
        method: "meta_tag",
        token: verificationToken,
        metaTag,

        instructions: [
          "Open your website's homepage HTML file.",
          "Add the provided meta tag inside the head section.",
          "Save your changes.",
          "Return to LeadLeak and complete verification.",
        ],
      },
    });
  } catch (error) {
    console.error("Start Website Verification Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to start website verification.",
    });
  }
};

// ==========================================
// COMPLETE WEBSITE VERIFICATION
// ==========================================

export const verifyWebsite = async (req, res) => {
  try {
    const { id } = req.params;

    const website = await Website.findById(id).select("+verificationToken");

    if (!website) {
      return res.status(404).json({
        success: false,
        message: "Website not found.",
      });
    }

    if (website.isArchived) {
      return res.status(404).json({
        success: false,
        message: "Archived websites cannot be verified.",
      });
    }

    const permission = await checkWebsitePermission(website, req.user._id);

    if (!permission.allowed) {
      return res.status(403).json({
        success: false,
        message: permission.message,
      });
    }

    if (website.verificationStatus === "verified") {
      return res.status(200).json({
        success: true,
        message: "Website is already verified.",
        verificationStatus: "verified",
        verifiedAt: website.verifiedAt,
      });
    }

    if (!website.verificationToken) {
      return res.status(400).json({
        success: false,
        message: "Please generate a verification token first.",
      });
    }

    // FETCH WEBSITE HOMEPAGE
    const html = await fetchWebsiteHTML(website.url);

    // EXTRACT TOKEN
    const foundToken = getVerificationMetaToken(html);

    // COMPARE TOKENS SAFELY
    const expected = Buffer.from(website.verificationToken);
    const received = Buffer.from(foundToken || "");

    const tokenMatches =
      expected.length === received.length &&
      crypto.timingSafeEqual(expected, received);

    if (!tokenMatches) {
      website.verificationStatus = "failed";

      await website.save();

      return res.status(400).json({
        success: false,
        message:
          "Verification failed. Meta tag was not found or token did not match.",
        verificationStatus: "failed",
      });
    }

    // MARK WEBSITE AS VERIFIED
    website.verificationStatus = "verified";
    website.verifiedAt = new Date();

    await website.save();

    return res.status(200).json({
      success: true,
      message: "Website ownership verified successfully!",
      verificationStatus: website.verificationStatus,
      verifiedAt: website.verifiedAt,
    });
  } catch (error) {
    console.error("Verify Website Error:", error.message);

    return res.status(502).json({
      success: false,
      message: error.message || "Unable to verify website.",
    });
  }
};
