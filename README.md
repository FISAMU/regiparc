# RegiParc

Gestion du parc informatique — API Django + dashboard Next.js.

## Démarrer en local

Guide structure : [`frontend/nextjs-admin-dashboard/README.md`](./frontend/nextjs-admin-dashboard/README.md)

### Backend
```bash
cd backend
.\.venv\Scripts\activate
# Copier .env.example → .env
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend/nextjs-admin-dashboard
npm install
# .env.local → NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
npm run dev
```

## Déploiement (Vercel + Render)

Guide : [`docs/DEPLOY-VERCEL-RENDER.md`](./docs/DEPLOY-VERCEL-RENDER.md)

| Partie | Hébergeur | Config |
|--------|-----------|--------|
| Frontend | Vercel | Root = `frontend/nextjs-admin-dashboard` |
| Backend | Render | Root = `backend` + env dans le dashboard |
| MySQL | Aiven | Déjà en place |

Exemple des variables Render : [`backend/env.render.example`](./backend/env.render.example)

## Sécurité

Ne jamais committer `backend/.env` ni secrets. Utiliser les fichiers `.example`.
