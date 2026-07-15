// ============================================================
// Service recherche globale (API /search/)
// ============================================================
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export type SearchResult = {
  type: string;
  label: string;
  url: string;
  meta?: string;
};

export const searchService = {
  search: (query: string) =>
    apiClient.get<{ results: SearchResult[] }>(
      `${ENDPOINTS.search}?q=${encodeURIComponent(query)}`,
      { cache: "no-store" },
    ),
};
