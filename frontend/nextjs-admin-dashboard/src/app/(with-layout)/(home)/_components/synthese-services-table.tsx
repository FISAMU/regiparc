import { cn } from "@/lib/utils";
import { getSyntheseServicesData } from "../fetch";

export async function SyntheseServicesTable({
  className,
}: {
  className?: string;
}) {
  const data = await getSyntheseServicesData();

  return (
    <div
      className={cn(
        "rounded-[10px] bg-white px-7.5 pb-5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
        className,
      )}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          Synthèse par service
        </h2>
      </div>

      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b border-stroke text-left dark:border-dark-3">
              <th className="px-2 py-3 font-medium text-dark dark:text-white">
                Service
              </th>
              <th className="px-2 py-3 font-medium text-dark dark:text-white">
                Affectations
              </th>
              <th className="px-2 py-3 font-medium text-dark dark:text-white">
                Actives
              </th>
              <th className="px-2 py-3 font-medium text-dark dark:text-white">
                Employés
              </th>
              <th className="px-2 py-3 font-medium text-dark dark:text-white">
                Catégorie dominante
              </th>
            </tr>
          </thead>

          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-2 py-6 text-center text-dark-5">
                  Aucune donnée disponible pour le moment.
                </td>
              </tr>
            )}
            {data.map((row) => (
              <tr
                key={row.service}
                className="border-b border-stroke/60 dark:border-dark-3"
              >
                <td className="px-2 py-4 font-medium text-dark dark:text-white">
                  {row.service}
                </td>
                <td className="px-2 py-4">{row.affectations}</td>
                <td className="px-2 py-4">{row.equipementsActifs}</td>
                <td className="px-2 py-4">{row.employesConcernes}</td>
                <td className="px-2 py-4">{row.categorieDominante}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
