// ============================================================
// Service maintenances — CRUD via API Django
// ============================================================
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { fetchPaginated } from "@/lib/api/pagination";
import type {
  Maintenance,
  CreateMaintenance,
  UpdateMaintenance,
} from "@/lib/api/types";

export const maintenancesService = {
  getAll: () => apiClient.get<Maintenance[]>(ENDPOINTS.maintenances),
  getPaginated: (page = 1) =>
    fetchPaginated<Maintenance>(ENDPOINTS.maintenances, page),
  getById: (id: string) =>
    apiClient.get<Maintenance>(ENDPOINTS.maintenance(id)),
  create: (data: CreateMaintenance) =>
    apiClient.post<Maintenance>(ENDPOINTS.maintenances, data),
  update: (id: string, data: UpdateMaintenance) =>
    apiClient.patch<Maintenance>(ENDPOINTS.maintenance(id), data),
  replace: (id: string, data: CreateMaintenance) =>
    apiClient.put<Maintenance>(ENDPOINTS.maintenance(id), data),
  delete: (id: string) => apiClient.delete(ENDPOINTS.maintenance(id)),
};
