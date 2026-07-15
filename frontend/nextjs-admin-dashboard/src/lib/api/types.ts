// ============================================================
// Types TypeScript correspondant aux modèles Django du backend
// ============================================================

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Categorie {
  idCategorie: string;
  nomCategorie: string;
}

export interface Service {
  idService: string;
  nomService: string;
  Localisation: string;
}

export interface Employe {
  idEmploye: string;
  nomEmploye: string;
  prenomEmploye: string;
  Fonction: string;
  Email: string;
  service: string | null;
  service_nom?: string | null;
}

export interface Equipement {
  idEquipement: string;
  codeInventaire: string;
  Designation: string;
  Marque: string;
  Modele: string;
  numSerie: string;
  dateAcquisition: string; // ISO date string (YYYY-MM-DD)
  valeur: string; // DecimalField retourné en string par DRF
  Etat: string;
  categorie: string; // UUID de la Categorie
  employe: string | null; // UUID de l'Employe (nullable)
  service: string; // UUID du Service
}

export interface Affectation {
  idAffectation: string;
  dateAffectation: string; // ISO date string
  dateRetour: string | null; // nullable
  equipement: string; // UUID de l'Equipement
}

export interface Maintenance {
  idMaintenance: string;
  dateMaintenance: string; // ISO date string
  typeMaintenance: string;
  Description: string;
  Cout: string; // DecimalField retourné en string par DRF
  devise: "CDF" | "USD";
  equipement: string; // UUID de l'Equipement
}

// Types pour la création (sans les champs auto-générés)
export type CreateCategorie = Omit<Categorie, "idCategorie">;
export type CreateService = Omit<Service, "idService">;
export type CreateEmploye = Omit<Employe, "idEmploye">;
export type CreateEquipement = Omit<Equipement, "idEquipement">;
export type CreateAffectation = Omit<Affectation, "idAffectation">;
export type CreateMaintenance = Omit<Maintenance, "idMaintenance">;

// Types pour la mise à jour partielle (PATCH)
export type UpdateCategorie = Partial<CreateCategorie>;
export type UpdateService = Partial<CreateService>;
export type UpdateEmploye = Partial<CreateEmploye>;
export type UpdateEquipement = Partial<CreateEquipement>;
export type UpdateAffectation = Partial<CreateAffectation>;
export type UpdateMaintenance = Partial<CreateMaintenance>;

export interface AppUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
  date_joined: string;
  role: string;
  nom: string;
  is_online: boolean;
  photo?: string | null;
}

export type CreateAppUser = {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  is_admin?: boolean;
  is_superuser_account?: boolean;
  is_active?: boolean;
};

export type UpdateAppUser = Partial<Omit<CreateAppUser, "password">> & {
  password?: string;
};

export interface DashboardOverviewItem {
  value: number;
  growthRate: number;
}

export interface DashboardData {
  overview: {
    equipements: DashboardOverviewItem;
    employes: DashboardOverviewItem;
    maintenances: DashboardOverviewItem;
    services: DashboardOverviewItem;
    affectations: DashboardOverviewItem;
    categories: DashboardOverviewItem;
  };
  affectationsParService: Array<{
    service: string;
    affectations: number;
    employes: number;
    actives: number;
  }>;
  maintenancesParCategorie: Array<{
    categorie: string;
    preventive: number;
    curative: number;
    corrective: number;
    equipementsConcernes: number;
    coutTotal: number;
  }>;
  repartitionMaintenances?: Array<{
    name: string;
    amount: number;
  }>;
  syntheseServices: Array<{
    service: string;
    affectations: number;
    equipementsActifs: number;
    employesConcernes: number;
    categorieDominante: string;
  }>;
  repartitionTotaux?: {
    interventions: number;
    coutEstime: number;
    coutsParDevise: Array<{ devise: string; total: number }>;
  };
}
