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
import { getJobTypes, getLocations, getOrganizations } from "@/api/jobLookup";
import {
  formatRoleName,
  fromDateInput,
  joinCommaList,
  parseCommaList,
  toDateInput,
  toggleId,
} from "@/utils/jobDisplay";

function LookupPills({ items, selectedIds, onToggle, disabled }) {
  if (!items.length) {
    return <p className="admin-job-detail__hint">None available yet.</p>;
  }
  return (
    <div className="admin-job-detail__pills">
      {items.map((item) => {
        const active = selectedIds.includes(item.id);
        return (
          <button
            key={item.id}
            type="button"
            className={`admin-job-detail__pill${active ? " is-active" : ""}`}
            onClick={() => onToggle(item.id)}
            disabled={disabled}
          >
            {item.name}
          </button>
        );
      })}
    </div>
  );
}

const SETTINGS_SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "content", label: "Job page" },
  { id: "publishing", label: "Publishing" },
];
const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract"];
const WORK_MODES = ["On-site", "Hybrid Work", "Remote Work"];
import { usePermissions } from "@/auth/usePermissions";
import { canDo } from "@/utils/permissions";

const TABS = [
  { id: "settings", label: "Settings" },
  { id: "submissions", label: "Search" },
];
const PAGE_SIZE = 10;

function statusClass(status) {
  return `admin-job-detail__status admin-job-detail__status--${status || "unverified"}`;
}

function jobToForm(job) {
  return {
    title: job?.title || "",
    description: job?.description || "",
    organizationId: job?.organizationId || "",
    primaryLocationId: job?.primaryLocationId || "",
    locationIds: job?.locationIds || [],
    jobTypeIds: job?.jobTypeIds || [],
    functionalTeam: job?.functionalTeam || "",
    employmentType: job?.employmentType || "",
    workMode: job?.workMode || "",
    postedDate: toDateInput(job?.postedDate),
    closingDate: toDateInput(job?.closingDate),
    aboutThisRole: job?.aboutThisRole || "",
    companyDescription: job?.companyDescription || "",
    responsibilities: job?.responsibilities || "",
    qualifications: job?.qualifications || "",
    benefits: job?.benefits || "",
    companyWebsite: job?.companyWebsite || "",
    companyLinkedIn: job?.companyLinkedIn || "",
    isReferralEnabled: job?.isReferralEnabled === true,
    isActive: job?.isActive !== false,
    searchKeywords: joinCommaList(job?.searchKeywords),
    specialBonuses: joinCommaList(job?.specialBonuses),
  };
}

