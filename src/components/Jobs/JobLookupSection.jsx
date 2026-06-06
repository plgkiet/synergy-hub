import { useCallback, useEffect, useState } from "react";
import { useSnackbar } from "notistack";

import FlexibleDataTable from "@/components/DataTable/FlexibleDataTable";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ModalPortal from "@/components/ui/ModalPortal";
import {
  createJobType,
  createLocation,
  createOrganization,
  getJobTypes,
  getLocations,
  getOrganizations,
  updateJobType,
  updateLocation,
  updateOrganization,
} from "@/api/jobLookup";

const LOOKUP_TABS = [
  { id: "locations", label: "Locations", singular: "location" },
  { id: "organizations", label: "Organizations", singular: "organization" },
  { id: "job-types", label: "Job types", singular: "job type" },
];

function lookupTabMeta(tabId) {
  return LOOKUP_TABS.find((tab) => tab.id === tabId) || LOOKUP_TABS[0];
}

const LOCATION_COLUMNS = [
  { key: "name", label: "Name", width: "minmax(180px, 2fr)" },
  {
    key: "isActive",
    label: "Status",
    width: "100px",
    align: "center",
    render: (row) => (
      <span
        className={`admin-jobs-badge ${row.isActive !== false ? "admin-jobs-badge--on" : "admin-jobs-badge--off"}`}
      >
        {row.isActive !== false ? "Active" : "Inactive"}
      </span>
    ),
  },
];

const ORG_COLUMNS = [
  { key: "name", label: "Name", width: "minmax(160px, 1.2fr)" },
  { key: "website", label: "Website", width: "minmax(160px, 1.5fr)" },
  { key: "linkedIn", label: "LinkedIn", width: "minmax(160px, 1.5fr)" },
  {
    key: "isActive",
    label: "Status",
    width: "100px",
    align: "center",
    render: (row) => (
      <span
        className={`admin-jobs-badge ${row.isActive !== false ? "admin-jobs-badge--on" : "admin-jobs-badge--off"}`}
      >
        {row.isActive !== false ? "Active" : "Inactive"}
      </span>
    ),
  },
];

const JOB_TYPE_COLUMNS = [
  { key: "name", label: "Name", width: "minmax(180px, 2fr)" },
  {
    key: "isActive",
    label: "Status",
    width: "100px",
    align: "center",
    render: (row) => (
      <span
        className={`admin-jobs-badge ${row.isActive !== false ? "admin-jobs-badge--on" : "admin-jobs-badge--off"}`}
      >
        {row.isActive !== false ? "Active" : "Inactive"}
      </span>
    ),
  },
];

const EMPTY_FORMS = {
  locations: { name: "" },
  organizations: { name: "", website: "", linkedIn: "" },
  "job-types": { name: "" },
};

