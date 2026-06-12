import { cvApiFetch, cvApiForm, cvResultFetch } from "./cvHttp";
import { appendArrayParams, pageQuery } from "./queryParams";

export function getPublicApplyUrl(publicCode) {
  if (!publicCode) return "";
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/apply/${publicCode}`;
  }
  return `/apply/${publicCode}`;
}

export function getPublicJobUrl(publicCode) {
  if (!publicCode) return "";
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/jobs/${publicCode}`;
  }
  return `/jobs/${publicCode}`;
}

export function getApiSubmissionUrl(submissionUrl) {
  const base = import.meta.env.VITE_CV_API_BASE_URL?.replace(/\/$/, "") || "/cvapi";
  const path = submissionUrl?.startsWith("/") ? submissionUrl : `/${submissionUrl || ""}`;
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}${base}${path}`;
  }
  return `${base}${path}`;
}

export async function createCvPost(body) {
  return cvApiFetch("/CVPost/Create", {
    method: "POST",
    body,
  });
}

export async function listCvPosts({
  pageNumber = 1,
  pageSize = 10,
  search,
  locationIds,
  jobTypeIds,
  organizationIds,
} = {}) {
  const params = pageQuery({ pageNumber, pageSize });
  if (search?.trim()) params.set("search", search.trim());
  appendArrayParams(params, "locationIds", locationIds);
  appendArrayParams(params, "jobTypeIds", jobTypeIds);
  appendArrayParams(params, "organizationIds", organizationIds);
  return cvApiFetch(`/CVPost?${params}`);
}

/** @deprecated Use listCvPosts */
export async function listMyCvPosts(opts = {}) {
  return listCvPosts(opts);
}

export async function getCvPostById(id) {
  return cvApiFetch(`/CVPost/GetById/${id}`);
}

export async function updateCvPost(id, body) {
  return cvApiFetch(`/CVPost/Update/${id}`, {
    method: "PUT",
    body,
  });
}

export async function listPostSubmissions(
  postId,
  { pageNumber = 1, pageSize = 10, role } = {}
) {
  const params = new URLSearchParams({
    pageNumber: String(pageNumber),
    pageSize: String(pageSize),
  });
  if (role?.trim()) params.set("role", role.trim());
  return cvApiFetch(`/CVPost/${postId}/submissions?${params}`);
}

export async function searchPostSubmissions(
  postId,
  { searchQuery, limit = 15, selectionLimit = 5, role } = {}
) {
  const params = new URLSearchParams({
    searchQuery: searchQuery.trim(),
    limit: String(limit),
    selectionLimit: String(selectionLimit),
  });
  if (role?.trim()) params.set("role", role.trim());
  return cvApiFetch(`/CVPost/${postId}/submissions/search?${params}`);
}

export async function submitCvToPost(
  publicCode,
  { file, name, email, phoneNumber, method = "POST" } = {},
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", name);
  formData.append("email", email);
  formData.append("phoneNumber", phoneNumber);
  return cvApiForm(`/CVPost/submit/${publicCode}`, {
    formData,
    auth: true,
    method,
  });
}

export async function getSubmittedCvs(publicCode) {
  const result = await cvResultFetch(`/CVDocument/${publicCode}/MySubmissions`);
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  return [];
}