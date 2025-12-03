# 📋 Audit Frontend - Fonctionnalités Existantes vs Backend Nécessaire

## 🎯 Pages Principales

### 1. **AgentsDashboard** (`/agents`)
**Fonctionnalités UI :**
- ✅ Liste des agents avec filtres (all, active, inactive, draft)
- ✅ Cards agents avec stats (totalCalls, averageRating)
- ✅ Toggle actif/inactif
- ✅ Bouton "Tester" l'agent (simule un appel)
- ✅ Bouton "Configurer"
- ✅ Statistiques dashboard (nombre total, agents actifs, appels, satisfaction)
- ❌ CallInterface (UI simulée, pas de vraie intégration)

**Backend nécessaire :**
- ✅ GET /api/agents (avec filtre status) - **CRÉÉ**
- ✅ PATCH /api/agents/{id} (update status) - **CRÉÉ**
- ❌ Pas besoin de CallInterface backend (c'est simulé en local)

---

### 2. **AgentDetails** (`/agents/:id`)
**Fonctionnalités UI :**
- ✅ Affichage détaillé d'un agent
- ✅ Toggle actif/inactif
- ✅ Bouton "Test Agent" (ouvre sidebar de test)
- ✅ Menu actions : Edit, Deactivate, Archive, Delete
- ✅ Tabs : Setup / Settings
- ❌ Sélection voix (Eleven Labs, Amazon Polly, Google TTS) - **UI seulement**
- ❌ Sélection modèle LLM - **UI seulement**
- ❌ Configuration channels (Voice, Chat, Email) - **UI seulement**
- ❌ Statistiques (AVM score, interactions, CSAT) - **Mock data**

**Backend nécessaire :**
- ✅ GET /api/agents/{id} - **CRÉÉ**
- ✅ PATCH /api/agents/{id} - **CRÉÉ**
- ✅ DELETE /api/agents/{id} - **CRÉÉ**
- ❌ Pas d'intégration voix réelle (UI seulement)
- ❌ Pas de vrais analytics (mock data suffit pour l'instant)

---

### 3. **AgentCreate** (`/agents/create`)
**Fonctionnalités UI :**
- ❌ **Création par appel vocal simulé** - Complètement simulée en local
- ✅ Formulaire de configuration d'agent
- ✅ AgentConfigSidebar (affiche config en temps réel)
- ❌ Pas de vraie intégration téléphonique

**Backend nécessaire :**
- ✅ POST /api/agents - **CRÉÉ**
- ❌ Pas besoin d'API appel vocal (simulé frontend)

---

### 4. **AgentAnalytics** (pas explorée mais mentionnée)
**Fonctionnalités probables :**
- Graphiques de performance
- Métriques détaillées

**Backend nécessaire :**
- ❌ Pas implémenté frontend (pas prioritaire)

---

## 🧩 Composants Clés

### **AgentSetupStepper** - Setup par étapes
**3 Étapes affichées :**

#### Étape 1: **AgentTrainingCard** (Knowledge Base)
**Fonctionnalités UI :**
- ✅ Upload documents (PDF, DOCX, TXT)
- ✅ Add web page (URL input)
- ✅ Add text (textarea)
- ✅ Liste documents uploadés avec preview
- ✅ Progress bar traitement
- ✅ Boutons : View, Download, Delete docs

**Backend nécessaire :**
- ✅ POST /api/agents/{id}/documents - **CRÉÉ** ✅
- ✅ GET /api/agents/{id}/documents - **CRÉÉ** ✅
- ✅ DELETE /api/agents/{id}/documents/{doc_id} - **CRÉÉ** ✅
- ❌ Scraping web pages - **PAS CRÉÉ** (optionnel)
- ❌ Add text direct - **PAS CRÉÉ** (peut être ajouté facilement)

#### Étape 2: **WorkflowCard**
**Fonctionnalités UI :**
- ❌ Configuration workflows/automation
- ❌ Pas détaillé dans le code

**Backend nécessaire :**
- ❌ Pas implémenté frontend (pas prioritaire)

#### Étape 3: **SimulationCard**
**Fonctionnalités UI :**
- ❌ Tests/simulations
- ❌ Coverage, performance metrics

**Backend nécessaire :**
- ❌ Pas implémenté frontend (pas prioritaire)

---

### **KnowledgeBaseCard** (dans Setup)
**Fonctionnalités UI :**
- ✅ Upload fichiers (PDF, DOCX, TXT)
- ✅ Add URL web pages
- ✅ Add text brut
- ✅ Affiche liste documents
- ✅ Actions : View, Download, Delete

**Backend nécessaire :**
- ✅ Upload documents - **CRÉÉ** ✅
- ✅ Liste documents - **CRÉÉ** ✅
- ✅ Delete documents - **CRÉÉ** ✅
- ❌ Download documents - **PAS CRÉÉ** (simple file serve)
- ❌ View/Preview documents - **PAS CRÉÉ** (optionnel)

---

### **TestAgentSidebar / CallInterface**
**Fonctionnalités UI :**
- ❌ Interface simulée d'appel
- ❌ Transcription live (mock)
- ❌ Persona selection
- ❌ Recording playback

**Backend nécessaire :**
- ❌ Tout simulé en frontend (pas d'intégration voix réelle)

---

### **AgentConfigSettings**
**Fonctionnalités UI :**
- ✅ Edit nom, description, type
- ✅ Select modèle LLM
- ✅ Edit purpose, prompt
- ✅ Industry, function selection
- ✅ Channels configuration

**Backend nécessaire :**
- ✅ PATCH /api/agents/{id} - **CRÉÉ** ✅

---

## 📊 Service Layer Frontend

### **agentService.ts**
**Fonctions actuelles :**
```typescript
fetchAgents(filter)       // GET agents avec filtre
fetchAgentById(id)        // GET agent par ID
updateAgent(id, updates)  // UPDATE agent
```

**Ce qui est MOCK :**
- ✅ Tout est en mock data (6 agents hardcodés)
- ✅ Pas d'appels API réels

**Backend mapping :**
- ✅ GET /api/agents - **CRÉÉ**
- ✅ GET /api/agents/{id} - **CRÉÉ**
- ✅ PATCH /api/agents/{id} - **CRÉÉ**

---

## ✅ CE QUI EST UTILISÉ FRONTEND vs BACKEND CRÉÉ

### ✅ CORE Features (Essentiels)

| Feature Frontend | Backend Créé | Statut |
|-----------------|--------------|--------|
| Liste agents avec filtres | GET /api/agents | ✅ Match |
| Détails agent | GET /api/agents/{id} | ✅ Match |
| Créer agent | POST /api/agents | ✅ Match |
| Modifier agent | PATCH /api/agents/{id} | ✅ Match |
| Supprimer agent | DELETE /api/agents/{id} | ✅ Match |
| Upload documents | POST /api/agents/{id}/documents | ✅ Match |
| Liste documents | GET /api/agents/{id}/documents | ✅ Match |
| Supprimer document | DELETE /api/agents/{id}/documents/{id} | ✅ Match |

### ❌ FEATURES NON UTILISÉES (Backend créé mais pas nécessaire)

| Backend créé | Utilisé Frontend | Conclusion |
|--------------|------------------|------------|
| Auth JWT (signup/login) | ❌ Non | **À GARDER** (nécessaire) |
| Conversations API | ❌ Non | **À GARDER** (pour plus tard) |
| Chat avec RAG | ❌ Non | **À GARDER** (core feature) |
| Embeddings service | ❌ Non | **À GARDER** (pour RAG) |
| Vector store (Qdrant) | ❌ Non | **À GARDER** (pour RAG) |

### 📝 FEATURES UI MANQUANTES (Backend pas créé)

| Feature Frontend | Backend nécessaire | Priorité |
|-----------------|-------------------|----------|
| Download document | GET /api/agents/{id}/documents/{id}/download | 🟡 Moyenne |
| Add text direct (sans fichier) | POST /api/agents/{id}/knowledge/text | 🟡 Moyenne |
| Scraping URL web | POST /api/agents/{id}/knowledge/url | 🟠 Basse |
| Analytics dashboard | GET /api/agents/{id}/analytics | 🟠 Basse |
| Voice integration | N/A (externe - VAPI) | 🟠 Basse |

---

## 🎯 CONCLUSION - Ce qu'on doit VRAIMENT garder

### ✅ BACKEND NÉCESSAIRE (À garder)

**Phase 1 - Core (100% nécessaire)**
```
✅ Auth JWT (signup, login, me)
✅ CRUD Agents complet
✅ Upload documents
✅ Liste documents
✅ Delete documents
```

**Phase 2 - RAG System (80% nécessaire)**
```
✅ Embeddings service (Voyage AI)
✅ Vector store (Qdrant)
✅ Document processing (chunking)
✅ RAG service (retrieve context)
✅ LLM service (OpenAI, Claude, OpenRouter)
✅ Chat endpoint avec RAG
```

**Même si le frontend n'utilise pas encore le chat, c'est une feature CORE qui sera utilisée bientôt.**

---

### ⚠️ BACKEND À SIMPLIFIER/RETARDER

**Features créées mais pas utilisées tout de suite :**
```
🟡 Conversations management (GET/DELETE conversations)
   → Garder mais pas prioritaire pour tests initiaux

🟡 Multi-LLM switching dans l'UI
   → Backend prêt, UI utilise juste "model" field

🟠 Streaming responses
   → Pas créé, pas nécessaire pour MVP
```

---

### ❌ FEATURES UI QUI N'ONT PAS BESOIN DE BACKEND

**Simulées en frontend :**
```
❌ CallInterface (simulation appel)
❌ LiveTranscription
❌ Voice selection modal (UI seulement)
❌ TestAgentSidebar
❌ RolePlay dialog
❌ Simulation steps (Training, Workflow, Simulation)
```

Ces features sont **purement UI/UX** pour montrer le concept. Pas besoin de backend pour l'instant.

---

## 🚀 PLAN D'ACTION RECOMMANDÉ

### Maintenant (Testing Phase)
1. ✅ Garder tout le backend Phase 1 + Phase 2
2. ✅ Connecter le frontend au backend (remplacer mock data)
3. ✅ Tester le flow complet :
   - Signup/Login
   - Créer agent
   - Upload document
   - (Attendre chat UI pour tester RAG)

### Plus tard (Quand UI chat sera ajoutée)
4. ⏳ Créer l'interface de chat dans le frontend
5. ⏳ Intégrer avec POST /api/chat/{agent_id}
6. ⏳ Tester RAG end-to-end

### Optionnel (Améliorations futures)
7. 🟡 Ajouter download documents
8. 🟡 Ajouter "add text" direct (sans upload fichier)
9. 🟡 Analytics dashboard
10. 🟠 Voice integration (VAPI)

---

## 📊 RÉSUMÉ EXÉCUTIF

**Frontend actuel :**
- 6 pages principales
- ~20 composants métier
- **Tout en mock data** (pas d'API calls)
- **Beaucoup de features UI-only** (simulations, voice, etc.)

**Backend créé :**
- ✅ **Phase 1** : Auth + CRUD Agents + Upload docs → **100% nécessaire**
- ✅ **Phase 2** : RAG complet + Multi-LLM → **80% nécessaire maintenant, 100% bientôt**

**Verdict :**
🎉 **Le backend créé correspond bien aux besoins !**

**Seules 3 petites choses manquent :**
1. Download documents (facile à ajouter)
2. Add text direct (facile à ajouter)
3. Chat UI dans le frontend (à créer)

**Mais globalement : ON EST PRÊTS À TESTER ! 🚀**
