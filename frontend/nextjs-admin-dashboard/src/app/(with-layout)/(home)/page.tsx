import { AffectationsParServiceChart } from "./_components/affectations-par-service-chart";
import { MaintenancesParCategorieChart } from "./_components/maintenances-par-categorie-chart";
import { OverviewCardsGroup } from "./_components/overview-cards";
import { RepartitionMaintenancesChart } from "./_components/repartition-maintenances-chart";
import { SyntheseServicesTable } from "./_components/synthese-services-table";
import {
  getAffectationsParServiceData,
  getCoutEstimeData,
  getMaintenanceRepartitionData,
  getMaintenancesParCategorieData,
} from "./fetch";

export default async function Home() {
  const [
    affectationsParService,
    maintenancesParCategorie,
    maintenanceRepartition,
    coutEstime,
  ] = await Promise.all([
    getAffectationsParServiceData(),
    getMaintenancesParCategorieData(),
    getMaintenanceRepartitionData(),
    getCoutEstimeData(),
  ]);

  const totalAffectations = affectationsParService.reduce(
    (sum, item) => sum + item.affectations,
    0,
  );
  const totalActives = affectationsParService.reduce(
    (sum, item) => sum + item.actives,
    0,
  );
  const totalMaintenances = maintenancesParCategorie.reduce(
    (sum, item) => sum + item.preventive + item.curative + item.corrective,
    0,
  );

  return (
    <>
      <OverviewCardsGroup />

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
        <div className="col-span-12 rounded-[10px] bg-white px-7.5 pb-6 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card xl:col-span-7">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
                Affectations des équipements par service
              </h2>
              <p className="mt-1 text-sm text-dark-5">
                Répartition des affectations et des employés concernés par
                service.
              </p>
            </div>
          </div>

          <AffectationsParServiceChart data={affectationsParService} />

          <dl className="grid gap-4 pt-4 text-center sm:grid-cols-2">
            <div className="rounded-lg bg-gray-1 px-4 py-4 dark:bg-dark-2">
              <dt className="text-sm text-dark-5">Total des affectations</dt>
              <dd className="mt-1 text-2xl font-bold text-dark dark:text-white">
                {totalAffectations}
              </dd>
            </div>
            <div className="rounded-lg bg-gray-1 px-4 py-4 dark:bg-dark-2">
              <dt className="text-sm text-dark-5">Affectations actives</dt>
              <dd className="mt-1 text-2xl font-bold text-dark dark:text-white">
                {totalActives}
              </dd>
            </div>
          </dl>
        </div>

        <div className="col-span-12 rounded-[10px] bg-white px-7.5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card xl:col-span-5">
          <div className="mb-4">
            <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
              Maintenances par catégorie
            </h2>
            <p className="mt-1 text-sm text-dark-5">
              Volume des maintenances préventives, curatives et correctives par
              catégorie d&apos;équipement.
            </p>
          </div>

          <MaintenancesParCategorieChart data={maintenancesParCategorie} />
        </div>

        <div className="col-span-12 rounded-[10px] bg-white p-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card xl:col-span-4">
          <div className="mb-4">
            <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
              Répartition des maintenances
            </h2>
            <p className="mt-1 text-sm text-dark-5">
              Part des interventions par catégorie d&apos;équipement.
            </p>
          </div>

          <div className="grid place-items-center">
            <RepartitionMaintenancesChart data={maintenanceRepartition} />
          </div>

          <dl className="grid gap-4 pt-4 text-center sm:grid-cols-2">
            <div className="rounded-lg bg-gray-1 px-4 py-4 dark:bg-dark-2">
              <dt className="text-sm text-dark-5">Interventions</dt>
              <dd className="mt-1 text-lg font-semibold text-dark dark:text-white">
                {totalMaintenances}
              </dd>
            </div>
            <div className="rounded-lg bg-gray-1 px-4 py-4 dark:bg-dark-2">
              <dt className="text-sm text-dark-5">Coût estimé</dt>
              <dd className="mt-1 space-y-0.5 text-sm font-semibold leading-snug text-dark dark:text-white">
                {coutEstime.parDevise.length > 0 ? (
                  coutEstime.parDevise.map((item) => (
                    <div key={item.devise}>
                      {item.total.toLocaleString("fr-FR")}{" "}
                      <span className="font-medium text-dark-5">
                        {item.devise}
                      </span>
                    </div>
                  ))
                ) : (
                  <div>{coutEstime.total.toLocaleString("fr-FR")}</div>
                )}
              </dd>
            </div>
          </dl>
        </div>

        <SyntheseServicesTable className="col-span-12 xl:col-span-8" />
      </div>
    </>
  );
}