function buildUpdateBody(form) {
  const body = {
    title: form.title.trim() || undefined,
    description: form.description.trim() || undefined,
    organizationId: form.organizationId || undefined,
    primaryLocationId: form.primaryLocationId || undefined,
    locationIds: form.locationIds,
    jobTypeIds: form.jobTypeIds,
    functionalTeam: form.functionalTeam.trim() || undefined,
    employmentType: form.employmentType.trim() || undefined,
    workMode: form.workMode.trim() || undefined,
    postedDate: fromDateInput(form.postedDate),
    closingDate: fromDateInput(form.closingDate),
    aboutThisRole: form.aboutThisRole.trim() || undefined,
    companyDescription: form.companyDescription.trim() || undefined,
    responsibilities: form.responsibilities.trim() || undefined,
    qualifications: form.qualifications.trim() || undefined,
    benefits: form.benefits.trim() || undefined,
    companyWebsite: form.companyWebsite.trim() || undefined,
    companyLinkedIn: form.companyLinkedIn.trim() || undefined,
    isReferralEnabled: form.isReferralEnabled,
    isActive: form.isActive,
    searchKeywords: parseCommaList(form.searchKeywords),
    specialBonuses: parseCommaList(form.specialBonuses),
  };
  if (!body.searchKeywords.length) delete body.searchKeywords;
  if (!body.specialBonuses.length) delete body.specialBonuses;
  return body;
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
            <span
              className="admin-job-detail__role-confirmed"
              title="Confirmed"
            >
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
  const { permissions } = usePermissions();
  const canUpdateJob = canDo(permissions, "Job", "Update");

  const [tab, setTab] = useState("settings");
  const [settingsSection, setSettingsSection] = useState("overview");
  const [job, setJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState(jobToForm(null));
  const [locations, setLocations] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);

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

  const loadJob = useCallback(async () => {
    try {
      setLoadingJob(true);
      const data = await getCvPostById(id);
      setJob(data);
      setEditForm(jobToForm(data));
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
    loadLookups();
  }, [loadJob, loadLookups]);

  useEffect(() => {
    if (tab === "submissions" && id) loadSubmissions();
  }, [tab, id, loadSubmissions]);

  const updateField = (key, value) => {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  };

  const goToLookups = () =>
    navigate("/admin/jobs", { state: { pageTab: "lookups" } });

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await updateCvPost(id, buildUpdateBody(editForm));
      setJob(updated);
      setEditForm(jobToForm(updated));
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
    const role = roleFilter.trim();
    try {
      setSearching(true);
      if (q) {
        const res = await searchPostSubmissions(id, {
          searchQuery: q,
          role: role || undefined,
        });
        setSearchResult(res);
        if (!res?.selectedCvs?.length && !res?.results?.length) {
          enqueueSnackbar("No matches found.", {
            variant: "info",
          });
        }
        return;
      }
      setSearchResult(null);
      setSubPage(1);
      await loadSubmissions();
    } catch (err) {
      enqueueSnackbar(err?.message || "Search failed", {
        variant: "error",
      });
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
      enqueueSnackbar("Enter a role before confirming.", {
        variant: "warning",
      });
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

  const readOnly = !canUpdateJob;

  const hasQuery = Boolean(searchQuery.trim());

  return (
    <div className="admin-job-detail">
      <button
        type="button"
        className="admin-job-detail__back"
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
          onClick={() => navigate(`/jobs/${job?.publicCode}`)}
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
          <div className="admin-job-detail__tabs">
            {SETTINGS_SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                className={`admin-job-detail__tab${settingsSection === section.id ? " is-active" : ""}`}
                onClick={() => setSettingsSection(section.id)}
              >
                {section.label}
              </button>
            ))}
          </div>

          <form
            className="admin-job-detail__form"
            onSubmit={handleSaveSettings}
          >
            {settingsSection === "overview" && (
              <>
                {(!organizations.length ||
                  !locations.length ||
                  !jobTypes.length) && (
                  <p className="admin-job-detail__hint">
                    Missing lookup options?
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost admin-btn--sm"
                      onClick={goToLookups}
                    >
                      Manage lookup data
                    </button>
                  </p>
                )}
                <div className="admin-job-detail__form-grid">
                  <div className="admin-job-detail__field admin-job-detail__field--full">
                    <label htmlFor="edit-title">Title</label>
                    <input
                      id="edit-title"
                      maxLength={200}
                      value={editForm.title}
                      onChange={(e) => updateField("title", e.target.value)}
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="admin-job-detail__field admin-job-detail__field--full">
                    <label htmlFor="edit-desc">Short description</label>
                    <textarea
                      id="edit-desc"
                      rows={3}
                      maxLength={500}
                      value={editForm.description}
                      onChange={(e) =>
                        updateField("description", e.target.value)
                      }
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="admin-job-detail__field">
                    <label htmlFor="edit-org">Organization</label>
                    <select
                      id="edit-org"
                      value={editForm.organizationId}
                      onChange={(e) =>
                        updateField("organizationId", e.target.value)
                      }
                      disabled={readOnly}
                    >
                      <option value="">— Select —</option>
                      {organizations.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-job-detail__field">
                    <label htmlFor="edit-primary-loc">Primary location</label>
                    <select
                      id="edit-primary-loc"
                      value={editForm.primaryLocationId}
                      onChange={(e) =>
                        updateField("primaryLocationId", e.target.value)
                      }
                      disabled={readOnly}
                    >
                      <option value="">— Select —</option>
                      {locations.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-job-detail__field">
                    <label htmlFor="edit-team">Functional team</label>
                    <input
                      id="edit-team"
                      value={editForm.functionalTeam}
                      onChange={(e) =>
                        updateField("functionalTeam", e.target.value)
                      }
                      readOnly={readOnly}
                      placeholder="Engineering"
                    />
                  </div>
                  <div className="admin-job-detail__field">
                    <label htmlFor="edit-employment">Employment type</label>
                    <select
                      id="edit-employment"
                      value={editForm.employmentType}
                      onChange={(e) =>
                        updateField("employmentType", e.target.value)
                      }
                      disabled={readOnly}
                    >
                      <option value="">— Select —</option>
                      {EMPLOYMENT_TYPES.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-job-detail__field">
                    <label htmlFor="edit-work-mode">Work mode</label>
                    <select
                      id="edit-work-mode"
                      value={editForm.workMode}
                      onChange={(e) => updateField("workMode", e.target.value)}
                      disabled={readOnly}
                    >
                      <option value="">— Select —</option>
                      {WORK_MODES.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-job-detail__field">
                    <label htmlFor="edit-posted">Posted date</label>
                    <input
                      id="edit-posted"
                      type="date"
                      value={editForm.postedDate}
                      onChange={(e) =>
                        updateField("postedDate", e.target.value)
                      }
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="admin-job-detail__field">
                    <label htmlFor="edit-closing">Closing date</label>
                    <input
                      id="edit-closing"
                      type="date"
                      value={editForm.closingDate}
                      onChange={(e) =>
                        updateField("closingDate", e.target.value)
                      }
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="admin-job-detail__field admin-job-detail__field--full">
                    <label>Filter locations</label>
                    <div className="admin-job-detail__pill-group">
                      <LookupPills
                        items={locations}
                        selectedIds={editForm.locationIds}
                        disabled={readOnly}
                        onToggle={(id) =>
                          updateField(
                            "locationIds",
                            toggleId(editForm.locationIds, id),
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="admin-job-detail__field admin-job-detail__field--full">
                    <label>Job types</label>
                    <div className="admin-job-detail__pill-group">
                      <LookupPills
                        items={jobTypes}
                        selectedIds={editForm.jobTypeIds}
                        disabled={readOnly}
                        onToggle={(id) =>
                          updateField(
                            "jobTypeIds",
                            toggleId(editForm.jobTypeIds, id),
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {settingsSection === "content" && (
              <>
                <div className="admin-job-detail__field">
                  <label htmlFor="edit-about">About this role</label>
                  <textarea
                    id="edit-about"
                    rows={5}
                    value={editForm.aboutThisRole}
                    onChange={(e) =>
                      updateField("aboutThisRole", e.target.value)
                    }
                    readOnly={readOnly}
                  />
                </div>
                <div className="admin-job-detail__field">
                  <label htmlFor="edit-company-desc">Company description</label>
                  <textarea
                    id="edit-company-desc"
                    rows={4}
                    value={editForm.companyDescription}
                    onChange={(e) =>
                      updateField("companyDescription", e.target.value)
                    }
                    readOnly={readOnly}
                  />
                </div>
                <div className="admin-job-detail__field">
                  <label htmlFor="edit-resp">Responsibilities</label>
                  <textarea
                    id="edit-resp"
                    rows={4}
                    value={editForm.responsibilities}
                    onChange={(e) =>
                      updateField("responsibilities", e.target.value)
                    }
                    readOnly={readOnly}
                  />
                </div>
                <div className="admin-job-detail__field">
                  <label htmlFor="edit-qual">Qualifications</label>
                  <textarea
                    id="edit-qual"
                    rows={4}
                    value={editForm.qualifications}
                    onChange={(e) =>
                      updateField("qualifications", e.target.value)
                    }
                    readOnly={readOnly}
                  />
                </div>
                <div className="admin-job-detail__field">
                  <label htmlFor="edit-benefits">Benefits</label>
                  <textarea
                    id="edit-benefits"
                    rows={4}
                    value={editForm.benefits}
                    onChange={(e) => updateField("benefits", e.target.value)}
                    readOnly={readOnly}
                  />
                </div>
              </>
            )}

            {settingsSection === "publishing" && (
              <>
                <div className="admin-job-detail__field">
                  <label htmlFor="edit-website">Company website</label>
                  <input
                    id="edit-website"
                    value={editForm.companyWebsite}
                    onChange={(e) =>
                      updateField("companyWebsite", e.target.value)
                    }
                    readOnly={readOnly}
                  />
                </div>
                <div className="admin-job-detail__field">
                  <label htmlFor="edit-linkedin">Company LinkedIn</label>
                  <input
                    id="edit-linkedin"
                    value={editForm.companyLinkedIn}
                    onChange={(e) =>
                      updateField("companyLinkedIn", e.target.value)
                    }
                    readOnly={readOnly}
                  />
                </div>
                <div className="admin-job-detail__field">
                  <label htmlFor="edit-keywords">
                    Search keywords (comma-separated)
                  </label>
                  <input
                    id="edit-keywords"
                    value={editForm.searchKeywords}
                    onChange={(e) =>
                      updateField("searchKeywords", e.target.value)
                    }
                    readOnly={readOnly}
                    placeholder=".NET, C#, Intern"
                  />
                </div>
                <div className="admin-job-detail__field">
                  <label htmlFor="edit-bonuses">
                    Special bonuses (comma-separated)
                  </label>
                  <input
                    id="edit-bonuses"
                    value={editForm.specialBonuses}
                    onChange={(e) =>
                      updateField("specialBonuses", e.target.value)
                    }
                    readOnly={readOnly}
                  />
                </div>
                <div className="admin-job-detail__field">
                  <label
                    className="admin-job-detail__field__check"
                    htmlFor="edit-referral"
                  >
                    <input
                      id="edit-referral"
                      type="checkbox"
                      checked={editForm.isReferralEnabled}
                      onChange={(e) =>
                        updateField("isReferralEnabled", e.target.checked)
                      }
                      disabled={readOnly}
                    />
                    Enable refer a friend
                  </label>
                </div>
                <div className="admin-job-detail__field">
                  <label
                    className="admin-job-detail__field__check"
                    htmlFor="edit-active"
                  >
                    <input
                      id="edit-active"
                      type="checkbox"
                      checked={editForm.isActive}
                      onChange={(e) =>
                        updateField("isActive", e.target.checked)
                      }
                      disabled={readOnly}
                    />
                    Accept new applications
                  </label>
                </div>
              </>
            )}

            <div className="admin-job-detail__footer">
              <div className="admin-job-detail__link">
                <span>Apply link:</span>
                <code>{getPublicApplyUrl(job?.publicCode)}</code>
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost admin-btn--sm"
                  onClick={copyApplyLink}
                >
                  Copy
                </button>
              </div>
              {canUpdateJob && (
                <button
                  type="submit"
                  className="admin-btn admin-btn--primary"
                  disabled={saving}
                >
                  {saving ? (
                    <LoadingSpinner
                      size="sm"
                      inline
                      variant="light"
                      label="Saving"
                    />
                  ) : (
                    "Save changes"
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {tab === "submissions" && (
        <div className="admin-job-detail__panel">
          <form className="admin-job-detail__toolbar" onSubmit={handleSearch}>
            <div>
              <label htmlFor="search-q">Search query</label>
              <input
                id="search-q"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Describe your ideal candidate..."
              />
            </div>

            <div>
              <label htmlFor="search-role">Role</label>
              <input
                id="search-role"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                placeholder="e.g. Backend Developer"
              />
            </div>

            <button
              type="submit"
              className="admin-btn admin-btn--primary"
              disabled={searching}
            >
              {searching ? (
                <LoadingSpinner
                  size="sm"
                  inline
                  variant="light"
                  label="Searching"
                />
              ) : (
                "Search candidates"
              )}
            </button>
          </form>
          {hasQuery ? (
            <>
              {searchResult?.aiSelection?.reasoning && (
                <div className="admin-job-detail__ai">
                  <strong>AI shortlist</strong>
                  <p>{searchResult.aiSelection.reasoning}</p>
                </div>
              )}

              <div className="admin-job-detail__matches">
                {topMatches.map((cv) => (
                  <div
                    key={cv.id || cv.code}
                    className="admin-job-detail__match"
                  >
                    <h4>{cv.candidateName || cv.name || "Candidate"}</h4>

                    {cv.score != null && (
                      <span className="admin-job-detail__score">
                        Score: {cv.score.toFixed(3)}
                      </span>
                    )}

                    <p>
                      {cv.submitterEmail || cv.email || "—"} ·{" "}
                      {formatRoleName(
                        cv.confirmedPredictedRole || cv.predictedRole,
                      )}
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
            </>
          ) : loadingSubs ? (
            <LoadingSpinner label="Loading submissions" />
          ) : (
            <>
              <FlexibleDataTable
                className="admin-submissions-table"
                columns={SUBMISSION_COLUMNS}
                data={submissions}
                onRowClick={(row) => navigate(`/admin/jobs/${id}/cv/${row.id}`)}
                emptyMessage="No applications yet."
                actionsColumnWidth="220px"
                renderActions={(row) => (
                  <div className="admin-job-detail__row-actions">
                    {row.code && (
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost admin-btn--sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(row.code);
                        }}
                      >
                        CV
                      </button>
                    )}
                    {!row.confirmedPredictedRole && (
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost admin-btn--sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openRoleDialog(row);
                        }}
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

      {/* {tab === "search" && (
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
            <button
              type="submit"
              className="admin-btn admin-btn--primary"
              disabled={searching}
            >
              {searching ? (
                <LoadingSpinner
                  size="sm"
                  inline
                  variant="light"
                  label="Searching"
                />
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
                  <span className="admin-job-detail__score">
                    Score: {cv.score.toFixed(3)}
                  </span>
                )}
                <p>
                  {cv.submitterEmail || cv.email || "—"} ·{" "}
                  {formatRoleName(
                    cv.confirmedPredictedRole || cv.predictedRole,
                  )}
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
      )} */}
    </div>
  );
}
