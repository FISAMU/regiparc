"use client";

/**
 * Recherche navbar :
 * - Sur une page liste → filtre live via ?q=
 * - Ailleurs → Entrée redirige vers /employes?q=…
 */
import { SearchIcon } from "@/assets/icons";
import { isTableListPath } from "@/lib/table-search";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function readUrlQuery(searchParams: URLSearchParams) {
  return searchParams.get("q") ?? "";
}

export function HeaderSearch() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(() => readUrlQuery(searchParams));

  const isTablePage = isTableListPath(pathname);

  useEffect(() => {
    setQuery(readUrlQuery(searchParams));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync seulement au changement de route
  }, [pathname]);

  useEffect(() => {
    if (inputRef.current === document.activeElement) {
      return;
    }

    const urlQuery = readUrlQuery(searchParams);
    setQuery((current) => (current === urlQuery ? current : urlQuery));
  }, [searchParams]);

  useEffect(() => {
    if (!isTablePage) {
      return;
    }

    const timeout = setTimeout(() => {
      const trimmed = query.trim();
      const currentParams = new URLSearchParams(window.location.search);
      const urlQuery = currentParams.get("q") ?? "";

      if (trimmed === urlQuery) {
        return;
      }

      const params = new URLSearchParams(currentParams.toString());

      if (trimmed) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }

      params.delete("page");

      const next = params.toString();
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, isTablePage, pathname, router]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    const trimmed = query.trim();

    if (isTablePage) {
      const params = new URLSearchParams(searchParams.toString());
      if (trimmed) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }
      params.delete("page");
      const next = params.toString();
      router.push(next ? `${pathname}?${next}` : pathname);
      return;
    }

    if (trimmed) {
      router.push(`/employes?q=${encodeURIComponent(trimmed)}`);
    }
  }

  return (
    <div className="relative w-full max-w-75">
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          isTablePage
            ? "Filtrer ce tableau..."
            : "Rechercher un employé"
        }
        className={cn(
          "flex w-full cursor-text items-center gap-3.5 rounded-full border border-white/20 bg-white/10 py-3 pr-5 pl-13.25 text-white outline-none transition-colors placeholder:text-white/60 focus-visible:border-white/40 focus-visible:bg-white/15",
        )}
      />
      <SearchIcon className="pointer-events-none absolute top-1/2 left-5 -translate-y-1/2 text-white/70 max-[1015px]:size-5" />
    </div>
  );
}
