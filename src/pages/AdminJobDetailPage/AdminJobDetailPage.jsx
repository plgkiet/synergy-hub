import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";

import "@/styles/admin-ui.css";
import "./AdminJobDetailPage.css";
import FlexibleDataTable from "@/components/DataTable/FlexibleDataTable";
import Pagination from "@/components/Pagination/Pagination";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ConfirmRoleDialog from "@/components/ui/ConfirmRoleDialog";
import { confirmPredictedRole } from "@/api/cvDocument";
import { downloadCvByCode } from "@/api/fileService";
import {
  getCvPostById,
  getPublicApplyUrl,
  listPostSubmissions,
  searchPostSubmissions,
  updateCvPost,
} from "@/api/cvPost";
import { formatRoleName } from "@/utils/jobDisplay";

const TABS = [
  { id: "settings", label: "Settings" },
  { id: "submissions", label: "Submissions" },
  { id: "search", label: "Search" },
];
const PAGE_SIZE = 10;

function statusClass(status) {
  return `admin-job-detail__status admin-job-detail__status--${status || "unverified"}`;
}

const SUBMISSION_COLUMNS = [
  { key: "candidateName", label: "Name", width: "minmax(140px, 1.2fr)" },
  { key: "submitterEmail", label: "Email", width: "minmax(160px, 1.4fr)" },
  { key: "submitterPhone", label: "Phone", width: "120px" },
  {
    key: "predictedRole",
    label: "Role",
    width: "minmax(160px, 1.1fr)",
    render: (row) => {
      const raw = row.confirmedPredictedRole || row.predictedRole;
      const label = formatRoleName(raw);
      return (
        <span className="admin-job-detail__role" title={label}>
          {label}
          {row.confirmedPredictedRole && (
            <span className="admin-job-detail__role-confirmed" title="Confirmed">
              ✓
            </span>
          )}
        </span>
      );
    },
  },
  {
    key: "status",
    label: "Status",
    width: "96px",
    align: "center",
    render: (row, value) => (
      <span className={statusClass(value)}>{value || "—"}</span>
    ),
  },
];

