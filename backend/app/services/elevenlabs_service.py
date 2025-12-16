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
        Get all available voices from ElevenLabs API v2

        Returns:
            List of voice objects with metadata
        """
        all_voices = []

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    "https://api.elevenlabs.io/v2/voices",
                    headers={"xi-api-key": self.api_key}
                )

                if response.status_code == 200:
                    data = response.json()
                    api_voices = data.get("voices", [])

                    # Transform API voices to our format
                    for voice in api_voices:
                        labels = voice.get("labels", {})

                        # Extract language and accent
                        language = self._extract_language(voice)
                        accent = labels.get("accent", "")

                        transformed_voice = {
                            "id": voice.get("voice_id"),
                            "name": voice.get("name"),
                            "provider": "11labs",
                            "language": language,
                            "gender": labels.get("gender", self._detect_gender_from_description(voice.get("description", ""))),
                            "accent": accent,
                            "age": self._estimate_age(labels, voice.get("description", "")),
                            "description": voice.get("description", ""),
                            "use_case": labels.get("use case", labels.get("use_case", "")),
                            "category": voice.get("category", "premade"),
                            "previewUrl": voice.get("preview_url", ""),
                        }
                        all_voices.append(transformed_voice)

                    logger.info(f"Fetched {len(all_voices)} voices from ElevenLabs API v2")
                else:
                    logger.error(f"ElevenLabs API returned {response.status_code}: {response.text}")

        except Exception as e:
            logger.error(f"Error fetching voices from ElevenLabs API: {str(e)}")

        logger.info(f"Returning {len(all_voices)} total voices")
        return all_voices

    def _extract_language(self, voice: Dict) -> str:
        """Extract primary language from voice data"""
        # Check verified_languages first
        verified_langs = voice.get("verified_languages", [])
        if verified_langs and len(verified_langs) > 0:
            lang = verified_langs[0].get("language", "")
            if lang:
                return lang.lower()[:2]

        # Check labels
        labels = voice.get("labels", {})
        if "language" in labels:
            return labels["language"].lower()[:2]

        # Check accent for language hints
        accent = labels.get("accent", "").lower()

        # African accents (English)
        if any(x in accent for x in ["nigerian", "ghanaian", "kenyan", "south african",
                                      "ethiopian", "ugandan", "tanzanian", "botswanan",
                                      "namibian", "zimbabwean", "egyptian"]):
            return "en"

        # African accents (French)
        if any(x in accent for x in ["senegalese", "ivorian", "malian", "beninese",
                                      "rwandan", "moroccan", "algerian", "tunisian",
                                      "cameroonian", "congolese", "gabonese"]):
            return "fr"

        # European accents
        if any(x in accent for x in ["french", "français", "parisien"]):
            return "fr"
        if any(x in accent for x in ["spanish", "español", "castilian"]):
            return "es"
        if any(x in accent for x in ["german", "deutsch", "bavarian"]):
            return "de"
        if any(x in accent for x in ["portuguese", "português", "brazilian"]):
            return "pt"

        # Default to English
        return "en"

    def _detect_gender_from_description(self, description: str) -> str:
        """Detect gender from description"""
        desc_lower = description.lower()
        if any(x in desc_lower for x in ["female", "woman", "girl", "lady"]):
            return "female"
        if any(x in desc_lower for x in ["male", "man", "boy", "gentleman"]):
            return "male"
        return "neutral"

    def _estimate_age(self, labels: Dict, description: str) -> int:
        """Estimate age from labels and description"""
        age_str = labels.get("age", "").lower()
        desc_lower = description.lower()

        if "young" in age_str or "young" in desc_lower:
            return 25
        if "middle" in age_str or "middle-aged" in desc_lower:
            return 40
        if "old" in age_str or "elderly" in desc_lower or "senior" in desc_lower:
            return 60
        if "mature" in desc_lower:
            return 45

        return 30
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
