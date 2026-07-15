// ============================================================
// Service utilisateurs admin — CRUD (création = superuser côté API)
// ============================================================
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { fetchPaginated } from "@/lib/api/pagination";
import type {
  AppUser,
  CreateAppUser,
  UpdateAppUser,
} from "@/lib/api/types";

export const usersService = {
  getAll: () => apiClient.get<AppUser[]>(ENDPOINTS.users, { cache: "no-store" }),
  getPaginated: (page = 1) =>
    fetchPaginated<AppUser>(ENDPOINTS.users, page),
  getById: (id: number) => apiClient.get<AppUser>(ENDPOINTS.user(id)),
  create: (data: CreateAppUser) =>
    apiClient.post<AppUser>(ENDPOINTS.users, data),
  update: (id: number, data: UpdateAppUser) =>
    apiClient.patch<AppUser>(ENDPOINTS.user(id), data),
  delete: (id: number) => apiClient.delete(ENDPOINTS.user(id)),
};
