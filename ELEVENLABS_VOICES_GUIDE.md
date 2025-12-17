# Guide d'Intégration des Voix Eleven Labs

## 📋 Vue d'ensemble

Ce guide explique comment configurer et utiliser l'intégration dynamique des voix Eleven Labs, avec un focus particulier sur les voix africaines en français et en anglais.

## 🚀 Fonctionnalités

### ✨ Nouveautés

- **Chargement dynamique des voix** depuis l'API Eleven Labs (au lieu de 4 voix hardcodées)
- **Onglet "African Voices"** dédié aux voix africaines
- **Filtrage par accent et langue** (african, french, english)
- **Prévisualisation audio** pour toutes les voix
- **Informations détaillées** : accent, genre, âge, langue, cas d'usage
- **Support de toutes les voix Eleven Labs** disponibles sur votre compte

### 📊 Onglets Disponibles

1. **All Voices** - Toutes les voix Eleven Labs disponibles
2. **African Voices** - Voix africaines filtrées (français et anglais)
3. **Amazon Polly** - Voix Amazon Polly (legacy)
4. **Google TTS** - Voix Google Text-to-Speech (legacy)

## 🔧 Configuration

### 1. Obtenir une Clé API Eleven Labs

1. Créez un compte sur [Eleven Labs](https://elevenlabs.io/)
2. Accédez à votre [profil](https://elevenlabs.io/app/profile)
3. Copiez votre clé API dans la section "API Key"

### 2. Configurer le Backend

Ajoutez votre clé API dans le fichier `.env` du backend :

```bash
cd backend
cp .env.example .env  # Si vous n'avez pas encore de fichier .env
```

Éditez le fichier `.env` et ajoutez votre clé :

```env
# Voice & Assistant Integration
ELEVENLABS_API_KEY=your-elevenlabs-api-key-here
```

### 3. Redémarrer le Backend

```bash
# Si vous utilisez Docker
docker compose restart backend

# Si vous utilisez uvicorn directement
cd backend
uvicorn app.main:app --reload
```

### 4. Vérifier l'Installation

Testez l'endpoint API :

```bash
curl http://localhost:8000/api/voices/elevenlabs
```

Vous devriez recevoir une liste de voix au format JSON.

## 📖 Utilisation

### Interface Utilisateur

1. **Créer ou Éditer un Agent**
   - Allez dans la page de détails d'un agent
   - Cliquez sur la section "Voice Configuration"
   - Cliquez sur le bouton pour sélectionner une voix

2. **Sélectionner une Voix Africaine**
   - Dans le modal de sélection des voix, cliquez sur l'onglet **"African"**
   - Parcourez les voix africaines disponibles en français et en anglais
   - Cliquez sur l'icône de lecture pour prévisualiser la voix
   - Cliquez sur une voix pour la sélectionner

3. **Rechercher Toutes les Voix**
   - Utilisez l'onglet **"All Voices"** pour voir toutes les voix disponibles
   - Les voix sont organisées avec leurs métadonnées (accent, genre, âge, langue)

### API Endpoints

#### Récupérer Toutes les Voix Eleven Labs

```bash
GET /api/voices/elevenlabs
```

**Exemple de réponse :**

```json
[
  {
    "id": "voice_id_123",
    "name": "Amara",
    "accent": "African",
    "language": "French",
    "age": "Young",
    "gender": "Female",
    "use_case": "Narration",
    "description": "Warm and engaging African French voice",
    "preview_url": "https://...",
    "category": "premade",
    "labels": {
      "accent": "african",
      "language": "french",
      "age": "young",
      "gender": "female"
    }
  }
]
```

#### Filtrer les Voix par Accent

```bash
GET /api/voices/elevenlabs?accents=african
```

#### Filtrer les Voix par Langue

```bash
GET /api/voices/elevenlabs?languages=french,english
```

#### Filtrer par Accent ET Langue

```bash
GET /api/voices/elevenlabs?accents=african&languages=french,english
```

#### Obtenir les Détails d'une Voix Spécifique

```bash
GET /api/voices/elevenlabs/{voice_id}
```

## 🔍 Architecture Technique

### Backend

**Fichiers créés/modifiés :**

1. **`backend/app/services/elevenlabs_service.py`**
   - Service pour interagir avec l'API Eleven Labs
   - Méthodes : `get_all_voices()`, `get_voice_details()`
   - Filtrage par accent et langue

2. **`backend/app/api/endpoints/voices.py`**
   - Endpoint REST pour exposer les voix
   - Route : `/api/voices/elevenlabs`
   - Paramètres de query : `accents`, `languages`

3. **`backend/app/core/config.py`**
   - Ajout de `ELEVENLABS_API_KEY`

4. **`backend/app/main.py`**
   - Enregistrement du router `voices`

### Frontend

**Fichiers créés/modifiés :**

1. **`src/services/voiceService.ts`**
   - Client API pour récupérer les voix
   - Interface TypeScript : `VoiceData`, `VoiceFilters`

2. **`src/hooks/useVoices.ts`**
   - Hook React Query : `useElevenLabsVoices()`
   - Hook spécialisé : `useAfricanVoices()`
   - Hook général : `useAllElevenLabsVoices()`

3. **`src/components/VoiceSelectionModal.tsx`**
   - Modal de sélection avec 4 onglets
   - Chargement dynamique depuis l'API
   - État de chargement avec spinner
   - Gestion d'erreur si API key non configurée

4. **`src/components/AgentConfigSettings.tsx`**
   - Intégration des voix dynamiques
   - Recherche dans les voix Eleven Labs avant les voix legacy

## 🎨 Exemple de Code

### Utiliser le Hook dans un Composant

```typescript
import { useAfricanVoices } from '@/hooks/useVoices';

function MyComponent() {
  const { data: voices, isLoading, error } = useAfricanVoices();

  if (isLoading) return <div>Chargement des voix...</div>;
  if (error) return <div>Erreur : {error.message}</div>;

  return (
    <div>
      <h2>Voix Africaines</h2>
      {voices?.map(voice => (
        <div key={voice.id}>
          <h3>{voice.name}</h3>
          <p>Accent : {voice.accent}</p>
          <p>Langue : {voice.language}</p>
        </div>
      ))}
    </div>
  );
}
```

### Filtres Personnalisés

```typescript
import { useElevenLabsVoices } from '@/hooks/useVoices';

function MyComponent() {
  const { data: voices } = useElevenLabsVoices({
    accents: ['african', 'british'],
    languages: ['french', 'english']
  });

  return <VoiceList voices={voices} />;
}
```

## 🐛 Dépannage

### Problème : Aucune voix n'apparaît

**Solutions :**
1. Vérifiez que `ELEVENLABS_API_KEY` est bien configurée dans `.env`
2. Vérifiez que le backend a bien redémarré après l'ajout de la clé
3. Testez l'endpoint directement : `curl http://localhost:8000/api/voices/elevenlabs`
4. Vérifiez les logs du backend pour les erreurs

### Problème : Message "No voices available"

**Solutions :**
1. La clé API n'est pas configurée ou est invalide
2. Vérifiez que votre compte Eleven Labs a accès aux voix
3. Vérifiez votre quota API sur le dashboard Eleven Labs

### Problème : Aucune voix africaine trouvée

**Solutions :**
1. Vérifiez que les voix africaines sont disponibles sur votre plan Eleven Labs
2. Les filtres sont sensibles à la casse : "african" doit correspondre aux labels Eleven Labs
3. Testez sans filtre pour voir toutes les voix disponibles

### Problème : Prévisualisation audio ne fonctionne pas

**Solutions :**
1. Vérifiez que `preview_url` est bien retourné par l'API
2. Vérifiez la console du navigateur pour les erreurs CORS
3. Certaines voix peuvent ne pas avoir de preview disponible

## 📚 Ressources Utiles

- [Documentation API Eleven Labs](https://elevenlabs.io/docs/api-reference/overview)
- [Liste des Voix Disponibles](https://elevenlabs.io/docs/voices)
- [Tarification Eleven Labs](https://elevenlabs.io/pricing)

## 🎯 Prochaines Améliorations

- [ ] Cache local des voix pour réduire les appels API
- [ ] Recherche et tri des voix dans l'interface
- [ ] Support de la création de voix personnalisées
- [ ] Clonage de voix via l'interface
- [ ] Ajout d'autres providers vocaux (Play.ht, Azure, etc.)

## ⚠️ Limitations

- **Quota API** : Eleven Labs limite le nombre d'appels API selon votre plan
- **Nombre de voix** : Le nombre de voix disponibles dépend de votre abonnement
- **Preview audio** : Limité par les restrictions CORS du navigateur
- **Cache** : Les voix sont actuellement rechargées à chaque ouverture du modal (cache de 30 minutes via React Query)

## 📝 Notes de Version

### v1.0.0 (2025-12-17)

- ✅ Intégration initiale de l'API Eleven Labs
- ✅ Support des voix africaines avec filtres
- ✅ Remplacement des 4 voix hardcodées par un système dynamique
- ✅ Ajout de l'onglet "African Voices"
- ✅ Cache côté frontend (30 minutes)
- ✅ Gestion d'erreur et états de chargement

## 🤝 Contribution

Pour contribuer à l'amélioration de cette fonctionnalité :

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/amelioration-voix`)
3. Committez vos changements (`git commit -m 'feat: ajout de...'`)
4. Push vers la branche (`git push origin feature/amelioration-voix`)
5. Ouvrez une Pull Request

---

**Développé avec ❤️ pour agentBuilderApp**
