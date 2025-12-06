from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os


class Settings(BaseSettings):
    """Application settings from environment variables"""

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"  # Ignore extra environment variables
    )

    # Application
    APP_NAME: str = "Agent Builder API"
    VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql://agent_user:agent_password@localhost:5432/agent_saas_db"

    # JWT Authentication
    SECRET_KEY: str = "your-super-secret-jwt-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    # CORS
    CORS_ORIGINS: str = "http://localhost:8080,http://localhost:5173"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    # LLM API Keys
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""

    # Vapi.ai Integration
    VAPI_API_KEY: str = ""

    # File Upload (for potential file validation before Vapi upload)
    MAX_UPLOAD_SIZE_MB: int = 10
    UPLOAD_DIR: str = "uploads"


# Global settings instance
settings = Settings()


# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
