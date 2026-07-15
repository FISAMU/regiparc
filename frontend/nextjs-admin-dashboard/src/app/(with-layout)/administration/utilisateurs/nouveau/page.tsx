import type { Metadata } from "next";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { meService } from "@/services/me.service";

export const metadata: Metadata = { title: "Nouvel utilisateur" };

async function createUser(formData: FormData) {
  "use server";

  const { meService: meSvc } = await import("@/services/me.service");
  const actor = await meSvc.get();
  if (!actor.is_superuser) {
    throw new Error(
      "Seul un super administrateur peut créer un utilisateur.",
    );
  }

  const isSuperuserAccount = formData.get("is_superuser_account") === "on";
  const data = {
    username: formData.get("username") as string,
    email: formData.get("email") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    password: formData.get("password") as string,
    is_admin: isSuperuserAccount || formData.get("is_admin") === "on",
    is_superuser_account: isSuperuserAccount,
    is_active: true,
  };

  const { usersService: svc } = await import("@/services/users.service");
  await svc.create(data);
  revalidatePath("/administration/utilisateurs");
  redirect("/administration/utilisateurs");
}

export default async function NouvelUtilisateurPage() {
  const actor = await meService.get().catch(() => null);

  if (!actor?.is_superuser) {
    redirect("/administration/utilisateurs");
  }

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          Nouvel utilisateur
        </h1>
        <Link
          href="/administration/utilisateurs"
          className="cursor-pointer text-primary transition-colors hover:text-primary/80"
        >
          Retour à la liste
        </Link>
      </div>

      <div className="rounded-xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <form action={createUser} className="p-6.5">
          <div className="mb-4.5 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Nom d&apos;utilisateur
              </label>
              <input
                type="text"
                name="username"
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
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:bg-form-input dark:text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Mot de passe
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={8}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:bg-form-input dark:text-white"
              />
            </div>
          </div>

          <div className="mb-6 space-y-3">
            <label className="flex cursor-pointer items-center gap-3 text-black dark:text-white">
              <input
                type="checkbox"
                name="is_admin"
                className="size-4 cursor-pointer rounded border-stroke text-primary focus:ring-primary"
              />
              Accorder les droits d&apos;administration
            </label>
            <label className="flex cursor-pointer items-center gap-3 text-black dark:text-white">
              <input
                type="checkbox"
                name="is_superuser_account"
                className="size-4 cursor-pointer rounded border-stroke text-primary focus:ring-primary"
              />
              Créer comme super administrateur
            </label>
            <p className="text-xs text-dark-5">
              Un super administrateur a tous les droits, y compris la gestion
              des utilisateurs et des autres superusers.
            </p>
          </div>

          <button
            type="submit"
            className="flex w-full cursor-pointer justify-center rounded-lg bg-primary p-3 font-medium text-white hover:bg-opacity-90"
          >
            Créer l&apos;utilisateur
          </button>
        </form>
      </div>
    </div>
  );
}
