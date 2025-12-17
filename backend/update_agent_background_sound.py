"""
Script pour mettre à jour un agent existant avec la configuration de bruit de fond

Usage:
    python update_agent_background_sound.py <agent_id> <background_sound> <enable_denoising>

Exemple:
    python update_agent_background_sound.py c2dc22a9-685d-4079-a230-08f3e2c35e54 office true
"""

import sys
import asyncio
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.agent import Agent
from app.services.vapi_service import vapi_service
from loguru import logger


async def update_agent_background_sound(agent_id: str, background_sound: str, enable_denoising: bool):
    """Update agent with background sound configuration"""

    engine = create_engine(settings.DATABASE_URL)

    with Session(engine) as session:
        # Get agent
        agent = session.query(Agent).filter(Agent.id == agent_id).first()

        if not agent:
            logger.error(f"❌ Agent {agent_id} not found")
            return

        if not agent.vapi_assistant_id:
            logger.error(f"❌ Agent {agent.name} has no Vapi assistant ID")
            return

        logger.info(f"📋 Found agent: {agent.name}")
        logger.info(f"   Vapi Assistant ID: {agent.vapi_assistant_id}")
        logger.info(f"   Current background_sound: {agent.background_sound}")
        logger.info(f"   Current denoising: {agent.background_denoising_enabled}")
        logger.info("")

        # Prepare Vapi update
        vapi_updates = {}

        # Map background sound to Vapi format
        if background_sound in ["restaurant", "noisy", "home"]:
            vapi_updates["backgroundSound"] = "office"
        else:
            vapi_updates["backgroundSound"] = background_sound  # "off" or "office"

        # Configure denoising if enabled
        if enable_denoising:
            denoising_config = {
                "smartDenoisingPlan": {
                    "enabled": True
                }
            }

            # Add Fourier denoising based on environment
            if background_sound == "noisy":
                denoising_config["fourierDenoisingPlan"] = {
                    "enabled": True,
                    "mediaDetectionEnabled": True,
                    "baselineOffsetDb": -10,
                    "windowSizeMs": 2000,
                    "baselinePercentile": 90
                }
            elif background_sound == "home":
                denoising_config["fourierDenoisingPlan"] = {
                    "enabled": True,
                    "mediaDetectionEnabled": True,
                    "baselineOffsetDb": -15,
                    "windowSizeMs": 4000,
                    "baselinePercentile": 80
                }
            elif background_sound == "restaurant":
                denoising_config["fourierDenoisingPlan"] = {
                    "enabled": True,
                    "mediaDetectionEnabled": True,
                    "baselineOffsetDb": -12,
                    "windowSizeMs": 3000,
                    "baselinePercentile": 85
                }

            vapi_updates["backgroundSpeechDenoisingPlan"] = denoising_config

        logger.info(f"🔄 Updating Vapi assistant...")
        logger.info(f"   backgroundSound: {vapi_updates.get('backgroundSound')}")
        logger.info(f"   denoising: {enable_denoising}")

        try:
            # Update Vapi
            await vapi_service.update_assistant(
                assistant_id=agent.vapi_assistant_id,
                **vapi_updates
            )

            # Update local DB
            agent.background_sound = background_sound
            agent.background_denoising_enabled = enable_denoising
            session.commit()

            logger.info("")
            logger.info("✅ Agent updated successfully!")
            logger.info(f"   New background_sound: {background_sound}")
            logger.info(f"   New denoising: {enable_denoising}")
            logger.info("")
            logger.info("🎉 You can now test the call with background sound!")

        except Exception as e:
            logger.error(f"❌ Failed to update: {e}")
            session.rollback()
            raise


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python update_agent_background_sound.py <agent_id> <background_sound> <enable_denoising>")
        print("Example: python update_agent_background_sound.py c2dc22a9-685d-4079-a230-08f3e2c35e54 office true")
        print("")
        print("background_sound options: off, office, restaurant, noisy, home")
        print("enable_denoising: true or false")
        sys.exit(1)

    agent_id = sys.argv[1]
    background_sound = sys.argv[2]
    enable_denoising = sys.argv[3].lower() == "true"

    logger.info(f"🚀 Starting agent update...")
    logger.info(f"   Agent ID: {agent_id}")
    logger.info(f"   Background Sound: {background_sound}")
    logger.info(f"   Enable Denoising: {enable_denoising}")
    logger.info("")

    asyncio.run(update_agent_background_sound(agent_id, background_sound, enable_denoising))
