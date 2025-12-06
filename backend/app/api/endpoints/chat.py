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

        # Get previous Vapi chat ID if exists (for context continuity)
        # Vapi maintains conversation context via previousChatId
        previous_chat_id = None
        if conversation.messages:
            # Look for vapi_chat_id in last message metadata
            for msg in reversed(conversation.messages):
                if msg.get("vapi_chat_id"):
                    previous_chat_id = msg["vapi_chat_id"]
                    break

        # Call Vapi Chat API with just the current message
        # Vapi handles context via previousChatId
        vapi_response = await vapi_service.send_chat_message(
            assistant_id=agent.vapi_assistant_id,
            message_content=chat_request.message,
            previous_chat_id=previous_chat_id
        )

        # Extract assistant response from Vapi
        # Log the full response for debugging
        logger.info(f"Vapi chat response: {vapi_response}")

        # Try different possible response formats from Vapi
        assistant_message = None

        # Check if response has 'output' array (Vapi Chat API format)
        if isinstance(vapi_response.get("output"), list):
            # Find the last assistant message in output
            for msg in reversed(vapi_response["output"]):
                if isinstance(msg, dict) and msg.get("role") == "assistant":
                    assistant_message = msg.get("content")
                    break
        # Check if response is a list of messages
        elif isinstance(vapi_response, list):
            # Find the last assistant message
            for msg in reversed(vapi_response):
                if isinstance(msg, dict) and msg.get("role") == "assistant":
                    assistant_message = msg.get("content")
                    break
        # Check if response has a 'messages' array
        elif isinstance(vapi_response.get("messages"), list):
            for msg in reversed(vapi_response["messages"]):
                if isinstance(msg, dict) and msg.get("role") == "assistant":
                    assistant_message = msg.get("content")
                    break
        # Check if response has a 'message' object with 'content'
        elif isinstance(vapi_response.get("message"), dict):
            assistant_message = vapi_response["message"].get("content")
        # Check direct fields
        elif vapi_response.get("message"):
            assistant_message = vapi_response.get("message")
        elif vapi_response.get("content"):
            assistant_message = vapi_response.get("content")
        elif vapi_response.get("text"):
            assistant_message = vapi_response.get("text")

        vapi_chat_id = vapi_response.get("id") or vapi_response.get("chatId") if isinstance(vapi_response, dict) else None

        if not assistant_message:
            # Log full response for debugging
            logger.error(f"Could not extract message from Vapi response: {vapi_response}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Invalid response format from Vapi"
            )

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
