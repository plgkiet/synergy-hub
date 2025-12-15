import { useMemo, useState } from "react";
import "./SearchPage.css";
import GlassCard from "@/components/GlassCard/GlassUpload";
import GlassButton from "@/components/GlassCard/GlassButton";
import heroGraphic from "@/assets/svg/search-hero.svg";
import LeftOutlinedIcon from "@/assets/icon/LeftOutlined.svg";
import RightOutlinedIcon from "@/assets/icon/RightOutlined.svg";
import DownloadIcon from "@/assets/icon/download.svg";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { searchCvs } from "@/api/cvSearch";
import { downloadCvByCode } from "@/api/fileService";
import { PRESET_KEYWORDS } from "@/constants/presetKeywords";

const LIMIT = 50;

export default function SearchPage() {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const hasQuery = query.trim().length > 0;

  const activeCandidate =
    results.length > 0
      ? results[Math.min(currentIndex, results.length - 1)]
      : null;

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    try {
      setLoading(true);
      setCurrentIndex(0);

      const res = await searchCvs(q, LIMIT);
      setResults(Array.isArray(res?.metadata) ? res.metadata : []);

      if (!res?.metadata?.length) {
        enqueueSnackbar("No results found.", { variant: "info" });
      }
    } catch (err) {
      enqueueSnackbar(err?.message || "Search failed", { variant: "error" });
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (word) => {
    const w = word.trim();
    const tokens = query
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (tokens.some((t) => t.toLowerCase() === w.toLowerCase())) return;

    const next = [...tokens, w].join(", ");
    setQuery(next);

    setTimeout(() => {
      const fakeEvent = { preventDefault() {} };
      handleSearchSubmit(fakeEvent);
    }, 0);
  };

  const handlePrev = () => {
    if (results.length <= 1) return;
    if (currentIndex === 0) return;
    setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (results.length <= 1) return;
    if (currentIndex === results.length - 1) return;
    setCurrentIndex((prev) => prev + 1);
  };

  const handleClear = () => {
    setQuery("");
    setCurrentIndex(0);
    setResults([]);
  };

  const handleDownload = async () => {
    if (!activeCandidate?.code) return;

    try {
      await downloadCvByCode(activeCandidate.code);
      enqueueSnackbar("Download started.", { variant: "success" });
    } catch (err) {
      enqueueSnackbar(err?.message || "Download failed", { variant: "error" });
    }
  };

  return (
    <div className="search-root">
      <button
        type="button"
        className="search-back-dashboard"
        onClick={() => navigate("/dashboard")}
      >
        ← Go to dashboard
      </button>
      <div className="search-left">
        <h1 className="search-title">Search for the talent...</h1>

        <form className="search-input-row" onSubmit={handleSearchSubmit}>
          <div className="search-input-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Type skills, role, language..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            {hasQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={handleClear}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <button type="submit" className="search-btn" disabled={loading}>
            {loading ? (
              <span className="typing-dots">
                <i></i>
                <i></i>
                <i></i>
              </span>
            ) : (
              "search"
            )}
          </button>
        </form>

        <div className="search-chips">
          {PRESET_KEYWORDS.map((w) => (
            <button
              key={w}
              type="button"
              className={
                query.toLowerCase().includes(w.toLowerCase())
                  ? "search-chip search-chip--active"
                  : "search-chip"
              }
              onClick={() => handleChipClick(w)}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      <div className="search-right">
        {(!hasQuery || !activeCandidate) && (
          <img
            src={heroGraphic}
            alt="Search illustration"
            className="search-hero-graphic"
          />
        )}

        <div className="search-right-inner">
          {hasQuery && activeCandidate && (
            <div className="search-result-wrapper">
              <div className="search-nav-top">
                <GlassButton
                  type="button"
                  className="search-arrow-top glass-icon-btn"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                >
                  <img src={LeftOutlinedIcon} alt="Previous" />
                </GlassButton>

                <span className="search-nav-indicator">
                  {currentIndex + 1} / {results.length}
                </span>

                <GlassButton
                  type="button"
                  className="search-arrow-top glass-icon-btn"
                  onClick={handleNext}
                  disabled={currentIndex === results.length - 1}
                >
                  <img src={RightOutlinedIcon} alt="Next" />
                </GlassButton>
              </div>

              <GlassCard className="search-result-card">
                <div className="search-result-content">
                  <div className="search-result-text-block">
                    <p className="search-result-line">
                      <span className="search-result-label">Name:</span>{" "}
                      {activeCandidate.name}
                    </p>

                    <p className="search-result-line">
                      <span className="search-result-label">Email:</span>{" "}
                      <a
                        href={`mailto:${activeCandidate.email}`}
                        className="search-result-email"
                      >
                        {activeCandidate.email}
                      </a>
                    </p>

                    <p className="search-result-line">
                      <span className="search-result-label">CV Type:</span>{" "}
                      {activeCandidate.cvType || "-"}
                    </p>

                    <p className="search-result-line">
                      <span className="search-result-label">Categories:</span>{" "}
                      {(activeCandidate.categories || []).join(", ") || "-"}
                    </p>

                    <p className="search-result-line">
                      <span className="search-result-label">Skills:</span>{" "}
                      {(activeCandidate.skills || []).slice(0, 10).join(", ") ||
                        "-"}
                    </p>

                    <p className="search-result-line">
                      <span className="search-result-label">Education:</span>{" "}
                      {(activeCandidate.education || [])[0] || "-"}
                    </p>
                  </div>

                  <div className="search-download-section">
                    <span className="search-download-text">Download CV</span>
                    <GlassButton
                      type="button"
                      className="search-download-circle glass-icon-btn"
                      onClick={handleDownload}
                      disabled={!activeCandidate.code}
                      title={activeCandidate.code}
                    >
                      <img src={DownloadIcon} alt="Download CV" />
                    </GlassButton>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
