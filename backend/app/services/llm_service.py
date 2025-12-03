"""
LLM Service - Multi-provider support for OpenAI, Claude, and OpenRouter
"""

from typing import Optional, List, Dict, Any
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.language_models import BaseChatModel
from loguru import logger

from app.core.config import settings


class LLMService:
    """Service for managing multiple LLM providers"""

    def __init__(self):
        self.providers = {
            "openai": self._get_openai_client,
            "anthropic": self._get_anthropic_client,
            "openrouter": self._get_openrouter_client,
        }

    def _get_openai_client(
        self,
        model: str = "gpt-4o-mini",
        temperature: float = 0.7,
        max_tokens: int = 1000
    ) -> ChatOpenAI:
        """Get OpenAI chat client"""
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY not configured")

        return ChatOpenAI(
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            api_key=settings.OPENAI_API_KEY,
        )

    def _get_anthropic_client(
        self,
        model: str = "claude-3-5-sonnet-20241022",
        temperature: float = 0.7,
        max_tokens: int = 1000
    ) -> ChatAnthropic:
        """Get Anthropic (Claude) chat client"""
        if not settings.ANTHROPIC_API_KEY:
            raise ValueError("ANTHROPIC_API_KEY not configured")

        return ChatAnthropic(
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            api_key=settings.ANTHROPIC_API_KEY,
        )

    def _get_openrouter_client(
        self,
        model: str = "openai/gpt-4o-mini",
        temperature: float = 0.7,
        max_tokens: int = 1000
    ) -> ChatOpenAI:
        """Get OpenRouter chat client (uses OpenAI format)"""
        if not settings.OPENROUTER_API_KEY:
            raise ValueError("OPENROUTER_API_KEY not configured")

        return ChatOpenAI(
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            api_key=settings.OPENROUTER_API_KEY,
            base_url="https://openrouter.ai/api/v1",
        )

    def get_llm(
        self,
        provider: str,
        model: str,
        temperature: float = 0.7,
        max_tokens: int = 1000
    ) -> BaseChatModel:
        """
        Get LLM client for specified provider

        Args:
            provider: "openai", "anthropic", or "openrouter"
            model: Model name
            temperature: Temperature for generation
            max_tokens: Max tokens to generate

        Returns:
            LangChain chat model instance
        """
        if provider not in self.providers:
            raise ValueError(f"Unknown provider: {provider}. Available: {list(self.providers.keys())}")

        try:
            client_func = self.providers[provider]
            llm = client_func(model=model, temperature=temperature, max_tokens=max_tokens)
            logger.info(f"LLM client created: {provider}/{model}")
            return llm
        except Exception as e:
            logger.error(f"Error creating LLM client for {provider}/{model}: {e}")
            raise

    async def chat(
        self,
        provider: str,
        model: str,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000
    ) -> str:
        """
        Send messages to LLM and get response

        Args:
            provider: LLM provider
            model: Model name
            messages: List of message dicts with 'role' and 'content'
            system_prompt: Optional system prompt
            temperature: Generation temperature
            max_tokens: Max tokens to generate

        Returns:
            Response content as string
        """
        try:
            # Get LLM client
            llm = self.get_llm(provider, model, temperature, max_tokens)

            # Convert messages to LangChain format
            lc_messages = []

            # Add system message if provided
            if system_prompt:
                lc_messages.append(SystemMessage(content=system_prompt))

            # Add conversation messages
            for msg in messages:
                role = msg.get("role", "user")
                content = msg.get("content", "")

                if role == "user":
                    lc_messages.append(HumanMessage(content=content))
                elif role == "assistant":
                    lc_messages.append(AIMessage(content=content))
                elif role == "system":
                    lc_messages.append(SystemMessage(content=content))

            # Get response
            response = await llm.ainvoke(lc_messages)

            logger.info(f"LLM response received from {provider}/{model}")
            return response.content

        except Exception as e:
            logger.error(f"Error in LLM chat: {e}")
            raise


# Global instance
llm_service = LLMService()
