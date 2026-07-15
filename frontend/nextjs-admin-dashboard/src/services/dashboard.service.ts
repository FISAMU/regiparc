// ============================================================
// Service dashboard — stats + graphiques de l'accueil
// ============================================================
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { DashboardData } from "@/lib/api/types";

const emptyDashboard: DashboardData = {
  overview: {
    equipements: { value: 0, growthRate: 0 },
    employes: { value: 0, growthRate: 0 },
    maintenances: { value: 0, growthRate: 0 },
    services: { value: 0, growthRate: 0 },
    affectations: { value: 0, growthRate: 0 },
    categories: { value: 0, growthRate: 0 },
  },
  affectationsParService: [],
  maintenancesParCategorie: [],
  syntheseServices: [],
  repartitionTotaux: {
    interventions: 0,
    coutEstime: 0,
    coutsParDevise: [],
  },
};

export const dashboardService = {
  getStats: () =>
    apiClient
      .get<DashboardData>(ENDPOINTS.dashboard, { cache: "no-store" })
      .catch(() => emptyDashboard),
};
