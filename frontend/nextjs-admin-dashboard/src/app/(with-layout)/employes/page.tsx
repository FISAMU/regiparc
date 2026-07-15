import type { Metadata } from "next";
import Link from "next/link";
import { employesService } from "@/services/employes.service";
import { revalidatePath } from "next/cache";
import { Pagination } from "@/components/ui/pagination";
import { loadPaginatedItems, resolvePage } from "@/lib/api/pagination";
import { loadFilteredTableData, resolveSearchQuery } from "@/lib/table-search";

export const metadata: Metadata = { title: "Employés" };

async function deleteEmploye(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const { employesService: svc } = await import("@/services/employes.service");
  await svc.delete(id);
  revalidatePath("/employes");
}

export default async function EmployesPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; page?: string }>;
}) {
  const currentPage = await resolvePage(searchParams);
  const query = await resolveSearchQuery(searchParams);

  const tableData = query
    ? await loadFilteredTableData(
        query,
        currentPage,
        () => employesService.getAll(),
        (employe, q) =>
          employe.nomEmploye.toLowerCase().includes(q) ||
          employe.prenomEmploye.toLowerCase().includes(q) ||
          employe.Fonction.toLowerCase().includes(q) ||
          employe.Email.toLowerCase().includes(q) ||
          (employe.service_nom ?? "").toLowerCase().includes(q),
      )
    : await loadPaginatedItems(
        (pageNumber) => employesService.getPaginated(pageNumber),
        () => employesService.getAll(),
        currentPage,
      );

  const {
    items: employes,
    totalCount,
    totalPages,
    currentPage: page,
  } = tableData;

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          Employés
        </h1>
        <Link
          href="/employes/nouveau"
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/90"
        >
          Nouvel employé
        </Link>
      </div>

      <div className="rounded-xl border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                  Nom
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                  Prénom
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                  Fonction
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                  Service
                </th>
                <th className="min-w-[200px] px-4 py-4 font-medium text-black dark:text-white">
                  Email
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {employes.map((employe, key) => (
                <tr
                  key={employe.idEmploye}
                  className={
                    key === employes.length - 1
                      ? ""
                      : "border-b border-stroke dark:border-strokedark"
                  }
                >
                  <td className="px-4 py-5 xl:pl-11">
                    <p className="text-black dark:text-white">
                      {employe.nomEmploye}
                    </p>
                  </td>
                  <td className="px-4 py-5">
                    <p className="text-black dark:text-white">
                      {employe.prenomEmploye}
                    </p>
                  </td>
                  <td className="px-4 py-5">
                    <p className="text-black dark:text-white">
                      {employe.Fonction}
                    </p>
                  </td>
                  <td className="px-4 py-5">
                    <p className="text-black dark:text-white">
                      {employe.service_nom || "—"}
                    </p>
                  </td>
                  <td className="px-4 py-5">
                    <p className="text-black dark:text-white">{employe.Email}</p>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex items-center space-x-3.5">
                      <Link
                        href={`/employes/${employe.idEmploye}`}
                        className="cursor-pointer text-primary hover:text-primary/80"
                      >
                        Modifier
                      </Link>
                      <form action={deleteEmploye}>
                        <input
                          type="hidden"
                          name="id"
                          value={employe.idEmploye}
                        />
                        <button
                          type="submit"
                          className="cursor-pointer rounded-lg bg-red-500 px-3 py-1.5 text-sm text-white transition-colors hover:bg-red-600"
                        >
                          Supprimer
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {employes.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-5 text-center text-gray-500"
                  >
                    Aucun employé trouvé.
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
          basePath="/employes"
          searchQuery={query || undefined}
        />
      </div>
    </div>
  );
}
