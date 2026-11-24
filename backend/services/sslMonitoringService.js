
import tls from "node:tls";

// ==========================================
// SSL CERTIFICATE MONITORING SERVICE
// ==========================================

const SSL_TIMEOUT = 10000;

// ==========================================
// CHECK SSL CERTIFICATE
// ==========================================

export const checkSSLCertificate = (websiteUrl) => {
  return new Promise((resolve) => {
    let url;

    try {
      url = new URL(websiteUrl);
    } catch {
      return resolve({
        sslStatus: "unknown",
        sslError: "Invalid website URL.",
      });
    }

    // HTTP websites do not have SSL certificates.
    if (url.protocol !== "https:") {
      return resolve({
        sslStatus: "unknown",
        sslError: "Website does not use HTTPS.",
      });
    }

    const hostname = url.hostname;
    const port = Number(url.port) || 443;

    let settled = false;

    const finish = (result) => {
      if (settled) return;

      settled = true;
      resolve(result);
    };

    const socket = tls.connect(
      {
        host: hostname,
        port,
        servername: hostname,
        rejectUnauthorized: false,
      },
      () => {
        const certificate = socket.getPeerCertificate();

        if (!certificate || Object.keys(certificate).length === 0) {
          socket.destroy();

          return finish({
            sslStatus: "invalid",
            sslError: "SSL certificate could not be retrieved.",
          });
        }

        const isAuthorized = socket.authorized;
        const expiresAt = new Date(certificate.valid_to);
        const isExpired =
          Number.isNaN(expiresAt.getTime()) ||
          expiresAt.getTime() <= Date.now();

        socket.end();

        if (!isAuthorized || isExpired) {
          return finish({
            sslStatus: "invalid",
            sslError: isExpired
              ? "SSL certificate has expired or has an invalid expiry date."
              : socket.authorizationError?.message ||
                String(socket.authorizationError || "Invalid SSL certificate."),
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

    socket.setTimeout(SSL_TIMEOUT, () => {
      socket.destroy();

      finish({
        sslStatus: "unknown",
        sslError: "SSL connection timed out.",
      });
    });

    socket.on("error", (error) => {
      finish({
        sslStatus: "invalid",
        sslError: error.message || "SSL certificate check failed.",
      });
    });
  });
};
