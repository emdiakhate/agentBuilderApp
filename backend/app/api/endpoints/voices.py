"""
API endpoints for voice management
"""
from fastapi import APIRouter, Query
from typing import List, Dict, Any, Optional
from loguru import logger

from app.services.elevenlabs_service import elevenlabs_service

router = APIRouter()


@router.get("/elevenlabs", response_model=List[Dict[str, Any]])
async def get_elevenlabs_voices(
    accents: Optional[str] = Query(None, description="Comma-separated list of accents to filter (e.g., 'african')"),
    languages: Optional[str] = Query(None, description="Comma-separated list of languages to filter (e.g., 'french,english')")
):
    """
    Get all available Eleven Labs voices with optional filtering

    **Query Parameters:**
    - `accents`: Filter by accent (e.g., "african", "american", "british")
    - `languages`: Filter by language (e.g., "french", "english", "spanish")

    **Example:**
    - `/api/voices/elevenlabs?accents=african&languages=french,english`

    **Returns:**
    List of voice objects with:
    - id: Voice ID for API calls
    - name: Voice name
    - accent: Voice accent
    - language: Supported language
    - age: Age category
    - gender: Gender
    - use_case: Recommended use case
    - preview_url: Audio preview URL
    """
    logger.info(f"Fetching Eleven Labs voices with accents={accents}, languages={languages}")

    # Parse comma-separated values
    accent_list = [a.strip() for a in accents.split(",")] if accents else None
    language_list = [lang.strip() for lang in languages.split(",")] if languages else None

    voices = await elevenlabs_service.get_all_voices(
        accents=accent_list,
        languages=language_list
    )

    return voices


@router.get("/elevenlabs/{voice_id}", response_model=Dict[str, Any])
async def get_elevenlabs_voice_details(voice_id: str):
    """
    Get detailed information about a specific Eleven Labs voice

    **Path Parameters:**
    - `voice_id`: The Eleven Labs voice ID

    **Returns:**
    Detailed voice information including samples and settings
    """
    logger.info(f"Fetching details for voice: {voice_id}")

    voice_details = await elevenlabs_service.get_voice_details(voice_id)

    if not voice_details:
        return {"error": "Voice not found"}

    return voice_details
