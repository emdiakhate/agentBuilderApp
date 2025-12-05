"""
Chat endpoints - Text chat using Vapi Chat API
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from loguru import logger

from app.core.database import get_db
from app.core.security import get_current_user_optional
from app.models.user import User
from app.models.agent import Agent
from app.models.conversation import Conversation
from app.services.vapi_service import vapi_service

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
    """Send a text message to an agent using Vapi Chat API"""

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

    # Check if agent has Vapi assistant ID
    if not agent.vapi_assistant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Agent is not configured with Vapi assistant"
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

        # Get conversation history for Vapi
        history = conversation.messages[-10:] if conversation.messages else []

        # Build messages array for Vapi (OpenAI format)
        messages = []

        # Add conversation history (exclude timestamp metadata)
        for msg in history:
            if msg.get("role") in ["user", "assistant"]:
                messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })

        # Add current user message
        messages.append({
            "role": "user",
            "content": chat_request.message
        })

        # Get previous Vapi chat ID if exists (for context continuity)
        previous_chat_id = None
        if conversation.messages:
            # Look for vapi_chat_id in last message metadata
            for msg in reversed(conversation.messages):
                if msg.get("vapi_chat_id"):
                    previous_chat_id = msg["vapi_chat_id"]
                    break

        # Call Vapi Chat API
        vapi_response = await vapi_service.send_chat_message(
            assistant_id=agent.vapi_assistant_id,
            messages=messages,
            previous_chat_id=previous_chat_id
        )

        # Extract assistant response from Vapi
        # Vapi response format may vary, adjust based on actual response
        assistant_message = vapi_response.get("message") or vapi_response.get("content") or vapi_response.get("text")
        vapi_chat_id = vapi_response.get("id") or vapi_response.get("chatId")

        if not assistant_message:
            # Log full response for debugging
            logger.warning(f"Unexpected Vapi response format: {vapi_response}")
            assistant_message = str(vapi_response)

        # Save user message to conversation
        conversation.messages.append({
            "role": "user",
            "content": chat_request.message,
            "timestamp": datetime.utcnow().isoformat()
        })

        # Save assistant message to conversation with Vapi chat ID
        assistant_msg = {
            "role": "assistant",
            "content": assistant_message,
            "timestamp": datetime.utcnow().isoformat()
        }

        if vapi_chat_id:
            assistant_msg["vapi_chat_id"] = vapi_chat_id

        conversation.messages.append(assistant_msg)

        # Update conversation stats
        conversation.message_count = len(conversation.messages)
        conversation.last_message_at = datetime.utcnow()

        # Update agent metrics
        agent.interactions += 1

        db.commit()

        logger.info(f"Chat response generated via Vapi for agent {agent_id}")

        return ChatResponse(
            response=assistant_message,
            conversation_id=conversation.id
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in Vapi chat: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating response from Vapi: {str(e)}"
        )
