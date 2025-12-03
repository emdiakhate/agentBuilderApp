"""
Embedding Service - Support for Voyage AI and OpenAI embeddings
"""

from typing import List
from langchain_openai import OpenAIEmbeddings
import voyageai
from loguru import logger

from app.core.config import settings


class EmbeddingService:
    """Service for generating embeddings from text"""

    def __init__(self):
        self.voyage_client = None
        self.openai_embeddings = None

    def _get_voyage_client(self):
        """Get or create Voyage AI client"""
        if not self.voyage_client:
            if not settings.VOYAGE_API_KEY:
                raise ValueError("VOYAGE_API_KEY not configured")
            self.voyage_client = voyageai.Client(api_key=settings.VOYAGE_API_KEY)
        return self.voyage_client

    def _get_openai_embeddings(self):
        """Get or create OpenAI embeddings client"""
        if not self.openai_embeddings:
            if not settings.OPENAI_API_KEY:
                raise ValueError("OPENAI_API_KEY not configured")
            self.openai_embeddings = OpenAIEmbeddings(
                model="text-embedding-3-small",
                api_key=settings.OPENAI_API_KEY
            )
        return self.openai_embeddings

    async def embed_text(self, text: str, provider: str = "voyage") -> List[float]:
        """
        Generate embedding for a single text

        Args:
            text: Text to embed
            provider: "voyage" or "openai"

        Returns:
            Embedding vector as list of floats
        """
        try:
            if provider == "voyage":
                return await self._embed_with_voyage([text])
            elif provider == "openai":
                return await self._embed_with_openai([text])
            else:
                raise ValueError(f"Unknown embedding provider: {provider}")
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            raise

    async def embed_texts(self, texts: List[str], provider: str = "voyage") -> List[List[float]]:
        """
        Generate embeddings for multiple texts

        Args:
            texts: List of texts to embed
            provider: "voyage" or "openai"

        Returns:
            List of embedding vectors
        """
        try:
            if provider == "voyage":
                return await self._embed_with_voyage(texts)
            elif provider == "openai":
                return await self._embed_with_openai(texts)
            else:
                raise ValueError(f"Unknown embedding provider: {provider}")
        except Exception as e:
            logger.error(f"Error generating embeddings: {e}")
            raise

    async def _embed_with_voyage(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings using Voyage AI"""
        try:
            client = self._get_voyage_client()
            result = client.embed(
                texts=texts,
                model=settings.EMBEDDING_MODEL,
                input_type="document"
            )
            logger.info(f"Generated {len(texts)} embeddings with Voyage AI")
            return result.embeddings
        except Exception as e:
            logger.error(f"Voyage AI embedding error: {e}")
            # Fallback to OpenAI if Voyage fails and OpenAI is configured
            if settings.OPENAI_API_KEY:
                logger.info("Falling back to OpenAI embeddings")
                return await self._embed_with_openai(texts)
            raise

    async def _embed_with_openai(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings using OpenAI"""
        try:
            embeddings_client = self._get_openai_embeddings()
            embeddings = await embeddings_client.aembed_documents(texts)
            logger.info(f"Generated {len(texts)} embeddings with OpenAI")
            return embeddings
        except Exception as e:
            logger.error(f"OpenAI embedding error: {e}")
            raise

    async def embed_query(self, query: str, provider: str = "voyage") -> List[float]:
        """
        Generate embedding for a search query

        Args:
            query: Search query text
            provider: "voyage" or "openai"

        Returns:
            Embedding vector
        """
        try:
            if provider == "voyage":
                client = self._get_voyage_client()
                result = client.embed(
                    texts=[query],
                    model=settings.EMBEDDING_MODEL,
                    input_type="query"  # Different input type for queries
                )
                return result.embeddings[0]
            elif provider == "openai":
                embeddings_client = self._get_openai_embeddings()
                embedding = await embeddings_client.aembed_query(query)
                return embedding
            else:
                raise ValueError(f"Unknown embedding provider: {provider}")
        except Exception as e:
            logger.error(f"Error generating query embedding: {e}")
            raise


# Global instance
embedding_service = EmbeddingService()
