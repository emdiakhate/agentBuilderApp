"""
Vapi Webhooks Endpoints
Handles tool calls from Vapi
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
import logging
from typing import Dict, Any

from app.core.database import get_db
from app.schemas.tool import ToolCallRequest, ToolCallResponse, ToolCallResultItem
from app.services.google_calendar_service import GoogleCalendarService
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter()


def get_user_from_call(call_data: Dict[str, Any], db: Session) -> User:
    """
    Extract user from call data

    In production, you would identify the user from the call metadata,
    assistant ID, or organization ID passed by Vapi
    """
    # For now, use default dev user
    user = db.query(User).filter(User.email == "dev@example.com").first()
    if not user:
        raise ValueError("User not found")
    return user


@router.post("/tools/book-appointment")
async def book_appointment_webhook(
    request: ToolCallRequest,
    db: Session = Depends(get_db)
):
    """
    Webhook for booking appointments via Google Calendar

    Expected from Vapi:
    {
        "message": {
            "toolCallList": [{
                "id": "call_xyz",
                "name": "book_appointment",
                "arguments": {
                    "client_name": "John Doe",
                    "date": "2025-12-15",
                    "time": "14:30",
                    "service": "Consultation",
                    "notes": "First visit"
                }
            }]
        }
    }
    """
    try:
        logger.info(f"Received book appointment webhook: {request.dict()}")

        # Extract tool call information
        tool_call_list = request.message.get("toolCallList", [])
        if not tool_call_list:
            raise ValueError("No tool calls found in request")

        tool_call = tool_call_list[0]
        tool_call_id = tool_call["id"]
        arguments = tool_call["arguments"]

        # Extract arguments
        client_name = arguments.get("client_name")
        date = arguments.get("date")
        time = arguments.get("time")
        duration = arguments.get("duration", 60)
        service = arguments.get("service")
        notes = arguments.get("notes")

        # Validate required fields
        if not all([client_name, date, time]):
            raise ValueError("Missing required fields: client_name, date, time")

        # Get user from call data
        user = get_user_from_call(request.message.get("call", {}), db)

        # Initialize Google Calendar service
        calendar_service = GoogleCalendarService(db, user.id)

        # Check if credentials exist
        creds = calendar_service.get_credentials()
        if not creds:
            result_message = (
                "❌ Google Calendar n'est pas connecté. "
                "Veuillez vous connecter à Google Calendar dans les paramètres."
            )
            return ToolCallResponse(results=[
                ToolCallResultItem(
                    toolCallId=tool_call_id,
                    result=result_message
                )
            ])

        # Check availability (optional)
        is_available = calendar_service.check_availability(date, time, duration)
        if not is_available:
            result_message = (
                f"⚠️ Le créneau demandé ({date} à {time}) n'est pas disponible. "
                "Un autre créneau est-il possible ?"
            )
            return ToolCallResponse(results=[
                ToolCallResultItem(
                    toolCallId=tool_call_id,
                    result=result_message
                )
            ])

        # Create calendar event
        event_result = calendar_service.create_event(
            client_name=client_name,
            date=date,
            time=time,
            duration=duration,
            service_type=service,
            notes=notes
        )

        # Build success message
        result_message = (
            f"✅ Rendez-vous confirmé pour {client_name} "
            f"le {date} à {time} ({duration} minutes). "
        )
        if service:
            result_message += f"Service: {service}. "
        result_message += "Une confirmation a été envoyée par email."

        logger.info(f"Successfully booked appointment: {event_result}")

        return ToolCallResponse(results=[
            ToolCallResultItem(
                toolCallId=tool_call_id,
                result=result_message
            )
        ])

    except ValueError as e:
        logger.error(f"Validation error in book appointment: {str(e)}")
        return ToolCallResponse(results=[
            ToolCallResultItem(
                toolCallId=tool_call_id if 'tool_call_id' in locals() else "unknown",
                result=f"❌ Erreur de validation : {str(e)}"
            )
        ])
    except Exception as e:
        logger.error(f"Error in book appointment webhook: {str(e)}")
        return ToolCallResponse(results=[
            ToolCallResultItem(
                toolCallId=tool_call_id if 'tool_call_id' in locals() else "unknown",
                result=f"❌ Erreur lors de la réservation : {str(e)}"
            )
        ])


@router.post("/tools/check-availability")
async def check_availability_webhook(
    request: ToolCallRequest,
    db: Session = Depends(get_db)
):
    """
    Webhook for checking calendar availability

    Expected arguments:
    - date: YYYY-MM-DD
    - time: HH:MM
    - duration: minutes (optional, default 60)
    """
    try:
        logger.info(f"Received check availability webhook: {request.dict()}")

        tool_call = request.message.get("toolCallList", [])[0]
        tool_call_id = tool_call["id"]
        arguments = tool_call["arguments"]

        date = arguments.get("date")
        time = arguments.get("time")
        duration = arguments.get("duration", 60)

        if not all([date, time]):
            raise ValueError("Missing required fields: date, time")

        # Get user
        user = get_user_from_call(request.message.get("call", {}), db)

        # Initialize Google Calendar service
        calendar_service = GoogleCalendarService(db, user.id)

        # Check credentials
        creds = calendar_service.get_credentials()
        if not creds:
            return ToolCallResponse(results=[
                ToolCallResultItem(
                    toolCallId=tool_call_id,
                    result="Google Calendar non connecté"
                )
            ])

        # Check availability
        is_available = calendar_service.check_availability(date, time, duration)

        if is_available:
            result_message = f"✅ Le créneau du {date} à {time} est disponible."
        else:
            result_message = f"❌ Le créneau du {date} à {time} n'est pas disponible."

        return ToolCallResponse(results=[
            ToolCallResultItem(
                toolCallId=tool_call_id,
                result=result_message
            )
        ])

    except Exception as e:
        logger.error(f"Error checking availability: {str(e)}")
        return ToolCallResponse(results=[
            ToolCallResultItem(
                toolCallId=tool_call_id if 'tool_call_id' in locals() else "unknown",
                result=f"Erreur : {str(e)}"
            )
        ])


@router.post("/tools/list-appointments")
async def list_appointments_webhook(
    request: ToolCallRequest,
    db: Session = Depends(get_db)
):
    """
    Webhook for listing upcoming appointments

    Expected arguments:
    - max_results: number (optional, default 10)
    """
    try:
        logger.info(f"Received list appointments webhook: {request.dict()}")

        tool_call = request.message.get("toolCallList", [])[0]
        tool_call_id = tool_call["id"]
        arguments = tool_call.get("arguments", {})

        max_results = arguments.get("max_results", 10)

        # Get user
        user = get_user_from_call(request.message.get("call", {}), db)

        # Initialize Google Calendar service
        calendar_service = GoogleCalendarService(db, user.id)

        # Check credentials
        creds = calendar_service.get_credentials()
        if not creds:
            return ToolCallResponse(results=[
                ToolCallResultItem(
                    toolCallId=tool_call_id,
                    result="Google Calendar non connecté"
                )
            ])

        # List upcoming events
        events = calendar_service.list_upcoming_events(max_results)

        if not events:
            result_message = "Aucun rendez-vous à venir."
        else:
            result_message = f"Voici les {len(events)} prochains rendez-vous :\n\n"
            for event in events:
                result_message += f"- {event['summary']} : {event['start']}\n"

        return ToolCallResponse(results=[
            ToolCallResultItem(
                toolCallId=tool_call_id,
                result=result_message
            )
        ])

    except Exception as e:
        logger.error(f"Error listing appointments: {str(e)}")
        return ToolCallResponse(results=[
            ToolCallResultItem(
                toolCallId=tool_call_id if 'tool_call_id' in locals() else "unknown",
                result=f"Erreur : {str(e)}"
            )
        ])
