# ⚡ DÉMARRAGE ULTRA-RAPIDE (5 minutes)

## 🎯 OBJECTIF
Lancer le backend et tester l'API en **5 minutes chrono**.

---

## 📋 CHECKLIST AVANT DE COMMENCER

- [ ] Docker Desktop est **lancé** (icône verte dans la barre des tâches)
- [ ] Tu as cloné le projet
- [ ] Tu as ta clé OpenAI

✅ Tout bon ? C'est parti !

---

## 🚀 LES 4 COMMANDES MAGIQUES

### 1️⃣ Ouvre PowerShell et va dans le projet
```powershell
cd C:\Users\TonNom\Documents\agentBuilderApp\backend
```
📝 **Remplace `TonNom`** par ton vrai nom d'utilisateur Windows !

---

### 2️⃣ Configure ta clé OpenAI
```powershell
notepad .env
```

Dans le fichier qui s'ouvre, modifie cette ligne :
```
OPENAI_API_KEY=sk-proj-XXXXX  ⬅️ Mets ta vraie clé ici
```

**Sauvegarde** (Ctrl+S) et **ferme** Notepad.

---

### 3️⃣ Lance TOUT (1 seule commande !)
```powershell
docker compose up -d
```

⏳ **Attends 30 secondes** (première fois : 5-10 min pour télécharger)

Tu vas voir :
```
✔ Network agent_network        Created
✔ Container agent_postgres     Started
✔ Container agent_qdrant       Started
✔ Container agent_backend      Started
```

---

### 4️⃣ Vérifie que ça marche
```powershell
docker compose ps
```

Tu dois voir :
```
NAME             STATUS
agent_postgres   Up (healthy)
agent_qdrant     Up (healthy)
agent_backend    Up
```

✅ **TOUS "Up" ? C'EST BON !**

---

## 🌐 OUVRE DANS TON NAVIGATEUR

### L'interface Swagger (API)
```
http://localhost:8000/docs
```

✅ Tu dois voir une belle interface avec plein d'endpoints !

### Le tableau de bord Qdrant
```
http://localhost:6333/dashboard
```

✅ Dashboard de la base de données vectorielle !

---

## 🎯 PREMIER TEST (30 secondes)

### Sur http://localhost:8000/docs :

**1. Crée un compte**
- Ouvre `POST /api/auth/signup`
- Clique **"Try it out"**
- Entre :
```json
{
  "email": "test@test.com",
  "password": "test123",
  "full_name": "Moi"
}
```
- Clique **"Execute"**
- ✅ Tu dois voir **201 Created**

**2. Connecte-toi**
- Ouvre `POST /api/auth/login`
- Clique **"Try it out"**
- Entre :
  - username: `test@test.com`
  - password: `test123`
- Clique **"Execute"**
- ✅ Tu reçois un **access_token** !

**3. Copie le token**
Copie le texte qui ressemble à : `eyJhbGciOiJIUzI1NiIsInR5cCI6...`

**4. Autorise-toi**
- En haut à droite : clique **🔒 Authorize**
- Colle : `Bearer ton_token_ici`
- Clique **"Authorize"**

**5. Crée ton premier agent**
- Ouvre `POST /api/agents`
- Clique **"Try it out"**
- Entre :
```json
{
  "name": "Mon Bot",
  "description": "Premier test",
  "type": "Customer Service"
}
```
- Clique **"Execute"**
- ✅ **201 Created** → Ton agent est créé !

---

## 🎉 FÉLICITATIONS !

Tu as :
- ✅ Lancé PostgreSQL
- ✅ Lancé Qdrant (vector DB)
- ✅ Lancé le backend Python
- ✅ Créé un compte
- ✅ Créé ton premier agent

**Temps écoulé : 5 minutes ! 🚀**

---

## 🛑 ARRÊTER TOUT

Quand tu as fini :
```powershell
docker compose down
```

---

## 🔄 RELANCER PLUS TARD

La prochaine fois (hyper rapide) :
```powershell
cd backend
docker compose up -d
```

C'est tout ! 😊

---

## ❌ PROBLÈME ?

**Copie-colle ton erreur** et dis-moi, je t'aide !

Exemples :
```
"Error: port already in use"
"Cannot connect to Docker daemon"
"container exited with code 1"
```