export default function AdminJobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [tab, setTab] = useState("settings");
  const [job, setJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editActive, setEditActive] = useState(true);

  const [submissions, setSubmissions] = useState([]);
  const [subPage, setSubPage] = useState(1);
  const [subPageSize, setSubPageSize] = useState(PAGE_SIZE);
  const [subTotal, setSubTotal] = useState(0);
  const [subTotalPages, setSubTotalPages] = useState(1);
  const [roleFilter, setRoleFilter] = useState("");
  const [loadingSubs, setLoadingSubs] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [roleDialog, setRoleDialog] = useState(null);
  const [roleInput, setRoleInput] = useState("");
  const [confirmingRole, setConfirmingRole] = useState(false);

  const loadJob = useCallback(async () => {
    try {
      setLoadingJob(true);
      const data = await getCvPostById(id);
      setJob(data);
      setEditTitle(data?.title || "");
      setEditDescription(data?.description || "");
      setEditActive(data?.isActive !== false);
    } catch (err) {
      enqueueSnackbar(err?.message || "Job not found", { variant: "error" });
      navigate("/admin/jobs", { replace: true });
    } finally {
      setLoadingJob(false);
    }
  }, [id, navigate, enqueueSnackbar]);

  const loadSubmissions = useCallback(async () => {
    try {
      setLoadingSubs(true);
      const res = await listPostSubmissions(id, {
        pageNumber: subPage,
        pageSize: subPageSize,
        role: roleFilter || undefined,
      });
      setSubmissions(Array.isArray(res?.data) ? res.data : []);
      setSubTotal(res?.totalCount ?? 0);
      setSubTotalPages(res?.totalPages ?? 1);
    } catch (err) {
      enqueueSnackbar(err?.message || "Failed to load submissions", {
        variant: "error",
      });
      setSubmissions([]);
    } finally {
      setLoadingSubs(false);
    }
  }, [id, subPage, subPageSize, roleFilter, enqueueSnackbar]);

  useEffect(() => {
    loadJob();
  }, [loadJob]);

  useEffect(() => {
    if (tab === "submissions" && id) loadSubmissions();
  }, [tab, id, loadSubmissions]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await updateCvPost(id, {
        title: editTitle.trim() || undefined,
        description: editDescription.trim() || undefined,
        isActive: editActive,
      });
      setJob(updated);
      enqueueSnackbar("Job updated.", { variant: "success" });
    } catch (err) {
      enqueueSnackbar(err?.message || "Update failed", { variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const copyApplyLink = async () => {
    if (!job?.publicCode) return;
    const url = getPublicApplyUrl(job.publicCode);
    try {
      await navigator.clipboard.writeText(url);
      enqueueSnackbar("Apply link copied.", { variant: "success" });
    } catch {
      enqueueSnackbar(url, { variant: "info" });
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    try {
      setSearching(true);
      const res = await searchPostSubmissions(id, {
        searchQuery: q,
        role: roleFilter || undefined,
      });
      setSearchResult(res);
      if (!res?.selectedCvs?.length && !res?.results?.length) {
        enqueueSnackbar("No matches found.", { variant: "info" });
      }
    } catch (err) {
      enqueueSnackbar(err?.message || "Search failed", { variant: "error" });
      setSearchResult(null);
    } finally {
      setSearching(false);
    }
  };

  const openRoleDialog = (row) => {
    setRoleDialog({
      cvId: row.id,
      candidateName: row.candidateName,
      predictedRole: row.predictedRole,
    });
    setRoleInput(formatRoleName(row.predictedRole) || "");
  };

  const closeRoleDialog = () => {
    if (confirmingRole) return;
    setRoleDialog(null);
    setRoleInput("");
  };

  const handleConfirmRole = async () => {
    const value = roleInput.trim();
    if (!value || !roleDialog?.cvId) {
      enqueueSnackbar("Enter a role before confirming.", { variant: "warning" });
      return;
    }
    try {
      setConfirmingRole(true);
      await confirmPredictedRole(roleDialog.cvId, value);
      enqueueSnackbar("Role confirmed.", { variant: "success" });
      setRoleDialog(null);
      setRoleInput("");
      loadSubmissions();
    } catch (err) {
      enqueueSnackbar(err?.message || "Failed to confirm role", {
        variant: "error",
      });
    } finally {
      setConfirmingRole(false);
    }
  };

  const handleDownload = async (code) => {
    if (!code) return;
    try {
      await downloadCvByCode(code);
      enqueueSnackbar("Download started.", { variant: "success" });
    } catch (err) {
      enqueueSnackbar(err?.message || "Download failed", { variant: "error" });
    }
  };

  if (loadingJob) {
    return <LoadingSpinner label="Loading job" />;
  }

  const topMatches =
    searchResult?.selectedCvs?.length > 0
      ? searchResult.selectedCvs
      : searchResult?.results || [];

  return (
    <div className="admin-job-detail">
      <button
        type="button"
        className="admin-btn admin-btn--ghost admin-btn--sm"
        onClick={() => navigate("/admin/jobs")}
      >
        ← All jobs
      </button>

      <div className="admin-job-detail__header">
        <div>
          <h1>{job?.title}</h1>
          <p className="admin-job-detail__meta">
            {job?.isActive ? "Open" : "Closed"} · Public code {job?.publicCode}
          </p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn--ghost"
          onClick={() => navigate(`/jobs/${id}`)}
        >
          Preview job page
        </button>
      </div>

      <div className="admin-job-detail__tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`admin-job-detail__tab${tab === t.id ? " is-active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "settings" && (
        <div className="admin-job-detail__panel">
          <form onSubmit={handleSaveSettings}>
            <div className="admin-job-detail__field">
              <label htmlFor="edit-title">Title</label>
              <input
                id="edit-title"
                maxLength={200}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="admin-job-detail__field">
              <label htmlFor="edit-desc">Description</label>
              <textarea
                id="edit-desc"
                maxLength={2000}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
            <div className="admin-job-detail__field">
              <label>
                <input
                  type="checkbox"
                  checked={editActive}
                  onChange={(e) => setEditActive(e.target.checked)}
                />{" "}
                Accept new applications
              </label>
            </div>
            <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
              {saving ? (
                <LoadingSpinner size="sm" inline variant="light" label="Saving" />
              ) : (
                "Save changes"
              )}
            </button>
          </form>

          <div className="admin-job-detail__link">
            <span>Apply link:</span>
            <code>{getPublicApplyUrl(job?.publicCode)}</code>
            <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={copyApplyLink}>
              Copy
            </button>
          </div>
        </div>
      )}

      {tab === "submissions" && (
        <div className="admin-job-detail__panel">
          <form
            className="admin-job-detail__toolbar"
            onSubmit={(e) => {
              e.preventDefault();
              setSubPage(1);
              loadSubmissions();
            }}
          >
            <label className="admin-job-detail__filter" htmlFor="role-filter">
              <span className="admin-job-detail__filter-label">Role filter</span>
              <input
                id="role-filter"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                placeholder="e.g. Backend"
              />
            </label>
            <button type="submit" className="admin-btn admin-btn--ghost">
              Apply filter
            </button>
          </form>

          {loadingSubs ? (
            <LoadingSpinner label="Loading submissions" />
          ) : (
            <>
              <FlexibleDataTable
                className="admin-submissions-table"
                columns={SUBMISSION_COLUMNS}
                data={submissions}
                emptyMessage="No applications yet."
                actionsColumnWidth="minmax(160px, auto)"
                renderActions={(row) => (
                  <div className="admin-job-detail__row-actions">
                    {row.code && (
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost admin-btn--sm"
                        onClick={() => handleDownload(row.code)}
                      >
                        CV
                      </button>
                    )}
                    {!row.confirmedPredictedRole && (
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost admin-btn--sm"
                        onClick={() => openRoleDialog(row)}
                      >
                        Confirm role
                      </button>
                    )}
                  </div>
                )}
              />

              <ConfirmRoleDialog
                open={Boolean(roleDialog)}
                candidateName={roleDialog?.candidateName}
                role={roleInput}
                loading={confirmingRole}
                onRoleChange={setRoleInput}
                onConfirm={handleConfirmRole}
                onCancel={closeRoleDialog}
              />
              {subTotal > 0 && (
                <Pagination
                  page={subPage}
                  pageSize={subPageSize}
                  totalCount={subTotal}
                  totalPages={subTotalPages}
                  onPageChange={setSubPage}
                  onPageSizeChange={(size) => {
                    setSubPageSize(size);
                    setSubPage(1);
                  }}
                />
              )}
            </>
          )}
        </div>
      )}

      {tab === "search" && (
        <div className="admin-job-detail__panel">
          <form className="admin-job-detail__toolbar" onSubmit={handleSearch}>
            <div>
              <label htmlFor="search-q">Search query</label>
              <input
                id="search-q"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="react typescript"
              />
            </div>
            <div>
              <label htmlFor="search-role">Role (optional)</label>
              <input
                id="search-role"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              />
            </div>
            <button type="submit" className="admin-btn admin-btn--primary" disabled={searching}>
              {searching ? (
                <LoadingSpinner size="sm" inline variant="light" label="Searching" />
              ) : (
                "Search candidates"
              )}
            </button>
          </form>

          {searchResult?.aiSelection?.reasoning && (
            <div className="admin-job-detail__ai">
              <strong>AI shortlist</strong>
              <p>{searchResult.aiSelection.reasoning}</p>
            </div>
          )}

          <div className="admin-job-detail__matches">
            {topMatches.map((cv) => (
              <div key={cv.id || cv.code} className="admin-job-detail__match">
                <h4>{cv.candidateName || cv.name || "Candidate"}</h4>
                {cv.score != null && (
                  <span className="admin-job-detail__score">Score: {cv.score.toFixed(3)}</span>
                )}
                <p>
                  {cv.submitterEmail || cv.email || "—"} ·{" "}
                  {formatRoleName(cv.confirmedPredictedRole || cv.predictedRole)}
                </p>
                {cv.code && (
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost admin-btn--sm"
                    onClick={() => handleDownload(cv.code)}
                  >
                    Download CV
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
