import net from "node:net";
import { lookup } from "node:dns/promises";

// ==========================================
// WEBSITE SECURITY CONFIGURATION
// ==========================================

// Block private, local, and reserved IP ranges.
const blockedIPs = new net.BlockList();

// ==========================================
// BLOCKED IPv4 RANGES
// ==========================================

const blockedIPv4Ranges = [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.88.99.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
];

// ==========================================
// BLOCKED IPv6 RANGES
// ==========================================

const blockedIPv6Ranges = [
  ["::", 128],
  ["::1", 128],
  ["fc00::", 7],
  ["fe80::", 10],
  ["ff00::", 8],
  ["2001:db8::", 32],
];

for (const [address, prefix] of blockedIPv4Ranges) {
  blockedIPs.addSubnet(address, prefix, "ipv4");
}

for (const [address, prefix] of blockedIPv6Ranges) {
  blockedIPs.addSubnet(address, prefix, "ipv6");
}

// ==========================================
// CHECK WHETHER AN IP ADDRESS IS PUBLIC
// ==========================================

export const isPublicIP = (ip) => {
  const version = net.isIP(ip);

  if (!version) {
    return false;
  }

  // IPv4-mapped IPv6 addresses need special handling.
  if (version === 6 && ip.toLowerCase().startsWith("::ffff:")) {
    const mappedIPv4 = ip.slice(7);

    if (net.isIPv4(mappedIPv4)) {
      return isPublicIP(mappedIPv4);
    }

    return false;
  }

  return !blockedIPs.check(ip, version === 4 ? "ipv4" : "ipv6");
};

// ==========================================
// VALIDATE WEBSITE URL
// ==========================================

export const validatePublicWebsite = async (websiteUrl) => {
  let url;

  try {
    url = new URL(websiteUrl);
  } catch {
    throw new Error("Invalid website URL.");
  }

  // Only HTTP and HTTPS are allowed.
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only HTTP and HTTPS websites are allowed.");
  }

  // Block URLs containing usernames or passwords.
  if (url.username || url.password) {
    throw new Error("Website URLs cannot contain credentials.");
  }

  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");

  // ========================================
  // DEVELOPMENT-ONLY LOCAL WEBSITE SUPPORT
  // ========================================

  const isDevelopment = process.env.NODE_ENV === "development";

  const isLocalhost =
    hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";

  if (isLocalhost) {
    if (!isDevelopment || url.port !== "5173") {
      throw new Error("Local websites are not allowed.");
    }

    return url;
  }

  // ========================================
  // BLOCK OTHER LOCAL HOSTNAMES
  // ========================================

  if (
    !hostname ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local")
  ) {
    throw new Error("Local websites are not allowed.");
  }

  // ========================================
  // CHECK DIRECT IP ADDRESSES
  // ========================================

  const ipVersion = net.isIP(hostname);

  if (ipVersion) {
    if (!isPublicIP(hostname)) {
      throw new Error("Private or reserved IP addresses are not allowed.");
    }

    return url;
  }

  // ========================================
  // REJECT MALFORMED HOSTNAMES
  // ========================================

  if (
    hostname.includes("/") ||
    hostname.includes("\\") ||
    hostname.includes("%")
  ) {
    throw new Error("Invalid website hostname.");
  }

  // ========================================
  // RESOLVE HOSTNAME THROUGH DNS
  // ========================================

  let addresses;

  try {
    addresses = await lookup(hostname, {
      all: true,
      verbatim: true,
    });
  } catch {
    throw new Error("Website hostname could not be resolved.");
  }

  // Every resolved IP must be public.
  if (
    addresses.length === 0 ||
    addresses.some(({ address }) => !isPublicIP(address))
  ) {
    throw new Error(
      "This website does not resolve exclusively to public IP addresses.",
    );
  }

  return url;
};
