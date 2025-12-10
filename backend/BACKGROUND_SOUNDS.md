# Configuration des Bruits de Fond Personnalisés 🎵

Ce guide explique comment configurer vos propres fichiers audio pour les bruits de fond des agents vocaux.

## 📋 Vue d'ensemble

Le système permet d'utiliser des **URLs personnalisées** pour les bruits de fond au lieu des sons par défaut de Vapi ("office" et "off"). Cela vous permet de créer des environnements audio réalistes et adaptés à votre cas d'usage.

## 🎯 Environnements Disponibles

| Environnement | Description | Usage |
|---------------|-------------|-------|
| **Bureau** (office) | Son Vapi intégré | Claviers, conversations légères |
| **Restaurant** | Ambiance restaurant | Couverts, conversations, musique de fond |
| **Café** | Ambiance café | Machine à café, discussions |
| **Clinique** | Environnement médical | Calme avec bruits d'équipement occasionnels |
| **Bruyant** (noisy) | Centre d'appels | Multiples conversations simultanées |
| **Domestique** (home) | Maison | TV, musique de fond |

## 🔧 Configuration des URLs

### Fichier de Configuration

Les URLs sont configurées dans `backend/app/core/background_sounds.py` :

```python
BACKGROUND_SOUND_URLS = {
    "off": "off",
    "office": "office",  # Vapi built-in

    # Vos URLs personnalisées
    "restaurant": "https://votre-cdn.com/audio/restaurant-ambient.mp3",
    "clinic": "https://votre-cdn.com/audio/clinic-ambient.mp3",
    "noisy": "https://votre-cdn.com/audio/call-center-ambient.mp3",
    "home": "https://votre-cdn.com/audio/home-ambient.mp3",
    "cafe": "https://votre-cdn.com/audio/cafe-ambient.mp3",
}
```

### Exigences des Fichiers Audio

✅ **Format** : MP3, WAV, ou OGG
✅ **Durée** : 30 secondes minimum (idéalement 1-2 minutes)
✅ **Boucle** : Le fichier doit boucler de manière transparente (seamless loop)
✅ **Volume** : Audio subtil, pas trop fort (normalisé à -20dB LUFS recommandé)
✅ **Accès** : URL HTTPS publiquement accessible
✅ **Qualité** : 128-192 kbps pour MP3, 16-bit 44.1kHz pour WAV

## 🎨 Créer Vos Propres Fichiers Audio

### Option 1 : Utiliser des Ressources Gratuites

