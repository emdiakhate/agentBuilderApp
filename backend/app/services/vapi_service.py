"""
Vapi Service - Integration with Vapi.ai API
"""

from typing import Dict, Any, List, Optional
import httpx
import mimetypes
from loguru import logger

from app.core.config import settings


class VapiService:
    """Service for interacting with Vapi.ai API"""

    def __init__(self):
        self.api_key = settings.VAPI_API_KEY
        self.base_url = "https://api.vapi.ai"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def create_assistant(
        self,
        name: str,
        model: str = "gpt-4o-mini",
        voice: str = "jennifer-playht",
        first_message: Optional[str] = None,
        system_prompt: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Create a new Vapi assistant

        Args:
            name: Assistant name
            model: LLM model to use
            voice: Voice ID to use
            first_message: First message to say
            system_prompt: System prompt for the assistant
            **kwargs: Additional Vapi assistant configuration

        Returns:
            Created assistant data including assistant_id
        """
        try:
            payload = {
                "name": name,
                "model": {
                    "provider": "openai",
                    "model": model,
                    "systemPrompt": system_prompt or f"You are {name}, a helpful AI assistant.",
                },
                "voice": {
                    "provider": "playht",
                    "voiceId": voice
                },
                **kwargs
            }

            if first_message:
                payload["firstMessage"] = first_message

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


# Global instance
vapi_service = VapiService()
