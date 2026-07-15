import { PAGE_SIZE } from "@/lib/api/pagination";

export const TABLE_LIST_PATHS = [
  "/employes",
  "/equipements",
  "/services",
  "/categories",
  "/affectations",
  "/maintenances",
  "/administration/utilisateurs",
];

export function isTableListPath(pathname: string) {
  return TABLE_LIST_PATHS.includes(pathname);
}

export async function resolveSearchQuery(
  searchParams?: Promise<{ q?: string; page?: string }>,
) {
  const params = searchParams ? await searchParams : {};
  return (params.q ?? "").trim();
}

export function filterAndPaginate<T>(
  items: T[],
  query: string,
  page: number,
  matcher: (item: T, normalizedQuery: string) => boolean,
) {
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = normalizedQuery
    ? items.filter((item) => matcher(item, normalizedQuery))
    : items;

  const totalCount = filtered.length;
  const totalPages = totalCount > 0 ? Math.ceil(totalCount / PAGE_SIZE) : 1;
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;

  return {
    items: filtered.slice(start, start + PAGE_SIZE),
    totalCount,
    totalPages,
    currentPage,
  };
}

export async function loadFilteredTableData<T>(
  query: string,
  page: number,
  getAll: () => Promise<T[]>,
  matcher: (item: T, normalizedQuery: string) => boolean,
) {
  const allItems = await getAll().catch(() => []);
  return filterAndPaginate(allItems, query, page, matcher);
}
