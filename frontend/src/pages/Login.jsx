import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signIn } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email.";
    if (!form.password) errs.password = "Password is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await signIn({ email: form.email, password: form.password });
      const { userId, email, accessToken, refreshToken } = res.data.data;
      login({ userId, email }, accessToken, refreshToken);
      showToast("Welcome back! 👋", "success");
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Sign in failed. Please try again.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Background blobs */}
      <div
        className="auth-bg-blob"
        style={{
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(124,106,244,0.18) 0%, transparent 70%)",
          top: "-100px",
          left: "-200px",
        }}
      />
      <div
        className="auth-bg-blob"
        style={{
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(244,114,182,0.1) 0%, transparent 70%)",
          bottom: "-80px",
          right: "-150px",
        }}
      />

      <div className="auth-card animate-fade-in-scale">
        {/* Card */}
        <div
          style={{
            background: "var(--color-bg-secondary)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            padding: "40px 36px",
            boxShadow: "var(--shadow-card), var(--shadow-glow)",
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>📓</div>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "28px",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              Welcome back
            </h1>
            <p style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
              Sign in to continue to your journal
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {/* Email */}
            <div className="input-group">
              <label htmlFor="login-email" className="input-label">Email address</label>
              <input
                id="login-email"
                name="email"
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                autoFocus
              />
              {errors.email && <span className="input-error">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="input-group">
              <label htmlFor="login-password" className="input-label">Password</label>
              <input
                id="login-password"
                name="password"
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              {errors.password && <span className="input-error">{errors.password}</span>}
            </div>

            {/* Submit */}
            <button
              id="btn-signin"
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
              style={{ marginTop: "6px" }}
            >
              {loading && <span className="btn-spinner" />}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {/* Divider */}
          <div className="divider" style={{ margin: "24px 0" }}>or</div>

          {/* Link to register */}
          <p style={{ textAlign: "center", fontSize: "14px", color: "var(--color-text-secondary)" }}>
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              id="link-register"
              style={{
                color: "var(--color-accent-secondary)",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
