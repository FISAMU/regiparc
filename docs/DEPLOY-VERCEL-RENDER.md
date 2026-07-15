# Déploiement RegiParc — Vercel (frontend) + Render (backend)

Gratuit, plus simple qu’Oracle. Limite Render : le backend **s’endort après ~15 min** sans trafic (le 1er appel peut prendre ~30–60 s).

```
Navigateur
    │
    ▼
Vercel (Next.js)  ──API──►  Render (Django)  ──►  MySQL Aiven
```

---

## 0. Prérequis

1. Repo GitHub : https://github.com/FISAMU/regiparc  
2. Compte [Render](https://render.com)  
3. Compte [Vercel](https://vercel.com) (connexion GitHub)  
4. Accès MySQL Aiven + email Gmail (optionnel pour reset MDP)

**Pousse d’abord le code à jour** depuis ton PC :

```powershell
cd "F:\PROJET DEV\RegiParc"
git add .
git commit -m "Config déploiement Vercel + Render"
git push
```

---

## 1. Backend sur Render

### Créer le service

1. https://dashboard.render.com → **New** → **Web Service**
2. Connecte le repo **FISAMU/regiparc**
3. Réglages :

| Champ | Valeur |
|--------|--------|
| Name | `regiparc-api` |
| Region | Frankfurt (ou proche) |
| Root Directory | `backend` |
| Runtime | Python |
| Build Command | `chmod +x build.sh && ./build.sh` |
| Start Command | `gunicorn mon_backend.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120` |
| Instance | **Free** |

### Variables d’environnement (Environment)

Ajoute (comme dans ton `.env` local, **sans** le fichier `.env`) :

| Key | Exemple / note |
|-----|----------------|
| `DEBUG` | `False` |
| `SECRET_KEY` | génère une longue chaîne aléatoire |
| `ALLOWED_HOSTS` | `regiparc-api.onrender.com` *(remplace par ton hostname Render)* |
| `CORS_ALLOWED_ORIGINS` | *(à remplir après Vercel, ex. `https://regiparc.vercel.app`)* |
| `CSRF_TRUSTED_ORIGINS` | même URL Vercel `https://...` |
| `DB_NAME` | ton DB Aiven |
| `DB_USER` | |
| `DB_PASSWORD` | |
| `DB_HOST` | |
| `DB_PORT` | |
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_USE_TLS` | `True` |
| `EMAIL_HOST_USER` | |
| `EMAIL_HOST_PASSWORD` | mot de passe d’application |
| `DEFAULT_FROM_EMAIL` | |

Pour démarrer rapidement, tu peux mettre temporairement :

```text
CORS_ALLOWED_ORIGINS=http://localhost:3000
CSRF_TRUSTED_ORIGINS=http://localhost:3000
```

puis mettre à jour dès que Vercel te donne l’URL.

### Aiven

Dans Aiven → firewall / allowed IPs : autorise **`0.0.0.0/0`** (ou les IP Render) sinon la DB refuse Render.

### Déployer

Clique **Deploy**. Note l’URL, ex. :

```text
https://regiparc-api.onrender.com
```

Test : `https://regiparc-api.onrender.com/api/` (ou `/api/lookups/` si auth requise).

L’admin Django : `https://regiparc-api.onrender.com/super/`

---

## 2. Frontend sur Vercel

1. https://vercel.com → **Add New** → **Project**
2. Importe **FISAMU/regiparc**
3. Réglages :

| Champ | Valeur |
|--------|--------|
| Framework | Next.js (détecté) |
| Root Directory | `frontend/nextjs-admin-dashboard` |
| Build Command | `npm run build` (défaut) |
| Output | défaut |

### Variable d’environnement

| Key | Value |
|-----|--------|
| `NEXT_PUBLIC_API_URL` | `https://regiparc-api.onrender.com/api` |

*(adapte le hostname Render exact)*

4. **Deploy**

Tu obtiens une URL du type :

```text
https://regiparc-xxxxx.vercel.app
```

---

## 3. Recoller CORS (important)

Retour sur **Render** → Environment, mets à jour :

```text
CORS_ALLOWED_ORIGINS=https://regiparc-xxxxx.vercel.app
CSRF_TRUSTED_ORIGINS=https://regiparc-xxxxx.vercel.app
```

Puis **Manual Deploy** → **Deploy latest commit** (ou “Save” qui redéploie).

Sans ça, le login depuis Vercel échoue (erreur CORS navigateur).

---

## 4. Vérification

1. Ouvre l’URL Vercel  
2. Connecte-toi avec un compte admin  
3. Si le 1er chargement est long → normal (réveil Render free)

---

## 5. Mises à jour après modification

```powershell
git add .
git commit -m "Description du changement"
git push
```

Vercel et Render redéploient souvent **automatiquement** depuis `main`.

---

## Problèmes fréquents

| Problème | Solution |
|----------|----------|
| CORS error | `CORS_ALLOWED_ORIGINS` = URL exacte Vercel (https, sans slash final) |
| DB connection refused | Autoriser IP dans Aiven |
| Render “sleep” | Attendre 30–60 s au premier hit |
| Build Vercel fail | Root Directory = `frontend/nextjs-admin-dashboard` |
| API 404 | `NEXT_PUBLIC_API_URL` doit finir par `/api` |

---

## Fichiers utiles dans le repo

- `backend/Procfile` — start Gunicorn  
- `backend/build.sh` — install + migrate + collectstatic  
- `render.yaml` — blueprint optionnel  
- `frontend/nextjs-admin-dashboard/vercel.json`
