"""
OAuth Credential Model
Stores OAuth tokens for external service integrations
"""

from sqlalchemy import Column, String, JSON, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class OAuthCredential(Base):
    """OAuth credentials for external integrations"""
    __tablename__ = "oauth_credentials"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)

    # Service identification
    service = Column(String(50), nullable=False)  # google_calendar, outlook, etc.
    service_user_id = Column(String(200), nullable=True)  # User ID in the external service

    # OAuth tokens
    access_token = Column(String(500), nullable=False)
    refresh_token = Column(String(500), nullable=True)
    token_type = Column(String(50), default="Bearer")
    expires_at = Column(DateTime(timezone=True), nullable=True)

    # Scopes and metadata
    scopes = Column(JSON, nullable=True)  # List of granted scopes
    metadata = Column(JSON, nullable=True)  # Additional service-specific data

    # Status
    is_active = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<OAuthCredential(id={self.id}, service={self.service}, user_id={self.user_id})>"
