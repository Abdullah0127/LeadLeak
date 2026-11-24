import net from "node:net";
import { lookup } from "node:dns/promises";
import http from "node:http";
import https from "node:https";

// ==========================================
// WEBSITE SECURITY CONFIGURATION
// ==========================================

// Block private, local, and reserved IP ranges.
const blockedIPs = new net.BlockList();
const globalIPv6Unicast = new net.BlockList();
globalIPv6Unicast.addSubnet("2000::", 3, "ipv6");

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
  ["64:ff9b::", 96],
  ["100::", 64],
  ["2001::", 23],
  ["2001:db8::", 32],
  ["2002::", 16],
  ["3fff::", 20],
];

const DNS_RESOLUTION_TIMEOUT_MS = Math.min(
  10000,
  Math.max(
    1000,
    Number.parseInt(process.env.DNS_RESOLUTION_TIMEOUT_MS || "3000", 10) ||
      3000,
  ),
);

const isLocalHostname = (hostname) => {
  const normalized = hostname.toLowerCase().replace(/\.$/, "");
  return (
    normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    normalized.endsWith(".local")
  );
};

const isValidDNSHostname = (hostname) =>
  hostname.length <= 253 &&
  hostname.split(".").every(
    (label) =>
      label.length >= 1 &&
      label.length <= 63 &&
      /^[a-z\d](?:[a-z\d-]*[a-z\d])?$/i.test(label),
  );

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
  if (version === 6) {
    const normalized = ip.toLowerCase();
    const mappedMatch = normalized.match(/^(?:::ffff:)(.+)$/);
    if (mappedMatch) {
      const suffix = mappedMatch[1];
      if (net.isIPv4(suffix)) return isPublicIP(suffix);

      const words = normalized.replace(/^::ffff:/, "").split(":");
      if (words.length === 2 && words.every((word) => /^[\da-f]{1,4}$/.test(word))) {
        const high = Number.parseInt(words[0], 16);
        const low = Number.parseInt(words[1], 16);
        return isPublicIP(
          `${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`,
        );
      }
      return false;
    }

    // Only globally routable unicast space is accepted.
    return (
      globalIPv6Unicast.check(ip, "ipv6") &&
      !blockedIPs.check(ip, "ipv6")
    );
  }

  return !blockedIPs.check(ip, "ipv4");
};

const resolveHostnameWithTimeout = async (hostname, signal) => {
  if (signal?.aborted) {
    throw signal.reason instanceof Error
      ? signal.reason
      : new Error("Website request was aborted.");
  }

  let timeout;
  let abortHandler;
  const lookupPromise = lookup(hostname, { all: true, verbatim: true });

  try {
    const guards = [
      lookupPromise,
      new Promise((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error("Website DNS lookup timed out.")),
          DNS_RESOLUTION_TIMEOUT_MS,
        );
      }),
    ];

    if (signal) {
      guards.push(
        new Promise((_, reject) => {
          abortHandler = () =>
            reject(
              signal.reason instanceof Error
                ? signal.reason
                : new Error("Website request was aborted."),
            );
          signal.addEventListener("abort", abortHandler, { once: true });
        }),
      );
    }

    return await Promise.race(guards);
  } catch (error) {
    throw new Error(error.message || "Website hostname could not be resolved.");
  } finally {
    clearTimeout(timeout);
    if (signal && abortHandler) {
      signal.removeEventListener("abort", abortHandler);
    }
  }
};

// ==========================================
// VALIDATE WEBSITE URL
// ==========================================

