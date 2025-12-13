# Guide des Intégrations Vapi

Ce guide explique comment utiliser la page Intégrations de votre plateforme Agent Builder, qui s'appuie sur le système d'intégrations natif de Vapi.

## Vue d'ensemble

La page **Intégrations** (`/integrations`) affiche toutes les intégrations disponibles via Vapi, organisées par catégories. Contrairement à un système OAuth personnalisé, cette approche utilise directement les capacités d'intégration de Vapi, ce qui simplifie grandement la configuration et la maintenance.

## Accès à la page Intégrations

Vous pouvez accéder à la page Intégrations de deux façons :

1. **Via le menu latéral** : Cliquez sur "Intégrations" dans la sidebar
2. **Via les Paramètres** : Allez dans Paramètres → Section Intégrations → Bouton "Voir les intégrations"

## Catégories d'intégrations

### 1. Voice Providers (Fournisseurs de voix)
Services de synthèse vocale (Text-to-Speech) :
- **ElevenLabs** : Clonage de voix IA avec voix réalistes
- **Cartesia** : TTS ultra-rapide avec voix ultra-réalistes
- **Deepgram** : Reconnaissance en temps réel avec meilleure précision
- **LMNT** : Parole expressive à faible latence
- **Neets** : TTS de haute qualité avec voix naturelles
- **PlayHT** : Génération de voix IA ultra-réaliste
- **Rime** : Clonage de voix premium

### 2. Model Providers (Fournisseurs de modèles)
Modèles de langage (LLM) :
- **OpenAI** : GPT-4, GPT-4 Turbo, GPT-3.5
- **Anthropic** : Claude 3 Opus, Sonnet, Haiku
- **Groq** : Inférence rapide avec latence quasi-nulle
- **Azure OpenAI** : Modèles OpenAI sur Azure
- **Perplexity AI** : Chat et recherche en temps réel
- **Together AI** : Accès unifié à des modèles IA
- **Anyscale** : Plateforme scalable pour modèles open-source
- **OpenRouter** : API unifiée pour collection de LLM
- **DeepInfra** : Inférence gérée la moins chère
- **Custom LLM** : Connectez vos propres endpoints

### 3. Transcriber Providers (Fournisseurs de transcription)
Services de reconnaissance vocale (Speech-to-Text) :
- **Deepgram** : Reconnaissance rapide en temps réel
- **AssemblyAI** : Reconnaissance vocale et analyse
- **ElevenLabs** : Transcription rapide et précise
- **Gladia** : Reconnaissance vocale via API

### 4. Tool Providers (Fournisseurs d'outils) 🎯
**C'est ici que se trouvent les intégrations pour Google Calendar !**

- **Make** : Automatisation de workflows avec Make.com
- **GoHighLevel** : CRM et automatisation marketing
- **SmallsAI** : Agents vocaux personnalisés
- **Google Calendar** 📅 : Gestion d'événements et de plannings
- **Google Sheets** 📊 : Ajout de données dans les feuilles de calcul
- **GoHighLevel MCP** : Intégration avancée GoHighLevel

### 5. Vector Store Providers
Bases de données vectorielles :
- **Telnyx** (Deprecated) : Plateforme efficace pour l'IA vocale

### 6. Phone Number Providers
Fournisseurs de numéros de téléphone :
- **SIP Trunk** : Connexion avec opérateur téléphonique
- **Dialys** : Téléphonie d'entreprise
- **Vonage** : Services de communication programmables

### 7. Cloud Providers
Stockage cloud pour les enregistrements :
- **AWS S3** : Stockage cloud scalable
- **Azure Blob Storage** : Stockage d'entreprise
- **Google Cloud Storage** : Stockage flexible à faible latence
- **Cloudflare R2** : Stockage sans frais de sortie
- **Supabase** : Stockage cloud open-source

### 8. Observability Providers
Outils d'observabilité et d'analyse :
- **Langfuse** : Observabilité LLM, journalisation et analytics

### 9. Server Configuration
Configuration des serveurs et authentification

## Comment utiliser Google Calendar avec Vapi

### Étape 1 : Configuration via Vapi Dashboard

1. Allez sur votre tableau de bord Vapi : https://dashboard.vapi.ai
2. Naviguez vers la section **Intégrations** ou **Tools**
3. Recherchez **Google Calendar**
4. Cliquez sur **Connect** ou **Configure**
5. Suivez le flux OAuth de Google pour autoriser Vapi
6. Une fois connecté, Vapi gère automatiquement les tokens et les rafraîchissements

### Étape 2 : Créer des outils Google Calendar dans Vapi

Dans le dashboard Vapi, créez des outils personnalisés :

#### Outil 1 : Créer un événement
```json
{
  "type": "google.calendar.event.create",
  "name": "Créer un rendez-vous",
  "description": "Crée un événement dans Google Calendar",
  "parameters": {
    "summary": "Titre du rendez-vous",
    "startDateTime": "Date et heure de début (ISO 8601)",
    "endDateTime": "Date et heure de fin (ISO 8601)",
    "attendees": "Liste des participants (emails)",
    "timeZone": "Fuseau horaire (ex: Europe/Paris)"
  }
}
```

