"use client";

import { ChevronUpIcon } from "@/assets/icons";
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { ConnectionStatusBadge } from "@/components/ui/status-badge";
import { authService, type LoginResponse } from "@/services/auth.service";
import { meService } from "@/services/me.service";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LogOutIcon, UserIcon } from "./icons";

export function UserInfo({ variant = "default" }: { variant?: "default" | "light" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<LoginResponse["user"] | null>(null);
  const router = useRouter();

  useEffect(() => {
    setUser(authService.getUser());

    meService
      .get()
      .then((me) => {
        authService.updateStoredUser({
          photo: me.photo ?? null,
          first_name: me.first_name,
          last_name: me.last_name,
          email: me.email,
          username: me.username,
          is_online: me.is_online,
          last_seen: me.last_seen ?? null,
        });
        setUser(authService.getUser());
      })
      .catch(() => {
        // garde la session locale si /me échoue
      });
  }, []);

  function handleLogout() {
    setIsOpen(false);
    authService.logout();
    router.push("/auth/sign-in");
    toast.success("Déconnexion réussie");
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3" role="presentation">
        <span className="inline-block size-12 animate-pulse rounded-full bg-white/20" />
      </div>
    );
  }

  const displayName =
    `${user.first_name} ${user.last_name}`.trim() || user.username;

  return (
    <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
      <DropdownTrigger className="cursor-pointer rounded align-middle ring-primary ring-offset-2 outline-none focus-visible:ring-1 dark:ring-offset-gray-dark">
        <span className="sr-only">Mon compte</span>

        <figure className="flex items-center gap-3">
          <UserAvatar variant={variant} isOnline photo={user.photo} />
          <figcaption
            className={cn(
              "flex items-center gap-1 font-medium max-[1024px]:sr-only",
              variant === "light" ? "text-white" : "text-dark dark:text-dark-6",
            )}
          >
            <span className="max-w-24 truncate">{displayName}</span>
            <ChevronUpIcon
              aria-hidden
              className={cn(
                "rotate-180 transition-transform",
                isOpen && "rotate-0",
              )}
              strokeWidth={1.5}
            />
          </figcaption>
        </figure>
      </DropdownTrigger>

      <DropdownContent
        className="border border-stroke bg-white shadow-md min-[230px]:min-w-70 dark:border-dark-3 dark:bg-gray-dark"
        align="end"
      >
        <h2 className="sr-only">Informations utilisateur</h2>

        <figure className="flex items-center gap-2.5 px-5 py-3.5">
          <UserAvatar variant={variant} isOnline photo={user.photo} />
          <figcaption className="space-y-1 text-base font-medium">
            <div className="mb-2 leading-none text-dark dark:text-white">
              {displayName}
            </div>
            <div className="w-full max-w-47.5 truncate leading-none text-gray-6">
              {user.email}
            </div>
            <ConnectionStatusBadge
              isOnline={user.is_online ?? true}
              lastSeen={user.last_seen}
            />
          </figcaption>
        </figure>

        <hr className="border-[#E8E8E8] dark:border-dark-3" />

        <div className="p-2 text-base text-[#4B5563] *:cursor-pointer dark:text-dark-6">
          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.25 ring-primary outline-0 hover:bg-gray-2 hover:text-dark focus-visible:ring-1 dark:hover:bg-dark-3 dark:hover:text-white"
          >
            <UserIcon />
            <span className="mr-auto text-base font-medium">Mon profil</span>
          </Link>
        </div>

        <hr className="border-[#E8E8E8] dark:border-dark-3" />

        <div className="p-2 text-base text-[#4B5563] dark:text-dark-6">
          <button
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2.25 ring-primary outline-0 hover:bg-gray-2 hover:text-dark focus-visible:ring-1 dark:hover:bg-dark-3 dark:hover:text-white"
            onClick={handleLogout}
          >
            <LogOutIcon />
            <span className="text-base font-medium">Se déconnecter</span>
          </button>
        </div>
      </DropdownContent>
    </Dropdown>
  );
}

function UserAvatar({
  variant = "default",
  isOnline = false,
  photo,
}: {
  variant?: "default" | "light";
  isOnline?: boolean;
  photo?: string | null;
}) {
  return (
    <span className="relative">
      <span
        className={cn(
          "flex size-12 items-center justify-center overflow-hidden rounded-full border outline-none",
          variant === "light"
            ? "border-white/20 bg-white/10 text-white"
            : "bg-gray-2 text-dark dark:border-dark-4 dark:bg-dark-2 dark:text-white",
        )}
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" className="size-full object-cover" />
        ) : (
          <UserIcon />
        )}
      </span>
      <span className="absolute right-0 bottom-0 flex size-3.5">
        {isOnline && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-90" />
        )}
        <span
          className={cn(
            "relative inline-flex size-3.5 rounded-full border-2 border-white",
            isOnline
              ? "bg-green-500 shadow-[0_0_0_2px_#22c55e,0_0_8px_#22c55e]"
              : "bg-slate-400",
          )}
        />
      </span>
    </span>
  );
}
