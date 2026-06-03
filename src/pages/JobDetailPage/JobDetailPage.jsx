import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";

import "./JobDetailPage.css";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { getCvPostById, getPublicApplyUrl } from "@/api/cvPost";
import { formatJobDate, inferJobMeta } from "@/utils/jobDisplay";

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadJob = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCvPostById(id);
      setJob(data);
    } catch (err) {
      enqueueSnackbar(err?.message || "Job not found", { variant: "error" });
      navigate("/jobs", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [id, navigate, enqueueSnackbar]);

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

  const meta = inferJobMeta(job);
  const canApply = job?.isActive !== false && job?.publicCode;

  const handleApply = () => {
    if (!canApply) return;
    navigate(`/apply/${job.publicCode}`);
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
              <span>Full-time</span>
              <span>{meta.location}</span>
              <span className="job-detail__dept">{meta.department}</span>
              <span>{formatJobDate(job?.createdDate)}</span>
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
            <button type="button" className="job-detail__refer" onClick={handleRefer}>
              Refer a friend
            </button>
          </div>
        </div>
      </header>

      <article className="job-detail__body">
        {job?.isActive === false && (
          <p className="job-detail__closed">This position is no longer accepting applications.</p>
        )}

        <p className="job-detail__overview">
          <strong>Synergy Hub</strong> connects talented professionals with teams that need
          their skills. We help organizations collect CVs, organize candidate profiles, and hire
          with confidence.
        </p>

        <h2>About this role</h2>
        {job?.description ? (
          <div className="job-detail__desc">{job.description}</div>
        ) : (
          <p className="job-detail__desc">
            Details for this role will be updated soon. Use the apply button above to submit
            your CV.
          </p>
        )}

        <h2>Responsibilities</h2>
        <p>
          Review the role description above and submit your application with an up-to-date CV.
          Our team will process your profile and match you with the hiring team.
        </p>
      </article>
    </div>
  );
}
