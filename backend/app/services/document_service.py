"""
Document Service - Extract text from files and chunk for RAG
"""

import os
from typing import List, Dict, Any
from pathlib import Path
import PyPDF2
from docx import Document as DocxDocument
from langchain.text_splitter import RecursiveCharacterTextSplitter
from loguru import logger

from app.core.config import settings


class DocumentService:
    """Service for processing documents"""

    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""]
        )

    def extract_text(self, file_path: str, file_type: str) -> str:
        """
        Extract text from a file

        Args:
            file_path: Path to the file
            file_type: File extension (pdf, docx, txt, etc.)

        Returns:
            Extracted text content
        """
        try:
            if file_type == "pdf":
                return self._extract_pdf(file_path)
            elif file_type == "docx":
                return self._extract_docx(file_path)
            elif file_type == "txt":
                return self._extract_txt(file_path)
            else:
                raise ValueError(f"Unsupported file type: {file_type}")
        except Exception as e:
            logger.error(f"Error extracting text from {file_path}: {e}")
            raise

    def _extract_pdf(self, file_path: str) -> str:
        """Extract text from PDF"""
        text = ""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
            logger.info(f"Extracted text from PDF: {len(text)} characters")
            return text.strip()
        except Exception as e:
            logger.error(f"Error reading PDF: {e}")
            raise

    def _extract_docx(self, file_path: str) -> str:
        """Extract text from DOCX"""
        try:
            doc = DocxDocument(file_path)
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            logger.info(f"Extracted text from DOCX: {len(text)} characters")
            return text.strip()
        except Exception as e:
            logger.error(f"Error reading DOCX: {e}")
            raise

    def _extract_txt(self, file_path: str) -> str:
        """Extract text from TXT"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                text = file.read()
            logger.info(f"Extracted text from TXT: {len(text)} characters")
            return text.strip()
        except Exception as e:
            logger.error(f"Error reading TXT: {e}")
            raise

    def chunk_text(self, text: str) -> List[str]:
        """
        Split text into chunks for embedding

        Args:
            text: Text to split

        Returns:
            List of text chunks
        """
        try:
            chunks = self.text_splitter.split_text(text)
            logger.info(f"Split text into {len(chunks)} chunks")
            return chunks
        except Exception as e:
            logger.error(f"Error chunking text: {e}")
            raise

    def process_document(
        self,
        file_path: str,
        file_type: str
    ) -> Dict[str, Any]:
        """
        Process a document: extract text and chunk it

        Args:
            file_path: Path to the file
            file_type: File extension

        Returns:
            Dict with text, chunks, and metadata
        """
        try:
            # Extract text
            text = self.extract_text(file_path, file_type)

            if not text:
                raise ValueError("No text extracted from document")

            # Chunk text
            chunks = self.chunk_text(text)

            # Calculate stats
            total_chars = len(text)
            avg_chunk_size = total_chars / len(chunks) if chunks else 0

            result = {
                "text": text,
                "chunks": chunks,
                "num_chunks": len(chunks),
                "total_chars": total_chars,
                "avg_chunk_size": int(avg_chunk_size),
            }

            logger.info(f"Document processed: {len(chunks)} chunks from {total_chars} characters")
            return result

        except Exception as e:
            logger.error(f"Error processing document: {e}")
            raise

    def save_uploaded_file(self, file_content: bytes, filename: str, agent_id: str) -> str:
        """
        Save uploaded file to disk

        Args:
            file_content: File bytes
            filename: Original filename
            agent_id: Agent ID for organization

        Returns:
            Path to saved file
        """
        try:
            # Create agent-specific directory
            agent_dir = Path(settings.UPLOAD_DIR) / agent_id
            agent_dir.mkdir(parents=True, exist_ok=True)

            # Save file
            file_path = agent_dir / filename
            with open(file_path, 'wb') as f:
                f.write(file_content)

            logger.info(f"File saved: {file_path}")
            return str(file_path)

        except Exception as e:
            logger.error(f"Error saving file: {e}")
            raise

    def delete_file(self, file_path: str):
        """Delete a file from disk"""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"File deleted: {file_path}")
        except Exception as e:
            logger.error(f"Error deleting file: {e}")


# Global instance
document_service = DocumentService()
