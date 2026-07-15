# Déploiement RegiParc sur Oracle Cloud (Always Free)

Ce guide déploie **frontend + backend** sur **une seule VM Always Free** avec Docker.  
La base MySQL reste chez **Aiven** (ou un autre MySQL distant).

Stack :
- `nginx` (port 80) → reverse proxy
- `frontend` (Next.js)
- `backend` (Django + Gunicorn)

---

## 0. Prérequis

1. Compte [Oracle Cloud](https://www.oracle.com/cloud/free/) (Always Free)
2. Projet déjà sur GitHub : `https://github.com/FISAMU/regiparc`
3. Accès MySQL Aiven (hôte, user, password) + SMTP Gmail si reset MDP

> Crée le compte avec une carte bancaire (validation Oracle) — le Always Free n’est en principe **pas facturé** si tu restes dans les limites.

---

## 1. Créer la VM Always Free

1. Console Oracle → **Compute** → **Instances** → **Create instance**
2. Name : `regiparc`
3. Image : **Canonical Ubuntu 22.04** (ou 24.04)
4. Shape : **VM.Standard.A1.Flex** (Ampere) — Always Free  
   - Ex. **2 OCPU** / **12 GB RAM** (confortable pour Docker)
5. Networking : garde le VCN par défaut + **Assign a public IPv4 address**
6. SSH keys : **Generate** ou colle ta clé publique  
   → télécharge la clé privée `.key` et garde-la
7. **Create**

Note l’**IP publique** (ex. `132.145.12.34`).

### Ouvrir les ports (Security List)

**Networking** → ton VCN → **Security Lists** → Default → **Add Ingress Rules** :

| Source | IP Protocol | Destination Port |
|--------|-------------|------------------|
| `0.0.0.0/0` | TCP | `22` |
| `0.0.0.0/0` | TCP | `80` |
| `0.0.0.0/0` | TCP | `443` (optionnel, plus tard pour HTTPS) |

---

## 2. Connexion SSH

Sous Windows (PowerShell), place ta clé privée puis :

```powershell
ssh -i "C:\chemin\vers\ssh-key.key" ubuntu@IP_PUBLIQUE
```

Si permission denied sur la clé :

```powershell
icacls "C:\chemin\vers\ssh-key.key" /inheritance:r
icacls "C:\chemin\vers\ssh-key.key" /grant:r "$($env:USERNAME):(R)"
```

---

## 3. Installer Docker sur la VM

Sur la VM Ubuntu :

```bash
sudo apt update
sudo apt install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker ubuntu
```

Déconnecte-toi / reconnecte-toi (`exit` puis nouveau `ssh`) pour que le groupe `docker` soit actif.

Vérifie :

```bash
docker --version
docker compose version
```

---

## 4. Cloner RegiParc et configurer

```bash
cd ~
git clone https://github.com/FISAMU/regiparc.git
cd regiparc
cp .env.production.example .env.production
nano .env.production
```

Remplace **toutes** les valeurs :

- `SECRET_KEY` → longue chaîne aléatoire
- `PAR_TON_IP_OU_DOMAINE` → ton IP publique Oracle (ex. `132.145.12.34`)
- `DB_*` → tes identifiants Aiven
- `EMAIL_*` → ton Gmail + mot de passe d’application

Exemple d’extraits :

```env
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,132.145.12.34
CORS_ALLOWED_ORIGINS=http://132.145.12.34
CSRF_TRUSTED_ORIGINS=http://132.145.12.34
NEXT_PUBLIC_API_URL=/api
```

Sauvegarde : `Ctrl+O`, Entrée, `Ctrl+X`.

---

## 5. Lancer l’application

```bash
cd ~/regiparc
docker compose up -d --build
```

Le premier build peut prendre **10–20 minutes** (Next.js + dépendances).

Suivre les logs :

```bash
docker compose logs -f
```

Quand c’est prêt, ouvre dans le navigateur :

```
http://IP_PUBLIQUE/
```

- UI : `/`
- API : `/api/...`
- Admin Django : `/super/`

---

## 6. Commandes utiles

```bash
# Statut
docker compose ps

# Redémarrer
docker compose restart

# Mettre à jour après un git push
cd ~/regiparc
git pull
docker compose up -d --build

# Logs backend seulement
docker compose logs -f backend
```

---

## 7. HTTPS (optionnel mais recommandé)

Quand tu auras un **nom de domaine** pointant vers l’IP Oracle :

1. Mets à jour `ALLOWED_HOSTS` / `CORS` / `CSRF` avec `https://ton-domaine`
2. Installe Certbot + nginx SSL, **ou** ajoute un service Caddy  
3. Rouvre le port `443`

(Sans domaine, HTTP sur l’IP suffit pour un test école.)

---

## 8. Problèmes fréquents

| Symptôme | Cause probable | Action |
|----------|----------------|--------|
| Timeout navigateur | Port 80 fermé | Security List ingress TCP 80 |
| API KO / CORS | IP mal mise dans `.env.production` | Rechecker CORS + rebuild |
| Backend crash MySQL | Aiven : IP Oracle non autorisée | Autoriser l’IP publique Oracle dans Aiven |
| Build Next échoue | RAM insuffisante | Augmente les OCPU/RAM A1 Flex (Always Free jusqu’à 4 OCPU / 24 Go partagés) |
| `Permission denied` docker | Groupe docker | Relog SSH après `usermod` |

**Aiven firewall** : dans la console Aiven, autorise l’IP publique de ta VM Oracle (ou `0.0.0.0/0` temporairement pour tester).

---

## Architecture

```
Internet
   │
   ▼
Oracle VM :80 (nginx)
   ├── /        → frontend :3000 (Next.js)
   ├── /api/    → backend  :8000 (Django/Gunicorn)
   └── /super/  → backend  :8000 (admin)
                    │
                    ▼
                 MySQL Aiven
```

Fichiers du dépôt liés au déploiement :

- `docker-compose.yml`
- `backend/Dockerfile`
- `frontend/nextjs-admin-dashboard/Dockerfile`
- `deploy/nginx/default.conf`
- `.env.production.example`