#### Outil 2 : Vérifier la disponibilité
```json
{
  "type": "google.calendar.availability.check",
  "name": "Vérifier disponibilité",
  "description": "Vérifie la disponibilité dans le calendrier",
  "parameters": {
    "startDateTime": "Date et heure de début",
    "endDateTime": "Date et heure de fin",
    "timeZone": "Fuseau horaire"
  }
}
```

### Étape 3 : Assigner les outils aux agents

1. Dans Vapi Dashboard, éditez votre agent
2. Allez dans la section **Tools** ou **Model Configuration**
3. Ajoutez les outils Google Calendar créés
4. Configurez les messages que l'agent doit dire lors de l'utilisation de l'outil

Exemple de configuration d'agent :
```json
{
  "model": {
    "provider": "openai",
    "model": "gpt-4",
    "tools": [
      {
        "type": "google.calendar.event.create",
        "messages": [
          {
            "role": "tool-call",
            "content": "Je vérifie les disponibilités..."
          },
          {
            "role": "tool-call-result",
            "content": "Parfait ! J'ai créé votre rendez-vous."
          }
        ]
      }
    ]
  }
}
```

### Étape 4 : Tester l'intégration

1. Démarrez un appel avec votre agent Vapi
2. Demandez à l'agent de créer un rendez-vous
3. L'agent utilisera automatiquement l'outil Google Calendar
4. Vérifiez que l'événement apparaît bien dans Google Calendar

## Exemple de conversation

**Utilisateur** : "Bonjour, je voudrais prendre rendez-vous pour demain à 14h"

**Agent** : "Bien sûr ! Je vérifie les disponibilités pour demain à 14h..."
*[L'agent appelle l'outil de vérification de disponibilité]*

**Agent** : "C'est disponible ! Pour quelle raison souhaitez-vous ce rendez-vous ?"

**Utilisateur** : "Pour une consultation"

**Agent** : "Parfait ! Je crée votre rendez-vous pour une consultation demain à 14h..."
*[L'agent appelle l'outil de création d'événement]*

**Agent** : "Votre rendez-vous est confirmé ! Vous recevrez un email de confirmation de Google Calendar."

## Avantages de cette approche

### ✅ Utilisation du système natif Vapi
- **Pas de code backend personnalisé** : Vapi gère tout l'OAuth
- **Maintenance simplifiée** : Pas de gestion de tokens
- **Sécurité renforcée** : Vapi suit les meilleures pratiques
- **Mises à jour automatiques** : Nouvelles intégrations disponibles immédiatement

### ✅ Interface unifiée
- **Page unique** : Toutes les intégrations au même endroit
- **Recherche facile** : Trouvez rapidement l'intégration souhaitée
- **Organisation claire** : Catégories logiques

### ✅ Scalabilité
- **Ajout facile** : Nouvelles intégrations sans code
- **Multi-services** : Google Calendar, Sheets, Make, etc.
- **Future-proof** : Compatible avec les futures intégrations Vapi

## Configuration côté Agent Builder

Dans votre application Agent Builder, vous n'avez rien à configurer côté backend pour les intégrations Vapi. Tout se passe via :

1. **Le Dashboard Vapi** : Pour la configuration OAuth et la création d'outils
2. **L'API Vapi** : Pour assigner les outils aux agents

Votre application Agent Builder affiche simplement la liste des intégrations disponibles et permet de naviguer vers le dashboard Vapi pour la configuration.

## Flux de travail recommandé

```
1. Utilisateur clique sur "Intégrations" dans Agent Builder
   ↓
2. Voit Google Calendar dans la catégorie "Tool Providers"
   ↓
3. Clique sur "Configurer" → Redirigé vers Vapi Dashboard
   ↓
4. Se connecte à Google via OAuth (géré par Vapi)
   ↓
5. Crée des outils Google Calendar dans Vapi
   ↓
6. Assigne les outils aux agents dans Vapi
   ↓
7. Retourne dans Agent Builder pour tester les agents
   ↓
8. Les agents peuvent maintenant gérer le calendrier !
```

## Prochaines étapes

Pour aller plus loin avec les intégrations :

1. **Google Sheets** : Ajoutez des données d'appels dans des feuilles de calcul
2. **Make.com** : Automatisez des workflows complexes
3. **CRM GoHighLevel** : Intégrez avec votre CRM
4. **Stockage Cloud** : Sauvegardez les transcriptions dans S3 ou Azure

## Ressources

- **Documentation Vapi** : https://docs.vapi.ai
- **Dashboard Vapi** : https://dashboard.vapi.ai
- **Google Calendar API** : https://developers.google.com/calendar
- **Communauté Vapi** : https://discord.gg/vapi

## Support

Si vous rencontrez des problèmes avec les intégrations :

1. Vérifiez votre configuration dans le dashboard Vapi
2. Consultez les logs d'appels dans Vapi
3. Testez l'intégration directement dans Vapi
4. Contactez le support Vapi si nécessaire

---

**Note** : Cette approche avec Vapi gère nativement toutes les intégrations. Vous n'avez pas besoin de gérer vous-même l'OAuth, les tokens, ou les webhooks. Vapi s'occupe de tout ! 🎉
