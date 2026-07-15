import type { Metadata } from "next";
import Link from "next/link";
import { servicesService } from "@/services/services.service";
import { revalidatePath } from "next/cache";
import { Pagination } from "@/components/ui/pagination";
import { loadPaginatedItems, resolvePage } from "@/lib/api/pagination";
import { loadFilteredTableData, resolveSearchQuery } from "@/lib/table-search";

export const metadata: Metadata = { title: "Services" };

async function deleteService(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const { servicesService: svc } = await import("@/services/services.service");
  await svc.delete(id);
  revalidatePath("/services");
}

export default async function ServicesPage({
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
        () => servicesService.getAll(),
        (service, q) =>
          service.nomService.toLowerCase().includes(q) ||
          service.Localisation.toLowerCase().includes(q),
      )
    : await loadPaginatedItems(
        (pageNumber) => servicesService.getPaginated(pageNumber),
        () => servicesService.getAll(),
        currentPage,
      );

  const { items: services, totalCount, totalPages, currentPage: page } = tableData;

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-black dark:text-white">Services / Départements</h1>
        <Link
          href="/services/nouveau"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90 transition-colors"
        >
          Nouveau service
        </Link>
      </div>

      <div className="rounded-xl border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[200px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">Nom du service</th>
                <th className="min-w-[200px] px-4 py-4 font-medium text-black dark:text-white">Localisation</th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service, key) => (
                <tr key={service.idService} className={key === services.length - 1 ? "" : "border-b border-stroke dark:border-strokedark"}>
                  <td className="px-4 py-5 xl:pl-11"><p className="text-black dark:text-white">{service.nomService}</p></td>
                  <td className="px-4 py-5"><p className="text-black dark:text-white">{service.Localisation}</p></td>
                  <td className="px-4 py-5">
                    <div className="flex items-center space-x-3.5">
                      <Link href={`/services/${service.idService}`} className="text-primary hover:text-primary/80">Modifier</Link>
                      <form action={deleteService}>
                        <input type="hidden" name="id" value={service.idService} />
                        <button type="submit" className="rounded-lg bg-red-500 px-3 py-1.5 text-sm text-white hover:bg-red-600 transition-colors">Supprimer</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-5 text-center text-gray-500">Aucun service trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          totalPages={totalPages}
          currentPage={page}
          totalCount={totalCount}
          basePath="/services"
          searchQuery={query || undefined}
        />
      </div>
    </div>
  );
}
