import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import JournalCard from "../components/JournalCard";
import JournalForm from "../components/JournalForm";
import { getAllJournals, createJournal, updateJournal, deleteJournal } from "../services/api";
import { useToast } from "../context/ToastContext";

// Modal wrapper
const Modal = ({ title, onClose, children }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "24px 28px 0",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "22px", fontWeight: "600" }}>
          {title}
        </h2>
        <button
          id="btn-modal-close"
          className="btn btn-ghost btn-sm"
          onClick={onClose}
          style={{ padding: "6px", borderRadius: "var(--radius-sm)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div style={{ padding: "0 28px 28px" }}>{children}</div>
    </div>
  </div>
);

// Read-only view modal
const ViewModal = ({ journal, onClose, onEdit, onDelete }) => {
  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    }) + " at " + new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "640px" }}>
        {/* Accent bar */}
        <div style={{ height: "3px", background: "linear-gradient(90deg, var(--color-accent-primary), var(--color-accent-pink))", borderRadius: "var(--radius-xl) var(--radius-xl) 0 0" }} />
        <div style={{ padding: "28px" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", marginBottom: "8px" }}>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "24px", fontWeight: "600", lineHeight: "1.3", flex: 1 }}>
              {journal.title}
            </h2>
            <button
              id="btn-view-close"
              className="btn btn-ghost btn-sm"
              onClick={onClose}
              style={{ padding: "6px", flexShrink: 0 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "24px" }}>
            {formatDate(journal.createdAt)}
          </p>

          {/* Content */}
          <div
            style={{
              fontSize: "15px",
              lineHeight: "1.8",
              color: "var(--color-text-secondary)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              maxHeight: "360px",
              overflowY: "auto",
              paddingRight: "4px",
            }}
          >
            {journal.content}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px", marginTop: "28px", justifyContent: "flex-end" }}>
            <button id="btn-view-delete" className="btn btn-danger btn-sm" onClick={() => { onClose(); onDelete(journal); }}>
              Delete
            </button>
            <button id="btn-view-edit" className="btn btn-secondary btn-sm" onClick={() => { onClose(); onEdit(journal); }}>
              Edit entry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Confirm delete dialog
const ConfirmDelete = ({ journal, onConfirm, onCancel, loading }) => (
  <div className="confirm-overlay">
    <div className="confirm-dialog">
      <div style={{ fontSize: "36px", marginBottom: "16px" }}>🗑️</div>
      <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", fontWeight: "600", marginBottom: "10px" }}>
        Delete this entry?
      </h3>
      <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginBottom: "24px", lineHeight: "1.6" }}>
        &ldquo;{journal.title}&rdquo; will be permanently deleted. This action cannot be undone.
      </p>
      <div style={{ display: "flex", gap: "10px" }}>
        <button id="btn-delete-cancel" className="btn btn-secondary btn-full" onClick={onCancel} disabled={loading}>
          Keep it
        </button>
        <button id="btn-delete-confirm" className="btn btn-danger btn-full" onClick={onConfirm} disabled={loading}>
          {loading && <span className="btn-spinner" style={{ borderTopColor: "var(--color-error)" }} />}
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ===== DASHBOARD =====
const Dashboard = () => {
  const { showToast } = useToast();

  const [journals, setJournals] = useState([]);
  const [fetching, setFetching] = useState(true);

  // Modal states
  const [createOpen, setCreateOpen] = useState(false);
  const [editJournal, setEditJournal] = useState(null);
  const [viewJournal, setViewJournal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Search / filter
  const [search, setSearch] = useState("");

  // ---- Fetch ----
  const fetchJournals = useCallback(async () => {
    try {
      const res = await getAllJournals();
      setJournals(res.data.data || []);
    } catch {
      showToast("Failed to load journals.", "error");
    } finally {
      setFetching(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchJournals();
  }, [fetchJournals]);

  // ---- Create ----
  const handleCreate = async (data) => {
    setFormLoading(true);
    try {
      const res = await createJournal(data);
      setJournals((prev) => [res.data.data, ...prev]);
      setCreateOpen(false);
      showToast("Journal entry created! ✍️", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create entry.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  // ---- Update ----
  const handleUpdate = async (data) => {
    setFormLoading(true);
    try {
      const res = await updateJournal(editJournal._id, data);
      setJournals((prev) =>
        prev.map((j) => (j._id === editJournal._id ? res.data.data : j))
      );
      setEditJournal(null);
      showToast("Entry updated successfully.", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update entry.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  // ---- Delete ----
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteJournal(deleteTarget._id);
      setJournals((prev) => prev.filter((j) => j._id !== deleteTarget._id));
      setDeleteTarget(null);
      showToast("Entry deleted.", "success");
    } catch {
      showToast("Failed to delete entry.", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ---- Filtered journals ----
  const filtered = journals.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg-primary)" }}>
      <Navbar />

      <main className="dashboard-layout">
        {/* Page header */}
        <div
          className="animate-fade-in"
          style={{ marginBottom: "36px" }}
        >
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
            <div>
              <p style={{ fontSize: "13px", color: "var(--color-accent-secondary)", fontWeight: "500", marginBottom: "6px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                Your entries
              </p>
              <h1
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(28px, 4vw, 38px)",
                  fontWeight: "600",
                  lineHeight: "1.15",
                }}
              >
                My Journal{" "}
                <span className="gradient-text">
                  {journals.length > 0 && `(${journals.length})`}
                </span>
              </h1>
            </div>

            <button
              id="btn-new-entry"
              className="btn btn-primary"
              onClick={() => setCreateOpen(true)}
              style={{ gap: "8px" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New entry
            </button>
          </div>

          {/* Search */}
          {journals.length > 0 && (
            <div style={{ marginTop: "20px", position: "relative", maxWidth: "380px" }}>
              <svg
                style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }}
                width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                id="search-journals"
                type="text"
                className="input-field"
                placeholder="Search entries…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: "36px" }}
              />
            </div>
          )}
        </div>

        {/* Content */}
        {fetching ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <div className="spinner" />
          </div>
        ) : journals.length === 0 ? (
          <div className="empty-state animate-fade-in">
            <div className="empty-state-icon">📝</div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "22px", fontWeight: "600" }}>
              No entries yet
            </h2>
            <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", maxWidth: "320px" }}>
              Start capturing your thoughts, ideas, and memories. Your first entry is waiting.
            </p>
            <button
              id="btn-first-entry"
              className="btn btn-primary"
              onClick={() => setCreateOpen(true)}
              style={{ marginTop: "8px" }}
            >
              Write your first entry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state animate-fade-in">
            <div className="empty-state-icon">🔍</div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", fontWeight: "600" }}>
              No results found
            </h2>
            <p style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
              Try a different search term.
            </p>
          </div>
        ) : (
          <div className="journal-grid stagger-children">
            {filtered.map((journal) => (
              <JournalCard
                key={journal._id}
                journal={journal}
                onClick={(j) => setViewJournal(j)}
                onEdit={(j) => setEditJournal(j)}
                onDelete={(j) => setDeleteTarget(j)}
              />
            ))}
          </div>
        )}
      </main>

      {/* ===== MODALS ===== */}

      {/* Create modal */}
      {createOpen && (
        <Modal title="New journal entry" onClose={() => setCreateOpen(false)}>
          <JournalForm
            onSubmit={handleCreate}
            onCancel={() => setCreateOpen(false)}
            loading={formLoading}
          />
        </Modal>
      )}

      {/* Edit modal */}
      {editJournal && (
        <Modal title="Edit entry" onClose={() => setEditJournal(null)}>
          <JournalForm
            initialData={editJournal}
            onSubmit={handleUpdate}
            onCancel={() => setEditJournal(null)}
            loading={formLoading}
          />
        </Modal>
      )}

      {/* View modal */}
      {viewJournal && (
        <ViewModal
          journal={viewJournal}
          onClose={() => setViewJournal(null)}
          onEdit={(j) => setEditJournal(j)}
          onDelete={(j) => setDeleteTarget(j)}
        />
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <ConfirmDelete
          journal={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default Dashboard;
