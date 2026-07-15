// ============================================================
// Service profil connecté (GET/PATCH /users/me/)
// ============================================================
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { AppUser } from "@/lib/api/types";

export type UpdateMePayload = {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  password?: string;
  photo?: string | null;
};

export const meService = {
  get: () => apiClient.get<AppUser>(ENDPOINTS.me, { cache: "no-store" }),
  update: (data: UpdateMePayload) =>
    apiClient.patch<AppUser>(ENDPOINTS.me, data),
  heartbeat: () =>
    apiClient.post<{ is_online: boolean }>(ENDPOINTS.heartbeat, {}),
};
