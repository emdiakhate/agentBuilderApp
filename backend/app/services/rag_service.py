"""
RAG Service - Retrieval Augmented Generation
"""

from typing import List, Dict, Any, Optional
from loguru import logger

from app.services.embedding_service import embedding_service
from app.services.vector_store_service import vector_store_service
from app.services.llm_service import llm_service


class RAGService:
    """Service for Retrieval Augmented Generation"""

    def __init__(self):
        self.embedding_service = embedding_service
        self.vector_store = vector_store_service
        self.llm_service = llm_service

    async def retrieve_context(
        self,
        query: str,
        agent_id: str,
        top_k: int = 5,
        score_threshold: float = 0.7,
        embedding_provider: str = "voyage"
    ) -> List[Dict[str, Any]]:
        """
        Retrieve relevant context for a query

        Args:
            query: User query
            agent_id: Agent ID for filtering
            top_k: Number of chunks to retrieve
            score_threshold: Minimum similarity score
            embedding_provider: "voyage" or "openai"

        Returns:
            List of relevant chunks with scores
        """
        try:
            # Generate query embedding
            query_embedding = await self.embedding_service.embed_query(
                query=query,
                provider=embedding_provider
            )

            # Search vector store
            results = await self.vector_store.search(
                query_embedding=query_embedding,
                agent_id=agent_id,
                limit=top_k,
                score_threshold=score_threshold
            )

            logger.info(f"Retrieved {len(results)} relevant chunks for query")
            return results

        except Exception as e:
            logger.error(f"Error retrieving context: {e}")
            raise

    def format_context(self, chunks: List[Dict[str, Any]]) -> str:
        """
        Format retrieved chunks into context string

        Args:
            chunks: List of retrieved chunks

        Returns:
            Formatted context string
        """
        if not chunks:
            return ""

        context_parts = []
        for i, chunk in enumerate(chunks, 1):
            text = chunk.get("text", "")
            score = chunk.get("score", 0)
            context_parts.append(f"[Context {i}] (Relevance: {score:.2f})\n{text}\n")

        return "\n".join(context_parts)

    async def generate_response(
        self,
        query: str,
        agent_id: str,
        agent_config: Dict[str, Any],
        conversation_history: Optional[List[Dict[str, str]]] = None,
        use_rag: bool = True
    ) -> Dict[str, Any]:
        """
        Generate response using RAG

        Args:
            query: User query
            agent_id: Agent ID
            agent_config: Agent configuration (provider, model, etc.)
            conversation_history: Optional conversation history
            use_rag: Whether to use RAG or just LLM

        Returns:
            Dict with response and metadata
        """
        try:
            context = ""
            retrieved_chunks = []

            # Retrieve context if RAG is enabled
            if use_rag:
                retrieved_chunks = await self.retrieve_context(
                    query=query,
                    agent_id=agent_id,
                    top_k=5,
                    score_threshold=0.7
                )

                if retrieved_chunks:
                    context = self.format_context(retrieved_chunks)
                    logger.info(f"Using RAG with {len(retrieved_chunks)} context chunks")
                else:
                    logger.info("No relevant context found, using LLM only")

            # Build system prompt
            system_prompt = self._build_system_prompt(
                agent_config=agent_config,
                context=context
            )

            # Prepare messages
            messages = []

            # Add conversation history if provided
            if conversation_history:
                messages.extend(conversation_history)

            # Add current query
            messages.append({
                "role": "user",
                "content": query
            })

            # Generate response
            response = await self.llm_service.chat(
                provider=agent_config.get("llm_provider", "openai"),
                model=agent_config.get("model", "gpt-4o-mini"),
                messages=messages,
                system_prompt=system_prompt,
                temperature=agent_config.get("temperature", 0.7),
                max_tokens=agent_config.get("max_tokens", 1000)
            )

            return {
                "response": response,
                "used_rag": use_rag and len(retrieved_chunks) > 0,
                "num_context_chunks": len(retrieved_chunks),
                "context_chunks": retrieved_chunks if use_rag else []
            }

        except Exception as e:
            logger.error(f"Error generating RAG response: {e}")
            raise

    def _build_system_prompt(
        self,
        agent_config: Dict[str, Any],
        context: str
    ) -> str:
        """
        Build system prompt with agent configuration and context

        Args:
            agent_config: Agent configuration
            context: Retrieved context

        Returns:
            Complete system prompt
        """
        # Base prompt from agent config
        base_prompt = agent_config.get("prompt", "")

        if not base_prompt:
            # Default prompt
            base_prompt = f"""You are {agent_config.get('name', 'an AI assistant')}.
{agent_config.get('description', '')}

Your role: {agent_config.get('type', 'Assistant')}
Purpose: {agent_config.get('purpose', 'Help users with their questions')}
"""

        # Add context if available
        if context:
            system_prompt = f"""{base_prompt}

IMPORTANT: Use the following context to answer the user's question. The context is retrieved from the knowledge base and contains relevant information.

--- KNOWLEDGE BASE CONTEXT ---
{context}
--- END OF CONTEXT ---

Instructions:
1. Base your answer primarily on the provided context
2. If the context doesn't contain enough information to fully answer the question, say so
3. Do not make up information that's not in the context
4. Be helpful, clear, and concise
5. Cite information from the context when relevant
"""
        else:
            system_prompt = base_prompt

        return system_prompt


# Global instance
rag_service = RAGService()
