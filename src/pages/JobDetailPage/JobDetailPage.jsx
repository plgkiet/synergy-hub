import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";

import "./JobDetailPage.css";
import ApplyModal from "@/components/Jobs/ApplyModal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { getPublicApplyUrl, getSubmittedCvs } from "@/api/cvPost";
import { getPublicJobByCode } from "@/api/publicJobs";
import { formatJobDate, publicJobDetailMeta } from "@/utils/jobDisplay";

function Section({ title, content }) {
  if (!content?.trim()) return null;

  return (
    <section className="job-detail__section">
      <h2>{title}</h2>
      <div className="job-detail__desc">{content}</div>
    </section>
  );
}

function resolveAttachUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;

  const base = (import.meta.env.VITE_FILE_API_BASE_URL || "/fileapi").replace(
    /\/$/,
    "",
  );
  return `${base}${url.startsWith("/") ? url : `/${url}`}`;
}

export default function JobDetailPage() {
  const { publicCode } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const submissionsRef = useRef(null);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [isReapply, setIsReapply] = useState(false);
  const [submittedCvs, setSubmittedCvs] = useState([]);

  const loadSubmissions = useCallback(async (code) => {
    if (!code) {
      setSubmittedCvs([]);
      return;
    }

    try {
      const subs = await getSubmittedCvs(code);
      setSubmittedCvs(subs);
    } catch {
      setSubmittedCvs([]);
    }
  }, []);

  const loadJob = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getPublicJobByCode(publicCode);
      setJob(data);
      await loadSubmissions(data.publicCode);
    } catch (err) {
      enqueueSnackbar(err?.message || "Job not found", {
        variant: "error",
      });

      navigate("/jobs", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [publicCode, navigate, enqueueSnackbar, loadSubmissions]);

  useEffect(() => {
    loadJob();
  }, [loadJob]);

  if (loading) {
    return (
      <div className="job-detail">
        <div className="job-detail__loading">
          <LoadingSpinner label="Loading job" />
        </div>
      </div>
    );
  }

  const meta = publicJobDetailMeta(job);

  const canApply = Boolean(job?.publicCode);
  const showRefer = job?.isReferralEnabled !== false;
  const hasSubmissions = submittedCvs.length > 0;

  const handleApply = () => {
    if (!canApply) return;
    setIsReapply(false);
    setShowApply(true);
  };

  const handleReapply = () => {
    if (!canApply) return;
    setIsReapply(true);
    setShowApply(true);
  };

  const handleCloseApply = () => {
    setShowApply(false);
    setIsReapply(false);
  };

  const scrollToSubmissions = () => {
    submissionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePrimaryAction = () => {
    if (!canApply) return;

    if (hasSubmissions) {
      scrollToSubmissions();
      return;
    }

    handleApply();
  };

  const handleApplySuccess = async () => {
    await loadSubmissions(job?.publicCode);
  };

  const handleRefer = async () => {
    if (!job?.publicCode) return;

    const url = getPublicApplyUrl(job.publicCode);

    try {
      await navigator.clipboard.writeText(url);

      enqueueSnackbar("Apply link copied — share with a friend.", {
        variant: "success",
      });
    } catch {
      enqueueSnackbar(url, { variant: "info" });
    }
  };

  const orgName = job?.organization?.name || "Synergy Hub";

  return (
    <div className="job-detail">
      <button
        type="button"
        className="job-detail__back"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <div className="job-detail__container">
        <header className="job-detail__hero">
          <div className="job-detail__hero-pattern" aria-hidden />

          <div className="job-detail__hero-inner">
            <div>
              <h1 className="job-detail__title">{job?.title}</h1>

              <p className="job-detail__meta">
                <span>{meta.employmentType}</span>
                <span>{meta.location}</span>
                <span className="job-detail__dept">{meta.department}</span>
                <span>{formatJobDate(meta.date)}</span>
              </p>

              {meta.workMode && (
                <span className="job-detail__tag">{meta.workMode}</span>
              )}
            </div>

            <div className="job-detail__actions">
              <button
                type="button"
                className={`job-detail__apply${
                  hasSubmissions ? " job-detail__apply--submitted" : ""
                }`}
                onClick={handlePrimaryAction}
                disabled={!canApply}
              >
                {hasSubmissions
                  ? "View Your Submissions"
                  : "Apply for this job"}
              </button>

              {showRefer && (
                <div className="job-detail__refer-link" onClick={handleRefer}>
                  <i className="fa-solid fa-share-nodes" />
                  Refer a friend
                </div>
              )}
            </div>
          </div>
        </header>

        <article className="job-detail__body">
          <div className="job-detail__overview">
            {job?.companyDescription ? (
              job.companyDescription
            ) : (
              <>
                <strong>{orgName}</strong> connects talented professionals with
                teams that need their skills. We help organizations collect CVs,
                organize candidate profiles, and hire with confidence.
              </>
            )}
          </div>

          <Section
            title="About this role"
            content={job?.aboutThisRole || job?.description}
          />

          <Section title="Responsibilities" content={job?.responsibilities} />

          <Section title="Qualifications" content={job?.qualifications} />

          <Section title="Benefits" content={job?.benefits} />

          {!job?.aboutThisRole &&
            !job?.description &&
            !job?.responsibilities && (
              <div className="job-detail__empty">
                Details for this role will be updated soon. Use the apply button
                above to submit your CV.
              </div>
            )}
        </article>

        {hasSubmissions && (
          <section
            ref={submissionsRef}
            id="your-submissions"
            className="job-detail__submissions"
          >
            <div className="job-detail__submissions-header">
              <h2>Your submissions</h2>
              <button
                type="button"
                className="job-detail__reapply"
                onClick={handleReapply}
              >
                Re-apply
              </button>
            </div>
            <ul className="job-detail__submitted-cvs">
              {submittedCvs.map((cv) => {
                const fileName =
                  cv.attach?.fileName ||
                  (cv.code ? `CV ${cv.code}` : "Submitted CV");
                const downloadUrl = resolveAttachUrl(cv.attach?.url);
                const submittedAt = cv.createdAt || cv.submittedAt;

                const content = (
                  <>
                    <span className="job-detail__submitted-cv-icon" aria-hidden>
                      <svg viewBox="0 0 24 24" width="22" height="22">
                        <path
                          fill="currentColor"
                          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2 5 5h-5V4zM8 13h8v2H8v-2zm0 4h5v2H8v-2z"
                        />
                      </svg>
                    </span>

                    <div className="job-detail__submitted-cv-info">
                      <span className="job-detail__submitted-cv-title">
                        {fileName}
                      </span>
                      {(cv.code || submittedAt) && (
                        <span className="job-detail__submitted-cv-meta">
                          {cv.code && <>Ref: {cv.code}</>}
                          {cv.code && submittedAt && " · "}
                          {submittedAt && formatJobDate(submittedAt)}
                        </span>
                      )}
                    </div>

                    {downloadUrl && (
                      <span className="job-detail__submitted-cv-action">
                        Download
                        <svg
                          viewBox="0 0 24 24"
                          width="16"
                          height="16"
                          aria-hidden
                        >
                          <path
                            fill="currentColor"
                            d="M12 16l-5-5h3V4h4v7h3l-5 5zm-7 4h14v-2H5v2z"
                          />
                        </svg>
                      </span>
                    )}
                  </>
                );

                return (
                  <li
                    key={cv.code || cv.id}
                    className="job-detail__submitted-cv"
                  >
                    {downloadUrl ? (
                      <a
                        className="job-detail__submitted-cv-link"
                        href={downloadUrl}
                        download={fileName}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {content}
                      </a>
                    ) : (
                      <div className="job-detail__submitted-cv-static">
                        {content}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>

      {showApply && (
        <ApplyModal
          publicCode={job.publicCode}
          jobTitle={job.title}
          onClose={handleCloseApply}
          onSuccess={handleApplySuccess}
          isReapply={isReapply}
        />
      )}
    </div>
  );
}
