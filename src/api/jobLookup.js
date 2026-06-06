import { cvApiFetch } from "./cvHttp";

export async function getLocations() {
  return cvApiFetch("/job-lookup/locations", { auth: false });
}

export async function getLocationById(id) {
  return cvApiFetch(`/job-lookup/locations/${id}`, { auth: false });
}

export async function createLocation(body) {
  return cvApiFetch("/job-lookup/locations", { method: "POST", body });
}

export async function updateLocation(id, body) {
  return cvApiFetch(`/job-lookup/locations/${id}`, { method: "PUT", body });
}

export async function getOrganizations() {
  return cvApiFetch("/job-lookup/organizations", { auth: false });
}

export async function getOrganizationById(id) {
  return cvApiFetch(`/job-lookup/organizations/${id}`, { auth: false });
}

export async function createOrganization(body) {
  return cvApiFetch("/job-lookup/organizations", { method: "POST", body });
}

export async function updateOrganization(id, body) {
  return cvApiFetch(`/job-lookup/organizations/${id}`, { method: "PUT", body });
}

export async function getJobTypes() {
  return cvApiFetch("/job-lookup/job-types", { auth: false });
}

export async function getJobTypeById(id) {
  return cvApiFetch(`/job-lookup/job-types/${id}`, { auth: false });
}

export async function createJobType(body) {
  return cvApiFetch("/job-lookup/job-types", { method: "POST", body });
}

export async function updateJobType(id, body) {
  return cvApiFetch(`/job-lookup/job-types/${id}`, { method: "PUT", body });
}
