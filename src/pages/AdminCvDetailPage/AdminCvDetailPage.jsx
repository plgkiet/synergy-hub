import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import "./AdminCvDetailPage.css";
import { getCvById } from "@/api/cvDocument";
import { downloadCvByCode } from "@/api/fileService";
import CvPreviewModal from "@/components/CvPreviewModal/CvPreviewModal";

export default function AdminCvDetailPage() {
  const navigate = useNavigate();
  const { cvId } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [cv, setCv] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    loadCv();

    return () => {
      setCv(null);
    };
  }, [cvId]);

  const loadCv = async () => {
    try {
      setLoading(true);

      // TODO:
      const res = await getCvById(cvId);
      setCv(res);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-cv-detail">
        <div
          className="admin-cv-detail__state admin-cv-detail__state--loading"
          role="status"
          aria-label="Loading CV"
        >
          <span className="admin-cv-detail__bouncing-dot" aria-hidden="true" />
          <p className="admin-cv-detail__state-text">Loading CV…</p>
        </div>
      </div>
    );
  }

  if (!cv) {
    return (
      <div className="admin-cv-detail">
        <button className="admin-cv-detail__back" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="admin-cv-detail__state admin-cv-detail__state--empty">
          <div className="admin-cv-detail__empty-illustration" aria-hidden="true">
            <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect
                x="24"
                y="16"
                width="56"
                height="72"
                rx="8"
                fill="rgba(37, 99, 235, 0.1)"
                stroke="#93c5fd"
                strokeWidth="2"
              />
              <path
                d="M40 36h24M40 48h24M40 60h16"
                stroke="#93c5fd"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="78" cy="78" r="22" fill="rgba(255,255,255,0.7)" stroke="#cbd5e1" strokeWidth="2" />
              <path
                d="M70 70l16 16M86 70l-16 16"
                stroke="#94a3b8"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <h2 className="admin-cv-detail__empty-title">CV not found</h2>
          <p className="admin-cv-detail__empty-message">
            This CV may have been removed, or the link you followed is no longer
            valid.
          </p>

          <button
            type="button"
            className="admin-cv-detail__empty-btn"
            onClick={() => navigate(-1)}
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  async function downloadCv() {
    try {
      await downloadCvByCode(cv.code);
    } catch (err) {
      enqueueSnackbar(err?.message || "Download failed", { variant: "error" });
    }
  }

  return (
    <div className="admin-cv-detail">
      <button className="admin-cv-detail__back" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="admin-cv-detail__card">
        <div className="admin-cv-detail__header">
          <div>
            <h1>{cv.candidateName}</h1>
            {/* <p>{displayRole}</p> */}
          </div>
          <span className="admin-cv-detail__role-badge">
            {cv.confirmedPredictedRole ||
              cv.predictedRole ||
              cv.targetRoles?.[0]}
          </span>{" "}
        </div>

        <div className="admin-cv-detail__grid">
          <div className="admin-cv-detail__item">
            <label>Email</label>
            <span>{cv.submitterEmail || "-"}</span>
          </div>

          <div className="admin-cv-detail__item">
            <label>Phone</label>
            <span>{cv.submitterPhone || "-"}</span>
          </div>

          <div className="admin-cv-detail__item">
            <label>English</label>
            <span>{cv.english || "-"}</span>
          </div>

          <div className="admin-cv-detail__item">
            <label>School</label>
            <span>{cv.education?.school || "-"}</span>
          </div>

          <div className="admin-cv-detail__item">
            <label>GPA</label>
            <span>{cv.education?.gpa || "-"}</span>
          </div>

          <div className="admin-cv-detail__item">
            <label>File Code</label>
            <span>{cv.code}</span>
          </div>
        </div>

        <section className="admin-cv-detail__section">
          <h3>Skills</h3>

          <div className="admin-cv-detail__chips">
            {(cv.skills || []).map((skill) => (
              <span
                key={skill.name}
                className={`admin-cv-detail__chip ${
                  skill.status === "present" ? "is-present" : "is-listed" 
                }`}
              >
                {skill.name}
              </span>
            ))}
          </div>
        </section>

        <section className="admin-cv-detail__section">
          <h3>Role Scores</h3>

          <div className="admin-cv-detail__score-cards">
            {Object.entries(cv.roleFeatureScores || {})
              .sort(([, a], [, b]) => b - a)
              .map(([key, value], index) => {
                if (["Mobile_Developer_score", "Data_Engineer_score", "MLOps_Engineer_score"].includes(key)) {
                  return null;
                }

                const label = key.replace("_score", "").replaceAll("_", " ");

                const percent = Math.min((value / 4) * 100, 100);

                return (
                  <div
                    key={key}
                    className={`admin-cv-detail__score-card ${
                      index === 0 ? "is-top-role" : ""
                    }`}
                  >
                    <div className="admin-cv-detail__score-header">
                      <span>{label}</span>
                      <strong>{value.toFixed(1)}</strong>
                    </div>

                    <div className="admin-cv-detail__score-bar">
                      <div
                        className="admin-cv-detail__score-fill"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </section>

        <section className="admin-cv-detail__section">
          <h3>Projects</h3>

          {(cv.projects || []).map((project, index) => (
            <div key={index} className="admin-cv-detail__project">
              <div className="admin-cv-detail__project-header">
                <span className="admin-cv-detail__project-badge">
                  Project #{index + 1}
                </span>

                <h4>{project.name}</h4>
              </div>

              <div className="admin-cv-detail__project-meta">
                <div>
                  <strong>Role</strong>
                  <span>{project.role}</span>
                </div>

                {!!project.tech?.length && (
                  <div>
                    <strong>Tech Stack</strong>
                    <span>{project.tech.join(", ")}</span>
                  </div>
                )}
              </div>

              {!!project.responsibilities?.length && (
                <div className="admin-cv-detail__project-block">
                  <strong>Responsibilities</strong>

                  <ul>
                    {project.responsibilities.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {!!project.outcomes?.length && (
                <div className="admin-cv-detail__project-block">
                  <strong>Outcomes</strong>

                  <ul>
                    {project.outcomes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </section>

        {!!cv.recommendationReasoning && (
          <section className="admin-cv-detail__section">
            <h3>AI Recommendation</h3>

            <div className="admin-cv-detail__ai-grid">
              <div className="admin-cv-detail__ai-card is-strength">
                <div className="admin-cv-detail__ai-title">Strengths</div>
                <p>{cv.recommendationReasoning.strengths}</p>
              </div>

              <div className="admin-cv-detail__ai-card is-weakness">
                <div className="admin-cv-detail__ai-title">Weaknesses</div>
                <p>{cv.recommendationReasoning.weaknesses}</p>
              </div>

              <div className="admin-cv-detail__ai-card is-confidence">
                <div className="admin-cv-detail__ai-title">Confidence</div>
                <div className="admin-cv-detail__confidence-pill">
                  {cv.recommendationReasoning.confidence_level}
                </div>
              </div>

              <div className="admin-cv-detail__ai-card is-hr">
                <div className="admin-cv-detail__ai-title">HR Assessment</div>
                <p>{cv.recommendationReasoning.hr_explanation}</p>
              </div>
            </div>
          </section>
        )}

        {!!cv.riskFlags?.length && (
          <section className="admin-cv-detail__section">
            <h3>Risk Flags</h3>

            <div className="admin-cv-detail__risk-cards">
              {cv.riskFlags.map((flag) => (
                <div key={flag} className="admin-cv-detail__risk-card">
                  <span className="admin-cv-detail__risk-icon">⚠</span>
                  <span>{flag}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
      <div className="admin-cv-detail__actions">
        <button
          type="button"
          className="admin-cv-detail__view-btn"
          onClick={() => setPreviewOpen(true)}
        >
          View CV
        </button>
        <button
          type="button"
          className="admin-cv-detail__download-btn"
          onClick={downloadCv}
        >
          ⬇ Download CV
        </button>
      </div>

      <CvPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        code={cv.code}
        title={cv.candidateName}
        fileType={cv.fileType || cv.cvType || ""}
        fileName={cv.fileName || cv.attach?.fileName || ""}
        onDownload={downloadCv}
      />
    </div>
  );
}
