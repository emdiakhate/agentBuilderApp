"""
Background Sound Configuration
Maps user-friendly environment names to audio file URLs for Vapi
"""

# Background sound URLs mapping
# Replace these URLs with your hosted audio files
BACKGROUND_SOUND_URLS = {
    "off": "off",  # No background sound
    "office": "office",  # Vapi built-in office sound

    # Custom sounds - Replace with your hosted audio file URLs
    # Audio files should be:
    # - Format: MP3, WAV, or OGG
    # - Loopable (seamless loop for continuous playback)
    # - Low volume (subtle ambient sound)
    # - Publicly accessible HTTPS URL

    # IMPORTANT: GitHub Raw URLs don't work with Vapi/Daily.co!
    # See AUDIO_CDN_SETUP.md for proper CDN setup instructions
    # Using Pixabay temporarily until you upload restaurant-1.mp3 to a CDN
    "restaurant": "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c84c5b3f3f.mp3",  # TEMP - Replace with CDN URL
    "clinic": "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",  # Hospital/clinic ambient
    "noisy": "https://cdn.pixabay.com/download/audio/2022/03/10/audio_4d8b2e1e46.mp3",  # Call center / busy office
    "home": "https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3",  # Home ambient with TV
    "cafe": "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c84c5b3f3f.mp3",  # Cafe ambient
}

# Display names for UI (French)
BACKGROUND_SOUND_LABELS = {
    "off": "🔇 Aucun - Pas de bruit de fond",
    "office": "🏢 Bureau - Environnement de bureau calme",
    "restaurant": "🍽️ Restaurant - Ambiance avec conversations",
    "clinic": "🏥 Clinique - Environnement médical",
    "noisy": "📢 Bruyant - Centre d'appels, environnement très bruyant",
    "home": "🏠 Domestique - Maison avec TV/musique",
    "cafe": "☕ Café - Ambiance café avec discussions",
}

# Descriptions for each environment
BACKGROUND_SOUND_DESCRIPTIONS = {
    "off": "Aucun bruit de fond, silence complet",
    "office": "Bruit de bureau léger avec claviers et conversations lointaines",
    "restaurant": "Ambiance de restaurant avec conversations et couverts",
    "clinic": "Environnement médical calme avec bruits d'équipement",
    "noisy": "Environnement très bruyant avec multiples conversations",
    "home": "Ambiance domestique avec télévision ou musique de fond",
    "cafe": "Ambiance de café avec machine à café et conversations",
}


def get_background_sound_url(environment: str) -> str:
    """
    Get the background sound URL for a given environment

    Args:
        environment: Environment name (office, restaurant, clinic, etc.)

    Returns:
        URL to audio file or Vapi built-in value ("off" or "office")
    """
    return BACKGROUND_SOUND_URLS.get(environment, "off")


def is_custom_background_sound(environment: str) -> bool:
    """
    Check if the environment uses a custom audio file (not Vapi built-in)

    Args:
        environment: Environment name

    Returns:
        True if custom audio file, False if Vapi built-in
    """
    return environment not in ["off", "office"]
