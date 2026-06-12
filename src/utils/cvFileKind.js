export function detectCvFileKind({ contentType = "", fileName = "", fileType = "" } = {}) {
  const type = `${contentType} ${fileType}`.toLowerCase();
  const name = fileName.toLowerCase();

  if (type.includes("pdf") || name.endsWith(".pdf")) {
    return "pdf";
  }

  if (name.endsWith(".doc") && !name.endsWith(".docx")) {
    return "doc";
  }

  if (
    type.includes("word") ||
    type.includes("msword") ||
    type.includes("officedocument") ||
    name.endsWith(".docx")
  ) {
    return "word";
  }

  return "unknown";
}
