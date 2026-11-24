import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

import "./Analytics.css";

// ========================================
// API CONFIGURATION
// ========================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const PERIODS = [
  { label: "Last 24 hours", value: "24h" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
];

// ========================================
// FORMAT HELPERS
// ========================================

const formatDuration = (milliseconds) => {
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) {
    return "0 minutes";
  }

  const totalMinutes = Math.floor(milliseconds / 60000);

  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  const parts = [];

  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

  return parts.join(" ");
};

const formatPercentage = (value) => {
  if (value === null || value === undefined) {
    return "N/A";
  }

  return `${Number(value).toFixed(2)}%`;
};

const formatResponseTime = (value) => {
  if (value === null || value === undefined) {
    return "N/A";
  }

  return `${Number(value).toFixed(0)} ms`;
};

// ========================================
// ANALYTICS STAT CARD
// ========================================

function StatCard({ label, value, description, icon, tone = "brand" }) {
  return (
    <article className="analytics-stat-card">
      <div className="analytics-stat-top">
        <p>{label}</p>

        <span className={`analytics-stat-icon ${tone}`}>{icon}</span>
      </div>

      <h3>{value}</h3>

      <p className="analytics-stat-description">{description}</p>
    </article>
  );
}

// ========================================
// ANALYTICS PAGE
// ========================================

