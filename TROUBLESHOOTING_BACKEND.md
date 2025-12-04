# 🔧 Troubleshooting Backend Container Not Starting

## Problème actuel
Le container `agent_backend` n'apparaît pas dans `docker compose ps` et `docker logs agent_backend` ne renvoie rien.

---

## 🔍 ÉTAPE 1 : Vérifier si le build échoue

### Commande à lancer (PowerShell dans backend/)
```powershell
docker compose build backend
```

### Ce que tu dois voir
Si tout va bien :
```
[+] Building 45.3s (12/12) FINISHED
 => [internal] load build definition from Dockerfile
 => => transferring dockerfile: 576B
 => [internal] load .dockerignore
 => ...
 => => naming to docker.io/library/backend-backend
```

### Si erreur
Tu verras un message d'erreur comme :
- `ERROR: failed to solve: ...`
- `ERROR: Could not find a version that satisfies...`
- `ERROR: No matching distribution found...`

**📋 Copie-colle l'erreur complète ici si tu en vois une !**

---

## 🔍 ÉTAPE 2 : Vérifier les logs de build complets

### Commande
```powershell
docker compose up backend --build
```

### Ce que ça fait
- Rebuild le container
- Lance le backend
- **Montre les logs en temps réel** (c'est ce qu'on veut !)

### Ce que tu devrais voir si ça marche
```
agent_backend  | INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
agent_backend  | INFO:     Started reloader process
agent_backend  | INFO:     Started server process
agent_backend  | INFO:     Waiting for application startup.
agent_backend  | Starting up application...
agent_backend  | Database initialized
agent_backend  | Qdrant vector store ready
```

### Erreurs courantes

#### Erreur A : "ModuleNotFoundError: No module named 'app'"
**Cause :** Structure du projet incorrecte

**Solution :**
```powershell
# Vérifie que tu es bien dans backend/
pwd

# Vérifie que app/ existe
dir app
```

#### Erreur B : "Could not connect to database"
**Cause :** PostgreSQL n'est pas accessible

**Solution :**
```powershell
# Vérifie que postgres est bien healthy
docker compose ps

# Si postgres n'est pas "healthy", attends 30 secondes
docker compose restart postgres
```

#### Erreur C : "OPENAI_API_KEY not found" ou similaire
**Cause :** Variables d'environnement manquantes

**Note :** Normalement ce n'est PAS bloquant (les clés sont optionnelles au démarrage)

**Mais si ça bloque, vérifie ton .env :**
```powershell
notepad .env
```

Assure-toi d'avoir AU MOINS :
```
OPENAI_API_KEY=sk-proj-xxxxx
```

#### Erreur D : "Port 8000 is already in use"
**Cause :** Un autre programme utilise le port 8000

**Solution Option 1 :** Arrête le programme qui utilise le port
```powershell
# Trouve ce qui utilise le port 8000
netstat -ano | findstr :8000

# Note le PID (dernier nombre) puis :
taskkill /PID <le_numero_pid> /F
```

**Solution Option 2 :** Change le port dans docker-compose.yml
Ouvre `backend/docker-compose.yml` et change :
```yaml
ports:
  - "8001:8000"  # Utilise 8001 au lieu de 8000
```

---

## 🔍 ÉTAPE 3 : Vérifier que le Dockerfile est bien présent

### Commande
```powershell
dir Dockerfile
dir requirements.txt
dir app
```

### Tu dois voir
```
Dockerfile
requirements.txt
app (Directory)
```

Si un fichier manque, dis-le moi !

---

## 🔍 ÉTAPE 4 : Nettoyer et recommencer

Si rien ne fonctionne, essaye un clean complet :

### Commande
```powershell
# Arrête tout
docker compose down

# Supprime les containers et images
docker compose down --rmi all

# Rebuild from scratch
docker compose up --build
```

---

## 🔍 ÉTAPE 5 : Vérifier les containers existants

### Commande
```powershell
docker ps -a | Select-String "backend"
```

### Ce que ça fait
Montre TOUS les containers backend (même arrêtés)

Si tu vois un container avec status "Exited", c'est qu'il a démarré puis crashé.

### Dans ce cas, regarde les logs
```powershell
docker logs <container_id>
```

---

## 📝 CE QUE JE DOIS SAVOIR

Pour t'aider, copie-colle les résultats de ces commandes :

### 1. Status des containers
```powershell
docker compose ps
```

### 2. Logs de build
```powershell
docker compose build backend 2>&1
```

### 3. Logs au démarrage
```powershell
docker compose up backend
```

Laisse tourner quelques secondes puis fais **Ctrl+C** et copie-colle tout ce que tu vois.

### 4. Vérification de la structure
```powershell
dir
dir app
```

---

## 🎯 PLAN D'ACTION RECOMMANDÉ

**Fais ces commandes dans l'ordre :**

```powershell
# 1. Va dans le bon dossier
cd C:\Users\LENOVO\Documents\agentBuilderApp\backend

# 2. Vérifie la structure
dir

# 3. Essaye de rebuild
docker compose build backend

# 4. Si le build marche, démarre avec logs
docker compose up backend
```

**Copie-colle les résultats ici et je t'aiderai !**

---

## 🆘 SI RIEN NE MARCHE

Si vraiment rien ne fonctionne après tout ça :

1. Copie-colle **TOUS** les messages d'erreur que tu vois
2. Copie-colle le résultat de `docker compose ps`
3. Copie-colle le résultat de `docker compose build backend`
4. Copie-colle le contenu de ton `.env` (sans les vraies clés API bien sûr !)

Et on trouvera la solution ! 🚀
