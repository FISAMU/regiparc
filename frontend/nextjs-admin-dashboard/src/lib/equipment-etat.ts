export type EquipmentEtat = "En marche" | "En avertissement" | "En panne";

const ETAT_ALIASES: Record<EquipmentEtat, string[]> = {
  "En marche": ["en marche", "marche", "en service", "service", "actif"],
  "En avertissement": ["en avertissement", "avertissement", "maintenance", "réparation", "reparation"],
  "En panne": ["en panne", "panne", "hors service", "hs", "arrêt", "arret"],
};

export function normalizeEquipmentEtat(etat: string): EquipmentEtat {
  const normalized = etat.trim().toLowerCase();

  for (const [state, aliases] of Object.entries(ETAT_ALIASES) as Array<
    [EquipmentEtat, string[]]
  >) {
    if (aliases.some((alias) => normalized.includes(alias))) {
      return state;
    }
  }

  return "En panne";
}

export const EQUIPMENT_ETATS: EquipmentEtat[] = [
  "En marche",
  "En avertissement",
  "En panne",
];
