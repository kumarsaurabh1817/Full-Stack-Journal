import React, { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "../components/Navbar";
import JournalCard from "../components/JournalCard";
import JournalForm from "../components/JournalForm";
import { getAllJournals, createJournal, updateJournal, deleteJournal } from "../services/api";
import { useToast } from "../context/ToastContext";

const LIMIT = 6; // journals per page

// ===== MODAL WRAPPER =====
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

// ===== READ-ONLY VIEW MODAL =====
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

// ===== CONFIRM DELETE DIALOG =====
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

// ===== PAGINATION COMPONENT =====
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const delta = 1; // pages around current
    const left = currentPage - delta;
    const right = currentPage + delta;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i <= right)) {
        pages.push(i);
      }
    }

    // Insert ellipsis
    const withEllipsis = [];
    let prev = null;
    for (const page of pages) {
      if (prev !== null && page - prev > 1) {
        withEllipsis.push("...");
      }
      withEllipsis.push(page);
      prev = page;
    }
    return withEllipsis;
  };

  return (
    <div className="pagination-container">
      {/* Previous */}
      <button
        id="btn-page-prev"
        className="pagination-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Page numbers */}
      {getPageNumbers().map((page, idx) =>
        page === "..." ? (
          <span key={`ellipsis-${idx}`} className="pagination-ellipsis">…</span>
        ) : (
          <button
            key={page}
            id={`btn-page-${page}`}
            className={`pagination-btn ${currentPage === page ? "pagination-btn-active" : ""}`}
            onClick={() => onPageChange(page)}
            aria-label={`Go to page ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </button>
        )
      )}

      {/* Next */}
      <button
        id="btn-page-next"
        className="pagination-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
};

// ===== DASHBOARD =====
const Dashboard = () => {
  const { showToast } = useToast();

  const [journals, setJournals] = useState([]);
  const [fetching, setFetching] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJournals, setTotalJournals] = useState(0);

  // Modal states
  const [createOpen, setCreateOpen] = useState(false);
  const [editJournal, setEditJournal] = useState(null);
  const [viewJournal, setViewJournal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Search state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceTimer = useRef(null);

  // Debounce: wait 400ms after user stops typing
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(val);
      setCurrentPage(1); // reset to first page on new search
    }, 400);
  };

  // ---- Fetch ----
  const fetchJournals = useCallback(async (page = 1, searchTerm = "") => {
    setFetching(true);
    try {
      const res = await getAllJournals(page, LIMIT, searchTerm);
      const { journals: fetchedJournals, currentPage: cp, totalPages: tp, totalJournals: tj } = res.data.data;
      setJournals(fetchedJournals || []);
      setCurrentPage(cp);
      setTotalPages(tp);
      setTotalJournals(tj);
    } catch {
      showToast("Failed to load journals.", "error");
    } finally {
      setFetching(false);
    }
  }, [showToast]);

  // Initial load
  useEffect(() => {
    fetchJournals(1, "");
  }, [fetchJournals]);

  // Re-fetch when debounced search changes
  useEffect(() => {
    fetchJournals(1, debouncedSearch);
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePageChange = (page) => {
    fetchJournals(page, debouncedSearch);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ---- Create ----
  const handleCreate = async (data) => {
    setFormLoading(true);
    try {
      await createJournal(data);
      setCreateOpen(false);
      showToast("Journal entry created! ✍️", "success");
      // Clear search and go to page 1 to see the newest entry
      setSearch("");
      setDebouncedSearch("");
      fetchJournals(1, "");
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
      // Update in place without refetch if on same page
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
      setDeleteTarget(null);
      showToast("Entry deleted.", "success");
      // If we deleted the last item on this page, go back one page
      const isLastOnPage = journals.length === 1 && currentPage > 1;
      fetchJournals(isLastOnPage ? currentPage - 1 : currentPage, debouncedSearch);
    } catch {
      showToast("Failed to delete entry.", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Journals are already filtered by the server; just use them directly
  const filtered = journals;

  // Pagination range text
  const rangeStart = totalJournals === 0 ? 0 : (currentPage - 1) * LIMIT + 1;
  const rangeEnd = Math.min(currentPage * LIMIT, totalJournals);

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg-primary)" }}>
      <Navbar />

      <main className="dashboard-layout">
        {/* Page header */}
        <div className="animate-fade-in" style={{ marginBottom: "36px" }}>
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
                  {totalJournals > 0 && `(${totalJournals})`}
                </span>
              </h1>
              {totalJournals > 0 && !fetching && (
                <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: "6px" }}>
                  {debouncedSearch
                    ? `${totalJournals} result${totalJournals !== 1 ? "s" : ""} for "${debouncedSearch}"`
                    : `Showing ${rangeStart}–${rangeEnd} of ${totalJournals} entries`}
                </p>
              )}
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

          {/* Search — server-side with debounce */}
          <div style={{ marginTop: "20px", position: "relative", maxWidth: "380px" }}>
            <svg
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)", zIndex: 1 }}
              width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              id="search-journals"
              type="text"
              className="input-field"
              placeholder="Search all entries…"
              value={search}
              onChange={handleSearchChange}
              style={{ paddingLeft: "36px", paddingRight: search ? "36px" : "16px" }}
            />
            {/* Clear button */}
            {search && (
              <button
                id="btn-search-clear"
                onClick={() => { setSearch(""); setDebouncedSearch(""); }}
                style={{
                  position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--color-text-muted)", display: "flex", alignItems: "center", padding: "4px"
                }}
                aria-label="Clear search"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {fetching ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <div className="spinner" />
          </div>
        ) : journals.length === 0 && !debouncedSearch ? (
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
        ) : journals.length === 0 && debouncedSearch ? (
          <div className="empty-state animate-fade-in">
            <div className="empty-state-icon">🔍</div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", fontWeight: "600" }}>
              No results found
            </h2>
            <p style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
              No entries match &ldquo;{debouncedSearch}&rdquo;. Try a different search term.
            </p>
          </div>
        ) : (
          <>
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

            {/* Pagination works with search too (server-side) */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
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
