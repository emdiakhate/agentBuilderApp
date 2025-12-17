"""
Service for interacting with Eleven Labs API
"""
import httpx
from typing import List, Dict, Any, Optional
from loguru import logger
from app.core.config import settings


class ElevenLabsService:
    """Service for managing Eleven Labs voice operations"""

    def __init__(self):
        self.api_key = settings.ELEVENLABS_API_KEY
        self.base_url = "https://api.elevenlabs.io/v1"
        self.headers = {
            "xi-api-key": self.api_key,
            "Content-Type": "application/json"
        }

    async def get_all_voices(
        self,
        accents: Optional[List[str]] = None,
        languages: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Fetch all available voices from Eleven Labs API with optional filtering

        Args:
            accents: List of accents to filter by (e.g., ["african"])
            languages: List of languages to filter by (e.g., ["french", "english"])

        Returns:
            List of voice objects with id, name, labels, and other metadata
        """
        if not self.api_key:
            logger.warning("Eleven Labs API key not configured")
            return []

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.base_url}/voices",
                    headers=self.headers
                )

                if response.status_code != 200:
                    logger.error(f"Failed to fetch Eleven Labs voices: {response.status_code} - {response.text}")
                    return []

                data = response.json()
                voices = data.get("voices", [])

                logger.info(f"Retrieved {len(voices)} voices from Eleven Labs API")

                # Filter voices based on accents and languages
                filtered_voices = []
                for voice in voices:
                    labels = voice.get("labels", {})

                    # Check accent filter
                    if accents:
                        voice_accent = labels.get("accent", "").lower()
                        accent_match = any(accent.lower() in voice_accent for accent in accents)
                        if not accent_match:
                            continue

                    # Check language filter
                    if languages:
                        voice_language = labels.get("language", "").lower()
                        language_match = any(lang.lower() in voice_language for lang in languages)
                        if not language_match:
                            continue

                    # Transform voice data for frontend compatibility
                    filtered_voices.append({
                        "id": voice.get("voice_id"),
                        "name": voice.get("name"),
                        "accent": labels.get("accent", ""),
                        "language": labels.get("language", ""),
                        "age": labels.get("age", ""),
                        "gender": labels.get("gender", ""),
                        "use_case": labels.get("use case", ""),
                        "description": labels.get("description", ""),
                        "preview_url": voice.get("preview_url", ""),
                        "category": voice.get("category", ""),
                        "labels": labels
                    })

                logger.info(f"Filtered to {len(filtered_voices)} voices matching criteria")
                return filtered_voices

        except httpx.TimeoutException:
            logger.error("Timeout while fetching Eleven Labs voices")
            return []
        except Exception as e:
            logger.error(f"Error fetching Eleven Labs voices: {str(e)}")
            return []

    async def get_voice_details(self, voice_id: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed information about a specific voice

        Args:
            voice_id: The Eleven Labs voice ID

        Returns:
            Voice details or None if not found
        """
        if not self.api_key:
            logger.warning("Eleven Labs API key not configured")
            return None

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.base_url}/voices/{voice_id}",
                    headers=self.headers
                )

                if response.status_code != 200:
                    logger.error(f"Failed to fetch voice details: {response.status_code}")
                    return None

                return response.json()

        except Exception as e:
            logger.error(f"Error fetching voice details: {str(e)}")
            return None


# Singleton instance
elevenlabs_service = ElevenLabsService()
