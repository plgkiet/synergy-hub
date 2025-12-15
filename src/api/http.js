const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "";

export const storage = {
  getToken() {
    return localStorage.getItem("accessToken") || "";
  },
  setToken(token) {
    if (!token) return;
    localStorage.setItem("accessToken", token);
  },
  clearToken() {
    localStorage.removeItem("accessToken");
  },
};

function buildUrl(path) {
  if (!path) return API_BASE_URL;
  if (path.startsWith("http")) return path;
  if (!API_BASE_URL) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

async function parseResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  const data = isJson ? await res.json().catch(() => null) : await res.text();

  if (!res.ok) {
    let message = `Request failed (${res.status})`;

    if (data) {
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        message = data.errors.join(", ");
      } else if (data.message) {
        message = data.message;
      } else if (data.title) {
        message = data.title;
      }
    }

    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export async function http(
  path,
  { method = "GET", body, headers, auth = true } = {}
) {
  const token = storage.getToken();

  const res = await fetch(buildUrl(path), {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  return parseResponse(res);
}
