import LoadingSpinner from "@/components/ui/LoadingSpinner";
import "@/styles/admin-ui.css";
import "./ConfirmDialog.css";

export default function ConfirmDialog({
  open,
  title = "Confirm",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="confirm-backdrop" onClick={loading ? undefined : onCancel}>
      <div
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="confirm-dialog-title">{title}</h3>
        <p>{message}</p>
        <div className="confirm-dialog__actions">
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`admin-btn confirm-dialog__confirm confirm-dialog__confirm--${tone}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="sm" inline label="Confirming" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
