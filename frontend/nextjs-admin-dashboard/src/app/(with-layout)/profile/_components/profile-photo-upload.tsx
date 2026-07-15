"use client";

import { meService } from "@/services/me.service";
import { authService } from "@/services/auth.service";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { type ChangeEvent, useId, useState } from "react";
import { toast } from "sonner";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo

type Props = {
  initialPhoto?: string | null;
  name: string;
};

export function ProfilePhotoUpload({ initialPhoto, name }: Props) {
  const inputId = useId();
  const router = useRouter();
  const [photo, setPhoto] = useState<string | null>(initialPhoto ?? null);
  const [loading, setLoading] = useState(false);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez choisir une image (JPG, PNG, WebP…).");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("La photo ne doit pas dépasser 5 Mo.");
      return;
    }

    setLoading(true);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            resolve(reader.result);
            return;
          }
          reject(new Error("Lecture impossible"));
        };
        reader.onerror = () => reject(new Error("Lecture impossible"));
        reader.readAsDataURL(file);
      });

      const updated = await meService.update({ photo: base64 });
      setPhoto(updated.photo ?? base64);
      authService.updateStoredUser({ photo: updated.photo ?? base64 });
      toast.success("Photo de profil mise à jour.");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Impossible d'enregistrer la photo.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove() {
    setLoading(true);
    try {
      const updated = await meService.update({ photo: null });
      setPhoto(null);
      authService.updateStoredUser({ photo: null });
      toast.success("Photo de profil supprimée.");
      router.refresh();
      void updated;
    } catch {
      toast.error("Impossible de supprimer la photo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative size-32 overflow-hidden rounded-full border border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4">
        {photo ? (
          // data URLs / remote URLs
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={`Photo de ${name}`}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-3xl font-bold text-dark-5">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <label
          htmlFor={inputId}
          className={cn(
            "cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90",
            loading && "pointer-events-none opacity-70",
          )}
        >
          {loading ? "Enregistrement…" : photo ? "Changer la photo" : "Ajouter une photo"}
          <input
            id={inputId}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="sr-only"
            disabled={loading}
            onChange={handleChange}
          />
        </label>
        {photo && (
          <button
            type="button"
            disabled={loading}
            onClick={handleRemove}
            className="cursor-pointer rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-black hover:bg-gray-2 disabled:cursor-not-allowed disabled:opacity-70 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
          >
            Supprimer
          </button>
        )}
      </div>
      <p className="text-center text-xs text-dark-5">
        JPG, PNG ou WebP — taille maximale 5 Mo.
      </p>
    </div>
  );
}
