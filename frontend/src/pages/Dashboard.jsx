import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ========================================
// DASHBOARD OVERVIEW PAGE
// ========================================

function Dashboard() {
  const { user, organization } = useOutletContext();
  const navigate = useNavigate();

  // Use the organization ID instead of the entire object.
  const organizationId = organization?._id;

  const [websites, setWebsites] = useState([]);
  const [totalAlerts, setTotalAlerts] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState("");

  // ========================================
  // FETCH DASHBOARD STATISTICS
  // ========================================

  useEffect(() => {
    if (!organizationId) {
      setLoadingStats(false);
      return;
    }

    const controller = new AbortController();

    const fetchDashboardStats = async () => {
      const token = localStorage.getItem("auth-token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        setLoadingStats(true);
        setStatsError("");

        // FETCH WEBSITES AND ALERTS TOGETHER
        const [websitesResponse, alertsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/websites/organization/${organizationId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }),

          fetch(`${API_BASE_URL}/alerts/organization/${organizationId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }),
        ]);

        // HANDLE EXPIRED LOGIN
        if (websitesResponse.status === 401 || alertsResponse.status === 401) {
          localStorage.removeItem("auth-token");
          localStorage.removeItem("user");
          localStorage.removeItem("active-organization");

          navigate("/login", { replace: true });
          return;
        }

        const websitesData = await websitesResponse.json();
        const alertsData = await alertsResponse.json();

        if (!websitesResponse.ok) {
          throw new Error(
            websitesData.message || "Unable to load website statistics.",
          );
        }

        if (!alertsResponse.ok) {
          throw new Error(
            alertsData.message || "Unable to load alert statistics.",
          );
        }

        // UPDATE DASHBOARD DATA
        if (!controller.signal.aborted) {
          setWebsites(websitesData.websites || []);
          setTotalAlerts(alertsData.alerts?.total ?? 0);
        }
      } catch (error) {
        if (error.name === "AbortError") return;

        if (!controller.signal.aborted) {
          setStatsError(error.message || "Unable to load statistics.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingStats(false);
        }
      }
    };

    fetchDashboardStats();

    // CANCEL OLD REQUESTS WHEN THE ORGANIZATION CHANGES
    return () => {
      controller.abort();
    };
  }, [organizationId, navigate]);

  // ========================================
  // CALCULATE STATISTICS
  // ========================================

  const totalWebsites = websites.length;

  const activeMonitoring = websites.filter(
    (website) => website.isMonitoringEnabled,
  ).length;

  const inactiveMonitoring = totalWebsites - activeMonitoring;

  return (
    <main className="min-h-screen w-full px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        {/* WELCOME SECTION */}
        <section>
          <p className="mb-2 text-sm font-medium text-brand-700">
            Workspace Overview
          </p>

          <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Welcome back, {user?.name?.split(" ")[0] || "there"}!
          </h2>

          <p className="mt-2 text-sm text-muted sm:text-base">
            Here's an overview of your website protection workspace.
          </p>
        </section>

        {/* WORKSPACE INFORMATION */}
        <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-muted">
                Current Workspace
              </p>

              <h3 className="mt-1 text-xl font-bold text-ink">
                {organization?.name || "Your Workspace"}
              </h3>

              <p className="mt-1 text-sm text-muted">
                {organization?.type
                  ? `${organization.type.charAt(0).toUpperCase()}${organization.type.slice(1)} workspace`
                  : "Your LeadLeak account"}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <path d="M8 8h8M8 12h8M8 16h5" />
              </svg>
            </div>
          </div>
        </section>

        {/* MONITORING OVERVIEW */}
        <section>
          <div className="mb-5">
            <h3 className="text-lg font-bold text-ink">Monitoring Overview</h3>

            <p className="mt-1 text-sm text-muted">
              Your website monitoring summary.
            </p>
          </div>

          {statsError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {statsError}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* TOTAL WEBSITES */}
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-muted">Total Websites</p>

              <p className="mt-5 text-3xl font-bold text-ink tabular-nums">
                {loadingStats ? "..." : totalWebsites}
              </p>

              <p className="mt-2 text-xs text-muted">
                Websites added to your workspace
              </p>
            </div>

            {/* ACTIVE MONITORING */}
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-muted">
                Active Monitoring
              </p>

              <p className="mt-5 text-3xl font-bold text-ink tabular-nums">
                {loadingStats ? "..." : activeMonitoring}
              </p>

              <p className="mt-2 text-xs text-muted">
                Websites currently being monitored
              </p>
            </div>

            {/* TOTAL ALERTS */}
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-muted">Total Alerts</p>

              <p className="mt-5 text-3xl font-bold text-ink tabular-nums">
                {loadingStats ? "..." : totalAlerts}
              </p>

              <p className="mt-2 text-xs text-muted">
                Total alerts generated in your workspace
              </p>
            </div>
          </div>
        </section>

        {/* MONITORING DETAILS */}
        <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-ink">
            Website Monitoring Status
          </h3>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Monitoring Active
              </p>

              <p className="mt-1 text-2xl font-bold text-green-700 tabular-nums">
                {loadingStats ? "..." : activeMonitoring}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Monitoring Inactive
              </p>

              <p className="mt-1 text-2xl font-bold text-ink tabular-nums">
                {loadingStats ? "..." : inactiveMonitoring}
              </p>
            </div>
          </div>
        </section>

        {/* ACCOUNT INFORMATION */}
        <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-ink">Account Information</h3>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Name
              </p>

              <p className="mt-1 text-sm font-semibold text-ink">
                {user?.name || "Not available"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Email Address
              </p>

              <p className="mt-1 break-all text-sm font-semibold text-ink">
                {user?.email || "Not available"}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Dashboard;
