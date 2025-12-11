"""
Tool Model
Represents custom tools that can be used by agents
"""

from sqlalchemy import Column, String, JSON, DateTime, Boolean, Text, ForeignKey, Integer
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class Tool(Base):
    """Custom tool that can be called by agents"""
    __tablename__ = "tools"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)

    # Tool identification
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    type = Column(String(50), default="function")  # function, dtmf, end-call, transfer-call

    # Vapi configuration
    vapi_tool_id = Column(String(100), nullable=True)  # ID from Vapi API

    # Function configuration (for type="function")
    function_name = Column(String(100), nullable=True)
    function_description = Column(Text, nullable=True)
    parameters = Column(JSON, nullable=True)  # JSON Schema for parameters

    # Server configuration
    server_url = Column(String(500), nullable=True)
    server_timeout = Column(Integer, default=20)

    # Messages configuration
    messages = Column(JSON, nullable=True)  # Custom messages for tool execution

    # Advanced settings
    async_mode = Column(Boolean, default=False)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Tool(id={self.id}, name={self.name}, type={self.type})>"
