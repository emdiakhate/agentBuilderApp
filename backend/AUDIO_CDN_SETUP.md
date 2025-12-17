# 🔧 Configuration CDN pour les Bruits de Fond

## ⚠️ Problème avec GitHub Raw URLs

Les URLs GitHub Raw (`raw.githubusercontent.com`) **ne fonctionnent pas** avec Vapi pour les raisons suivantes :

1. **Redirections HTTP** - GitHub renvoie des redirections 302 que Vapi/Daily.co ne suit pas toujours
2. **En-têtes CORS restrictifs** - Les en-têtes CORS de GitHub ne sont pas optimaux pour le streaming audio
3. **Limitations de bande passante** - GitHub n'est pas conçu pour servir des fichiers audio en streaming
4. **Cache Headers** - En-têtes de cache qui peuvent causer des problèmes

### Erreur Typique

```
Meeting ended due to ejection: Meeting has ended
Vapi error: {type: 'daily-error', error: {...}}
```

## ✅ Solutions Recommandées

### Option 1 : Cloudflare R2 (Recommandé) ⭐

**Avantages :**
- ✅ Gratuit jusqu'à 10GB de stockage
- ✅ Pas de frais de sortie (egress)
- ✅ CDN mondial intégré
- ✅ CORS configurables
- ✅ URLs publiques directes

**Setup :**

```bash
# 1. Installer rclone
# https://rclone.org/install/

# 2. Configurer R2
rclone config
# Suivre les instructions pour Cloudflare R2

# 3. Télécharger les fichiers GitHub
python download_audio_files.py

# 4. Uploader vers R2
rclone copy audio_files/ r2:votre-bucket/sounds/ --header "Content-Type: audio/mpeg"

# 5. Rendre les fichiers publics
# Via dashboard Cloudflare R2 : Bucket > Public Access > Enable
```

**URL résultante :**
```
https://pub-xxxxxxx.r2.dev/sounds/restaurant-1.mp3
```

### Option 2 : AWS S3 + CloudFront

**Avantages :**
- ✅ Très fiable et rapide
- ✅ CDN CloudFront inclus
- ✅ Facile à configurer

**Coûts :**
- ~$0.023/GB stockage
- ~$0.085/GB transfert (via CloudFront)

**Setup :**

```bash
# 1. Créer un bucket S3
aws s3 mb s3://votre-bucket-sounds

# 2. Télécharger les fichiers
python download_audio_files.py

# 3. Uploader
aws s3 cp audio_files/ s3://votre-bucket-sounds/sounds/ \
  --recursive \
  --acl public-read \
  --content-type audio/mpeg \
  --metadata-directive REPLACE

# 4. Configurer CloudFront (optionnel mais recommandé)
# Via AWS Console: CloudFront > Create Distribution
```

**URL résultante :**
```
https://d1234567890.cloudfront.net/sounds/restaurant-1.mp3
# ou
https://votre-bucket-sounds.s3.amazonaws.com/sounds/restaurant-1.mp3
```

### Option 3 : DigitalOcean Spaces

**Avantages :**
- ✅ Simple et économique
- ✅ CDN intégré
- ✅ $5/mois pour 250GB

**Setup :**

```bash
# 1. Installer s3cmd
pip install s3cmd

# 2. Configurer
s3cmd --configure
# Entrer les credentials DigitalOcean Spaces

# 3. Télécharger les fichiers
python download_audio_files.py

# 4. Uploader
s3cmd put audio_files/*.mp3 s3://votre-space/sounds/ \
  --acl-public \
  --mime-type=audio/mpeg
```

**URL résultante :**
```
https://votre-space.nyc3.cdn.digitaloceanspaces.com/sounds/restaurant-1.mp3
```

### Option 4 : Netlify (Gratuit pour petits fichiers)

**Avantages :**
- ✅ Gratuit jusqu'à 100GB/mois bande passante
- ✅ Très simple

**Setup :**

```bash
# 1. Installer Netlify CLI
npm install -g netlify-cli

# 2. Télécharger les fichiers
python download_audio_files.py

# 3. Créer un dossier pour le site
mkdir audio-cdn
cp -r audio_files/* audio-cdn/

# 4. Déployer
cd audio-cdn
netlify deploy --prod
```

**URL résultante :**
```
https://votre-site.netlify.app/restaurant-1.mp3
```

## 🚀 Guide Rapide : Télécharger et Uploader

