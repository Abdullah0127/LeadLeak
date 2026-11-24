import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function WorkspaceSetup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [type, setType] = useState("business");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // CHECK WHETHER THE USER ALREADY HAS A WORKSPACE
  useEffect(() => {
    const checkWorkspaces = async () => {
      const token = localStorage.getItem("auth-token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/organizations`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.status === 401) {
          localStorage.removeItem("auth-token");
          localStorage.removeItem("user");
          navigate("/login", { replace: true });
          return;
        }

        if (!response.ok) {
          throw new Error(data.message || "Unable to check your workspace.");
        }

        if (data.organizations?.length > 0) {
          navigate("/dashboard", { replace: true });
          return;
        }
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    checkWorkspaces();
  }, [navigate]);

  // CREATE WORKSPACE
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (name.trim().length < 2) {
      setError("Workspace name must contain at least 2 characters.");
      return;
    }

    const token = localStorage.getItem("auth-token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/organizations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          type,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("auth-token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to create your workspace.");
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <p className="text-sm font-medium text-muted">
          Preparing your workspace setup...
        </p>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-5 py-12">
      <div className="w-full max-w-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-brand-700">
            LeadLeak
          </h1>
          <p className="mt-3 text-sm text-muted">Let's set up your workspace</p>
        </div>

        <section className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-9">
          <div className="mb-7">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-700">
              Almost there
            </p>

            <h2 className="mt-2 text-2xl font-bold text-ink">
              Create your workspace
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted">
              Give your workspace a name and tell us how you plan to use
              LeadLeak. You can manage your website monitoring from here.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="workspaceName"
                className="mb-2 block text-sm font-semibold text-ink"
              >
                Workspace name
              </label>

              <input
                id="workspaceName"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. My Business"
                minLength={2}
                maxLength={100}
                required
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <div>
              <label
                htmlFor="workspaceType"
                className="mb-2 block text-sm font-semibold text-ink"
              >
                How will you use LeadLeak?
              </label>

              <select
                id="workspaceType"
                value={type}
                onChange={(event) => setType(event.target.value)}
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value="business">My own business</option>
                <option value="developer">I'm a developer</option>
                <option value="agency">I'm an agency</option>
              </select>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-brand-700 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating workspace..." : "Create workspace"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs leading-5 text-muted">
            Your account will automatically become the owner of this workspace.
          </p>
        </section>
      </div>
    </main>
  );
}

export default WorkspaceSetup;
