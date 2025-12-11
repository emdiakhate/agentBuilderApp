"""
Agent Factory Service
Creates agents from templates with customization support
"""

from typing import Dict, Any, Optional
import logging
from app.core.agent_templates import get_template, AGENT_TEMPLATES
from app.services.vapi_service import VapiService
from app.models.agent import Agent
from app.core.database import get_db

logger = logging.getLogger(__name__)


class AgentFactory:
    """Factory for creating agents from templates"""

    def __init__(self, vapi_service: VapiService):
        self.vapi_service = vapi_service

    async def create_from_template(
        self,
        template_id: str,
        user_id: str,
        customizations: Optional[Dict[str, Any]] = None
    ) -> Agent:
        """
        Create an agent from a template with optional customizations

        Args:
            template_id: ID of the template to use
            user_id: ID of the user creating the agent
            customizations: Optional dict of values to override template defaults

        Returns:
            Created Agent instance
        """
        # Get template
        template = get_template(template_id)
        if not template:
            raise ValueError(f"Template '{template_id}' not found")

        # Merge template config with customizations
        config = template["config"].copy()
        if customizations:
            config.update(customizations)

        logger.info(f"Creating agent from template '{template_id}' with config: {config}")

        # Create Vapi assistant
        vapi_assistant = await self.vapi_service.create_assistant(
            name=config.get("name"),
            llm_provider=config.get("llm_provider"),
            model=config.get("model"),
            temperature=config.get("temperature"),
            max_tokens=config.get("max_tokens"),
            prompt=config.get("prompt"),
            first_message=config.get("first_message"),
            first_message_mode=config.get("first_message_mode"),
            voice_provider=config.get("voice_provider"),
            language=config.get("language"),
            background_sound=config.get("background_sound", "off"),
            background_denoising_enabled=config.get("background_denoising_enabled", False)
        )

        # Create database entry
        from sqlalchemy.orm import Session
        db: Session = next(get_db())

        try:
            agent = Agent(
                user_id=user_id,
                vapi_assistant_id=vapi_assistant.get("id"),
                name=config.get("name"),
                description=template.get("description"),
                type=config.get("type"),
                status="draft",
                llm_provider=config.get("llm_provider"),
                model=config.get("model"),
                temperature=config.get("temperature"),
                max_tokens=config.get("max_tokens"),
                prompt=config.get("prompt"),
                purpose=template.get("description"),
                voice_provider=config.get("voice_provider"),
                language=config.get("language"),
                background_sound=config.get("background_sound", "off"),
                background_denoising_enabled=config.get("background_denoising_enabled", False)
            )

            db.add(agent)
            db.commit()
            db.refresh(agent)

            logger.info(f"Agent created successfully from template '{template_id}': {agent.id}")
            return agent

        except Exception as e:
            db.rollback()
            logger.error(f"Error creating agent from template: {str(e)}")
            raise
        finally:
            db.close()

    def get_template_preview(self, template_id: str) -> Optional[Dict[str, Any]]:
        """Get template configuration for preview"""
        template = get_template(template_id)
        if not template:
            return None

        return {
            "id": template["id"],
            "name": template["name"],
            "description": template["description"],
            "icon": template["icon"],
            "category": template["category"],
            "config": template["config"],
            "tools": template.get("tools", [])
        }

    def list_templates(self, category: Optional[str] = None) -> list[Dict[str, Any]]:
        """List all available templates, optionally filtered by category"""
        if category:
            from app.core.agent_templates import get_templates_by_category
            templates = get_templates_by_category(category)
        else:
            from app.core.agent_templates import get_all_templates
            templates = get_all_templates()

        # Return simplified template info for listing
        return [
            {
                "id": t["id"],
                "name": t["name"],
                "description": t["description"],
                "icon": t["icon"],
                "category": t["category"]
            }
            for t in templates
        ]

    def customize_template(
        self,
        template_id: str,
        customizations: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Preview a customized template without creating it

        Args:
            template_id: ID of the template
            customizations: Dict of customization values

        Returns:
            Merged template configuration
        """
        template = get_template(template_id)
        if not template:
            raise ValueError(f"Template '{template_id}' not found")

        config = template["config"].copy()
        config.update(customizations)

        return {
            **template,
            "config": config
        }
