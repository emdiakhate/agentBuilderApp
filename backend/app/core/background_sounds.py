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

Note: "office" est un son intégré à Vapi (pas d'URL nécessaire).
Les autres sons nécessitent des URLs publiques pour fonctionner
à la fois en preview (frontend) et en appel réel (via Vapi).
"""

# Background sound URLs mapping
# "office" is a Vapi built-in sound (just pass the string "office")
# For custom sounds, use publicly accessible HTTPS URLs to MP3/WAV files
BACKGROUND_SOUND_URLS = {
    "off": "off",      # No background sound
    "office": "office", # Vapi built-in office sound (works out of the box)

    # === SONS PERSONNALISÉS ===
    # Remplacez ces URLs par vos propres fichiers MP3 hébergés sur un CDN
    # Les URLs actuelles sont des exemples de Pixabay (peuvent ne pas fonctionner directement)
    "restaurant": "https://cdn.pixabay.com/audio/2022/03/15/audio_115fb58836.mp3",
    "cafe": "https://cdn.pixabay.com/audio/2024/11/04/audio_65b2ea5101.mp3",
    "noisy": "https://cdn.pixabay.com/audio/2022/10/30/audio_f5bd819213.mp3",
    "home": "https://cdn.pixabay.com/audio/2022/01/20/audio_7d8e741664.mp3",
    "clinic": "https://cdn.pixabay.com/audio/2024/06/06/audio_7a3361a00e.mp3",
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
        URL to audio file or Vapi built-in value ("off" or "office")
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
            "is_builtin": key in ("off", "office"),
            "is_custom_url": key not in ("off", "office"),
        }
    return result
