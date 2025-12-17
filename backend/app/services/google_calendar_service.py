"""
Google Calendar Service
Handles Google Calendar API integration
"""

import logging
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from sqlalchemy.orm import Session

from app.models.oauth_credential import OAuthCredential

logger = logging.getLogger(__name__)


class GoogleCalendarService:
    """Service for interacting with Google Calendar API"""

    SCOPES = [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
    ]

    def __init__(self, db: Session, user_id: str):
        self.db = db
        self.user_id = user_id
        self.service = None

    def get_credentials(self) -> Optional[Credentials]:
        """Get Google OAuth credentials for user"""
        try:
            oauth_cred = self.db.query(OAuthCredential).filter(
                OAuthCredential.user_id == self.user_id,
                OAuthCredential.service == "google_calendar",
                OAuthCredential.is_active == True
            ).first()

            if not oauth_cred:
                logger.warning(f"No Google Calendar credentials found for user {self.user_id}")
                return None

            # Create credentials object
            creds = Credentials(
                token=oauth_cred.access_token,
                refresh_token=oauth_cred.refresh_token,
                token_uri="https://oauth2.googleapis.com/token",
                client_id=None,  # Will be set from config
                client_secret=None,  # Will be set from config
                scopes=oauth_cred.scopes
            )

            # Refresh token if expired
            if creds.expired and creds.refresh_token:
                try:
                    creds.refresh(Request())

                    # Update credentials in database
                    oauth_cred.access_token = creds.token
                    oauth_cred.expires_at = creds.expiry
                    self.db.commit()

                    logger.info(f"Refreshed Google Calendar token for user {self.user_id}")
                except Exception as e:
                    logger.error(f"Error refreshing Google Calendar token: {str(e)}")
                    return None

            return creds

        except Exception as e:
            logger.error(f"Error getting Google Calendar credentials: {str(e)}")
            return None

    def get_service(self):
        """Get Google Calendar service"""
        if self.service:
            return self.service

        creds = self.get_credentials()
        if not creds:
            raise ValueError("No valid Google Calendar credentials found")

        try:
            self.service = build('calendar', 'v3', credentials=creds)
            return self.service
        except Exception as e:
            logger.error(f"Error building Google Calendar service: {str(e)}")
            raise

    def create_event(
        self,
        client_name: str,
        date: str,
        time: str,
        duration: int = 60,
        service_type: Optional[str] = None,
        notes: Optional[str] = None,
        timezone: str = "Europe/Paris"
    ) -> Dict[str, Any]:
        """
        Create a calendar event

        Args:
            client_name: Name of the client
            date: Date in YYYY-MM-DD format
            time: Time in HH:MM format
            duration: Duration in minutes (default 60)
            service_type: Type of service (optional)
            notes: Additional notes (optional)
            timezone: Timezone (default Europe/Paris)

        Returns:
            Created event details
        """
        try:
            service = self.get_service()

            # Parse datetime
            start_datetime = datetime.strptime(f"{date} {time}", "%Y-%m-%d %H:%M")
            end_datetime = start_datetime + timedelta(minutes=duration)

            # Build event summary
            summary = f"RDV - {client_name}"
            if service_type:
                summary += f" ({service_type})"

            # Build event description
            description = f"Client: {client_name}\n"
            if service_type:
                description += f"Service: {service_type}\n"
            if notes:
                description += f"\nNotes: {notes}"

            # Create event
            event = {
                'summary': summary,
                'description': description,
                'start': {
                    'dateTime': start_datetime.isoformat(),
                    'timeZone': timezone,
                },
                'end': {
                    'dateTime': end_datetime.isoformat(),
                    'timeZone': timezone,
                },
                'reminders': {
                    'useDefault': False,
                    'overrides': [
                        {'method': 'email', 'minutes': 24 * 60},  # 1 day before
                        {'method': 'popup', 'minutes': 30},  # 30 minutes before
                    ],
                },
            }

            # Insert event
            created_event = service.events().insert(
                calendarId='primary',
                body=event
            ).execute()

            logger.info(f"Created calendar event: {created_event.get('id')}")

            return {
                'success': True,
                'event_id': created_event.get('id'),
                'event_link': created_event.get('htmlLink'),
                'summary': summary,
                'start': start_datetime.isoformat(),
                'end': end_datetime.isoformat()
            }

        except HttpError as error:
            logger.error(f"Google Calendar API error: {error}")
            raise ValueError(f"Erreur lors de la création du rendez-vous: {error}")
        except Exception as e:
            logger.error(f"Error creating calendar event: {str(e)}")
            raise

    def check_availability(
        self,
        date: str,
        time: str,
        duration: int = 60,
        timezone: str = "Europe/Paris"
    ) -> bool:
        """
        Check if a time slot is available

        Args:
            date: Date in YYYY-MM-DD format
            time: Time in HH:MM format
            duration: Duration in minutes
            timezone: Timezone

        Returns:
            True if available, False otherwise
        """
        try:
            service = self.get_service()

            # Parse datetime
            start_datetime = datetime.strptime(f"{date} {time}", "%Y-%m-%d %H:%M")
            end_datetime = start_datetime + timedelta(minutes=duration)

            # Query for events in this time range
            events_result = service.events().list(
                calendarId='primary',
                timeMin=start_datetime.isoformat() + 'Z',
                timeMax=end_datetime.isoformat() + 'Z',
                singleEvents=True,
                orderBy='startTime'
            ).execute()

            events = events_result.get('items', [])

            # If no events found, slot is available
            return len(events) == 0

        except Exception as e:
            logger.error(f"Error checking availability: {str(e)}")
            return False

    def list_upcoming_events(self, max_results: int = 10) -> list:
        """
        List upcoming events

        Args:
            max_results: Maximum number of events to return

        Returns:
            List of upcoming events
        """
        try:
            service = self.get_service()

            now = datetime.utcnow().isoformat() + 'Z'
            events_result = service.events().list(
                calendarId='primary',
                timeMin=now,
                maxResults=max_results,
                singleEvents=True,
                orderBy='startTime'
            ).execute()

            events = events_result.get('items', [])

            return [
                {
                    'id': event['id'],
                    'summary': event.get('summary', 'Sans titre'),
                    'start': event['start'].get('dateTime', event['start'].get('date')),
                    'end': event['end'].get('dateTime', event['end'].get('date')),
                    'link': event.get('htmlLink')
                }
                for event in events
            ]

        except Exception as e:
            logger.error(f"Error listing events: {str(e)}")
            return []
