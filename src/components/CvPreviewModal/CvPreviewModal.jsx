import { useEffect, useRef, useState } from "react";
import { renderAsync } from "docx-preview";
import ModalPortal from "@/components/ui/ModalPortal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { fetchCvFileByCode } from "@/api/fileService";
import { detectCvFileKind } from "@/utils/cvFileKind";
import CvPdfViewer from "./CvPdfViewer";
import "./CvPreviewModal.css";

const KIND_LABELS = {
  pdf: "PDF document",
  word: "Word document",
  doc: "Word document (.doc)",
  unknown: "Document",
};

export default function CvPreviewModal({
  open,
  onClose,
  code,
  title,
  fileType = "",
  fileName: fileNameHint = "",
  onDownload,
}) {
  const docxRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [kind, setKind] = useState(null);
  const [fileName, setFileName] = useState("");
  const [pdfBlob, setPdfBlob] = useState(null);
  const [wordBlob, setWordBlob] = useState(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !code) return undefined;

    let cancelled = false;

    async function loadFile() {
      setLoading(true);
      setError("");
      setKind(null);
      setFileName("");
      setPdfBlob(null);
      setWordBlob(null);

      if (docxRef.current) {
        docxRef.current.innerHTML = "";
      }

      try {
        const file = await fetchCvFileByCode(code);
        if (cancelled) return;

        const detected = detectCvFileKind({
          contentType: file.contentType,
          fileName: file.fileName || fileNameHint,
          fileType,
        });

        setFileName(file.fileName || fileNameHint || code);

        if (detected === "pdf") {
          setPdfBlob(file.blob);
          setKind("pdf");
          return;
        }

        if (detected === "word") {
          setWordBlob(file.blob);
          setKind("word");
          return;
        }

        setKind(detected);
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Failed to load CV preview");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFile();

    return () => {
      cancelled = true;
      if (docxRef.current) docxRef.current.innerHTML = "";
    };
  }, [open, code, fileType, fileNameHint]);

  useEffect(() => {
    if (!open || kind !== "word" || !wordBlob || !docxRef.current) return undefined;

    let cancelled = false;

    async function renderDocx() {
      try {
        docxRef.current.innerHTML = "";
        await renderAsync(wordBlob, docxRef.current, undefined, {
          className: "cv-preview-modal__docx-page",
          inWrapper: true,
        });
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Failed to render Word document");
          setKind("doc");
        }
      }
    }

    renderDocx();

    return () => {
      cancelled = true;
    };
  }, [open, kind, wordBlob]);

  if (!open) return null;

  const kindLabel = KIND_LABELS[kind] || KIND_LABELS.unknown;

  return (
    <ModalPortal>
      <div
        className="cv-preview-backdrop"
        onClick={loading ? undefined : onClose}
      >
        <div
          className={`cv-preview-modal${kind === "pdf" ? " cv-preview-modal--pdf" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cv-preview-title"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="cv-preview-modal__header">
            <div className="cv-preview-modal__title-wrap">
              <h2 id="cv-preview-title" className="cv-preview-modal__title">
                {title || "CV Preview"}
              </h2>
              {fileName && (
                <p className="cv-preview-modal__subtitle">
                  {fileName} · {kindLabel}
                </p>
              )}
            </div>

            <button
              type="button"
              className="cv-preview-modal__close"
              onClick={onClose}
              aria-label="Close preview"
            >
              ×
            </button>
          </header>

          <div
            className={`cv-preview-modal__body${kind === "pdf" ? " cv-preview-modal__body--pdf" : ""}`}
          >
            {loading && (
              <div className="cv-preview-modal__loading">
                <LoadingSpinner size="lg" label="Loading CV preview" />
              </div>
            )}

            {!loading && error && (
              <div className="cv-preview-modal__error">
                <p>{error}</p>
              </div>
            )}

            {!loading && !error && kind === "pdf" && pdfBlob && (
              <CvPdfViewer file={pdfBlob} />
            )}

            {!loading && !error && kind === "word" && (
              <div ref={docxRef} className="cv-preview-modal__docx" />
            )}

            {!loading && !error && (kind === "doc" || kind === "unknown") && (
              <div className="cv-preview-modal__fallback">
                <div className="cv-preview-modal__fallback-icon" aria-hidden>
                  W
                </div>
                <p>
                  {kind === "doc"
                    ? "Legacy Word (.doc) files cannot be previewed in the browser. Download the file to open it in Word."
                    : "This file type cannot be previewed in the browser. Download the file to view it."}
                </p>
              </div>
            )}
          </div>

          <footer className="cv-preview-modal__footer">
            <button
              type="button"
              className="cv-preview-modal__btn"
              onClick={onClose}
            >
              Close
            </button>
            {onDownload && (
              <button
                type="button"
                className="cv-preview-modal__btn cv-preview-modal__btn--primary"
                onClick={onDownload}
              >
                Download
              </button>
            )}
          </footer>
        </div>
      </div>
    </ModalPortal>
  );
}
