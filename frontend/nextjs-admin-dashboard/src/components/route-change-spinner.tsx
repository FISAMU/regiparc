"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function RouteSpinnerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      if (anchor.target && anchor.target !== "_self") {
        return;
      }

      if (href.startsWith("http") || href.startsWith("//")) {
        try {
          const url = new URL(href, window.location.origin);
          if (url.origin !== window.location.origin) {
            return;
          }
        } catch {
          return;
        }
      }

      const nextUrl = new URL(href, window.location.origin);
      const current = `${window.location.pathname}${window.location.search}`;
      const target = `${nextUrl.pathname}${nextUrl.search}`;
      if (current === target) {
        return;
      }

      setLoading(true);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    setLoading(false);
  }, [pathname, searchParams]);

  if (!loading) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-white/50 backdrop-blur-[1px] dark:bg-black/40"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-8 py-6 shadow-lg dark:bg-gray-dark">
        <span className="inline-block size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <span className="text-sm font-medium text-dark dark:text-white">
          Chargement…
        </span>
      </div>
    </div>
  );
}

export function RouteChangeSpinner() {
  return (
    <Suspense fallback={null}>
      <RouteSpinnerInner />
    </Suspense>
  );
}
