# 🛠️ Guide d'Installation - Agent Builder Backend

## Avant de commencer

Tu vas avoir besoin d'installer plusieurs outils sur **ta machine locale** pour faire tourner le backend.

---

## 📋 Ce qu'il faut installer

### ✅ Obligatoire
1. **Git** - Pour cloner le projet
2. **Docker Desktop** - Pour lancer PostgreSQL, Qdrant et le backend
3. **Un éditeur de code** - VS Code recommandé

### 🔧 Optionnel (pour dev sans Docker)
4. **Python 3.11+** - Si tu veux développer en local sans Docker
5. **PostgreSQL** - Si tu veux une DB locale sans Docker

---

## 🖥️ Installation selon ton système

### 🪟 Windows

#### 1. Installer Git
```
Télécharge : https://git-scm.com/download/win
Installe avec les options par défaut
Vérifie : ouvre PowerShell et tape "git --version"
```

#### 2. Installer Docker Desktop
```
1. Télécharge : https://www.docker.com/products/docker-desktop/
2. Installe Docker Desktop for Windows
3. Redémarre ton PC
4. Lance Docker Desktop
5. Vérifie : ouvre PowerShell et tape "docker --version"
```

**Important pour Windows :**
- Active WSL 2 si demandé (Windows Subsystem for Linux)
- Docker Desktop doit tourner en arrière-plan

#### 3. Installer VS Code (recommandé)
```
Télécharge : https://code.visualstudio.com/
Installe avec les options par défaut
```

#### 4. (Optionnel) Installer Python 3.11
```
Télécharge : https://www.python.org/downloads/
Coche "Add Python to PATH" pendant l'installation
Vérifie : "python --version"
```

---

### 🍎 macOS

#### 1. Installer Homebrew (gestionnaire de paquets)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### 2. Installer Git
```bash
brew install git
git --version
```

#### 3. Installer Docker Desktop
**Option A : Via le site web**
```
1. Télécharge : https://www.docker.com/products/docker-desktop/
2. Installe le .dmg
3. Lance Docker Desktop
4. Vérifie : docker --version
```

**Option B : Via Homebrew**
```bash
brew install --cask docker
# Puis lance Docker Desktop depuis Applications
docker --version
```

#### 4. Installer VS Code
```bash
brew install --cask visual-studio-code
```

#### 5. (Optionnel) Installer Python 3.11
```bash
brew install python@3.11
python3 --version
```

---

### 🐧 Linux (Ubuntu/Debian)

#### 1. Installer Git
```bash
sudo apt update
sudo apt install git
git --version
```

#### 2. Installer Docker
```bash
# Installe Docker
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release

# Ajoute la clé GPG officielle de Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Configure le repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Installe Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Ajoute ton user au groupe docker (pour éviter sudo)
sudo usermod -aG docker $USER

# Redémarre la session ou fais :
newgrp docker

# Vérifie
docker --version
docker compose version
```

#### 3. Installer VS Code
```bash
sudo snap install code --classic
```

#### 4. (Optionnel) Installer Python 3.11
```bash
sudo apt install python3.11 python3.11-venv python3-pip
python3 --version
```

---

## ✅ Vérification de l'installation

Une fois tout installé, vérifie que tout fonctionne :

```bash
# Git
git --version
# Devrait afficher : git version 2.x.x

# Docker
docker --version
# Devrait afficher : Docker version 24.x.x ou plus

# Docker Compose
docker compose version
# Devrait afficher : Docker Compose version v2.x.x

# Python (optionnel)
python3 --version
# Devrait afficher : Python 3.11.x ou plus
```

---

## 🚀 Après l'installation - Récupérer le projet

### 1. Clone le projet

```bash
# Va dans le dossier où tu veux travailler
cd ~/Documents  # ou C:\Users\TonNom\Documents sur Windows

# Clone le repo
git clone https://github.com/emdiakhate/agentBuilderApp.git

# Entre dans le dossier
cd agentBuilderApp
```

### 2. Configure les clés API

```bash
# Va dans le dossier backend
cd backend

# Copie le fichier .env.example vers .env
cp .env.example .env

# Édite le fichier .env
# Windows : notepad .env
# Mac/Linux : nano .env
```

**Ajoute ta clé OpenAI :**
```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxx
```

### 3. Lance le backend

```bash
# Assure-toi d'être dans le dossier backend/
cd backend

# Lance tous les services (PostgreSQL, Qdrant, Backend)
docker compose up -d

# Vérifie que tout tourne
docker compose ps

# Tu devrais voir :
# ✓ agent_postgres  (healthy)
# ✓ agent_qdrant    (healthy)
# ✓ agent_backend   (running)
```

### 4. Teste l'API

Ouvre ton navigateur : http://localhost:8000/docs

Tu devrais voir l'interface Swagger de l'API ! 🎉

---

## 🐛 Problèmes courants

### Docker Desktop ne démarre pas (Windows)
```
Solution 1 : Active la virtualisation dans le BIOS
Solution 2 : Installe WSL 2
  - Ouvre PowerShell en admin
  - wsl --install
  - Redémarre
```

### "Permission denied" sur Linux
```bash
# Ajoute ton user au groupe docker
sudo usermod -aG docker $USER
newgrp docker
```

### Port 8000 déjà utilisé
```bash
# Trouve qui utilise le port
# Windows : netstat -ano | findstr :8000
# Mac/Linux : lsof -i :8000

# Arrête le processus ou change le port dans docker-compose.yml
```

### Problèmes de connexion DB
```bash
# Reset complet
docker compose down -v
docker compose up -d
```

---

## 📊 Alternatives si Docker ne marche pas

### Option : Installation locale (sans Docker)

Si Docker pose problème, tu peux installer tout en local :

#### 1. Installe PostgreSQL
**Windows :** https://www.postgresql.org/download/windows/
**Mac :** `brew install postgresql@16`
**Linux :** `sudo apt install postgresql-16`

#### 2. Installe Python et les dépendances
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### 3. Configure la DB
```bash
# Crée la base de données
psql postgres
CREATE DATABASE agent_saas_db;
CREATE USER agent_user WITH PASSWORD 'agent_password';
GRANT ALL PRIVILEGES ON DATABASE agent_saas_db TO agent_user;
\q
```

#### 4. Lance l'API
```bash
# Modifie .env
DATABASE_URL=postgresql://agent_user:agent_password@localhost:5432/agent_saas_db

# Lance
uvicorn app.main:app --reload
```

**Mais Docker est fortement recommandé** - c'est plus simple !

---

## 🎯 Récapitulatif - Ordre d'installation

1. ✅ Installe Git
2. ✅ Installe Docker Desktop
3. ✅ Vérifie que Docker tourne
4. ✅ Clone le projet
5. ✅ Configure .env avec ta clé OpenAI
6. ✅ Lance `docker compose up -d`
7. ✅ Ouvre http://localhost:8000/docs
8. 🎉 C'est prêt !

---

## ❓ Questions ?

Une fois que tu as installé ces outils, reviens me voir et on pourra :
- Lancer le backend
- Tester l'API
- Passer à la Phase 2 (RAG + LLM)

**Quel est ton système d'exploitation ?** (Windows / Mac / Linux)

Je pourrai t'aider plus précisément selon ton OS !
