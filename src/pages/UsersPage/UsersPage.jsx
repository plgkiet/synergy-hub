import { useCallback, useEffect, useState } from "react";
import { useSnackbar } from "notistack";

import "@/styles/admin-ui.css";
import "./UsersPage.css";
import FlexibleDataTable from "@/components/DataTable/FlexibleDataTable";
import Pagination from "@/components/Pagination/Pagination";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ModalPortal from "@/components/ui/ModalPortal";
import { getAllRoles } from "@/api/roles";
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from "@/api/users";
import { usePermissions } from "@/auth/usePermissions";
import { canDo } from "@/utils/permissions";

const USER_STATUSES = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
  { value: "Suspended", label: "Suspended" },
  { value: "PendingActivation", label: "Pending activation" },
];

const USER_STATUS_VALUES = new Set(USER_STATUSES.map((s) => s.value));

function statusLabel(value) {
  return USER_STATUSES.find((s) => s.value === value)?.label ?? value;
}

function statusBadgeClass(status) {
  if (!status || status === "—") return "users-badge--off";
  switch (status) {
    case "Active":
      return "users-badge--on";
    case "Suspended":
      return "users-badge--danger";
    case "PendingActivation":
      return "users-badge--pending";
    case "Inactive":
    default:
      return "users-badge--off";
  }
}

