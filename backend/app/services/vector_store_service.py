"""
Vector Store Service - Qdrant integration for RAG
"""

from typing import List, Dict, Any, Optional
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue
)
from loguru import logger
import uuid

from app.core.config import settings


class VectorStoreService:
    """Service for managing vector embeddings in Qdrant"""

    def __init__(self):
        self.client = None
        self.collection_name = settings.QDRANT_COLLECTION_NAME

    def _get_client(self) -> QdrantClient:
        """Get or create Qdrant client"""
        if not self.client:
            self.client = QdrantClient(
                host=settings.QDRANT_HOST,
                port=settings.QDRANT_PORT
            )
            logger.info(f"Qdrant client connected: {settings.QDRANT_HOST}:{settings.QDRANT_PORT}")
        return self.client

    def ensure_collection(self):
        """Ensure collection exists in Qdrant"""
        try:
            client = self._get_client()

            # Check if collection exists
            collections = client.get_collections().collections
            collection_names = [c.name for c in collections]

            if self.collection_name not in collection_names:
                # Create collection
                client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(
                        size=settings.EMBEDDING_DIMENSION,
                        distance=Distance.COSINE
                    )
                )
                logger.info(f"Created Qdrant collection: {self.collection_name}")
            else:
                logger.info(f"Qdrant collection already exists: {self.collection_name}")

        except Exception as e:
            logger.error(f"Error ensuring collection: {e}")
            raise

    async def add_documents(
        self,
        agent_id: str,
        document_id: str,
        chunks: List[str],
        embeddings: List[List[float]],
        metadata: Optional[Dict[str, Any]] = None
    ) -> int:
        """
        Add document chunks with embeddings to vector store

        Args:
            agent_id: Agent ID
            document_id: Document ID
            chunks: List of text chunks
            embeddings: List of embedding vectors
            metadata: Optional metadata dict

        Returns:
            Number of points added
        """
        try:
            client = self._get_client()
            self.ensure_collection()

            # Create points for Qdrant
            points = []
            for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                point_id = str(uuid.uuid4())

                payload = {
                    "agent_id": agent_id,
                    "document_id": document_id,
                    "chunk_index": i,
                    "text": chunk,
                    "chunk_size": len(chunk)
                }

                # Add custom metadata
                if metadata:
                    payload.update(metadata)

                points.append(
                    PointStruct(
                        id=point_id,
                        vector=embedding,
                        payload=payload
                    )
                )

            # Upload to Qdrant
            client.upsert(
                collection_name=self.collection_name,
                points=points
            )

            logger.info(f"Added {len(points)} points to Qdrant for document {document_id}")
            return len(points)

        except Exception as e:
            logger.error(f"Error adding documents to vector store: {e}")
            raise

    async def search(
        self,
        query_embedding: List[float],
        agent_id: str,
        limit: int = 5,
        score_threshold: float = 0.7
    ) -> List[Dict[str, Any]]:
        """
        Search for similar documents

        Args:
            query_embedding: Query embedding vector
            agent_id: Filter by agent ID
            limit: Maximum number of results
            score_threshold: Minimum similarity score

        Returns:
            List of search results with text and metadata
        """
        try:
            client = self._get_client()

            # Search with filter
            results = client.search(
                collection_name=self.collection_name,
                query_vector=query_embedding,
                query_filter=Filter(
                    must=[
                        FieldCondition(
                            key="agent_id",
                            match=MatchValue(value=agent_id)
                        )
                    ]
                ),
                limit=limit,
                score_threshold=score_threshold
            )

            # Format results
            formatted_results = []
            for result in results:
                formatted_results.append({
                    "id": result.id,
                    "score": result.score,
                    "text": result.payload.get("text", ""),
                    "document_id": result.payload.get("document_id"),
                    "chunk_index": result.payload.get("chunk_index"),
                    "metadata": {
                        k: v for k, v in result.payload.items()
                        if k not in ["text", "document_id", "chunk_index", "agent_id"]
                    }
                })

            logger.info(f"Found {len(formatted_results)} relevant chunks for agent {agent_id}")
            return formatted_results

        except Exception as e:
            logger.error(f"Error searching vector store: {e}")
            raise

    async def delete_document(self, document_id: str):
        """Delete all chunks for a document"""
        try:
            client = self._get_client()

            # Delete points by filter
            client.delete(
                collection_name=self.collection_name,
                points_selector=Filter(
                    must=[
                        FieldCondition(
                            key="document_id",
                            match=MatchValue(value=document_id)
                        )
                    ]
                )
            )

            logger.info(f"Deleted document {document_id} from vector store")

        except Exception as e:
            logger.error(f"Error deleting document from vector store: {e}")
            raise

    async def delete_agent_documents(self, agent_id: str):
        """Delete all documents for an agent"""
        try:
            client = self._get_client()

            # Delete points by filter
            client.delete(
                collection_name=self.collection_name,
                points_selector=Filter(
                    must=[
                        FieldCondition(
                            key="agent_id",
                            match=MatchValue(value=agent_id)
                        )
                    ]
                )
            )

            logger.info(f"Deleted all documents for agent {agent_id} from vector store")

        except Exception as e:
            logger.error(f"Error deleting agent documents from vector store: {e}")
            raise

    async def get_collection_stats(self) -> Dict[str, Any]:
        """Get statistics about the collection"""
        try:
            client = self._get_client()
            info = client.get_collection(collection_name=self.collection_name)

            return {
                "collection_name": self.collection_name,
                "vectors_count": info.vectors_count,
                "points_count": info.points_count,
                "status": info.status
            }

        except Exception as e:
            logger.error(f"Error getting collection stats: {e}")
            raise


# Global instance
vector_store_service = VectorStoreService()
