"use client";

import { RegidesoLogo } from "@/components/regideso-logo";
import { Suspense } from "react";
import { useSidebarContext } from "../sidebar/sidebar-context";
import { MenuIcon } from "./icons";
import { HeaderSearch } from "./header-search";
import { Notification } from "./notification";
import { PresenceHeartbeat } from "./presence-heartbeat";
import { UserInfo } from "./user-info";
import Link from "next/link";

export function Header() {
  const { toggleSidebar, isMobile } = useSidebarContext();

  return (
    <header className="shadow-1 sticky top-0 z-30 flex items-center justify-between border-b border-stroke bg-white px-4 py-5 md:px-5 2xl:px-10">
      <PresenceHeartbeat />
      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={toggleSidebar}
          className="rounded-lg border border-stroke px-1.5 py-1 text-dark hover:bg-gray-2 lg:hidden dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
        >
          <MenuIcon />
          <span className="sr-only">Toggle Sidebar</span>
        </button>

        <Link href="/" className="ml-1 shrink-0 2xsm:ml-2">
          <RegidesoLogo width={40} height={40} className="object-contain" />
        </Link>

        <div className="max-xl:hidden">
          <h1 className="text-heading-5 mb-0.5 font-bold text-dark dark:text-white">
            Espace d&apos;Administration
          </h1>
          <p className="font-medium text-dark-5 dark:text-dark-6">
            Tableau de bord d&apos;administration RegiParc
          </p>
        </div>
      </div>

      <div className="2xsm:gap-4 flex flex-1 items-center justify-end gap-2">
        <Suspense fallback={null}>
          <HeaderSearch />
        </Suspense>

        <Notification />

        <div className="shrink-0">
          <UserInfo />
        </div>
      </div>
    </header>
  );
}
