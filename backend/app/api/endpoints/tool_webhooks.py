"""
Google Calendar Tool Webhook Endpoint
Handles function calls from Vapi for Google Calendar operations
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any
from loguru import logger

from app.core.database import get_db
from app.services.google_calendar_service import GoogleCalendarService
from app.models.user import User

router = APIRouter()


class VapiToolCallRequest(BaseModel):
    """Vapi tool call request"""
    message: Dict[str, Any]
    call: Optional[Dict[str, Any]] = None


@router.post("/google-calendar/create-event")
async def create_calendar_event(
    request: VapiToolCallRequest,
    db: Session = Depends(get_db)
):
    """
    Webhook endpoint for creating Google Calendar events from Vapi

    This endpoint is called by Vapi when the assistant needs to create a calendar event.
    """
    try:
        logger.info(f"Received Vapi tool call for Google Calendar: {request.message}")

        # Extract function arguments from Vapi message
        function_call = request.message.get("functionCall", {})
        parameters = function_call.get("parameters", {})

        # Get user ID - For now, use dev user since we don't have authentication in Vapi calls
        # In production, you would extract user context from the call
        user = db.query(User).filter(User.email == "dev@example.com").first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Initialize Google Calendar service
        calendar_service = GoogleCalendarService(db=db, user_id=user.id)

        # Extract parameters
        client_name = parameters.get("client_name") or parameters.get("clientName")
        date = parameters.get("date")
        time = parameters.get("time")
        duration = parameters.get("duration", 60)
        service_type = parameters.get("service_type") or parameters.get("serviceType")
        notes = parameters.get("notes")

        if not client_name or not date or not time:
            raise HTTPException(
                status_code=400,
                detail="Missing required parameters: client_name, date, time"
            )

        # Create the calendar event
        result = calendar_service.create_event(
            client_name=client_name,
            date=date,
            time=time,
            duration=duration,
            service_type=service_type,
            notes=notes
        )

        logger.info(f"Created calendar event: {result}")

        # Return response in Vapi expected format
        return {
            "result": f"✅ Rendez-vous créé avec succès pour {client_name} le {date} à {time}. Lien: {result['event_link']}"
        }

    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        return {
            "result": f"❌ Erreur: {str(e)}"
        }
    except Exception as e:
        logger.error(f"Error creating calendar event: {str(e)}")
        return {
            "result": f"❌ Erreur lors de la création du rendez-vous: {str(e)}"
        }


@router.post("/google-calendar/check-availability")
async def check_availability(
    request: VapiToolCallRequest,
    db: Session = Depends(get_db)
):
    """
    Webhook endpoint for checking Google Calendar availability from Vapi
    """
    try:
        logger.info(f"Received Vapi tool call for availability check: {request.message}")

        # Extract function arguments
        function_call = request.message.get("functionCall", {})
        parameters = function_call.get("parameters", {})

        # Get user
        user = db.query(User).filter(User.email == "dev@example.com").first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Initialize Google Calendar service
        calendar_service = GoogleCalendarService(db=db, user_id=user.id)

        # Extract parameters
        date = parameters.get("date")
        time = parameters.get("time")
        duration = parameters.get("duration", 60)

        if not date or not time:
            raise HTTPException(
                status_code=400,
                detail="Missing required parameters: date, time"
            )

        # Check availability
        is_available = calendar_service.check_availability(
            date=date,
            time=time,
            duration=duration
        )

        if is_available:
            return {
                "result": f"✅ Le créneau du {date} à {time} est disponible."
            }
        else:
            return {
                "result": f"❌ Le créneau du {date} à {time} n'est pas disponible. Veuillez proposer une autre heure."
            }

    except Exception as e:
        logger.error(f"Error checking availability: {str(e)}")
        return {
            "result": f"❌ Erreur lors de la vérification de disponibilité: {str(e)}"
        }
