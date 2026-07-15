// ============================================================
// Service affectations — CRUD via API Django
// ============================================================
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { fetchPaginated } from "@/lib/api/pagination";
import type {
  Affectation,
  CreateAffectation,
  UpdateAffectation,
} from "@/lib/api/types";

export const affectationsService = {
  getAll: () => apiClient.get<Affectation[]>(ENDPOINTS.affectations),
  getPaginated: (page = 1) =>
    fetchPaginated<Affectation>(ENDPOINTS.affectations, page),
  getById: (id: string) =>
    apiClient.get<Affectation>(ENDPOINTS.affectation(id)),
  create: (data: CreateAffectation) =>
    apiClient.post<Affectation>(ENDPOINTS.affectations, data),
  update: (id: string, data: UpdateAffectation) =>
    apiClient.patch<Affectation>(ENDPOINTS.affectation(id), data),
  replace: (id: string, data: CreateAffectation) =>
    apiClient.put<Affectation>(ENDPOINTS.affectation(id), data),
  delete: (id: string) => apiClient.delete(ENDPOINTS.affectation(id)),
};
