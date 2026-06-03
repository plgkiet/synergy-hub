const LOCATIONS = [
  "Ho Chi Minh",
  "Da Nang",
  "Guadalajara",
  "United States",
  "Remote Work",
  "Hybrid Work",
];

const JOB_TYPES = ["Experienced", "Fresher", "Intern"];

export const JOB_FILTER_GROUPS = {
  location: LOCATIONS,
  jobType: JOB_TYPES,
};

export function formatJobDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function haystack(job) {
  return `${job?.title || ""} ${job?.description || ""}`.toLowerCase();
}

export function inferJobMeta(job) {
  const text = haystack(job);
  let location = "—";
  for (const loc of LOCATIONS) {
    if (loc === "Remote Work" || loc === "Hybrid Work") continue;
    if (text.includes(loc.toLowerCase())) {
      location = loc;
      break;
    }
  }

  let workMode = null;
  if (text.includes("hybrid")) workMode = "Hybrid work";
  else if (text.includes("remote")) workMode = "Remote work";

  let jobType = "Experienced";
  if (text.includes("intern")) jobType = "Intern";
  else if (text.includes("fresher") || text.includes("junior")) jobType = "Fresher";

  return { location, workMode, jobType, department: "Engineering" };
}

export function jobMatchesSearch(job, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return haystack(job).includes(q);
}

export function jobMatchesPills(job, activePills) {
  if (!activePills?.size) return true;
  const text = haystack(job);
  for (const pill of activePills) {
    if (!text.includes(pill.toLowerCase())) return false;
  }
  return true;
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
