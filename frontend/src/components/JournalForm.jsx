import React, { useState, useEffect } from "react";

const TITLE_MAX = 100;
const CONTENT_MAX = 1000;

const JournalForm = ({ initialData = null, onSubmit, onCancel, loading = false }) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [errors, setErrors] = useState({});

  // Sync when initialData changes (e.g. switching journals to edit)
  useEffect(() => {
    setTitle(initialData?.title || "");
    setContent(initialData?.content || "");
    setErrors({});
  }, [initialData?._id]);

  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = "Title is required.";
    else if (title.trim().length < 2) errs.title = "Title must be at least 2 characters.";
    else if (title.trim().length > TITLE_MAX) errs.title = `Title must be under ${TITLE_MAX} characters.`;

    if (!content.trim()) errs.content = "Content is required.";
    else if (content.trim().length < 10) errs.content = "Content must be at least 10 characters.";
    else if (content.trim().length > CONTENT_MAX) errs.content = `Content must be under ${CONTENT_MAX} characters.`;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ title: title.trim(), content: content.trim() });
  };

  const getCharClass = (val, max) => {
    const ratio = val.length / max;
    if (ratio >= 1) return "danger";
    if (ratio >= 0.85) return "warning";
    return "";
  };

  const isEdit = !!initialData;

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Title */}
      <div className="input-group">
        <label htmlFor="journal-title" className="input-label">Title</label>
        <input
          id="journal-title"
          type="text"
          className="input-field"
          placeholder="Give your entry a title…"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
          }}
          maxLength={TITLE_MAX + 1}
          autoFocus
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {errors.title ? (
            <span className="input-error">{errors.title}</span>
          ) : (
            <span />
          )}
          <span className={`char-counter ${getCharClass(title, TITLE_MAX)}`}>
            {title.length}/{TITLE_MAX}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="input-group">
        <label htmlFor="journal-content" className="input-label">Content</label>
        <textarea
          id="journal-content"
          className="input-field"
          placeholder="What's on your mind today?…"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (errors.content) setErrors((prev) => ({ ...prev, content: undefined }));
          }}
          maxLength={CONTENT_MAX + 1}
          rows={6}
          style={{ minHeight: "160px" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {errors.content ? (
            <span className="input-error">{errors.content}</span>
          ) : (
            <span />
          )}
          <span className={`char-counter ${getCharClass(content, CONTENT_MAX)}`}>
            {content.length}/{CONTENT_MAX}
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <button
          id="btn-form-cancel"
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          id={isEdit ? "btn-form-update" : "btn-form-create"}
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading && <span className="btn-spinner" />}
          {isEdit ? "Update Entry" : "Save Entry"}
        </button>
      </div>
    </form>
  );
};

export default JournalForm;
