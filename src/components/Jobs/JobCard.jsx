import { Link } from "react-router-dom";
import { formatJobDate, jobCardMeta, slugifyTitle } from "@/utils/jobDisplay";
import "./JobCard.css";

export default function JobCard({ job }) {
  const meta = jobCardMeta(job);
  const slug = slugifyTitle(job.title);

  return (
    <Link
      to={`/jobs/${job.publicCode}`}
      className="job-card"
      state={{ slug }}
    >
      <h2 className="job-card__title">{job.title}</h2>
      <p className="job-card__meta">
        <span>{meta.jobType}</span>
        <span className="job-card__sep" aria-hidden>
          |
        </span>
        <span>{meta.location}</span>
        <span className="job-card__sep" aria-hidden>
          |
        </span>
        <span>{meta.department}</span>
        <span className="job-card__sep" aria-hidden>
          |
        </span>
        <span>{formatJobDate(meta.date)}</span>
      </p>
      {meta.workMode && <span className="job-card__tag">{meta.workMode}</span>}
    </Link>
  );
}
