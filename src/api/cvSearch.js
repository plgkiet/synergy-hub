import { storage } from "@/api/http";

export async function searchCvs(searchQuery, limit = 50) {
  const token = storage.getToken();
  const base = import.meta.env.VITE_CV_API_BASE_URL || "/cvapi";

  const url = `${base}/CVDocument/search?${new URLSearchParams({
    SearchQuery: searchQuery,
    Limit: String(limit),
  })}`;

  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw Object.assign(
      new Error(data?.message || `Request failed (${res.status})`),
      { data, status: res.status }
    );
  return data;
}
