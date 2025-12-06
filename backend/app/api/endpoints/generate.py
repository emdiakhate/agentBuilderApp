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
    Generate a system prompt in Vapi format using OpenAI based on agent details

    Uses the same structured format as Vapi with sections:
    [Identity], [Style], [Response Guidelines], [Task & Goals], [Error Handling / Fallback]
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

        # Prepare OpenAI API request with Vapi format instructions
        openai_payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {
                    "role": "system",
                    "content": f"""Tu es un expert en création de prompts pour assistants IA vocaux utilisant le format Vapi.

Génère un system prompt structuré selon le format Vapi avec les sections suivantes :

[Identity] - L'identité de l'assistant et sa mission principale
[Style] - Le ton et le style de communication (liste à puces)
[Response Guidelines] - Directives pour les réponses (liste à puces)
[Task & Goals] - Tâches et objectifs étape par étape (liste numérotée avec "< attendez la réponse de l'utilisateur >" quand approprié)
[Error Handling / Fallback] - Gestion des erreurs et cas limites (liste à puces)

RÈGLES IMPORTANTES:
- Rédige en {request.language}
- Utilise des listes à puces (-) ou numérotées selon la section
- Sois concis et clair
- Adapte le contenu pour une interaction vocale naturelle
- Utilise un ton professionnel et empathique
- Ajoute "< attendez la réponse de l'utilisateur >" dans [Task & Goals] quand l'assistant doit attendre

Génère UNIQUEMENT le system prompt au format Vapi, sans introduction ni explication."""
                },
                {
                    "role": "user",
                    "content": f"""Génère un system prompt au format Vapi pour cet assistant IA:

{context}

EXEMPLE DE FORMAT (à adapter selon le contexte):

[Identity]
Vous êtes {{nom}}, un assistant IA. Votre mission est de {{mission}}.

[Style]
- Adoptez un ton amical et professionnel.
- Communiquez de manière claire et concise tout en restant empathique.

[Response Guidelines]
- Répondez aux questions en utilisant les informations disponibles.
- Limitez vos réponses à l'essentiel tout en fournissant des explications claires.
- Utilisez un langage simple et accessible.

[Task & Goals]
1. Accueillez l'utilisateur et demandez comment vous pouvez l'aider.
2. Écoutez attentivement la question de l'utilisateur.
3. Recherchez les informations nécessaires.
4. Fournissez une réponse basée sur les informations disponibles.
5. Si nécessaire, posez des questions de clarification.
6. < attendez la réponse de l'utilisateur >
7. Proposez des solutions ou des informations supplémentaires si demandées.

[Error Handling / Fallback]
- Si une question n'est pas claire, demandez des précisions à l'utilisateur.
- Si vous ne trouvez pas d'informations, informez poliment l'utilisateur et proposez d'autres moyens d'assistance."""
                }
            ],
            "temperature": 0.7,
            "max_tokens": 800
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

        logger.info(f"Generated Vapi-format system prompt for agent: {request.name}")

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
