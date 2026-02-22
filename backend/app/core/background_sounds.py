"""
Background Sound Configuration
Maps user-friendly environment names to audio file URLs for Vapi

IMPORTANT: Pour ajouter vos propres sons ambiants :
1. Téléchargez des sons gratuits depuis :
   - https://pixabay.com/sound-effects/search/restaurant-ambience/
   - https://mixkit.co/free-sound-effects/ambience/
   - https://freesound.org/ (inscription requise)
   - https://www.zapsplat.com/sound-effect-category/ambient/
2. Hébergez les fichiers MP3 sur un CDN accessible publiquement
   (ex: AWS S3, Cloudflare R2, ou un serveur statique)
3. Remplacez les URLs ci-dessous par vos URLs hébergées
4. Les URLs doivent être accessibles sans authentification (HTTPS direct)

Note: Les sons nécessitent des URLs publiques pour fonctionner
à la fois en preview (frontend) et en appel réel (via Vapi).
"""

# Background sound URLs mapping
# For custom sounds, use publicly accessible HTTPS URLs to MP3/WAV/FLAC files
BACKGROUND_SOUND_URLS = {
    "off": "off",      # No background sound
    "office": "https://pub-c5279a6f97c24d0b810f79f465f6298d.r2.dev/office.flac",

    # === SONS PERSONNALISÉS (Cloudflare R2 CDN) ===
    "restaurant": "https://pub-c5279a6f97c24d0b810f79f465f6298d.r2.dev/Restaurant.mp3",
    "cafe": "https://cdn.pixabay.com/audio/2024/11/04/audio_65b2ea5101.mp3",
    "noisy": "https://pub-c5279a6f97c24d0b810f79f465f6298d.r2.dev/call_center.mp3",
    "home": "https://cdn.pixabay.com/audio/2022/01/20/audio_7d8e741664.mp3",
    "clinic": "https://pub-c5279a6f97c24d0b810f79f465f6298d.r2.dev/hopital.flac",
}

# Display names for UI (French)
BACKGROUND_SOUND_LABELS = {
    "off": "Aucun - Pas de bruit de fond",
    "office": "Bureau - Environnement de bureau calme",
    "restaurant": "Restaurant - Ambiance avec conversations",
    "clinic": "Clinique / Hôpital - Environnement médical",
    "noisy": "Centre d'appels - Environnement très bruyant",
    "home": "Domestique - Maison avec TV/musique",
    "cafe": "Café - Ambiance café avec discussions",
}


def get_background_sound_url(environment: str) -> str:
    """
    Get the background sound URL for a given environment

    Args:
        environment: Environment name (office, restaurant, clinic, etc.)

    Returns:
        URL to audio file, or "off" if no background sound
    """
    return BACKGROUND_SOUND_URLS.get(environment, "off")


def get_all_background_sounds() -> dict:
    """
    Get all background sounds with their URLs and labels for debugging/testing

    Returns:
        Dict with sound name, URL, and label for each environment
    """
    result = {}
    for key, url in BACKGROUND_SOUND_URLS.items():
        result[key] = {
            "url": url,
            "label": BACKGROUND_SOUND_LABELS.get(key, key),
            "is_builtin": key == "off",
            "is_custom_url": key != "off",
        }
    return result
