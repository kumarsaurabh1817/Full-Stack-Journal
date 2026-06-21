import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Get initials from user name
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <nav className="navbar">
      {/* Brand */}
      <div className="navbar-brand">
        <span style={{ fontSize: "26px" }}>📓</span>
        <span>Journal</span>
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* User avatar + name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "6px 12px",
            borderRadius: "var(--radius-md)",
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-pink))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "600",
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <span
            style={{
              fontSize: "13px",
              color: "var(--color-text-secondary)",
              maxWidth: "120px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user?.name || user?.email}
          </span>
        </div>

        {/* Logout */}
        <button
          id="btn-logout"
          onClick={handleLogout}
          className="btn btn-ghost btn-sm"
          title="Sign out"
          style={{ gap: "6px" }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Sign out</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
