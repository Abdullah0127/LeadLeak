import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ========================================
// ALERT CONFIGURATION
// ========================================

const alertTypes = {
  website_down: {
    label: "Website Down",
    style: "bg-red-50 text-red-700",
  },
  website_recovered: {
    label: "Website Recovered",
    style: "bg-green-50 text-green-700",
  },
  ssl_expiring: {
    label: "SSL Expiring",
    style: "bg-amber-50 text-amber-700",
  },
};

const deliveryStyles = {
  pending: "bg-amber-50 text-amber-700",
  sent: "bg-green-50 text-green-700",
  failed: "bg-red-50 text-red-700",
};

// ========================================
// ALERTS PAGE
// ========================================

function Alerts() {
  const { organization } = useOutletContext();
  const navigate = useNavigate();

  // Use organization ID instead of the entire object.
  const organizationId = organization?._id;

  const [alerts, setAlerts] = useState([]);
  const [totalAlerts, setTotalAlerts] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [testOnly, setTestOnly] = useState(false);

  // ========================================
  // FETCH ORGANIZATION ALERTS
  // ========================================

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchAlerts = async () => {
      const token = localStorage.getItem("auth-token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/alerts/organization/${organizationId}?page=${page}&limit=20&type=${typeFilter}&status=${statusFilter}&test=${testOnly ? "true" : "false"}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          },
        );

        if (response.status === 401) {
          localStorage.removeItem("auth-token");
          localStorage.removeItem("user");
          localStorage.removeItem("active-organization");

          navigate("/login", { replace: true });
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load alerts.");
        }

        const alertData = data.alerts || {};

        if (!controller.signal.aborted) {
          setAlerts(alertData.records || []);
          setTotalAlerts(alertData.total ?? 0);
          setTotalPages(alertData.totalPages || 1);
        }
      } catch (err) {
        if (err.name === "AbortError") return;

        if (!controller.signal.aborted) {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchAlerts();

    // CANCEL OLD REQUESTS WHEN PAGE OR ORGANIZATION CHANGES
    return () => {
      controller.abort();
    };
  }, [organizationId, page, navigate, typeFilter, statusFilter, testOnly]);

  // ========================================
  // FORMAT DATE
  // ========================================

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <main className="min-h-screen w-full px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        {/* PAGE HEADER */}
        <section>
          <p className="mb-2 text-sm font-medium text-brand-700">
            Website Protection
          </p>

          <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Alerts
          </h2>

          <p className="mt-2 text-sm text-muted sm:text-base">
            Monitor important events and notifications from your websites.
          </p>
        </section>

        {/* TOTAL ALERTS */}
        <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-muted">
            Total Generated Alerts
          </p>

          <p className="mt-3 text-3xl font-bold text-ink tabular-nums">
            {loading ? "..." : totalAlerts}
          </p>

          <p className="mt-2 text-xs text-muted">
            Alerts generated in your current workspace
          </p>
        </section>

        {/* ALERT FILTERS */}
        <section className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-5 shadow-sm sm:flex-row sm:items-end">
          <label className="text-xs font-semibold text-muted sm:w-48">
            Alert type
            <select
              value={typeFilter}
              onChange={(event) => {
                setPage(1);
                setTypeFilter(event.target.value);
              }}
              className="mt-2 block w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
              <option value="all">All types</option>
              <option value="website_down">Website down</option>
              <option value="website_recovered">Recovered</option>
              <option value="ssl_expiring">SSL expiring</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-muted sm:w-44">
            Delivery
            <select
              value={statusFilter}
              onChange={(event) => {
                setPage(1);
                setStatusFilter(event.target.value);
              }}
              className="mt-2 block w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
              <option value="all">All deliveries</option>
              <option value="pending">Pending</option>
              <option value="sending">Sending</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
            </select>
          </label>
          <label className="flex cursor-pointer items-center gap-2 pb-2 text-sm font-semibold text-ink">
            <input
              type="checkbox"
              checked={testOnly}
              onChange={(event) => {
                setPage(1);
                setTestOnly(event.target.checked);
              }}
              className="h-4 w-4 accent-brand-700"
            />
            Test alerts only
          </label>
        </section>

        {/* ALERT LIST */}
        <section className="rounded-2xl border border-border bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-border p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-ink">Recent Alerts</h3>

              <p className="mt-1 text-sm text-muted">
                Latest website monitoring events
              </p>
            </div>

            <span className="text-sm font-medium text-muted">
              {loading ? "Loading..." : `${totalAlerts} total alerts`}
            </span>
          </div>

          {error && (
            <div className="m-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="p-12 text-center text-sm text-muted">
              Loading your alerts...
            </div>
          ) : error ? null : alerts.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <svg
                  className="h-7 w-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                  <path d="M10 21h4" />
                </svg>
              </div>

              <h4 className="mt-4 text-base font-bold text-ink">
                No alerts yet
              </h4>

              <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                When LeadLeak detects a website issue or SSL warning, your
                alerts will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {alerts.map((alert) => {
                const type = alertTypes[alert.type] || {
                  label: alert.type,
                  style: "bg-gray-100 text-gray-700",
                };

                const status = alert.status || "pending";

                return (
                  <article
                    key={alert._id}
                    className="p-6 transition hover:bg-surface/60"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${type.style}`}
                          >
                            {type.label}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${deliveryStyles[status] || "bg-gray-100 text-gray-700"}`}
                          >
                            Email: {status}
                          </span>
                          {/(retry reliability test|controlled|simulated|test)/i.test(
                            `${alert.title} ${alert.message}`,
                          ) && (
                            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                              Test event
                            </span>
                          )}
                        </div>

                        <h4 className="mt-3 text-base font-bold text-ink">
                          {alert.title}
                        </h4>

                        <p className="mt-2 text-sm leading-6 text-muted">
                          {alert.message}
                        </p>

                        <p className="mt-3 text-sm font-medium text-ink">
                          Website: {alert.website?.name || "Unknown website"}
                        </p>

                        {alert.website?.url && (
                          <a
                            href={alert.website.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-block break-all text-xs text-brand-700 hover:underline"
                          >
                            {alert.website.url}
                          </a>
                        )}

                        {alert.sslExpiresAt && (
                          <p className="mt-2 text-xs text-muted">
                            SSL expires: {formatDate(alert.sslExpiresAt)}
                          </p>
                        )}
                      </div>

                      <p className="shrink-0 text-xs text-muted">
                        {formatDate(alert.createdAt)}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* PAGINATION */}
          {!loading && !error && totalAlerts > 0 && (
            <div className="flex flex-col gap-3 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted">
                Page {page} of {totalPages}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                  className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-semibold text-ink transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-semibold text-ink transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Alerts;
