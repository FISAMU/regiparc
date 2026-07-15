// ============================================================
// Constantes des endpoints de l'API Django REST
// ============================================================

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export const API_BASE = BASE_URL;

export const ENDPOINTS = {
  // Catégories
  categories: `${BASE_URL}/categories/`,
  categorie: (id: string) => `${BASE_URL}/categories/${id}/`,

  // Services
  services: `${BASE_URL}/services/`,
  service: (id: string) => `${BASE_URL}/services/${id}/`,

  // Employés
  employes: `${BASE_URL}/employes/`,
  employe: (id: string) => `${BASE_URL}/employes/${id}/`,

  // Équipements
  equipements: `${BASE_URL}/equipements/`,
  equipement: (id: string) => `${BASE_URL}/equipements/${id}/`,

  // Affectations
  affectations: `${BASE_URL}/affectations/`,
  affectation: (id: string) => `${BASE_URL}/affectations/${id}/`,

  // Maintenances
  maintenances: `${BASE_URL}/maintenances/`,
  maintenance: (id: string) => `${BASE_URL}/maintenances/${id}/`,

  // Dashboard
  dashboard: `${BASE_URL}/dashboard/`,

  // Utilisateurs (auth Django)
  users: `${BASE_URL}/users/`,
  user: (id: number) => `${BASE_URL}/users/${id}/`,
  me: `${BASE_URL}/users/me/`,
  heartbeat: `${BASE_URL}/users/me/heartbeat/`,

  // Recherche & notifications
  search: `${BASE_URL}/search/`,
  notifications: `${BASE_URL}/notifications/`,
  notificationResolve: `${BASE_URL}/notifications/resolve/`,
} as const;
