import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

import "./JobsPage.css";
import JobCard from "@/components/Jobs/JobCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { getPublicJobFilterOptions, listPublicJobs } from "@/api/publicJobs";
const FETCH_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 350;

export default function JobsPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [jobs, setJobs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterOptions, setFilterOptions] = useState(null);
  const [locationIds, setLocationIds] = useState(() => new Set());
  const [jobTypeIds, setJobTypeIds] = useState(() => new Set());
  const [organizationIds, setOrganizationIds] = useState(() => new Set());

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadFilterOptions = useCallback(async () => {
    try {
      const data = await getPublicJobFilterOptions();
      setFilterOptions(data);
    } catch (err) {
      enqueueSnackbar(err?.message || "Failed to load filters", { variant: "error" });
      setFilterOptions(null);
    }
  }, [enqueueSnackbar]);

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await listPublicJobs({
        pageNumber: 1,
        pageSize: FETCH_SIZE,
        search: debouncedSearch || undefined,
        locationIds: [...locationIds],
        jobTypeIds: [...jobTypeIds],
        organizationIds: [...organizationIds],
      });
      setJobs(Array.isArray(res?.data) ? res.data : []);
      setTotalCount(res?.totalCount ?? 0);
    } catch (err) {
      enqueueSnackbar(err?.message || "Failed to load jobs", { variant: "error" });
      setJobs([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, locationIds, jobTypeIds, organizationIds, enqueueSnackbar]);

  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const toggleFilter = (setter, id) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setLocationIds(new Set());
    setJobTypeIds(new Set());
    setOrganizationIds(new Set());
  };

  const hasFilters =
    Boolean(search) ||
    locationIds.size > 0 ||
    jobTypeIds.size > 0 ||
    organizationIds.size > 0;

  const locations = filterOptions?.locations || [];
  const jobTypes = filterOptions?.jobTypes || [];
  const organizations = filterOptions?.organizations || [];
  const availableCount = hasFilters ? totalCount : filterOptions?.totalActiveJobs ?? totalCount;

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
              {availableCount} job{availableCount === 1 ? "" : "s"} available
            </span>
            {hasFilters && (
              <button type="button" className="jobs-sidebar__clear" onClick={clearFilters}>
                Clear all
              </button>
            )}
          </div>

          <div className="jobs-filter-group">
            <h3>Location</h3>
            <div className="jobs-filter-pills">
              {locations.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`jobs-pill${locationIds.has(item.id) ? " is-active" : ""}`}
                  onClick={() => toggleFilter(setLocationIds, item.id)}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          <div className="jobs-filter-group">
            <h3>Job Types</h3>
            <div className="jobs-filter-pills">
              {jobTypes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`jobs-pill${jobTypeIds.has(item.id) ? " is-active" : ""}`}
                  onClick={() => toggleFilter(setJobTypeIds, item.id)}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          <div className="jobs-filter-group">
            <h3>Organizations</h3>
            <div className="jobs-filter-pills">
              {organizations.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`jobs-pill${organizationIds.has(item.id) ? " is-active" : ""}`}
                  onClick={() => toggleFilter(setOrganizationIds, item.id)}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="jobs-list" aria-label="Job listings">
          {loading ? (
            <div className="jobs-list__loading">
              <LoadingSpinner label="Loading jobs" />
            </div>
          ) : jobs.length === 0 ? (
            <p className="jobs-list__empty">No open jobs match your filters.</p>
          ) : (
            jobs.map((job) => <JobCard key={job.publicCode} job={job} />)
          )}
        </section>
      </div>
    </div>
  );
}
