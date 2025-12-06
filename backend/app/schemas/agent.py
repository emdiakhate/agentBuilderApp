from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class AgentBase(BaseModel):
    name: str
    description: Optional[str] = None
    type: str  # AgentTypeCategory
    status: Optional[str] = "draft"
    avatar: Optional[str] = None


class AgentCreate(AgentBase):
    # LLM Configuration
    llm_provider: Optional[str] = "openai"
    model: Optional[str] = "gpt-4o-mini"
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 1000

    # Agent Configuration
    purpose: Optional[str] = None
    prompt: Optional[str] = None
    first_message: Optional[str] = None
    first_message_mode: Optional[str] = "assistant-speaks-first"
    industry: Optional[str] = None
    custom_industry: Optional[str] = None
    bot_function: Optional[str] = None
    custom_function: Optional[str] = None

    # Voice Configuration
    voice: Optional[str] = None
    voice_provider: Optional[str] = None
    custom_voice_id: Optional[str] = None
    voice_traits: Optional[List[Dict[str, Any]]] = None

    # Channels
    channels: Optional[List[str]] = None
    channel_configs: Optional[Dict[str, Any]] = None

    # Contact
    phone: Optional[str] = None
    email: Optional[str] = None

    # Settings
    language: Optional[str] = "Français"
    timezone: Optional[str] = "Europe/Paris"
    capabilities: Optional[List[str]] = None


class AgentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    avatar: Optional[str] = None

    # LLM Configuration
    llm_provider: Optional[str] = None
    model: Optional[str] = None
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None

    # Agent Configuration
    purpose: Optional[str] = None
    prompt: Optional[str] = None
    first_message: Optional[str] = None
    first_message_mode: Optional[str] = None
    industry: Optional[str] = None
    custom_industry: Optional[str] = None
    bot_function: Optional[str] = None
    custom_function: Optional[str] = None

    # Voice Configuration
    voice: Optional[str] = None
    voice_provider: Optional[str] = None
    custom_voice_id: Optional[str] = None
    voice_traits: Optional[List[Dict[str, Any]]] = None

    # Channels
    channels: Optional[List[str]] = None
    channel_configs: Optional[Dict[str, Any]] = None

    # Contact
    phone: Optional[str] = None
    email: Optional[str] = None

    # Settings
    language: Optional[str] = None
    timezone: Optional[str] = None
    capabilities: Optional[List[str]] = None
    is_online: Optional[bool] = None


class AgentResponse(AgentBase):
    id: str
    user_id: str

    # LLM Configuration
    llm_provider: str
    model: str
    temperature: float
    max_tokens: int

    # Agent Configuration
    purpose: Optional[str]
    prompt: Optional[str]
    first_message: Optional[str]
    first_message_mode: Optional[str]
    industry: Optional[str]
    custom_industry: Optional[str]
    bot_function: Optional[str]
    custom_function: Optional[str]

    # Voice Configuration
    voice: Optional[str]
    voice_provider: Optional[str]
    custom_voice_id: Optional[str]
    voice_traits: Optional[List[Dict[str, Any]]]

    # Channels
    channels: Optional[List[str]]
    channel_configs: Optional[Dict[str, Any]]

    # Contact
    phone: Optional[str]
    email: Optional[str]

    # Metrics
    avm_score: float
    interactions: int
    csat: float
    performance: float
    total_calls: int
    average_rating: float

    # Settings
    language: str
    timezone: str
    capabilities: Optional[List[str]]
    is_online: bool
    response_time: str

    # Timestamps
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
