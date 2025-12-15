import { useMemo, useRef, useState } from "react";
import { useSnackbar } from "notistack";

import "./UploadPage.css";
import GlassCard from "@/components/GlassCard/GlassUpload";

import fileIcon from "@/assets/icon/file.svg";
import deleteIcon from "@/assets/icon/delete.png";
import { uploadCvs } from "@/api/cvDocument";
import { useNavigate } from "react-router-dom";

function formatBytes(bytes = 0) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}

export default function UploadPage() {
  const { enqueueSnackbar } = useSnackbar();
  const inputRef = useRef(null);

  const [items, setItems] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const files = useMemo(() => items.map((x) => x.file), [items]);

  const addFiles = (fileList) => {
    const arr = Array.from(fileList || []);
    if (arr.length === 0) return;

    setItems((prev) => {
      const existed = new Set(prev.map((p) => `${p.file.name}-${p.file.size}`));
      const next = [...prev];

      for (const f of arr) {
        const key = `${f.name}-${f.size}`;
        if (existed.has(key)) continue;

        next.push({
          id: crypto.randomUUID(),
          file: f,
          status: "ready",
          progress: 0,
          error: "",
        });
      }

      return next;
    });
  };

  const removeItem = (id) => {
    if (uploading) return;
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  const openPicker = () => inputRef.current?.click();

  const onPick = (e) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (items.length === 0) {
      enqueueSnackbar("Please select files to upload.", { variant: "warning" });
      return;
    }

    try {
      setUploading(true);

      setItems((prev) =>
        prev.map((x) => ({ ...x, status: "uploading", progress: 0, error: "" }))
      );

      const res = await uploadCvs(files, {
        onProgress: (percent) => {
          setItems((prev) => prev.map((x) => ({ ...x, progress: percent })));
        },
      });

      enqueueSnackbar("Upload successful!", { variant: "success" });

      setItems((prev) =>
        prev.map((x) => ({ ...x, status: "done", progress: 100 }))
      );

      return res;
    } catch (err) {
      const apiMsg =
        err?.data?.message ||
        (Array.isArray(err?.data?.errors) && err.data.errors[0]) ||
        err?.message ||
        "Upload failed";

      enqueueSnackbar(apiMsg, { variant: "error" });

      setItems((prev) =>
        prev.map((x) => ({
          ...x,
          status: "error",
          error: apiMsg,
        }))
      );
    } finally {
      setUploading(false);
    }
  };
  const navigate = useNavigate();

  return (
    <div className="upload-root">
      <div className="upload-inner">
        <h1 className="upload-title">Upload CVs here</h1>

        <GlassCard className={`upload-card ${dragOver ? "is-dragover" : ""}`}>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
            style={{ display: "none" }}
            onChange={onPick}
          />

          <div className="upload-icon">
            <img src={fileIcon} alt="upload" />
          </div>

          <div
            className="upload-dropzone"
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            <div className="upload-drop-text">
              <button
                type="button"
                className="upload-drop-link"
                onClick={openPicker}
                disabled={uploading}
              >
                Browse
              </button>{" "}
              or drag and drop
            </div>
            <p className="upload-subtext">PDF, PNG, TXT or WORD (max. 25MB)</p>
          </div>

          <div className="upload-list">
            {items.length === 0 ? (
              <div className="upload-empty">No files selected.</div>
            ) : (
              items.map((it) => (
                <div
                  key={it.id}
                  className={`upload-item ${
                    it.status === "error" ? "upload-item--error" : ""
                  }`}
                >
                  <div className="upload-item-left">
                    <span className="upload-file-icon">
                      <img src={fileIcon} alt="file" />
                    </span>

                    <div className="upload-file-info">
                      <div className="upload-file-name">{it.file.name}</div>

                      <div
                        className={`upload-file-meta ${
                          it.status === "error" ? "upload-file-meta--error" : ""
                        }`}
                      >
                        {formatBytes(it.file.size)} ·{" "}
                        {it.status === "ready" && "Ready"}
                        {it.status === "uploading" &&
                          `Uploading ${it.progress}%`}
                        {it.status === "done" && "Complete"}
                        {it.status === "error" && (it.error || "Failed")}
                      </div>

                      <div className="upload-progress">
                        <div
                          className={`upload-progress-bar ${
                            it.status === "done"
                              ? "is-done"
                              : it.status === "error"
                              ? "is-error"
                              : it.status === "uploading"
                              ? "is-loading"
                              : ""
                          }`}
                          style={{ width: `${it.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="upload-trash"
                    onClick={() => removeItem(it.id)}
                    disabled={uploading}
                    aria-label="Remove file"
                  >
                    <img src={deleteIcon} alt="delete" />
                  </button>
                </div>
              ))
            )}
          </div>

          <button
            type="button"
            className="upload-button"
            onClick={handleUpload}
            disabled={uploading || items.length === 0}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </GlassCard>
        <div className="upload-go-search">
          <button className="sh-band-cta" onClick={() => navigate("/search")}>
            Go to search page →
          </button>
        </div>
      </div>
    </div>
  );
}
