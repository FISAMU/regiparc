import { dashboardService } from "@/services/dashboard.service";

export async function getOverviewData() {
  const stats = await dashboardService.getStats();
  return stats.overview;
}

export async function getAffectationsParServiceData() {
  const stats = await dashboardService.getStats();
  return stats.affectationsParService;
}

export async function getMaintenancesParCategorieData() {
  const stats = await dashboardService.getStats();
  return stats.maintenancesParCategorie;
}

export async function getMaintenanceRepartitionData() {
  const stats = await dashboardService.getStats();
  if (stats.repartitionMaintenances?.length) {
    return stats.repartitionMaintenances;
  }

  const categories = stats.maintenancesParCategorie;
  return categories.map((item) => ({
    name: item.categorie,
    amount: item.preventive + item.curative + item.corrective,
  }));
}

export async function getCoutEstimeData() {
  const stats = await dashboardService.getStats();
  const totaux = stats.repartitionTotaux;

  if (totaux) {
    return {
      total: totaux.coutEstime,
      parDevise: totaux.coutsParDevise,
    };
  }

  const total = stats.maintenancesParCategorie.reduce(
    (sum, item) => sum + item.coutTotal,
    0,
  );

  return { total, parDevise: [] as Array<{ devise: string; total: number }> };
}

export async function getSyntheseServicesData() {
  const stats = await dashboardService.getStats();
  return stats.syntheseServices;
}
