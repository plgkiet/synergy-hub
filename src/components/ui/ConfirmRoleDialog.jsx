import LoadingSpinner from "@/components/ui/LoadingSpinner";
import "@/styles/admin-ui.css";
import "./ConfirmDialog.css";
import "./ConfirmRoleDialog.css";

export default function ConfirmRoleDialog({
  open,
  candidateName,
  role,
  loading = false,
  onRoleChange,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div
      className="confirm-backdrop"
      onClick={loading ? undefined : onCancel}
    >
      <form
        className="confirm-dialog confirm-role-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-role-title"
        onSubmit={(e) => {
          e.preventDefault();
          onConfirm?.();
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="confirm-role-title">Confirm role</h3>
        <p className="confirm-role-dialog__candidate">
          {candidateName || "Candidate"}
        </p>

        <label className="confirm-role-dialog__label" htmlFor="confirm-role-input">
          Role
        </label>
        <input
          id="confirm-role-input"
          type="text"
          className="confirm-role-dialog__input"
          value={role}
          onChange={(e) => onRoleChange?.(e.target.value)}
          placeholder="e.g. Backend Developer"
          autoFocus
        />

        <div className="confirm-dialog__actions">
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="admin-btn admin-btn--primary confirm-dialog__confirm"
            disabled={loading || !role?.trim()}
          >
            {loading ? (
              <LoadingSpinner size="sm" inline label="Confirming" />
            ) : (
              "Confirm"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
