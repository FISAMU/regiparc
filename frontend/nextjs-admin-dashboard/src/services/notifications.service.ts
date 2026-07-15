// ============================================================
// Service notifications (header — alertes équipements)
// ============================================================
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export type EquipmentNotification = {
  id: string;
  title: string;
  subTitle: string;
  type: "warning" | "danger";
  url: string;
};

export const notificationsService = {
  getAll: () =>
    apiClient.get<{ count: number; results: EquipmentNotification[] }>(
      ENDPOINTS.notifications,
      { cache: "no-store" },
    ),
  resolve: (id: string) =>
    apiClient.post<{ message: string }>(ENDPOINTS.notificationResolve, { id }),
};
