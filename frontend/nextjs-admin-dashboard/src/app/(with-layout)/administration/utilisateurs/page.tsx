import type { Metadata } from "next";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Pagination } from "@/components/ui/pagination";
import { ConnectionStatusBadge } from "@/components/ui/status-badge";
import { ApiError } from "@/lib/api/client";
import { getTotalPages, resolvePage } from "@/lib/api/pagination";
import { loadFilteredTableData, resolveSearchQuery } from "@/lib/table-search";
import type { AppUser } from "@/lib/api/types";
import { usersService } from "@/services/users.service";

export const metadata: Metadata = { title: "Utilisateurs" };

async function deleteUser(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  const { meService: meSvc } = await import("@/services/me.service");
  const { usersService: svc } = await import("@/services/users.service");
  const [actor, target] = await Promise.all([meSvc.get(), svc.getById(id)]);
  if (target.is_superuser && !actor.is_superuser) {
    throw new Error(
      "Vous ne pouvez pas supprimer un super administrateur.",
    );
  }
  await svc.delete(id);
  revalidatePath("/administration/utilisateurs");
}

async function toggleAdminRights(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  const isAdmin = formData.get("is_admin") === "true";
  const { meService: meSvc } = await import("@/services/me.service");
  const { usersService: svc } = await import("@/services/users.service");
  const [actor, target] = await Promise.all([meSvc.get(), svc.getById(id)]);
  if (!actor.is_superuser) {
    throw new Error(
      "Seul un super administrateur peut attribuer des droits.",
    );
  }
  if (target.is_superuser) {
    throw new Error(
      "Vous ne pouvez pas retirer les droits d'administration d'un superuser via ce bouton.",
    );
  }
  await svc.update(id, { is_admin: !isAdmin });
  revalidatePath("/administration/utilisateurs");
}

async function toggleActiveStatus(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  const isActive = formData.get("is_active") === "true";
  const { meService: meSvc } = await import("@/services/me.service");
  const { usersService: svc } = await import("@/services/users.service");
  const [actor, target] = await Promise.all([meSvc.get(), svc.getById(id)]);
  if (target.is_superuser && !actor.is_superuser) {
    throw new Error(
      "Vous ne pouvez pas modifier un super administrateur.",
    );
  }
  await svc.update(id, { is_active: !isActive });
  revalidatePath("/administration/utilisateurs");
}

