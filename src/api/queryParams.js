export function appendArrayParams(params, key, values) {
  if (!values?.length) return;
  for (const value of values) {
    if (value != null && value !== "") params.append(key, String(value));
  }
}

export function pageQuery({ pageNumber = 1, pageSize = 10 } = {}) {
  return new URLSearchParams({
    pageNumber: String(pageNumber),
    pageSize: String(pageSize),
  });
}
