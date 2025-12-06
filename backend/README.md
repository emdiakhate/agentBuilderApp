# Agent Builder Backend

Multi-LLM AI Agent Platform with RAG capabilities.

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose installed
- Python 3.11+ (for local development)

### Setup

1. **Configure environment variables:**
   ```bash
   # The .env file is already created with default values
   # Add your API keys:
   nano .env
   ```

   Required API keys:
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `VOYAGE_API_KEY` - Your Voyage AI API key (for embeddings)
   - `ANTHROPIC_API_KEY` - (Optional) Claude API key
   - `OPENROUTER_API_KEY` - (Optional) OpenRouter API key

2. **Start all services with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

   This will start:
   - PostgreSQL database (port 5432)
   - Qdrant vector database (port 6333)
   - FastAPI backend (port 8000)

3. **Check services status:**
   ```bash
   docker-compose ps
   ```

4. **View logs:**
   ```bash
   docker-compose logs -f backend
   ```

### API Documentation

Once running, visit:
- **API Docs (Swagger):** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **Qdrant Dashboard:** http://localhost:6333/dashboard

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login (returns JWT token)
- `GET /api/auth/me` - Get current user info

### Agents
- `POST /api/agents` - Create new agent
- `GET /api/agents` - List all agents (supports `?status=active` filter)
- `GET /api/agents/{id}` - Get specific agent
- `PATCH /api/agents/{id}` - Update agent
- `DELETE /api/agents/{id}` - Delete agent

### Chat
- `POST /api/chat/{agent_id}` - Send message to agent
- `GET /api/chat/{agent_id}/conversations` - Get conversation history

## 🧪 Testing the API

### 1. Register a user
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "full_name": "Test User"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=testpass123"
```

Save the `access_token` from the response.

### 3. Create an agent
```bash
curl -X POST http://localhost:8000/api/agents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Customer Support Bot",
    "description": "Helps customers with their questions",
    "type": "Customer Service",
    "llm_provider": "openai",
    "model": "gpt-4o-mini"
  }'
```

### 4. List agents
```bash
curl -X GET http://localhost:8000/api/agents \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🛠️ Development

### Local Development (without Docker)

1. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start PostgreSQL and Qdrant separately:**
   ```bash
   docker-compose up -d postgres qdrant
   ```

4. **Update .env for local development:**
   ```bash
   DATABASE_URL=postgresql://agent_user:agent_password@localhost:5432/agent_saas_db
   QDRANT_HOST=localhost
   ```

5. **Run the application:**
   ```bash
   uvicorn app.main:app --reload
   ```

## 🏗️ Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── endpoints/      # API routes
│   │       ├── auth.py
│   │       ├── agents.py
│   │       └── chat.py
│   ├── core/               # Core configuration
│   │   ├── config.py       # Settings
│   │   ├── database.py     # DB setup
│   │   └── security.py     # Auth & JWT
│   ├── models/             # SQLAlchemy models
│   │   ├── user.py
│   │   ├── agent.py
│   │   ├── document.py
│   │   └── conversation.py
│   ├── schemas/            # Pydantic schemas
│   ├── services/           # Business logic (coming soon)
│   ├── agents/             # LangGraph agents (coming soon)
│   └── main.py             # FastAPI app
├── uploads/                # Uploaded files
├── qdrant_data/            # Vector DB storage
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
└── .env
```

## 🔑 Supported LLM Providers

### OpenAI
Models: `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`, `gpt-3.5-turbo`

### Anthropic (Claude)
Models: `claude-3-5-sonnet-20241022`, `claude-3-5-haiku-20241022`, `claude-3-opus-20240229`

### OpenRouter
Supports both OpenAI and Anthropic models through a unified API.

## 📊 Database Schema

### Users
- Authentication and profile

### Agents
- AI agent configurations
- LLM settings (provider, model, temperature)
- Voice settings
- Channel configurations
- Performance metrics

### Documents
- Uploaded files for RAG
- Processing status
- Chunking metadata

### Conversations
- Chat history
- Messages stored as JSON
- Ratings and feedback

## 🐛 Troubleshooting

### Port already in use
```bash
# Stop existing containers
docker-compose down

# Or change ports in docker-compose.yml
```

### Database connection errors
```bash
# Reset database
docker-compose down -v
docker-compose up -d
```

### View detailed logs
```bash
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f qdrant
```

## 🔄 Next Steps (Phase 2)

- [ ] Document upload & processing
- [ ] RAG implementation with Qdrant
- [ ] LangGraph agent integration
- [ ] Multi-LLM chat functionality
- [ ] Embeddings with Voyage AI
- [ ] Real-time streaming responses

## 📝 License

MIT
