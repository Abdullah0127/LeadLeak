
import tls from "node:tls";
import net from "node:net";
import { resolveValidatedPublicAddress } from "../utils/websiteSecurity.js";

// ==========================================
// SSL CERTIFICATE MONITORING SERVICE
// ==========================================

const SSL_TIMEOUT = 10000;

// ==========================================
// CHECK SSL CERTIFICATE
// ==========================================

const CERTIFICATE_ERROR_CODES = new Set([
  "CERT_HAS_EXPIRED",
  "CERT_NOT_YET_VALID",
  "DEPTH_ZERO_SELF_SIGNED_CERT",
  "SELF_SIGNED_CERT_IN_CHAIN",
  "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
  "ERR_TLS_CERT_ALTNAME_INVALID",
]);

const isCertificateError = (error) =>
  CERTIFICATE_ERROR_CODES.has(error.code) ||
  String(error.code || "").startsWith("ERR_TLS_CERT_");

export const checkSSLCertificate = async (
  websiteUrl,
  { signal, timeoutMs = SSL_TIMEOUT } = {},
) => {
  if (signal?.aborted) {
    return {
      sslStatus: "unknown",
      sslError:
        signal.reason instanceof Error
          ? signal.reason.message
          : "SSL check was aborted.",
    };
  }

  const controller = new AbortController();
  const abortFromCaller = () =>
    controller.abort(
      signal.reason instanceof Error
        ? signal.reason
        : new Error("SSL check was aborted."),
    );
  signal?.addEventListener("abort", abortFromCaller, { once: true });

  const timeout = setTimeout(
    () => controller.abort(new Error("SSL connection timed out.")),
    timeoutMs,
  );

  try {
    const destination = await resolveValidatedPublicAddress(websiteUrl, {
      signal: controller.signal,
    });
    const url = destination.url;

    if (url.protocol !== "https:") {
      return {
        sslStatus: "unknown",
        sslError: "Website does not use HTTPS.",
      };
    }

    return await new Promise((resolve) => {
      const hostname = destination.hostname;
      const port = Number(url.port) || 443;
      let settled = false;

      const finish = (result) => {
        if (settled) return;
        settled = true;
        controller.signal.removeEventListener("abort", abortSocket);
        socket.destroy();
        resolve(result);
      };

      const socket = tls.connect(
        {
          host: destination.address,
          port,
          ...(net.isIP(hostname) ? {} : { servername: hostname }),
          rejectUnauthorized: true,
        },
        () => {
          const certificate = socket.getPeerCertificate();
          if (!certificate || Object.keys(certificate).length === 0) {
            return finish({
              sslStatus: "invalid",
              sslError: "SSL certificate could not be retrieved.",
            });
          }

          const expiresAt = new Date(certificate.valid_to);
          const isExpired =
            Number.isNaN(expiresAt.getTime()) ||
            expiresAt.getTime() <= Date.now();

          if (isExpired) {
            return finish({
              sslStatus: "invalid",
              sslError: "SSL certificate has expired or has an invalid expiry date.",
              sslExpiresAt: Number.isNaN(expiresAt.getTime())
                ? null
                : expiresAt,
            });
          }

          return finish({
            sslStatus: "valid",
            sslError: null,
            sslExpiresAt: expiresAt,
          });
        },
      );

      const abortSocket = () => {
        const reason =
          controller.signal.reason instanceof Error
            ? controller.signal.reason
            : new Error("SSL check was aborted.");
        finish({ sslStatus: "unknown", sslError: reason.message });
      };

      controller.signal.addEventListener("abort", abortSocket, { once: true });
      if (controller.signal.aborted) abortSocket();
      socket.on("error", (error) => {
        finish({
          sslStatus: isCertificateError(error) ? "invalid" : "unknown",
          sslError: error.message || "SSL connection failed.",
        });
      });
    });
  } catch (error) {
    return {
      sslStatus: isCertificateError(error) ? "invalid" : "unknown",
      sslError: error.message || "SSL certificate check failed.",
    };
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abortFromCaller);
  }
};
