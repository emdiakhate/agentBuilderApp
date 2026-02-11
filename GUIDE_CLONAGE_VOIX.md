# Guide : Cloner des Voix Africaines

## 📝 Prérequis

- Compte Eleven Labs (Starter minimum)
- Fichiers audio de bonne qualité (voix africaines)
- 1 à 25 fichiers audio par voix

## 🎙️ Étapes pour Cloner une Voix

### 1. Préparer les Fichiers Audio

**Critères de qualité :**
- Format : MP3, WAV, M4A
- Durée : 1-5 minutes par fichier
- Qualité : Audio clair, sans bruit de fond
- Contenu : Voix parlée (pas de musique)
- Langue : Français ou Anglais

**Exemples de sources :**
- Enregistrements de locuteurs natifs africains
- Podcasts africains francophones/anglophones
- Interviews (avec permission)
- Enregistrements personnels

### 2. Via l'Interface Eleven Labs (Recommandé)

1. **Aller sur** https://elevenlabs.io/voice-lab
2. **Cliquer sur** "Add Voice" → "Instant Voice Cloning"
3. **Upload** vos fichiers audio (1-25 fichiers)
4. **Nommer** la voix (ex: "Aissatou - Sénégalaise")
5. **Ajouter des labels** :
   - Accent : "Senegalese" / "Nigerian" / "Ivorian" etc.
   - Language : "French" / "English"
   - Gender : "Female" / "Male"
   - Age : "Young" / "Middle-aged"
6. **Cliquer sur** "Create Voice"
7. **La voix apparaîtra automatiquement** dans votre app

### 3. Via l'API (Automatisé)

**Depuis votre application :**

1. Préparez vos fichiers audio
2. Utilisez l'endpoint de clonage (déjà implémenté) :

```bash
# Exemple avec curl
curl -X POST http://localhost:8000/api/voice-library/voices/clone \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=Aissatou - Voix Sénégalaise" \
  -F "description=Voix féminine sénégalaise, jeune, chaleureuse" \
  -F "files=@recording1.mp3" \
  -F "files=@recording2.mp3" \
  -F "files=@recording3.mp3"
```

**Depuis le frontend (à implémenter) :**
```typescript
import { cloneVoice } from '@/services/voiceService';

const files = [audioFile1, audioFile2, audioFile3];
const clonedVoice = await cloneVoice(
  "Aissatou - Sénégalaise",
  files,
  "Voix féminine sénégalaise"
);
```

### 4. Recommandations pour Voix Africaines

**Voix Francophones à Cloner :**
- 🇸🇳 Sénégal : Accent wolof
- 🇨🇮 Côte d'Ivoire : Accent ivoirien
- 🇨🇲 Cameroun : Accent camerounais
- 🇲🇱 Mali : Accent bambara
- 🇧🇯 Bénin : Accent béninois
- 🇨🇩 RD Congo : Accent congolais

**Voix Anglophones à Cloner :**
- 🇳🇬 Nigeria : Accent nigérian
- 🇬🇭 Ghana : Accent ghanéen
- 🇰🇪 Kenya : Accent kenyan
- 🇿🇦 Afrique du Sud : Accent sud-africain
- 🇺🇬 Ouganda : Accent ougandais
- 🇹🇿 Tanzanie : Accent tanzanien

## ⚠️ Considérations Légales

- **Consentement** : Assurez-vous d'avoir la permission du locuteur
- **Droits d'auteur** : N'utilisez pas de contenus protégés
- **Usage commercial** : Vérifiez les termes d'Eleven Labs

## 🎯 Conseils de Qualité

### Pour un Meilleur Clonage :

1. **Audio de Qualité** :
   - Enregistrez dans un environnement calme
   - Utilisez un bon microphone
   - Évitez l'écho et le bruit de fond

2. **Variété** :
   - Différentes intonations
   - Différentes émotions (neutre, joyeux, sérieux)
   - Différentes vitesses de parole

3. **Quantité** :
   - Minimum : 1 fichier (30 secondes)
   - Recommandé : 3-5 fichiers (1-2 minutes chacun)
   - Optimal : 10-15 fichiers (30 minutes total)

## 🔄 Après le Clonage

Les voix clonées apparaîtront automatiquement dans :
- ✅ Onglet "All Voices"
- ✅ Onglet "African Voices" (si labels corrects)
- ✅ Sélection de voix pour vos agents

## 📊 Limites par Plan

| Plan | Voix Clonées | Caractères/Mois |
|------|--------------|-----------------|
| Free | 0 | 10,000 |
| Starter | 10 | 30,000 |
| Creator | 30 | 100,000 |
| Pro | 160 | 500,000 |

## 🐛 Dépannage

**Problème : Voix clonée de mauvaise qualité**
- Solution : Utilisez des enregistrements plus longs et plus variés

**Problème : Voix ne s'affiche pas dans l'app**
- Solution : Actualisez la page (le cache se vide automatiquement après 30 min)

**Problème : Erreur lors du clonage**
- Vérifiez la taille des fichiers (< 25 MB chacun)
- Vérifiez le format (MP3, WAV, M4A uniquement)

---

**Note :** Le clonage de voix prend généralement 5-10 minutes. Soyez patient ! 🎉
