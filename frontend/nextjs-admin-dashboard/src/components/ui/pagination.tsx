import Link from "next/link";
import { cn } from "@/lib/utils";
import { getPageRange, PAGE_SIZE } from "@/lib/api/pagination";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  totalCount: number;
  basePath: string;
  searchQuery?: string;
}

export function Pagination({
  totalPages,
  currentPage,
  totalCount,
  basePath,
  searchQuery,
}: PaginationProps) {
  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams();
    params.set("page", pageNumber.toString());
    if (searchQuery) {
      params.set("q", searchQuery);
    }
    return `${basePath}?${params.toString()}`;
  };

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;
  const { from, to } = getPageRange(currentPage, totalCount);

  if (totalCount === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-stroke px-2 py-6 dark:border-strokedark sm:flex-row">
      <p className="text-sm text-dark-5">
        {totalCount <= PAGE_SIZE ? (
          <>
            <span className="font-medium text-black dark:text-white">{totalCount}</span>{" "}
            élément{totalCount > 1 ? "s" : ""} — page {currentPage} sur {totalPages}
          </>
        ) : (
          <>
            Affichage de{" "}
            <span className="font-medium text-black dark:text-white">{from}</span> à{" "}
            <span className="font-medium text-black dark:text-white">{to}</span> sur{" "}
            <span className="font-medium text-black dark:text-white">{totalCount}</span>{" "}
            éléments — {PAGE_SIZE} par page
          </>
        )}
      </p>

      <nav aria-label="Pagination du tableau">
        <ul className="flex h-10 items-center -space-x-px text-sm">
          <li>
            <Link
              href={createPageURL(currentPage - 1)}
              className={cn(
                "flex h-10 items-center justify-center rounded-l-lg border border-stroke bg-white px-4 font-medium text-black transition hover:bg-gray-2 dark:border-strokedark dark:bg-boxdark dark:text-white dark:hover:bg-meta-4",
                isFirstPage && "pointer-events-none opacity-50",
              )}
              aria-disabled={isFirstPage}
            >
              Précédent
            </Link>
          </li>

          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <li key={page}>
              <Link
                href={createPageURL(page)}
                aria-current={currentPage === page ? "page" : undefined}
                className={cn(
                  "flex h-10 min-w-10 items-center justify-center border border-stroke px-4 font-medium transition dark:border-strokedark",
                  currentPage === page
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "bg-white text-black hover:bg-gray-2 dark:bg-boxdark dark:text-white dark:hover:bg-meta-4",
                )}
              >
                {page}
              </Link>
            </li>
          ))}

          <li>
            <Link
              href={createPageURL(currentPage + 1)}
              className={cn(
                "flex h-10 items-center justify-center rounded-r-lg border border-stroke bg-white px-4 font-medium text-black transition hover:bg-gray-2 dark:border-strokedark dark:bg-boxdark dark:text-white dark:hover:bg-meta-4",
                isLastPage && "pointer-events-none opacity-50",
              )}
              aria-disabled={isLastPage}
            >
              Suivant
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