export default async function UtilisateursPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; page?: string }>;
}) {
  const currentPage = await resolvePage(searchParams);
  const query = await resolveSearchQuery(searchParams);
  const { meService } = await import("@/services/me.service");
  const actor = await meService.get().catch(() => null);
  const actorIsSuperuser = Boolean(actor?.is_superuser);

  let users: AppUser[] = [];
  let totalCount = 0;
  let totalPages = 1;
  let page = currentPage;
  let accessDenied = false;

  try {
    if (query) {
      const tableData = await loadFilteredTableData(
        query,
        currentPage,
        () => usersService.getAll(),
        (user, q) =>
          user.nom.toLowerCase().includes(q) ||
          user.username.toLowerCase().includes(q) ||
          user.email.toLowerCase().includes(q) ||
          user.role.toLowerCase().includes(q),
      );
      users = tableData.items;
      totalCount = tableData.totalCount;
      totalPages = tableData.totalPages;
      page = tableData.currentPage;
    } else {
      const response = await usersService.getPaginated(currentPage);
      users = response.results;
      totalCount = response.count;
      totalPages = getTotalPages(response.count);
      page = currentPage;
    }
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      accessDenied = true;
    }
  }

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">
            Gestion des utilisateurs
          </h1>
          <p className="mt-1 text-sm text-dark-5">
            {actorIsSuperuser
              ? "Créez des comptes et attribuez des droits (admin / superuser)."
              : "Consultez les utilisateurs. Seul un super administrateur peut créer des comptes et attribuer des droits."}
          </p>
        </div>
        {actorIsSuperuser && (
          <Link
            href="/administration/utilisateurs/nouveau"
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/90"
          >
            Nouvel utilisateur
          </Link>
        )}
      </div>

      {accessDenied ? (
        <div className="rounded-xl border border-warning/30 bg-warning/10 px-6 py-5 text-sm text-dark dark:text-white">
          Accès réservé aux administrateurs. Connectez-vous avec un compte
          disposant des droits admin (is_staff) pour gérer les utilisateurs.
        </div>
      ) : (
        <div className="rounded-xl border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                    Nom
                  </th>
                  <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white">
                    Email
                  </th>
                  <th className="min-w-[160px] px-4 py-4 font-medium text-black dark:text-white">
                    Rôle
                  </th>
                <th className="min-w-[140px] px-4 py-4 font-medium text-black dark:text-white">
                  Connexion
                </th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, key) => (
                  <tr
                    key={user.id}
                    className={
                      key === users.length - 1
                        ? ""
                        : "border-b border-stroke dark:border-strokedark"
                    }
                  >
                    <td className="px-4 py-5 xl:pl-11">
                      <p className="font-medium text-black dark:text-white">
                        {user.nom}
                      </p>
                      <p className="text-sm text-dark-5">@{user.username}</p>
                    </td>
                    <td className="px-4 py-5">
                      <p className="text-black dark:text-white">{user.email}</p>
                    </td>
                    <td className="px-4 py-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                          user.is_superuser
                            ? "bg-primary/10 text-primary"
                            : user.is_staff
                              ? "bg-success/10 text-success"
                              : "bg-gray-2 text-dark-5 dark:bg-meta-4"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-5">
                      <ConnectionStatusBadge
                        isOnline={user.is_online}
                        lastSeen={user.last_seen}
                      />
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex flex-wrap items-center gap-2">
                        {user.is_superuser && !actorIsSuperuser ? (
                          <span className="text-sm text-dark-5">Protégé</span>
                        ) : (
                          <Link
                            href={`/administration/utilisateurs/${user.id}`}
                            className="cursor-pointer text-primary hover:text-primary/80"
                          >
                            Modifier
                          </Link>
                        )}

                        {!user.is_superuser && actorIsSuperuser && (
                          <form action={toggleAdminRights}>
                            <input type="hidden" name="id" value={user.id} />
                            <input
                              type="hidden"
                              name="is_admin"
                              value={String(user.is_staff)}
                            />
                            <button
                              type="submit"
                              className="cursor-pointer rounded-lg bg-primary/10 px-3 py-1.5 text-sm text-primary transition hover:bg-primary/20"
                            >
                              {user.is_staff ? "Retirer admin" : "Donner admin"}
                            </button>
                          </form>
                        )}

                        {!user.is_superuser && (
                          <form action={toggleActiveStatus}>
                            <input type="hidden" name="id" value={user.id} />
                            <input
                              type="hidden"
                              name="is_active"
                              value={String(user.is_active)}
                            />
                            <button
                              type="submit"
                              className="cursor-pointer rounded-lg bg-warning/10 px-3 py-1.5 text-sm text-warning transition hover:bg-warning/20"
                            >
                              {user.is_active ? "Désactiver" : "Activer"}
                            </button>
                          </form>
                        )}

                        {!user.is_superuser && (
                          <form action={deleteUser}>
                            <input type="hidden" name="id" value={user.id} />
                            <button
                              type="submit"
                              className="cursor-pointer rounded-lg bg-red-500 px-3 py-1.5 text-sm text-white transition hover:bg-red-600"
                            >
                              Supprimer
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-5 text-center text-gray-500">
                      Aucun utilisateur trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            totalPages={totalPages}
            currentPage={page}
            totalCount={totalCount}
            basePath="/administration/utilisateurs"
            searchQuery={query || undefined}
          />
        </div>
      )}
    </div>
  );
}
