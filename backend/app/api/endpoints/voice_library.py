"""
Voice Library endpoints for managing Vapi voices
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from loguru import logger

from app.core.database import get_db
from app.core.security import get_current_user_optional
from app.models.user import User
from app.services.vapi_service import vapi_service

router = APIRouter()


@router.get("/voices")
async def get_voices(
    provider: Optional[str] = None,
    language: Optional[str] = None,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Get all available voices from Vapi

    Args:
        provider: Filter by provider (elevenlabs, cartesia, etc.)
        language: Filter by language (en, fr, etc.)

    Returns:
        List of available voices
    """
    try:
        voices = await vapi_service.get_voices()

        # Apply filters
        if provider:
            voices = [v for v in voices if v.get("provider") == provider]

        if language:
            voices = [v for v in voices if v.get("language", "").startswith(language)]

        logger.info(f"Retrieved {len(voices)} voices")
        return {"voices": voices}

    except Exception as e:
        logger.error(f"Error retrieving voices: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve voices: {str(e)}"
        )


@router.post("/voices/clone")
async def clone_voice(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Clone a voice using ElevenLabs

    Args:
        name: Name for the cloned voice
        description: Description of the voice
        files: Audio files for cloning (1-25 files)

    Returns:
        Cloned voice information
    """
    try:
        # Validate files
        if len(files) < 1 or len(files) > 25:
            raise HTTPException(
                status_code=400,
                detail="Please provide between 1 and 25 audio files"
            )

        # Validate file sizes and types
        max_size = 25 * 1024 * 1024  # 25MB
        allowed_types = ["audio/mpeg", "audio/wav", "audio/x-wav", "audio/mp4", "audio/x-m4a"]

        for file in files:
            # Read file to check size
            content = await file.read()
            if len(content) > max_size:
                raise HTTPException(
                    status_code=400,
                    detail=f"File {file.filename} exceeds 25MB limit"
                )

            # Reset file pointer
            await file.seek(0)

        # Clone voice using Vapi service
        result = await vapi_service.clone_voice(
            name=name,
            description=description,
            audio_files=files
        )

        logger.info(f"Voice cloned successfully: {result.get('voice_id')}")
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cloning voice: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to clone voice: {str(e)}"
        )


@router.delete("/voices/{voice_id}")
async def delete_voice(
    voice_id: str,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Delete a cloned voice

    Args:
        voice_id: ID of the voice to delete

    Returns:
        Success message
    """
    try:
        result = await vapi_service.delete_voice(voice_id)

        logger.info(f"Voice deleted: {voice_id}")
        return {"success": True, "message": "Voice deleted successfully"}

    except Exception as e:
        logger.error(f"Error deleting voice: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete voice: {str(e)}"
        )
