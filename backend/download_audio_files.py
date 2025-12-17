"""
Script pour télécharger les fichiers audio depuis GitHub et les préparer pour CDN

Ce script télécharge les fichiers audio depuis le repo GitHub et les sauvegarde localement.
Vous pourrez ensuite les uploader vers votre CDN (Cloudflare R2, AWS S3, etc.)

Usage:
    python download_audio_files.py
"""

import os
import requests
from pathlib import Path
from loguru import logger

# URLs des fichiers audio GitHub
GITHUB_AUDIO_FILES = {
    "restaurant-1": "https://raw.githubusercontent.com/iantrepreneur/bank_audio/main/restaurant-1.mp3",
    # Ajoutez d'autres fichiers ici si disponibles
    # "cafe": "https://raw.githubusercontent.com/iantrepreneur/bank_audio/main/cafe.mp3",
    # "clinic": "https://raw.githubusercontent.com/iantrepreneur/bank_audio/main/clinic.mp3",
}

# Dossier de destination
OUTPUT_DIR = Path("./audio_files")


def download_file(url: str, filename: str) -> bool:
    """
    Télécharge un fichier depuis une URL

    Args:
        url: URL du fichier
        filename: Nom du fichier de destination

    Returns:
        True si succès, False sinon
    """
    try:
        logger.info(f"Téléchargement de {filename}...")
        response = requests.get(url, stream=True, timeout=30)
        response.raise_for_status()

        # Vérifier que c'est bien un MP3
        content_type = response.headers.get('content-type', '')
        if 'audio' not in content_type.lower() and not filename.endswith('.mp3'):
            logger.warning(f"⚠️  Content-Type inattendu: {content_type}")

        # Sauvegarder le fichier
        output_path = OUTPUT_DIR / filename
        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        file_size = output_path.stat().st_size
        logger.success(f"✅ {filename} téléchargé ({file_size / 1024:.2f} KB)")
        return True

    except Exception as e:
        logger.error(f"❌ Erreur lors du téléchargement de {filename}: {e}")
        return False


def main():
    """Télécharge tous les fichiers audio"""

    # Créer le dossier de destination
    OUTPUT_DIR.mkdir(exist_ok=True)
    logger.info(f"📁 Dossier de destination: {OUTPUT_DIR.absolute()}")
    logger.info("")

    success_count = 0
    total_count = len(GITHUB_AUDIO_FILES)

    # Télécharger chaque fichier
    for name, url in GITHUB_AUDIO_FILES.items():
        filename = f"{name}.mp3"
        if download_file(url, filename):
            success_count += 1

    logger.info("")
    logger.info(f"📊 Résultat: {success_count}/{total_count} fichiers téléchargés")

    if success_count > 0:
        logger.info("")
        logger.info("🎉 Prochaines étapes:")
        logger.info("1. Vérifiez les fichiers dans: " + str(OUTPUT_DIR.absolute()))
        logger.info("2. Uploadez-les vers votre CDN (Cloudflare R2, AWS S3, etc.)")
        logger.info("3. Mettez à jour les URLs dans backend/app/core/background_sounds.py")
        logger.info("")
        logger.info("📝 Commandes pour uploader vers différents CDNs:")
        logger.info("")
        logger.info("# AWS S3:")
        logger.info("aws s3 cp audio_files/ s3://votre-bucket/sounds/ --recursive --acl public-read")
        logger.info("")
        logger.info("# Cloudflare R2 (via rclone):")
        logger.info("rclone copy audio_files/ r2:votre-bucket/sounds/")
        logger.info("")
        logger.info("# DigitalOcean Spaces:")
        logger.info("s3cmd put audio_files/* s3://votre-space/sounds/ --acl-public")


if __name__ == "__main__":
    logger.info("🎵 Téléchargement des fichiers audio depuis GitHub...")
    logger.info("")
    main()
