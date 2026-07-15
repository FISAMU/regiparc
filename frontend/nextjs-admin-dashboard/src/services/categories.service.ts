// ============================================================
// Service catégories — CRUD via API Django
// ============================================================
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { fetchPaginated } from "@/lib/api/pagination";
import type {
  Categorie,
  CreateCategorie,
  UpdateCategorie,
} from "@/lib/api/types";

export const categoriesService = {
  getAll: () => apiClient.get<Categorie[]>(ENDPOINTS.categories),
  getPaginated: (page = 1) =>
    fetchPaginated<Categorie>(ENDPOINTS.categories, page),
  getById: (id: string) =>
    apiClient.get<Categorie>(ENDPOINTS.categorie(id)),
  create: (data: CreateCategorie) =>
    apiClient.post<Categorie>(ENDPOINTS.categories, data),
  update: (id: string, data: UpdateCategorie) =>
    apiClient.patch<Categorie>(ENDPOINTS.categorie(id), data),
  replace: (id: string, data: CreateCategorie) =>
    apiClient.put<Categorie>(ENDPOINTS.categorie(id), data),
  delete: (id: string) => apiClient.delete(ENDPOINTS.categorie(id)),
};
