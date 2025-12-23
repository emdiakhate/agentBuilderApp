"""
Conversations API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, date
import httpx
import io
import csv
from loguru import logger

from app.core.database import get_db
from app.core.config import settings
from app.core.security import get_current_user_optional
from app.models.user import User

router = APIRouter()


@router.get("")
async def list_conversations(
    assistant_id: Optional[str] = Query(None, description="Filter by assistant ID"),
    start_date: Optional[date] = Query(None, description="Filter by start date"),
    end_date: Optional[date] = Query(None, description="Filter by end date"),
    status: Optional[str] = Query(None, description="Filter by status (ended, in-progress, failed)"),
    sentiment: Optional[str] = Query(None, description="Filter by sentiment (positive, neutral, negative)"),
    search: Optional[str] = Query(None, description="Search in transcripts"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    List conversations with filtering and pagination
    """
    # Check if VAPI credentials are configured
    if not settings.VAPI_API_KEY or settings.VAPI_API_KEY.startswith("your-"):
        logger.warning("VAPI_API_KEY not configured")
        return {
            "conversations": [],
            "pagination": {"page": page, "limit": limit, "total": 0},
            "error": "VAPI API key not configured. Please add your VAPI_API_KEY to the .env file."
        }

    try:
        # Build VAPI API request params
        params = {
            "limit": limit,
            "offset": (page - 1) * limit
        }

        if assistant_id:
            params["assistantId"] = assistant_id

        if start_date:
            params["createdAtGte"] = start_date.isoformat()

        if end_date:
            params["createdAtLte"] = end_date.isoformat()

        # Call VAPI API
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{settings.VAPI_BASE_URL}/call",
                headers={"Authorization": f"Bearer {settings.VAPI_API_KEY}"},
                params=params
            )
            response.raise_for_status()
            calls = response.json()

        # Filter by status
        if status:
            calls = [c for c in calls if c.get("status") == status]

        # Filter by sentiment
        if sentiment:
            calls = [c for c in calls if c.get("analysis", {}).get("sentiment") == sentiment]

        # Search in transcripts
        if search:
            search_lower = search.lower()
            filtered_calls = []
            for call in calls:
                transcript = call.get("artifact", {}).get("transcript", [])
                transcript_text = " ".join([msg.get("message", "") for msg in transcript]).lower()
                if search_lower in transcript_text:
                    filtered_calls.append(call)
            calls = filtered_calls

        # Enrich conversation data
        enriched_calls = []
        for call in calls:
            created_at = call.get("createdAt")
            ended_at = call.get("endedAt")

            duration = None
            if created_at and ended_at:
                try:
                    start = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                    end = datetime.fromisoformat(ended_at.replace('Z', '+00:00'))
                    duration = int((end - start).total_seconds())
                except:
                    pass

            enriched_calls.append({
                "id": call.get("id"),
                "assistantId": call.get("assistantId"),
                "status": call.get("status"),
                "createdAt": created_at,
                "endedAt": ended_at,
                "duration": duration,
                "cost": call.get("cost"),
                "transcript": call.get("artifact", {}).get("transcript", []),
                "recording": call.get("artifact", {}).get("recordingUrl"),
                "summary": call.get("analysis", {}).get("summary"),
                "sentiment": call.get("analysis", {}).get("sentiment"),
                "phoneNumber": call.get("phoneNumber"),
                "customerNumber": call.get("customer", {}).get("number")
            })

        return {
            "conversations": enriched_calls,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": len(enriched_calls)
            }
        }

    except httpx.HTTPStatusError as e:
        logger.error(f"VAPI API error: {e.response.status_code} - {e.response.text}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching conversations: {e.response.text}"
        )
    except Exception as e:
        logger.error(f"Error fetching conversations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching conversations: {str(e)}"
        )


