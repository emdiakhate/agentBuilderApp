from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.agent import Agent
from app.models.conversation import Conversation
from app.schemas.conversation import MessageCreate, ConversationResponse
from app.services.rag_service import rag_service
from loguru import logger

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    use_rag: bool = True


class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    used_rag: bool
    num_context_chunks: int


@router.post("/{agent_id}", response_model=ChatResponse)
async def send_message(
    agent_id: str,
    chat_request: ChatRequest,
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

        # Prepare agent configuration
        agent_config = {
            "name": agent.name,
            "description": agent.description,
            "type": agent.type,
            "llm_provider": agent.llm_provider,
            "model": agent.model,
            "temperature": agent.temperature,
            "max_tokens": agent.max_tokens,
            "prompt": agent.prompt,
            "purpose": agent.purpose
        }

        # Generate response using RAG
        rag_result = await rag_service.generate_response(
            query=chat_request.message,
            agent_id=agent_id,
            agent_config=agent_config,
            conversation_history=history,
            use_rag=chat_request.use_rag
        )

        # Add messages to conversation
        conversation.messages.append({
            "role": "user",
            "content": chat_request.message,
            "timestamp": datetime.utcnow().isoformat()
        })

        conversation.messages.append({
            "role": "assistant",
            "content": rag_result["response"],
            "timestamp": datetime.utcnow().isoformat(),
            "metadata": {
                "used_rag": rag_result["used_rag"],
                "num_context_chunks": rag_result["num_context_chunks"]
            }
        })

        # Update conversation stats
        conversation.message_count = len(conversation.messages)
        conversation.last_message_at = datetime.utcnow()

        # Update agent metrics
        agent.interactions += 1

        db.commit()

        logger.info(f"Chat response generated for agent {agent_id}")

        return ChatResponse(
            response=rag_result["response"],
            conversation_id=conversation.id,
            used_rag=rag_result["used_rag"],
            num_context_chunks=rag_result["num_context_chunks"]
        )

    except Exception as e:
        logger.error(f"Error in chat: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating response: {str(e)}"
        )


@router.get("/{agent_id}/conversations", response_model=List[ConversationResponse])
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


@router.get("/{agent_id}/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    agent_id: str,
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific conversation"""

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

    # Get conversation
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.agent_id == agent_id,
        Conversation.user_id == current_user.id
    ).first()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    return conversation


@router.delete("/{agent_id}/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    agent_id: str,
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a conversation"""

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

    # Get conversation
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.agent_id == agent_id,
        Conversation.user_id == current_user.id
    ).first()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    db.delete(conversation)
    db.commit()

    return None
