import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AdminCvDetailPage.css";

export default function AdminCvDetailPage() {
  const navigate = useNavigate();
  const { cvId } = useParams();

  const [loading, setLoading] = useState(true);
  const [cv, setCv] = useState(null);

  useEffect(() => {
    loadCv();
  }, [cvId]);

  const loadCv = async () => {
    try {
      setLoading(true);

      // TODO:
      // const res = await getCvById(cvId);

      //   const res = YOUR_API_RESPONSE_HERE;

      //   const item = res.data.data[0];

      const item = {
        id: cvId,
        code: "FILE_B3C6A9",
        status: "done",

        candidateName: "Tran Gia Thuan",

        submitterEmail: "cung0976@gmail.com",
        submitterPhone: "098765213",

        predictedRole: "Backend Developer",
        confirmedPredictedRole: null,

        targetRoles: ["Backend_Developer"],

        english: "Basic reading and comprehension of technical documents",

        education: {
          school: "Nguyen Tat Thanh University",
          gpa: "3.4 / 4.0",
        },

        skills: [
          {
            name: "Node.js",
            status: "present",
          },
          {
            name: "Express.js",
            status: "present",
          },
          {
            name: "ReactJS",
            status: "present",
          },
          {
            name: "MySQL",
            status: "present",
          },
          {
            name: "MongoDB",
            status: "present",
          },
          {
            name: "TypeScript",
            status: "listed_only",
          },
          {
            name: "Docker",
            status: "listed_only",
          },
        ],

        roleFeatureScores: {
          Backend_Developer_score: 3.6,
          Data_Engineer_score: 0.5,
          Frontend_Developer_score: 0.1,
          DevOps_Cloud_Engineer_score: 0.1,
          AI_Engineer_score: 0,
          Tester_score: 0,
        },

        projects: [
          {
            name: "Seed Business Website",
            role: "Fullstack Developer",

            tech: ["ReactJS", "Bootstrap", "Node.js", "Express.js", "Mongoose"],

            responsibilities: [
              "User authentication via JWT",
              "Order processing and PayPal integration",
              "Admin dashboard for revenue statistics",
            ],

            outcomes: ["Implemented full e-commerce shopping functionalities"],
          },

          {
            name: "Pharmacy Management Website",
            role: "Fullstack",

            tech: ["ReactJS", "Bootstrap", "Node.js", "Express.js", "MySQL"],

            responsibilities: [
              "Inventory management",
              "Product management",
              "Shopping cart handling",
            ],

            outcomes: ["Developed an online pharmaceutical management system"],
          },
        ],

        recommendationReasoning: {
          strengths:
            "Strong academic foundation with GPA 3.4/4.0. Practical experience with Node.js, Express.js, ReactJS and SQL/NoSQL databases.",

          weaknesses:
            "Limited English proficiency and no professional working experience yet.",

          confidence_level: "High",

          hr_explanation:
            "Suitable for Backend Developer internship or junior position. Has demonstrated solid technical ability through academic and personal projects.",
        },

        riskFlags: ["Limited English proficiency (Basic reading only)"],
      };

      setCv(item);

      setCv(item);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="admin-cv-detail">Loading...</div>;
  }

  if (!cv) {
    return <div className="admin-cv-detail">CV not found.</div>;
  }

  const displayRole = cv.confirmedPredictedRole || cv.predictedRole || "-";

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
          <h3>Target Roles</h3>

          <div className="admin-cv-detail__chips">
            {(cv.targetRoles || []).map((role) => (
              <span key={role} className="admin-cv-detail__chip">
                {role
                  .replaceAll("_", " ")
                  .split(" ")
                  .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
                  .join(" ")}
              </span>
            ))}
          </div>
        </section>

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
          className="admin-cv-detail__download-btn"
          onClick={() => {
            // TODO: downloadCv(cv.code)
            console.log("download", cv.code);
          }}
        >
          ⬇ Download CV
        </button>
      </div>
    </div>
  );
}
