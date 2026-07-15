import type { Metadata } from "next";
import { categoriesService } from "@/services/categories.service";
import { revalidatePath } from "next/cache";
import { Pagination } from "@/components/ui/pagination";
import { loadPaginatedItems, resolvePage } from "@/lib/api/pagination";
import { loadFilteredTableData, resolveSearchQuery } from "@/lib/table-search";

export const metadata: Metadata = { title: "Catégories" };

async function deleteCategorie(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const { categoriesService: svc } = await import("@/services/categories.service");
  await svc.delete(id);
  revalidatePath("/categories");
}

async function createCategorie(formData: FormData) {
  "use server";
  const data = { nomCategorie: formData.get("nomCategorie") as string };
  const { categoriesService: svc } = await import("@/services/categories.service");
  await svc.create(data);
  revalidatePath("/categories");
}

export default async function CategoriesPage({
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
        () => categoriesService.getAll(),
        (categorie, q) => categorie.nomCategorie.toLowerCase().includes(q),
      )
    : await loadPaginatedItems(
        (pageNumber) => categoriesService.getPaginated(pageNumber),
        () => categoriesService.getAll(),
        currentPage,
      );

  const { items: categories, totalCount, totalPages, currentPage: page } = tableData;

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-black dark:text-white">Catégories d'Équipements</h1>
      </div>

      <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
        <div className="flex flex-col gap-9">
          <div className="rounded-xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">Ajouter une catégorie</h3>
            </div>
            <form action={createCategorie} className="p-6.5">
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">Nom de la catégorie</label>
                <input type="text" name="nomCategorie" required placeholder="Ex: Ordinateur portable" className="w-full rounded-lg border border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" />
              </div>
              <button type="submit" className="flex w-full justify-center rounded-lg bg-primary p-3 font-medium text-gray hover:bg-opacity-90">Ajouter</button>
            </form>
          </div>
        </div>

        <div className="flex flex-col gap-9">
          <div className="rounded-xl border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <div className="max-w-full overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">Nom de la catégorie</th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((categorie, key) => (
                    <tr key={categorie.idCategorie} className={key === categories.length - 1 ? "" : "border-b border-stroke dark:border-strokedark"}>
                      <td className="px-4 py-5 xl:pl-11"><p className="text-black dark:text-white">{categorie.nomCategorie}</p></td>
                      <td className="px-4 py-5">
                        <form action={deleteCategorie}>
                          <input type="hidden" name="id" value={categorie.idCategorie} />
                          <button type="submit" className="rounded-lg bg-red-500 px-3 py-1.5 text-sm text-white hover:bg-red-600 transition-colors">Supprimer</button>
                        </form>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-4 py-5 text-center text-gray-500">Aucune catégorie trouvée.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              totalPages={totalPages}
              currentPage={page}
              totalCount={totalCount}
              basePath="/categories"
              searchQuery={query || undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
