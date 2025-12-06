"""
Generate endpoints - AI-powered content generation
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from loguru import logger
import httpx

from app.core.config import settings
from app.core.security import get_current_user_optional
from app.models.user import User

router = APIRouter()


class GeneratePromptRequest(BaseModel):
    name: str
    description: Optional[str] = None
    type: Optional[str] = None
    purpose: Optional[str] = None
    industry: Optional[str] = None
    bot_function: Optional[str] = None
    language: Optional[str] = "Français"


class GeneratePromptResponse(BaseModel):
    system_prompt: str


@router.post("/prompt", response_model=GeneratePromptResponse)
async def generate_system_prompt(
    request: GeneratePromptRequest,
    current_user: User = Depends(get_current_user_optional)
):
    """
    Generate a system prompt using OpenAI based on agent details

    This mimics Vapi's "Generate" button functionality
    """

    try:
        # Build context for the AI
        context_parts = [
            f"Nom de l'agent: {request.name}",
        ]

        if request.description:
            context_parts.append(f"Description: {request.description}")
        if request.type:
            context_parts.append(f"Type: {request.type}")
        if request.purpose:
            context_parts.append(f"Objectif: {request.purpose}")
        if request.industry:
            context_parts.append(f"Industrie: {request.industry}")
        if request.bot_function:
            context_parts.append(f"Fonction: {request.bot_function}")

        context = "\n".join(context_parts)

        # Prepare OpenAI API request
        openai_payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {
                    "role": "system",
                    "content": f"""Tu es un expert en création de prompts pour assistants IA vocaux.
Génère un system prompt professionnel, concis et efficace pour un assistant IA basé sur les informations fournies.

Le prompt doit:
- Être rédigé en {request.language}
- Définir clairement l'identité et le rôle de l'assistant
- Être adapté à une interaction vocale (naturelle, conversationnelle)
- Inclure des directives de comportement appropriées
- Rester concis (2-4 paragraphes maximum)
- Utiliser un ton professionnel mais accessible

Génère UNIQUEMENT le system prompt, sans introduction ni explication."""
                },
                {
                    "role": "user",
                    "content": f"""Génère un system prompt pour cet assistant IA:

{context}"""
                }
            ],
            "temperature": 0.7,
            "max_tokens": 500
        }

        # Call OpenAI API
        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=openai_payload,
                timeout=30.0
            )
            response.raise_for_status()
            result = response.json()

        # Extract generated prompt
        system_prompt = result["choices"][0]["message"]["content"].strip()

        logger.info(f"Generated system prompt for agent: {request.name}")

        return GeneratePromptResponse(system_prompt=system_prompt)

    except httpx.HTTPStatusError as e:
        logger.error(f"OpenAI API error: {e.response.status_code} - {e.response.text}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate prompt: OpenAI API error"
        )
    except Exception as e:
        logger.error(f"Error generating prompt: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate prompt: {str(e)}"
        )
