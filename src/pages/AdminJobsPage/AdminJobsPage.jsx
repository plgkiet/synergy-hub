import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

import "@/styles/admin-ui.css";
import "./AdminJobsPage.css";
import FlexibleDataTable from "@/components/DataTable/FlexibleDataTable";
import Pagination from "@/components/Pagination/Pagination";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { createCvPost, getPublicApplyUrl, listMyCvPosts } from "@/api/cvPost";
import { formatJobDate } from "@/utils/jobDisplay";

const PAGE_SIZE = 10;

const COLUMNS = [
  { key: "title", label: "Job title", width: "minmax(200px, 2fr)" },
  {
    key: "isActive",
    label: "Status",
    width: "100px",
    align: "center",
    render: (row) => (
      <span
        className={`admin-jobs-badge ${row.isActive ? "admin-jobs-badge--on" : "admin-jobs-badge--off"}`}
      >
        {row.isActive ? "Open" : "Closed"}
      </span>
    ),
  },
  {
    key: "createdDate",
    label: "Posted",
    width: "130px",
    render: (row) => formatJobDate(row.createdDate),
  },
  { key: "publicCode", label: "Code", width: "110px" },
];

export default function AdminJobsPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await listMyCvPosts({ pageNumber: page, pageSize });
      setJobs(Array.isArray(res?.data) ? res.data : []);
      setTotalCount(res?.totalCount ?? 0);
      setTotalPages(res?.totalPages ?? 1);
    } catch (err) {
      enqueueSnackbar(err?.message || "Failed to load jobs", {
        variant: "error",
      });
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, enqueueSnackbar]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter((j) =>
      `${j.title} ${j.description || ""}`.toLowerCase().includes(q),
    );
  }, [jobs, filter]);

  const copyApplyLink = async (publicCode) => {
    const url = getPublicApplyUrl(publicCode);
    try {
      await navigator.clipboard.writeText(url);
      enqueueSnackbar("Apply link copied.", { variant: "success" });
    } catch {
      enqueueSnackbar(url, { variant: "info" });
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) {
      enqueueSnackbar("Title is required.", { variant: "warning" });
      return;
    }

    try {
      setCreating(true);
      const created = await createCvPost({
        title: t,
        description: description.trim() || undefined,
      });
      enqueueSnackbar("Job created.", { variant: "success" });
      setShowCreate(false);
      setTitle("");
      setDescription("");
      await loadJobs();
      if (created?.id) navigate(`/admin/jobs/${created.id}`);
    } catch (err) {
      enqueueSnackbar(err?.message || "Create failed", { variant: "error" });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="admin-jobs-page">
      {/* <h1 className="admin-jobs-title">Jobs</h1> */}

      <div className="admin-jobs-panel">
        <div className="admin-jobs-toolbar">
          <div className="admin-jobs-search">
            <i className="fa-solid fa-magnifying-glass" aria-hidden />
            <input
              type="search"
              placeholder="Search jobs..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={() => setShowCreate(true)}
          >
            Create job
          </button>
        </div>

        <div className="admin-jobs-body">
          {loading ? (
            <LoadingSpinner label="Loading jobs" />
          ) : (
            <FlexibleDataTable
              className="admin-jobs-table"
              columns={COLUMNS}
              data={filtered}
              emptyMessage="No jobs yet. Create one to start collecting applications."
              renderActions={(row) => (
                <div className="admin-jobs-actions">
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost admin-btn--sm"
                    onClick={() => navigate(`/admin/jobs/${row.id}`)}
                  >
                    Manage
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost admin-btn--sm"
                    onClick={() => navigate(`/jobs/${row.id}`)}
                  >
                    View
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost admin-btn--sm"
                    onClick={() => copyApplyLink(row.publicCode)}
                  >
                    Copy link
                  </button>
                </div>
              )}
            />
          )}
        </div>

        {!loading && totalCount > 0 && (
          <div className="admin-jobs-pagination">
            <Pagination
              page={page}
              pageSize={pageSize}
              totalCount={totalCount}
              totalPages={totalPages}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </div>
        )}
      </div>

      {showCreate && (
        <div
          className="admin-jobs-modal-backdrop"
          role="presentation"
          onClick={() => !creating && setShowCreate(false)}
        >
          <form
            className="admin-jobs-modal"
            onSubmit={handleCreate}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Create job</h2>
            <div className="admin-jobs-field">
              <label htmlFor="job-title">Title *</label>
              <input
                id="job-title"
                maxLength={200}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Senior DevOps Engineer (AWS), Da Nang"
                required
              />
            </div>
            <div className="admin-jobs-field">
              <label htmlFor="job-desc">Description</label>
              <textarea
                id="job-desc"
                maxLength={2000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Role overview, requirements, benefits..."
              />
            </div>
            <div className="admin-jobs-modal-actions">
              <button
                type="button"
                className="admin-btn admin-btn--ghost"
                disabled={creating}
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="admin-btn admin-btn--primary"
                disabled={creating}
              >
                {creating ? (
                  <LoadingSpinner
                    size="sm"
                    inline
                    variant="light"
                    label="Creating"
                  />
                ) : (
                  "Create"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
