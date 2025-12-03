from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON, Integer
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.core.database import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    agent_id = Column(String, ForeignKey("agents.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)

    # Conversation Info
    title = Column(String(500), nullable=True)  # Auto-generated from first message
    channel = Column(String(50), default="chat")  # chat, voice, whatsapp, email

    # Messages stored as JSON array
    # Format: [{"role": "user", "content": "...", "timestamp": "..."}, ...]
    messages = Column(JSON, default=list)

    # Metadata
    metadata = Column(JSON, nullable=True)  # Additional context, tags, etc.

    # Statistics
    message_count = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)

    # Ratings
    rating = Column(Integer, nullable=True)  # 1-5 stars
    feedback = Column(Text, nullable=True)

    # Timestamps
    started_at = Column(DateTime, default=datetime.utcnow)
    last_message_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)

    # Relationships
    agent = relationship("Agent", back_populates="conversations")
    user = relationship("User", back_populates="conversations")