**Sites recommandés :**
- [Freesound.org](https://freesound.org) - Sons d'ambiance sous Creative Commons
- [Pixabay Audio](https://pixabay.com/music/) - Musique et sons gratuits
- [ZapSplat](https://www.zapsplat.com) - Effets sonores gratuits
- [BBC Sound Effects](https://sound-effects.bbcrewind.co.uk) - Archives BBC

**Recherchez par mots-clés :**
- Restaurant: "restaurant ambience", "cafe chatter", "dining atmosphere"
- Clinic: "hospital ambience", "medical equipment", "waiting room"
- Noisy: "call center", "busy office", "crowd chatter"

### Option 2 : Créer des Boucles Personnalisées

**Logiciels recommandés :**
- [Audacity](https://www.audacityteam.org) (Gratuit)
- [Adobe Audition](https://www.adobe.com/products/audition.html) (Payant)
- [Reaper](https://www.reaper.fm) (Essai gratuit)

**Étapes pour créer une boucle transparente :**

1. **Enregistrez ou téléchargez** votre audio source (2-5 minutes)
2. **Normalisez** le volume (cible : -20dB LUFS)
3. **Coupez** pour créer une boucle :
   ```
   - Trouvez un point de bouclage naturel
   - Appliquez un fade-in au début (0.5-1s)
   - Appliquez un fade-out à la fin (0.5-1s)
   - Testez la boucle pour vérifier qu'elle est transparente
   ```
4. **Exportez** en MP3 192kbps ou WAV 16-bit

### Option 3 : Utiliser un Service de Synthèse

**Services d'IA pour créer des ambiances :**
- [Epidemic Sound](https://www.epidemicsound.com) - Bibliothèque musicale avec ambiances
- [Soundraw.io](https://soundraw.io) - Génération d'ambiances par IA

## 🚀 Hébergement des Fichiers

### Option 1 : CDN Dédié (Recommandé)

**Services CDN :**
- **AWS S3 + CloudFront** : Scalable, fiable
  ```bash
  # Exemple de commande AWS CLI
  aws s3 cp restaurant-ambient.mp3 s3://votre-bucket/sounds/
  ```
- **Cloudflare R2** : Sans frais de sortie
- **DigitalOcean Spaces** : Simple et économique

**Configuration requise :**
- ✅ HTTPS activé
- ✅ CORS configuré pour Vapi
- ✅ Cache-Control headers appropriés

### Option 2 : GitHub/GitLab (Pour Tests)

```bash
# 1. Ajouter fichier à votre repo (max 100MB)
git lfs track "*.mp3"
git add .gitattributes
git add sounds/restaurant-ambient.mp3
git commit -m "Add restaurant ambient sound"

# 2. Utiliser l'URL raw
https://raw.githubusercontent.com/votre-user/votre-repo/main/sounds/restaurant-ambient.mp3
```

⚠️ **Limitation** : GitHub n'est pas un CDN et a des limites de bande passante

### Option 3 : Netlify/Vercel

```bash
# Netlify
netlify deploy --dir=./sounds --prod

# Vercel
vercel deploy --prod ./sounds
```

## 🔄 Mise à Jour des URLs

### 1. Modifier le Fichier de Configuration

Éditez `backend/app/core/background_sounds.py` :

```python
BACKGROUND_SOUND_URLS = {
    # ...
    "restaurant": "https://votre-nouveau-cdn.com/restaurant-v2.mp3",
}
```

### 2. Redémarrer le Backend

```bash
# Avec Docker
docker restart agent_backend

# Ou sans Docker
cd backend
uvicorn app.main:app --reload
```

### 3. Tester

1. Créez un nouvel agent avec l'environnement modifié
2. Testez un appel vocal
3. Vérifiez que le nouveau son est bien joué

## 🎯 Ajouter un Nouvel Environnement

### 1. Ajouter l'URL

Dans `background_sounds.py` :

```python
BACKGROUND_SOUND_URLS = {
    # ... existing
    "pharmacy": "https://cdn.example.com/pharmacy-ambient.mp3",
}

BACKGROUND_SOUND_LABELS = {
    # ... existing
    "pharmacy": "💊 Pharmacie - Environnement de pharmacie",
}

BACKGROUND_SOUND_DESCRIPTIONS = {
    # ... existing
    "pharmacy": "Ambiance de pharmacie avec bip de caisse et conversations",
}
```

### 2. Ajouter au Frontend

Dans `src/pages/AgentCreate.tsx` :

```tsx
<SelectContent>
  {/* ... existing options */}
  <SelectItem value="pharmacy">💊 Pharmacie - Environnement de pharmacie</SelectItem>
</SelectContent>
```

### 3. Configurer le Débruitage (Optionnel)

Dans `backend/app/services/vapi_service.py` :

```python
elif background_sound == "pharmacy":
    denoising_config["fourierDenoisingPlan"] = {
        "enabled": True,
        "mediaDetectionEnabled": True,
        "baselineOffsetDb": -15,  # Quiet environment
        "windowSizeMs": 3200,
        "baselinePercentile": 80
    }
```

## 📊 Profils de Débruitage

Chaque environnement a un profil de débruitage optimisé :

| Environnement | baselineOffsetDb | windowSizeMs | baselinePercentile | Usage |
|---------------|------------------|--------------|-------------------|-------|
| **Noisy** | -10 | 2000 | 90 | Filtrage agressif |
| **Restaurant/Cafe** | -12 | 3000 | 85 | Équilibré |
| **Home** | -15 | 4000 | 80 | TV/Musique |
| **Clinic** | -18 | 3500 | 75 | Environnement calme |

**Paramètres :**
- `baselineOffsetDb` : Plus négatif = filtrage plus agressif
- `windowSizeMs` : Temps d'adaptation (plus long = plus stable)
- `baselinePercentile` : Seuil de détection de la parole (plus haut = plus sélectif)

## 🐛 Dépannage

### Problème : Le son ne joue pas

**Solutions :**
1. ✅ Vérifiez que l'URL est HTTPS
2. ✅ Testez l'URL directement dans le navigateur
3. ✅ Vérifiez les logs backend : `docker logs agent_backend`
4. ✅ Vérifiez dans Vapi Dashboard que l'URL est bien configurée

### Problème : Le son coupe ou boucle mal

**Solutions :**
1. ✅ Ajoutez un fade-in/fade-out de 1 seconde
2. ✅ Assurez-vous que le fichier fait au moins 30 secondes
3. ✅ Testez la boucle en local avant de l'uploader

### Problème : Latence ou lenteur

**Solutions :**
1. ✅ Utilisez un CDN proche de vos utilisateurs
2. ✅ Compressez l'audio (192kbps max pour MP3)
3. ✅ Activez le cache CDN

## 📝 Exemples de Configuration

### Restaurant Français

```python
"restaurant": "https://cdn.votre-site.fr/ambiance-restaurant-francais.mp3"
# Profil : Conversations en français, couverts, musique jazz douce
# Durée : 2 minutes, loop seamless
# Volume : -22dB LUFS
```

### Clinique Médicale

```python
"clinic": "https://cdn.votre-site.fr/ambiance-clinique-medicale.mp3"
# Profil : Bip d'équipement occasionnel, pas lourds, porte qui s'ouvre
# Durée : 90 secondes, loop seamless
# Volume : -25dB LUFS (plus calme)
```

### Centre d'Appels

```python
"noisy": "https://cdn.votre-site.fr/centre-appels-ambiance.mp3"
# Profil : Multiples conversations téléphoniques, claviers, imprimante
# Durée : 3 minutes, loop seamless
# Volume : -18dB LUFS (plus présent)
```

## 🔒 Sécurité et Confidentialité

- ✅ N'utilisez que des fichiers audio libres de droits ou que vous possédez
- ✅ Vérifiez les licences Creative Commons
- ✅ Ne partagez pas d'URLs privées dans le code source
- ✅ Utilisez des variables d'environnement pour les URLs sensibles

## 📚 Ressources Supplémentaires

- [Vapi Background Sound Documentation](https://docs.vapi.ai/api-reference/assistants/create)
- [Creating Seamless Audio Loops Tutorial](https://www.youtube.com/results?search_query=create+seamless+audio+loop)
- [Audio Normalization Guide](https://www.masterclass.com/articles/audio-normalization)

## 💡 Bonnes Pratiques

1. **Testez** toujours le son dans un appel réel avant de déployer
2. **Optimisez** la taille des fichiers (< 5MB recommandé)
3. **Documentez** vos choix de sons pour l'équipe
4. **Versionnez** vos fichiers audio (restaurant-v1.mp3, restaurant-v2.mp3)
5. **Monitorer** l'utilisation de bande passante de votre CDN

---

Pour toute question ou problème, consultez les logs backend :
```bash
docker logs -f agent_backend
```
