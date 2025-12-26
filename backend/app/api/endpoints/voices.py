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

# Cartesia Voices
CARTESIA_VOICES = [
    {
        "id": "65b25c5d-ff07-4687-a04c-da2f43ef6fa9",
        "name": "Helpful French Lady",
        "provider": "cartesia",
        "gender": "female",
        "accent": "French",
        "age": 30,
        "language": "fr",
        "characteristics": ["helpful", "friendly", "professional", "french"],
        "sampleUrl": None,
        "category": "Cartesia Voices"
    },
    {
        "id": "79a125e8-cd45-4c13-8a67-188112f4dd22",
        "name": "British Lady",
        "provider": "cartesia",
        "gender": "female",
        "accent": "British",
        "age": 28,
        "language": "en",
        "characteristics": ["professional", "clear", "british"],
        "sampleUrl": None,
        "category": "Cartesia Voices"
    },
    {
        "id": "a0e99841-438c-4a64-b679-ae501e7d6091",
        "name": "Classy British Man",
        "provider": "cartesia",
        "gender": "male",
        "accent": "British",
        "age": 35,
        "language": "en",
        "characteristics": ["classy", "professional", "british", "deep"],
        "sampleUrl": None,
        "category": "Cartesia Voices"
    },
    {
        "id": "95856005-0332-41b0-935f-352e296aa0df",
        "name": "Professional Man",
        "provider": "cartesia",
        "gender": "male",
        "accent": "American",
        "age": 32,
        "language": "en",
        "characteristics": ["professional", "clear", "confident"],
        "sampleUrl": None,
        "category": "Cartesia Voices"
    },
    {
        "id": "c2ac25f9-ecc4-4f56-9095-651354df60c0",
        "name": "Friendly Woman",
        "provider": "cartesia",
        "gender": "female",
        "accent": "American",
        "age": 26,
        "language": "en",
        "characteristics": ["friendly", "warm", "approachable"],
        "sampleUrl": None,
        "category": "Cartesia Voices"
    },
    {
        "id": "83a5c9b1-1f69-4bb7-9c1e-5d5d3c8b4e0a",
        "name": "Spanish Man",
        "provider": "cartesia",
        "gender": "male",
        "accent": "Spanish",
        "age": 30,
        "language": "es",
        "characteristics": ["spanish", "clear", "professional"],
        "sampleUrl": None,
        "category": "Cartesia Voices"
    }
]

# VAPI Native Voices
VAPI_VOICES = [
    {
        "id": "rohan",
        "name": "Rohan",
        "provider": "vapi",
        "gender": "male",
        "accent": "Indian American",
        "age": 24,
        "language": "multilingual",  # VAPI voices support multiple languages
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
        "language": "multilingual",
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
        "language": "multilingual",
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
        "language": "multilingual",
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
        "language": "multilingual",
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
        "language": "multilingual",
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
        "language": "multilingual",
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
        "language": "multilingual",
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
        "language": "multilingual",
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
        "language": "multilingual",
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

        # Add Cartesia voices
        cartesia_voices = CARTESIA_VOICES.copy()
        if provider is None or provider == "cartesia":
            all_voices.extend(cartesia_voices)

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
            # Include multilingual voices and voices that match the language
            all_voices = [
                v for v in all_voices
                if v.get("language") == "multilingual" or v.get("language", "").startswith(language)
            ]

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
            "id": "cartesia",
            "name": "Cartesia",
            "description": "Ultra-realistic voices with natural expressiveness",
            "enabled": True
        },
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
