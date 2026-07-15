import type { Metadata } from "next";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect, notFound } from "next/navigation";
import { meService } from "@/services/me.service";
import { usersService } from "@/services/users.service";

export const metadata: Metadata = { title: "Modifier utilisateur" };

async function updateUser(formData: FormData) {
  "use server";

  const id = Number(formData.get("id"));
  const { meService: meSvc } = await import("@/services/me.service");
  const { usersService: svc } = await import("@/services/users.service");

  const [actor, target] = await Promise.all([
    meSvc.get(),
    svc.getById(id),
  ]);

  if (target.is_superuser && !actor.is_superuser) {
    throw new Error(
      "Vous ne pouvez pas accéder aux informations d'un super administrateur.",
    );
  }

  const password = formData.get("password") as string;
  const payload: Record<string, unknown> = {
    username: formData.get("username") as string,
    email: formData.get("email") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    is_active: formData.get("is_active") === "on",
  };

  if (password) {
    payload.password = password;
  }

  if (actor.is_superuser) {
    const asSuperuser = formData.get("is_superuser_account") === "on";
    payload.is_superuser_account = asSuperuser;
    payload.is_admin = asSuperuser || formData.get("is_admin") === "on";
  }

  await svc.update(id, payload);
  revalidatePath("/administration/utilisateurs");
  redirect("/administration/utilisateurs");
}

export default async function ModifierUtilisateurPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = Number(id);

  const [actor, user] = await Promise.all([
    meService.get().catch(() => null),
    usersService.getById(userId).catch(() => null),
  ]);

  if (!user) {
    notFound();
  }

  if (user.is_superuser && !actor?.is_superuser) {
    redirect("/administration/utilisateurs");
  }

  const actorIsSuperuser = Boolean(actor?.is_superuser);

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          Modifier {user.nom}
        </h1>
        <Link
          href="/administration/utilisateurs"
          className="cursor-pointer text-primary transition-colors hover:text-primary/80"
        >
          Retour à la liste
        </Link>
      </div>

      <div className="rounded-xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <form action={updateUser} className="p-6.5">
          <input type="hidden" name="id" value={user.id} />

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

          <div className="mb-6 space-y-3">
            <label className="flex cursor-pointer items-center gap-3 text-black dark:text-white">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={user.is_active}
                className="size-4 cursor-pointer rounded border-stroke text-primary focus:ring-primary"
              />
              Compte actif
            </label>

            {actorIsSuperuser && (
              <>
                <label className="flex cursor-pointer items-center gap-3 text-black dark:text-white">
                  <input
                    type="checkbox"
                    name="is_admin"
                    defaultChecked={user.is_staff}
                    className="size-4 cursor-pointer rounded border-stroke text-primary focus:ring-primary"
                  />
                  Droits d&apos;administration
                </label>
                <label className="flex cursor-pointer items-center gap-3 text-black dark:text-white">
                  <input
                    type="checkbox"
                    name="is_superuser_account"
                    defaultChecked={user.is_superuser}
                    className="size-4 cursor-pointer rounded border-stroke text-primary focus:ring-primary"
                  />
                  Super administrateur
                </label>
              </>
            )}
          </div>

          <button
            type="submit"
            className="flex w-full cursor-pointer justify-center rounded-lg bg-primary p-3 font-medium text-white hover:bg-opacity-90"
          >
            Enregistrer les modifications
          </button>
        </form>
      </div>
    </div>
  );
}
