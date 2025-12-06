# 🎉 Phase 2 Complete - RAG System + LLM Integration

## ✅ Nouvelles Fonctionnalités

### 🤖 Multi-LLM Support (Complet)
- **OpenAI** : gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-3.5-turbo
- **Anthropic/Claude** : claude-3-5-sonnet, claude-3-5-haiku, claude-3-opus
- **OpenRouter** : Accès unifié aux modèles OpenAI et Anthropic

### 📄 Gestion de Documents
- **Upload** : PDF, DOCX, TXT (jusqu'à 10 MB)
- **Traitement automatique** :
  - Extraction de texte
  - Chunking intelligent (1000 chars, overlap 200)
  - Génération d'embeddings
  - Stockage dans Qdrant
- **Traitement en arrière-plan** pour ne pas bloquer l'API

### 🧠 Embeddings
- **Voyage AI** : voyage-2, voyage-large-2 (recommandé)
- **OpenAI** : text-embedding-3-small (fallback)
- Fallback automatique si Voyage AI échoue

### 🔍 RAG (Retrieval Augmented Generation)
- Recherche vectorielle dans Qdrant
- Top-K chunks pertinents
- Score de pertinence
- Contexte formaté pour le LLM

### 💬 Chat Intelligent
- Conversations avec historique
- Support RAG activable/désactivable
- Métriques de performance (chunks utilisés, RAG activé)
- Gestion multi-conversations par agent

---

## 📊 Nouveaux Services Créés

### 1. LLM Service (`app/services/llm_service.py`)
```python
# Support multi-provider
from app.services.llm_service import llm_service

response = await llm_service.chat(
    provider="openai",  # ou "anthropic", "openrouter"
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Hello"}],
    temperature=0.7
)
```

### 2. Embedding Service (`app/services/embedding_service.py`)
```python
# Générer embeddings
from app.services.embedding_service import embedding_service

embeddings = await embedding_service.embed_texts(
    texts=["texte 1", "texte 2"],
    provider="voyage"  # ou "openai"
)
```

### 3. Document Service (`app/services/document_service.py`)
```python
# Traiter document
from app.services.document_service import document_service

result = document_service.process_document(
    file_path="/path/to/file.pdf",
    file_type="pdf"
)
# Retourne: text, chunks, num_chunks, total_chars
```

### 4. Vector Store Service (`app/services/vector_store_service.py`)
```python
# Ajouter à Qdrant
from app.services.vector_store_service import vector_store_service

await vector_store_service.add_documents(
    agent_id="123",
    document_id="doc-456",
    chunks=chunks,
    embeddings=embeddings
)

# Rechercher
results = await vector_store_service.search(
    query_embedding=query_vector,
    agent_id="123",
    limit=5
)
```

### 5. RAG Service (`app/services/rag_service.py`)
```python
# Génération avec RAG
from app.services.rag_service import rag_service

result = await rag_service.generate_response(
    query="Question de l'utilisateur",
    agent_id="123",
    agent_config={...},
    use_rag=True
)
```

---

## 🆕 Nouveaux Endpoints API

### Documents

#### **POST /api/agents/{agent_id}/documents**
Upload un document

```bash
curl -X POST http://localhost:8000/api/agents/{agent_id}/documents \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@document.pdf"
```

Response:
```json
{
  "id": "doc-123",
  "agent_id": "agent-456",
  "filename": "document.pdf",
  "status": "pending",  // puis "processing", puis "completed"
  "file_size": 102400,
  "uploaded_at": "2024-01-01T10:00:00"
}
```

#### **GET /api/agents/{agent_id}/documents**
Liste les documents

```bash
curl http://localhost:8000/api/agents/{agent_id}/documents \
  -H "Authorization: Bearer TOKEN"
```

#### **DELETE /api/agents/{agent_id}/documents/{document_id}**
Supprime un document

### Chat (Mis à jour)

#### **POST /api/chat/{agent_id}**
Envoie un message (avec RAG!)

```bash
curl -X POST http://localhost:8000/api/chat/{agent_id} \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Quelle est la politique de remboursement?",
    "conversation_id": "conv-123",  // optionnel
    "use_rag": true  // optionnel, true par défaut
  }'
```

Response:
```json
{
  "response": "Selon nos documents...",
  "conversation_id": "conv-123",
  "used_rag": true,
  "num_context_chunks": 3
}
```

#### **GET /api/chat/{agent_id}/conversations**
Liste les conversations

#### **GET /api/chat/{agent_id}/conversations/{conversation_id}**
Récupère une conversation

#### **DELETE /api/chat/{agent_id}/conversations/{conversation_id}**
Supprime une conversation

---

## 🚀 Comment Utiliser

### 1. Configure les API Keys

Édite `backend/.env` :
```bash
# Obligatoire
OPENAI_API_KEY=sk-proj-xxxxxxxxx

# Recommandé pour RAG
VOYAGE_API_KEY=pa-xxxxxxxxx

# Optionnel
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxx
OPENROUTER_API_KEY=sk-or-xxxxxxxxx
```

### 2. Lance le Backend

```bash
cd backend
docker compose up -d
```

Vérifie que tout tourne :
```bash
docker compose ps

# Tu dois voir :
# ✓ agent_postgres  (healthy)
# ✓ agent_qdrant    (healthy)
# ✓ agent_backend   (running)
```

### 3. Teste le Flow Complet

#### A. Crée un compte et connecte-toi

```bash
# Signup
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "test123",
    "full_name": "Test User"
  }'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@test.com&password=test123"

# Sauvegarde le token !
export TOKEN="ton_token_ici"
```

#### B. Crée un agent

```bash
curl -X POST http://localhost:8000/api/agents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Support Bot",
    "description": "Agent de support client",
    "type": "Customer Service",
    "llm_provider": "openai",
    "model": "gpt-4o-mini",
    "purpose": "Répondre aux questions des clients"
  }'

# Sauvegarde l'agent_id !
export AGENT_ID="agent_id_ici"
```

#### C. Upload un document

```bash
# Crée un fichier de test
echo "Notre politique de remboursement est simple :
vous avez 30 jours pour retourner tout produit.
Les frais de retour sont à votre charge sauf si
le produit est défectueux." > politique.txt

# Upload
curl -X POST http://localhost:8000/api/agents/$AGENT_ID/documents \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@politique.txt"
```

#### D. Attends que le traitement soit terminé

```bash
# Vérifie le statut
curl http://localhost:8000/api/agents/$AGENT_ID/documents \
  -H "Authorization: Bearer $TOKEN"

# Attends que status = "completed"
```

#### E. Chatte avec l'agent !

```bash
curl -X POST http://localhost:8000/api/chat/$AGENT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Combien de jours ai-je pour retourner un produit ?"
  }'
```

🎉 **Tu devrais recevoir une réponse basée sur le document uploadé !**

---

## 🧪 Tester dans Swagger

1. Va sur http://localhost:8000/docs
2. Clique sur "Authorize" (🔒 en haut)
3. Entre : `Bearer TON_TOKEN`
4. Explore tous les endpoints !

**Ordre de test recommandé :**
1. POST /api/auth/signup
2. POST /api/auth/login (copie le token)
3. Authorize avec le token
4. POST /api/agents (crée agent)
5. POST /api/agents/{id}/documents (upload PDF/TXT)
6. GET /api/agents/{id}/documents (vérifie statut)
7. POST /api/chat/{id} (pose une question)
8. GET /api/chat/{id}/conversations (vois l'historique)

---

## 📊 Architecture Complete

```
User Query
    ↓
FastAPI Chat Endpoint
    ↓
RAG Service
    ├─→ Embedding Service → Voyage AI / OpenAI
    │       ↓
    │   Query Vector
    │       ↓
    ├─→ Vector Store Service → Qdrant
    │       ↓
    │   Top-K Relevant Chunks
    │       ↓
    └─→ LLM Service → OpenAI / Claude / OpenRouter
            ↓
        Response with Context
```

---

## 🔧 Configuration Avancée

### Personnaliser le Chunking

Édite `app/services/document_service.py` :
```python
self.text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,      # Taille des chunks
    chunk_overlap=200,    # Overlap entre chunks
    length_function=len,
    separators=["\n\n", "\n", ". ", " ", ""]
)
```

### Ajuster la Recherche RAG

Édite `app/services/rag_service.py` :
```python
retrieved_chunks = await self.retrieve_context(
    query=query,
    agent_id=agent_id,
    top_k=5,              # Nombre de chunks
    score_threshold=0.7   # Seuil de pertinence (0-1)
)
```

### Changer le Modèle d'Embedding

Édite `backend/.env` :
```bash
# Options pour Voyage AI
EMBEDDING_MODEL=voyage-2           # Recommandé (1024 dim)
# EMBEDDING_MODEL=voyage-large-2   # Plus précis (1536 dim)

# Pour OpenAI
EMBEDDING_MODEL=text-embedding-3-small  # (1536 dim)
# EMBEDDING_MODEL=text-embedding-3-large # Plus précis (3072 dim)

# Ajuste la dimension selon le modèle
EMBEDDING_DIMENSION=1024  # ou 1536, 3072
```

---

## 🐛 Troubleshooting

### Documents restent en "processing"

```bash
# Vérifie les logs
docker compose logs -f backend

# Causes communes :
# - Pas de clé API Voyage/OpenAI
# - Fichier corrompu
# - Qdrant non accessible
```

### "No context found" dans les réponses

```bash
# Vérifie que le document est bien traité
curl http://localhost:8000/api/agents/$AGENT_ID/documents \
  -H "Authorization: Bearer $TOKEN"

# Status doit être "completed" avec num_chunks > 0
```

### Erreur "VOYAGE_API_KEY not configured"

```bash
# Option 1 : Ajoute la clé Voyage AI dans .env
VOYAGE_API_KEY=pa-xxxxxxxxx

# Option 2 : Utilise OpenAI (fallback automatique)
# Assure-toi d'avoir OPENAI_API_KEY configuré
```

### RAG ne trouve rien de pertinent

```bash
# Baisse le score_threshold dans rag_service.py
score_threshold=0.5  # au lieu de 0.7

# Ou augmente top_k
top_k=10  # au lieu de 5
```

---

## 📈 Prochaines Étapes (Phase 3)

- [ ] Streaming des réponses (Server-Sent Events)
- [ ] Support de plus de formats (PPTX, XLSX, images)
- [ ] OCR pour les PDFs scannés
- [ ] Multi-modal (images dans le contexte)
- [ ] Cache des embeddings
- [ ] Analytics RAG (précision, pertinence)
- [ ] Fine-tuning des prompts
- [ ] A/B testing des configurations

---

## 🎉 Résumé

**Phase 2 = TERMINÉE !**

Tu as maintenant :
✅ Un système RAG complet et fonctionnel
✅ Support de 3 providers LLM (OpenAI, Claude, OpenRouter)
✅ Upload et traitement automatique de documents
✅ Embeddings avec Voyage AI (+ fallback OpenAI)
✅ Recherche vectorielle dans Qdrant
✅ Chat intelligent avec contexte
✅ API complète et documentée

**L'agent peut maintenant répondre en utilisant tes propres documents ! 🚀**
