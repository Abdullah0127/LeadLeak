import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Input from "../components/common/Input";
import Button from "../components/common/Button";

// ========================================
// LOGIN PAGE
// ========================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // HANDLE INPUT CHANGES
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  // HANDLE LOGIN SUBMISSION
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.email.trim() || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed. Please try again.");
      }

      if (!data.token || !data.user) {
        throw new Error("Invalid response from the server.");
      }

      // SAVE AUTHENTICATION DATA
      localStorage.setItem("auth-token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // REDIRECT TO DASHBOARD
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.message || "Unable to connect to the server. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex min-h-[75vh] items-center justify-center px-4 py-16 sm:px-6">
      <div className="w-full max-w-md">
        {/* LOGIN CARD */}
        <div className="rounded-2xl border border-border bg-white p-7 shadow-sm sm:p-9">
          {/* HEADING */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
              <svg
                className="h-7 w-7 text-brand-700"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <path d="m10 17 5-5-5-5" />
                <path d="M15 12H3" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-ink">
              Welcome back
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted">
              Sign in to your LeadLeak account to manage your website
              monitoring.
            </p>
          </div>

          {/* LOGIN FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* EMAIL */}
            <Input
              label="Email address"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
              disabled={loading}
            />

            {/* PASSWORD */}
            <div>
              <Input
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
                disabled={loading}
              />

              <button
                type="button"
                onClick={() => setShowPassword((previous) => !previous)}
                className="mt-2 text-xs font-semibold text-brand-700 hover:text-brand-500"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide password" : "Show password"}
              </button>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3"
            >
              {loading ? "Signing in..." : "Sign in to your account"}
            </Button>
          </form>

          {/* REGISTER LINK */}
          <div className="mt-7 border-t border-border pt-6 text-center">
            <p className="text-sm text-muted">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-brand-700 hover:text-brand-500"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* SECURITY NOTE */}
        <p className="mt-5 text-center text-xs text-muted">
          Your account credentials are securely verified by LeadLeak.
        </p>
      </div>
    </section>
  );
}

export default Login;
