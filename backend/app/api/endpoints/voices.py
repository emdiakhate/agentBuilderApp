"""
Voice selection API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any, Optional
from loguru import logger

from app.core.config import settings
from app.core.security import get_current_user_optional
from app.models.user import User
from app.services.elevenlabs_service import ElevenLabsService

router = APIRouter()

# VAPI Native Voices
VAPI_VOICES = [
    {
        "id": "rohan",
        "name": "Rohan",
        "provider": "vapi",
        "gender": "male",
        "accent": "Indian American",
        "age": 24,
        "language": "en",
        "characteristics": ["bright", "optimistic", "cheerful", "energetic"],
        "sampleUrl": "https://docs.vapi.ai/file:72be4cc4-fd1e-4d86-8e59-74801b68066a",
        "category": "Vapi Voices"
    },
    {
        "id": "neha",
        "name": "Neha",
        "provider": "vapi",
        "gender": "female",
        "accent": "Indian American",
        "age": 30,
        "language": "en",
        "characteristics": ["professional", "charming"],
        "sampleUrl": "https://docs.vapi.ai/file:b8908e74-61ee-412d-9b8e-37e08a3d7833",
        "category": "Vapi Voices"
    },
    {
        "id": "hana",
        "name": "Hana",
        "provider": "vapi",
        "gender": "female",
        "accent": "American",
        "age": 22,
        "language": "en",
        "characteristics": ["soft", "soothing", "gentle"],
        "sampleUrl": "https://docs.vapi.ai/file:89067384-0458-4c2f-90ee-cc92a494c975",
        "category": "Vapi Voices"
    },
    {
        "id": "harry",
        "name": "Harry",
        "provider": "vapi",
        "gender": "male",
        "accent": "American",
        "age": 24,
        "language": "en",
        "characteristics": ["clear", "energetic", "professional"],
        "sampleUrl": "https://docs.vapi.ai/file:d214c546-c5a0-4911-8a72-beb75ed1a64e",
        "category": "Vapi Voices"
    },
    {
        "id": "elliot",
        "name": "Elliot",
        "provider": "vapi",
        "gender": "male",
        "accent": "Canadian",
        "age": 25,
        "language": "en",
        "characteristics": ["soothing", "friendly", "professional"],
        "sampleUrl": "https://docs.vapi.ai/file:a3891ed4-5707-4207-a159-e2c3542d0e8d",
        "category": "Vapi Voices"
    },
    {
        "id": "lily",
        "name": "Lily",
        "provider": "vapi",
        "gender": "female",
        "accent": "Asian American",
        "age": 25,
        "language": "en",
        "characteristics": ["bright personality", "bubbly", "cheerful"],
        "sampleUrl": "https://docs.vapi.ai/file:2a71e318-5202-4b64-ba92-94d40443dcd3",
        "category": "Vapi Voices"
    },
    {
        "id": "paige",
        "name": "Paige",
        "provider": "vapi",
        "gender": "female",
        "accent": "American",
        "age": 26,
        "language": "en",
        "characteristics": ["deeper tone", "calming", "professional"],
        "sampleUrl": "https://docs.vapi.ai/file:aa334223-e9e2-4067-9bed-c0b04a0ac8d2",
        "category": "Vapi Voices"
    },
    {
        "id": "cole",
        "name": "Cole",
        "provider": "vapi",
        "gender": "male",
        "accent": "American",
        "age": 22,
        "language": "en",
        "characteristics": ["deeper tone", "calming", "professional"],
        "sampleUrl": "https://docs.vapi.ai/file:b8c1afe2-c2a7-4bcd-b71a-0b3fefafae90",
        "category": "Vapi Voices"
    },
    {
        "id": "savannah",
        "name": "Savannah",
        "provider": "vapi",
        "gender": "female",
        "accent": "Southern American",
        "age": 25,
        "language": "en",
        "characteristics": ["southern american accent"],
        "sampleUrl": "https://docs.vapi.ai/file:13c3ea44-a6e1-4c28-aaac-c27c0f8c434a",
        "category": "Vapi Voices"
    },
    {
        "id": "spencer",
        "name": "Spencer",
        "provider": "vapi",
        "gender": "female",
        "accent": "American",
        "age": 26,
        "language": "en",
        "characteristics": ["energetic", "quippy", "lighthearted", "cheeky", "amused"],
        "sampleUrl": "https://docs.vapi.ai/file:1b35bd21-2bf7-4036-90f2-09d2b1d5cfac",
        "category": "Vapi Voices"
    }
]


@router.get("")
async def get_voices(
    provider: Optional[str] = None,
    gender: Optional[str] = None,
    language: Optional[str] = None,
    current_user: User = Depends(get_current_user_optional)
):
    """
    Get available voices from all providers with optional filters
    """
    try:
        all_voices = []

        # Add VAPI voices
        vapi_voices = VAPI_VOICES.copy()
        if provider is None or provider == "vapi":
            all_voices.extend(vapi_voices)

        # Add ElevenLabs voices if API key is configured
        if settings.ELEVENLABS_API_KEY and not settings.ELEVENLABS_API_KEY.startswith("your-"):
            if provider is None or provider == "eleven-labs":
                try:
                    elevenlabs_service = ElevenLabsService(settings.ELEVENLABS_API_KEY)
                    elevenlabs_voices = await elevenlabs_service.get_voices()

                    # Transform ElevenLabs format
                    for voice in elevenlabs_voices:
                        all_voices.append({
                            "id": voice.get("voice_id"),
                            "name": voice.get("name"),
                            "provider": "eleven-labs",
                            "gender": voice.get("labels", {}).get("gender", "unknown"),
                            "accent": voice.get("labels", {}).get("accent", "unknown"),
                            "language": voice.get("labels", {}).get("language", "en"),
                            "characteristics": list(voice.get("labels", {}).values()) if voice.get("labels") else [],
                            "previewUrl": voice.get("preview_url"),
                            "category": "ElevenLabs"
                        })
                except Exception as e:
                    logger.warning(f"Could not fetch ElevenLabs voices: {e}")

        # Apply filters
        if gender:
            all_voices = [v for v in all_voices if v.get("gender") == gender]

        if language:
            all_voices = [v for v in all_voices if v.get("language", "").startswith(language)]

        categories = list(set(v["category"] for v in all_voices))

        return {
            "voices": all_voices,
            "categories": categories,
            "total": len(all_voices)
        }

    except Exception as e:
        logger.error(f"Error fetching voices: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching voices: {str(e)}"
        )


@router.get("/providers")
async def get_voice_providers(
    current_user: User = Depends(get_current_user_optional)
):
    """
    Get available voice providers
    """
    providers = [
        {
            "id": "vapi",
            "name": "Vapi Voices",
            "description": "Native Vapi voices optimized for low latency",
            "enabled": True
        },
        {
            "id": "eleven-labs",
            "name": "ElevenLabs",
            "description": "High-quality AI voices with custom voice cloning",
            "enabled": bool(settings.ELEVENLABS_API_KEY and not settings.ELEVENLABS_API_KEY.startswith("your-"))
        }
    ]

    return {"providers": providers}
