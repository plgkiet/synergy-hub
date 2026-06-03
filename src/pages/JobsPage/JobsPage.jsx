import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

import "./JobsPage.css";
import JobCard from "@/components/Jobs/JobCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { listMyCvPosts } from "@/api/cvPost";
import {
  JOB_FILTER_GROUPS,
  jobMatchesPills,
  jobMatchesSearch,
} from "@/utils/jobDisplay";

const FETCH_SIZE = 50;

export default function JobsPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activePills, setActivePills] = useState(() => new Set());

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await listMyCvPosts({ pageNumber: 1, pageSize: FETCH_SIZE });
      const rows = Array.isArray(res?.data) ? res.data : [];
      setJobs(rows.filter((j) => j.isActive !== false));
    } catch (err) {
      enqueueSnackbar(err?.message || "Failed to load jobs", { variant: "error" });
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const filtered = useMemo(
    () =>
      jobs.filter(
        (job) => jobMatchesSearch(job, search) && jobMatchesPills(job, activePills)
      ),
    [jobs, search, activePills]
  );

  const togglePill = (pill) => {
    setActivePills((prev) => {
      const next = new Set(prev);
      if (next.has(pill)) next.delete(pill);
      else next.add(pill);
      return next;
    });
  };

  const clearFilters = () => {
    setSearch("");
    setActivePills(new Set());
  };

  return (
    <div className="jobs-page">
      <div className="jobs-page__top">
        <button
          type="button"
          className="jobs-page__back"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>
      </div>

      <div className="jobs-page__layout">
        <aside className="jobs-sidebar">
          <h1 className="jobs-sidebar__title">Find Your Job</h1>

          <div className="jobs-sidebar__search">
            <i className="fa-solid fa-magnifying-glass" aria-hidden />
            <input
              type="search"
              placeholder="Java, JavaScript, Mobile, etc."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="jobs-sidebar__stats">
            <span>
              {filtered.length} job{filtered.length === 1 ? "" : "s"} available
            </span>
            {(search || activePills.size > 0) && (
              <button type="button" className="jobs-sidebar__clear" onClick={clearFilters}>
                Clear all
              </button>
            )}
          </div>

          <div className="jobs-filter-group">
            <h3>Location</h3>
            <div className="jobs-filter-pills">
              {JOB_FILTER_GROUPS.location.map((pill) => (
                <button
                  key={pill}
                  type="button"
                  className={`jobs-pill${activePills.has(pill) ? " is-active" : ""}`}
                  onClick={() => togglePill(pill)}
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>

          <div className="jobs-filter-group">
            <h3>Job Types</h3>
            <div className="jobs-filter-pills">
              {JOB_FILTER_GROUPS.jobType.map((pill) => (
                <button
                  key={pill}
                  type="button"
                  className={`jobs-pill${activePills.has(pill) ? " is-active" : ""}`}
                  onClick={() => togglePill(pill)}
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>

          <div className="jobs-filter-group">
            <h3>Organizations</h3>
            <div className="jobs-filter-pills">
              <button
                type="button"
                className={`jobs-pill${activePills.has("Synergy Hub") ? " is-active" : ""}`}
                onClick={() => togglePill("Synergy Hub")}
              >
                Synergy Hub
              </button>
            </div>
          </div>
        </aside>

        <section className="jobs-list" aria-label="Job listings">
          {loading ? (
            <div className="jobs-list__loading">
              <LoadingSpinner label="Loading jobs" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="jobs-list__empty">No open jobs match your filters.</p>
          ) : (
            filtered.map((job) => <JobCard key={job.id} job={job} />)
          )}
        </section>
      </div>
    </div>
  );
}
