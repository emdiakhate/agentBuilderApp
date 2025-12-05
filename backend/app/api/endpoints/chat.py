"""
Chat endpoints - Simple text chat using OpenAI
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from loguru import logger
import openai

from app.core.database import get_db
from app.core.security import get_current_user_optional
from app.core.config import settings
from app.models.user import User
from app.models.agent import Agent
from app.models.conversation import Conversation

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    conversation_id: str


@router.post("/{agent_id}", response_model=ChatResponse)
async def send_message(
    agent_id: str,
    chat_request: ChatRequest,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Send a text message to an agent"""

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

    try:
        # Get or create conversation
        if chat_request.conversation_id:
            conversation = db.query(Conversation).filter(
                Conversation.id == chat_request.conversation_id,
                Conversation.agent_id == agent_id,
                Conversation.user_id == current_user.id
            ).first()

            if not conversation:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Conversation not found"
                )
        else:
            # Create new conversation
            conversation = Conversation(
                agent_id=agent_id,
                user_id=current_user.id,
                channel="chat",
                messages=[]
            )
            db.add(conversation)
            db.commit()
            db.refresh(conversation)

        # Get conversation history (last 10 messages)
        history = conversation.messages[-10:] if conversation.messages else []

        # Build messages for OpenAI
        messages = []

        # System prompt
        system_prompt = agent.prompt or f"""Vous êtes {agent.name}, un assistant IA.
{agent.description or ''}
Votre rôle : {agent.type or 'Assistant'}
Objectif : {agent.purpose or 'Aider les utilisateurs avec leurs questions'}"""

        messages.append({"role": "system", "content": system_prompt})

        # Add conversation history
        for msg in history:
            messages.append({"role": msg["role"], "content": msg["content"]})

        # Add current message
        messages.append({"role": "user", "content": chat_request.message})

        # Call OpenAI
        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.chat.completions.create(
            model=agent.model or "gpt-4o-mini",
            messages=messages,
            temperature=agent.temperature or 0.7,
            max_tokens=agent.max_tokens or 1000
        )

        assistant_message = response.choices[0].message.content

        # Save messages to conversation
        conversation.messages.append({
            "role": "user",
            "content": chat_request.message,
            "timestamp": datetime.utcnow().isoformat()
        })

        conversation.messages.append({
            "role": "assistant",
            "content": assistant_message,
            "timestamp": datetime.utcnow().isoformat()
        })

        # Update conversation stats
        conversation.message_count = len(conversation.messages)
        conversation.last_message_at = datetime.utcnow()

        # Update agent metrics
        agent.interactions += 1

        db.commit()

        logger.info(f"Chat response generated for agent {agent_id}")

        return ChatResponse(
            response=assistant_message,
            conversation_id=conversation.id
        )

    except Exception as e:
        logger.error(f"Error in chat: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating response: {str(e)}"
        )
