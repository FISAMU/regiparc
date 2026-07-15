// ============================================================
// Service employés — CRUD via API Django
// ============================================================
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { fetchPaginated } from "@/lib/api/pagination";
import type {
  Employe,
  CreateEmploye,
  UpdateEmploye,
} from "@/lib/api/types";

export const employesService = {
  getAll: () =>
    apiClient.get<Employe[]>(ENDPOINTS.employes, { cache: "no-store" }),
  getPaginated: (page = 1) => fetchPaginated<Employe>(ENDPOINTS.employes, page),
  getById: (id: string) => apiClient.get<Employe>(ENDPOINTS.employe(id)),
  create: (data: CreateEmploye) =>
    apiClient.post<Employe>(ENDPOINTS.employes, data),
  update: (id: string, data: UpdateEmploye) =>
    apiClient.patch<Employe>(ENDPOINTS.employe(id), data),
  replace: (id: string, data: CreateEmploye) =>
    apiClient.put<Employe>(ENDPOINTS.employe(id), data),
  delete: (id: string) => apiClient.delete(ENDPOINTS.employe(id)),
};
