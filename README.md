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

## Email / reset mot de passe

Render **free bloque le SMTP** (port 587) → timeout Gmail.

Solution : **Resend** (API HTTPS, gratuit) :

1. Compte sur https://resend.com  
2. Créer une API Key  
3. Sur Render → Environment :
   ```
   RESEND_API_KEY=re_xxxx
   RESEND_FROM_EMAIL=RegiParc <onboarding@resend.dev>
   DEFAULT_FROM_EMAIL=RegiParc <onboarding@resend.dev>
   ```
4. Redeploy, puis tester forgot-password

Note : avec `onboarding@resend.dev`, Resend envoie surtout vers l’email de ton compte Resend. Pour d’autres destinataires, vérifie un domaine dans Resend.

## Sécurité

- Ne **jamais** pousser `backend/.env` ni `frontend/.../.env.local`
- Utiliser `.env.example` comme modèle
