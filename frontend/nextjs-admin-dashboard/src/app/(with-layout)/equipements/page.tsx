import type { Metadata } from "next";
import Link from "next/link";
import { equipementsService } from "@/services/equipements.service";
import { categoriesService } from "@/services/categories.service";
import { employesService } from "@/services/employes.service";
import { servicesService } from "@/services/services.service";
import { revalidatePath } from "next/cache";
import { Pagination } from "@/components/ui/pagination";
import { EquipmentStatusBadge } from "@/components/ui/status-badge";
import { loadPaginatedItems, resolvePage } from "@/lib/api/pagination";
import { loadFilteredTableData, resolveSearchQuery } from "@/lib/table-search";

export const metadata: Metadata = { title: "Équipements" };

async function deleteEquipement(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const { equipementsService: svc } = await import("@/services/equipements.service");
  await svc.delete(id);
  revalidatePath("/equipements");
}

export default async function EquipementsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; page?: string }>;
}) {
  const currentPage = await resolvePage(searchParams);
  const query = await resolveSearchQuery(searchParams);

  const [categories, employes, services] = await Promise.all([
    categoriesService.getAll().catch(() => []),
    employesService.getAll().catch(() => []),
    servicesService.getAll().catch(() => []),
  ]);

  const equipementsData = query
    ? await loadFilteredTableData(
        query,
        currentPage,
        () => equipementsService.getAll(),
        (equipement, q) =>
          equipement.codeInventaire.toLowerCase().includes(q) ||
          equipement.Designation.toLowerCase().includes(q) ||
          equipement.Marque.toLowerCase().includes(q) ||
          equipement.Etat.toLowerCase().includes(q),
      )
    : await loadPaginatedItems(
        (pageNumber) => equipementsService.getPaginated(pageNumber),
        () => equipementsService.getAll(),
        currentPage,
      );

  const { items: equipements, totalCount, totalPages, currentPage: page } =
    equipementsData;

  const getCategoryName = (id: string) => categories.find((c) => c.idCategorie === id)?.nomCategorie || id;
  const getServiceName = (id: string) => services.find((s) => s.idService === id)?.nomService || id;
  const getEmployeName = (id: string | null) => {
    if (!id) return "-";
    const emp = employes.find((e) => e.idEmploye === id);
    return emp ? `${emp.nomEmploye} ${emp.prenomEmploye}` : id;
  };

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-black dark:text-white">Équipements</h1>
        <Link
          href="/equipements/nouveau"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90 transition-colors"
        >
          Nouvel équipement
        </Link>
      </div>

      <div className="rounded-xl border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">Code Inventaire</th>
                <th className="min-w-[200px] px-4 py-4 font-medium text-black dark:text-white">Désignation</th>
                <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">Marque</th>
                <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">État</th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">Catégorie</th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">Service</th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">Employé</th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {equipements.map((equipement, key) => (
                <tr key={equipement.idEquipement} className={key === equipements.length - 1 ? "" : "border-b border-stroke dark:border-strokedark"}>
                  <td className="px-4 py-5 xl:pl-11"><p className="text-black dark:text-white">{equipement.codeInventaire}</p></td>
                  <td className="px-4 py-5"><p className="text-black dark:text-white">{equipement.Designation}</p></td>
                  <td className="px-4 py-5"><p className="text-black dark:text-white">{equipement.Marque}</p></td>
                  <td className="px-4 py-5"><EquipmentStatusBadge etat={equipement.Etat} /></td>
                  <td className="px-4 py-5"><p className="text-black dark:text-white">{getCategoryName(equipement.categorie)}</p></td>
                  <td className="px-4 py-5"><p className="text-black dark:text-white">{getServiceName(equipement.service)}</p></td>
                  <td className="px-4 py-5"><p className="text-black dark:text-white">{getEmployeName(equipement.employe)}</p></td>
                  <td className="px-4 py-5">
                    <div className="flex items-center space-x-3.5">
                      <Link href={`/equipements/${equipement.idEquipement}`} className="text-primary hover:text-primary/80">Modifier</Link>
                      <form action={deleteEquipement}>
                        <input type="hidden" name="id" value={equipement.idEquipement} />
                        <button type="submit" className="rounded-lg bg-red-500 px-3 py-1.5 text-sm text-white hover:bg-red-600 transition-colors">Supprimer</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {equipements.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-5 text-center text-gray-500">Aucun équipement trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          totalPages={totalPages}
          currentPage={page}
          totalCount={totalCount}
          basePath="/equipements"
          searchQuery={query || undefined}
        />
      </div>
    </div>
  );
}
