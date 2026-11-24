import { useCallback, useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import "./WebsiteDetails.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const PERIODS = [
  { label: "24 Hours", value: "24h" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
];

const HISTORY_LIMIT = 10;

// ==========================================
// FORMATTERS
// ==========================================

const formatDateTime = (date) => {
  if (!date) return "Not available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "Not available";

  return parsedDate.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatPercentage = (value) => {
  if (value == null || !Number.isFinite(Number(value))) return "N/A";
  return `${Number(value).toFixed(2)}%`;
};

const formatDuration = (milliseconds) => {
  if (milliseconds == null || !Number.isFinite(Number(milliseconds))) {
    return "Not available";
  }

  const totalMinutes = Math.floor(Number(milliseconds) / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const formatResponseTime = (value) => {
  if (value == null || !Number.isFinite(Number(value))) return "N/A";
  return `${Math.round(Number(value))} ms`;
};

const getStatusLabel = (status) => {
  if (status === "up") return "Online";
  if (status === "down") return "Down";
  return "Unknown";
};

// ==========================================
// SMALL REUSABLE COMPONENTS
// ==========================================

function DetailStat({ label, value, description, icon, tone = "brand" }) {
  return (
    <div className="detail-stat-card">
      <div className="detail-stat-top">
        <span className={`detail-stat-icon ${tone}`}>{icon}</span>
      </div>

      <p className="detail-stat-label">{label}</p>
      <p className="detail-stat-value">{value}</p>
      <p className="detail-stat-description">{description}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalizedStatus = status || "unknown";

  return (
    <span className={`detail-status-badge ${normalizedStatus}`}>
      <span className="detail-status-dot" />
      {getStatusLabel(normalizedStatus)}
    </span>
  );
}

function HistoryStatus({ status }) {
  return (
    <span className={`history-status ${status || "unknown"}`}>
      {getStatusLabel(status)}
    </span>
  );
}

// ==========================================
// WEBSITE DETAILS PAGE
// ==========================================

function WebsiteDetails() {
  const { id: websiteId } = useParams();
  const navigate = useNavigate();
  const outletContext = useOutletContext() || {};
  const organization = outletContext.organization;

  const [website, setWebsite] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [history, setHistory] = useState({
    checks: [],
    total: 0,
    page: 1,
    limit: HISTORY_LIMIT,
    totalPages: 0,
  });

  const [period, setPeriod] = useState("24h");
  const [historyPage, setHistoryPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  // ==========================================
  // AUTHENTICATION
  // ==========================================

  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem("auth-token");
    localStorage.removeItem("user");
    localStorage.removeItem("active-organization");

    navigate("/login", { replace: true });
  }, [navigate]);

  // ==========================================
  // FETCH WEBSITE INFORMATION
  // ==========================================

  const fetchWebsite = useCallback(
    async (token) => {
      const savedOrganization = localStorage.getItem("active-organization");

      if (!savedOrganization) {
        throw new Error("No active workspace was found.");
      }

      let organizationId;

      try {
        organizationId = JSON.parse(savedOrganization)?._id;
      } catch {
        throw new Error("Workspace information is invalid.");
      }

      if (!organizationId) {
        throw new Error("Workspace information is incomplete.");
      }

      const response = await fetch(
        `${API_BASE_URL}/websites/organization/${organizationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return null;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to load website information.");
      }

      const foundWebsite = (data.websites || []).find(
        (item) => item._id === websiteId,
      );

      if (!foundWebsite) {
        throw new Error(
          "Website not found or you do not have access to this website.",
        );
      }

      setWebsite(foundWebsite);
      return foundWebsite;
    },
    [handleUnauthorized, websiteId],
  );

  // ==========================================
  // FETCH UPTIME ANALYTICS
  // ==========================================

  const fetchAnalytics = useCallback(
    async (token) => {
      setAnalyticsLoading(true);

      try {
        const response = await fetch(
          `${API_BASE_URL}/analytics/websites/${websiteId}/uptime?period=${period}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (response.status === 401) {
          handleUnauthorized();
          return;
        }

        if (!response.ok) {
          throw new Error(data.message || "Unable to load uptime analytics.");
        }

        setAnalytics(data.analytics || null);

        if (data.website) {
          setWebsite((current) => ({ ...current, ...data.website }));
        }
      } catch (err) {
        setAnalytics(null);
        setError(err.message || "Unable to load uptime analytics.");
      } finally {
        setAnalyticsLoading(false);
      }
    },
    [handleUnauthorized, period, websiteId],
  );

  // ==========================================
  // FETCH MONITORING HISTORY
  // ==========================================

  const fetchHistory = useCallback(
    async (token, page = historyPage) => {
      setHistoryLoading(true);

      try {
        const response = await fetch(
          `${API_BASE_URL}/monitoring/${websiteId}/history?page=${page}&limit=${HISTORY_LIMIT}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (response.status === 401) {
          handleUnauthorized();
          return;
        }

        if (!response.ok) {
          throw new Error(data.message || "Unable to load monitoring history.");
        }

        setHistory(
          data.history || {
            checks: [],
            total: 0,
            page: 1,
            limit: HISTORY_LIMIT,
            totalPages: 0,
          },
        );
      } catch (err) {
        setError(err.message || "Unable to load monitoring history.");
      } finally {
        setHistoryLoading(false);
      }
    },
    [handleUnauthorized, historyPage, websiteId],
  );

  // ==========================================
  // INITIAL WEBSITE LOAD
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    const loadWebsite = async () => {
      const token = localStorage.getItem("auth-token");

      if (!token) {
        handleUnauthorized();
        return;
      }

      setLoading(true);
      setError("");

      try {
        await fetchWebsite(token);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load website.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadWebsite();

    return () => {
      cancelled = true;
    };
  }, [fetchWebsite, handleUnauthorized]);

  // ==========================================
  // LOAD ANALYTICS WHEN PERIOD CHANGES
  // ==========================================

  useEffect(() => {
    if (!website) return;

    const token = localStorage.getItem("auth-token");
    if (!token) {
      handleUnauthorized();
      return;
    }

    fetchAnalytics(token);
  }, [websiteId, period, website?._id, fetchAnalytics, handleUnauthorized]);

  // ==========================================
  // LOAD HISTORY WHEN PAGE CHANGES
  // ==========================================

  useEffect(() => {
    if (!website) return;

    const token = localStorage.getItem("auth-token");
    if (!token) {
      handleUnauthorized();
      return;
    }

    fetchHistory(token, historyPage);
  }, [websiteId, website?._id, historyPage, fetchHistory, handleUnauthorized]);

  // ==========================================
  // MANUAL WEBSITE CHECK
  // ==========================================

  const handleCheckNow = async () => {
    const token = localStorage.getItem("auth-token");

    if (!token) {
      handleUnauthorized();
      return;
    }

    setChecking(true);
    setError("");
    setActionMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/monitoring/${websiteId}/check`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to check this website.");
      }

      setActionMessage(data.message || "Website check completed successfully.");

      await fetchWebsite(token);
      await Promise.all([fetchAnalytics(token), fetchHistory(token, 1)]);

      setHistoryPage(1);
    } catch (err) {
      setError(err.message || "Unable to complete website check.");
    } finally {
      setChecking(false);
    }
  };

  // ==========================================
  // ANALYTICS VALUES
  // ==========================================

  const uptime = analytics?.uptime || {};
  const coverage = analytics?.coverage || {};
  const performance = analytics?.performance || {};
  const checks = analytics?.checks || {};

  const uptimePercentage = uptime.percentage;
  const coveragePercentage = coverage.percentage;

  const averageResponseTime =
    performance.averageResponseTime ??
    performance.avgResponseTime ??
    performance.averageResponseTimeMs ??
    null;

  const totalChecks = checks.total ?? analytics?.totalChecks ?? 0;

  const upDuration = uptime.upDurationMs ?? 0;
  const downDuration = uptime.downDurationMs ?? 0;
  const unknownDuration = uptime.unknownDurationMs ?? 0;
  const totalDuration = uptime.totalDurationMs ?? 0;

  const upWidth = totalDuration > 0 ? (upDuration / totalDuration) * 100 : 0;
  const downWidth =
    totalDuration > 0 ? (downDuration / totalDuration) * 100 : 0;
  const unknownWidth =
    totalDuration > 0 ? (unknownDuration / totalDuration) * 100 : 100;

  const latestCheck = history.checks?.[0];
  const currentStatus = website?.lastStatus || latestCheck?.status || null;

  // ==========================================
  // LOADING STATE
  // ==========================================

  if (loading) {
    return (
      <main className="website-details-page">
        <div className="detail-loading">
          <span className="detail-spinner" />
          <p>Loading website details...</p>
        </div>
      </main>
    );
  }

  // ==========================================
  // ERROR STATE
  // ==========================================

  if (error && !website) {
    return (
      <main className="website-details-page">
        <div className="detail-error-state">
          <h2>Unable to load website</h2>
          <p>{error}</p>
          <button type="button" onClick={() => navigate("/websites")}>
            Back to Websites
          </button>
        </div>
      </main>
    );
  }

  if (!website) return null;

  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (
    <main className="website-details-page">
      <div className="website-details-container">
        {/* BREADCRUMB */}

        <button
          type="button"
          className="detail-back-button"
          onClick={() => navigate("/websites")}
        >
          <span aria-hidden="true">←</span>
          Back to Websites
        </button>

        {/* WEBSITE HEADER */}

        <section className="detail-website-header">
          <div className="detail-website-heading">
            <div className="detail-website-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3a15 15 0 0 1 0 18" />
              </svg>
            </div>

            <div className="detail-website-title">
              <p className="detail-eyebrow">
                {organization?.name || "Website overview"}
              </p>
              <h1>{website.name || website.url}</h1>
              <a href={website.url} target="_blank" rel="noopener noreferrer">
                {website.url}
                <span aria-hidden="true"> ↗</span>
              </a>
            </div>
          </div>

          <div className="detail-header-actions">
            <span
              className={`detail-verification-badge ${
                website.verificationStatus === "verified"
                  ? "verified"
                  : "pending"
              }`}
            >
              {website.verificationStatus || "pending"}
            </span>

            <button
              type="button"
              className="detail-check-button"
              onClick={handleCheckNow}
              disabled={checking || website.verificationStatus !== "verified"}
              title={
                website.verificationStatus !== "verified"
                  ? "Verify website ownership before checking"
                  : "Run a monitoring check now"
              }
            >
              {checking ? "Checking..." : "Check Now"}
            </button>
          </div>
        </section>

        {/* MESSAGES */}

        {error && (
          <div className="detail-message error" role="alert">
            {error}
          </div>
        )}

        {actionMessage && (
          <div className="detail-message success" role="status">
            {actionMessage}
          </div>
        )}

        {/* WEBSITE STATUS */}

        <section className="detail-current-status">
          <div>
            <p className="detail-section-label">Current website status</p>
            <div className="detail-current-status-row">
              <StatusBadge status={currentStatus} />
              <span className="detail-status-description">
                {website.isMonitoringEnabled
                  ? "Automatic monitoring is enabled"
                  : "Automatic monitoring is disabled"}
              </span>
            </div>
          </div>

          <div className="detail-last-checked">
            <p>Last checked</p>
            <strong>
              {formatDateTime(website.lastCheckedAt || latestCheck?.checkedAt)}
            </strong>
          </div>
        </section>

        {/* ANALYTICS HEADER */}

        <section className="detail-section">
          <div className="detail-section-heading">
            <div>
              <p className="detail-eyebrow">PERFORMANCE OVERVIEW</p>
              <h2>Uptime analytics</h2>
              <p>Monitoring statistics for the selected period.</p>
            </div>

            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              aria-label="Analytics period"
              className="detail-period-select"
            >
              {PERIODS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {analyticsLoading ? (
            <div className="detail-inline-loading">
              <span className="detail-spinner" />
              Loading analytics...
            </div>
          ) : (
            <>
              <div className="detail-stats-grid">
                <DetailStat
                  label="Observed uptime"
                  value={formatPercentage(uptimePercentage)}
                  description="Uptime during observed monitoring time"
                  icon="↗"
                  tone="green"
                />

                <DetailStat
                  label="Monitoring coverage"
                  value={formatPercentage(coveragePercentage)}
                  description="Share of the selected period observed"
                  icon="◷"
                  tone="amber"
                />

                <DetailStat
                  label="Average response"
                  value={formatResponseTime(averageResponseTime)}
                  description="Average recorded response time"
                  icon="⌁"
                  tone="blue"
                />

                <DetailStat
                  label="Total checks"
                  value={totalChecks}
                  description="Monitoring records in this period"
                  icon="▤"
                  tone="brand"
                />
              </div>

              {Number(coveragePercentage) < 80 && (
                <div className="detail-coverage-notice">
                  <strong>Limited monitoring coverage</strong>
                  <p>
                    Only {formatPercentage(coveragePercentage)} of this period
                    has recorded monitoring observations. The remaining time is
                    treated as unknown, not assumed to be uptime or downtime.
                  </p>
                </div>
              )}

              {/* TIME BREAKDOWN */}

              <div className="detail-breakdown-card">
                <div className="detail-breakdown-heading">
                  <div>
                    <h3>Monitoring time breakdown</h3>
                    <p>How the selected period is classified.</p>
                  </div>
                </div>

                <div
                  className="detail-time-bar"
                  aria-label="Monitoring time breakdown"
                >
                  <span className="time-up" style={{ width: `${upWidth}%` }} />
                  <span
                    className="time-down"
                    style={{ width: `${downWidth}%` }}
                  />
                  <span
                    className="time-unknown"
                    style={{ width: `${unknownWidth}%` }}
                  />
                </div>

                <div className="detail-breakdown-legend">
                  <div>
                    <span className="legend-dot up" />
                    <span>
                      <strong>UP</strong>
                      <small>{formatDuration(upDuration)}</small>
                    </span>
                  </div>

                  <div>
                    <span className="legend-dot down" />
                    <span>
                      <strong>DOWN</strong>
                      <small>{formatDuration(downDuration)}</small>
                    </span>
                  </div>

                  <div>
                    <span className="legend-dot unknown" />
                    <span>
                      <strong>UNKNOWN</strong>
                      <small>{formatDuration(unknownDuration)}</small>
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        {/* MONITORING HISTORY */}

        <section className="detail-section detail-history-section">
          <div className="detail-section-heading">
            <div>
              <p className="detail-eyebrow">RECENT ACTIVITY</p>
              <h2>Monitoring history</h2>
              <p>
                {history.total} recorded{" "}
                {history.total === 1 ? "check" : "checks"} for this website.
              </p>
            </div>
          </div>

          {historyLoading ? (
            <div className="detail-inline-loading">
              <span className="detail-spinner" />
              Loading monitoring history...
            </div>
          ) : history.checks?.length === 0 ? (
            <div className="detail-history-empty">
              <h3>No monitoring history yet</h3>
              <p>
                Monitoring records will appear here after the first website
                check.
              </p>
            </div>
          ) : (
            <>
              <div className="detail-history-table-wrapper">
                <table className="detail-history-table">
                  <thead>
                    <tr>
                      <th>Check time</th>
                      <th>Status</th>
                      <th>Response time</th>
                      <th>HTTP code</th>
                      <th>SSL</th>
                      <th>Details</th>
                    </tr>
                  </thead>

                  <tbody>
                    {history.checks.map((check) => (
                      <tr key={check._id}>
                        <td>{formatDateTime(check.checkedAt)}</td>
                        <td>
                          <HistoryStatus status={check.status} />
                        </td>
                        <td>{formatResponseTime(check.responseTime)}</td>
                        <td>{check.httpStatusCode ?? "—"}</td>
                        <td>
                          <span
                            className={`history-ssl-badge ${
                              check.sslStatus || "unknown"
                            }`}
                          >
                            {check.sslStatus || "unknown"}
                          </span>
                        </td>
                        <td>
                          {check.errorMessage || check.sslError ? (
                            <span
                              className="history-error-text"
                              title={[check.errorMessage, check.sslError]
                                .filter(Boolean)
                                .join(" | ")}
                            >
                              {check.errorMessage || check.sslError}
                            </span>
                          ) : (
                            <span className="history-no-error">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}

              <div className="detail-pagination">
                <p>
                  Page {history.page || historyPage} of{" "}
                  {history.totalPages || 1}
                </p>

                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setHistoryPage((page) => Math.max(1, page - 1))
                    }
                    disabled={historyPage <= 1 || historyLoading}
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setHistoryPage((page) =>
                        Math.min(history.totalPages || 1, page + 1),
                      )
                    }
                    disabled={
                      historyPage >= (history.totalPages || 1) || historyLoading
                    }
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

        {/* SSL INFORMATION */}

        {latestCheck && (
          <section className="detail-ssl-card">
            <div>
              <p className="detail-eyebrow">SECURITY</p>
              <h2>SSL certificate information</h2>
              <p>
                Latest recorded SSL status:{" "}
                <strong>{latestCheck.sslStatus || "unknown"}</strong>
              </p>
            </div>

            <div className="detail-ssl-expiry">
              <span>Certificate expiry</span>
              <strong>{formatDateTime(latestCheck.sslExpiresAt)}</strong>
            </div>

            {latestCheck.sslError && (
              <p className="detail-ssl-error">{latestCheck.sslError}</p>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

export default WebsiteDetails;
