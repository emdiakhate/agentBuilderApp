"""
Templates API Endpoints
Provides access to agent templates
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import logging

from app.core.agent_templates import (
    get_all_templates,
    get_template,
    get_templates_by_category,
    get_template_categories
)
from app.services.agent_factory import AgentFactory
from app.services.vapi_service import VapiService
from app.schemas.agent import AgentResponse
from app.models.agent import Agent

logger = logging.getLogger(__name__)

router = APIRouter()


# Pydantic models
class TemplateListItem(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    category: str


class TemplateDetail(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    category: str
    config: Dict[str, Any]
    tools: List[Dict[str, Any]]


class CreateFromTemplateRequest(BaseModel):
    template_id: str
    customizations: Optional[Dict[str, Any]] = None


# Dependency to get agent factory
def get_agent_factory() -> AgentFactory:
    vapi_service = VapiService()
    return AgentFactory(vapi_service)


@router.get("/", response_model=List[TemplateListItem])
async def list_templates(category: Optional[str] = None):
    """
    List all available agent templates

    Args:
        category: Optional category filter (support, sales, scheduling, data, research)

    Returns:
        List of templates with basic info
    """
    try:
        if category:
            templates = get_templates_by_category(category)
        else:
            templates = get_all_templates()

        return [
            TemplateListItem(
                id=t["id"],
                name=t["name"],
                description=t["description"],
                icon=t["icon"],
                category=t["category"]
            )
            for t in templates
        ]

    except Exception as e:
        logger.error(f"Error listing templates: {str(e)}")
        raise HTTPException(status_code=500, detail="Error listing templates")


@router.get("/categories", response_model=List[str])
async def list_categories():
    """
    Get all template categories

    Returns:
        List of category names
    """
    try:
        return get_template_categories()
    except Exception as e:
        logger.error(f"Error getting categories: {str(e)}")
        raise HTTPException(status_code=500, detail="Error getting categories")


@router.get("/{template_id}", response_model=TemplateDetail)
async def get_template_detail(template_id: str):
    """
    Get detailed information about a specific template

    Args:
        template_id: ID of the template

    Returns:
        Complete template configuration
    """
    try:
        template = get_template(template_id)
        if not template:
            raise HTTPException(status_code=404, detail=f"Template '{template_id}' not found")

        return TemplateDetail(
            id=template["id"],
            name=template["name"],
            description=template["description"],
            icon=template["icon"],
            category=template["category"],
            config=template["config"],
            tools=template.get("tools", [])
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting template {template_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error getting template")


@router.post("/create", response_model=AgentResponse)
async def create_agent_from_template(
    request: CreateFromTemplateRequest,
    factory: AgentFactory = Depends(get_agent_factory)
):
    """
    Create a new agent from a template

    Args:
        request: Template ID and optional customizations
        factory: Agent factory instance

    Returns:
        Created agent
    """
    try:
        # For now, use a default user_id (in production, get from auth)
        user_id = "default_user"

        agent = await factory.create_from_template(
            template_id=request.template_id,
            user_id=user_id,
            customizations=request.customizations
        )

        # Convert to response model
        return AgentResponse(
            id=agent.id,
            user_id=agent.user_id,
            vapi_assistant_id=agent.vapi_assistant_id,
            vapi_knowledge_base_id=agent.vapi_knowledge_base_id,
            name=agent.name,
            description=agent.description,
            type=agent.type,
            status=agent.status,
            avatar=agent.avatar,
            llm_provider=agent.llm_provider,
            model=agent.model,
            temperature=agent.temperature,
            max_tokens=agent.max_tokens,
            voice=agent.voice,
            voice_provider=agent.voice_provider,
            custom_voice_id=agent.custom_voice_id,
            voice_traits=agent.voice_traits,
            purpose=agent.purpose,
            prompt=agent.prompt,
            industry=agent.industry,
            custom_industry=agent.custom_industry,
            bot_function=agent.bot_function,
            custom_function=agent.custom_function,
            channels=agent.channels,
            channel_configs=agent.channel_configs,
            phone=agent.phone,
            email=agent.email,
            avm_score=agent.avm_score,
            interactions=agent.interactions,
            csat=agent.csat,
            performance=agent.performance,
            total_calls=agent.total_calls,
            average_rating=agent.average_rating,
            language=agent.language,
            timezone=agent.timezone,
            capabilities=agent.capabilities,
            is_online=agent.is_online,
            response_time=agent.response_time,
            created_at=agent.created_at,
            updated_at=agent.updated_at
        )

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating agent from template: {str(e)}")
        raise HTTPException(status_code=500, detail="Error creating agent from template")


@router.post("/preview")
async def preview_customized_template(
    template_id: str,
    customizations: Dict[str, Any],
    factory: AgentFactory = Depends(get_agent_factory)
):
    """
    Preview a template with customizations without creating it

    Args:
        template_id: ID of the template
        customizations: Dict of customization values

    Returns:
        Merged template configuration
    """
    try:
        result = factory.customize_template(template_id, customizations)
        return result

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error previewing template: {str(e)}")
        raise HTTPException(status_code=500, detail="Error previewing template")
