import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";

import "./JobDetailPage.css";
import ApplyModal from "@/components/Jobs/ApplyModal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { getPublicApplyUrl } from "@/api/cvPost";
import { getPublicJobByCode } from "@/api/publicJobs";
import { formatJobDate, publicJobDetailMeta } from "@/utils/jobDisplay";

function Section({ title, content }) {
  if (!content?.trim()) return null;
  return (
    <>
      <h2>{title}</h2>
      <div className="job-detail__desc">{content}</div>
    </>
  );
}

export default function JobDetailPage() {
  const { publicCode } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);

  const loadJob = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPublicJobByCode(publicCode);
      setJob(data);
    } catch (err) {
      enqueueSnackbar(err?.message || "Job not found", { variant: "error" });
      navigate("/jobs", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [publicCode, navigate, enqueueSnackbar]);

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

  const handleApply = () => {
    if (!canApply) return;
    setShowApply(true);
  };

  const handleRefer = async () => {
    if (!job?.publicCode) return;
    const url = getPublicApplyUrl(job.publicCode);
    try {
      await navigator.clipboard.writeText(url);
      enqueueSnackbar("Apply link copied — share with a friend.", { variant: "success" });
    } catch {
      enqueueSnackbar(url, { variant: "info" });
    }
  };

  const orgName = job?.organization?.name || "Synergy Hub";

  return (
    <div className="job-detail">
      <button type="button" className="job-detail__back" onClick={() => navigate("/jobs")}>
        ← Back to jobs
      </button>

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
            {meta.workMode && <span className="job-detail__tag">{meta.workMode}</span>}
          </div>

          <div className="job-detail__actions">
            <button
              type="button"
              className="job-detail__apply"
              onClick={handleApply}
              disabled={!canApply}
            >
              Apply for this job
            </button>
            {showRefer && (
              <button type="button" className="job-detail__refer" onClick={handleRefer}>
                Refer a friend
              </button>
            )}
          </div>
        </div>
      </header>

      <article className="job-detail__body">
        <p className="job-detail__overview">
          {job?.companyDescription ? (
            job.companyDescription
          ) : (
            <>
              <strong>{orgName}</strong> connects talented professionals with teams that need
              their skills. We help organizations collect CVs, organize candidate profiles, and
              hire with confidence.
            </>
          )}
        </p>

        <Section title="About this role" content={job?.aboutThisRole || job?.description} />
        <Section title="Responsibilities" content={job?.responsibilities} />
        <Section title="Qualifications" content={job?.qualifications} />
        <Section title="Benefits" content={job?.benefits} />

        {!job?.aboutThisRole && !job?.description && !job?.responsibilities && (
          <p className="job-detail__desc">
            Details for this role will be updated soon. Use the apply button above to submit
            your CV.
          </p>
        )}
      </article>

      {showApply && (
        <ApplyModal
          publicCode={job.publicCode}
          jobTitle={job.title}
          onClose={() => setShowApply(false)}
        />
      )}
    </div>
  );
}
