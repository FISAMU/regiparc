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
    <header className="shadow-1 sticky top-0 z-30 flex items-center justify-between border-b border-[#1B46C2] bg-gradient-to-r from-[#0B10EE] to-[#1D4ED8] px-4 py-5 md:px-5 2xl:px-10">
      <PresenceHeartbeat />
      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={toggleSidebar}
          className="rounded-lg border border-white/20 px-1.5 py-1 text-white hover:bg-white/10 lg:hidden"
        >
          <MenuIcon />
          <span className="sr-only">Toggle Sidebar</span>
        </button>

        <Link href="/" className="ml-1 shrink-0 2xsm:ml-2">
          <RegidesoLogo width={40} height={40} />
        </Link>

        <div className="max-xl:hidden">
          <h1 className="text-heading-5 mb-0.5 font-bold text-white">
            Espace d'Administration
          </h1>
          <p className="font-medium text-white/70">
            Tableau de bord d'administration RegiParc
          </p>
        </div>
      </div>

      <div className="2xsm:gap-4 flex flex-1 items-center justify-end gap-2">
        <Suspense fallback={null}>
          <HeaderSearch />
        </Suspense>

        <Notification variant="light" />

        <div className="shrink-0">
          <UserInfo variant="light" />
        </div>
      </div>
    </header>
  );
}
