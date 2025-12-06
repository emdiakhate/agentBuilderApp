from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from loguru import logger

from app.core.database import get_db
from app.core.security import get_current_user_optional
from app.models.user import User
from app.models.agent import Agent
from app.schemas.agent import AgentCreate, AgentUpdate, AgentResponse
from app.services.vapi_service import vapi_service

router = APIRouter()


@router.post("", response_model=AgentResponse, status_code=status.HTTP_201_CREATED)
async def create_agent(
    agent_data: AgentCreate,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Create a new agent and sync with Vapi"""

    try:
        # Prepare first message
        first_message = agent_data.first_message
        if not first_message:
            first_message = f"Bonjour ! Je suis {agent_data.name}. Comment puis-je vous aider ?"

        # Prepare system prompt
        system_prompt = agent_data.prompt
        if not system_prompt:
            system_prompt = f"""Vous êtes {agent_data.name}, un assistant IA.
{agent_data.description or ''}
Votre rôle : {agent_data.type or 'Assistant'}
Objectif : {agent_data.purpose or 'Aider les utilisateurs avec leurs questions'}"""

        # Create Vapi assistant first
        vapi_assistant = await vapi_service.create_assistant(
            name=agent_data.name,
            model=agent_data.model or "gpt-4o-mini",
            voice=agent_data.voice or "jennifer-playht",
            first_message=first_message,
            system_prompt=system_prompt
        )

        # Create local agent with Vapi ID
        new_agent = Agent(
            user_id=current_user.id,
            vapi_assistant_id=vapi_assistant.get("id"),
            **agent_data.model_dump()
        )

        db.add(new_agent)
        db.commit()
        db.refresh(new_agent)

        logger.info(f"Agent created: {new_agent.id} (Vapi: {new_agent.vapi_assistant_id})")
        return new_agent

    except Exception as e:
        logger.error(f"Error creating agent: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create agent: {str(e)}"
        )


@router.get("", response_model=List[AgentResponse])
async def list_agents(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """List all agents for current user"""

    query = db.query(Agent).filter(Agent.user_id == current_user.id)

    # Apply status filter if provided
    if status_filter:
        query = query.filter(Agent.status == status_filter)

    agents = query.order_by(Agent.created_at.desc()).all()
    return agents


@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(
    agent_id: str,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Get a specific agent by ID"""

    agent = db.query(Agent).filter(
        Agent.id == agent_id,
        Agent.user_id == current_user.id
    ).first()

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )

    return agent


@router.patch("/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: str,
    agent_data: AgentUpdate,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Update an agent and sync with Vapi"""

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
        # Update Vapi assistant if it exists
        if agent.vapi_assistant_id:
            vapi_updates = {}
            update_data = agent_data.model_dump(exclude_unset=True)

            # Map fields to Vapi format
            if "name" in update_data:
                vapi_updates["name"] = update_data["name"]
            if "model" in update_data:
                vapi_updates["model"] = {
                    "provider": "openai",
                    "model": update_data["model"]
                }
            if "voice" in update_data:
                vapi_updates["voice"] = {
                    "provider": "playht",
                    "voiceId": update_data["voice"]
                }
            if "prompt" in update_data:
                vapi_updates["model"] = vapi_updates.get("model", {})
                vapi_updates["model"]["systemPrompt"] = update_data["prompt"]
            if "first_message" in update_data:
                vapi_updates["firstMessage"] = update_data["first_message"]

            # Update Vapi if there are changes
            if vapi_updates:
                try:
                    await vapi_service.update_assistant(
                        assistant_id=agent.vapi_assistant_id,
                        **vapi_updates
                    )
                except Exception as vapi_error:
                    # Log but continue - voice config can be fixed in Vapi dashboard
                    logger.warning(f"Failed to update Vapi assistant (will update local only): {vapi_error}")
                    logger.info("Agent will be updated locally. Configure voice/model in Vapi dashboard if needed.")

        # Update local agent fields
        update_data = agent_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(agent, field, value)

        db.commit()
        db.refresh(agent)

        logger.info(f"Agent updated: {agent.id}")
        return agent

    except Exception as e:
        logger.error(f"Error updating agent: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update agent: {str(e)}"
        )


@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent(
    agent_id: str,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Delete an agent and remove from Vapi"""

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
        # Delete from Vapi if assistant exists
        if agent.vapi_assistant_id:
            try:
                await vapi_service.delete_assistant(agent.vapi_assistant_id)
                logger.info(f"Deleted Vapi assistant: {agent.vapi_assistant_id}")
            except Exception as vapi_error:
                # Log but don't fail - continue with local deletion
                logger.warning(f"Failed to delete Vapi assistant: {vapi_error}")

        # Delete local agent
        db.delete(agent)
        db.commit()

        logger.info(f"Agent deleted: {agent_id}")
        return None

    except Exception as e:
        logger.error(f"Error deleting agent: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete agent: {str(e)}"
        )
