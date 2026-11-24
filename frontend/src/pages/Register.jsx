import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Input from "../components/common/Input";
import Button from "../components/common/Button";

// ========================================
// REGISTER PAGE
// ========================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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

  // HANDLE REGISTRATION
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please complete all fields.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Registration failed. Please try again.",
        );
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
        {/* REGISTER CARD */}
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
                <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="10" cy="7" r="4" />
                <path d="M20 8v6" />
                <path d="M23 11h-6" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-ink">
              Create your account
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted">
              Start protecting your website and incoming leads with LeadLeak.
            </p>
          </div>

          {/* REGISTER FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* NAME */}
            <Input
              label="Full name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              required
              disabled={loading}
            />

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
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
                disabled={loading}
              />

              <p className="mt-1.5 text-xs text-muted">
                Use at least 8 characters.
              </p>
            </div>

            {/* CONFIRM PASSWORD */}
            <Input
              label="Confirm password"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
              disabled={loading}
            />

            {/* SHOW PASSWORD */}
            <button
              type="button"
              onClick={() => setShowPassword((previous) => !previous)}
              className="text-xs font-semibold text-brand-700 hover:text-brand-500"
              aria-label={showPassword ? "Hide passwords" : "Show passwords"}
            >
              {showPassword ? "Hide passwords" : "Show passwords"}
            </button>

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
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          {/* LOGIN LINK */}
          <div className="mt-7 border-t border-border pt-6 text-center">
            <p className="text-sm text-muted">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-brand-700 hover:text-brand-500"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* SECURITY NOTE */}
        <p className="mt-5 text-center text-xs text-muted">
          Your account information is securely processed by LeadLeak.
        </p>
      </div>
    </section>
  );
}

export default Register;
