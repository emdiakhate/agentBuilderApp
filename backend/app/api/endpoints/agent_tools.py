"""
Agent Tools Management Endpoints
Handles adding and managing tools for agents
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from loguru import logger

from app.core.database import get_db
from app.core.security import get_current_user_optional
from app.models.user import User
from app.services.vapi_service import vapi_service

router = APIRouter()


class CreateToolRequest(BaseModel):
    """Request to create a new tool"""
    type: str
    name: str
    description: str


class AddToolsToAgentRequest(BaseModel):
    """Request to add tools to an agent"""
    tool_ids: List[str]
    update_system_prompt: bool = True


@router.get("/vapi/tools")
async def get_vapi_tools(
    current_user: User = Depends(get_current_user_optional)
):
    """
    Get all available tools from Vapi

    Returns:
        List of available tools
    """
    try:
        async with vapi_service.client() as client:
            response = await client.get(
                f"{vapi_service.base_url}/tool",
                headers=vapi_service.headers,
                timeout=30.0
            )
            response.raise_for_status()
            tools = response.json()

        logger.info(f"Retrieved {len(tools)} tools from Vapi")
        return {"tools": tools}

    except Exception as e:
        logger.error(f"Error getting Vapi tools: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get tools: {str(e)}")


@router.post("/vapi/tools/google-calendar")
async def create_google_calendar_tools(
    current_user: User = Depends(get_current_user_optional)
):
    """
    Create Google Calendar tools (event creation and availability check)

    Returns:
        Created tools
    """
    try:
        created_tools = []

        # Create calendar event tool (native Vapi tool - no name/description needed)
        event_tool_payload = {
            "type": "google.calendar.event.create"
        }

        event_response = await vapi_service._make_request(
            method="POST",
            endpoint="/tool",
            payload=event_tool_payload
        )
        created_tools.append(event_response)
        logger.info(f"Created Google Calendar event tool: {event_response.get('id')}")

        # Create availability check tool (native Vapi tool - no name/description needed)
        availability_tool_payload = {
            "type": "google.calendar.availability.check"
        }

        availability_response = await vapi_service._make_request(
            method="POST",
            endpoint="/tool",
            payload=availability_tool_payload
        )
        created_tools.append(availability_response)
        logger.info(f"Created Google Calendar availability tool: {availability_response.get('id')}")

        return {
            "success": True,
            "tools": created_tools,
            "message": "Google Calendar tools created successfully"
        }

    except Exception as e:
        logger.error(f"Error creating Google Calendar tools: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create Google Calendar tools: {str(e)}"
        )


@router.post("/agents/{agent_id}/tools")
async def add_tools_to_agent(
    agent_id: str,
    request: AddToolsToAgentRequest,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Add tools to an agent

    Args:
        agent_id: Agent ID (local DB ID)
        request: Tool IDs to add and whether to update system prompt

    Returns:
        Updated agent configuration
    """
    try:
        from app.models.agent import Agent

        # Get agent from database
        agent = db.query(Agent).filter(
            Agent.id == agent_id,
            Agent.user_id == current_user.id
        ).first()

        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")

        vapi_assistant_id = agent.vapi_assistant_id
        if not vapi_assistant_id:
            raise HTTPException(status_code=400, detail="Agent not synced with Vapi")

        # Get current assistant configuration
        assistant_config = await vapi_service.get_assistant(vapi_assistant_id)

        # Get current tools
        current_tools = assistant_config.get("model", {}).get("tools", [])

        # For each tool ID, fetch the tool to get its type
        new_tools = []
        for tool_id in request.tool_ids:
            try:
                tool = await vapi_service.get_tool(tool_id)
                tool_type = tool.get("type")

                # For native Google Calendar tools, use type with name and description
                if tool_type == "google.calendar.event.create":
                    new_tools.append({
                        "type": tool_type,
                        "name": "scheduleAppointment",
                        "description": "Use this tool to schedule appointments and create calendar events. Notes: - All appointments are 30 mins."
                    })
                elif tool_type == "google.calendar.availability.check":
                    new_tools.append({
                        "type": tool_type,
                        "name": "checkAvailability",
                        "description": "Use this tool to check calendar availability."
                    })
                else:
                    # For custom tools, use toolId
                    new_tools.append({"toolId": tool_id})
            except Exception as e:
                logger.error(f"Error fetching tool {tool_id}: {str(e)}")
                # Fallback to toolId if we can't fetch the tool
                new_tools.append({"toolId": tool_id})

        updated_tools = current_tools + new_tools

        # Build update payload
        update_payload = {
            "model": {
                **assistant_config.get("model", {}),
                "tools": updated_tools
            }
        }

        # Update system prompt if requested
        if request.update_system_prompt:
            calendar_instructions = """

You are a scheduling assistant. When users want to schedule an appointment, first check their availability using the Check Availability tool, then use the Create Event tool to schedule the event if they're available.

- Gather date and time range to check availability.
- To book an appointment, gather the purpose of the appointment, ex: general checkup, dental cleaning and etc.

Notes:
- Use the purpose as summary for booking appointment.
- Current date: {{now}}"""

            current_messages = assistant_config.get("model", {}).get("messages", [])

            # Update or add system message
            system_message_found = False
            for msg in current_messages:
                if msg.get("role") == "system":
                    msg["content"] = msg["content"] + calendar_instructions
                    system_message_found = True
                    break

            if not system_message_found:
                current_messages.insert(0, {
                    "role": "system",
                    "content": calendar_instructions.strip()
                })

            update_payload["model"]["messages"] = current_messages

        # Update assistant in Vapi
        updated_assistant = await vapi_service.update_assistant(
            vapi_assistant_id,
            **update_payload
        )

        logger.info(f"Added {len(request.tool_ids)} tools to agent {agent_id}")

        return {
            "success": True,
            "agent": updated_assistant,
            "message": f"Added {len(request.tool_ids)} tools to agent successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding tools to agent: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to add tools to agent: {str(e)}"
        )


