import { storage } from "./http";

export const CV_API_BASE_URL =
  import.meta.env.VITE_CV_API_BASE_URL?.replace(/\/$/, "") || "/cvapi";

export function buildCvUrl(path) {
  if (!path) return CV_API_BASE_URL;
  if (path.startsWith("http")) return path;
  if (!CV_API_BASE_URL) return path;
  return `${CV_API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

function apiResponseError(data, status) {
  const message =
    (Array.isArray(data?.errors) && data.errors.filter(Boolean).join(", ")) ||
    data?.message ||
    data?.error ||
    `Request failed (${status})`;
  const err = new Error(message);
  err.status = status;
  err.data = data;
  return err;
}

function resultError(data, status) {
  const message = data?.error || `Request failed (${status})`;
  const err = new Error(message);
  err.status = status;
  err.data = data;
  return err;
}

/** CVPost controllers — `ApiResponse<T>` with `success` + `data`. */
export async function cvApiFetch(
  path,
  { method = "GET", body, auth = true, headers } = {}
) {
  const token = storage.getToken();
  const res = await fetch(buildCvUrl(path), {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw apiResponseError(data, res.status);
  }

  if (data && data.success === false) {
    throw apiResponseError(data, res.status);
  }

  return data?.data ?? data;
}

/** CVDocument controllers — `Result<T>` with `statusCode` + `metadata`. */
export async function cvResultFetch(
  path,
  { method = "GET", body, auth = true, headers } = {}
) {
  const token = storage.getToken();
  const res = await fetch(buildCvUrl(path), {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw resultError(data, res.status);
  }

  if (data?.error || (data?.statusCode && data.statusCode !== 200)) {
    throw resultError(data, data.statusCode || res.status);
  }

  return data?.metadata ?? data;
}

export async function cvApiForm(path, { method = "POST", formData, auth = false } = {}) {
  const token = storage.getToken();
  const res = await fetch(buildCvUrl(path), {
    method,
    headers: {
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    if (data?.error != null) throw resultError(data, res.status);
    throw apiResponseError(data, res.status);
  }

  if (data && data.success === false) {
    throw apiResponseError(data, res.status);
  }

  if (data?.error) {
    throw resultError(data, data.statusCode || res.status);
  }

  return data?.data ?? data?.metadata ?? data;
}