const USER_COLUMNS = [
  { key: "username", label: "Username", width: "minmax(120px, 1fr)" },
  { key: "displayName", label: "Display name", width: "minmax(140px, 1.2fr)" },
  { key: "email", label: "Email", width: "minmax(180px, 1.5fr)" },
  { key: "phone", label: "Phone", width: "120px" },
  { key: "roleName", label: "Role", width: "110px" },
  {
    key: "status",
    label: "Status",
    width: "100px",
    align: "center",
    render: (row) => (
      <span className={`users-badge ${statusBadgeClass(row.status)}`}>
        {statusLabel(row.status)}
      </span>
    ),
  },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EMPTY_FORM = {
  username: "",
  email: "",
  password: "",
  roleId: "",
  displayName: "",
  status: "",
};

const EMPTY_FILTERS = {
  username: "",
  displayName: "",
  email: "",
  phone: "",
  roleId: "",
  status: "",
};

function toApiFilter(filters) {
  return {
    username: filters.username,
    displayName: filters.displayName,
    email: filters.email,
    phone: filters.phone,
    status: filters.status,
    roleIds: filters.roleId ? [filters.roleId] : [],
  };
}

function hasFilterValues(filters) {
  return (
    filters.username.trim() ||
    filters.displayName.trim() ||
    filters.email.trim() ||
    filters.phone.trim() ||
    filters.roleId ||
    filters.status
  );
}

function normalizeUser(user) {
  const status =
    user.status ??
    (user.isActive === true || user.isActive === "true"
      ? "Active"
      : user.isActive === false || user.isActive === "false"
        ? "Inactive"
        : null) ??
    "—";

  return {
    id: user.id ?? user.userId ?? crypto.randomUUID?.() ?? String(Date.now()),
    username: user.username ?? user.userName ?? "",
    displayName: user.displayName ?? user.display_name ?? "—",
    email: user.email ?? "",
    phone: user.phone ?? user.phoneNumber ?? "—",
    roleName: user.role?.name ?? user.roleName ?? "—",
    status,
    roleId: user.role?.id ?? user.roleId ?? "",
  };
}

function resolveRoleId(row, roleList) {
  if (row.roleId && roleList.some((role) => String(role.id) === String(row.roleId))) {
    return String(row.roleId);
  }
  const byName = roleList.find((role) => role.name === row.roleName);
  return byName ? String(byName.id) : row.roleId ? String(row.roleId) : "";
}

function validateCreateForm(form) {
  const username = form.username.trim();
  if (username.length < 3 || username.length > 50) {
    return "Username must be between 3 and 50 characters";
  }

  const email = form.email.trim();
  if (!email) return "Email is required";
  if (!EMAIL_RE.test(email) || email.length > 100) {
    return "Enter a valid email (max 100 characters)";
  }

  if (!form.password || form.password.length < 6 || form.password.length > 100) {
    return "Password must be between 6 and 100 characters";
  }

  if (!form.roleId) return "Role is required";

  return null;
}

function validateUpdateForm(form) {
  const email = form.email.trim();
  if (email && (!EMAIL_RE.test(email) || email.length > 100)) {
    return "Enter a valid email (max 100 characters)";
  }

  if (form.status && !USER_STATUS_VALUES.has(form.status)) {
    return "Please select a valid status";
  }

  return null;
}

function buildCreatePayload(form) {
  const payload = {
    username: form.username.trim(),
    email: form.email.trim(),
    password: form.password,
    roleId: form.roleId,
  };

  if (form.displayName.trim()) payload.displayName = form.displayName.trim();

  return payload;
}

function buildUpdatePayload(form) {
  const payload = {};

  if (form.email.trim()) payload.email = form.email.trim();
  if (form.roleId) payload.roleId = form.roleId;
  if (form.displayName.trim()) payload.displayName = form.displayName.trim();
  if (form.status) payload.status = form.status;

  return payload;
}

export default function UsersPage() {
  const { enqueueSnackbar } = useSnackbar();
  const { permissions } = usePermissions();
  const canCreateUser = canDo(permissions, "User", "Create");
  const canUpdateUser = canDo(permissions, "User", "Update");
  const canDeleteUser = canDo(permissions, "User", "Delete");
  const showUserActions = canUpdateUser || canDeleteUser;

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [roles, setRoles] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);

  useEffect(() => {
    let cancelled = false;
    setOptionsLoading(true);
    getAllRoles()
      .then((roleList) => {
        if (cancelled) return;
        setRoles(Array.isArray(roleList) ? roleList : []);
      })
      .catch((err) => {
        if (!cancelled) {
          setRoles([]);
          enqueueSnackbar(err?.message || "Failed to load roles", { variant: "error" });
        }
      })
      .finally(() => {
        if (!cancelled) setOptionsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enqueueSnackbar]);

  const loadUsers = useCallback(
    async (pageIndex = page, size = pageSize, filter = appliedFilters) => {
      try {
        setLoading(true);
        const result = await getUsers({
          pageIndex,
          pageSize: size,
          filter: toApiFilter(filter),
        });
        setRows(result.items.map(normalizeUser));
        setTotalCount(result.totalCount);
        setTotalPages(result.totalPages);
      } catch (err) {
        enqueueSnackbar(err?.message || "Failed to load users", { variant: "error" });
        setRows([]);
        setTotalCount(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [enqueueSnackbar, appliedFilters]
  );

  useEffect(() => {
    loadUsers(page, pageSize, appliedFilters);
  }, [page, pageSize, appliedFilters, loadUsers]);

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
  };

  const handlePageSizeChange = (nextSize) => {
    setPageSize(nextSize);
    setPage(1);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedFilters((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(filters)) return prev;
        setPage(1);
        return filters;
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [filters]);

  const onFilterChange = (field) => (e) => {
    setFilters((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const onFilterSelectChange = (field) => (e) => {
    const value = e.target.value;
    setFilters((prev) => {
      const next = { ...prev, [field]: value };
      setAppliedFilters(next);
      setPage(1);
      return next;
    });
  };

  const handleClearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({
      username: row.username,
      email: row.email === "—" ? "" : row.email,
      password: "",
      roleId: resolveRoleId(row, roles),
      displayName: row.displayName === "—" ? "" : row.displayName,
      status: row.status === "—" ? "" : row.status,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const onFormChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = editingId
      ? validateUpdateForm(form)
      : validateCreateForm(form);
    if (validationError) {
      enqueueSnackbar(validationError, { variant: "warning" });
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        const payload = buildUpdatePayload(form);
        await updateUser(editingId, payload);
        enqueueSnackbar("User updated", { variant: "success" });
      } else {
        await createUser(buildCreatePayload(form));
        enqueueSnackbar("User created", { variant: "success" });
      }
      closeModal();
      await loadUsers(page, pageSize, appliedFilters);
    } catch (err) {
      enqueueSnackbar(err?.message || "Save failed", { variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (row) => {
    setDeleteTarget(row);
  };

  const handleDeleteCancel = () => {
    if (deleting) return;
    setDeleteTarget(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteUser(deleteTarget.id);
      enqueueSnackbar("User deleted", { variant: "success" });
      const nextPage = rows.length <= 1 && page > 1 ? page - 1 : page;
      setDeleteTarget(null);
      if (nextPage !== page) {
        setPage(nextPage);
      } else {
        await loadUsers(page, pageSize, appliedFilters);
      }
    } catch (err) {
      enqueueSnackbar(err?.message || "Delete failed", { variant: "error" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="users-page">

      <div className={`users-panel${loading ? " users-panel--loading" : ""}`}>
        <div className="users-toolbar">
          <div className="users-filters-inline">
            <input
              type="text"
              value={filters.username}
              onChange={onFilterChange("username")}
              placeholder="Username"
              aria-label="Username"
            />
            <input
              type="text"
              value={filters.displayName}
              onChange={onFilterChange("displayName")}
              placeholder="Display name"
              aria-label="Display name"
            />
            <input
              type="text"
              value={filters.email}
              onChange={onFilterChange("email")}
              placeholder="Email"
              aria-label="Email"
            />
            <input
              type="text"
              value={filters.phone}
              onChange={onFilterChange("phone")}
              placeholder="Phone"
              aria-label="Phone"
            />
            <select
              value={filters.roleId}
              onChange={onFilterSelectChange("roleId")}
              disabled={optionsLoading}
              aria-label="Role"
            >
              <option value="">Role</option>
              {roles.map((role) => (
                <option key={role.id} value={String(role.id)}>
                  {role.name}
                </option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={onFilterSelectChange("status")}
              aria-label="Status"
            >
              <option value="">Status</option>
              {USER_STATUSES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="users-clear-filter"
              onClick={handleClearFilters}
              disabled={!hasFilterValues(filters)}
              title="Clear filter"
              aria-label="Clear filter"
            >
              <i className="fa-solid fa-xmark" aria-hidden />
            </button>
          </div>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={openCreate}
            disabled={!canCreateUser}
            hidden={!canCreateUser}
          >
            + New user
          </button>
        </div>

        {loading && (
          <div className="loading-overlay">
            <LoadingSpinner size="lg" />
          </div>
        )}
        <FlexibleDataTable
          className="users-table"
          columns={USER_COLUMNS}
          data={rows}
          rowKey="id"
          emptyMessage={loading ? "" : "No users found."}
          actionsColumnWidth={showUserActions ? "minmax(150px, auto)" : undefined}
          renderActions={
            showUserActions
              ? (row) => (
                  <>
                    {canUpdateUser && (
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost admin-btn--sm"
                        onClick={() => openEdit(row)}
                        disabled={loading}
                      >
                        Edit
                      </button>
                    )}
                    {canDeleteUser && (
                      <button
                        type="button"
                        className="admin-btn admin-btn--danger admin-btn--sm"
                        onClick={() => handleDeleteClick(row)}
                        disabled={loading}
                      >
                        Delete
                      </button>
                    )}
                  </>
                )
              : undefined
          }
        />
        <Pagination
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      {modalOpen && (
        <ModalPortal>
          <div className="users-modal-backdrop" onClick={closeModal}>
            <div className="users-modal" onClick={(e) => e.stopPropagation()}>
              <h3>{editingId ? "Edit user" : "New user"}</h3>
              <form className="users-form" onSubmit={handleSubmit}>
                <label>
                  <span>Username{editingId ? "" : " *"}</span>
                  <input
                    value={form.username}
                    onChange={onFormChange("username")}
                    placeholder="3–50 characters"
                    minLength={editingId ? undefined : 3}
                    maxLength={50}
                    required={!editingId}
                    readOnly={Boolean(editingId)}
                    disabled={Boolean(editingId)}
                  />
                </label>
                <label>
                  <span>Display name</span>
                  <input
                    value={form.displayName}
                    onChange={onFormChange("displayName")}
                    placeholder="Display name"
                  />
                </label>
                <label>
                  <span>Email{editingId ? "" : " *"}</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={onFormChange("email")}
                    placeholder="email@example.com"
                    maxLength={100}
                    required={!editingId}
                  />
                </label>
                {!editingId && (
                  <label>
                    <span>Password *</span>
                    <input
                      type="password"
                      value={form.password}
                      onChange={onFormChange("password")}
                      placeholder="6–100 characters"
                      minLength={6}
                      maxLength={100}
                      required
                    />
                  </label>
                )}
                <label>
                  <span>Role{editingId ? "" : " *"}</span>
                  <select
                    value={form.roleId}
                    onChange={onFormChange("roleId")}
                    required={!editingId}
                    disabled={optionsLoading}
                  >
                    <option value="">
                      {optionsLoading
                        ? "Loading roles..."
                        : editingId
                          ? "— Keep current —"
                          : "Select a role"}
                    </option>
                    {roles.map((role) => (
                      <option key={role.id} value={String(role.id)}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  {!optionsLoading && roles.length === 0 && (
                    <span className="users-form-hint">No roles available from the API.</span>
                  )}
                </label>
                {editingId && (
                  <label>
                    <span>Status</span>
                    <select value={form.status} onChange={onFormChange("status")}>
                      <option value="">No change</option>
                      {USER_STATUSES.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <div className="users-form-actions">
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
                    {saving ? (
                      <LoadingSpinner size="sm" inline variant="light" label="Saving" />
                    ) : editingId ? (
                      "Update"
                    ) : (
                      "Create"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete user"
        message={`Are you sure you want to delete "${deleteTarget?.username}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        tone="danger"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
