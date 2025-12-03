from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import uuid

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.agent import Agent
from app.models.document import Document
from app.schemas.document import DocumentResponse
from app.services.document_service import document_service
from app.services.embedding_service import embedding_service
from app.services.vector_store_service import vector_store_service
from loguru import logger

router = APIRouter()


async def process_document_task(
    document_id: str,
    agent_id: str,
    file_path: str,
    file_type: str,
    db: Session
):
    """Background task to process document"""
    try:
        # Update status to processing
        doc = db.query(Document).filter(Document.id == document_id).first()
        if doc:
            doc.status = "processing"
            db.commit()

        # Process document
        logger.info(f"Processing document {document_id}")
        result = document_service.process_document(file_path, file_type)

        # Generate embeddings
        logger.info(f"Generating embeddings for {len(result['chunks'])} chunks")
        embeddings = await embedding_service.embed_texts(
            texts=result['chunks'],
            provider="voyage" if embedding_service.voyage_client or True else "openai"
        )

        # Store in vector database
        logger.info(f"Storing embeddings in Qdrant")
        await vector_store_service.add_documents(
            agent_id=agent_id,
            document_id=document_id,
            chunks=result['chunks'],
            embeddings=embeddings
        )

        # Update document status
        if doc:
            doc.status = "completed"
            doc.num_chunks = result['num_chunks']
            doc.total_tokens = result['total_chars']  # Approximate
            doc.processed_at = datetime.utcnow()
            db.commit()

        logger.info(f"Document {document_id} processed successfully")

    except Exception as e:
        logger.error(f"Error processing document {document_id}: {e}")

        # Update status to failed
        doc = db.query(Document).filter(Document.id == document_id).first()
        if doc:
            doc.status = "failed"
            doc.error_message = str(e)
            db.commit()


@router.post("/{agent_id}/documents", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    agent_id: str,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a document to an agent's knowledge base"""

    # Verify agent ownership
    agent = db.query(Agent).filter(
        Agent.id == agent_id,
        Agent.user_id == current_user.id
    ).first()

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )

    # Check file type
    file_ext = file.filename.split(".")[-1].lower()
    if file_ext not in ["pdf", "docx", "txt"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type. Supported: PDF, DOCX, TXT"
        )

    # Read file content
    file_content = await file.read()
    file_size = len(file_content)

    # Check file size
    max_size = 10 * 1024 * 1024  # 10 MB
    if file_size > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: 10 MB"
        )

    try:
        # Generate unique filename
        doc_id = str(uuid.uuid4())
        unique_filename = f"{doc_id}_{file.filename}"

        # Save file
        file_path = document_service.save_uploaded_file(
            file_content=file_content,
            filename=unique_filename,
            agent_id=agent_id
        )

        # Create document record
        new_document = Document(
            id=doc_id,
            agent_id=agent_id,
            filename=unique_filename,
            original_filename=file.filename,
            file_path=file_path,
            file_type=file_ext,
            file_size=file_size,
            status="pending"
        )

        db.add(new_document)
        db.commit()
        db.refresh(new_document)

        # Process document in background
        background_tasks.add_task(
            process_document_task,
            document_id=doc_id,
            agent_id=agent_id,
            file_path=file_path,
            file_type=file_ext,
            db=db
        )

        logger.info(f"Document uploaded: {file.filename} for agent {agent_id}")
        return new_document

    except Exception as e:
        logger.error(f"Error uploading document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading document: {str(e)}"
        )


@router.get("/{agent_id}/documents", response_model=List[DocumentResponse])
async def list_documents(
    agent_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all documents for an agent"""

    # Verify agent ownership
    agent = db.query(Agent).filter(
        Agent.id == agent_id,
        Agent.user_id == current_user.id
    ).first()

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )

    # Get documents
    documents = db.query(Document).filter(
        Document.agent_id == agent_id
    ).order_by(Document.uploaded_at.desc()).all()

    return documents


@router.delete("/{agent_id}/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    agent_id: str,
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a document"""

    # Verify agent ownership
    agent = db.query(Agent).filter(
        Agent.id == agent_id,
        Agent.user_id == current_user.id
    ).first()

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )

    # Get document
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.agent_id == agent_id
    ).first()

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    try:
        # Delete from vector store
        await vector_store_service.delete_document(document_id)

        # Delete file from disk
        document_service.delete_file(document.file_path)

        # Delete from database
        db.delete(document)
        db.commit()

        logger.info(f"Document deleted: {document_id}")
        return None

    except Exception as e:
        logger.error(f"Error deleting document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting document: {str(e)}"
        )
