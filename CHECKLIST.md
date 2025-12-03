# ✅ Checklist Installation - Agent Builder

Coche au fur et à mesure !

## 📦 Étape 1 : Installation des outils (sur ta machine)

- [ ] **Git installé**
  ```bash
  git --version
  # Tu dois voir : git version 2.x.x
  ```

- [ ] **Docker Desktop installé et lancé**
  ```bash
  docker --version
  # Tu dois voir : Docker version 24.x.x

  docker compose version
  # Tu dois voir : Docker Compose version v2.x.x
  ```

- [ ] **Docker Desktop est lancé** (icône dans la barre des tâches)

---

## 📥 Étape 2 : Récupérer le projet

- [ ] **Clone le projet**
  ```bash
  git clone https://github.com/emdiakhate/agentBuilderApp.git
  cd agentBuilderApp
  ```

- [ ] **Pull la dernière version**
  ```bash
  git pull origin claude/analyze-project-01GGkgyQCRaFANtEyztLP1JG
  ```

---

## 🔑 Étape 3 : Configuration

- [ ] **Va dans le dossier backend**
  ```bash
  cd backend
  ```

- [ ] **Ouvre le fichier .env**
  ```bash
  # Windows
  notepad .env

  # Mac/Linux
  nano .env
  # ou
  code .env  # Si tu as VS Code
  ```

- [ ] **Ajoute ta clé OpenAI**
  ```bash
  OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxx
  ```

- [ ] **Sauvegarde le fichier .env**

---

## 🚀 Étape 4 : Lancer le backend

- [ ] **Lance Docker Compose**
  ```bash
  # Tu dois être dans le dossier backend/
  docker compose up -d
  ```

- [ ] **Attends 10-20 secondes**, puis vérifie :
  ```bash
  docker compose ps
  ```

  Tu dois voir :
  ```
  ✓ agent_postgres  (healthy)
  ✓ agent_qdrant    (healthy)
  ✓ agent_backend   (running)
  ```

- [ ] **Regarde les logs** (optionnel)
  ```bash
  docker compose logs -f backend
  ```

  Pour sortir : `Ctrl + C`

---

## 🧪 Étape 5 : Tester que ça marche

- [ ] **Ouvre ton navigateur**

  Va sur : http://localhost:8000/docs

  ✅ Tu dois voir l'interface Swagger de l'API

- [ ] **Teste le health check**

  Va sur : http://localhost:8000/health

  ✅ Tu dois voir du JSON avec "status": "healthy"

- [ ] **Teste Qdrant** (optionnel)

  Va sur : http://localhost:6333/dashboard

  ✅ Tu dois voir le dashboard Qdrant

---

## 🎯 Étape 6 : Premier test API

- [ ] **Crée un compte dans Swagger**

  1. Va sur http://localhost:8000/docs
  2. Ouvre `POST /api/auth/signup`
  3. Clique "Try it out"
  4. Entre :
     ```json
     {
       "email": "test@test.com",
       "password": "test123",
       "full_name": "Test User"
     }
     ```
  5. Clique "Execute"
  6. ✅ Tu dois avoir un code 201

- [ ] **Connecte-toi**

  1. Ouvre `POST /api/auth/login`
  2. Entre :
     - username: `test@test.com`
     - password: `test123`
  3. Clique "Execute"
  4. ✅ Tu dois recevoir un `access_token`
  5. **Copie le token !**

- [ ] **Autorise-toi dans Swagger**

  1. En haut à droite, clique sur "Authorize" 🔒
  2. Entre : `Bearer TON_TOKEN_ICI`
  3. Clique "Authorize"
  4. ✅ Tu es maintenant authentifié

- [ ] **Crée ton premier agent**

  1. Ouvre `POST /api/agents`
  2. Entre :
     ```json
     {
       "name": "Mon Premier Agent",
       "description": "Agent de test",
       "type": "Customer Service",
       "llm_provider": "openai",
       "model": "gpt-4o-mini"
     }
     ```
  3. Clique "Execute"
  4. ✅ Tu dois avoir un code 201 avec les détails de l'agent

- [ ] **Liste tes agents**

  1. Ouvre `GET /api/agents`
  2. Clique "Execute"
  3. ✅ Tu dois voir ton agent !

---

## 🎉 Bravo !

Si toutes les cases sont cochées, **tu es prêt** pour la Phase 2 !

---

## 🚨 En cas de problème

### Docker ne démarre pas
```bash
# Vérifie que Docker Desktop est bien lancé
# Regarde l'icône dans la barre des tâches
```

### "Port already in use"
```bash
# Quelque chose utilise déjà le port 8000
# Arrête le processus ou change le port dans docker-compose.yml
```

### "Cannot connect to database"
```bash
# Reset complet
docker compose down -v
docker compose up -d
```

### Les containers ne démarrent pas
```bash
# Vérifie les logs
docker compose logs

# Essaye de rebuild
docker compose down
docker compose up -d --build
```

---

## 📞 Aide

Si tu bloques quelque part, dis-moi à quelle étape tu es et je t'aide !

Tu peux me dire :
- Ton système d'exploitation (Windows / Mac / Linux)
- Le message d'erreur exact
- À quelle case tu es bloqué

Et je te guide ! 🚀
