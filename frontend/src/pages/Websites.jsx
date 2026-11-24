import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ==========================================
// DATE / TIME FORMATTER
// ==========================================

const formatDateTime = (date) => {
  if (!date) return "Not checked yet";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not available";
  }

  return parsedDate.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

// ==========================================
// WEBSITE MONITORING STATUS
// ==========================================

function MonitoringStatus({
  website,
  monitoringData,
  loading,
  onCheckNow,
  isBusy,
}) {
  const latestCheck = monitoringData?.checks?.[0] || null;

  const status = latestCheck?.status || website.lastStatus || null;
  const checkedAt = latestCheck?.checkedAt || website.lastCheckedAt || null;

  const statusStyles = {
    up: "bg-green-50 text-green-700",
    down: "bg-red-50 text-red-700",
  };

  const statusLabels = {
    up: "Online",
    down: "Down",
  };

  const sslStyles = {
    valid: "bg-green-50 text-green-700",
    invalid: "bg-red-50 text-red-700",
    unknown: "bg-gray-100 text-gray-600",
  };

  const sslLabels = {
    valid: "Valid",
    invalid: "Invalid",
    unknown: "Unknown",
  };

  return (
    <div className="mt-5 rounded-xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-sm font-bold text-ink">
            Latest monitoring result
          </h4>

          <p className="mt-1 text-xs leading-5 text-muted">
            Actual results from the website monitoring service.
          </p>
        </div>

        <button
          type="button"
          onClick={onCheckNow}
          disabled={isBusy || loading}
          className="inline-flex w-fit cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isBusy ? "Checking website..." : "Check Now"}

          {!isBusy && (
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M20 7v5h-5" />
              <path d="M4 17v-5h5" />
              <path d="M5.6 9a7 7 0 0 1 11.5-2L20 12" />
              <path d="M4 12l2.9 5a7 7 0 0 0 11.5-2" />
            </svg>
          )}
        </button>
      </div>

      {loading ? (
        <div className="mt-5 rounded-xl border border-border bg-white px-4 py-5 text-sm text-muted">
          Loading monitoring information...
        </div>
      ) : (
        <>
          {/* MONITORING SUMMARY */}

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* WEBSITE STATUS */}

            <div className="rounded-xl border border-border bg-white p-4">
              <p className="text-xs font-medium text-muted">Website status</p>

              <div className="mt-2">
                {status ? (
                  <span
                    className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                      statusStyles[status] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {statusLabels[status] || status}
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-muted">
                    Not checked
                  </span>
                )}
              </div>
            </div>

            {/* RESPONSE TIME */}

            <div className="rounded-xl border border-border bg-white p-4">
              <p className="text-xs font-medium text-muted">Response time</p>

              <p className="mt-2 text-lg font-bold text-ink">
                {latestCheck?.responseTime != null
                  ? `${latestCheck.responseTime} ms`
                  : "—"}
              </p>
            </div>

            {/* HTTP STATUS */}

            <div className="rounded-xl border border-border bg-white p-4">
              <p className="text-xs font-medium text-muted">HTTP status code</p>

              <p className="mt-2 text-lg font-bold text-ink">
                {latestCheck?.httpStatusCode ?? "—"}
              </p>
            </div>

            {/* SSL STATUS */}

            <div className="rounded-xl border border-border bg-white p-4">
              <p className="text-xs font-medium text-muted">SSL certificate</p>

              <div className="mt-2">
                {latestCheck?.sslStatus ? (
                  <span
                    className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                      sslStyles[latestCheck.sslStatus] ||
                      "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {sslLabels[latestCheck.sslStatus] || latestCheck.sslStatus}
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-muted">
                    Unknown
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* LAST CHECK INFORMATION */}

          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium text-muted">Last checked</p>

              <p className="mt-1 text-sm font-semibold text-ink">
                {formatDateTime(checkedAt)}
              </p>
            </div>

            {latestCheck?.sslExpiresAt && (
              <div>
                <p className="text-xs font-medium text-muted">SSL expires</p>

                <p className="mt-1 text-sm font-semibold text-ink">
                  {formatDateTime(latestCheck.sslExpiresAt)}
                </p>
              </div>
            )}
          </div>

          {/* ERROR INFORMATION */}

          {latestCheck?.errorMessage && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-xs font-semibold text-red-800">
                Monitoring error
              </p>

              <p className="mt-1 break-words text-sm leading-5 text-red-700">
                {latestCheck.errorMessage}
              </p>
            </div>
          )}

          {latestCheck?.sslError && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-xs font-semibold text-amber-800">
                SSL information
              </p>

              <p className="mt-1 break-words text-sm leading-5 text-amber-700">
                {latestCheck.sslError}
              </p>
            </div>
          )}

          {/* NO CHECK HISTORY */}

          {!latestCheck && (
            <p className="mt-4 text-xs leading-5 text-muted">
              No monitoring checks have been recorded yet. Click Check Now to
              run your first check.
            </p>
          )}
        </>
      )}
    </div>
  );
}