export const validatePublicWebsite = async (websiteUrl, { signal } = {}) => {
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
  // BLOCK OTHER LOCAL HOSTNAMES
  // ========================================

  if (!hostname || isLocalHostname(hostname)) {
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

  if (!isValidDNSHostname(hostname.replace(/\.$/, ""))) {
    throw new Error("Invalid website hostname.");
  }

  // ========================================
  // RESOLVE HOSTNAME THROUGH DNS
  // ========================================

  const addresses = await resolveHostnameWithTimeout(hostname, signal);

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

// Resolve a hostname and return only one validated public destination.
// Callers must connect to this address instead of the original hostname.
export const resolveValidatedPublicAddress = async (
  websiteUrl,
  { signal } = {},
) => {
  let url;
  try {
    url = new URL(websiteUrl);
  } catch {
    throw new Error("Invalid website URL.");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only HTTP and HTTPS websites are allowed.");
  }
  if (url.username || url.password) {
    throw new Error("Website URLs cannot contain credentials.");
  }

  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  const ipVersion = net.isIP(hostname);

  if (!hostname || isLocalHostname(hostname)) {
    throw new Error("Local websites are not allowed.");
  }

  if (ipVersion) {
    if (!isPublicIP(hostname)) {
      throw new Error("Private or reserved IP addresses are not allowed.");
    }
    return {
      url,
      hostname,
      address: hostname,
      family: ipVersion,
    };
  }

  if (!isValidDNSHostname(hostname.replace(/\.$/, ""))) {
    throw new Error("Invalid website hostname.");
  }

  const addresses = await resolveHostnameWithTimeout(hostname, signal);

  if (
    addresses.length === 0 ||
    addresses.some(({ address }) => !isPublicIP(address))
  ) {
    throw new Error(
      "This website does not resolve exclusively to public IP addresses.",
    );
  }

  const publicAddress = addresses[0];

  return {
    url,
    hostname,
    address: publicAddress.address,
    family: net.isIP(publicAddress.address),
  };
};

// Perform an HTTP(S) request through a prevalidated IP while retaining
// the original Host header and TLS server name.
export const secureWebsiteRequest = async ({
  url,
  method = "GET",
  headers = {},
  timeoutMs = 15000,
  maxBytes = 1024 * 1024,
  signal,
}) => {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error("Website request timeout must be a positive number.");
  }
  if (!Number.isFinite(maxBytes) || maxBytes <= 0) {
    throw new Error("Website response size limit must be a positive number.");
  }
  if (signal?.aborted) {
    throw signal.reason instanceof Error
      ? signal.reason
      : new Error("Website request was aborted.");
  }

  const requestController = new AbortController();
  const abortFromCaller = () =>
    requestController.abort(
      signal.reason instanceof Error
        ? signal.reason
        : new Error("Website request was aborted."),
    );
  signal?.addEventListener("abort", abortFromCaller, { once: true });

  const timeout = setTimeout(
    () => requestController.abort(new Error("Website request timed out.")),
    timeoutMs,
  );
  const requestSignal = requestController.signal;

  try {
    const destination = await resolveValidatedPublicAddress(url, {
      signal: requestSignal,
    });
    if (requestSignal.aborted) {
      throw requestSignal.reason instanceof Error
        ? requestSignal.reason
        : new Error("Website request was aborted.");
    }

    const requestUrl = destination.url;
    const transport = requestUrl.protocol === "https:" ? https : http;

    return await new Promise((resolve, reject) => {
      let settled = false;
      let responseStream;

      const finish = (callback, value) => {
        if (settled) return;
        settled = true;
        requestSignal.removeEventListener("abort", abortRequest);
        if (callback === reject) {
          responseStream?.destroy();
          req.destroy(value instanceof Error ? value : undefined);
        }
        callback(value);
      };

      const abortRequest = () => {
        const reason =
          requestSignal.reason instanceof Error
            ? requestSignal.reason
            : new Error("Website request was aborted.");
        responseStream?.destroy();
        req.destroy(reason);
      };

      const options = {
        protocol: requestUrl.protocol,
        hostname: destination.address,
        port:
          Number(requestUrl.port) ||
          (requestUrl.protocol === "https:" ? 443 : 80),
        method,
        path: `${requestUrl.pathname}${requestUrl.search}`,
        headers: {
          ...headers,
          Host: requestUrl.host,
          Connection: "close",
        },
      };

      if (
        requestUrl.protocol === "https:" &&
        !net.isIP(destination.hostname)
      ) {
        options.servername = destination.hostname;
      }

      const req = transport.request(options, (response) => {
        responseStream = response;
        const chunks = [];
        let receivedBytes = 0;

        response.on("data", (chunk) => {
          receivedBytes += chunk.length;
          if (receivedBytes > maxBytes) {
            const error = new Error(
              `Response exceeded ${maxBytes} bytes.`,
            );
            response.destroy();
            req.destroy();
            finish(reject, error);
            return;
          }
          chunks.push(chunk);
        });

        response.on("end", () => {
          const body = Buffer.concat(chunks);
          finish(resolve, {
            status: response.statusCode || 0,
            statusCode: response.statusCode || 0,
            ok:
              (response.statusCode || 0) >= 200 &&
              (response.statusCode || 0) < 400,
            headers: {
              get(name) {
                const value = response.headers[String(name).toLowerCase()];
                return Array.isArray(value) ? value.join(", ") : value ?? null;
              },
              raw: response.headers,
            },
            body,
            text: () => body.toString("utf8"),
            destroy: () => response.destroy(),
          });
        });

        response.on("aborted", () =>
          finish(reject, new Error("Website response was interrupted.")),
        );
        response.on("error", (error) => finish(reject, error));
      });

      req.setTimeout(timeoutMs, () =>
        req.destroy(new Error("Website request timed out.")),
      );
      req.on("error", (error) => {
        responseStream?.destroy();
        finish(reject, error);
      });
      requestSignal.addEventListener("abort", abortRequest, { once: true });
      req.on("close", () =>
        requestSignal.removeEventListener("abort", abortRequest),
      );
      req.end();
    });
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abortFromCaller);
  }
};