function Analytics() {
  const { organization } = useOutletContext();
  const navigate = useNavigate();

  // ========================================
  // PAGE STATE
  // ========================================

  const [websites, setWebsites] = useState([]);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState("");
  const [period, setPeriod] = useState("24h");

  const [loadingWebsites, setLoadingWebsites] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const [analytics, setAnalytics] = useState(null);
  const [analyticsWebsite, setAnalyticsWebsite] = useState(null);

  const [websitesError, setWebsitesError] = useState("");
  const [analyticsError, setAnalyticsError] = useState("");

  const organizationId = organization?._id;

  // ========================================
  // HANDLE UNAUTHORIZED REQUESTS
  // ========================================

  const handleUnauthorized = () => {
    localStorage.removeItem("auth-token");
    localStorage.removeItem("user");
    localStorage.removeItem("active-organization");

    navigate("/login", { replace: true });
  };

  // ========================================
  // LOAD WORKSPACE WEBSITES
  // ========================================

  useEffect(() => {
    if (!organizationId) {
      setWebsites([]);
      setSelectedWebsiteId("");
      setLoadingWebsites(false);
      return;
    }

    const controller = new AbortController();

    const loadWebsites = async () => {
      const token = localStorage.getItem("auth-token");

      if (!token) {
        handleUnauthorized();
        return;
      }

      try {
        setLoadingWebsites(true);
        setWebsitesError("");

        setWebsites([]);
        setSelectedWebsiteId("");
        setAnalytics(null);

        const response = await fetch(
          `${API_BASE_URL}/websites/organization/${organizationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          },
        );

        if (response.status === 401) {
          handleUnauthorized();
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load your websites.");
        }

        if (controller.signal.aborted) return;

        const websiteList = data.websites || [];

        setWebsites(websiteList);

        if (websiteList.length > 0) {
          setSelectedWebsiteId(websiteList[0]._id);
        }
      } catch (error) {
        if (error.name === "AbortError") return;

        if (!controller.signal.aborted) {
          setWebsitesError(error.message || "Unable to load your websites.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingWebsites(false);
        }
      }
    };

    loadWebsites();

    return () => controller.abort();
  }, [organizationId, navigate]);

  // ========================================
  // LOAD SELECTED WEBSITE ANALYTICS
  // ========================================

  useEffect(() => {
    if (!selectedWebsiteId) {
      setAnalytics(null);
      setAnalyticsWebsite(null);
      setAnalyticsError("");
      return;
    }

    const controller = new AbortController();

    const loadAnalytics = async () => {
      const token = localStorage.getItem("auth-token");

      if (!token) {
        handleUnauthorized();
        return;
      }

      try {
        setLoadingAnalytics(true);
        setAnalyticsError("");
        setAnalytics(null);

        const response = await fetch(
          `${API_BASE_URL}/analytics/websites/${selectedWebsiteId}/uptime?period=${period}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          },
        );

        if (response.status === 401) {
          handleUnauthorized();
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load website analytics.");
        }

        if (controller.signal.aborted) return;

        setAnalytics(data.analytics || null);
        setAnalyticsWebsite(data.website || null);
      } catch (error) {
        if (error.name === "AbortError") return;

        if (!controller.signal.aborted) {
          setAnalyticsError(
            error.message || "Unable to load website analytics.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingAnalytics(false);
        }
      }
    };

    loadAnalytics();

    return () => controller.abort();
  }, [selectedWebsiteId, period, navigate]);

  // ========================================
  // DERIVED ANALYTICS VALUES
  // ========================================

  const uptime = analytics?.uptime;
  const coverage = analytics?.coverage;
  const performance = analytics?.performance;
  const checks = analytics?.checks;

  const coveragePercentage = Number(coverage?.percentage || 0);

  const upPercentage =
    uptime?.totalDurationMs > 0
      ? (uptime.upDurationMs / uptime.totalDurationMs) * 100
      : 0;

  const downPercentage =
    uptime?.totalDurationMs > 0
      ? (uptime.downDurationMs / uptime.totalDurationMs) * 100
      : 0;

  const unknownPercentage = Math.max(0, 100 - upPercentage - downPercentage);

  const hasAnalytics = Boolean(analytics);

  const selectedWebsite = websites.find(
    (website) => website._id === selectedWebsiteId,
  );

  // ========================================
  // PAGE
  // ========================================

  return (
    <main className="analytics-page">
      <div className="analytics-container">
        {/* PAGE HEADER */}

        <section className="analytics-header">
          <div>
            <p className="analytics-eyebrow">
              {organization?.name || "Your workspace"}
            </p>

            <h2>Website Analytics</h2>

            <p>
              Understand website availability, uptime, and performance through
              your monitoring history.
            </p>
          </div>

          <div className="analytics-header-icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-5 5" />
            </svg>
          </div>
        </section>

        {/* WEBSITE AND PERIOD FILTERS */}

        <section className="analytics-filter-card">
          <div className="analytics-filter-group">
            <label htmlFor="analytics-website">Select website</label>

            <select
              id="analytics-website"
              value={selectedWebsiteId}
              onChange={(event) => setSelectedWebsiteId(event.target.value)}
              disabled={loadingWebsites || websites.length === 0}
            >
              {websites.length === 0 && (
                <option value="">No websites available</option>
              )}

              {websites.map((website) => (
                <option key={website._id} value={website._id}>
                  {website.name || website.url}
                </option>
              ))}
            </select>
          </div>

          <div className="analytics-filter-group">
            <label htmlFor="analytics-period">Time period</label>

            <select
              id="analytics-period"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              disabled={!selectedWebsiteId}
            >
              {PERIODS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* WEBSITE INFORMATION */}

        {selectedWebsite && (
          <section className="analytics-website-info">
            <div className="analytics-website-symbol">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3a15 15 0 0 1 0 18" />
              </svg>
            </div>

            <div className="analytics-website-details">
              <h3>{analyticsWebsite?.name || selectedWebsite.name}</h3>

              <a
                href={analyticsWebsite?.url || selectedWebsite.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {analyticsWebsite?.url || selectedWebsite.url}
              </a>
            </div>

            <span
              className={`analytics-monitoring-status ${
                selectedWebsite.isMonitoringEnabled
                  ? "monitoring-enabled"
                  : "monitoring-disabled"
              }`}
            >
              <span />
              {selectedWebsite.isMonitoringEnabled
                ? "Monitoring enabled"
                : "Monitoring disabled"}
            </span>
          </section>
        )}

        {/* WEBSITE LOADING */}

        {loadingWebsites && (
          <div className="analytics-message">Loading your websites...</div>
        )}

        {/* WEBSITE ERROR */}

        {websitesError && (
          <div className="analytics-error">{websitesError}</div>
        )}

        {/* NO WEBSITES */}

        {!loadingWebsites && !websitesError && websites.length === 0 && (
          <div className="analytics-empty">
            <div className="analytics-empty-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18" />
              </svg>
            </div>

            <h3>No websites available</h3>

            <p>
              Add a website to your workspace before viewing its monitoring
              analytics.
            </p>

            <button type="button" onClick={() => navigate("/websites")}>
              Go to Websites
            </button>
          </div>
        )}

        {/* ANALYTICS LOADING */}

        {selectedWebsiteId && loadingAnalytics && (
          <div className="analytics-message">Loading website analytics...</div>
        )}

        {/* ANALYTICS ERROR */}

        {selectedWebsiteId && analyticsError && (
          <div className="analytics-error">{analyticsError}</div>
        )}

        {/* ANALYTICS CONTENT */}

        {!loadingAnalytics && !analyticsError && hasAnalytics && (
          <>
            {/* COVERAGE NOTICE */}

            <section
              className={`analytics-coverage-notice ${
                coveragePercentage < 80 ? "coverage-warning" : "coverage-good"
              }`}
            >
              <div className="analytics-notice-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
              </div>

              <div>
                <h3>
                  Monitoring coverage: {formatPercentage(coveragePercentage)}
                </h3>

                <p>
                  Uptime is calculated using observed monitoring time. Missing
                  monitoring periods are classified as unknown, not as uptime or
                  downtime.
                  {coveragePercentage < 80 &&
                    " Coverage is limited, so this result does not represent the entire selected period."}
                </p>
              </div>
            </section>

            {/* MAIN STATISTICS */}

            <section className="analytics-stats-grid">
              <StatCard
                label="Observed uptime"
                value={formatPercentage(uptime?.percentage)}
                description="Percentage of known monitoring time"
                icon="↑"
                tone="success"
              />

              <StatCard
                label="Monitoring coverage"
                value={formatPercentage(coverage?.percentage)}
                description="Percentage of the period with observations"
                icon="◷"
                tone="brand"
              />

              <StatCard
                label="Average response time"
                value={formatResponseTime(performance?.averageResponseTimeMs)}
                description="Average successful check response time"
                icon="↗"
                tone="orange"
              />

              <StatCard
                label="Total checks"
                value={checks?.total ?? 0}
                description="Monitoring checks during this period"
                icon="#"
                tone="neutral"
              />
            </section>

            {/* MONITORING TIME BREAKDOWN */}

            <section className="analytics-breakdown-card">
              <div className="analytics-section-heading">
                <div>
                  <h3>Monitoring time breakdown</h3>

                  <p>
                    How the selected period is divided between observed uptime,
                    downtime, and missing data.
                  </p>
                </div>
              </div>

              <div className="analytics-time-bar">
                {upPercentage > 0 && (
                  <div
                    className="analytics-time-segment segment-up"
                    style={{ width: `${upPercentage}%` }}
                    title={`UP: ${formatPercentage(upPercentage)}`}
                  />
                )}

                {downPercentage > 0 && (
                  <div
                    className="analytics-time-segment segment-down"
                    style={{ width: `${downPercentage}%` }}
                    title={`DOWN: ${formatPercentage(downPercentage)}`}
                  />
                )}

                {unknownPercentage > 0 && (
                  <div
                    className="analytics-time-segment segment-unknown"
                    style={{ width: `${unknownPercentage}%` }}
                    title={`UNKNOWN: ${formatPercentage(unknownPercentage)}`}
                  />
                )}
              </div>

              <div className="analytics-breakdown-list">
                <div className="analytics-breakdown-item">
                  <div className="analytics-breakdown-label">
                    <span className="analytics-dot dot-up" />
                    <span>Observed UP</span>
                  </div>

                  <div className="analytics-breakdown-value">
                    <strong>{formatDuration(uptime?.upDurationMs)}</strong>

                    <span>{formatPercentage(upPercentage)}</span>
                  </div>
                </div>

                <div className="analytics-breakdown-item">
                  <div className="analytics-breakdown-label">
                    <span className="analytics-dot dot-down" />
                    <span>Observed DOWN</span>
                  </div>

                  <div className="analytics-breakdown-value">
                    <strong>{formatDuration(uptime?.downDurationMs)}</strong>

                    <span>{formatPercentage(downPercentage)}</span>
                  </div>
                </div>

                <div className="analytics-breakdown-item">
                  <div className="analytics-breakdown-label">
                    <span className="analytics-dot dot-unknown" />
                    <span>Unknown / Missing</span>
                  </div>

                  <div className="analytics-breakdown-value">
                    <strong>{formatDuration(uptime?.unknownDurationMs)}</strong>

                    <span>{formatPercentage(unknownPercentage)}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* PERFORMANCE DETAILS */}

            <section className="analytics-performance-card">
              <div className="analytics-section-heading">
                <div>
                  <h3>Performance details</h3>

                  <p>
                    Additional information from successful monitoring checks.
                  </p>
                </div>
              </div>

              <div className="analytics-performance-grid">
                <div>
                  <span>Successful response samples</span>

                  <strong>
                    {performance?.successfulChecksWithResponseTime ?? 0}
                  </strong>
                </div>

                <div>
                  <span>Observed monitoring time</span>

                  <strong>
                    {formatDuration(coverage?.observedDurationMs)}
                  </strong>
                </div>

                <div>
                  <span>Missing monitoring time</span>

                  <strong>{formatDuration(coverage?.missingDurationMs)}</strong>
                </div>
              </div>
            </section>

            {/* DATA LIMITATION NOTE */}

            <p className="analytics-footer-note">
              Analytics are calculated from the monitoring records available for
              this website and selected time period. Results may change as new
              monitoring checks are collected.
            </p>
          </>
        )}
      </div>
    </main>
  );
}

export default Analytics;
