import React from "react";

// Format date: "Jun 21, 2026 · 2:30 PM"
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }) + " · " + date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

// Truncate long content with ellipsis
const truncate = (str, max = 140) =>
  str.length > max ? str.slice(0, max).trim() + "…" : str;

// Color hash for accent dot per journal
const accentColors = [
  "var(--color-accent-primary)",
  "var(--color-accent-pink)",
  "var(--color-accent-teal)",
  "#fbbf24",
  "#34d399",
];
const getAccentColor = (id) => {
  const hash = [...(id || "")].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return accentColors[hash % accentColors.length];
};

const JournalCard = ({ journal, onClick, onEdit, onDelete }) => {
  const accentColor = getAccentColor(journal._id);

  return (
    <article
      className="journal-card"
      id={`journal-card-${journal._id}`}
      onClick={() => onClick(journal)}
      style={{ display: "flex", flexDirection: "column", gap: "14px" }}
    >
      {/* Accent bar color indicator */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: accentColor,
          borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
        }}
      />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
        <h3
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "17px",
            fontWeight: "600",
            color: "var(--color-text-primary)",
            lineHeight: "1.4",
            flex: 1,
          }}
        >
          {journal.title}
        </h3>

        {/* Actions */}
        <div
          style={{ display: "flex", gap: "4px", flexShrink: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            id={`btn-edit-${journal._id}`}
            className="btn btn-ghost btn-sm"
            title="Edit"
            onClick={() => onEdit(journal)}
            style={{ padding: "6px", borderRadius: "var(--radius-sm)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            id={`btn-delete-${journal._id}`}
            className="btn btn-ghost btn-sm"
            title="Delete"
            onClick={() => onDelete(journal)}
            style={{ padding: "6px", borderRadius: "var(--radius-sm)", color: "var(--color-error)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Preview content */}
      <p
        style={{
          fontSize: "13.5px",
          color: "var(--color-text-secondary)",
          lineHeight: "1.65",
          flex: 1,
        }}
      >
        {truncate(journal.content)}
      </p>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginTop: "auto",
        }}
      >
        <div
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: accentColor,
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: "11.5px", color: "var(--color-text-muted)" }}>
          {formatDate(journal.createdAt)}
        </span>
        {journal.updatedAt !== journal.createdAt && (
          <span
            style={{
              fontSize: "11px",
              color: "var(--color-text-muted)",
              marginLeft: "auto",
              fontStyle: "italic",
            }}
          >
            edited
          </span>
        )}
      </div>
    </article>
  );
};

export default JournalCard;
