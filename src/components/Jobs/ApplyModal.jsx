import ModalPortal from "@/components/ui/ModalPortal";
import ApplyForm from "@/components/Jobs/ApplyForm";

export default function ApplyModal({ publicCode, jobTitle, onClose }) {
  if (!publicCode) return null;

  return (
    <ModalPortal>
      <div
        className="apply-modal-backdrop"
        role="presentation"
        onClick={onClose}
      >
        <div
          className="apply-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="apply-modal-title"
          onClick={(e) => e.stopPropagation()}
        >
          <ApplyForm
            publicCode={publicCode}
            jobTitle={jobTitle}
            onClose={onClose}
            idPrefix="apply-modal"
            className="apply-card--modal"
          />
        </div>
      </div>
    </ModalPortal>
  );
}
