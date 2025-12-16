"""
ElevenLabs API Service
Handles voice management, TTS generation, and voice cloning
"""
import httpx
from typing import List, Dict, Any, Optional
from loguru import logger
from fastapi import UploadFile

from app.core.config import settings


class ElevenLabsService:
    """Service for interacting with ElevenLabs API"""

    def __init__(self):
        self.api_key = settings.ELEVENLABS_API_KEY
        if not self.api_key:
            logger.warning("ELEVENLABS_API_KEY not set in configuration")

        self.base_url = "https://api.elevenlabs.io/v1"

    @property
    def headers(self):
        """Get headers with current API key"""
        return {
            "xi-api-key": self.api_key,
            "Content-Type": "application/json"
        }

    async def get_voices(self) -> List[Dict[str, Any]]:
        """
        Get curated list of ElevenLabs voices with public preview URLs

        Note: Direct API access is restricted in this environment,
        so we use a curated list of known ElevenLabs voices.

        Returns:
            List of voice objects with metadata
        """
        # Curated list of popular ElevenLabs voices with public preview URLs
        voices = [
            {
                "id": "21m00Tcm4TlvDq8ikWAM",
                "name": "Rachel",
                "provider": "11labs",
                "language": "en",
                "gender": "female",
                "accent": "American",
                "age": 30,
                "description": "Calm, young adult female voice",
                "use_case": "narration, general",
                "previewUrl": "https://storage.googleapis.com/eleven-public-prod/premade/voices/21m00Tcm4TlvDq8ikWAM/cb4e7c50-b509-44c7-904c-f6c1d274cf4c.mp3",
                "category": "premade"
            },
            {
                "id": "2EiwWnXFnvU5JabPnv8n",
                "name": "Clyde",
                "provider": "11labs",
                "language": "en",
                "gender": "male",
                "accent": "American",
                "age": 40,
                "description": "Confident, middle-aged male voice",
                "use_case": "video games, narration",
                "previewUrl": "https://storage.googleapis.com/eleven-public-prod/premade/voices/2EiwWnXFnvU5JabPnv8n/65d80f52-703f-4cae-a91d-75d4e200ed02.mp3",
                "category": "premade"
            },
            {
                "id": "AZnzlk1XvdvUeBnXmlld",
                "name": "Domi",
                "provider": "11labs",
                "language": "en",
                "gender": "female",
                "accent": "American",
                "age": 25,
                "description": "Energetic, young female voice",
                "use_case": "narration, video games",
                "previewUrl": "https://storage.googleapis.com/eleven-public-prod/premade/voices/AZnzlk1XvdvUeBnXmlld/09a7c114-e095-43ff-8c50-82b7c1a1a5fd.mp3",
                "category": "premade"
            },
            {
                "id": "CYw3kZ02Hs0563khs1Fj",
                "name": "Dave",
                "provider": "11labs",
                "language": "en",
                "gender": "male",
                "accent": "British-Essex",
                "age": 35,
                "description": "Conversational, young male voice",
                "use_case": "conversational, video games",
                "previewUrl": "https://storage.googleapis.com/eleven-public-prod/premade/voices/CYw3kZ02Hs0563khs1Fj/5072c5a6-9bde-4e02-ada1-98cf1f8c5a25.mp3",
                "category": "premade"
            },
            {
                "id": "D38z5RcWu1voky8WS1ja",
                "name": "Fin",
                "provider": "11labs",
                "language": "en",
                "gender": "male",
                "accent": "Irish",
                "age": 30,
                "description": "Energetic, Irish male voice",
                "use_case": "video games, animation",
                "previewUrl": "https://storage.googleapis.com/eleven-public-prod/premade/voices/D38z5RcWu1voky8WS1ja/9c5f7ba8-d15a-4c92-88a0-d2d045d86ce5.mp3",
                "category": "premade"
            },
            {
                "id": "EXAVITQu4vr4xnSDxMaL",
                "name": "Sarah",
                "provider": "11labs",
                "language": "en",
                "gender": "female",
                "accent": "American",
                "age": 28,
                "description": "Soft, young female voice",
                "use_case": "news, narration",
                "previewUrl": "https://storage.googleapis.com/eleven-public-prod/premade/voices/EXAVITQu4vr4xnSDxMaL/a916c37d-6e97-4e21-82cf-8c09bc4a3f3a.mp3",
                "category": "premade"
            },
            {
                "id": "ErXwobaYiN019PkySvjV",
                "name": "Antoni",
                "provider": "11labs",
                "language": "en",
                "gender": "male",
                "accent": "American",
                "age": 35,
                "description": "Well-rounded, young male voice",
                "use_case": "narration, general",
                "previewUrl": "https://storage.googleapis.com/eleven-public-prod/premade/voices/ErXwobaYiN019PkySvjV/38a39653-a35f-4d4f-901e-0e0967c8b4c4.mp3",
                "category": "premade"
            },
            {
                "id": "GBv7mTt0atIp3Br8iCZE",
                "name": "Thomas",
                "provider": "11labs",
                "language": "en",
                "gender": "male",
                "accent": "American",
                "age": 45,
                "description": "Mature, calm male voice",
                "use_case": "meditation, narration",
                "previewUrl": "https://storage.googleapis.com/eleven-public-prod/premade/voices/GBv7mTt0atIp3Br8iCZE/be8e50e5-3fd3-44d3-ae56-54dc8ec75c2a.mp3",
                "category": "premade"
            },
            {
                "id": "IKne3meq5aSn9XLyUdCD",
                "name": "Charlie",
                "provider": "11labs",
                "language": "en",
                "gender": "male",
                "accent": "Australian",
                "age": 32,
                "description": "Casual, Australian male voice",
                "use_case": "conversational, casual",
                "previewUrl": "https://storage.googleapis.com/eleven-public-prod/premade/voices/IKne3meq5aSn9XLyUdCD/38a07e0f-d5be-46be-b0c4-c8835e27b3ec.mp3",
                "category": "premade"
            },
            {
                "id": "JBFqnCBsd6RMkjVDRZzb",
                "name": "George",
                "provider": "11labs",
                "language": "en",
                "gender": "male",
                "accent": "British",
                "age": 50,
                "description": "Warm, British narrator voice",
                "use_case": "narration, audiobooks",
                "previewUrl": "https://storage.googleapis.com/eleven-public-prod/premade/voices/JBFqnCBsd6RMkjVDRZzb/e6206d1c-6a0b-4858-aea6-deb58a37157c.mp3",
                "category": "premade"
            },
            {
                "id": "N2lVS1w4EtoT3dr4eOWO",
                "name": "Callum",
                "provider": "11labs",
                "language": "en",
                "gender": "male",
                "accent": "American",
                "age": 28,
                "description": "Intense, energetic male voice",
                "use_case": "video games, action",
                "previewUrl": "https://storage.googleapis.com/eleven-public-prod/premade/voices/N2lVS1w4EtoT3dr4eOWO/7cbb801c-e954-43e3-a08c-416c7231e129.mp3",
                "category": "premade"
            },
            {
                "id": "TX3LPaxmHKxFdv7VOQHJ",
                "name": "Liam",
                "provider": "11labs",
                "language": "en",
                "gender": "male",
                "accent": "American",
                "age": 30,
                "description": "Neutral, articulate male voice",
                "use_case": "narration, general",
                "previewUrl": "https://storage.googleapis.com/eleven-public-prod/premade/voices/TX3LPaxmHKxFdv7VOQHJ/2fe8daaf-a48b-49a9-9a56-cebb41d1f0ea.mp3",
                "category": "premade"
            },
            {
                "id": "XB0fDUnXU5powFXDhCwa",
                "name": "Charlotte",
                "provider": "11labs",
                "language": "en",
                "gender": "female",
                "accent": "Swedish",
                "age": 30,
                "description": "Seductive, Swedish female voice",
                "use_case": "characters, video games",
                "previewUrl": "https://storage.googleapis.com/eleven-public-prod/premade/voices/XB0fDUnXU5powFXDhCwa/942356dc-f10d-4d89-bb0f-1461e7e9371d.mp3",
                "category": "premade"
            },
            {
                "id": "Xb7hH8MSUJpSbSDYk0k2",
                "name": "Alice",
                "provider": "11labs",
                "language": "en",
                "gender": "female",
                "accent": "British",
                "age": 25,
                "description": "Confident, British female voice",
                "use_case": "news, narration",
                "previewUrl": "https://storage.googleapis.com/eleven-public-prod/premade/voices/Xb7hH8MSUJpSbSDYk0k2/fb9fcab3-cacf-4fd5-91b4-81e3d5197e3c.mp3",
                "category": "premade"
            },
            {
                "id": "XrExE9yKIg1WjnnlVkGX",
                "name": "Matilda",
                "provider": "11labs",
                "language": "en",
                "gender": "female",
                "accent": "American",
                "age": 40,
                "description": "Warm, mature female voice",
                "use_case": "audiobooks, narration",
                "previewUrl": "https://storage.googleapis.com/eleven-public-prod/premade/voices/XrExE9yKIg1WjnnlVkGX/aebee950-7c70-49d7-993f-0d0087cd6b4a.mp3",
                "category": "premade"
            },
            {
                "id": "onwK4e9ZLuTAKqWW03F9",
                "name": "Daniel",
                "provider": "11labs",
                "language": "en",
                "gender": "male",
                "accent": "British",
                "age": 45,
                "description": "Deep, authoritative British voice",
                "use_case": "narration, audiobooks",
                "previewUrl": "https://storage.googleapis.com/eleven-public-prod/premade/voices/onwK4e9ZLuTAKqWW03F9/4ea3de07-1bbf-437f-bf3f-f3bb0c375911.mp3",
                "category": "premade"
            },
            {
                "id": "pNInz6obpgDQGcFmaJgB",
                "name": "Adam",
                "provider": "11labs",
                "language": "en",
                "gender": "male",
                "accent": "American",
                "age": 35,
                "description": "Deep, American male voice",
                "use_case": "narration, general",
                "previewUrl": "https://storage.googleapis.com/eleven-public-prod/premade/voices/pNInz6obpgDQGcFmaJgB/8caf8671-fa46-42ae-948e-5e8996c0652b.mp3",
                "category": "premade"
            }
        ]

        logger.info(f"Returning {len(voices)} curated ElevenLabs voices")
        return voices

    def _detect_language(self, voice: Dict) -> str:
        """Detect language from voice labels"""
        labels = voice.get("labels", {})

        # Check for language in various fields
        if "language" in labels:
            return labels["language"].lower()[:2]

        # Check description for language hints
        description = labels.get("description", "").lower()
        if "french" in description or "français" in description:
            return "fr"
        if "spanish" in description or "español" in description:
            return "es"
        if "german" in description or "deutsch" in description:
            return "de"

        # Default to English
        return "en"

    def _detect_gender(self, voice: Dict) -> str:
        """Detect gender from voice labels"""
        labels = voice.get("labels", {})

        if "gender" in labels:
            gender = labels["gender"].lower()
            if gender in ["male", "female"]:
                return gender

        # Check description
        description = labels.get("description", "").lower()
        if "female" in description or "woman" in description:
            return "female"
        if "male" in description or "man" in description:
            return "male"

        return "neutral"

    def _detect_age(self, voice: Dict) -> int:
        """Detect approximate age from voice labels"""
        labels = voice.get("labels", {})
        age_str = labels.get("age", "").lower()

        if "young" in age_str:
            return 25
        if "middle" in age_str or "middle-aged" in age_str:
            return 40
        if "old" in age_str:
            return 60

        return 30  # Default

    async def generate_preview(
        self,
        voice_id: str,
        text: str = "Hello! This is a preview of how this voice sounds."
    ) -> bytes:
        """
        Generate audio preview for a voice using ElevenLabs TTS

        Args:
            voice_id: ElevenLabs voice ID
            text: Text to synthesize (default preview text)

        Returns:
            Audio data as bytes (MP3 format)
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/text-to-speech/{voice_id}",
                    headers=self.headers,
                    json={
                        "text": text,
                        "model_id": "eleven_multilingual_v2",
                        "voice_settings": {
                            "stability": 0.5,
                            "similarity_boost": 0.75,
                        }
                    }
                )

                if response.status_code != 200:
                    logger.error(f"ElevenLabs TTS error: {response.status_code} - {response.text}")
                    raise Exception(f"Failed to generate preview: {response.text}")

                return response.content

        except Exception as e:
            logger.error(f"Error generating preview: {str(e)}")
            raise

    async def clone_voice(
        self,
        name: str,
        files: List[UploadFile],
        description: Optional[str] = None,
        labels: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Clone a voice using provided audio files (Instant Voice Cloning)

        Args:
            name: Name for the cloned voice
            files: List of audio files (at least 1, max 25)
            description: Optional description
            labels: Optional metadata labels

        Returns:
            Voice object with voice_id and metadata
        """
        try:
            # Prepare multipart form data
            form_data = {
                "name": name,
            }

            if description:
                form_data["description"] = description

            if labels:
                form_data["labels"] = str(labels)

            # Prepare files for upload
            files_data = []
            for file in files:
                content = await file.read()
                files_data.append(
                    ("files", (file.filename, content, file.content_type))
                )

            # Remove Content-Type from headers for multipart
            headers = {
                "xi-api-key": self.api_key
            }

            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.base_url}/voices/add",
                    headers=headers,
                    data=form_data,
                    files=files_data
                )

                if response.status_code not in [200, 201]:
                    logger.error(f"ElevenLabs clone error: {response.status_code} - {response.text}")
                    raise Exception(f"Failed to clone voice: {response.text}")

                result = response.json()
                logger.info(f"Successfully cloned voice: {result.get('voice_id')}")

                return {
                    "voice_id": result.get("voice_id"),
                    "name": name,
                    "provider": "11labs",
                    "category": "cloned",
                    "description": description,
                    "labels": labels,
                }

        except Exception as e:
            logger.error(f"Error cloning voice: {str(e)}")
            raise

    async def delete_voice(self, voice_id: str) -> bool:
        """
        Delete a cloned voice

        Args:
            voice_id: ElevenLabs voice ID to delete

        Returns:
            True if successful
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.delete(
                    f"{self.base_url}/voices/{voice_id}",
                    headers=self.headers
                )

                if response.status_code not in [200, 204]:
                    logger.error(f"ElevenLabs delete error: {response.status_code} - {response.text}")
                    return False

                logger.info(f"Successfully deleted voice: {voice_id}")
                return True

        except Exception as e:
            logger.error(f"Error deleting voice: {str(e)}")
            return False

    async def get_voice_settings(self, voice_id: str) -> Dict[str, Any]:
        """
        Get settings for a specific voice

        Args:
            voice_id: ElevenLabs voice ID

        Returns:
            Voice settings object
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.base_url}/voices/{voice_id}/settings",
                    headers=self.headers
                )

                if response.status_code != 200:
                    logger.error(f"ElevenLabs settings error: {response.status_code}")
                    return {}

                return response.json()

        except Exception as e:
            logger.error(f"Error fetching voice settings: {str(e)}")
            return {}


# Singleton instance
elevenlabs_service = ElevenLabsService()
