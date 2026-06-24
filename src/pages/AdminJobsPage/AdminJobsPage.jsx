import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

import "@/styles/admin-ui.css";
import "./AdminJobsPage.css";
import FlexibleDataTable from "@/components/DataTable/FlexibleDataTable";
import JobLookupSection from "@/components/Jobs/JobLookupSection";
import Pagination from "@/components/Pagination/Pagination";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ModalPortal from "@/components/ui/ModalPortal";
import { createCvPost, getPublicApplyUrl, listCvPosts } from "@/api/cvPost";
import { getJobTypes, getLocations, getOrganizations } from "@/api/jobLookup";
import { formatJobDate, fromDateInput } from "@/utils/jobDisplay";
import { usePermissions } from "@/auth/usePermissions";
import { canDo } from "@/utils/permissions";

const PAGE_TABS = [
  { id: "jobs", label: "Jobs" },
  { id: "lookups", label: "Lookup data" },
];
const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract"];
const WORK_MODES = ["On-site", "Hybrid Work", "Remote Work"];
const PAGE_SIZE = 10;

const COLUMNS = [
  { key: "title", label: "Job title", width: "minmax(300px, 2fr)" },
  {
    key: "organization",
    label: "Organization",
    width: "minmax(200px, 1fr)",
    render: (row) => row.organization?.name || "—",
  },
  {
    key: "isActive",
    label: "Status",
    width: "200px",
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
    key: "displayDate",
    label: "Posted",
    width: "200px",
    render: (row) => formatJobDate(row.displayDate || row.postedDate),
  },
  // { key: "publicCode", label: "Code", width: "110px" },
];

const EMPTY_CREATE = {
  title: "",
  description: "",
  organizationId: "",
  primaryLocationId: "",
  jobTypeId: "",
  functionalTeam: "Engineering",
  employmentType: "Full-time",
  workMode: "Hybrid Work",
  closingDate: "",
  isReferralEnabled: false,
};

