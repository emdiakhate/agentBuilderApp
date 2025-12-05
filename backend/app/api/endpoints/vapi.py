"""
Vapi endpoints - Document upload and management via Vapi.ai
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from loguru import logger

from app.core.database import get_db
from app.core.security import get_current_user_optional
from app.models.user import User
from app.models.agent import Agent
from app.services.vapi_service import vapi_service

router = APIRouter()


@router.post("/{agent_id}/upload-document")
async def upload_document_to_vapi(
    agent_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Upload a document to Vapi for the agent's knowledge base
    """

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

    # Check file type
    file_ext = file.filename.split(".")[-1].lower()
    supported_types = ["pdf", "docx", "doc", "txt", "csv", "md", "json", "xml"]
    if file_ext not in supported_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type. Supported: {', '.join(supported_types)}"
        )

    # Check file size (Vapi recommends < 300KB per file)
    file_content = await file.read()
    file_size = len(file_content)
    max_size = 10 * 1024 * 1024  # 10 MB absolute max

    if file_size > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: 10 MB"
        )

    if file_size > 300 * 1024:  # 300KB
        logger.warning(f"File {file.filename} is {file_size/1024:.0f}KB (recommended: <300KB)")

    try:
        # Upload file to Vapi
        uploaded_file = await vapi_service.upload_file(
            file_content=file_content,
            filename=file.filename
        )

        file_id = uploaded_file.get("id")
        logger.info(f"File uploaded to Vapi: {file.filename} (ID: {file_id})")

        # Create or update knowledge base for this agent
        if not agent.vapi_knowledge_base_id:
            # Create new knowledge base
            kb = await vapi_service.create_knowledge_base(
                name=f"KB for {agent.name}",
                files=[file_id]
            )
            agent.vapi_knowledge_base_id = kb.get("id")
            db.commit()
            logger.info(f"Created knowledge base: {agent.vapi_knowledge_base_id}")
        else:
            # TODO: Add file to existing knowledge base
            # Vapi API doesn't have a direct "add file to KB" endpoint yet
            # For now, files are added when KB is created
            pass

        # Update Vapi assistant to use the knowledge base
        if agent.vapi_assistant_id:
            await vapi_service.update_assistant(
                assistant_id=agent.vapi_assistant_id,
                knowledgeBase={
                    "provider": "vapi",
                    "knowledgeBaseId": agent.vapi_knowledge_base_id
                }
            )

        return {
            "message": "Document uploaded successfully",
            "file_id": file_id,
            "filename": file.filename,
            "size": file_size,
            "knowledge_base_id": agent.vapi_knowledge_base_id
        }

    except Exception as e:
        logger.error(f"Error uploading document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload document: {str(e)}"
        )


@router.get("/{agent_id}/files")
async def list_vapi_files(
    agent_id: str,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    List all files uploaded to Vapi

    Note: Vapi doesn't support per-agent file filtering, so this returns all files.
    You should filter by knowledge_base_id on the client side.
    """

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

    try:
        files = await vapi_service.list_files()
        return {
            "files": files,
            "agent_knowledge_base_id": agent.vapi_knowledge_base_id
        }

    except Exception as e:
        logger.error(f"Error listing files: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list files: {str(e)}"
        )


@router.delete("/{agent_id}/files/{file_id}")
async def delete_vapi_file(
    agent_id: str,
    file_id: str,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Delete a file from Vapi
    """

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

    try:
        await vapi_service.delete_file(file_id)
        return {"message": "File deleted successfully", "file_id": file_id}

    except Exception as e:
        logger.error(f"Error deleting file: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete file: {str(e)}"
        )


@router.get("/{agent_id}/vapi-assistant")
async def get_vapi_assistant_details(
    agent_id: str,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Get the full Vapi assistant configuration for an agent
    """

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

    if not agent.vapi_assistant_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No Vapi assistant linked to this agent"
        )

    try:
        assistant_data = await vapi_service.get_assistant(agent.vapi_assistant_id)
        return assistant_data

    except Exception as e:
        logger.error(f"Error fetching Vapi assistant: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch assistant details: {str(e)}"
        )
