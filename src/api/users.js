import { http } from "./http";
import { extractPaginated } from "./pagination";

/** @typedef {Object} UserFilter
 * @property {string} [username]
 * @property {string} [displayName]
 * @property {string} [email]
 * @property {string} [phone]
 * @property {number[]} [roleIds]
 * @property {number[]} [departments]
 * @property {string} [status]
 */

export function buildUserFilterPayload(filter = {}) {
  const payload = {};

  if (filter.username?.trim()) payload.username = filter.username.trim();
  if (filter.displayName?.trim()) payload.displayName = filter.displayName.trim();
  if (filter.email?.trim()) payload.email = filter.email.trim();
  if (filter.phone?.trim()) payload.phone = filter.phone.trim();
  if (filter.status?.trim()) payload.status = filter.status.trim();
  if (Array.isArray(filter.roleIds) && filter.roleIds.length > 0) {
    payload.roleIds = filter.roleIds.map(Number);
  }
  if (Array.isArray(filter.departments) && filter.departments.length > 0) {
    payload.departments = filter.departments.map(Number);
  }

  return payload;
}

function buildUsersQuery({ pageIndex = 1, pageSize = 10, filter = {} } = {}) {
  const search = new URLSearchParams();
  search.set("pageIndex", String(pageIndex));
  search.set("pageSize", String(pageSize));

  const payload = buildUserFilterPayload(filter);
  if (payload.username) search.set("username", payload.username);
  if (payload.displayName) search.set("displayName", payload.displayName);
  if (payload.email) search.set("email", payload.email);
  if (payload.phone) search.set("phone", payload.phone);
  if (payload.status) search.set("status", payload.status);
  payload.roleIds?.forEach((id) => search.append("roleIds", String(id)));
  payload.departments?.forEach((id) => search.append("departments", String(id)));

  return search.toString();
}

export async function getUsers({ pageIndex = 1, pageSize = 10, filter = {} } = {}) {
  const query = buildUsersQuery({ pageIndex, pageSize, filter });
  const res = await http(`/api/Users?${query}`, { method: "GET" });
  return extractPaginated(res, { pageIndex, pageSize });
}

export async function getUserById(id) {
  const res = await http(`/api/Users/${id}`, { method: "GET" });
  return res?.data ?? res;
}

export async function createUser(body) {
  const res = await http("/api/Users", { method: "POST", body });
  return res?.data ?? res;
}

export async function updateUser(id, body) {
  const res = await http(`/api/Users/${id}`, { method: "PUT", body });
  return res?.data ?? res;
}

export async function deleteUser(id) {
  return http(`/api/Users/${id}`, { method: "DELETE" });
}
