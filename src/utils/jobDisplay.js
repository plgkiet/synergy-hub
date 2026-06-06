export function formatJobDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function jobCardMeta(job) {
  return {
    jobType: job?.primaryJobType?.name || job?.jobTypes?.[0]?.name || "—",
    location: job?.primaryLocation?.name || "—",
    department: job?.functionalTeam || "—",
    workMode: job?.workMode || null,
    employmentType: job?.employmentType || null,
    organization: job?.organization?.name || "—",
    date: job?.displayDate || job?.postedDate || job?.createdDate,
  };
}

export function publicJobDetailMeta(job) {
  return {
    employmentType: job?.employmentType || "—",
    location: job?.primaryLocation?.name || "—",
    department: job?.functionalTeam || "—",
    workMode: job?.workMode || null,
    date: job?.displayDate || job?.postedDate,
  };
}

export function formatRoleName(role) {
  if (!role) return "—";
  return String(role).replace(/_/g, " ");
}

export function slugifyTitle(title) {
  return (title || "job")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export function parseCommaList(value) {
  if (!value?.trim()) return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function joinCommaList(value) {
  return Array.isArray(value) ? value.join(", ") : "";
}

export function toDateInput(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function fromDateInput(value) {
  if (!value) return undefined;
  return `${value}T00:00:00Z`;
}

export function toggleId(list, id) {
  const current = Array.isArray(list) ? list : [];
  return current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
}
