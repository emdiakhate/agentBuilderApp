# 🔗 Guide d'Intégration Frontend-Backend

## ✅ Ce qui a été fait

### 1. Backend configuré avec clés API
- ✅ Clés OpenAI et Voyage AI ajoutées
- ✅ Backend redémarré et opérationnel
- ✅ API documentée sur http://localhost:8000/docs

### 2. Frontend connecté au backend
- ✅ Client API créé (`src/lib/api.ts`)
- ✅ Service d'authentification créé (`src/services/authService.ts`)
- ✅ Service agents mis à jour pour appeler l'API réelle

---

## 🚀 Comment tester l'intégration

### **Prérequis**

1. **Backend démarré** :
   ```powershell
   cd backend
   docker compose ps
   # Doit montrer agent_backend, agent_postgres, agent_qdrant "Up"
   ```

2. **Frontend démarré** :
   ```powershell
   # Dans un nouveau terminal PowerShell
   cd C:\Users\LENOVO\Documents\agentBuilderApp
   npm run dev
   ```

---

## 📝 Scénario de test complet

### **Étape 1 : Créer un compte utilisateur**

#### Option A : Via le frontend
1. Ouvre le frontend (http://localhost:8080)
2. Si tu n'as pas de page de login, utilise la console du navigateur :

```javascript
// Ouvre la console (F12) et tape :
const response = await fetch('http://localhost:8000/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'Test123456!',
    full_name: 'Utilisateur Test'
  })
});

const data = await response.json();
console.log(data);

// Sauvegarde le token
localStorage.setItem('access_token', data.access_token);
localStorage.setItem('user', JSON.stringify(data.user));
```

#### Option B : Via Swagger
1. Va sur http://localhost:8000/docs
2. Ouvre `POST /api/auth/signup`
3. Clique "Try it out"
4. Utilise :
```json
{
  "email": "test@example.com",
  "password": "Test123456!",
  "full_name": "Utilisateur Test"
}
```
5. Execute et copie le `access_token` reçu

---

### **Étape 2 : Créer un agent depuis le frontend**

1. **Recharge la page du frontend** (pour que le token soit chargé)

2. **Va sur la page de création d'agent** dans le frontend

3. **Remplis le formulaire** :
   - Nom : "Mon Assistant Support"
   - Type : "Customer Service"
   - Description : "Assistant IA pour le support client"
   - Modèle : "gpt-4o-mini"
   - Provider : "openai"
   - Langue : "Français"

4. **Clique sur "Créer"**

5. **Vérifie que l'agent apparaît dans la liste**

---

### **Étape 3 : Vérifier dans la console réseau**

1. **Ouvre les DevTools** (F12)
2. **Va dans l'onglet "Network"**
3. **Rafraîchis la page**
4. **Tu devrais voir** :
   - `GET http://localhost:8000/api/agents` → Status 200
   - Réponse JSON avec tes agents créés

---

### **Étape 4 : Uploader un document (optionnel)**

1. **Crée un fichier texte** simple (`test.txt`) :
   ```
   Ceci est un document de test pour le système RAG.
   Notre entreprise propose des services de support client.
   ```

2. **Dans le frontend**, va sur la page de détails d'un agent

3. **Upload le fichier** via l'interface de gestion des documents

4. **Vérifie dans les logs du backend** :
   ```powershell
   docker logs agent_backend -f
   ```
   Tu devrais voir :
   ```
   Document uploaded: test.txt
   Processing document...
   Document processed: X chunks created
   ```

---

## 🔍 Dépannage

### **Problème : "Failed to fetch" ou erreur CORS**

**Cause** : Le frontend ne peut pas joindre le backend

**Solution** :
1. Vérifie que le backend tourne :
   ```powershell
   curl http://localhost:8000
   ```

2. Vérifie les CORS dans `backend/.env` :
   ```env
   CORS_ORIGINS=http://localhost:8080,http://localhost:5173
   ```

3. Si ton frontend est sur un autre port, ajoute-le à `CORS_ORIGINS` puis redémarre :
   ```powershell
   docker compose restart backend
   ```

---

### **Problème : "401 Unauthorized"**

**Cause** : Token invalide ou expiré

**Solution** :
1. Vérifie le token dans localStorage :
   ```javascript
   console.log(localStorage.getItem('access_token'));
   ```

2. Si absent ou invalide, reconnecte-toi :
   ```javascript
   // Dans la console
   const response = await fetch('http://localhost:8000/api/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       email: 'test@example.com',
       password: 'Test123456!'
     })
   });

   const data = await response.json();
   localStorage.setItem('access_token', data.access_token);
   ```

---

### **Problème : "La liste des agents est vide"**

**Cause** : Aucun agent n'a été créé pour cet utilisateur

**Solution** :
1. Crée un agent via Swagger ou le frontend
2. Vérifie dans la base de données :
   ```powershell
   docker exec -it agent_postgres psql -U agent_user -d agent_saas_db -c "SELECT * FROM agents;"
   ```

---

## 🧪 Tests API directs

### **Test 1 : Health Check**
```powershell
curl http://localhost:8000
```
Attendu :
```json
{
  "name": "Agent Builder API",
  "version": "0.1.0",
  "status": "healthy"
}
```

### **Test 2 : Créer un compte**
```powershell
curl -X POST http://localhost:8000/api/auth/signup `
  -H "Content-Type: application/json" `
  -d '{\"email\": \"user@example.com\", \"password\": \"Pass123!\"}'
```

### **Test 3 : Login**
```powershell
curl -X POST http://localhost:8000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\": \"user@example.com\", \"password\": \"Pass123!\"}'
```

### **Test 4 : Créer un agent**
```powershell
# Remplace <TOKEN> par ton access_token
curl -X POST http://localhost:8000/api/agents `
  -H "Authorization: Bearer <TOKEN>" `
  -H "Content-Type: application/json" `
  -d '{\"name\": \"TestAgent\", \"type\": \"customer_support\", \"llm_provider\": \"openai\", \"model\": \"gpt-4o-mini\"}'
```

### **Test 5 : Lister les agents**
```powershell
curl -X GET http://localhost:8000/api/agents `
  -H "Authorization: Bearer <TOKEN>"
```

---

## 📊 Structure du projet après intégration

```
agentBuilderApp/
├── backend/
│   ├── .env                          ← Clés API ajoutées
│   ├── app/
│   │   ├── api/endpoints/            ← Endpoints REST
│   │   ├── services/                 ← RAG, LLM, Embeddings
│   │   └── models/                   ← ORM SQLAlchemy
│   └── docker-compose.yml
│
├── src/
│   ├── lib/
│   │   └── api.ts                    ← ✨ Nouveau : Client HTTP
│   ├── services/
│   │   ├── authService.ts            ← ✨ Nouveau : Auth
│   │   └── agentService.ts           ← ✨ Modifié : Appels API réels
│   └── types/
│       └── agent.ts
│
└── FRONTEND_BACKEND_INTEGRATION.md  ← Ce fichier
```

---

## 🎯 Prochaines étapes

1. **Créer une page de Login/Signup** dans le frontend
2. **Gérer la déconnexion** (logout)
3. **Implémenter le chat** avec système RAG
4. **Ajouter la gestion des erreurs** visuelles
5. **Créer un composant d'upload** de documents

---

## ✅ Checklist de validation

- [ ] Backend démarré (http://localhost:8000)
- [ ] Frontend démarré (http://localhost:8080)
- [ ] Swagger accessible (http://localhost:8000/docs)
- [ ] Compte utilisateur créé
- [ ] Token JWT stocké dans localStorage
- [ ] Agent créé via le frontend
- [ ] Agent visible dans la liste
- [ ] API appelées avec succès (Network tab)

---

**🎉 Félicitations ! Le frontend et le backend sont maintenant connectés !**

Tu peux maintenant créer des agents, uploader des documents, et utiliser le système RAG complet !
