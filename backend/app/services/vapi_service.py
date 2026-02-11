"""
Vapi Service - Integration with Vapi.ai API
"""

from typing import Dict, Any, List, Optional
import httpx
import mimetypes
from loguru import logger

from app.core.config import settings
from app.core.background_sounds import get_background_sound_url


class VapiService:
    """Service for interacting with Vapi.ai API"""

    def __init__(self):
        self.api_key = settings.VAPI_API_KEY
        self.base_url = "https://api.vapi.ai"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    def client(self):
        """Get an HTTP client for making requests"""
        return httpx.AsyncClient()

    async def _make_request(
        self,
        method: str,
        endpoint: str,
        payload: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Make a request to Vapi API

        Args:
            method: HTTP method (GET, POST, PATCH, DELETE)
            endpoint: API endpoint (e.g., "/tool")
            payload: Request payload for POST/PATCH

        Returns:
            Response JSON
        """
        try:
            async with httpx.AsyncClient() as client:
                url = f"{self.base_url}{endpoint}"

                if method.upper() == "GET":
                    response = await client.get(url, headers=self.headers, timeout=30.0)
                elif method.upper() == "POST":
                    response = await client.post(url, headers=self.headers, json=payload, timeout=30.0)
                elif method.upper() == "PATCH":
                    response = await client.patch(url, headers=self.headers, json=payload, timeout=30.0)
                elif method.upper() == "DELETE":
                    response = await client.delete(url, headers=self.headers, timeout=30.0)
                else:
                    raise ValueError(f"Unsupported HTTP method: {method}")

                response.raise_for_status()
                return response.json()

        except httpx.HTTPStatusError as e:
            logger.error(f"Vapi API error: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Error making Vapi request: {e}")
            raise

    async def create_assistant(
        self,
        name: str,
        model: str = "gpt-4o-mini",
        voice: str = "65b25c5d-ff07-4687-a04c-da2f43ef6fa9",  # Helpful French lady (Cartesia)
        voice_provider: str = "cartesia",
        voice_model: str = "sonic-multilingual",  # Sonic 2 multilingual for French
        voice_config_full: Optional[Dict[str, Any]] = None,  # Full voice configuration
        first_message: Optional[str] = None,
        first_message_mode: str = "assistant-speaks-first",
        system_prompt: Optional[str] = None,
        language: str = "fr",
        background_sound: str = "off",
        background_denoising_enabled: bool = False,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Create a new Vapi assistant

        Args:
            name: Assistant name
            model: LLM model to use
            voice: Voice ID to use (default: Helpful French lady)
            voice_provider: Voice provider (cartesia, playht, elevenlabs, etc.)
            voice_model: Voice model to use (Sonic 2 multilingual for French)
            voice_config_full: Full voice configuration object (if provided, overrides voice/voice_provider/voice_model)
            first_message: First message to say
            first_message_mode: Mode for first message ("assistant-speaks-first" or "assistant-waits")
            system_prompt: System prompt for the assistant
            language: Language for transcription and speech (fr, en, es, etc.)
            **kwargs: Additional Vapi assistant configuration

        Returns:
            Created assistant data including assistant_id
        """
        try:
            # Build voice configuration
            if voice_config_full:
                # Use the full voice configuration if provided
                voice_config = voice_config_full.copy()
            else:
                # Build voice config from individual parameters
                voice_config = {
                    "provider": voice_provider,
                    "voiceId": voice
                }

                # Add model for Cartesia
                if voice_provider == "cartesia":
                    voice_config["model"] = voice_model or "sonic-multilingual"
                # Add config for ElevenLabs
                elif voice_provider in ["11labs", "eleven-labs"]:
                    voice_config["provider"] = "11labs"  # Normalize provider name
                    voice_config["model"] = "eleven_multilingual_v2"
                    voice_config["stability"] = 0.5
                    voice_config["similarityBoost"] = 0.75
                # Azure doesn't need additional config beyond voiceId

            # Map language codes to full language names for instructions
            language_names = {
                "fr": "French (Français)",
                "en": "English",
                "es": "Spanish (Español)",
                "de": "German (Deutsch)",
                "it": "Italian (Italiano)",
                "pt": "Portuguese (Português)",
            }

            # Get the language code (handle both "fr" and "Français")
            lang_code = language.lower()[:2] if language else "fr"
            language_name = language_names.get(lang_code, "French")

            # Add language instruction at the beginning of system prompt
            base_prompt = system_prompt or f"You are {name}, a helpful AI assistant."
            enhanced_prompt = f"""IMPORTANT: You MUST speak in {language_name}. All your responses must be in {language_name}.

{base_prompt}"""

            # Build base payload
            payload = {
                "name": name,
                "model": {
                    "provider": "openai",
                    "model": model,
                    "systemPrompt": enhanced_prompt,
                },
                "voice": voice_config,
                "transcriber": {
                    "provider": "deepgram",
                    "model": "nova-2",
                    "language": lang_code
                },
                "firstMessageMode": first_message_mode,
                **kwargs
            }

            if first_message:
                payload["firstMessage"] = first_message

            # Add background sound configuration
            # Use custom URLs for environments (restaurant, clinic, etc.)
            # or Vapi built-in sounds ("off", "office")
            background_sound_url = get_background_sound_url(background_sound)
            payload["backgroundSound"] = background_sound_url
            logger.info(f"Background sound configured: {background_sound} -> {background_sound_url}")

            # Add background speech denoising if enabled
            if background_denoising_enabled:
                denoising_config = {
                    "smartDenoisingPlan": {
                        "enabled": True
                    }
                }

                # Add Fourier denoising for noisy environments
                if background_sound == "noisy":
                    denoising_config["fourierDenoisingPlan"] = {
                        "enabled": True,
                        "mediaDetectionEnabled": True,
                        "baselineOffsetDb": -10,  # More aggressive filtering
                        "windowSizeMs": 2000,      # Fast adaptation
                        "baselinePercentile": 90   # Focus on clear speech
                    }
                elif background_sound == "home":
                    denoising_config["fourierDenoisingPlan"] = {
                        "enabled": True,
                        "mediaDetectionEnabled": True,  # Essential for TV/music
                        "baselineOffsetDb": -15,
                        "windowSizeMs": 4000,
                        "baselinePercentile": 80
                    }
                elif background_sound == "restaurant" or background_sound == "cafe":
                    denoising_config["fourierDenoisingPlan"] = {
                        "enabled": True,
                        "mediaDetectionEnabled": True,
                        "baselineOffsetDb": -12,
                        "windowSizeMs": 3000,
                        "baselinePercentile": 85
                    }
                elif background_sound == "clinic":
                    denoising_config["fourierDenoisingPlan"] = {
                        "enabled": True,
                        "mediaDetectionEnabled": True,
                        "baselineOffsetDb": -18,  # Quiet environment
                        "windowSizeMs": 3500,
                        "baselinePercentile": 75
                    }

                payload["backgroundSpeechDenoisingPlan"] = denoising_config

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/assistant",
                    headers=self.headers,
                    json=payload,
                    timeout=30.0
                )
                response.raise_for_status()
                result = response.json()

            logger.info(f"Created Vapi assistant: {result.get('id')}")
            return result

        except httpx.HTTPStatusError as e:
            logger.error(f"Error creating assistant: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Error creating assistant: {e}")
            raise

    async def update_assistant(
        self,
        assistant_id: str,
        **updates
    ) -> Dict[str, Any]:
        """
        Update an existing Vapi assistant

        Args:
            assistant_id: Vapi assistant ID
            **updates: Fields to update

        Returns:
            Updated assistant data
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.patch(
                    f"{self.base_url}/assistant/{assistant_id}",
                    headers=self.headers,
                    json=updates,
                    timeout=30.0
                )
                response.raise_for_status()
                result = response.json()

            logger.info(f"Updated Vapi assistant: {assistant_id}")
            return result

        except httpx.HTTPStatusError as e:
            logger.error(f"Error updating assistant: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Error updating assistant: {e}")
            raise

    async def get_assistant(self, assistant_id: str) -> Dict[str, Any]:
        """
        Get assistant details from Vapi

        Args:
            assistant_id: Vapi assistant ID

        Returns:
            Assistant data
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/assistant/{assistant_id}",
                    headers=self.headers,
                    timeout=30.0
                )
                response.raise_for_status()
                return response.json()

        except httpx.HTTPStatusError as e:
            logger.error(f"Error getting assistant: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Error getting assistant: {e}")
            raise

    async def delete_assistant(self, assistant_id: str) -> bool:
        """
        Delete a Vapi assistant

        Args:
            assistant_id: Vapi assistant ID

        Returns:
            True if deleted successfully
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.delete(
                    f"{self.base_url}/assistant/{assistant_id}",
                    headers=self.headers,
                    timeout=30.0
                )
                response.raise_for_status()

            logger.info(f"Deleted Vapi assistant: {assistant_id}")
            return True

        except httpx.HTTPStatusError as e:
            logger.error(f"Error deleting assistant: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Error deleting assistant: {e}")
            raise

    async def create_knowledge_base(
        self,
        name: str,
        files: List[str] = None
    ) -> Dict[str, Any]:
        """
        Create a knowledge base in Vapi

        Args:
            name: Knowledge base name
            files: List of file IDs to add

        Returns:
            Created knowledge base data
        """
        try:
            payload = {
                "name": name,
                "provider": "vapi"
            }

            if files:
                payload["fileIds"] = files

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/knowledge-base",
                    headers=self.headers,
                    json=payload,
                    timeout=30.0
                )
                response.raise_for_status()
                result = response.json()

            logger.info(f"Created knowledge base: {result.get('id')}")
            return result

        except httpx.HTTPStatusError as e:
            logger.error(f"Error creating knowledge base: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Error creating knowledge base: {e}")
            raise

    async def upload_file(
        self,
        file_content: bytes,
        filename: str
    ) -> Dict[str, Any]:
        """
        Upload a file to Vapi

        Args:
            file_content: File bytes
            filename: Original filename

        Returns:
            Uploaded file data including file_id
        """
        try:
            # Detect MIME type from filename
            mime_type, _ = mimetypes.guess_type(filename)
            if not mime_type:
                # Fallback based on file extension
                ext = filename.lower().split('.')[-1]
                mime_map = {
                    'pdf': 'application/pdf',
                    'txt': 'text/plain',
                    'md': 'text/markdown',
                    'csv': 'text/csv',
                    'json': 'application/json',
                    'xml': 'application/xml',
                    'doc': 'application/msword',
                    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'html': 'text/html',
                    'css': 'text/css',
                    'js': 'text/javascript',
                    'ts': 'text/typescript',
                    'yaml': 'application/x-yaml',
                    'yml': 'application/x-yaml',
                }
                mime_type = mime_map.get(ext, 'application/octet-stream')

            logger.info(f"Uploading {filename} with MIME type: {mime_type}")

            files = {
                "file": (filename, file_content, mime_type)
            }

            headers = {
                "Authorization": f"Bearer {self.api_key}"
            }

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/file",
                    headers=headers,
                    files=files,
                    timeout=60.0
                )
                response.raise_for_status()
                result = response.json()

            logger.info(f"Uploaded file to Vapi: {filename}")
            return result

        except httpx.HTTPStatusError as e:
            logger.error(f"Error uploading file: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Error uploading file: {e}")
            raise

    async def list_files(self) -> List[Dict[str, Any]]:
        """
        List all files in Vapi

        Returns:
            List of file data
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/file",
                    headers=self.headers,
                    timeout=30.0
                )
                response.raise_for_status()
                return response.json()

        except httpx.HTTPStatusError as e:
            logger.error(f"Error listing files: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Error listing files: {e}")
            raise

    async def delete_file(self, file_id: str) -> bool:
        """
        Delete a file from Vapi

        Args:
            file_id: Vapi file ID

        Returns:
            True if deleted successfully
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.delete(
                    f"{self.base_url}/file/{file_id}",
                    headers=self.headers,
                    timeout=30.0
                )
                response.raise_for_status()

            logger.info(f"Deleted Vapi file: {file_id}")
            return True

        except httpx.HTTPStatusError as e:
            logger.error(f"Error deleting file: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Error deleting file: {e}")
            raise

    async def send_chat_message(
        self,
        assistant_id: str,
        message_content: str,
        previous_chat_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Send a chat message to a Vapi assistant using Chat API

        Args:
            assistant_id: Vapi assistant ID
            message_content: The user's message content (string)
            previous_chat_id: Optional previous chat ID for context

        Returns:
            Chat response from Vapi including message content and chat ID
        """
        try:
            payload = {
                "assistantId": assistant_id,
                "input": message_content
            }

            if previous_chat_id:
                payload["previousChatId"] = previous_chat_id

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/chat",
                    headers=self.headers,
                    json=payload,
                    timeout=60.0
                )
                response.raise_for_status()
                result = response.json()

            logger.info(f"Sent chat message to assistant: {assistant_id}")
            return result

        except httpx.HTTPStatusError as e:
            logger.error(f"Error sending chat message: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Error sending chat message: {e}")
            raise

    async def create_query_tool(
        self,
        name: str,
        file_ids: List[str],
        description: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a Query Tool with knowledge base for file-based retrieval

        Args:
            name: Name for the query tool function
            file_ids: List of file IDs to include in knowledge base
            description: Optional description of the knowledge base

        Returns:
            Created query tool data including tool ID
        """
        try:
            payload = {
                "type": "query",
                "function": {
                    "name": name
                },
                "knowledgeBases": [
                    {
                        "provider": "canonical",
                        "name": f"{name}-kb",
                        "description": description or "Knowledge base for document retrieval",
                        "fileIds": file_ids
                    }
                ]
            }

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/tool",
                    headers=self.headers,
                    json=payload,
                    timeout=30.0
                )
                response.raise_for_status()
                result = response.json()

            logger.info(f"Created query tool: {result.get('id')}")
            return result

        except httpx.HTTPStatusError as e:
            logger.error(f"Error creating query tool: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Error creating query tool: {e}")
            raise

    async def update_query_tool(
        self,
        tool_id: str,
        file_ids: List[str],
        description: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Update an existing Query Tool with new file IDs

        Args:
            tool_id: Query tool ID to update
            file_ids: Updated list of file IDs
            description: Optional updated description

        Returns:
            Updated query tool data
        """
        try:
            payload = {
                "knowledgeBases": [
                    {
                        "provider": "canonical",
                        "fileIds": file_ids
                    }
                ]
            }

            if description:
                payload["knowledgeBases"][0]["description"] = description

            async with httpx.AsyncClient() as client:
                response = await client.patch(
                    f"{self.base_url}/tool/{tool_id}",
                    headers=self.headers,
                    json=payload,
                    timeout=30.0
                )
                response.raise_for_status()
                result = response.json()

            logger.info(f"Updated query tool: {tool_id}")
            return result

        except httpx.HTTPStatusError as e:
            logger.error(f"Error updating query tool: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Error updating query tool: {e}")
            raise

    async def get_tool(self, tool_id: str) -> Dict[str, Any]:
        """
        Get tool details from Vapi

        Args:
            tool_id: Tool ID

        Returns:
            Tool data
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/tool/{tool_id}",
                    headers=self.headers,
                    timeout=30.0
                )
                response.raise_for_status()
                return response.json()

        except httpx.HTTPStatusError as e:
            logger.error(f"Error getting tool: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Error getting tool: {e}")
            raise

    async def create_function_tool(
        self,
        name: str,
        description: str,
        server_url: str,
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Create a Function Tool for external API calls

        Args:
            name: Tool function name
            description: What the tool does
            server_url: URL of your server endpoint
            parameters: JSON schema for function parameters

        Returns:
            Created tool data including tool ID
        """
        try:
            payload = {
                "type": "function",
                "async": False,
                "function": {
                    "name": name,
                    "description": description,
                    "parameters": parameters
                },
                "server": {
                    "url": server_url
                }
            }

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/tool",
                    headers=self.headers,
                    json=payload,
                    timeout=30.0
                )
                response.raise_for_status()
                result = response.json()

            logger.info(f"Created function tool: {result.get('id')}")
            return result

        except httpx.HTTPStatusError as e:
            logger.error(f"Error creating function tool: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Error creating function tool: {e}")
            raise

    async def create_google_calendar_tool(self, server_base_url: str) -> Dict[str, Any]:
        """
        Create a Google Calendar tool for booking appointments

        Args:
            server_base_url: Base URL of your server (e.g., https://yourdomain.com)

        Returns:
            Created tool data
        """
        parameters = {
            "type": "object",
            "properties": {
                "client_name": {
                    "type": "string",
                    "description": "Nom complet du client"
                },
                "date": {
                    "type": "string",
                    "description": "Date du rendez-vous au format YYYY-MM-DD (exemple: 2024-12-25)"
                },
                "time": {
                    "type": "string",
                    "description": "Heure du rendez-vous au format HH:MM (exemple: 14:30)"
                },
                "duration": {
                    "type": "integer",
                    "description": "Durée du rendez-vous en minutes (par défaut: 60)",
                    "default": 60
                },
                "service_type": {
                    "type": "string",
                    "description": "Type de service ou consultation (optionnel)"
                },
                "notes": {
                    "type": "string",
                    "description": "Notes supplémentaires (optionnel)"
                }
            },
            "required": ["client_name", "date", "time"]
        }

        return await self.create_function_tool(
            name="book_appointment",
            description="Créer un rendez-vous dans Google Calendar. Utiliser cette fonction quand le client souhaite prendre un rendez-vous. Demander toujours le nom complet, la date et l'heure avant d'appeler cette fonction.",
            server_url=f"{server_base_url}/api/tool-webhooks/google-calendar/create-event",
            parameters=parameters
        )

    async def get_calls(
        self,
        assistant_id: Optional[str] = None,
        limit: int = 100,
        created_at_gt: Optional[str] = None,
        created_at_lt: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get calls from Vapi with optional filtering

        Args:
            assistant_id: Filter by assistant ID
            limit: Number of calls to retrieve (max 100)
            created_at_gt: Filter calls created after this date (ISO 8601)
            created_at_lt: Filter calls created before this date (ISO 8601)

        Returns:
            List of call data
        """
        params = {"limit": limit}

        if assistant_id:
            params["assistantId"] = assistant_id
        if created_at_gt:
            params["createdAtGt"] = created_at_gt
        if created_at_lt:
            params["createdAtLt"] = created_at_lt

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/call",
                    headers=self.headers,
                    params=params,
                    timeout=30.0
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Error fetching calls: {e}")
            return []

    async def get_analytics(
        self,
        assistant_id: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get analytics data for calls

        Args:
            assistant_id: Filter by assistant ID
            start_date: Start date for analytics (ISO 8601)
            end_date: End date for analytics (ISO 8601)

        Returns:
            Analytics data including metrics and time series data
        """
        from datetime import datetime
        from collections import defaultdict

        calls = await self.get_calls(
            assistant_id=assistant_id,
            created_at_gt=start_date,
            created_at_lt=end_date,
            limit=100
        )

        # Calculate metrics from calls
        total_calls = len(calls)
        total_minutes = 0
        total_cost = 0
        successful_calls = 0
        end_reasons = {}

        # Time series data grouped by date
        daily_data = defaultdict(lambda: {
            "date": "",
            "calls": 0,
            "minutes": 0,
            "cost": 0,
            "avg_cost": 0
        })

        # Duration by assistant
        assistant_durations = defaultdict(lambda: {"total_minutes": 0, "count": 0})

        for call in calls:
            # Duration in seconds to minutes
            duration = call.get("duration", 0)
            if duration:
                total_minutes += duration / 60

            # Cost
            cost = call.get("cost", 0)
            if cost:
                total_cost += cost

            # Status
            status = call.get("status")
            if status == "ended":
                successful_calls += 1

            # End reason
            end_reason = call.get("endedReason", "unknown")
            end_reasons[end_reason] = end_reasons.get(end_reason, 0) + 1

            # Group by date for time series
            created_at = call.get("createdAt")
            if created_at:
                # Parse ISO date and extract date only
                date_str = created_at.split("T")[0]  # Get YYYY-MM-DD
                daily_data[date_str]["date"] = date_str
                daily_data[date_str]["calls"] += 1
                daily_data[date_str]["minutes"] += duration / 60 if duration else 0
                daily_data[date_str]["cost"] += cost if cost else 0

            # Track duration by assistant
            assistant_id_from_call = call.get("assistantId")
            if assistant_id_from_call and duration:
                assistant_durations[assistant_id_from_call]["total_minutes"] += duration / 60
                assistant_durations[assistant_id_from_call]["count"] += 1

        # Calculate average cost per call for each day
        for date_key in daily_data:
            if daily_data[date_key]["calls"] > 0:
                daily_data[date_key]["avg_cost"] = round(
                    daily_data[date_key]["cost"] / daily_data[date_key]["calls"], 4
                )
            daily_data[date_key]["minutes"] = round(daily_data[date_key]["minutes"], 2)
            daily_data[date_key]["cost"] = round(daily_data[date_key]["cost"], 2)

        # Convert to sorted list
        time_series = sorted(daily_data.values(), key=lambda x: x["date"])

        # Calculate average duration by assistant
        avg_duration_by_assistant = {}
        for assistant_id_key, data in assistant_durations.items():
            if data["count"] > 0:
                avg_duration_by_assistant[assistant_id_key] = round(
                    data["total_minutes"] / data["count"], 2
                )

        avg_cost_per_call = total_cost / total_calls if total_calls > 0 else 0
        avg_duration = total_minutes / total_calls if total_calls > 0 else 0

        return {
            "total_calls": total_calls,
            "total_minutes": round(total_minutes, 2),
            "total_cost": round(total_cost, 2),
            "avg_cost_per_call": round(avg_cost_per_call, 4),
            "avg_duration_minutes": round(avg_duration, 2),
            "successful_calls": successful_calls,
            "success_rate": round((successful_calls / total_calls * 100), 2) if total_calls > 0 else 0,
            "end_reasons": end_reasons,
            "time_series": time_series,
            "avg_duration_by_assistant": avg_duration_by_assistant,
            "calls": calls
        }

    async def get_voices(self) -> List[Dict[str, Any]]:
        """
        Get all available voices from Vapi

        Since Vapi doesn't expose a direct /voice endpoint, we return
        a curated list of known voices from different providers

        Returns:
            List of available voices with their details
        """
        try:
            # Return a curated list of known Vapi-compatible voices with preview URLs
            voices = [
                # ElevenLabs voices with public preview URLs
                {"id": "21m00Tcm4TlvDq8ikWAM", "name": "Rachel", "provider": "11labs", "language": "en", "gender": "female", "accent": "American", "age": 30, "previewUrl": "https://storage.googleapis.com/eleven-public-prod/premade/voices/21m00Tcm4TlvDq8ikWAM/cb4e7c50-b509-44c7-904c-f6c1d274cf4c.mp3"},
                {"id": "AZnzlk1XvdvUeBnXmlld", "name": "Domi", "provider": "11labs", "language": "en", "gender": "female", "accent": "American", "age": 28, "previewUrl": "https://storage.googleapis.com/eleven-public-prod/premade/voices/AZnzlk1XvdvUeBnXmlld/35738308-1982-47a2-be14-6ca8bf4d1cbd.mp3"},
                {"id": "EXAVITQu4vr4xnSDxMaL", "name": "Bella", "provider": "11labs", "language": "en", "gender": "female", "accent": "American", "age": 25, "previewUrl": "https://storage.googleapis.com/eleven-public-prod/premade/voices/EXAVITQu4vr4xnSDxMaL/04365bce-98cc-4e3d-99a4-5c3e8d2b1b0e.mp3"},
                {"id": "ErXwobaYiN019PkySvjV", "name": "Antoni", "provider": "11labs", "language": "en", "gender": "male", "accent": "American", "age": 35, "previewUrl": "https://storage.googleapis.com/eleven-public-prod/premade/voices/ErXwobaYiN019PkySvjV/532e8e1b-1d73-4a94-948b-8cd47c2bb53e.mp3"},
                {"id": "MF3mGyEYCl7XYWbV9V6O", "name": "Elli", "provider": "11labs", "language": "en", "gender": "female", "accent": "American", "age": 27, "previewUrl": "https://storage.googleapis.com/eleven-public-prod/premade/voices/MF3mGyEYCl7XYWbV9V6O/4b3937a3-9a5b-4d1e-be6b-f58174428e40.mp3"},
                {"id": "TxGEqnHWrfWFTfGW9XjX", "name": "Josh", "provider": "11labs", "language": "en", "gender": "male", "accent": "American", "age": 32, "previewUrl": "https://storage.googleapis.com/eleven-public-prod/premade/voices/TxGEqnHWrfWFTfGW9XjX/87d75e68-dec0-42b1-a738-e2fa2d5832e6.mp3"},
                {"id": "VR6AewLTigWG4xSOukaG", "name": "Arnold", "provider": "11labs", "language": "en", "gender": "male", "accent": "American", "age": 40, "previewUrl": "https://storage.googleapis.com/eleven-public-prod/premade/voices/VR6AewLTigWG4xSOukaG/66e83dc8-12b6-4872-9238-a04858a098b5.mp3"},
                {"id": "pNInz6obpgDQGcFmaJgB", "name": "Adam", "provider": "11labs", "language": "en", "gender": "male", "accent": "American", "age": 33, "previewUrl": "https://storage.googleapis.com/eleven-public-prod/premade/voices/pNInz6obpgDQGcFmaJgB/102de6f2-22ed-43e0-a1f1-111fa75c5481.mp3"},
                {"id": "yoZ06aMxZJJ28mfd3POQ", "name": "Sam", "provider": "11labs", "language": "en", "gender": "male", "accent": "American", "age": 29, "previewUrl": "https://storage.googleapis.com/eleven-public-prod/premade/voices/yoZ06aMxZJJ28mfd3POQ/6f5e0119-3b7a-4db1-a981-8ffdc45f564f.mp3"},
                # Cartesia voices (French)
                {"id": "65b25c5d-ff07-4687-a04c-da2f43ef6fa9", "name": "Helpful French Lady", "provider": "cartesia", "language": "fr", "gender": "female", "accent": "French", "age": 32},
                {"id": "f785d5cf-6549-47a6-9f1c-00d2d892197a", "name": "French Narrator Lady", "provider": "cartesia", "language": "fr", "gender": "female", "accent": "French", "age": 35},
                {"id": "421b3369-f63f-4b03-8980-37a44df1d4e8", "name": "French Conversational Lady", "provider": "cartesia", "language": "fr", "gender": "female", "accent": "French", "age": 30},
                # Cartesia voices (English)
                {"id": "a0e99841-438c-4a64-b679-ae501e7d6091", "name": "Barbershop Man", "provider": "cartesia", "language": "en", "gender": "male", "accent": "American", "age": 35},
                {"id": "79a125e8-cd45-4c13-8a67-188112f4dd22", "name": "British Lady", "provider": "cartesia", "language": "en", "gender": "female", "accent": "British", "age": 32},
                {"id": "95856005-0332-41b0-935f-352e296aa0df", "name": "Child", "provider": "cartesia", "language": "en", "gender": "neutral", "accent": "American", "age": 10},
                {"id": "87748186-23bb-4158-a1eb-332911b0b708", "name": "Friendly Reading Man", "provider": "cartesia", "language": "en", "gender": "male", "accent": "American", "age": 38},
                {"id": "638efaaa-4d0c-442e-b701-3fae16aad012", "name": "Calm Lady", "provider": "cartesia", "language": "en", "gender": "female", "accent": "American", "age": 35},
                {"id": "b7d50908-b17c-442d-ad8d-810c63997ed9", "name": "Helpful Woman", "provider": "cartesia", "language": "en", "gender": "female", "accent": "American", "age": 30},
                # PlayHT voices
                {"id": "s3://voice-cloning-zero-shot/d9ff78ba-d016-47f6-b0ef-dd630f59414e/female-cs/manifest.json", "name": "Jennifer", "provider": "playht", "language": "en", "gender": "female", "accent": "American", "age": 28},
                {"id": "s3://voice-cloning-zero-shot/e040bd1b-f190-4bdb-83f0-75ef85b18f84/original/manifest.json", "name": "Melissa", "provider": "playht", "language": "en", "gender": "female", "accent": "American", "age": 30},
                {"id": "s3://voice-cloning-zero-shot/bae2a670-8a0f-4f8f-84c8-e479a0d4e4e6/original/manifest.json", "name": "Will", "provider": "playht", "language": "en", "gender": "male", "accent": "American", "age": 35},
            ]

            logger.info(f"Returning {len(voices)} curated voices")
            return voices

        except Exception as e:
            logger.error(f"Error fetching voices: {e}")
            return []

    async def generate_voice_preview(
        self,
        voice_id: str,
        provider: str
    ) -> bytes:
        """
        Generate an audio preview for a voice using Vapi TTS

        Args:
            voice_id: ID of the voice
            provider: Voice provider (11labs, cartesia, playht)

        Returns:
            Audio data as bytes
        """
        try:
            # Prepare sample text based on language/provider
            sample_texts = {
                "fr": "Bonjour, je suis un assistant vocal intelligent. Comment puis-je vous aider aujourd'hui?",
                "en": "Hello, I'm an intelligent voice assistant. How can I help you today?"
            }

            # Determine language from voice_id
            # For French voices, use French text
            french_voice_ids = [
                "65b25c5d-ff07-4687-a04c-da2f43ef6fa9",
                "f785d5cf-6549-47a6-9f1c-00d2d892197a",
                "421b3369-f63f-4b03-8980-37a44df1d4e8"
            ]

            text = sample_texts["fr"] if voice_id in french_voice_ids else sample_texts["en"]

            # Build voice configuration based on provider
            voice_config = {
                "provider": provider,
                "voiceId": voice_id
            }

            if provider == "cartesia":
                voice_config["model"] = "sonic-multilingual"

            # Payload for Vapi TTS
            payload = {
                "text": text,
                "voice": voice_config
            }

            # Call Vapi TTS endpoint
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    "https://api.vapi.ai/tts",
                    headers=self.headers,
                    json=payload
                )
                response.raise_for_status()

                # Return audio data
                audio_data = response.content
                logger.info(f"Generated preview for voice {voice_id} ({provider}): {len(audio_data)} bytes")
                return audio_data

        except httpx.HTTPStatusError as e:
            logger.error(f"Vapi TTS error: {e.response.status_code} - {e.response.text}")
            raise Exception(f"Failed to generate preview: {e.response.text}")
        except Exception as e:
            logger.error(f"Error generating voice preview: {e}")
            raise

    async def clone_voice(
        self,
        name: str,
        description: Optional[str],
        audio_files: List[Any]
    ) -> Dict[str, Any]:
        """
        Clone a voice using ElevenLabs via Vapi

        Args:
            name: Name for the cloned voice
            description: Description of the voice
            audio_files: List of audio file uploads

        Returns:
            Cloned voice information
        """
        try:
            # Prepare multipart form data
            files = []
            file_contents = []

            for i, audio_file in enumerate(audio_files):
                content = await audio_file.read()
                file_contents.append(content)
                files.append(
                    ("files", (audio_file.filename, content, audio_file.content_type))
                )

            # Create form data
            data = {
                "name": name,
            }

            if description:
                data["description"] = description

            # Call Vapi voice cloning endpoint (which uses ElevenLabs)
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    f"{self.base_url}/voice/clone",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    data=data,
                    files=files
                )
                response.raise_for_status()
                result = response.json()

                logger.info(f"Voice cloned successfully: {result.get('id')}")
                return {
                    "success": True,
                    "voice": result
                }

        except httpx.HTTPStatusError as e:
            logger.error(f"Vapi voice cloning error: {e.response.status_code} - {e.response.text}")
            raise Exception(f"Voice cloning failed: {e.response.text}")
        except Exception as e:
            logger.error(f"Error cloning voice: {e}")
            raise

    async def delete_voice(self, voice_id: str) -> Dict[str, Any]:
        """
        Delete a voice from Vapi

        Args:
            voice_id: ID of the voice to delete

        Returns:
            Success response
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.delete(
                    f"{self.base_url}/voice/{voice_id}",
                    headers=self.headers,
                    timeout=30.0
                )
                response.raise_for_status()

                logger.info(f"Voice deleted: {voice_id}")
                return {"success": True}

        except Exception as e:
            logger.error(f"Error deleting voice: {e}")
            raise


# Global instance
vapi_service = VapiService()