@router.get("/{call_id}")
async def get_conversation(
    call_id: str,
    current_user: User = Depends(get_current_user_optional)
):
    """
    Get a specific conversation with full details
    """
    # Check if VAPI credentials are configured
    if not settings.VAPI_API_KEY or settings.VAPI_API_KEY.startswith("your-"):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="VAPI API key not configured. Please add your VAPI_API_KEY to the .env file."
        )

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{settings.VAPI_BASE_URL}/call/{call_id}",
                headers={"Authorization": f"Bearer {settings.VAPI_API_KEY}"}
            )
            response.raise_for_status()
            call = response.json()

        created_at = call.get("createdAt")
        ended_at = call.get("endedAt")

        duration = None
        if created_at and ended_at:
            try:
                start = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                end = datetime.fromisoformat(ended_at.replace('Z', '+00:00'))
                duration = int((end - start).total_seconds())
            except:
                pass

        conversation = {
            "id": call.get("id"),
            "assistantId": call.get("assistantId"),
            "status": call.get("status"),
            "createdAt": created_at,
            "endedAt": ended_at,
            "duration": duration,
            "cost": call.get("cost"),
            "transcript": call.get("artifact", {}).get("transcript", []),
            "messages": call.get("artifact", {}).get("messages", []),
            "recording": call.get("artifact", {}).get("recordingUrl"),
            "recordingUrl": call.get("artifact", {}).get("recordingUrl"),
            "logUrl": call.get("artifact", {}).get("logUrl"),
            "summary": call.get("analysis", {}).get("summary"),
            "sentiment": call.get("analysis", {}).get("sentiment"),
            "successEvaluation": call.get("analysis", {}).get("successEvaluation"),
            "phoneNumber": call.get("phoneNumber"),
            "customerNumber": call.get("customer", {}).get("number"),
            "variableValues": call.get("artifact", {}).get("variableValues", {})
        }

        return conversation

    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        logger.error(f"VAPI API error: {e.response.status_code} - {e.response.text}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching conversation: {e.response.text}"
        )
    except Exception as e:
        logger.error(f"Error fetching conversation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching conversation: {str(e)}"
        )


@router.get("/export/csv")
async def export_conversations_csv(
    assistant_id: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    status: Optional[str] = Query(None),
    sentiment: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user_optional)
):
    """
    Export conversations to CSV
    """
    # Check if VAPI credentials are configured
    if not settings.VAPI_API_KEY or settings.VAPI_API_KEY.startswith("your-"):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="VAPI API key not configured. Please add your VAPI_API_KEY to the .env file."
        )

    try:
        # Build VAPI API request params
        params = {}

        if assistant_id:
            params["assistantId"] = assistant_id

        if start_date:
            params["createdAtGte"] = start_date.isoformat()

        if end_date:
            params["createdAtLte"] = end_date.isoformat()

        # Call VAPI API
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.get(
                f"{settings.VAPI_BASE_URL}/call",
                headers={"Authorization": f"Bearer {settings.VAPI_API_KEY}"},
                params=params
            )
            response.raise_for_status()
            calls = response.json()

        # Filter
        if status:
            calls = [c for c in calls if c.get("status") == status]

        if sentiment:
            calls = [c for c in calls if c.get("analysis", {}).get("sentiment") == sentiment]

        # Prepare CSV data
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=[
            'ID', 'Assistant ID', 'Status', 'Created At', 'Ended At',
            'Duration (seconds)', 'Cost', 'Phone Number', 'Customer Number',
            'Sentiment', 'Summary', 'Transcript', 'Recording URL'
        ])

        writer.writeheader()

        for call in calls:
            created_at = call.get("createdAt")
            ended_at = call.get("endedAt")

            duration = None
            if created_at and ended_at:
                try:
                    start = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                    end = datetime.fromisoformat(ended_at.replace('Z', '+00:00'))
                    duration = int((end - start).total_seconds())
                except:
                    pass

            transcript = call.get("artifact", {}).get("transcript", [])
            transcript_text = "\n".join([
                f"{msg.get('role')}: {msg.get('message')}"
                for msg in transcript
            ])

            writer.writerow({
                'ID': call.get("id", ""),
                'Assistant ID': call.get("assistantId", ""),
                'Status': call.get("status", ""),
                'Created At': created_at or "",
                'Ended At': ended_at or "",
                'Duration (seconds)': duration or "",
                'Cost': call.get("cost", ""),
                'Phone Number': call.get("phoneNumber", ""),
                'Customer Number': call.get("customer", {}).get("number", ""),
                'Sentiment': call.get("analysis", {}).get("sentiment", ""),
                'Summary': call.get("analysis", {}).get("summary", ""),
                'Transcript': transcript_text,
                'Recording URL': call.get("artifact", {}).get("recordingUrl", "")
            })

        output.seek(0)

        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=conversations-{datetime.now().strftime('%Y%m%d')}.csv"
            }
        )

    except Exception as e:
        logger.error(f"Error exporting conversations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error exporting conversations: {str(e)}"
        )
