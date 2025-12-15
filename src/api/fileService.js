import { storage } from "@/api/http";

function getFileNameFromDisposition(disposition) {
  if (!disposition) return "";
  const utf8 = disposition.match(/filename\*\=UTF-8''([^;]+)/i);
  if (utf8?.[1]) return decodeURIComponent(utf8[1].replace(/"/g, ""));
  const plain = disposition.match(/filename="?([^"]+)"?/i);
  return plain?.[1] || "";
}

export async function downloadCvByCode(code) {
  const token = storage.getToken();
  const base = import.meta.env.VITE_FILE_API_BASE_URL || "/fileapi";

  const res = await fetch(`${base}/File/readFileByCode/${code}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) throw new Error(`Download failed (${res.status})`);

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${code}`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  window.URL.revokeObjectURL(url);
}
