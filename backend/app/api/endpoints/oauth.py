"""
OAuth Endpoints
Handles OAuth authentication flows for external services
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
import logging
from datetime import datetime, timedelta
from typing import Optional

from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials

from app.core.database import get_db
from app.core.config import settings
from app.models.oauth_credential import OAuthCredential
from app.models.user import User
from app.api.endpoints.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter()

# Google Calendar OAuth configuration
GOOGLE_CALENDAR_SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.email',
    'openid'
]


async def get_current_user_optional(request: Request, db: Session = Depends(get_db)) -> Optional[User]:
    """Get current user or return dev user for development"""
    try:
        # Try to get authenticated user
        from app.api.endpoints.auth import get_current_user
        user = await get_current_user(request)
        return user
    except:
        # In development, use dev user as fallback
        if settings.ENVIRONMENT == "development":
            dev_user = db.query(User).filter(User.email == "dev@example.com").first()
            if dev_user:
                logger.info("Using dev user for OAuth (no authentication)")
                return dev_user
        return None


@router.get("/google-calendar/connect")
async def connect_google_calendar(
    request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Initiate Google Calendar OAuth flow

    This endpoint redirects the user to Google's OAuth consent screen
    """
    try:
        if not current_user:
            raise HTTPException(status_code=401, detail="Authentication required")
        # TODO: Configure Google OAuth credentials in settings
        # For now, return instructions
        instructions = {
            "message": "Google Calendar OAuth configuration needed",
            "steps": [
                "1. Go to Google Cloud Console: https://console.cloud.google.com",
                "2. Create a project or select existing one",
                "3. Enable Google Calendar API",
                "4. Create OAuth 2.0 credentials (Web application)",
                "5. Add authorized redirect URI: http://localhost:8000/api/oauth/google-calendar/callback",
                "6. Copy Client ID and Client Secret to your .env file:",
                "   GOOGLE_CLIENT_ID=your_client_id",
                "   GOOGLE_CLIENT_SECRET=your_client_secret",
                "7. Restart the backend"
            ],
            "documentation": "https://developers.google.com/calendar/api/guides/auth"
        }

        # Check if credentials are configured
        if not hasattr(settings, 'GOOGLE_CLIENT_ID') or not settings.GOOGLE_CLIENT_ID:
            return instructions

        # Create OAuth flow
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [f"{settings.API_URL}/api/oauth/google-calendar/callback"]
                }
            },
            scopes=GOOGLE_CALENDAR_SCOPES
        )

        flow.redirect_uri = f"{settings.API_URL}/api/oauth/google-calendar/callback"

        # Generate authorization URL
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'
        )

        # Store state in session (you might want to use Redis or similar for production)
        # For now, we'll include user_id in the state
        state_with_user = f"{state}:{current_user.id}"

        # Redirect to Google OAuth
        return RedirectResponse(url=authorization_url)

    except Exception as e:
        logger.error(f"Error initiating Google Calendar OAuth: {str(e)}")
        raise HTTPException(status_code=500, detail="Error connecting to Google Calendar")


@router.get("/google-calendar/callback")
async def google_calendar_callback(
    request: Request,
    code: Optional[str] = None,
    state: Optional[str] = None,
    error: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Handle Google Calendar OAuth callback

    Google redirects here after user grants/denies permission
    """
    try:
        # Check for errors
        if error:
            logger.error(f"Google OAuth error: {error}")
            return RedirectResponse(url=f"{settings.FRONTEND_URL}/integrations?oauth_error={error}")

        if not code:
            raise ValueError("No authorization code received")

        # TODO: Verify state and extract user_id
        # For production, implement proper state management

        # Check if credentials are configured
        if not hasattr(settings, 'GOOGLE_CLIENT_ID') or not settings.GOOGLE_CLIENT_ID:
            raise ValueError("Google OAuth not configured")

        # Create OAuth flow
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [f"{settings.API_URL}/api/oauth/google-calendar/callback"]
                }
            },
            scopes=GOOGLE_CALENDAR_SCOPES
        )

        flow.redirect_uri = f"{settings.API_URL}/api/oauth/google-calendar/callback"

        # Exchange authorization code for tokens
        flow.fetch_token(code=code)

        # Get credentials
        credentials = flow.credentials

        # Get user info (from state or default)
        # For now, use default dev user
        user = db.query(User).filter(User.email == "dev@example.com").first()
        if not user:
            raise ValueError("User not found")

        # Check if credential already exists
        existing_cred = db.query(OAuthCredential).filter(
            OAuthCredential.user_id == user.id,
            OAuthCredential.service == "google_calendar"
        ).first()

        if existing_cred:
            # Update existing credential
            existing_cred.access_token = credentials.token
            existing_cred.refresh_token = credentials.refresh_token
            existing_cred.token_type = "Bearer"  # OAuth 2.0 always uses Bearer tokens
            existing_cred.expires_at = credentials.expiry
            existing_cred.scopes = GOOGLE_CALENDAR_SCOPES
            existing_cred.is_active = True
            existing_cred.updated_at = datetime.utcnow()
        else:
            # Create new credential
            new_cred = OAuthCredential(
                user_id=user.id,
                service="google_calendar",
                access_token=credentials.token,
                refresh_token=credentials.refresh_token,
                token_type="Bearer",  # OAuth 2.0 always uses Bearer tokens
                expires_at=credentials.expiry,
                scopes=GOOGLE_CALENDAR_SCOPES,
                is_active=True
            )
            db.add(new_cred)

        db.commit()

        logger.info(f"Successfully connected Google Calendar for user {user.id}")

        # Redirect to frontend integrations page with success message
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/integrations?oauth_success=google-calendar"
        )

    except Exception as e:
        db.rollback()
        logger.error(f"Error in Google Calendar OAuth callback: {str(e)}")
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/integrations?oauth_error={str(e)}"
        )


@router.delete("/google-calendar/disconnect")
async def disconnect_google_calendar(
    request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Disconnect Google Calendar"""
    try:
        if not current_user:
            raise HTTPException(status_code=401, detail="Authentication required")
        credential = db.query(OAuthCredential).filter(
            OAuthCredential.user_id == current_user.id,
            OAuthCredential.service == "google_calendar"
        ).first()

        if not credential:
            raise HTTPException(status_code=404, detail="Google Calendar not connected")

        # Deactivate credential
        credential.is_active = False
        db.commit()

        logger.info(f"Disconnected Google Calendar for user {current_user.id}")

        return {"success": True, "message": "Google Calendar disconnected"}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error disconnecting Google Calendar: {str(e)}")
        raise HTTPException(status_code=500, detail="Error disconnecting Google Calendar")


@router.get("/google-calendar/status")
async def google_calendar_status(
    request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Check Google Calendar connection status"""
    try:
        if not current_user:
            return {"connected": False, "message": "Not authenticated"}
        credential = db.query(OAuthCredential).filter(
            OAuthCredential.user_id == current_user.id,
            OAuthCredential.service == "google_calendar",
            OAuthCredential.is_active == True
        ).first()

        if not credential:
            return {
                "connected": False,
                "message": "Google Calendar not connected"
            }

        # Check if token is expired
        is_expired = False
        if credential.expires_at:
            is_expired = credential.expires_at < datetime.utcnow()

        return {
            "connected": True,
            "service": "google_calendar",
            "expires_at": credential.expires_at.isoformat() if credential.expires_at else None,
            "is_expired": is_expired,
            "has_refresh_token": bool(credential.refresh_token)
        }

    except Exception as e:
        logger.error(f"Error checking Google Calendar status: {str(e)}")
        raise HTTPException(status_code=500, detail="Error checking connection status")
