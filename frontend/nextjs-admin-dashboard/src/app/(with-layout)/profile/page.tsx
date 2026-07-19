import type { Metadata } from "next";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ConnectionStatusBadge } from "@/components/ui/status-badge";
import { meService } from "@/services/me.service";
import { ProfilePhotoUpload } from "./_components/profile-photo-upload";

export const metadata: Metadata = { title: "Mon profil" };

async function updateProfile(formData: FormData) {
  "use server";

  const payload = {
    username: formData.get("username") as string,
    email: formData.get("email") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
  };

  const password = formData.get("password") as string;
  const data = password ? { ...payload, password } : payload;

  const { meService: svc } = await import("@/services/me.service");
  await svc.update(data);
  revalidatePath("/profile");
  redirect("/profile");
}

export default async function ProfilePage() {
  const user = await meService.get().catch(() => null);

  if (!user) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="rounded-xl border border-warning/30 bg-warning/10 px-6 py-5">
          Connectez-vous pour accéder à votre profil.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">
            Mon profil
          </h1>
          <p className="mt-1 text-sm text-dark-5">
            Configurez vos informations personnelles et votre mot de passe.
          </p>
        </div>
        <ConnectionStatusBadge
          isOnline={user.is_online}
          lastSeen={user.last_seen}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark lg:col-span-1">
          <h2 className="mb-6 text-lg font-semibold text-black dark:text-white">
            Photo de profil
          </h2>
          <ProfilePhotoUpload
            initialPhoto={user.photo}
            name={user.nom || user.username}
          />
          <hr className="my-6 border-stroke dark:border-strokedark" />
          <h2 className="mb-4 text-lg font-semibold text-black dark:text-white">
            Informations du compte
          </h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-dark-5">Rôle</dt>
              <dd className="font-medium text-black dark:text-white">{user.role}</dd>
            </div>
            <div>
              <dt className="text-dark-5">Nom complet</dt>
              <dd className="font-medium text-black dark:text-white">{user.nom}</dd>
            </div>
            <div>
              <dt className="text-dark-5">Email</dt>
              <dd className="font-medium text-black dark:text-white">{user.email}</dd>
            </div>
            <div>
              <dt className="text-dark-5">Membre depuis</dt>
              <dd className="font-medium text-black dark:text-white">
                {new Date(user.date_joined).toLocaleDateString("fr-FR")}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark lg:col-span-2">
          <form action={updateProfile} className="p-6.5">
            <h2 className="mb-6 text-lg font-semibold text-black dark:text-white">
              Modifier le profil
            </h2>

            <div className="mb-4.5 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  Nom d&apos;utilisateur
                </label>
                <input
                  type="text"
                  name="username"
                  defaultValue={user.username}
                  required
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
              <div>
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={user.email}
                  required
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
              <div>
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  Prénom
                </label>
                <input
                  type="text"
                  name="first_name"
                  defaultValue={user.first_name}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
              <div>
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  Nom
                </label>
                <input
                  type="text"
                  name="last_name"
                  defaultValue={user.last_name}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  Nouveau mot de passe (optionnel)
                </label>
                <input
                  type="password"
                  name="password"
                  minLength={8}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90"
              >
                Enregistrer
              </button>
              <Link
                href="/"
                className="rounded-lg border border-stroke px-6 py-3 font-medium text-black transition hover:bg-gray-2 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
              >
                Retour au tableau de bord
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
