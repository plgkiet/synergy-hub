import { http } from "./http";
import { extractPaginated } from "./pagination";

export async function getRoles({ pageIndex = 1, pageSize = 10 } = {}) {
  const res = await http(
    `/api/Roles?pageIndex=${pageIndex}&pageSize=${pageSize}`,
    { method: "GET" }
  );
  return extractPaginated(res, { pageIndex, pageSize });
}

/** Load all roles for dropdowns (12 roles in seed data). */
export async function getAllRoles() {
  const { items } = await getRoles({ pageIndex: 1, pageSize: 100 });
  return items;
}
