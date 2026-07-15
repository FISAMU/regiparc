# RegiParc — Dashboard Admin (Frontend)

Interface d’administration **RegiParc** (gestion du parc informatique / équipements).  
Basée sur le template [NextAdmin](https://nextadmin.co/), adaptée pour parler à l’API Django (`backend/`).

> Ce document décrit la structure **complète** du monorepo RegiParc pour qu’un autre développeur sache où modifier quoi sans se perdre.

---

## Architecture globale

```
RegiParc/
├── backend/                          # API Django REST + MySQL
│   ├── manage.py
│   ├── .env                          # SECRETS — jamais sur GitHub
│   ├── .env.example                  # Modèle de variables (sans secrets)
│   ├── apps/                         # Application métier RegiParc
│   │   ├── models.py                 # Tables : Employé, Équipement, etc.
│   │   ├── serializers.py            # JSON in/out
│   │   ├── views.py                  # Endpoints API
│   │   ├── urls.py                   # Routes /api/...
│   │   ├── pagination.py
│   │   ├── presence.py               # Online / heartbeat
│   │   ├── admin.py
│   │   └── migrations/               # Historique schéma DB
│   └── mon_backend/                  # Config projet Django
│       ├── settings.py               # DB, CORS, email, DRF
│       ├── urls.py                   # Inclut apps.urls sous /api/
│       ├── wsgi.py / asgi.py
│
└── frontend/
    └── nextjs-admin-dashboard/       # Ce projet Next.js (UI admin)
        ├── package.json
        ├── next.config.ts
        ├── src/
        │   ├── proxy.ts              # Garde auth (cookie auth_token)
        │   ├── app/                  # Pages (App Router)
        │   ├── components/           # UI réutilisable
        │   ├── services/             # Appels API métier
        │   ├── lib/                  # Client HTTP, helpers
        │   ├── hooks/
        │   ├── css/
        │   └── ...
        └── README.md                 # ← vous êtes ici
```

| Couche | Techno | Rôle |
|--------|--------|------|
| Frontend | Next.js 16 + React 19 + Tailwind 4 | Pages admin, auth UI |
| Backend | Django + Django REST Framework | API JSON, auth token, logique métier |
| Base | MySQL (ex. Aiven) | Persistance |
| Auth | DRF Token + cookie `auth_token` | Session admin (staff) |

---

## Démarrage rapide

### 1. Backend

```bash
cd backend
# Activer le venv Windows :
.\.venv\Scripts\activate

# Copier et remplir les variables (voir .env.example)
# Puis :
python manage.py migrate
python manage.py runserver
```

API : `http://127.0.0.1:8000/api/`

### 2. Frontend

```bash
cd frontend/nextjs-admin-dashboard
npm install

# Créer .env.local (voir section Variables d'environnement)
npm run dev
```

UI : `http://localhost:3000`  
Dev = `next dev --webpack` (évite un crash Turbopack connu sur ce projet).

---

## Variables d’environnement

### Frontend — `.env.local`

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

### Backend — `.env` (ne jamais committer)

Voir `backend/.env.example` : `SECRET_KEY`, MySQL (`DB_*`), SMTP Gmail pour reset mot de passe.

---

## Structure détaillée du frontend (`src/`)

### `src/app/` — Routes (App Router)

| Chemin | Rôle |
|--------|------|
| `(with-layout)/` | Pages avec sidebar + header (espace connecté) |
| `(with-layout)/(home)/` | Tableau de bord (cartes, graphiques, synthèse) |
| `(with-layout)/employes/` | Liste / nouveau / détail employés |
| `(with-layout)/equipements/` | Liste / nouveau / détail équipements |
| `(with-layout)/services/` | Services organisationnels |
| `(with-layout)/categories/` | Catégories d’équipements |
| `(with-layout)/affectations/` | Affectations équipement ↔ employé |
| `(with-layout)/maintenances/` | Maintenances + coûts |
| `(with-layout)/administration/utilisateurs/` | Gestion des comptes admin |
| `(with-layout)/profile/` | Profil + photo (≤ 5 Mo) |
| `(without-layout)/auth/sign-in` | Connexion |
| `(without-layout)/auth/forgot-password` | Mot de passe oublié (email + code) |
| `(without-layout)/auth/sign-up` | Inscription (template) |

Pages template NextAdmin encore présentes (`forms/`, `charts/`, `ui-elements/`, `calendar/`, `tables/`) — **hors cœur métier RegiParc**.

### `src/services/` — Appels à l’API Django

| Fichier | API |
|---------|-----|
| `auth.service.ts` | login / logout / reset password / stockage token |
| `me.service.ts` | profil connecté + photo |
| `users.service.ts` | CRUD utilisateurs admin |
| `employes.service.ts` | employés |
| `equipements.service.ts` | équipements |
| `services.service.ts` | services |
| `categories.service.ts` | catégories |
| `affectations.service.ts` | affectations |
| `maintenances.service.ts` | maintenances |
| `dashboard.service.ts` | stats accueil |
| `notifications.service.ts` | notifications header |
| `search.service.ts` | recherche globale |
| `charts.services.ts` | charts template (legacy) |

**Règle :** une page ne parle presque jamais à `fetch` brut — elle passe par un service.

### `src/lib/` — Utilitaires

| Fichier / dossier | Rôle |
|-------------------|------|
| `api/client.ts` | `fetch` avec token Authorization |
| `api/endpoints.ts` | URLs centralisées |
| `api/types.ts` | Types TypeScript des entités |
| `api/pagination.ts` | Helpers pages DRF |
| `table-search.ts` | Filtre `?q=` sur listes |
| `format-currency.ts` | Affichage CDF / USD |
| `equipment-etat.ts` | États équipement |
| `auth/` + `prisma` | Restes template BetterAuth — **auth réelle = Django** |

### `src/components/`

| Dossier | Rôle |
|---------|------|
| `Auth/` | Formulaires connexion / fond / Google (template) |
| `Layouts/sidebar/` | Menu RegiParc (`data/index.ts`) |
| `Layouts/header/` | Recherche, user, notifications, heartbeat |
| `FormElements/` | Inputs (ex. œil mot de passe dans `InputGroup`) |
| `ui/` | Table, pagination, badge, skeleton |
| `route-change-spinner.tsx` | Overlay chargement navigation |

### `src/proxy.ts`

Middleware Next : si pas de cookie `auth_token` → redirect `/auth/sign-in`.  
Chemins publics : sign-in, sign-up, forgot-password, assets.

---

## Structure détaillée du backend (`apps/`)

### Modèles (`models.py`)

| Modèle | Description |
|--------|-------------|
| `Service` | Unité / localisation |
| `Categorie` | Type d’équipement |
| `Employe` | Agent (fonction texte + FK service) |
| `Equipement` | Matériel inventorié (état, valeur, liens) |
| `Affectation` | Historique d’affectation |
| `Maintenance` | Intervention + coût + devise |
| `UserProfile` | Photo + `last_seen` (lié à `User` Django) |
| `PasswordResetCode` | Code 6 chiffres reset MDP |

### Routes API (`urls.py` → préfixe `/api/`)

| Endpoint | Usage |
|----------|-------|
| `POST /login/` `POST /logout/` | Auth token |
| `POST /password-reset/request\|verify\|confirm/` | Reset MDP |
| `GET\|POST /employes/` + `/employes/<uuid>/` | CRUD |
| Idem pour `categories`, `services`, `equipements`, `affectations`, `maintenances` | CRUD |
| `GET /dashboard/` `GET /dashboard/overview/` | Stats |
| `GET\|PATCH /users/me/` + `heartbeat/` | Profil / présence |
| `GET\|POST /users/` + `/users/<id>/` | Admins (droits superuser) |
| `GET /search/` `GET /notifications/` | Header |

### Règles métier importantes

- Seuls les utilisateurs **`is_staff`** se connectent à l’admin.
- Un admin **simple** ne voit / modifie / supprime **pas** les **superusers**.
- Seul un **superuser** crée des utilisateurs et attribue droits admin / superuser.
- Listes ordonnées par `dateCreation` croissante (plus récent en bas).
- Coût estimé dashboard = somme des `Maintenance.Cout` (par devise).

---

## Où modifier quoi ? (guide express)

| Besoin | Où aller |
|--------|----------|
| Ajouter un menu | `components/Layouts/sidebar/data/index.ts` |
| Nouvelle page UI | `app/(with-layout)/.../page.tsx` + service |
| Nouvel endpoint API | `backend/apps/views.py` + `urls.py` (+ serializer/model si besoin) |
| Changer un champ DB | `models.py` → `makemigrations` → `migrate` |
| Text header | `header-search.tsx` + `lib/table-search.ts` |
| Login / session | `auth.service.ts` + `SigninWithPassword.tsx` + `proxy.ts` |
| Email reset MDP | `backend/.env` (SMTP) + vues password-reset |
| Styles globaux | `src/css/style.css` |
| Config Django | `mon_backend/settings.py` |

---

## Flux auth (résumé)

1. Login → `POST /api/login/` → token DRF  
2. Token stocké : `localStorage` (se souvenir 30 j) ou `sessionStorage`  
3. Cookie `auth_token` pour le `proxy` Next  
4. Chaque appel API : header `Authorization: Token …` via `lib/api/client.ts`  
5. Logout → invalidate token + clear storage/cookie  

---

## Conventions pour contributeurs

1. **Ne jamais committer** `.env`, `.env.local`, `.venv/`, `node_modules/`, `.next/`.
2. Préférer services frontend + serializers/views backend existants.
3. Garder les messages UI en **français**.
4. Après changement de modèle : migrations Django avant push.
5. Tester login + une page liste + dashboard après gros changements.

---

## Template NextAdmin (référence amont)

UI issue de NextAdmin v1.3.x. Docs amont :  
https://nextadmin.co/docs — utile pour composants UI génériques uniquement.

---

## Licence / usage

Projet métier RegiParc. Ne pas publier secrets (DB, Gmail, `SECRET_KEY`) sur un dépôt public.
