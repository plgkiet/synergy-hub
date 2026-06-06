import { cvApiFetch } from "./cvHttp";
import { appendArrayParams, pageQuery } from "./queryParams";

export async function getPublicJobFilterOptions() {
  return cvApiFetch("/public/jobs/filter-options", { auth: false });
}

export async function listPublicJobs({
  pageNumber = 1,
  pageSize = 10,
  search,
  locationIds,
  jobTypeIds,
  organizationIds,
  specialBonuses,
  functionalTeam,
  employmentType,
  workMode,
} = {}) {
  const params = pageQuery({ pageNumber, pageSize });
  if (search?.trim()) params.set("search", search.trim());
  if (functionalTeam?.trim()) params.set("functionalTeam", functionalTeam.trim());
  if (employmentType?.trim()) params.set("employmentType", employmentType.trim());
  if (workMode?.trim()) params.set("workMode", workMode.trim());
  appendArrayParams(params, "locationIds", locationIds);
  appendArrayParams(params, "jobTypeIds", jobTypeIds);
  appendArrayParams(params, "organizationIds", organizationIds);
  appendArrayParams(params, "specialBonuses", specialBonuses);
  return cvApiFetch(`/public/jobs?${params}`, { auth: false });
}

export async function getPublicJobByCode(publicCode) {
  return cvApiFetch(`/public/jobs/${publicCode}`, { auth: false });
}
