"use client";

import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  notificationsService,
  type EquipmentNotification,
} from "@/services/notifications.service";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { BellIcon } from "./icons";

export function Notification({ variant = "default" }: { variant?: "default" | "light" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<EquipmentNotification[]>([]);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const notificationCount = notifications.length;

  const loadNotifications = useCallback(async () => {
    try {
      const response = await notificationsService.getAll();
      setNotifications(response.results);
    } catch {
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60_000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  async function handleResolve(id: string) {
    setResolvingId(id);

    try {
      await notificationsService.resolve(id);
      setNotifications((current) => current.filter((item) => item.id !== id));
      toast.success("Problème résolu — équipement remis en marche");
    } catch {
      toast.error("Impossible de résoudre cette alerte");
    } finally {
      setResolvingId(null);
    }
  }

  return (
    <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
      <DropdownTrigger
        className={cn(
          "grid size-12 cursor-pointer place-items-center rounded-full border outline-none",
          variant === "light"
            ? "border-white/20 bg-white/10 text-white hover:bg-white/20 focus-visible:border-white/40"
            : "bg-gray-2 text-dark hover:text-primary focus-visible:border-primary focus-visible:text-primary dark:border-dark-4 dark:bg-dark-2 dark:text-white dark:hover:bg-dark-3 dark:focus-visible:border-primary",
        )}
        aria-label={
          notificationCount > 0
            ? `${notificationCount} notification${notificationCount > 1 ? "s" : ""}`
            : "Voir les notifications"
        }
      >
        <span className="relative">
          <BellIcon />

          {notificationCount > 0 && (
            <span
              className={cn(
                "absolute -top-1.5 -right-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none text-white",
                variant === "light"
                  ? "bg-red-500 ring-2 ring-[#0B10EE]"
                  : "bg-red-500 ring-2 ring-gray-2 dark:ring-dark-3",
              )}
            >
              {notificationCount > 99 ? "99+" : notificationCount}
            </span>
          )}
        </span>
      </DropdownTrigger>

      <DropdownContent
        align={isMobile ? "end" : "center"}
        className="border border-stroke bg-white px-3.5 py-3 shadow-md min-[350px]:min-w-[22rem] dark:border-dark-3 dark:bg-gray-dark"
      >
        <div className="mb-1 flex items-center justify-between px-2 py-1.5">
          <span className="text-lg font-medium text-dark dark:text-white">
            Notifications équipements
          </span>
          {notificationCount > 0 && (
            <span className="rounded-md bg-primary px-2.25 py-0.5 text-xs font-medium text-white">
              {notificationCount} alerte{notificationCount > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <ul className="mb-3 max-h-92 space-y-1.5 overflow-y-auto">
          {notificationCount === 0 && (
            <li className="px-2 py-4 text-center text-sm text-dark-5">
              Aucun équipement en alerte.
            </li>
          )}

          {notifications.map((item) => (
            <li key={item.id} role="menuitem">
              <div className="flex items-start gap-2 rounded-lg px-2 py-2 hover:bg-gray-2 dark:hover:bg-dark-3">
                <Link
                  href={item.url}
                  onClick={() => setIsOpen(false)}
                  className="flex min-w-0 flex-1 items-start gap-3 outline-none focus-visible:ring-1 focus-visible:ring-primary"
                >
                  <span className="relative mt-1 flex size-2.5 shrink-0">
                    <span
                      className={cn(
                        "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                        item.type === "warning" ? "bg-warning" : "bg-danger",
                      )}
                    />
                    <span
                      className={cn(
                        "relative inline-flex size-2.5 animate-pulse rounded-full",
                        item.type === "warning" ? "bg-warning" : "bg-danger",
                      )}
                    />
                  </span>

                  <div className="min-w-0">
                    <strong className="block text-sm font-medium text-dark dark:text-white">
                      {item.title}
                    </strong>
                    <span className="block text-sm font-medium text-dark-5 dark:text-dark-6">
                      {item.subTitle}
                    </span>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => handleResolve(item.id)}
                  disabled={resolvingId === item.id}
                  className="shrink-0 rounded-md bg-success px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-success/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {resolvingId === item.id ? "..." : "Résoudre"}
                </button>
              </div>
            </li>
          ))}
        </ul>

        <Link
          href="/equipements"
          onClick={() => setIsOpen(false)}
          className="block rounded-lg border border-primary p-2 text-center text-sm font-medium tracking-wide text-primary transition-colors outline-none hover:bg-blue-light-5 focus:bg-blue-light-5 dark:border-dark-3 dark:text-dark-6 dark:hover:border-dark-5 dark:hover:bg-dark-3"
        >
          Voir tous les équipements
        </Link>
      </DropdownContent>
    </Dropdown>
  );
}
