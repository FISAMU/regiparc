import type { Metadata } from "next";
import Link from "next/link";
import { affectationsService } from "@/services/affectations.service";
import { equipementsService } from "@/services/equipements.service";
import { revalidatePath } from "next/cache";
import { Pagination } from "@/components/ui/pagination";
import { loadPaginatedItems, resolvePage } from "@/lib/api/pagination";
import { loadFilteredTableData, resolveSearchQuery } from "@/lib/table-search";

export const metadata: Metadata = { title: "Affectations" };

async function deleteAffectation(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const { affectationsService: svc } = await import("@/services/affectations.service");
  await svc.delete(id);
  revalidatePath("/affectations");
}

export default async function AffectationsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; page?: string }>;
}) {
  const currentPage = await resolvePage(searchParams);
  const query = await resolveSearchQuery(searchParams);

  const equipements = await equipementsService.getAll().catch(() => []);
  const getEquipementCode = (id: string) =>
    equipements.find((e) => e.idEquipement === id)?.codeInventaire || id;

  const affectationsData = query
    ? await loadFilteredTableData(
        query,
        currentPage,
        () => affectationsService.getAll(),
        (affectation, q) => getEquipementCode(affectation.equipement).toLowerCase().includes(q),
      )
    : await loadPaginatedItems(
        (pageNumber) => affectationsService.getPaginated(pageNumber),
        () => affectationsService.getAll(),
        currentPage,
      );

  const { items: affectations, totalCount, totalPages, currentPage: page } =
    affectationsData;

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-black dark:text-white">Affectations</h1>
        <Link
          href="/affectations/nouveau"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90 transition-colors"
        >
          Nouvelle affectation
        </Link>
      </div>

      <div className="rounded-xl border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">Équipement</th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">Date Affectation</th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">Date Retour</th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {affectations.map((affectation, key) => (
                <tr key={affectation.idAffectation} className={key === affectations.length - 1 ? "" : "border-b border-stroke dark:border-strokedark"}>
                  <td className="px-4 py-5 xl:pl-11"><p className="text-black dark:text-white">{getEquipementCode(affectation.equipement)}</p></td>
                  <td className="px-4 py-5"><p className="text-black dark:text-white">{new Date(affectation.dateAffectation).toLocaleDateString()}</p></td>
                  <td className="px-4 py-5">
                    {affectation.dateRetour ? (
                      <p className="text-black dark:text-white">{new Date(affectation.dateRetour).toLocaleDateString()}</p>
                    ) : (
                      <span className="inline-flex rounded-full bg-warning/10 px-3 py-1 text-sm font-medium text-warning">En cours</span>
                    )}
                  </td>
                  <td className="px-4 py-5">
                    <form action={deleteAffectation}>
                      <input type="hidden" name="id" value={affectation.idAffectation} />
                      <button type="submit" className="rounded-lg bg-red-500 px-3 py-1.5 text-sm text-white hover:bg-red-600 transition-colors">Supprimer</button>
                    </form>
                  </td>
                </tr>
              ))}
              {affectations.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-5 text-center text-gray-500">Aucune affectation trouvée.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          totalPages={totalPages}
          currentPage={page}
          totalCount={totalCount}
          basePath="/affectations"
          searchQuery={query || undefined}
        />
      </div>
    </div>
  );
}