@router.get("/agents/{agent_id}/tools")
async def get_agent_tools(
    agent_id: str,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Get all tools assigned to an agent

    Args:
        agent_id: Agent ID (local DB ID)

    Returns:
        List of tools assigned to the agent
    """
    try:
        from app.models.agent import Agent

        # Get agent from database
        agent = db.query(Agent).filter(
            Agent.id == agent_id,
            Agent.user_id == current_user.id
        ).first()

        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")

        vapi_assistant_id = agent.vapi_assistant_id
        if not vapi_assistant_id:
            return {"tools": []}

        # Get assistant configuration from Vapi
        assistant_config = await vapi_service.get_assistant(vapi_assistant_id)
        tools = assistant_config.get("model", {}).get("tools", [])

        return {
            "tools": tools,
            "count": len(tools)
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting agent tools: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get agent tools: {str(e)}"
        )


@router.delete("/agents/{agent_id}/tools/{tool_id}")
async def remove_tool_from_agent(
    agent_id: str,
    tool_id: str,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Remove a tool from an agent

    Args:
        agent_id: Agent ID (local DB ID)
        tool_id: Tool ID to remove

    Returns:
        Updated agent configuration
    """
    try:
        from app.models.agent import Agent

        # Get agent from database
        agent = db.query(Agent).filter(
            Agent.id == agent_id,
            Agent.user_id == current_user.id
        ).first()

        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")

        vapi_assistant_id = agent.vapi_assistant_id
        if not vapi_assistant_id:
            raise HTTPException(status_code=400, detail="Agent not synced with Vapi")

        # Get current assistant configuration
        assistant_config = await vapi_service.get_assistant(vapi_assistant_id)

        # Remove the tool (handle both custom tools with toolId and native tools with type)
        current_tools = assistant_config.get("model", {}).get("tools", [])
        updated_tools = [
            t for t in current_tools
            if t.get("toolId") != tool_id and t.get("type") != tool_id
        ]

        # Update assistant in Vapi
        updated_assistant = await vapi_service.update_assistant(
            vapi_assistant_id,
            model={
                **assistant_config.get("model", {}),
                "tools": updated_tools
            }
        )

        logger.info(f"Removed tool {tool_id} from agent {agent_id}")

        return {
            "success": True,
            "agent": updated_assistant,
            "message": "Tool removed successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing tool from agent: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to remove tool from agent: {str(e)}"
        )
