"""
Voice Library endpoints for managing ElevenLabs voices
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Response
from sqlalchemy.orm import Session
from typing import List, Optional
from loguru import logger

from app.core.database import get_db
from app.core.security import get_current_user_optional
from app.models.user import User
from app.services.elevenlabs_service import elevenlabs_service

router = APIRouter()


@router.get("/voices")
async def get_voices(
    provider: Optional[str] = None,
    language: Optional[str] = None,
    gender: Optional[str] = None,
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Get all available voices from ElevenLabs

    Args:
        provider: Filter by provider (11labs)
        language: Filter by language (en, fr, es, de, etc.)
        gender: Filter by gender (male, female, neutral)
        category: Filter by category (premade, cloned, etc.)

    Returns:
        List of available voices
    """
    try:
        voices = await elevenlabs_service.get_voices()

        # Apply filters
        if provider:
            voices = [v for v in voices if v.get("provider") == provider]

        if language:
            voices = [v for v in voices if v.get("language", "").startswith(language)]

        if gender:
            voices = [v for v in voices if v.get("gender") == gender]

        if category:
            voices = [v for v in voices if v.get("category") == category]

        logger.info(f"Retrieved {len(voices)} voices (filtered)")
        return {"voices": voices}

    except Exception as e:
        logger.error(f"Error retrieving voices: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve voices: {str(e)}"
        )


@router.get("/voices/{voice_id}/preview")
async def get_voice_preview(
    voice_id: str,
    text: Optional[str] = None,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Generate an audio preview for a specific voice using ElevenLabs TTS

    Args:
        voice_id: ID of the voice
        text: Custom text to synthesize (optional)

    Returns:
        Audio preview in MP3 format
    """
    try:
        # Use custom text or default preview text
        preview_text = text or "Bonjour! Voici un aperçu de ma voix. Hello! This is a preview of how this voice sounds."

        # Generate preview using ElevenLabs
        audio_data = await elevenlabs_service.generate_preview(voice_id, preview_text)

        return Response(
            content=audio_data,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": f"inline; filename=preview_{voice_id}.mp3",
                "Cache-Control": "public, max-age=3600"
            }
        )

    except Exception as e:
        logger.error(f"Error generating voice preview: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate preview: {str(e)}"
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
    Clone a voice using ElevenLabs Instant Voice Cloning

    Args:
        name: Name for the cloned voice
        description: Description of the voice
        files: Audio files for cloning (1-25 files)

    Returns:
        Cloned voice information including voice_id
    """
    try:
        # Validate files
        if len(files) < 1 or len(files) > 25:
            raise HTTPException(
                status_code=400,
                detail="Veuillez fournir entre 1 et 25 fichiers audio"
            )

        # Validate file sizes and types
        max_size = 25 * 1024 * 1024  # 25MB per file
        allowed_types = ["audio/mpeg", "audio/wav", "audio/x-wav", "audio/mp4", "audio/x-m4a", "audio/mp3"]

        total_duration = 0
        for file in files:
            # Read file to check size
            content = await file.read()
            if len(content) > max_size:
                raise HTTPException(
                    status_code=400,
                    detail=f"Le fichier {file.filename} dépasse la limite de 25MB"
                )

            # Reset file pointer
            await file.seek(0)

        # Clone voice using ElevenLabs service
        result = await elevenlabs_service.clone_voice(
            name=name,
            files=files,
            description=description
        )

        logger.info(f"Voice cloned successfully: {result.get('voice_id')}")
        return {
            "success": True,
            "voice": result,
            "message": "Voix clonée avec succès"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cloning voice: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Échec du clonage de la voix: {str(e)}"
        )


@router.delete("/voices/{voice_id}")
async def delete_voice(
    voice_id: str,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Delete a cloned voice from ElevenLabs

    Args:
        voice_id: ID of the voice to delete

    Returns:
        Success message
    """
    try:
        success = await elevenlabs_service.delete_voice(voice_id)

        if not success:
            raise HTTPException(
                status_code=400,
                detail="Échec de la suppression de la voix"
            )

        logger.info(f"Voice deleted: {voice_id}")
        return {
            "success": True,
            "message": "Voix supprimée avec succès"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting voice: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Échec de la suppression: {str(e)}"
        )
