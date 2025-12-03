from sqlalchemy import Column, String, Text, Boolean, Integer, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.core.database import Base


class Agent(Base):
    __tablename__ = "agents"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)

    # Basic Info
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    type = Column(String(100), nullable=False)  # AgentTypeCategory
    status = Column(String(50), default="draft")  # active, inactive, draft
    avatar = Column(String(500), nullable=True)

    # LLM Configuration
    llm_provider = Column(String(50), default="openai")  # openai, anthropic, openrouter
    model = Column(String(100), default="gpt-4o-mini")
    temperature = Column(Float, default=0.7)
    max_tokens = Column(Integer, default=1000)

    # Voice Configuration (for future)
    voice = Column(String(100), nullable=True)
    voice_provider = Column(String(50), nullable=True)
    custom_voice_id = Column(String(255), nullable=True)
    voice_traits = Column(JSON, nullable=True)  # Array of traits

    # Agent Configuration
    purpose = Column(Text, nullable=True)
    prompt = Column(Text, nullable=True)  # System prompt
    industry = Column(String(100), nullable=True)
    custom_industry = Column(String(255), nullable=True)
    bot_function = Column(String(100), nullable=True)
    custom_function = Column(String(255), nullable=True)

    # Channels
    channels = Column(JSON, nullable=True)  # Array of enabled channels
    channel_configs = Column(JSON, nullable=True)  # Channel-specific configs

    # Contact Info
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)

    # Metrics (calculated/updated periodically)
    avm_score = Column(Float, default=0.0)
    interactions = Column(Integer, default=0)
    csat = Column(Float, default=0.0)
    performance = Column(Float, default=0.0)
    total_calls = Column(Integer, default=0)
    average_rating = Column(Float, default=0.0)

    # Additional Settings
    language = Column(String(50), default="Français")
    timezone = Column(String(100), default="Europe/Paris")
    capabilities = Column(JSON, nullable=True)  # Array of capabilities
    is_online = Column(Boolean, default=False)
    response_time = Column(String(50), default="< 2s")

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="agents")
    documents = relationship("Document", back_populates="agent", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="agent", cascade="all, delete-orphan")
