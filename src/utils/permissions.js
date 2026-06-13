/** @typedef {{ function: string; actions: string[] }} FunctionPermission */

/**
 * @param {FunctionPermission[] | null | undefined} permissions
 * @param {string} module
 * @param {string} action
 */
export function canDo(permissions, module, action) {
  if (!Array.isArray(permissions)) return false;

  const all = permissions.find((p) => p.function === "*");
  if (all?.actions?.includes("*")) return true;

  const mod = permissions.find((p) => p.function === module);
  if (!mod) return false;

  return mod.actions.includes("*") || mod.actions.includes(action);
}

/**
 * @param {FunctionPermission[] | null | undefined} permissions
 * @param {string} module
 */
export function hasModule(permissions, module) {
  if (!Array.isArray(permissions)) return false;

  const all = permissions.find((p) => p.function === "*");
  if (all?.actions?.includes("*")) return true;

  const mod = permissions.find((p) => p.function === module);
  return Boolean(mod?.actions?.length);
}

/** @param {FunctionPermission[] | null | undefined} permissions */
export function canAccessAdmin(permissions) {
  return canDo(permissions, "*", "*") || hasModule(permissions, "AdminPage");
}

/** @param {FunctionPermission[] | null | undefined} permissions */
export function canAccessDashboardAdmin(permissions) {
  return (
    canDo(permissions, "*", "*") || canDo(permissions, "Dashboard", "Read")
  );
}

/** @param {FunctionPermission[] | null | undefined} permissions */
export function canAccessUsersAdmin(permissions) {
  return canDo(permissions, "*", "*") || canDo(permissions, "User", "Read");
}

/** @param {FunctionPermission[] | null | undefined} permissions */
export function canAccessJobsAdmin(permissions) {
  return canDo(permissions, "*", "*") || canDo(permissions, "Job", "Read");
}

/** @param {FunctionPermission[] | null | undefined} permissions */
export function canUploadCv(permissions) {
  return (
    canDo(permissions, "*", "*") || canDo(permissions, "CVDocument", "Upload")
  );
}

/** @param {FunctionPermission[] | null | undefined} permissions */
export function getAdminDefaultPath(permissions) {
  if (hasModule(permissions, "User") && canAccessUsersAdmin(permissions)) {
    return "/admin/users";
  }
  if (hasModule(permissions, "Job") && canAccessJobsAdmin(permissions)) {
    return "/admin/jobs";
  }
  return "/dashboard";
}