export default function JobLookupSection() {
  const { enqueueSnackbar } = useSnackbar();
  const [lookupTab, setLookupTab] = useState("locations");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORMS.locations);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      let res;
      if (lookupTab === "locations") res = await getLocations();
      else if (lookupTab === "organizations") res = await getOrganizations();
      else res = await getJobTypes();
      setItems(Array.isArray(res) ? res : []);
    } catch (err) {
      enqueueSnackbar(err?.message || "Failed to load lookup data", { variant: "error" });
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [lookupTab, enqueueSnackbar]);

  useEffect(() => {
    setAddForm(EMPTY_FORMS[lookupTab]);
    setEditItem(null);
    setEditForm(null);
    loadItems();
  }, [lookupTab, loadItems]);

  const columns =
    lookupTab === "organizations"
      ? ORG_COLUMNS
      : lookupTab === "job-types"
        ? JOB_TYPE_COLUMNS
        : LOCATION_COLUMNS;

  const handleAdd = async (e) => {
    e.preventDefault();
    const name = addForm.name?.trim();
    if (!name) {
      enqueueSnackbar("Name is required.", { variant: "warning" });
      return;
    }

    try {
      setSaving(true);
      if (lookupTab === "locations") {
        await createLocation({ name });
      } else if (lookupTab === "organizations") {
        await createOrganization({
          name,
          website: addForm.website?.trim() || undefined,
          linkedIn: addForm.linkedIn?.trim() || undefined,
        });
      } else {
        await createJobType({ name });
      }
      enqueueSnackbar("Created.", { variant: "success" });
      setAddForm(EMPTY_FORMS[lookupTab]);
      await loadItems();
    } catch (err) {
      enqueueSnackbar(err?.message || "Create failed", { variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (row) => {
    setEditItem(row);
    if (lookupTab === "organizations") {
      setEditForm({
        name: row.name || "",
        website: row.website || "",
        linkedIn: row.linkedIn || "",
        isActive: row.isActive !== false,
      });
    } else {
      setEditForm({
        name: row.name || "",
        isActive: row.isActive !== false,
      });
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editItem?.id || !editForm?.name?.trim()) {
      enqueueSnackbar("Name is required.", { variant: "warning" });
      return;
    }

    try {
      setSaving(true);
      if (lookupTab === "locations") {
        await updateLocation(editItem.id, {
          name: editForm.name.trim(),
          isActive: editForm.isActive,
        });
      } else if (lookupTab === "organizations") {
        await updateOrganization(editItem.id, {
          name: editForm.name.trim(),
          website: editForm.website?.trim() || undefined,
          linkedIn: editForm.linkedIn?.trim() || undefined,
          isActive: editForm.isActive,
        });
      } else {
        await updateJobType(editItem.id, {
          name: editForm.name.trim(),
          isActive: editForm.isActive,
        });
      }
      enqueueSnackbar("Updated.", { variant: "success" });
      setEditItem(null);
      setEditForm(null);
      await loadItems();
    } catch (err) {
      enqueueSnackbar(err?.message || "Update failed", { variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const updateAddField = (key, value) => {
    setAddForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateEditField = (key, value) => {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="admin-jobs-lookup">
      <div className="admin-jobs-tabs admin-jobs-tabs--sub">
        {LOOKUP_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`admin-jobs-tab${lookupTab === tab.id ? " is-active" : ""}`}
            onClick={() => setLookupTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form className="admin-jobs-lookup__add" onSubmit={handleAdd}>
        <div className="admin-jobs-field">
          <label htmlFor="lookup-add-name">Add {lookupTabMeta(lookupTab).singular}</label>
          <input
            id="lookup-add-name"
            value={addForm.name}
            onChange={(e) => updateAddField("name", e.target.value)}
            placeholder="Name"
            required
          />
        </div>
        {lookupTab === "organizations" && (
          <div className="admin-jobs-modal__row">
            <div className="admin-jobs-field">
              <label htmlFor="lookup-add-website">Website</label>
              <input
                id="lookup-add-website"
                value={addForm.website}
                onChange={(e) => updateAddField("website", e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="admin-jobs-field">
              <label htmlFor="lookup-add-linkedin">LinkedIn</label>
              <input
                id="lookup-add-linkedin"
                value={addForm.linkedIn}
                onChange={(e) => updateAddField("linkedIn", e.target.value)}
                placeholder="https://linkedin.com/company/..."
              />
            </div>
          </div>
        )}
        <button type="submit" className="admin-btn admin-btn--primary admin-btn--sm" disabled={saving}>
          {saving ? <LoadingSpinner size="sm" inline variant="light" label="Saving" /> : "Add"}
        </button>
      </form>

      <div className="admin-jobs-body">
        {loading ? (
          <LoadingSpinner label="Loading lookup data" />
        ) : (
          <FlexibleDataTable
            className="admin-jobs-table"
            columns={columns}
            data={items}
            emptyMessage={`No ${lookupTabMeta(lookupTab).label.toLowerCase()} yet.`}
            renderActions={(row) => (
              <button
                type="button"
                className="admin-btn admin-btn--ghost admin-btn--sm"
                onClick={() => openEdit(row)}
              >
                Edit
              </button>
            )}
          />
        )}
      </div>

      {editItem && editForm && (
        <ModalPortal>
          <div
            className="admin-jobs-modal-backdrop"
            role="presentation"
            onClick={() => !saving && setEditItem(null)}
          >
            <form
              className="admin-jobs-modal"
              onSubmit={handleEdit}
              onClick={(e) => e.stopPropagation()}
            >
            <h2>Edit {lookupTabMeta(lookupTab).singular}</h2>
            <div className="admin-jobs-field">
              <label htmlFor="lookup-edit-name">Name</label>
              <input
                id="lookup-edit-name"
                value={editForm.name}
                onChange={(e) => updateEditField("name", e.target.value)}
                required
              />
            </div>
            {lookupTab === "organizations" && (
              <>
                <div className="admin-jobs-field">
                  <label htmlFor="lookup-edit-website">Website</label>
                  <input
                    id="lookup-edit-website"
                    value={editForm.website}
                    onChange={(e) => updateEditField("website", e.target.value)}
                  />
                </div>
                <div className="admin-jobs-field">
                  <label htmlFor="lookup-edit-linkedin">LinkedIn</label>
                  <input
                    id="lookup-edit-linkedin"
                    value={editForm.linkedIn}
                    onChange={(e) => updateEditField("linkedIn", e.target.value)}
                  />
                </div>
              </>
            )}
            <div className="admin-jobs-field">
              <label className="admin-jobs-field__check" htmlFor="lookup-edit-active">
                <input
                  id="lookup-edit-active"
                  type="checkbox"
                  checked={editForm.isActive}
                  onChange={(e) => updateEditField("isActive", e.target.checked)}
                />
                Active
              </label>
            </div>
            <div className="admin-jobs-modal-actions">
              <button
                type="button"
                className="admin-btn admin-btn--ghost"
                disabled={saving}
                onClick={() => setEditItem(null)}
              >
                Cancel
              </button>
              <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
                {saving ? (
                  <LoadingSpinner size="sm" inline variant="light" label="Saving" />
                ) : (
                  "Save"
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
