from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class MessageCreate(BaseModel):
    content: str
    role: Optional[str] = "user"


class ConversationCreate(BaseModel):
    agent_id: str
    channel: Optional[str] = "chat"
    title: Optional[str] = None


class ConversationResponse(BaseModel):
    id: str
    agent_id: str
    user_id: str
    title: Optional[str]
    channel: str
    messages: List[Dict[str, Any]]
    metadata: Optional[Dict[str, Any]]
    message_count: int
    total_tokens: int
    rating: Optional[int]
    feedback: Optional[str]
    started_at: datetime
    last_message_at: datetime
    ended_at: Optional[datetime]

    class Config:
        from_attributes = True
