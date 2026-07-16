# RegiParc

Gestion du parc informatique (équipements, employés, maintenances, affectations) — API Django + dashboard Next.js.

## Démarrer

Voir le guide détaillé (structure complète) :

👉 [`frontend/nextjs-admin-dashboard/README.md`](./frontend/nextjs-admin-dashboard/README.md)

### Backend

```bash
cd backend
.\.venv\Scripts\activate   # Windows
# Copier .env.example → .env et renseigner les valeurs
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend/nextjs-admin-dashboard
npm install
# Créer .env.local avec NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
npm run dev
```

## Déploiement

Guide pas à pas : [`docs/DEPLOY.md`](./docs/DEPLOY.md) (Render + Vercel + Aiven)

## Sécurité

- Ne **jamais** pousser `backend/.env` ni `frontend/.../.env.local`
- Utiliser `.env.example` comme modèle