// ==========================================
// WEBSITES PAGE
// ==========================================

function Websites() {
  const navigate = useNavigate();

  const [organization, setOrganization] = useState(null);
  const [websites, setWebsites] = useState([]);
  const [monitoringData, setMonitoringData] = useState({});
  const [monitoringLoading, setMonitoringLoading] = useState({});

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [verificationData, setVerificationData] = useState({});

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [copiedWebsiteId, setCopiedWebsiteId] = useState("");
  const [editingWebsiteId, setEditingWebsiteId] = useState("");
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState("");

  // ==========================================
  // AUTHENTICATION HELPER
  // ==========================================

  const handleUnauthorized = () => {
    localStorage.removeItem("auth-token");
    localStorage.removeItem("user");
    localStorage.removeItem("active-organization");

    navigate("/login", { replace: true });
  };

  // ==========================================
  // FETCH MONITORING HISTORY
  // ==========================================

  const fetchMonitoringHistory = useCallback(
    async (websiteId, token) => {
      setMonitoringLoading((prev) => ({
        ...prev,
        [websiteId]: true,
      }));

      try {
        const response = await fetch(
          `${API_BASE_URL}/monitoring/${websiteId}/history?page=1&limit=1`,
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

        setMonitoringData((prev) => ({
          ...prev,
          [websiteId]: {
            ...data.history,
            website: data.website,
          },
        }));
      } catch (err) {
        console.error(
          `Monitoring history error for website ${websiteId}:`,
          err.message,
        );
      } finally {
        setMonitoringLoading((prev) => ({
          ...prev,
          [websiteId]: false,
        }));
      }
    },
    [navigate],
  );

  // ==========================================
  // FETCH WEBSITES
  // ==========================================

  const fetchWebsites = useCallback(
    async (organizationId, token) => {
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
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to load websites.");
      }

      const websiteList = data.websites || [];

      setWebsites(websiteList);

      // Fetch the latest monitoring result for verified websites.
      const verifiedWebsites = websiteList.filter(
        (website) => website.verificationStatus === "verified",
      );

      await Promise.all(
        verifiedWebsites.map((website) =>
          fetchMonitoringHistory(website._id, token),
        ),
      );
    },
    [fetchMonitoringHistory, navigate],
  );

  // ==========================================
  // LOAD WORKSPACE AND WEBSITES
  // ==========================================

  useEffect(() => {
    const loadWebsites = async () => {
      const token = localStorage.getItem("auth-token");
      const savedOrganization = localStorage.getItem("active-organization");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      if (!savedOrganization) {
        navigate("/dashboard", { replace: true });
        return;
      }

      try {
        const parsedOrganization = JSON.parse(savedOrganization);

        if (!parsedOrganization?._id) {
          throw new Error("Invalid workspace information.");
        }

        setOrganization(parsedOrganization);

        await fetchWebsites(parsedOrganization._id, token);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    loadWebsites();
  }, [fetchWebsites, navigate]);

  // ==========================================
  // ADD WEBSITE
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setActionMessage("");

    const token = localStorage.getItem("auth-token");

    if (!token || !organization?._id) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/websites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim() || undefined,
          url: url.trim(),
          organizationId: organization._id,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to add website.");
      }

      setName("");
      setUrl("");

      setSuccess(data.message || "Website added successfully!");

      await fetchWebsites(organization._id, token);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // START WEBSITE VERIFICATION
  // ==========================================

  const handleStartVerification = async (websiteId) => {
    setActionMessage("");
    setError("");
    setSuccess("");

    const token = localStorage.getItem("auth-token");

    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      setActionLoading((prev) => ({
        ...prev,
        [websiteId]: "start",
      }));

      const response = await fetch(
        `${API_BASE_URL}/verification/${websiteId}/start`,
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
        throw new Error(data.message || "Unable to start verification.");
      }

      setVerificationData((prev) => ({
        ...prev,
        [websiteId]: data.verification,
      }));

      setActionMessage(
        "Verification tag generated. Add it to your website before verifying.",
      );

      await fetchWebsites(organization._id, token);
    } catch (err) {
      setActionMessage(err.message || "Unable to start verification.");
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [websiteId]: "",
      }));
    }
  };

  // ==========================================
  // COPY VERIFICATION META TAG
  // ==========================================

  const handleCopyMetaTag = async (websiteId) => {
    const metaTag = verificationData[websiteId]?.metaTag;

    if (!metaTag) {
      setActionMessage("Meta tag not found.");
      return;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(metaTag);
      } else {
        const textArea = document.createElement("textarea");

        textArea.value = metaTag;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const copied = document.execCommand("copy");

        document.body.removeChild(textArea);

        if (!copied) {
          throw new Error("Copy failed");
        }
      }

      setCopiedWebsiteId(websiteId);

      setTimeout(() => {
        setCopiedWebsiteId((current) => (current === websiteId ? "" : current));
      }, 2500);
    } catch {
      setCopiedWebsiteId("");
      setActionMessage("Copy failed. Please copy the meta tag manually.");
    }
  };

  // ==========================================
  // VERIFY WEBSITE
  // ==========================================

  const handleVerifyWebsite = async (websiteId) => {
    setActionMessage("");
    setError("");
    setSuccess("");

    const token = localStorage.getItem("auth-token");

    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      setActionLoading((prev) => ({
        ...prev,
        [websiteId]: "verify",
      }));

      const response = await fetch(
        `${API_BASE_URL}/verification/${websiteId}/verify`,
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
        throw new Error(data.message || "Website verification failed.");
      }

      setVerificationData((prev) => {
        const updated = { ...prev };
        delete updated[websiteId];
        return updated;
      });

      setActionMessage(
        data.message || "Website ownership verified successfully!",
      );

      await fetchWebsites(organization._id, token);
    } catch (err) {
      setActionMessage(err.message || "Website verification failed.");

      await fetchWebsites(organization._id, token);
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [websiteId]: "",
      }));
    }
  };

  // ==========================================
  // EDIT WEBSITE
  // ==========================================

  const startEditing = (website) => {
    setEditingWebsiteId(website._id);
    setEditName(website.name || "");
    setEditUrl(website.url || "");
    setConfirmDeleteId("");
    setActionMessage("");
  };

  const handleUpdateWebsite = async (event, websiteId) => {
    event.preventDefault();

    const token = localStorage.getItem("auth-token");
    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      setActionLoading((prev) => ({ ...prev, [websiteId]: "edit" }));

      const response = await fetch(`${API_BASE_URL}/websites/${websiteId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName.trim(),
          url: editUrl.trim(),
        }),
      });

      const data = await response.json();
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!response.ok) {
        throw new Error(data.message || "Unable to update website.");
      }

      setEditingWebsiteId("");
      setActionMessage("Website details updated successfully.");
      await fetchWebsites(organization._id, token);
    } catch (err) {
      setActionMessage(err.message || "Unable to update website.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [websiteId]: "" }));
    }
  };

  // ==========================================
  // DELETE WEBSITE
  // ==========================================

  const handleDeleteWebsite = async (websiteId) => {
    const token = localStorage.getItem("auth-token");
    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      setActionLoading((prev) => ({ ...prev, [websiteId]: "delete" }));

      const response = await fetch(`${API_BASE_URL}/websites/${websiteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!response.ok) {
        throw new Error(data.message || "Unable to delete website.");
      }

      setConfirmDeleteId("");
      setActionMessage("Website deleted successfully.");
      await fetchWebsites(organization._id, token);
    } catch (err) {
      setActionMessage(err.message || "Unable to delete website.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [websiteId]: "" }));
    }
  };

  // ==========================================
  // ENABLE / DISABLE MONITORING
  // ==========================================

  const handleToggleMonitoring = async (website) => {
    setActionMessage("");
    setError("");
    setSuccess("");

    const token = localStorage.getItem("auth-token");

    if (!token) {
      handleUnauthorized();
      return;
    }

    const enabled = !website.isMonitoringEnabled;

    try {
      setActionLoading((prev) => ({
        ...prev,
        [website._id]: "monitoring",
      }));

      const response = await fetch(
        `${API_BASE_URL}/websites/${website._id}/monitoring`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ enabled }),
        },
      );

      const data = await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to update monitoring.");
      }

      setActionMessage(
        enabled
          ? "Website monitoring enabled successfully!"
          : "Website monitoring disabled.",
      );

      await fetchWebsites(organization._id, token);
    } catch (err) {
      setActionMessage(err.message || "Unable to update monitoring.");
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [website._id]: "",
      }));
    }
  };

  // ==========================================
  // MANUALLY CHECK WEBSITE
  // ==========================================

  const handleCheckNow = async (websiteId) => {
    setActionMessage("");
    setError("");

    const token = localStorage.getItem("auth-token");

    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      setActionLoading((prev) => ({
        ...prev,
        [websiteId]: "check",
      }));

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
        throw new Error(data.message || "Unable to check website.");
      }

      setActionMessage(data.message || "Website monitoring check completed.");

      // Refresh website information and latest monitoring history.
      await fetchWebsites(organization._id, token);
    } catch (err) {
      setActionMessage(err.message || "Unable to check website.");
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [websiteId]: "",
      }));
    }
  };

  // ==========================================
  // WEBSITE SUMMARY
  // ==========================================

  const monitoringCount = websites.filter(
    (website) => website.isMonitoringEnabled,
  ).length;

  const verifiedCount = websites.filter(
    (website) => website.verificationStatus === "verified",
  ).length;

  // ==========================================
  // LOADING STATE
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center px-5">
        <p className="text-sm font-medium text-muted">
          Loading your websites...
        </p>
      </div>
    );
  }

  // ==========================================
  // WEBSITE PAGE
  // ==========================================

  return (
    <main className="min-h-screen w-full px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        {/* PAGE HEADER */}

        <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-700">
              <span className="h-2 w-2 rounded-full bg-brand-500" />
              {organization?.name || "Your workspace"}
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Websites
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-muted sm:text-base">
              Add and manage the websites you want LeadLeak to protect. Keep
              track of verification and monitoring from one place.
            </p>
          </div>

          <a
            href="#add-website"
            className="inline-flex w-fit cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add website
          </a>
        </section>

        {/* WEBSITE SUMMARY */}

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted">Total websites</p>

              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M3 12h18M12 3a15 15 0 0 1 0 18" />
                </svg>
              </span>
            </div>

            <p className="mt-3 text-3xl font-bold tracking-tight text-ink">
              {websites.length}
            </p>

            <p className="mt-1 text-xs text-muted">
              Registered in this workspace
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted">
                Verified websites
              </p>

              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-700">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <path d="m5 12 4 4L19 6" />
                </svg>
              </span>
            </div>

            <p className="mt-3 text-3xl font-bold tracking-tight text-ink">
              {verifiedCount}
            </p>

            <p className="mt-1 text-xs text-muted">
              Ownership successfully verified
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted">
                Monitoring active
              </p>

              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-700">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <path d="M3 12h4l3-8 4 16 3-8h4" />
                </svg>
              </span>
            </div>

            <p className="mt-3 text-3xl font-bold tracking-tight text-ink">
              {monitoringCount}
            </p>

            <p className="mt-1 text-xs text-muted">
              Websites currently being monitored
            </p>
          </div>
        </section>

        {/* ADD WEBSITE FORM */}

        <section
          id="add-website"
          className="mb-8 scroll-mt-8 rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-7"
        >
          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v8M8 12h8" />
              </svg>
            </div>

            <div>
              <h2 className="text-lg font-bold text-ink">Add a website</h2>
              <p className="mt-1 text-sm leading-5 text-muted">
                Enter your website details to add it to this workspace.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="websiteName"
                  className="mb-2 block text-sm font-semibold text-ink"
                >
                  Website name
                  <span className="ml-1 font-normal text-muted">
                    (Optional)
                  </span>
                </label>

                <input
                  id="websiteName"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. My Business Website"
                  minLength={2}
                  maxLength={100}
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-50"
                />
              </div>

              <div>
                <label
                  htmlFor="websiteUrl"
                  className="mb-2 block text-sm font-semibold text-ink"
                >
                  Website URL
                </label>

                <input
                  id="websiteUrl"
                  type="url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://example.com"
                  maxLength={2048}
                  required
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-50"
                />

                <p className="mt-2 text-xs text-muted">
                  Include https:// or http:// in your website address.
                </p>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {success}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Adding website..." : "Add website"}

                {!submitting && (
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </button>

              <p className="text-xs text-muted">
                Your website will be added to this workspace.
              </p>
            </div>
          </form>
        </section>

        {/* WEBSITE LIST */}

        <section className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-ink">Your websites</h2>

              <p className="mt-1 text-sm text-muted">
                Websites registered in this workspace.
              </p>
            </div>

            <span className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700">
              {websites.length} {websites.length === 1 ? "Website" : "Websites"}
            </span>
          </div>

          {/* ACTION MESSAGE */}

          {actionMessage && (
            <div className="mt-5 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-ink">
              {actionMessage}
            </div>
          )}

          {/* EMPTY STATE */}

          {websites.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-border bg-surface px-5 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand-700 shadow-sm">
                <svg
                  className="h-7 w-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M3 12h18M12 3a15 15 0 0 1 0 18" />
                </svg>
              </div>

              <h3 className="mt-4 font-bold text-ink">No websites added yet</h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
                Add your first website to start managing its verification and
                monitoring through LeadLeak.
              </p>

              <a
                href="#add-website"
                className="mt-5 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-600"
              >
                Add your first website
                <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {websites.map((website) => {
                const isVerified = website.verificationStatus === "verified";

                const verification = verificationData[website._id];
                const isBusy = Boolean(actionLoading[website._id]);

                return (
                  <article
                    key={website._id}
                    className="rounded-2xl border border-border p-5 sm:p-6"
                  >
                    {/* WEBSITE INFORMATION */}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                          <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                          >
                            <circle cx="12" cy="12" r="9" />
                            <path d="M3 12h18M12 3a15 15 0 0 1 0 18" />
                          </svg>
                        </div>

                        <div className="min-w-0 pt-0.5">
                          {editingWebsiteId === website._id ? (
                            <form
                              onSubmit={(event) =>
                                handleUpdateWebsite(event, website._id)
                              }
                              className="space-y-3"
                            >
                              <label className="block text-xs font-semibold text-muted">
                                Website name
                                <input
                                  value={editName}
                                  onChange={(event) =>
                                    setEditName(event.target.value)
                                  }
                                  required
                                  minLength={2}
                                  maxLength={100}
                                  className="mt-1 block w-full rounded-lg border border-border px-3 py-2 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                                />
                              </label>
                              <label className="block text-xs font-semibold text-muted">
                                Website URL
                                <input
                                  type="url"
                                  value={editUrl}
                                  onChange={(event) =>
                                    setEditUrl(event.target.value)
                                  }
                                  required
                                  className="mt-1 block w-full rounded-lg border border-border px-3 py-2 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                                />
                              </label>
                              <div className="flex gap-2">
                                <button
                                  type="submit"
                                  disabled={isBusy}
                                  className="cursor-pointer rounded-lg bg-brand-700 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {actionLoading[website._id] === "edit"
                                    ? "Saving..."
                                    : "Save"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingWebsiteId("")}
                                  className="cursor-pointer rounded-lg border border-border px-3 py-2 text-xs font-semibold text-ink hover:bg-surface"
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <h3 className="truncate text-sm font-bold text-ink">
                                {website.name}
                              </h3>

                              <a
                                href={website.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 block cursor-pointer break-all text-sm text-brand-700 hover:underline"
                              >
                                {website.url}
                              </a>
                            </>
                          )}

                          {/* VIEW WEBSITE DETAILS */}

                          <button
                            type="button"
                            onClick={() => navigate(`/websites/${website._id}`)}
                            className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-brand-700 px-3 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-700 hover:text-white"
                          >
                            View Details
                            <svg
                              className="h-3.5 w-3.5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M5 12h14" />
                              <path d="m12 5 7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* WEBSITE STATUS */}

                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        {confirmDeleteId === website._id ? (
                          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                            <span className="text-xs font-semibold text-red-700">
                              Delete this website?
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteWebsite(website._id)}
                              disabled={isBusy}
                              className="cursor-pointer rounded-md bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {actionLoading[website._id] === "delete"
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId("")}
                              className="cursor-pointer rounded-md px-2.5 py-1 text-xs font-semibold text-ink hover:bg-white"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => startEditing(website)}
                              className="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-surface"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(website._id)}
                              className="cursor-pointer rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </>
                        )}

                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                            isVerified
                              ? "bg-green-50 text-green-700"
                              : website.verificationStatus === "failed"
                                ? "bg-red-50 text-red-700"
                                : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {website.verificationStatus || "pending"}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                            website.isMonitoringEnabled
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {website.isMonitoringEnabled
                            ? "Monitoring on"
                            : "Monitoring off"}
                        </span>
                      </div>
                    </div>

                    {/* VERIFICATION CONTROLS */}

                    {!isVerified && (
                      <div className="mt-5 border-t border-border pt-5">
                        {!verification ? (
                          <div>
                            <p className="text-sm leading-6 text-muted">
                              Verify ownership of this website to enable
                              monitoring.
                            </p>

                            <button
                              type="button"
                              onClick={() =>
                                handleStartVerification(website._id)
                              }
                              disabled={isBusy}
                              className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {actionLoading[website._id] === "start"
                                ? "Generating token..."
                                : "Start Verification"}
                            </button>
                          </div>
                        ) : (
                          <div className="rounded-xl bg-surface p-4 sm:p-5">
                            <h4 className="text-sm font-bold text-ink">
                              Verify website ownership
                            </h4>

                            <p className="mt-2 text-sm leading-6 text-muted">
                              Add the following meta tag inside the{" "}
                              <code className="rounded bg-white px-1.5 py-0.5 text-xs">
                                &lt;head&gt;
                              </code>{" "}
                              section of your website's homepage HTML.
                            </p>

                            <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-white p-3">
                              <code className="block min-w-max text-xs text-ink">
                                {verification.metaTag}
                              </code>
                            </div>

                            {/* COPY META TAG */}

                            <button
                              type="button"
                              onClick={() => handleCopyMetaTag(website._id)}
                              className={`mt-3 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                                copiedWebsiteId === website._id
                                  ? "border-green-200 bg-green-50 text-green-700"
                                  : "border-border bg-white text-ink hover:border-brand-300 hover:bg-gray-50"
                              }`}
                            >
                              {copiedWebsiteId === website._id ? (
                                <>
                                  <svg
                                    className="h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <path d="m5 12 4 4L19 6" />
                                  </svg>
                                  Copied successfully!
                                </>
                              ) : (
                                <>
                                  <svg
                                    className="h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                  >
                                    <rect
                                      x="8"
                                      y="8"
                                      width="12"
                                      height="12"
                                      rx="2"
                                    />
                                    <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
                                  </svg>
                                  Copy meta tag
                                </>
                              )}
                            </button>

                            {/* VERIFICATION INSTRUCTIONS */}

                            <div className="mt-5">
                              <h5 className="text-sm font-semibold text-ink">
                                Steps to complete verification
                              </h5>

                              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-muted">
                                <li>
                                  Open your website's homepage HTML or website
                                  settings.
                                </li>
                                <li>
                                  Add the copied meta tag inside the{" "}
                                  <code>&lt;head&gt;</code> section.
                                </li>
                                <li>
                                  Save your changes and deploy or publish your
                                  website.
                                </li>
                                <li>
                                  Make sure the tag is visible on the live
                                  homepage.
                                </li>
                                <li>Return here and click Verify Now.</li>
                              </ol>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleVerifyWebsite(website._id)}
                              disabled={isBusy}
                              className="mt-5 inline-flex cursor-pointer items-center justify-center rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {actionLoading[website._id] === "verify"
                                ? "Checking website..."
                                : "Verify Now"}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* MONITORING CONTROLS */}

                    {isVerified && (
                      <div className="mt-5 border-t border-border pt-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-ink">
                              Website monitoring
                            </h4>

                            <p className="mt-1 text-sm leading-6 text-muted">
                              {website.isMonitoringEnabled
                                ? "LeadLeak is checking this website automatically."
                                : "Ownership verified. Enable monitoring to start automatic checks."}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleToggleMonitoring(website)}
                            disabled={isBusy}
                            className={`inline-flex w-fit cursor-pointer items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                              website.isMonitoringEnabled
                                ? "border border-border bg-white text-ink hover:bg-gray-50"
                                : "bg-brand-700 text-white hover:bg-brand-600"
                            }`}
                          >
                            {actionLoading[website._id] === "monitoring"
                              ? "Updating..."
                              : website.isMonitoringEnabled
                                ? "Disable Monitoring"
                                : "Enable Monitoring"}
                          </button>
                        </div>

                        {/* REAL MONITORING RESULTS */}

                        <MonitoringStatus
                          website={website}
                          monitoringData={monitoringData[website._id]}
                          loading={Boolean(monitoringLoading[website._id])}
                          onCheckNow={() => handleCheckNow(website._id)}
                          isBusy={actionLoading[website._id] === "check"}
                        />
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Websites;
