# 🚀 Quick Start Guide - Agent Builder Backend

## Étape 1 : Configuration des clés API

Édite le fichier `.env` et ajoute tes clés API :

```bash
nano .env
```

**Obligatoire :**
- `OPENAI_API_KEY=sk-...` - Ta clé OpenAI

**Optionnel (à ajouter plus tard) :**
- `VOYAGE_API_KEY=...` - Pour les embeddings (Phase 2)
- `ANTHROPIC_API_KEY=...` - Pour Claude (optionnel)
- `OPENROUTER_API_KEY=...` - Pour OpenRouter (optionnel)

## Étape 2 : Démarrer les services

```bash
# Démarrer PostgreSQL, Qdrant et le backend
docker compose up -d

# Vérifier que tout tourne
docker compose ps

# Voir les logs
docker compose logs -f backend
```

Tu devrais voir :
```
✓ postgres (healthy)
✓ qdrant (healthy)
✓ backend (running)
```

## Étape 3 : Tester l'API

### Option A : Via le navigateur (Swagger UI)

Ouvre http://localhost:8000/docs dans ton navigateur

### Option B : Via le script de test

```bash
# Rendre le script exécutable
chmod +x test_api.sh

# Installer jq si nécessaire (pour formater le JSON)
# Ubuntu/Debian: sudo apt install jq
# Mac: brew install jq

# Exécuter les tests
./test_api.sh
```

### Option C : Commandes manuelles

```bash
# 1. Health check
curl http://localhost:8000/health

# 2. S'inscrire
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ton@email.com",
    "password": "tonpassword",
    "full_name": "Ton Nom"
  }'

# 3. Se connecter
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=ton@email.com&password=tonpassword"

# Copie le "access_token" de la réponse

# 4. Créer un agent
curl -X POST http://localhost:8000/api/agents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TON_TOKEN_ICI" \
  -d '{
    "name": "Mon Agent",
    "description": "Description de mon agent",
    "type": "Customer Service",
    "llm_provider": "openai",
    "model": "gpt-4o-mini"
  }'

# 5. Lister les agents
curl -X GET http://localhost:8000/api/agents \
  -H "Authorization: Bearer TON_TOKEN_ICI"
```

## Étape 4 : Accéder aux interfaces

- **API Documentation** : http://localhost:8000/docs
- **ReDoc** : http://localhost:8000/redoc
- **Qdrant Dashboard** : http://localhost:6333/dashboard
- **Health Check** : http://localhost:8000/health

## 🎉 C'est prêt !

Le backend est maintenant fonctionnel avec :
- ✅ Authentification JWT
- ✅ CRUD Agents
- ✅ PostgreSQL (données)
- ✅ Qdrant (vecteurs - prêt pour RAG)
- ✅ Support multi-LLM (OpenAI, Claude, OpenRouter)

## 🔄 Prochaines étapes

**Phase 2** (en cours) :
- Upload de documents
- Traitement et chunking
- Embeddings (Voyage AI)
- RAG avec Qdrant
- Chat fonctionnel avec LLM

## 🛑 Arrêter les services

```bash
# Arrêter tous les services
docker compose down

# Arrêter et supprimer les données (ATTENTION!)
docker compose down -v
```

## 🐛 Problèmes ?

### Port déjà utilisé
```bash
# Changer les ports dans docker-compose.yml
# Ou arrêter les services qui utilisent ces ports
```

### Base de données vide
```bash
# Réinitialiser la DB
docker compose down -v
docker compose up -d
```

### Voir les logs détaillés
```bash
docker compose logs -f backend
docker compose logs -f postgres
```

## 📞 Support

- Voir le fichier `README.md` pour la documentation complète
- Consulter http://localhost:8000/docs pour l'API interactive