### Étape 1 : Télécharger les fichiers GitHub

```bash
cd backend
python download_audio_files.py
```

Cela créera un dossier `audio_files/` avec tous les fichiers MP3.

### Étape 2 : Choisir votre CDN

Choisissez une des options ci-dessus et suivez les instructions.

### Étape 3 : Mettre à jour background_sounds.py

```python
# backend/app/core/background_sounds.py

BACKGROUND_SOUND_URLS = {
    "off": "off",
    "office": "office",

    # Vos URLs CDN
    "restaurant": "https://votre-cdn.com/sounds/restaurant-1.mp3",
    "clinic": "https://votre-cdn.com/sounds/clinic.mp3",
    "cafe": "https://votre-cdn.com/sounds/cafe.mp3",
    # etc...
}
```

### Étape 4 : Redémarrer le backend

```bash
docker restart agent_backend
```

### Étape 5 : Tester

1. Créez un nouvel agent avec bruit de fond "Restaurant"
2. Lancez un appel
3. Vérifiez que le son fonctionne sans erreur "daily-error"

## 📝 Vérification des URLs

Avant de les utiliser, vérifiez que vos URLs :

```bash
# Test 1 : L'URL est accessible
curl -I https://votre-cdn.com/sounds/restaurant-1.mp3

# Vérifiez :
# ✅ Status: 200 OK
# ✅ Content-Type: audio/mpeg ou audio/mp3
# ✅ Content-Length présent
# ❌ Pas de redirections (301, 302)

# Test 2 : Télécharger le fichier
curl -o test.mp3 https://votre-cdn.com/sounds/restaurant-1.mp3

# Test 3 : Vérifier que c'est un MP3 valide
file test.mp3
# Devrait afficher: "Audio file with ID3 version 2.x.x"
```

## 🔍 Dépannage

### Problème : "daily-error" lors de l'appel

**Causes possibles :**
1. ❌ URL GitHub Raw (ne fonctionne pas)
2. ❌ URL avec redirection
3. ❌ Fichier trop gros (>10MB recommandé)
4. ❌ En-têtes CORS manquants
5. ❌ URL HTTP au lieu de HTTPS

**Solution :**
- Utilisez un vrai CDN (voir options ci-dessus)
- Vérifiez que l'URL retourne directement le MP3 (pas de redirection)
- Assurez-vous que le fichier fait moins de 10MB

### Problème : Le son ne boucle pas correctement

**Solution :**
- Assurez-vous que le fichier a un fade-in/fade-out
- Utilisez Audacity pour créer une boucle transparente

### Problème : Le son est trop fort/faible

**Solution :**
- Normalisez le volume à -20dB LUFS
- Utilisez `ffmpeg` pour ajuster :

```bash
ffmpeg -i input.mp3 -filter:a "volume=-20dB" output.mp3
```

## 📊 Comparaison des CDNs

| Service | Coût | Setup | Performance | Recommandé pour |
|---------|------|-------|-------------|-----------------|
| **Cloudflare R2** | Gratuit (10GB) | Moyen | ⭐⭐⭐⭐⭐ | Production |
| **AWS S3 + CloudFront** | ~$2-5/mois | Moyen | ⭐⭐⭐⭐⭐ | Production |
| **DigitalOcean Spaces** | $5/mois | Facile | ⭐⭐⭐⭐ | Production |
| **Netlify** | Gratuit | Très facile | ⭐⭐⭐⭐ | Tests/Prototypes |
| **GitHub Raw** | Gratuit | N/A | ❌ | **NE PAS UTILISER** |

## 🎯 Recommandation Finale

**Pour démarrer rapidement :** Utilisez **Netlify** (gratuit, 5 minutes de setup)

**Pour la production :** Utilisez **Cloudflare R2** (gratuit, performant, scalable)

**Si vous avez déjà AWS :** Utilisez **S3 + CloudFront** (intégration facile)

## 📞 Besoin d'Aide ?

Si vous rencontrez des problèmes :

1. Vérifiez les logs backend : `docker logs -f agent_backend`
2. Testez l'URL avec curl (voir section Vérification)
3. Vérifiez dans Vapi Dashboard que l'URL est correcte
4. Consultez la documentation Vapi : https://docs.vapi.ai

---

**Note Importante :** N'utilisez JAMAIS d'URLs GitHub Raw pour la production. Elles ne sont pas fiables pour le streaming audio et causeront des erreurs "daily-error".
