import { useRef, useState } from "react";

import "@/pages/ApplyPage/ApplyPage.css";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { submitCvToPost } from "@/api/cvPost";

const ACCEPT =
  ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const MAX_BYTES = 10 * 1024 * 1024;

export default function ApplyForm({
  publicCode,
  jobTitle,
  onSuccess,
  onClose,
  isReapply = false,
  idPrefix = "apply",
  className = "",
}) {
  const fileRef = useRef(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;

    if (f.size > MAX_BYTES) {
      setError("File must be 10MB or smaller.");
      setFile(null);
      return;
    }

    setError("");
    setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please attach your CV (PDF, DOC, or DOCX).");
      return;
    }

    try {
      setSubmitting(true);
      const res = await submitCvToPost(publicCode, {
        file,
        name: name.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        method: isReapply ? "PUT" : "POST",
      });
      setSuccess(res);
      onSuccess?.(res);
    } catch (err) {
      setError(err?.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const closeButton = onClose ? (
    <button
      type="button"
      className="apply-modal__close"
      aria-label="Close"
      onClick={onClose}
    >
      <span aria-hidden="true">×</span>
    </button>
  ) : null;

  if (success) {
    return (
      <div className={`apply-card apply-success ${className}`.trim()}>
        {closeButton && (
          <div className="apply-card__header apply-card__header--end">
            {closeButton}
          </div>
        )}
        <h1>Thank you</h1>
        <p>
          {success.message ||
            "Your CV has been submitted successfully. The recruiter will review it after processing."}
        </p>
        {success.code && <p className="apply-meta">Reference: {success.code}</p>}
        {onClose && (
          <button type="button" className="apply-submit apply-submit--done" onClick={onClose}>
            Done
          </button>
        )}
      </div>
    );
  }

  return (
    <form className={`apply-card ${className}`.trim()} onSubmit={handleSubmit}>
      <div className="apply-card__header">
        <h1 id={`${idPrefix}-title`}>Submit your CV</h1>
        {closeButton}
      </div>
      <p>
        {jobTitle
          ? `Apply for ${jobTitle}. Fill in your details and upload your resume.`
          : "Fill in your details and upload your resume for this role."}
      </p>

      {error && <p className="apply-error">{error}</p>}

      <div className="apply-field">
        <label htmlFor={`${idPrefix}-name`}>Full name *</label>
        <input
          id={`${idPrefix}-name`}
          type="text"
          maxLength={200}
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="apply-field">
        <label htmlFor={`${idPrefix}-email`}>Email *</label>
        <input
          id={`${idPrefix}-email`}
          type="email"
          maxLength={320}
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="apply-field">
        <label htmlFor={`${idPrefix}-phone`}>Phone *</label>
        <input
          id={`${idPrefix}-phone`}
          type="tel"
          maxLength={30}
          required
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
      </div>

      <div className="apply-field">
        <label>CV file * (PDF, DOC, DOCX — max 10MB)</label>
        <div className="apply-file">
          <input ref={fileRef} type="file" accept={ACCEPT} onChange={onPickFile} />
          <button type="button" className="apply-file-btn" onClick={() => fileRef.current?.click()}>
            Choose file
          </button>
          <p>{file ? file.name : "No file selected"}</p>
        </div>
      </div>

      <button type="submit" className="apply-submit" disabled={submitting}>
        {submitting ? (
          <LoadingSpinner size="sm" inline variant="light" label="Submitting" />
        ) : (
          "Submit application"
        )}
      </button>
    </form>
  );
}
