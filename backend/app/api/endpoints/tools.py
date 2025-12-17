"""
Tools API Endpoints
Manages custom tools for agents
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List
from sqlalchemy.orm import Session
import logging

from app.core.database import get_db
from app.models.tool import Tool
from app.models.user import User
from app.schemas.tool import ToolCreate, ToolUpdate, ToolResponse
from app.api.endpoints.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/", response_model=List[ToolResponse])
async def list_tools(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all tools for the current user"""
    try:
        tools = db.query(Tool).filter(
            Tool.user_id == current_user.id
        ).order_by(Tool.created_at.desc()).all()

        return tools

    except Exception as e:
        logger.error(f"Error listing tools: {str(e)}")
        raise HTTPException(status_code=500, detail="Error listing tools")


@router.post("/", response_model=ToolResponse)
async def create_tool(
    tool_data: ToolCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new custom tool"""
    try:
        # Create tool in database
        tool = Tool(
            user_id=current_user.id,
            name=tool_data.name,
            description=tool_data.description,
            type=tool_data.type,
            function_name=tool_data.function_name,
            function_description=tool_data.function_description,
            parameters=tool_data.parameters.dict() if tool_data.parameters else None,
            server_url=tool_data.server_url,
            server_timeout=tool_data.server_timeout or 20,
            messages=tool_data.messages.dict() if tool_data.messages else None,
            async_mode=tool_data.async_mode or False
        )

        db.add(tool)
        db.commit()
        db.refresh(tool)

        logger.info(f"Created tool: {tool.id} for user {current_user.id}")

        # TODO: Optionally sync with Vapi API to create tool there
        # This would store the vapi_tool_id for future reference

        return tool

    except Exception as e:
        db.rollback()
        logger.error(f"Error creating tool: {str(e)}")
        raise HTTPException(status_code=500, detail="Error creating tool")


@router.get("/{tool_id}", response_model=ToolResponse)
async def get_tool(
    tool_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific tool"""
    try:
        tool = db.query(Tool).filter(
            Tool.id == tool_id,
            Tool.user_id == current_user.id
        ).first()

        if not tool:
            raise HTTPException(status_code=404, detail="Tool not found")

        return tool

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting tool {tool_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error getting tool")


@router.patch("/{tool_id}", response_model=ToolResponse)
async def update_tool(
    tool_id: str,
    tool_data: ToolUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a tool"""
    try:
        tool = db.query(Tool).filter(
            Tool.id == tool_id,
            Tool.user_id == current_user.id
        ).first()

        if not tool:
            raise HTTPException(status_code=404, detail="Tool not found")

        # Update fields
        update_data = tool_data.dict(exclude_unset=True)

        for field, value in update_data.items():
            if field == "parameters" and value:
                setattr(tool, field, value.dict())
            elif field == "messages" and value:
                setattr(tool, field, value.dict())
            else:
                setattr(tool, field, value)

        db.commit()
        db.refresh(tool)

        logger.info(f"Updated tool: {tool.id}")

        return tool

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating tool {tool_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating tool")


@router.delete("/{tool_id}")
async def delete_tool(
    tool_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a tool"""
    try:
        tool = db.query(Tool).filter(
            Tool.id == tool_id,
            Tool.user_id == current_user.id
        ).first()

        if not tool:
            raise HTTPException(status_code=404, detail="Tool not found")

        db.delete(tool)
        db.commit()

        logger.info(f"Deleted tool: {tool.id}")

        return {"success": True, "message": "Tool deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting tool {tool_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting tool")
