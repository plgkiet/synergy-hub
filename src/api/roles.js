import { http } from "./http";
import { extractPaginated } from "./pagination";

export function normalizeRole(role) {
  if (!role || typeof role !== "object") return null;
  const id = role.id ?? role.roleId;
  const name = role.name ?? role.roleName ?? role.title;
  if (id == null || name == null || name === "") return null;
  return { id, name: String(name) };
}

export function normalizeRoleList(list) {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeRole).filter(Boolean);
}

export async function getRoles({ pageIndex = 1, pageSize = 10 } = {}) {
  const res = await http(
    `/api/Roles?pageIndex=${pageIndex}&pageSize=${pageSize}`,
    { method: "GET" }
  );
  return extractPaginated(res, { pageIndex, pageSize });
}

/** Load all roles for dropdowns. */
export async function getAllRoles() {
  const res = await http("/api/Roles?pageIndex=1&pageSize=100", { method: "GET" });
  const { items } = extractPaginated(res, { pageIndex: 1, pageSize: 100 });
  const normalized = normalizeRoleList(items);
  if (normalized.length) return normalized;

  const envelope = res?.data ?? res;
  const fallback = Array.isArray(envelope)
    ? envelope
    : envelope?.roles ?? envelope?.items ?? [];
  return normalizeRoleList(fallback);
}
