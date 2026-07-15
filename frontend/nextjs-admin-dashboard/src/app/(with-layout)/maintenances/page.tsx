import type { Metadata } from "next";
import Link from "next/link";
import { maintenancesService } from "@/services/maintenances.service";
import { equipementsService } from "@/services/equipements.service";
import { revalidatePath } from "next/cache";
import { Pagination } from "@/components/ui/pagination";
import { formatMaintenanceCost } from "@/lib/format-currency";
import { loadPaginatedItems, resolvePage } from "@/lib/api/pagination";
import { loadFilteredTableData, resolveSearchQuery } from "@/lib/table-search";

export const metadata: Metadata = { title: "Maintenances" };

async function deleteMaintenance(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const { maintenancesService: svc } = await import("@/services/maintenances.service");
  await svc.delete(id);
  revalidatePath("/maintenances");
}

export default async function MaintenancesPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; page?: string }>;
}) {
  const currentPage = await resolvePage(searchParams);
  const query = await resolveSearchQuery(searchParams);

  const equipements = await equipementsService.getAll().catch(() => []);
  const getEquipementCode = (id: string) =>
    equipements.find((e) => e.idEquipement === id)?.codeInventaire || id;

  const maintenancesData = query
    ? await loadFilteredTableData(
        query,
        currentPage,
        () => maintenancesService.getAll(),
        (maintenance, q) =>
          maintenance.typeMaintenance.toLowerCase().includes(q) ||
          maintenance.Description.toLowerCase().includes(q) ||
          getEquipementCode(maintenance.equipement).toLowerCase().includes(q),
      )
    : await loadPaginatedItems(
        (pageNumber) => maintenancesService.getPaginated(pageNumber),
        () => maintenancesService.getAll(),
        currentPage,
      );

  const { items: maintenances, totalCount, totalPages, currentPage: page } =
    maintenancesData;

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-black dark:text-white">Maintenances</h1>
        <Link
          href="/maintenances/nouveau"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90 transition-colors"
        >
          Nouvelle maintenance
        </Link>
      </div>

      <div className="rounded-xl border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">Équipement</th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">Date</th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">Type</th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">Coût</th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {maintenances.map((maintenance, key) => (
                <tr key={maintenance.idMaintenance} className={key === maintenances.length - 1 ? "" : "border-b border-stroke dark:border-strokedark"}>
                  <td className="px-4 py-5 xl:pl-11"><p className="text-black dark:text-white">{getEquipementCode(maintenance.equipement)}</p></td>
                  <td className="px-4 py-5"><p className="text-black dark:text-white">{new Date(maintenance.dateMaintenance).toLocaleDateString()}</p></td>
                  <td className="px-4 py-5"><p className="text-black dark:text-white">{maintenance.typeMaintenance}</p></td>
                  <td className="px-4 py-5"><p className="text-black dark:text-white">{formatMaintenanceCost(maintenance.Cout, maintenance.devise || "USD")}</p></td>
                  <td className="px-4 py-5">
                    <form action={deleteMaintenance}>
                      <input type="hidden" name="id" value={maintenance.idMaintenance} />
                      <button type="submit" className="rounded-lg bg-red-500 px-3 py-1.5 text-sm text-white hover:bg-red-600 transition-colors">Supprimer</button>
                    </form>
                  </td>
                </tr>
              ))}
              {maintenances.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-5 text-center text-gray-500">Aucune maintenance trouvée.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          totalPages={totalPages}
          currentPage={page}
          totalCount={totalCount}
          basePath="/maintenances"
          searchQuery={query || undefined}
        />
      </div>
    </div>
  );
}
