import { apiClient } from "@/lib/api/client";
import type { PaginatedResponse } from "@/lib/api/types";

export const PAGE_SIZE = 10;

export function buildPaginatedUrl(endpoint: string, page: number) {
  const url = new URL(endpoint);
  url.searchParams.set("page", page.toString());
  url.searchParams.set("page_size", PAGE_SIZE.toString());
  return url.toString();
}

export function fetchPaginated<T>(endpoint: string, page = 1) {
  return apiClient.get<PaginatedResponse<T>>(buildPaginatedUrl(endpoint, page), {
    cache: "no-store",
  });
}

export async function resolvePage(
  searchParams?: Promise<{ page?: string }>,
) {
  const params = searchParams ? await searchParams : {};
  const page = Number(params.page || "1");
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export function getTotalPages(count: number) {
  return count > 0 ? Math.ceil(count / PAGE_SIZE) : 1;
}

function isPaginatedResponse<T>(data: unknown): data is PaginatedResponse<T> {
  return (
    typeof data === "object" &&
    data !== null &&
    "results" in data &&
    "count" in data &&
    Array.isArray((data as PaginatedResponse<T>).results)
  );
}

export type PaginatedListResult<T> = {
  items: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
};

export async function loadPaginatedItems<T>(
  getPaginated: (page: number) => Promise<PaginatedResponse<T> | T[]>,
  getAll: () => Promise<T[]>,
  page: number,
): Promise<PaginatedListResult<T>> {
  const requestedPage = page > 0 ? page : 1;

  try {
    const response = await getPaginated(requestedPage);

    if (isPaginatedResponse<T>(response)) {
      const totalCount = response.count;
      const totalPages = getTotalPages(totalCount);
      const currentPage = Math.min(requestedPage, totalPages);

      return {
        items: response.results,
        totalCount,
        totalPages,
        currentPage,
      };
    }

    if (Array.isArray(response)) {
      const totalCount = response.length;
      const totalPages = getTotalPages(totalCount);
      const currentPage = Math.min(requestedPage, totalPages);
      const start = (currentPage - 1) * PAGE_SIZE;

      return {
        items: response.slice(start, start + PAGE_SIZE),
        totalCount,
        totalPages,
        currentPage,
      };
    }
  } catch {
    // Fallback to full list below.
  }

  const all = await getAll().catch(() => []);
  const totalCount = all.length;
  const totalPages = getTotalPages(totalCount);
  const currentPage = Math.min(requestedPage, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;

  return {
    items: all.slice(start, start + PAGE_SIZE),
    totalCount,
    totalPages,
    currentPage,
  };
}

export function getPageRange(currentPage: number, totalCount: number) {
  if (totalCount === 0) {
    return { from: 0, to: 0 };
  }

  const from = (currentPage - 1) * PAGE_SIZE + 1;
  const to = Math.min(currentPage * PAGE_SIZE, totalCount);

  return { from, to };
}
