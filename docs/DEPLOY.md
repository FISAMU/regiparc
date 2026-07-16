# Déploiement RegiParc — étape par étape

**Stack gratuite (sans expiration)** :
- Backend Django → **Render** (free — s’endort après 15 min d’inactivité)
- Frontend Next.js → **Vercel** (free hobby)
- MySQL → **Aiven** (déjà en place)

---

## ÉTAPE 0 — Pousser le code sur GitHub

```powershell
cd "F:\PROJET DEV\RegiParc"
git add .
git commit -m "Config déploiement Render + Vercel"
git push
```

⚠️ Ne mets **jamais** de vrais mots de passe dans `env.render.example`.

---

## ÉTAPE 1 — Aiven (5 min)

1. Console Aiven → ton service MySQL
2. **Allowed IP addresses** → ajoute `0.0.0.0/0` (ou les IP Render)
3. Note : host, port, user, password, database name

---

## ÉTAPE 2 — Render backend (15 min)

1. https://dashboard.render.com → **New** → **Web Service**
2. Connecte GitHub compte **FISAMU** → repo **regiparc**
3. Configuration :

| Champ | Valeur |
|--------|--------|
| Root Directory | `backend` |
| Build Command | `chmod +x build.sh && ./build.sh` |
| Start Command | `gunicorn mon_backend.wsgi:application --bind 0.0.0.0:$PORT --workers 1 --threads 2 --timeout 120` |
| Plan | **Free** |

4. **Environment** : copie depuis `backend/env.render.example` (vraies valeurs)
5. **Deploy** → note l’URL : `https://XXXX.onrender.com`

Test (attends 30–60 s si service endormi) :  
`https://XXXX.onrender.com/api/lookups/`

---

## ÉTAPE 3 — Vercel frontend (10 min)

1. https://vercel.com → **Add New** → **Project**
2. Import **FISAMU/regiparc**
3. Root Directory : `frontend/nextjs-admin-dashboard`
4. Variable :
   ```
   NEXT_PUBLIC_API_URL=https://XXXX.onrender.com/api
   ```
5. **Deploy** → note l’URL : `https://YYYY.vercel.app`

---

## ÉTAPE 4 — Relier frontend ↔ backend

Sur **Render** → Environment, mets à jour :
```
CORS_ALLOWED_ORIGINS=https://YYYY.vercel.app
CSRF_TRUSTED_ORIGINS=https://YYYY.vercel.app
```
Puis **Manual Deploy**.

Test : ouvre `https://YYYY.vercel.app` → connexion admin.

---

## Mises à jour futures

```powershell
git add .
git commit -m "Description"
git push
```
Render et Vercel redéploient automatiquement.
