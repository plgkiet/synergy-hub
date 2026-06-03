import { cvResultFetch } from "@/api/cvHttp";

export async function searchCvs(searchQuery, limit = 1000) {
  const params = new URLSearchParams({
    SearchQuery: searchQuery,
    Limit: String(limit),
  });
  return cvResultFetch(`/CVDocument/search?${params}`);
}
