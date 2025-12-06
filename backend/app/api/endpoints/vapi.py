"""
Vapi endpoints - Document upload and management via Vapi.ai
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Dict, Any
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

        # Create or update Query Tool with knowledge base
        if agent.vapi_assistant_id:
            try:
                # Get current assistant to check for existing toolIds
                current_assistant = await vapi_service.get_assistant(agent.vapi_assistant_id)

                # Get existing query tool ID (stored in vapi_knowledge_base_id)
                query_tool_id = agent.vapi_knowledge_base_id
                existing_file_ids = []

                if query_tool_id:
                    # Update existing query tool
                    try:
                        existing_tool = await vapi_service.get_tool(query_tool_id)
                        # Extract existing file IDs from knowledge bases
                        if existing_tool.get("knowledgeBases") and len(existing_tool["knowledgeBases"]) > 0:
                            kb = existing_tool["knowledgeBases"][0]
                            if isinstance(kb.get("fileIds"), list):
                                existing_file_ids = kb["fileIds"]

                        # Add new file (avoid duplicates)
                        if file_id not in existing_file_ids:
                            existing_file_ids.append(file_id)

                        # Update query tool
                        await vapi_service.update_query_tool(
                            tool_id=query_tool_id,
                            file_ids=existing_file_ids,
                            description=f"Knowledge base for {agent.name}"
                        )
                        logger.info(f"Updated query tool {query_tool_id} with file {file_id} (total files: {len(existing_file_ids)})")

                    except Exception as tool_error:
                        logger.warning(f"Could not update existing tool: {tool_error}. Creating new one.")
                        query_tool_id = None

                if not query_tool_id:
                    # Create new query tool
                    query_tool = await vapi_service.create_query_tool(
                        name=f"{agent.name.lower().replace(' ', '-')}-knowledge",
                        file_ids=[file_id],
                        description=f"Knowledge base for {agent.name}"
                    )
                    query_tool_id = query_tool.get("id")

                    # Save query tool ID
                    agent.vapi_knowledge_base_id = query_tool_id
                    db.commit()

                    logger.info(f"Created new query tool: {query_tool_id}")

                # Attach query tool to assistant
                existing_tool_ids = current_assistant.get("model", {}).get("toolIds", [])
                if query_tool_id not in existing_tool_ids:
                    existing_tool_ids.append(query_tool_id)

                # Preserve existing model configuration
                model_config = {
                    "provider": current_assistant.get("model", {}).get("provider", "openai"),
                    "model": current_assistant.get("model", {}).get("model", "gpt-4o-mini"),
                    "toolIds": existing_tool_ids
                }

                # Preserve systemPrompt and enhance it to use documents
                system_prompt = current_assistant.get("model", {}).get("systemPrompt", "")
                if system_prompt and "knowledge" not in system_prompt.lower():
                    system_prompt += "\n\nTu as accès à des documents via un outil de requête. Utilise-les pour répondre aux questions des utilisateurs de manière précise et détaillée."
                elif not system_prompt:
                    system_prompt = f"Tu es {agent.name}. Tu as accès à des documents via un outil de requête. Utilise-les pour répondre aux questions des utilisateurs de manière précise et détaillée."

                model_config["systemPrompt"] = system_prompt

                # Update assistant
                await vapi_service.update_assistant(
                    assistant_id=agent.vapi_assistant_id,
                    model=model_config
                )
                logger.info(f"Attached query tool to assistant {agent.vapi_assistant_id}")

            except Exception as attach_error:
                # Log error but don't fail the upload - file is already on Vapi
                logger.error(f"Failed to attach query tool to assistant: {attach_error}")
                logger.info(f"File uploaded but not attached. Configure manually via Vapi dashboard.")

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


def normalize_vapi_file(vapi_file: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalize Vapi file structure to match frontend expectations

    Vapi file structure may include: id, name, createdAt, updatedAt, bytes, etc.
    Frontend expects: id, filename, original_filename, file_type, file_size, status, uploaded_at
    """
    # Extract file extension from name
    name = vapi_file.get("name", "unknown")
    file_ext = name.rsplit(".", 1)[-1] if "." in name else "file"

    return {
        "id": vapi_file.get("id"),
        "filename": name,
        "original_filename": name,
        "file_type": file_ext.lower(),
        "file_size": vapi_file.get("bytes") or vapi_file.get("size", 0),
        "status": vapi_file.get("status", "completed"),
        "uploaded_at": vapi_file.get("createdAt") or vapi_file.get("created_at"),
        "num_chunks": vapi_file.get("numChunks") or vapi_file.get("num_chunks"),
    }


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
        vapi_files = await vapi_service.list_files()

        # Normalize Vapi file structure to match frontend expectations
        normalized_files = [normalize_vapi_file(f) for f in vapi_files]

        return {
            "files": normalized_files,
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
