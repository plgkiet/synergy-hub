import { cvApiFetch, cvApiForm } from "./cvHttp";

function pageQuery({ pageNumber = 1, pageSize = 10 } = {}) {
  return new URLSearchParams({
    pageNumber: String(pageNumber),
    pageSize: String(pageSize),
  }).toString();
}

export function getPublicApplyUrl(publicCode) {
  if (!publicCode) return "";
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/apply/${publicCode}`;
  }
  return `/apply/${publicCode}`;
}

export function getApiSubmissionUrl(submissionUrl) {
  const base = import.meta.env.VITE_CV_API_BASE_URL?.replace(/\/$/, "") || "/cvapi";
  const path = submissionUrl?.startsWith("/") ? submissionUrl : `/${submissionUrl || ""}`;
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}${base}${path}`;
  }
  return `${base}${path}`;
}

export async function createCvPost({ title, description }) {
  return cvApiFetch("/CVPost/Create", {
    method: "POST",
    body: { title, description: description || undefined },
  });
}

export async function listMyCvPosts({ pageNumber = 1, pageSize = 10 } = {}) {
  return cvApiFetch(`/CVPost?${pageQuery({ pageNumber, pageSize })}`);
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

export async function submitCvToPost(publicCode, { file, name, email, phoneNumber }) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", name);
  formData.append("email", email);
  formData.append("phoneNumber", phoneNumber);
  return cvApiForm(`/CVPost/submit/${publicCode}`, { formData, auth: false });
}
