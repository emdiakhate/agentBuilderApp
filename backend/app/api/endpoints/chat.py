from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.agent import Agent
from app.models.conversation import Conversation
from app.schemas.conversation import MessageCreate, ConversationResponse

router = APIRouter()


@router.post("/{agent_id}", response_model=dict)
async def send_message(
    agent_id: str,
    message: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a message to an agent and get response"""

    # Check if agent exists and belongs to user
    agent = db.query(Agent).filter(
        Agent.id == agent_id,
        Agent.user_id == current_user.id
    ).first()

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )

    # For now, return a placeholder response
    # In the next step, we'll integrate with LLM providers
    return {
        "message": "Chat endpoint is ready! LLM integration coming in next step.",
        "agent_id": agent_id,
        "user_message": message.content,
        "note": "This is a placeholder. Real LLM integration will be added with multi-provider support."
    }


@router.get("/{agent_id}/conversations", response_model=list[ConversationResponse])
async def get_conversations(
    agent_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all conversations for an agent"""

    # Verify agent ownership
    agent = db.query(Agent).filter(
        Agent.id == agent_id,
        Agent.user_id == current_user.id
    ).first()

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )

    # Get conversations
    conversations = db.query(Conversation).filter(
        Conversation.agent_id == agent_id,
        Conversation.user_id == current_user.id
    ).order_by(Conversation.started_at.desc()).all()

    return conversations
