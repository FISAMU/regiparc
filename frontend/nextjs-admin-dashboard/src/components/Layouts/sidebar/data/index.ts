/**
 * Configuration du menu latéral RegiParc.
 * Modifier ICI pour ajouter / retirer / réordonner les entrées de navigation.
 */
import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "TABLEAU DE BORD",
    items: [
      {
        title: "Accueil",
        url: "/",
        icon: Icons.HomeIcon,
        items: [],
      },
    ],
  },
  {
    label: "GESTION DU PARC",
    items: [
      {
        title: "Équipements",
        url: "/equipements",
        icon: Icons.Monitor,
        items: [],
      },
      {
        title: "Employés",
        url: "/employes",
        icon: Icons.User,
        items: [],
      },
      {
        title: "Services",
        url: "/services",
        icon: Icons.Building,
        items: [],
      },
      {
        title: "Catégories",
        url: "/categories",
        icon: Icons.Tag,
        items: [],
      },
    ],
  },
  {
    label: "OPÉRATIONS",
    items: [
      {
        title: "Affectations",
        url: "/affectations",
        icon: Icons.Swap,
        items: [],
      },
      {
        title: "Maintenances",
        url: "/maintenances",
        icon: Icons.Wrench,
        items: [],
      },
    ],
  },
  {
    label: "ADMINISTRATION",
    items: [
      {
        title: "Utilisateurs",
        url: "/administration/utilisateurs",
        icon: Icons.User,
        items: [],
      },
    ],
  },
];
