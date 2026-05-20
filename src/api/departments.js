import { http } from "./http";
import { extractPaginated } from "./pagination";

export async function getDepartments({ pageIndex = 1, pageSize = 10 } = {}) {
  const res = await http(
    `/api/Departments?pageIndex=${pageIndex}&pageSize=${pageSize}`,
    { method: "GET" }
  );
  return extractPaginated(res, { pageIndex, pageSize });
}

export async function getAllDepartments() {
  const { items } = await getDepartments({ pageIndex: 1, pageSize: 100 });
  return items;
}
