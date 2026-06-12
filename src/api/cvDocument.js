import { storage } from "./http";
import { buildCvUrl, cvResultFetch } from "./cvHttp";

function parseMaybeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export function uploadCvs(files, { onProgress } = {}) {
  if (!files || files.length === 0) {
    return Promise.reject(new Error("Please select at least 1 file."));
  }

  const token = storage.getToken();
  const url = buildCvUrl("/CVDocument/Uploads");

  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    console.log("UPLOAD URL:", url);

    xhr.open("POST", url, true);

    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (evt) => {
      if (!evt.lengthComputable) return;
      const percent = Math.round((evt.loaded / evt.total) * 100);
      onProgress?.(percent);
    };

    xhr.onload = () => {
      const body = parseMaybeJson(xhr.responseText || "");
      if (xhr.status >= 200 && xhr.status < 300) return resolve(body);

      const msg =
        body?.message ||
        body?.title ||
        body?.error ||
        (Array.isArray(body?.errors) && body.errors[0]) ||
        `Upload failed (${xhr.status})`;

      const err = new Error(msg);
      err.status = xhr.status;
      err.data = body;
      reject(err);
    };

    xhr.onerror = () => reject(new Error("Network error while uploading."));
    xhr.send(formData);
  });
}

export async function confirmPredictedRole(cvId, confirmedPredictedRole) {
  return cvResultFetch(`/CVDocument/${cvId}/confirm-predicted-role`, {
    method: "PATCH",
    body: { confirmedPredictedRole },
  });
}

export async function getCvById(id) {
  return cvResultFetch(`/CVDocument/GetById/${id}`);
}

export async function getCvByCode(code) {
  return cvResultFetch(`/CVDocument/GetByCode/${code}`);
}