export default function AdminJobsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const { permissions } = usePermissions();
  const canCreateJob = canDo(permissions, "Job", "Create");
  const canReadJob = canDo(permissions, "Job", "Read");

  const [pageTab, setPageTab] = useState("jobs");
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE);
  const [locations, setLocations] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await listCvPosts({
        pageNumber: page,
        pageSize,
        search: filter || undefined,
      });
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
  }, [page, pageSize, filter, enqueueSnackbar]);

  const loadLookups = useCallback(async () => {
    try {
      const [locRes, orgRes, typeRes] = await Promise.all([
        getLocations(),
        getOrganizations(),
        getJobTypes(),
      ]);
      setLocations(Array.isArray(locRes) ? locRes : []);
      setOrganizations(Array.isArray(orgRes) ? orgRes : []);
      setJobTypes(Array.isArray(typeRes) ? typeRes : []);
    } catch (err) {
      enqueueSnackbar(err?.message || "Failed to load lookup data", {
        variant: "error",
      });
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    if (location.state?.pageTab) {
      setPageTab(location.state.pageTab);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (pageTab === "jobs") loadJobs();
  }, [pageTab, loadJobs]);

  useEffect(() => {
    if (showCreate || pageTab === "jobs") loadLookups();
  }, [showCreate, pageTab, loadLookups]);

  const filtered = useMemo(() => jobs, [jobs]);

  const copyApplyLink = async (publicCode) => {
    const url = getPublicApplyUrl(publicCode);
    try {
      await navigator.clipboard.writeText(url);
      enqueueSnackbar("Apply link copied.", { variant: "success" });
    } catch {
      enqueueSnackbar(url, { variant: "info" });
    }
  };

  const updateCreateField = (key, value) => {
    setCreateForm((prev) => ({ ...prev, [key]: value }));
  };

  const buildCreateBody = () => ({
    title: createForm.title.trim(),
    description: createForm.description.trim() || undefined,
    organizationId: createForm.organizationId || undefined,
    primaryLocationId: createForm.primaryLocationId || undefined,
    locationIds: createForm.primaryLocationId
      ? [createForm.primaryLocationId]
      : undefined,
    jobTypeIds: createForm.jobTypeId ? [createForm.jobTypeId] : undefined,
    functionalTeam: createForm.functionalTeam.trim() || undefined,
    employmentType: createForm.employmentType || undefined,
    workMode: createForm.workMode || undefined,
    closingDate: fromDateInput(createForm.closingDate),
    isReferralEnabled: createForm.isReferralEnabled,
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createForm.title.trim()) {
      enqueueSnackbar("Title is required.", { variant: "warning" });
      return;
    }

    try {
      setCreating(true);
      const created = await createCvPost(buildCreateBody());
      enqueueSnackbar("Job created.", { variant: "success" });
      setShowCreate(false);
      setCreateForm(EMPTY_CREATE);
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
      <div className="admin-jobs-tabs">
        {PAGE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`admin-jobs-tab${pageTab === tab.id ? " is-active" : ""}`}
            onClick={() => setPageTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {pageTab === "jobs" && (
        <div className="admin-jobs-panel">
          <div className="admin-jobs-toolbar">
            <div className="admin-jobs-search">
              <i className="fa-solid fa-magnifying-glass" aria-hidden />
              <input
                type="search"
                placeholder="Search jobs..."
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              onClick={() => {
                setCreateForm(EMPTY_CREATE);
                setShowCreate(true);
              }}
              hidden={!canCreateJob}
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
                    {canReadJob && (
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost admin-btn--sm"
                        onClick={() => navigate(`/admin/jobs/${row.id}`)}
                      >
                        Manage
                      </button>
                    )}
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost admin-btn--sm"
                      onClick={() => navigate(`/jobs/${row.publicCode}`)}
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
      )}

      {pageTab === "lookups" && (
        <div className="admin-jobs-panel">
          <JobLookupSection />
        </div>
      )}

      {showCreate && (
        <ModalPortal>
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
              <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>
                Add the basics now. Full job page content can be filled in on
                the settings screen after creation.
              </p>
              <div className="admin-jobs-field">
                <label htmlFor="job-title">Title *</label>
                <input
                  id="job-title"
                  maxLength={200}
                  value={createForm.title}
                  onChange={(e) => updateCreateField("title", e.target.value)}
                  placeholder="Senior DevOps Engineer (AWS), Da Nang"
                  required
                />
              </div>
              <div className="admin-jobs-field">
                <label htmlFor="job-desc">Short description</label>
                <textarea
                  id="job-desc"
                  rows={3}
                  maxLength={500}
                  value={createForm.description}
                  onChange={(e) =>
                    updateCreateField("description", e.target.value)
                  }
                  placeholder="One-line summary shown on job cards"
                />
              </div>
              <div className="admin-jobs-modal__row">
                <div className="admin-jobs-field">
                  <label htmlFor="job-org">Organization</label>
                  <select
                    id="job-org"
                    value={createForm.organizationId}
                    onChange={(e) =>
                      updateCreateField("organizationId", e.target.value)
                    }
                  >
                    <option value="">— Select —</option>
                    {organizations.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="admin-jobs-field">
                  <label htmlFor="job-primary-loc">Location</label>
                  <select
                    id="job-primary-loc"
                    value={createForm.primaryLocationId}
                    onChange={(e) =>
                      updateCreateField("primaryLocationId", e.target.value)
                    }
                  >
                    <option value="">— Select —</option>
                    {locations.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="admin-jobs-modal__row">
                <div className="admin-jobs-field">
                  <label htmlFor="job-type">Job type</label>
                  <select
                    id="job-type"
                    value={createForm.jobTypeId}
                    onChange={(e) =>
                      updateCreateField("jobTypeId", e.target.value)
                    }
                  >
                    <option value="">— Select —</option>
                    {jobTypes.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="admin-jobs-field">
                  <label htmlFor="job-team">Functional team</label>
                  <input
                    id="job-team"
                    value={createForm.functionalTeam}
                    onChange={(e) =>
                      updateCreateField("functionalTeam", e.target.value)
                    }
                    placeholder="Engineering"
                  />
                </div>
              </div>
              <div className="admin-jobs-modal__row">
                <div className="admin-jobs-field">
                  <label htmlFor="job-employment">Employment type</label>
                  <select
                    id="job-employment"
                    value={createForm.employmentType}
                    onChange={(e) =>
                      updateCreateField("employmentType", e.target.value)
                    }
                  >
                    {EMPLOYMENT_TYPES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="admin-jobs-field">
                  <label htmlFor="job-work-mode">Work mode</label>
                  <select
                    id="job-work-mode"
                    value={createForm.workMode}
                    onChange={(e) =>
                      updateCreateField("workMode", e.target.value)
                    }
                  >
                    {WORK_MODES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="admin-jobs-field">
                <label htmlFor="job-closing">Closing date (optional)</label>
                <input
                  id="job-closing"
                  type="date"
                  value={createForm.closingDate}
                  onChange={(e) =>
                    updateCreateField("closingDate", e.target.value)
                  }
                />
              </div>
              <div className="admin-jobs-field">
                <label
                  className="admin-jobs-field__check"
                  htmlFor="job-referral"
                >
                  <input
                    id="job-referral"
                    type="checkbox"
                    checked={createForm.isReferralEnabled}
                    onChange={(e) =>
                      updateCreateField("isReferralEnabled", e.target.checked)
                    }
                  />
                  Enable refer a friend
                </label>
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
        </ModalPortal>
      )}
    </div>
  );
}
