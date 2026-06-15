import "./ConfirmModal.css";

export default function ConfirmModal({
  open,
  title = "Confirm Action",
  text = "Are you sure?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onClose,
}) {
  if (!open) return null;

  return (
    <div className="confirm-modal-overlay" onClick={onClose}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="confirm-modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="confirm-modal-icon">
          <i className="fa-solid fa-right-from-bracket" />
        </div>

        <h2>{title}</h2>

        <p>{text}</p>

        <div className="confirm-modal-actions">
          <button className="confirm-btn confirm-btn-cancel" onClick={onClose}>
            {cancelText}
          </button>

          <button
            className="confirm-btn confirm-btn-confirm"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
