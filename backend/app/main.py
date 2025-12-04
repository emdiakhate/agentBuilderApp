from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.core.config import settings
from app.core.database import init_db
from app.api.endpoints import auth, agents, chat, documents
from app.services.vector_store_service import vector_store_service

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Multi-LLM AI Agent Platform with RAG",
    debug=settings.DEBUG
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(agents.router, prefix="/api/agents", tags=["Agents"])
app.include_router(documents.router, prefix="/api/agents", tags=["Documents"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])


@app.on_event("startup")
async def startup_event():
    """Initialize database and services on startup"""
    logger.info("Starting up application...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")

    # Initialize database
    init_db()
    logger.info("Database initialized")

    # Create dev user in development mode
    if settings.ENVIRONMENT == "development":
        from app.core.database import SessionLocal
        from app.models.user import User
        from app.core.security import get_password_hash
        import uuid

        db = SessionLocal()
        try:
            dev_user = db.query(User).filter(User.email == "dev@example.com").first()
            if not dev_user:
                dev_user = User(
                    id=str(uuid.uuid4()),
                    email="dev@example.com",
                    hashed_password=get_password_hash("dev123"),
                    full_name="Dev User",
                    is_active=True,
                    is_superuser=False
                )
                db.add(dev_user)
                db.commit()
                logger.info("✅ Dev user created (dev@example.com)")
            else:
                logger.info("✅ Dev user already exists")
        except Exception as e:
            logger.error(f"Could not create dev user: {e}")
            db.rollback()
        finally:
            db.close()

    # Initialize Qdrant collection
    try:
        vector_store_service.ensure_collection()
        logger.info("Qdrant vector store ready")
    except Exception as e:
        logger.warning(f"Could not initialize Qdrant: {e}")
        logger.warning("RAG features will not be available")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "name": settings.APP_NAME,
        "version": settings.VERSION,
        "status": "healthy",
        "environment": settings.ENVIRONMENT
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "database": "connected",
        "version": settings.VERSION
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
