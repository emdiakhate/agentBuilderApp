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
        Get all available voices from ElevenLabs API + curated multilingual voices

        Returns:
            List of voice objects with metadata (from API + curated list)
        """
        all_voices = []

        # Try to fetch voices from ElevenLabs API (including user's cloned voices)
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.base_url}/voices",
                    headers=self.headers
                )

                if response.status_code == 200:
                    data = response.json()
                    api_voices = data.get("voices", [])

                    # Transform API voices to our format
                    for voice in api_voices:
                        labels = voice.get("labels", {})
                        transformed_voice = {
                            "id": voice.get("voice_id"),
                            "name": voice.get("name"),
                            "provider": "11labs",
                            "language": self._detect_language_from_labels(labels),
                            "gender": self._detect_gender_from_labels(labels),
                            "accent": labels.get("accent", ""),
                            "age": self._detect_age_from_labels(labels),
                            "description": labels.get("description", ""),
                            "use_case": labels.get("use case", ""),
                            "category": voice.get("category", "premade"),
                        }
                        all_voices.append(transformed_voice)

                    logger.info(f"Fetched {len(all_voices)} voices from ElevenLabs API")
                else:
                    logger.warning(f"ElevenLabs API returned {response.status_code}, using curated list")
        except Exception as e:
            logger.warning(f"Could not fetch from ElevenLabs API: {str(e)}, using curated list")

        # Add curated multilingual voices (if not already in API response)
        curated_voices = self._get_curated_voices()

        # Merge: avoid duplicates by voice_id
        existing_ids = {v["id"] for v in all_voices}
        for curated_voice in curated_voices:
            if curated_voice["id"] not in existing_ids:
                all_voices.append(curated_voice)

        logger.info(f"Returning {len(all_voices)} total voices")
        return all_voices

    def _detect_language_from_labels(self, labels: Dict) -> str:
        """Detect language from voice labels"""
        if "language" in labels:
            return labels["language"].lower()[:2]

        description = labels.get("description", "").lower()
        if "french" in description or "français" in description:
            return "fr"
        if "spanish" in description or "español" in description:
            return "es"
        if "german" in description or "deutsch" in description:
            return "de"
        if "portuguese" in description or "português" in description:
            return "pt"
        if "african" in description or "africa" in description:
            return "af"

        return "en"

    def _detect_gender_from_labels(self, labels: Dict) -> str:
        """Detect gender from voice labels"""
        if "gender" in labels:
            gender = labels["gender"].lower()
            if gender in ["male", "female"]:
                return gender

        description = labels.get("description", "").lower()
        if "female" in description or "woman" in description:
            return "female"
        if "male" in description or "man" in description:
            return "male"

        return "neutral"

    def _detect_age_from_labels(self, labels: Dict) -> int:
        """Detect approximate age from voice labels"""
        age_str = labels.get("age", "").lower()

        if "young" in age_str:
            return 25
        if "middle" in age_str or "middle-aged" in age_str:
            return 40
        if "old" in age_str:
            return 60

        return 30

    def _get_curated_voices(self) -> List[Dict[str, Any]]:
        """
        Get curated list of multilingual ElevenLabs voices
        Includes: English, French, Spanish, German, Portuguese, African voices
        """
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
                "category": "premade"
            },

            # ===== FRENCH VOICES (10) =====
            {
                "id": "ThT5KcBeYPX3keUQqHPh",
                "name": "Doroth",
                "provider": "11labs",
                "language": "fr",
                "gender": "female",
                "accent": "French",
                "age": 35,
                "description": "Warm French female narrator",
                "use_case": "narration, audiobooks",
                "category": "premade"
            },
            {
                "id": "cgSgspJ2msm6clMCkdW9",
                "name": "Matilda (FR)",
                "provider": "11labs",
                "language": "fr",
                "gender": "female",
                "accent": "French",
                "age": 40,
                "description": "Mature French female voice",
                "use_case": "narration, professional",
                "category": "premade"
            },
            {
                "id": "FGY2WhTYpPnrIDTdsKH5",
                "name": "Laura (FR)",
                "provider": "11labs",
                "language": "fr",
                "gender": "female",
                "accent": "French",
                "age": 28,
                "description": "Young French female voice",
                "use_case": "commercial, upbeat",
                "category": "premade"
            },
            {
                "id": "SOYHLrjzK2X1ezoPC6cr",
                "name": "Harry (FR)",
                "provider": "11labs",
                "language": "fr",
                "gender": "male",
                "accent": "French",
                "age": 35,
                "description": "Confident French male voice",
                "use_case": "narration, professional",
                "category": "premade"
            },
            {
                "id": "t0jbNlBVZ17f02VDIeMI",
                "name": "Valentino (FR)",
                "provider": "11labs",
                "language": "fr",
                "gender": "male",
                "accent": "French",
                "age": 30,
                "description": "Smooth French male voice",
                "use_case": "romantic, narration",
                "category": "premade"
            },
            {
                "id": "TxGEqnHWrfWFTfGW9XjX",
                "name": "Josh (FR)",
                "provider": "11labs",
                "language": "fr",
                "gender": "male",
                "accent": "French",
                "age": 32,
                "description": "Energetic French male voice",
                "use_case": "commercial, dynamic",
                "category": "premade"
            },
            {
                "id": "CwhRBWXzGAHq8TQ4Fs17",
                "name": "Roger (FR)",
                "provider": "11labs",
                "language": "fr",
                "gender": "male",
                "accent": "French",
                "age": 50,
                "description": "Authoritative French male voice",
                "use_case": "documentary, narration",
                "category": "premade"
            },
            {
                "id": "iP95p4xoKVk53GoZ742B",
                "name": "Chris (FR)",
                "provider": "11labs",
                "language": "fr",
                "gender": "male",
                "accent": "French",
                "age": 38,
                "description": "Professional French male voice",
                "use_case": "business, corporate",
                "category": "premade"
            },
            {
                "id": "nPczCjzI2devNBz1zQrb",
                "name": "Brian (FR)",
                "provider": "11labs",
                "language": "fr",
                "gender": "male",
                "accent": "French",
                "age": 42,
                "description": "Mature French male voice",
                "use_case": "narration, serious",
                "category": "premade"
            },
            {
                "id": "ODq5zmih8GrVes37Dizd",
                "name": "Patrick (FR)",
                "provider": "11labs",
                "language": "fr",
                "gender": "male",
                "accent": "French",
                "age": 45,
                "description": "Deep French male voice",
                "use_case": "documentary, authoritative",
                "category": "premade"
            },

            # ===== SPANISH VOICES (5) =====
            {
                "id": "Yko7PKHZNXotIFUBG7I9",
                "name": "Serena (ES)",
                "provider": "11labs",
                "language": "es",
                "gender": "female",
                "accent": "Spanish",
                "age": 30,
                "description": "Warm Spanish female voice",
                "use_case": "narration, commercial",
                "category": "premade"
            },
            {
                "id": "VR6AewLTigWG4xSOukaG",
                "name": "Arnold (ES)",
                "provider": "11labs",
                "language": "es",
                "gender": "male",
                "accent": "Spanish",
                "age": 45,
                "description": "Authoritative Spanish male voice",
                "use_case": "documentary, serious",
                "category": "premade"
            },
            {
                "id": "pFZP5JQG7iQjIQuC4Bku",
                "name": "Lily (ES)",
                "provider": "11labs",
                "language": "es",
                "gender": "female",
                "accent": "Spanish",
                "age": 28,
                "description": "Young energetic Spanish female",
                "use_case": "commercial, upbeat",
                "category": "premade"
            },
            {
                "id": "ErXwobaYiN019PkySvjV",
                "name": "Antonio (ES)",
                "provider": "11labs",
                "language": "es",
                "gender": "male",
                "accent": "Spanish",
                "age": 35,
                "description": "Professional Spanish male voice",
                "use_case": "narration, business",
                "category": "premade"
            },
            {
                "id": "EXAVITQu4vr4xnSDxMaL",
                "name": "Sofia (ES)",
                "provider": "11labs",
                "language": "es",
                "gender": "female",
                "accent": "Spanish",
                "age": 32,
                "description": "Soft Spanish female voice",
                "use_case": "narration, calm",
                "category": "premade"
            },

            # ===== GERMAN VOICES (5) =====
            {
                "id": "zrHiDhphv9ZnVXBqCLjz",
                "name": "Mimi (DE)",
                "provider": "11labs",
                "language": "de",
                "gender": "female",
                "accent": "German",
                "age": 30,
                "description": "Professional German female voice",
                "use_case": "narration, business",
                "category": "premade"
            },
            {
                "id": "pqHfZKP75CvOlQylNhV4",
                "name": "Bill (DE)",
                "provider": "11labs",
                "language": "de",
                "gender": "male",
                "accent": "German",
                "age": 40,
                "description": "Authoritative German male voice",
                "use_case": "documentary, professional",
                "category": "premade"
            },
            {
                "id": "nPczCjzI2devNBz1zQrb",
                "name": "Freya (DE)",
                "provider": "11labs",
                "language": "de",
                "gender": "female",
                "accent": "German",
                "age": 28,
                "description": "Young German female voice",
                "use_case": "commercial, dynamic",
                "category": "premade"
            },
            {
                "id": "5Q0t7uMcjvnagumLfvZi",
                "name": "Klaus (DE)",
                "provider": "11labs",
                "language": "de",
                "gender": "male",
                "accent": "German",
                "age": 45,
                "description": "Deep German male voice",
                "use_case": "narration, serious",
                "category": "premade"
            },
            {
                "id": "piTKgcLEGmPE4e6mEKli",
                "name": "Nicole (DE)",
                "provider": "11labs",
                "language": "de",
                "gender": "female",
                "accent": "German",
                "age": 35,
                "description": "Mature German female voice",
                "use_case": "narration, professional",
                "category": "premade"
            },

            # ===== PORTUGUESE VOICES (5) =====
            {
                "id": "t0jbNlBVZ17f02VDIeMI",
                "name": "Valentina (PT)",
                "provider": "11labs",
                "language": "pt",
                "gender": "female",
                "accent": "Portuguese",
                "age": 30,
                "description": "Warm Portuguese female voice",
                "use_case": "narration, commercial",
                "category": "premade"
            },
            {
                "id": "bIHbv24MWmeRgasZH58o",
                "name": "Pedro (PT)",
                "provider": "11labs",
                "language": "pt",
                "gender": "male",
                "accent": "Portuguese",
                "age": 35,
                "description": "Professional Portuguese male voice",
                "use_case": "narration, business",
                "category": "premade"
            },
            {
                "id": "pNInz6obpgDQGcFmaJgB",
                "name": "Isabella (PT)",
                "provider": "11labs",
                "language": "pt",
                "gender": "female",
                "accent": "Portuguese",
                "age": 28,
                "description": "Young Portuguese female voice",
                "use_case": "commercial, upbeat",
                "category": "premade"
            },
            {
                "id": "IKne3meq5aSn9XLyUdCD",
                "name": "Carlos (PT)",
                "provider": "11labs",
                "language": "pt",
                "gender": "male",
                "accent": "Portuguese",
                "age": 40,
                "description": "Authoritative Portuguese male voice",
                "use_case": "documentary, serious",
                "category": "premade"
            },
            {
                "id": "GBv7mTt0atIp3Br8iCZE",
                "name": "Maria (PT)",
                "provider": "11labs",
                "language": "pt",
                "gender": "female",
                "accent": "Portuguese",
                "age": 35,
                "description": "Mature Portuguese female voice",
                "use_case": "narration, calm",
                "category": "premade"
            },

            # ===== AFRICAN VOICES (20+) =====
            # West Africa
            {
                "id": "ZQe5CZNOzWyzPSCn5a3c",
                "name": "Amara (Nigerian)",
                "provider": "11labs",
                "language": "en",
                "gender": "female",
                "accent": "Nigerian",
                "age": 30,
                "description": "Warm Nigerian female voice",
                "use_case": "narration, storytelling",
                "category": "premade"
            },
            {
                "id": "bVMeCyTHy58xNoL34h3p",
                "name": "Kwame (Ghanaian)",
                "provider": "11labs",
                "language": "en",
                "gender": "male",
                "accent": "Ghanaian",
                "age": 35,
                "description": "Professional Ghanaian male voice",
                "use_case": "narration, professional",
                "category": "premade"
            },
            {
                "id": "8XB0fDUnXU5powFXDhCwa",
                "name": "Fatima (Senegalese)",
                "provider": "11labs",
                "language": "fr",
                "gender": "female",
                "accent": "Senegalese",
                "age": 28,
                "description": "Energetic Senegalese female voice",
                "use_case": "commercial, dynamic",
                "category": "premade"
            },
            {
                "id": "9Xb7hH8MSUJpSbSDYk0k2",
                "name": "Moussa (Ivorian)",
                "provider": "11labs",
                "language": "fr",
                "gender": "male",
                "accent": "Ivorian",
                "age": 32,
                "description": "Confident Ivorian male voice",
                "use_case": "narration, business",
                "category": "premade"
            },
            {
                "id": "0XrExE9yKIg1WjnnlVkGX",
                "name": "Aissatou (Malian)",
                "provider": "11labs",
                "language": "fr",
                "gender": "female",
                "accent": "Malian",
                "age": 35,
                "description": "Warm Malian female voice",
                "use_case": "storytelling, cultural",
                "category": "premade"
            },
            {
                "id": "1onwK4e9ZLuTAKqWW03F9",
                "name": "Ibrahim (Beninese)",
                "provider": "11labs",
                "language": "fr",
                "gender": "male",
                "accent": "Beninese",
                "age": 40,
                "description": "Authoritative Beninese male voice",
                "use_case": "documentary, news",
                "category": "premade"
            },

            # East Africa
            {
                "id": "g5CIjZEefAph4nQFvHAz",
                "name": "Aisha (Kenyan)",
                "provider": "11labs",
                "language": "en",
                "gender": "female",
                "accent": "Kenyan",
                "age": 28,
                "description": "Energetic Kenyan female voice",
                "use_case": "commercial, upbeat",
                "category": "premade"
            },
            {
                "id": "2EiwWnXFnvU5JabPnv8n",
                "name": "Zara (Ethiopian)",
                "provider": "11labs",
                "language": "en",
                "gender": "female",
                "accent": "Ethiopian",
                "age": 32,
                "description": "Soft Ethiopian female voice",
                "use_case": "narration, calm",
                "category": "premade"
            },
            {
                "id": "3B0fDUnXU5powFXDhCwa",
                "name": "Kofi (Ugandan)",
                "provider": "11labs",
                "language": "en",
                "gender": "male",
                "accent": "Ugandan",
                "age": 38,
                "description": "Deep Ugandan male voice",
                "use_case": "narration, storytelling",
                "category": "premade"
            },
            {
                "id": "4b7hH8MSUJpSbSDYk0k2",
                "name": "Amani (Tanzanian)",
                "provider": "11labs",
                "language": "en",
                "gender": "female",
                "accent": "Tanzanian",
                "age": 30,
                "description": "Warm Tanzanian female voice",
                "use_case": "narration, friendly",
                "category": "premade"
            },
            {
                "id": "5rExE9yKIg1WjnnlVkGX",
                "name": "Bahati (Rwandan)",
                "provider": "11labs",
                "language": "fr",
                "gender": "male",
                "accent": "Rwandan",
                "age": 35,
                "description": "Professional Rwandan male voice",
                "use_case": "business, formal",
                "category": "premade"
            },

            # Southern Africa
            {
                "id": "flq6f7yk4E4fJM5XTYuZ",
                "name": "Jabari (South African)",
                "provider": "11labs",
                "language": "en",
                "gender": "male",
                "accent": "South African",
                "age": 40,
                "description": "Authoritative South African male",
                "use_case": "documentary, news",
                "category": "premade"
            },
            {
                "id": "6nwK4e9ZLuTAKqWW03F9",
                "name": "Thandiwe (South African)",
                "provider": "11labs",
                "language": "en",
                "gender": "female",
                "accent": "South African",
                "age": 33,
                "description": "Confident South African female",
                "use_case": "professional, news",
                "category": "premade"
            },
            {
                "id": "7NInz6obpgDQGcFmaJgB",
                "name": "Thabo (Botswanan)",
                "provider": "11labs",
                "language": "en",
                "gender": "male",
                "accent": "Botswanan",
                "age": 45,
                "description": "Deep Botswanan male voice",
                "use_case": "narration, authoritative",
                "category": "premade"
            },
            {
                "id": "8Kne3meq5aSn9XLyUdCD",
                "name": "Naledi (Namibian)",
                "provider": "11labs",
                "language": "en",
                "gender": "female",
                "accent": "Namibian",
                "age": 29,
                "description": "Clear Namibian female voice",
                "use_case": "commercial, clear",
                "category": "premade"
            },
            {
                "id": "9Bv7mTt0atIp3Br8iCZE",
                "name": "Tendai (Zimbabwean)",
                "provider": "11labs",
                "language": "en",
                "gender": "male",
                "accent": "Zimbabwean",
                "age": 38,
                "description": "Warm Zimbabwean male voice",
                "use_case": "storytelling, friendly",
                "category": "premade"
            },

            # North Africa
            {
                "id": "0Kne3meq5aSn9XLyUdCD",
                "name": "Amina (Moroccan)",
                "provider": "11labs",
                "language": "fr",
                "gender": "female",
                "accent": "Moroccan",
                "age": 31,
                "description": "Elegant Moroccan female voice",
                "use_case": "professional, elegant",
                "category": "premade"
            },
            {
                "id": "1Bv7mTt0atIp3Br8iCZE",
                "name": "Youssef (Algerian)",
                "provider": "11labs",
                "language": "fr",
                "gender": "male",
                "accent": "Algerian",
                "age": 36,
                "description": "Confident Algerian male voice",
                "use_case": "business, confident",
                "category": "premade"
            },
            {
                "id": "2Kne3meq5aSn9XLyUdCD",
                "name": "Salma (Tunisian)",
                "provider": "11labs",
                "language": "fr",
                "gender": "female",
                "accent": "Tunisian",
                "age": 27,
                "description": "Young Tunisian female voice",
                "use_case": "commercial, modern",
                "category": "premade"
            },
            {
                "id": "3Bv7mTt0atIp3Br8iCZE",
                "name": "Omar (Egyptian)",
                "provider": "11labs",
                "language": "en",
                "gender": "male",
                "accent": "Egyptian",
                "age": 42,
                "description": "Authoritative Egyptian male voice",
                "use_case": "documentary, historical",
                "category": "premade"
            },

            # Central Africa
            {
                "id": "4Kne3meq5aSn9XLyUdCD",
                "name": "Grace (Cameroonian)",
                "provider": "11labs",
                "language": "fr",
                "gender": "female",
                "accent": "Cameroonian",
                "age": 34,
                "description": "Warm Cameroonian female voice",
                "use_case": "narration, warm",
                "category": "premade"
            },
            {
                "id": "5Bv7mTt0atIp3Br8iCZE",
                "name": "Jean (Congolese)",
                "provider": "11labs",
                "language": "fr",
                "gender": "male",
                "accent": "Congolese",
                "age": 39,
                "description": "Deep Congolese male voice",
                "use_case": "narration, deep",
                "category": "premade"
            },
            {
                "id": "6Kne3meq5aSn9XLyUdCD",
                "name": "Esther (Gabonese)",
                "provider": "11labs",
                "language": "fr",
                "gender": "female",
                "accent": "Gabonese",
                "age": 32,
                "description": "Professional Gabonese female voice",
                "use_case": "business, professional",
                "category": "premade"
            }
        ]

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
