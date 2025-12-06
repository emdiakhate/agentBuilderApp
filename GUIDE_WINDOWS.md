# 🚀 Guide Démarrage Rapide - Windows + Docker Desktop

## ✅ Pré-requis
- [x] Docker Desktop installé (tu l'as déjà ✅)
- [x] Git installé
- [x] VS Code (optionnel mais recommandé)

---

## 📝 ÉTAPE 1 : Vérifier que Docker Desktop tourne

### 1.1 Lance Docker Desktop
- Ouvre Docker Desktop depuis le menu Démarrer
- Attends que l'icône Docker dans la barre des tâches devienne verte
- Tu dois voir : **"Docker Desktop is running"**

### 1.2 Vérifie l'installation
Ouvre **PowerShell** ou **CMD** :
```powershell
docker --version
docker compose version
```

Tu dois voir quelque chose comme :
```
Docker version 24.x.x
Docker Compose version v2.x.x
```

✅ Si tu vois ça, c'est bon ! Passe à l'étape 2.

❌ Si erreur : Redémarre Docker Desktop et réessaye.

---

## 📁 ÉTAPE 2 : Clone le projet (si pas déjà fait)

### Option A : Si tu l'as déjà cloné
```powershell
# Va dans le dossier
cd C:\Users\TonNom\Documents\agentBuilderApp
```

### Option B : Si tu dois le cloner
```powershell
# Va où tu veux le mettre
cd C:\Users\TonNom\Documents

# Clone
git clone https://github.com/emdiakhate/agentBuilderApp.git

# Entre dedans
cd agentBuilderApp
```

---

## 🔑 ÉTAPE 3 : Configure ta clé OpenAI

### 3.1 Va dans le dossier backend
```powershell
cd backend
```

### 3.2 Ouvre le fichier .env
```powershell
# Option 1 : Avec Notepad
notepad .env

# Option 2 : Avec VS Code
code .env
```

### 3.3 Ajoute ta clé OpenAI
Modifie cette ligne dans le fichier `.env` :
```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxx  # ⬅️ Mets ta vraie clé ici
```

**Important :** Remplace `sk-proj-xxxxxxxxx` par ta vraie clé OpenAI.

### 3.4 Sauvegarde et ferme
- Dans Notepad : **Fichier → Enregistrer**
- Dans VS Code : **Ctrl + S**

---

## 🐳 ÉTAPE 4 : Lance Docker Compose

### 4.1 Assure-toi d'être dans le dossier backend
```powershell
# Vérifie où tu es
pwd

# Tu dois être dans : C:\Users\TonNom\...\agentBuilderApp\backend
# Si non :
cd backend
```

### 4.2 Lance tous les services
```powershell
docker compose up -d
```

**Explication :**
- `docker compose` = commande Docker Compose
- `up` = démarre les services
- `-d` = en arrière-plan (détaché)

### 4.3 Attends le téléchargement (première fois seulement)
La première fois, Docker va télécharger :
- PostgreSQL (~50 MB)
- Qdrant (~150 MB)
- Python + dépendances (~500 MB)

**Temps estimé : 5-10 minutes** selon ta connexion.

Tu verras :
```
[+] Running 3/3
 ✔ Network agent_network        Created
 ✔ Container agent_postgres     Started
 ✔ Container agent_qdrant       Started
 ✔ Container agent_backend      Started
```

✅ **C'est prêt !**

---

## ✅ ÉTAPE 5 : Vérifie que tout tourne

### 5.1 Vérifie les containers
```powershell
docker compose ps
```

Tu dois voir :
```
NAME             STATUS         PORTS
agent_postgres   Up (healthy)   0.0.0.0:5432->5432/tcp
agent_qdrant     Up (healthy)   0.0.0.0:6333->6333/tcp
agent_backend    Up             0.0.0.0:8000->8000/tcp
```

✅ Si tous sont **"Up"** ou **"healthy"**, c'est bon !

### 5.2 Teste l'API dans le navigateur

Ouvre dans ton navigateur :
```
http://localhost:8000/docs
```

✅ **Tu dois voir l'interface Swagger de l'API !**

### 5.3 Teste le health check
```
http://localhost:8000/health
```

Tu dois voir du JSON :
```json
{
  "status": "healthy",
  "database": "connected",
  "version": "0.1.0"
}
```

---

## 🎯 ÉTAPE 6 : Premier test de l'API

### 6.1 Va sur Swagger
Ouvre http://localhost:8000/docs

### 6.2 Crée un compte
1. Trouve **POST /api/auth/signup**
2. Clique dessus → **"Try it out"**
3. Entre :
```json
{
  "email": "test@test.com",
  "password": "test123",
  "full_name": "Test User"
}
```
4. Clique **"Execute"**
5. ✅ Tu dois recevoir un code **201** avec les détails du user

### 6.3 Connecte-toi
1. Trouve **POST /api/auth/login**
2. Clique dessus → **"Try it out"**
3. Entre :
   - **username** : `test@test.com`
   - **password** : `test123`
4. Clique **"Execute"**
5. ✅ Tu reçois un **access_token** !

**Copie ce token !** (Exemple : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 6.4 Autorise-toi dans Swagger
1. En haut à droite, clique sur **🔒 Authorize**
2. Entre : `Bearer TON_TOKEN_ICI`
3. Clique **"Authorize"** puis **"Close"**

### 6.5 Crée ton premier agent
1. Trouve **POST /api/agents**
2. Clique dessus → **"Try it out"**
3. Entre :
```json
{
  "name": "Mon Premier Agent",
  "description": "Agent de test",
  "type": "Customer Service",
  "llm_provider": "openai",
  "model": "gpt-4o-mini"
}
```
4. Clique **"Execute"**
5. ✅ Code **201** → Agent créé !

---

## 📊 ÉTAPE 7 : Voir ce qui tourne (Docker Desktop)

### 7.1 Ouvre Docker Desktop
- Tu verras 3 containers qui tournent :
  - `agent_postgres` (base de données)
  - `agent_qdrant` (vector database)
  - `agent_backend` (API Python)

### 7.2 Voir les logs
Dans Docker Desktop :
- Clique sur un container
- Tu verras les logs en temps réel

**OU** en ligne de commande :
```powershell
# Tous les logs
docker compose logs -f

# Juste le backend
docker compose logs -f backend
```

Pour sortir : **Ctrl + C**

---

## 🛑 COMMANDES UTILES

### Arrêter les services
```powershell
docker compose down
```

### Redémarrer les services
```powershell
docker compose restart
```

### Tout supprimer (containers + données)
```powershell
# ⚠️ ATTENTION : Ça supprime TOUT (base de données aussi)
docker compose down -v
```

### Rebuilder après modification du code
```powershell
docker compose up -d --build
```

### Voir les logs en direct
```powershell
docker compose logs -f backend
```

---

## 🐛 PROBLÈMES COURANTS

### ❌ "Error: port 5432 already in use"
**Solution :**
```powershell
# Arrête PostgreSQL local si installé
# OU change le port dans docker-compose.yml :
# ports: - "5433:5432"  # utilise 5433 au lieu de 5432
```

### ❌ "Docker Desktop is not running"
**Solution :**
1. Lance Docker Desktop
2. Attends qu'il soit vert
3. Réessaye `docker compose up -d`

### ❌ "Cannot connect to the Docker daemon"
**Solution :**
1. Redémarre Docker Desktop
2. Si ça persiste : Redémarre Windows

### ❌ "Error: permission denied"
**Solution :**
1. Lance PowerShell **en tant qu'Administrateur**
2. Réessaye

### ❌ "Module 'app.main' not found"
**Solution :**
```powershell
# Rebuild l'image
docker compose down
docker compose up -d --build
```

### ❌ "OPENAI_API_KEY not configured"
**Solution :**
1. Vérifie que tu as bien modifié `.env`
2. Redémarre : `docker compose restart backend`

---

## 🎉 C'EST PRÊT !

Si tu es arrivé jusqu'ici et que tout fonctionne :
✅ Backend API : http://localhost:8000/docs
✅ Qdrant Dashboard : http://localhost:6333/dashboard
✅ PostgreSQL : localhost:5432

**Tu peux maintenant :**
1. Créer des agents
2. Uploader des documents
3. Tester l'API

---

## 📞 Besoin d'aide ?

**Dis-moi où tu bloques et je t'aide !**

Exemples :
- "J'ai une erreur quand je fais docker compose up"
- "Mon container agent_backend ne démarre pas"
- "Je ne vois pas l'interface Swagger"

**Copie-colle le message d'erreur et je te dis comment le résoudre !**
