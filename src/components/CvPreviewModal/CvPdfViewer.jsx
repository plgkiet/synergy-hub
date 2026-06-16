import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import "./CvPdfViewer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

const ZOOM_STEP = 0.15;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.5;

function getPdfFileKey(file) {
  if (file == null) return "empty";
  if (typeof file === "string") return file;
  if (file instanceof Blob) return `${file.size}:${file.type}`;
  return String(file);
}

function CvPdfViewerInner({ file }) {
  const containerRef = useRef(null);

  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [containerWidth, setContainerWidth] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [fitWidth, setFitWidth] = useState(true);
  const [docLoading, setDocLoading] = useState(true);
  const [docError, setDocError] = useState("");

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const update = () => setContainerWidth(el.clientWidth);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const onDocumentLoadSuccess = useCallback(({ numPages: total }) => {
    setNumPages(total);
    setPageNumber(1);
    setDocLoading(false);
    setDocError("");
  }, []);

  const onDocumentLoadError = useCallback((err) => {
    setDocLoading(false);
    setDocError(err?.message || "Failed to render PDF");
  }, []);

  const goToPrev = () => setPageNumber((p) => Math.max(1, p - 1));
  const goToNext = () => setPageNumber((p) => Math.min(numPages, p + 1));

  const zoomOut = () => {
    setFitWidth(false);
    setZoom((z) => Math.max(MIN_ZOOM, Number((z - ZOOM_STEP).toFixed(2))));
  };

  const zoomIn = () => {
    setFitWidth(false);
    setZoom((z) => Math.min(MAX_ZOOM, Number((z + ZOOM_STEP).toFixed(2))));
  };

  const pageWidth =
    fitWidth && containerWidth ? Math.max(containerWidth - 56, 280) : undefined;
  const pageScale = fitWidth ? undefined : zoom;
  const zoomLabel = fitWidth ? "Fit width" : `${Math.round(zoom * 100)}%`;

  return (
    <div className="cv-pdf-viewer">
      <div className="cv-pdf-viewer__toolbar">
        <div className="cv-pdf-viewer__toolbar-group">
          <button
            type="button"
            className="cv-pdf-viewer__tool-btn"
            onClick={goToPrev}
            disabled={pageNumber <= 1 || docLoading}
            aria-label="Previous page"
          >
            ‹
          </button>
          <span className="cv-pdf-viewer__page-indicator">
            {numPages ? `${pageNumber} / ${numPages}` : "—"}
          </span>
          <button
            type="button"
            className="cv-pdf-viewer__tool-btn"
            onClick={goToNext}
            disabled={pageNumber >= numPages || docLoading || !numPages}
            aria-label="Next page"
          >
            ›
          </button>
        </div>

        <div className="cv-pdf-viewer__toolbar-group">
          <button
            type="button"
            className="cv-pdf-viewer__tool-btn"
            onClick={zoomOut}
            disabled={docLoading || (!fitWidth && zoom <= MIN_ZOOM)}
            aria-label="Zoom out"
          >
            −
          </button>
          <span className="cv-pdf-viewer__zoom-label">{zoomLabel}</span>
          <button
            type="button"
            className="cv-pdf-viewer__tool-btn"
            onClick={zoomIn}
            disabled={docLoading || (!fitWidth && zoom >= MAX_ZOOM)}
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            className={`cv-pdf-viewer__fit-btn${fitWidth ? " is-active" : ""}`}
            onClick={() => setFitWidth(true)}
            disabled={docLoading}
          >
            Fit width
          </button>
        </div>
      </div>

      <div className="cv-pdf-viewer__canvas" ref={containerRef}>
        {docLoading && (
          <div className="cv-pdf-viewer__loading">
            <LoadingSpinner size="lg" label="Rendering PDF" />
          </div>
        )}

        {docError && (
          <div className="cv-pdf-viewer__error">
            <p>{docError}</p>
          </div>
        )}

        {!docError && (
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
            error={null}
            className="cv-pdf-viewer__document"
          >
            <div className="cv-pdf-viewer__page-wrap">
              <Page
                pageNumber={pageNumber}
                width={pageWidth}
                scale={pageScale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                loading={null}
              />
            </div>
          </Document>
        )}
      </div>
    </div>
  );
}

export default function CvPdfViewer({ file }) {
  return <CvPdfViewerInner key={getPdfFileKey(file)} file={file} />;
}
