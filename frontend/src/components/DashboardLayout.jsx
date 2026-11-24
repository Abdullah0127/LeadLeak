import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

// ========================================
// DASHBOARD CONFIGURATION
// ========================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const navigationItems = [
  { label: "Overview", icon: "grid", path: "/dashboard" },
  { label: "Websites", icon: "globe", path: "/websites" },
  { label: "Analytics", icon: "analytics", path: "/analytics" },
  { label: "Form Monitoring", icon: "forms", comingSoon: true },
  { label: "Alerts", icon: "bell", path: "/alerts" },
  { label: "Settings", icon: "settings", comingSoon: true },
];

// ========================================
// SIDEBAR ICON
// ========================================

function SidebarIcon({ name }) {
  const paths = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    analytics: (
      <>
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-5 5" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0-18" />
      </>
    ),
    forms: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.8 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.8-1l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.8-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.8 1l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1 0 2Z" />
      </>
    ),
  };

  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

// ========================================
// DASHBOARD LAYOUT
// ========================================

function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  // ========================================
  // FETCH USER AND WORKSPACE
  // ========================================

  useEffect(() => {
    const loadWorkspace = async () => {
      const token = localStorage.getItem("auth-token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.status === 401) {
          localStorage.removeItem("auth-token");
          localStorage.removeItem("user");
          localStorage.removeItem("active-organization");
          navigate("/login", { replace: true });
          return;
        }

        if (!response.ok) {
          throw new Error(data.message || "Unable to load your account.");
        }

        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));

        const organizationResponse = await fetch(
          `${API_BASE_URL}/organizations`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const organizationData = await organizationResponse.json();

        if (organizationResponse.status === 401) {
          localStorage.removeItem("auth-token");
          localStorage.removeItem("user");
          localStorage.removeItem("active-organization");
          navigate("/login", { replace: true });
          return;
        }

        if (!organizationResponse.ok) {
          throw new Error(
            organizationData.message || "Unable to load your workspace.",
          );
        }

        const organizations = organizationData.organizations || [];

        if (organizations.length === 0) {
          localStorage.removeItem("active-organization");
          navigate("/workspace/setup", { replace: true });
          return;
        }

        const activeOrganization = organizations[0];

        setOrganization(activeOrganization);

        localStorage.setItem(
          "active-organization",
          JSON.stringify(activeOrganization),
        );
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    loadWorkspace();
  }, [navigate]);

  // ========================================
  // LOGOUT
  // ========================================

  const handleLogout = () => {
    localStorage.removeItem("auth-token");
    localStorage.removeItem("user");
    localStorage.removeItem("active-organization");

    navigate("/login", { replace: true });
  };

  // ========================================
  // CLOSE MOBILE MENU ON NAVIGATION
  // ========================================

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // ========================================
  // PAGE TITLE
  // ========================================

  const currentPage =
    navigationItems.find((item) => item.path === location.pathname)?.label ||
    "Dashboard";

  // ========================================
  // LOADING STATE
  // ========================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <p className="text-sm font-medium text-muted">
          Loading your workspace...
        </p>
      </div>
    );
  }

  // ========================================
  // ERROR STATE
  // ========================================

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-4">
        <p className="text-sm text-red-600">{error}</p>

        <button
          onClick={handleLogout}
          className="rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Back to login
        </button>
      </div>
    );
  }

  // ========================================
  // SHARED DASHBOARD INTERFACE
  // ========================================

  return (
    <div className="min-h-screen bg-surface text-ink md:flex">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden w-65 shrink-0 flex-col border-r border-border bg-white md:flex">
        {/* BRAND */}
        <div className="flex h-19 items-center border-b border-border px-7">
          <span className="text-2xl font-bold tracking-tight text-brand-700">
            LeadLeak
          </span>
        </div>

        {/* NAVIGATION */}
        <div className="flex-1 px-4 py-7">
          <p className="mb-4 px-3 text-[11px] font-bold uppercase tracking-widest text-muted">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigationItems.map((item) =>
              item.comingSoon ? (
                <button
                  key={item.label}
                  type="button"
                  disabled
                  className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-gray-400"
                >
                  <SidebarIcon name={item.icon} />
                  <span className="flex-1">{item.label}</span>
                  <span className="rounded-md bg-gray-100 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-gray-500">
                    Soon
                  </span>
                </button>
              ) : (
                <NavLink
                  key={item.label}
                  to={item.path}
                  end
                  className={({ isActive }) =>
                    `flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                      isActive
                        ? "bg-brand-50 text-brand-700"
                        : "text-muted hover:bg-surface"
                    }`
                  }
                >
                  <SidebarIcon name={item.icon} />
                  <span className="flex-1">{item.label}</span>
                </NavLink>
              ),
            )}
          </nav>
        </div>

        {/* ACCOUNT */}
        <div className="border-t border-border p-4">
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-surface p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">
                {user?.name}
              </p>
              <p className="truncate text-xs text-muted">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-muted transition hover:bg-red-50 hover:text-red-600"
          >
            <span aria-hidden="true">↪</span>
            Log out
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="min-w-0 flex-1">
        {/* TOP HEADER */}
        <header className="sticky top-0 z-30 flex h-19 items-center justify-between border-b border-border bg-white/95 px-5 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            {/* MOBILE MENU BUTTON */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-ink md:hidden"
              aria-expanded={menuOpen}
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? "Close" : "Menu"}
            </button>

            <div>
              <h1 className="text-base font-bold text-ink sm:text-lg">
                {currentPage}
              </h1>
              <p className="hidden text-xs text-muted sm:block">
                Manage your website protection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-ink">{user?.name}</p>
              <p className="text-xs text-muted">Customer account</p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 font-bold text-brand-700">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          </div>
        </header>

        {/* MOBILE NAVIGATION */}
        {menuOpen && (
          <div className="border-b border-border bg-white px-4 py-4 md:hidden">
            <nav className="space-y-1">
              {navigationItems.map((item) =>
                item.comingSoon ? (
                  <button
                    key={item.label}
                    type="button"
                    disabled
                    className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-gray-400"
                  >
                    <SidebarIcon name={item.icon} />
                    <span className="flex-1">{item.label}</span>
                    <span className="text-[10px] font-bold uppercase">
                      Soon
                    </span>
                  </button>
                ) : (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    end
                    className={({ isActive }) =>
                      `flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium ${
                        isActive ? "bg-brand-50 text-brand-700" : "text-muted"
                      }`
                    }
                  >
                    <SidebarIcon name={item.icon} />
                    <span className="flex-1">{item.label}</span>
                  </NavLink>
                ),
              )}
            </nav>

            <button
              onClick={handleLogout}
              className="mt-3 w-full rounded-lg border border-border px-3 py-2.5 text-left text-sm font-semibold text-red-600"
            >
              Log out
            </button>
          </div>
        )}

        {/* PAGE CONTENT */}
        <Outlet context={{ user, organization }} />
      </div>
    </div>
  );
}

export default DashboardLayout;
