import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUp } from "../services/api";
import { useToast } from "../context/ToastContext";

const Register = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required.";
    else if (form.name.trim().length < 2) errs.name = "Name must be at least 2 characters.";

    if (!form.email.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email.";

    if (!form.password) errs.password = "Password is required.";
    else if (form.password.length < 6) errs.password = "Password must be at least 6 characters.";

    if (!form.confirmPassword) errs.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match.";

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
      await signUp({ name: form.name.trim(), email: form.email, password: form.password });
      showToast("Account created! Please sign in.", "success");
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed. Please try again.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  // Password strength
  const getPasswordStrength = (pwd) => {
    if (!pwd) return null;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { label: "Weak", color: "var(--color-error)", width: "25%" };
    if (score === 2) return { label: "Fair", color: "var(--color-warning)", width: "50%" };
    if (score === 3) return { label: "Good", color: "#34d399", width: "75%" };
    return { label: "Strong", color: "var(--color-accent-teal)", width: "100%" };
  };

  const strength = getPasswordStrength(form.password);

  return (
    <div className="auth-wrapper">
      {/* Background blobs */}
      <div
        className="auth-bg-blob"
        style={{
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(244,114,182,0.15) 0%, transparent 70%)",
          top: "-150px",
          right: "-200px",
        }}
      />
      <div
        className="auth-bg-blob"
        style={{
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(124,106,244,0.12) 0%, transparent 70%)",
          bottom: "-100px",
          left: "-180px",
        }}
      />

      <div className="auth-card animate-fade-in-scale">
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
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>✨</div>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "28px",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              Create your account
            </h1>
            <p style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
              Start your journaling journey today
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Name */}
            <div className="input-group">
              <label htmlFor="reg-name" className="input-label">Full name</label>
              <input
                id="reg-name"
                name="name"
                type="text"
                className="input-field"
                placeholder="Your name"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                autoFocus
              />
              {errors.name && <span className="input-error">{errors.name}</span>}
            </div>

            {/* Email */}
            <div className="input-group">
              <label htmlFor="reg-email" className="input-label">Email address</label>
              <input
                id="reg-email"
                name="email"
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
              {errors.email && <span className="input-error">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="input-group">
              <label htmlFor="reg-password" className="input-label">Password</label>
              <input
                id="reg-password"
                name="password"
                type="password"
                className="input-field"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              {/* Strength bar */}
              {strength && (
                <div style={{ marginTop: "6px" }}>
                  <div
                    style={{
                      height: "3px",
                      background: "var(--color-bg-elevated)",
                      borderRadius: "99px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: strength.width,
                        background: strength.color,
                        borderRadius: "99px",
                        transition: "width 0.3s ease, background 0.3s ease",
                      }}
                    />
                  </div>
                  <span style={{ fontSize: "11px", color: strength.color, marginTop: "3px", display: "block" }}>
                    {strength.label} password
                  </span>
                </div>
              )}
              {errors.password && <span className="input-error">{errors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div className="input-group">
              <label htmlFor="reg-confirm" className="input-label">Confirm password</label>
              <input
                id="reg-confirm"
                name="confirmPassword"
                type="password"
                className="input-field"
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
              {errors.confirmPassword && <span className="input-error">{errors.confirmPassword}</span>}
            </div>

            {/* Submit */}
            <button
              id="btn-register"
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
              style={{ marginTop: "6px" }}
            >
              {loading && <span className="btn-spinner" />}
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <div className="divider" style={{ margin: "24px 0" }}>or</div>

          <p style={{ textAlign: "center", fontSize: "14px", color: "var(--color-text-secondary)" }}>
            Already have an account?{" "}
            <Link
              to="/login"
              id="link-login"
              style={{
                color: "var(--color-accent-secondary)",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
