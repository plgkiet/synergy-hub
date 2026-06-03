/** Normalize CVDocument / vector search hits for SearchPage display fields. */

function formatEducation(education) {
  if (education == null || education === "") return null;
  if (typeof education === "string") return education;
  if (Array.isArray(education)) {
    const first = education[0];
    return first != null ? formatEducation(first) : null;
  }
  if (typeof education === "object") {
    const parts = [
      education.degree,
      education.major,
      education.field,
      education.school,
      education.institution,
      education.university,
      education.title,
    ].filter(Boolean);
    if (parts.length) return parts.join(" · ");
  }
  return null;
}

function formatSkills(skills) {
  if (!Array.isArray(skills)) return [];
  return skills
    .map((s) => {
      if (typeof s === "string") return s;
      if (!s || typeof s !== "object") return null;
      const name = s.name ?? s.skill ?? s.title;
      if (!name) return null;
      return s.level ? `${name} (${s.level})` : name;
    })
    .filter(Boolean);
}

function formatCategories(categories) {
  if (!Array.isArray(categories)) {
    if (typeof categories === "string" && categories) return [categories];
    return [];
  }
  return categories
    .map((c) => (typeof c === "string" ? c : c?.name ?? c?.role))
    .filter(Boolean);
}

/**
 * Maps API CVDocumentResponse (+ optional score) to SearchPage card props.
 * Layout fields: name, email, cvType, categories[], skills[], education[]
 */
export function mapCvToSearchView(cv) {
  if (!cv) return cv;

  const educationStr = formatEducation(cv.education);
  const roles = formatCategories(cv.targetRoles ?? cv.categories);
  const role =
    cv.confirmedPredictedRole || cv.predictedRole;
  if (role && !roles.includes(role)) {
    roles.unshift(
      typeof role === "string" ? role.replace(/_/g, " ") : role
    );
  }

  return {
    ...cv,
    name: cv.candidateName ?? cv.name ?? "",
    email: cv.submitterEmail ?? cv.email ?? "",
    cvType: cv.fileType ?? cv.cvType ?? "",
    categories: roles,
    skills: formatSkills(cv.skills),
    education: educationStr
      ? [educationStr]
      : Array.isArray(cv.education)
        ? cv.education.map((e) => formatEducation(e)).filter(Boolean)
        : [],
  };
}

export function extractSearchResults(response) {
  if (Array.isArray(response)) return response;
  const metadata = response?.metadata;
  if (Array.isArray(metadata)) return metadata;
  if (Array.isArray(metadata?.data)) return metadata.data;
  if (Array.isArray(metadata?.results)) return metadata.results;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}
