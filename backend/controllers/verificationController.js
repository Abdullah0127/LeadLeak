import crypto from "node:crypto";
import net from "node:net";
import { lookup } from "node:dns/promises";

import Website from "../models/Website.js";
import Membership from "../models/Membership.js";

// ==========================================
// WEBSITE VERIFICATION SECURITY HELPERS
// ==========================================

// CHECK WHETHER AN IP ADDRESS IS PUBLIC
const isPublicIP = (ip) => {
  const version = net.isIP(ip);

  if (version === 4) {
    const [a, b] = ip.split(".").map(Number);

    return !(
      a === 0 ||
      a === 10 ||
      a === 127 ||
      a >= 224 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 198 && (b === 18 || b === 19))
    );
  }

  if (version === 6) {
    return /^[23]/i.test(ip);
  }

  return false;
};

// VALIDATE WEBSITE URL BEFORE REQUESTING IT
const validatePublicWebsite = async (websiteUrl) => {
  const url = new URL(websiteUrl);

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only HTTP and HTTPS websites are allowed.");
  }

  if (url.username || url.password) {
    throw new Error("Website URLs cannot contain credentials.");
  }

  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");

  // DEVELOPMENT-ONLY LOCAL WEBSITE SUPPORT
  const isDevelopment = process.env.NODE_ENV === "development";

  const isLocalhost =
    hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";

  if (isLocalhost) {
    if (!isDevelopment) {
      throw new Error("Local websites are not allowed.");
    }

    // Only allow the Vite development server
    if (url.port !== "5173") {
      throw new Error(
        "Development verification only allows localhost port 5173.",
      );
    }

    return url;
  }

  // BLOCK PRIVATE AND LOCAL HOSTNAMES
  if (
    !hostname ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    net.isIP(hostname)
  ) {
    throw new Error("This website address is not allowed.");
  }

  // CHECK DNS RESOLUTION
  const addresses = await lookup(hostname, {
    all: true,
    verbatim: true,
  });

  if (
    addresses.length === 0 ||
    addresses.some(({ address }) => !isPublicIP(address))
  ) {
    throw new Error("This website does not resolve to a public IP address.");
  }

  return url;
};

// ==========================================
// FETCH WEBSITE HTML
// ==========================================

const fetchWebsiteHTML = async (websiteUrl) => {
  let currentUrl = websiteUrl;

  for (let attempt = 0; attempt < 4; attempt++) {
    const url = await validatePublicWebsite(currentUrl);

    const response = await fetch(url, {
      method: "GET",
      redirect: "manual",
      signal: AbortSignal.timeout(10000),
      headers: {
        "User-Agent": "LeadLeak-Website-Verification/1.0",
        Accept: "text/html",
      },
    });

    // HANDLE REDIRECTS
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");

      await response.body?.cancel();

      if (!location || attempt === 3) {
        throw new Error("Too many website redirects.");
      }

      currentUrl = new URL(location, url).toString();
      continue;
    }

    if (!response.ok) {
      throw new Error(`Website returned HTTP status ${response.status}.`);
    }

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.toLowerCase().includes("text/html")) {
      throw new Error("The website did not return an HTML page.");
    }

    const contentLength = Number(response.headers.get("content-length") || 0);

    if (contentLength > 1024 * 1024) {
      throw new Error("Website HTML is too large to verify.");
    }

    if (!response.body) {
      throw new Error("Website returned an empty response.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let html = "";
    let totalBytes = 0;

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      totalBytes += value.length;

      if (totalBytes > 1024 * 1024) {
        await reader.cancel();
        throw new Error("Website HTML is too large to verify.");
      }

      html += decoder.decode(value, { stream: true });
    }

    html += decoder.decode();

    return html;
  }

  throw new Error("Unable to reach the website.");
};

// ==========================================
// EXTRACT VERIFICATION META TAG TOKEN
// ==========================================

const getVerificationMetaToken = (html) => {
  const metaTags = html.match(/<meta\b[^>]*>/gi) || [];

  for (const tag of metaTags) {
    const nameMatch = tag.match(/\bname\s*=\s*["']([^"']+)["']/i);

    const contentMatch = tag.match(/\bcontent\s*=\s*["']([^"']+)["']/i);

    if (
      nameMatch?.[1]?.toLowerCase() === "leadleak-verification" &&
      contentMatch
    ) {
      return contentMatch[1];
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
