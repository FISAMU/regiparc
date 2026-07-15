// ============================================================
// Service organisationnels — CRUD via API Django
// ============================================================
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { fetchPaginated } from "@/lib/api/pagination";
import type {
  Service,
  CreateService,
  UpdateService,
} from "@/lib/api/types";

export const servicesService = {
  getAll: () => apiClient.get<Service[]>(ENDPOINTS.services),
  getPaginated: (page = 1) =>
    fetchPaginated<Service>(ENDPOINTS.services, page),
  getById: (id: string) => apiClient.get<Service>(ENDPOINTS.service(id)),
  create: (data: CreateService) =>
    apiClient.post<Service>(ENDPOINTS.services, data),
  update: (id: string, data: UpdateService) =>
    apiClient.patch<Service>(ENDPOINTS.service(id), data),
  replace: (id: string, data: CreateService) =>
    apiClient.put<Service>(ENDPOINTS.service(id), data),
  delete: (id: string) => apiClient.delete(ENDPOINTS.service(id)),
};
