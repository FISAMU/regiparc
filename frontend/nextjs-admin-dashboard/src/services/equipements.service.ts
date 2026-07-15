// ============================================================
// Service équipements — CRUD via API Django
// ============================================================
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { fetchPaginated } from "@/lib/api/pagination";
import type {
  Equipement,
  CreateEquipement,
  UpdateEquipement,
} from "@/lib/api/types";

export const equipementsService = {
  getAll: () => apiClient.get<Equipement[]>(ENDPOINTS.equipements),
  getPaginated: (page = 1) =>
    fetchPaginated<Equipement>(ENDPOINTS.equipements, page),
  getById: (id: string) => apiClient.get<Equipement>(ENDPOINTS.equipement(id)),
  create: (data: CreateEquipement) =>
    apiClient.post<Equipement>(ENDPOINTS.equipements, data),
  update: (id: string, data: UpdateEquipement) =>
    apiClient.patch<Equipement>(ENDPOINTS.equipement(id), data),
  replace: (id: string, data: CreateEquipement) =>
    apiClient.put<Equipement>(ENDPOINTS.equipement(id), data),
  delete: (id: string) => apiClient.delete(ENDPOINTS.equipement(id)),
};
