# Configuration Google OAuth pour Google Calendar

Ce guide vous explique comment configurer l'authentification OAuth 2.0 avec Google Calendar pour permettre à vos agents d'accéder aux calendriers de vos utilisateurs.

## Prérequis

- Un compte Google (Gmail, Google Workspace, etc.)
- Accès à Google Cloud Console
- Environ 10-15 minutes

## Étape 1 : Créer un projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Connectez-vous avec votre compte Google
3. En haut de la page, cliquez sur **"Sélectionner un projet"** puis **"Nouveau projet"**
4. Donnez un nom à votre projet, par exemple : `Agent Builder OAuth`
5. Cliquez sur **"Créer"**
6. Attendez quelques secondes que le projet soit créé
7. Sélectionnez le nouveau projet dans la liste déroulante

## Étape 2 : Activer l'API Google Calendar

1. Dans le menu de gauche, allez dans **"APIs & Services"** → **"Library"** (Bibliothèque)
2. Dans la barre de recherche, tapez : `Google Calendar API`
3. Cliquez sur **"Google Calendar API"** dans les résultats
4. Cliquez sur le bouton bleu **"Activer"** (Enable)
5. Attendez quelques secondes que l'API soit activée

## Étape 3 : Configurer l'écran de consentement OAuth

1. Dans le menu de gauche, allez dans **"APIs & Services"** → **"OAuth consent screen"**
2. Sélectionnez **"External"** (Externe) comme type d'utilisateur
3. Cliquez sur **"Créer"** (Create)

### Configuration de l'écran de consentement :

**Page 1 - Informations sur l'application :**
- **App name** : `Agent Builder` (ou le nom de votre application)
- **User support email** : Votre adresse email
- **App logo** : (optionnel)
- **Application home page** : `http://localhost:5173` (pour le développement)
- **Application privacy policy** : (optionnel pour le développement)
- **Application terms of service** : (optionnel pour le développement)
- **Authorized domains** : (laissez vide pour le développement local)
- **Developer contact information** : Votre adresse email

Cliquez sur **"Save and Continue"**

**Page 2 - Scopes (Portées) :**
1. Cliquez sur **"Add or Remove Scopes"**
2. Dans la liste, recherchez et sélectionnez :
   - `https://www.googleapis.com/auth/calendar` - Voir, modifier, partager et supprimer définitivement tous les agendas
   - `https://www.googleapis.com/auth/calendar.events` - Afficher et modifier des événements dans tous vos agendas
   - `https://www.googleapis.com/auth/userinfo.email` - Voir votre adresse email
   - `openid` - Authentifier en utilisant OpenID Connect

   **Note** : Si vous ne voyez pas ces scopes dans la liste, vous pouvez les ajouter manuellement en les copiant-collant dans "Manually add scopes"

3. Cliquez sur **"Update"**
4. Cliquez sur **"Save and Continue"**

**Page 3 - Test users :**
1. Cliquez sur **"Add Users"**
2. Ajoutez votre adresse email (celle que vous utiliserez pour tester)
3. Cliquez sur **"Add"**
4. Cliquez sur **"Save and Continue"**

**Page 4 - Summary :**
- Vérifiez que tout est correct
- Cliquez sur **"Back to Dashboard"**

## Étape 4 : Créer les identifiants OAuth 2.0

1. Dans le menu de gauche, allez dans **"APIs & Services"** → **"Credentials"**
2. Cliquez sur **"+ Create Credentials"** en haut de la page
3. Sélectionnez **"OAuth client ID"**

### Configuration du client OAuth :

- **Application type** : `Web application`
- **Name** : `Agent Builder Web Client` (ou un autre nom descriptif)

**Authorized JavaScript origins :**
- Cliquez sur **"+ Add URI"**
- Ajoutez : `http://localhost:5173` (frontend)
- Cliquez sur **"+ Add URI"**
- Ajoutez : `http://localhost:8000` (backend)

**Authorized redirect URIs :**
- Cliquez sur **"+ Add URI"**
- Ajoutez : `http://localhost:8000/api/oauth/google-calendar/callback`
- Cliquez sur **"+ Add URI"** (optionnel, pour Google Sheets)
- Ajoutez : `http://localhost:8000/api/oauth/google-sheets/callback`

Cliquez sur **"Create"**

## Étape 5 : Récupérer les identifiants

Une fenêtre pop-up s'affiche avec vos identifiants :

- **Client ID** : `123456789-abcdefghijklmnop.apps.googleusercontent.com`
- **Client Secret** : `GOCSPX-abc123def456ghi789`

⚠️ **IMPORTANT** : Conservez ces informations en lieu sûr ! Vous en aurez besoin à l'étape suivante.

Vous pouvez aussi télécharger le fichier JSON en cliquant sur **"Download JSON"** (optionnel).

## Étape 6 : Configurer les variables d'environnement

1. Ouvrez le fichier `backend/.env` dans votre éditeur de code
2. Trouvez les lignes suivantes :

```env
# Google OAuth (for Calendar integration)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

3. Remplacez-les par vos identifiants :

```env
# Google OAuth (for Calendar integration)
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456ghi789
```

4. Vérifiez aussi que ces lignes sont présentes :

```env
API_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

5. Sauvegardez le fichier `.env`

## Étape 7 : Redémarrer le backend

Le backend doit être redémarré pour prendre en compte les nouvelles variables d'environnement :

```bash
# Si le backend est en cours d'exécution, arrêtez-le (Ctrl+C)
# Puis redémarrez-le :
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Étape 8 : Tester l'intégration

1. Ouvrez votre application dans le navigateur : `http://localhost:5173`
2. Allez dans **Intégrations** via le menu latéral
3. Trouvez **Google Calendar** dans la section "Tool Providers"
4. Cliquez sur le bouton **"Connecter"**
5. Dans le modal qui s'ouvre, cliquez sur **"Autoriser l'accès"**
6. Vous serez redirigé vers Google pour autoriser l'accès
7. Connectez-vous avec votre compte Google (celui ajouté en test user)
8. Acceptez les permissions demandées
9. Vous serez redirigé vers votre application
10. Google Calendar devrait maintenant apparaître comme **"Connecté"** avec une coche verte ✓

## Troubleshooting (Dépannage)

### Erreur : "Access blocked: This app's request is invalid"

**Cause** : Les URI de redirection ne sont pas correctement configurées.

**Solution** :
1. Retournez dans Google Cloud Console → Credentials
2. Éditez votre OAuth client ID
3. Vérifiez que les URIs de redirection sont exactement :
   - `http://localhost:8000/api/oauth/google-calendar/callback`
4. Sauvegardez et réessayez

### Erreur : "The app is not verified"

**Cause** : C'est normal en mode développement avec un écran de consentement en mode "Testing".

**Solution** :
1. Cliquez sur **"Advanced"** (Paramètres avancés)
2. Cliquez sur **"Go to [Your App Name] (unsafe)"**
3. Autorisez l'accès

### Erreur : "redirect_uri_mismatch"

**Cause** : L'URI de redirection dans la requête ne correspond pas à celles configurées dans Google Cloud Console.

**Solution** :
1. Vérifiez que l'URL dans `.env` est correcte :
   ```env
   API_URL=http://localhost:8000
   ```
2. Vérifiez que l'URI de redirection dans Google Cloud Console est :
   ```
   http://localhost:8000/api/oauth/google-calendar/callback
   ```
3. Redémarrez le backend après modification du `.env`

### Les credentials ne fonctionnent pas

**Solution** :
1. Vérifiez que vous avez bien sauvegardé le fichier `.env`
2. Vérifiez qu'il n'y a pas d'espaces avant ou après les valeurs dans `.env`
3. Redémarrez le backend
4. Vérifiez les logs du backend pour voir les erreurs détaillées

## Étape 9 : Configuration pour Google Sheets (optionnel)

Si vous souhaitez également activer Google Sheets :

1. Dans Google Cloud Console → APIs & Services → Library
2. Recherchez **"Google Sheets API"**
3. Cliquez sur **"Enable"**
4. Les credentials OAuth sont les mêmes pour Calendar et Sheets
5. L'URI de redirection pour Sheets (`http://localhost:8000/api/oauth/google-sheets/callback`) devrait déjà être configurée

## Production

⚠️ **Pour déployer en production**, vous devrez :

1. **Changer les URLs** dans `.env` :
   ```env
   API_URL=https://votre-domaine-backend.com
   FRONTEND_URL=https://votre-domaine-frontend.com
   ```

2. **Mettre à jour les Authorized URIs** dans Google Cloud Console :
   - JavaScript origins : `https://votre-domaine-frontend.com`
   - Redirect URIs : `https://votre-domaine-backend.com/api/oauth/google-calendar/callback`

3. **Publier l'application OAuth** :
   - Dans OAuth consent screen, cliquez sur **"Publish App"**
   - Attendez la vérification de Google (peut prendre plusieurs jours)
   - Ou restez en mode "Testing" avec un maximum de 100 test users

4. **Sécuriser les credentials** :
   - Ne JAMAIS committer le fichier `.env` dans Git
   - Utiliser des variables d'environnement sécurisées (Vercel, Railway, etc.)
   - Considérer l'utilisation d'un service de gestion de secrets (AWS Secrets Manager, etc.)

## Ressources

- [Documentation Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Google Calendar API](https://developers.google.com/calendar/api/guides/overview)
- [Google Sheets API](https://developers.google.com/sheets/api/guides/concepts)
- [OAuth 2.0 Scopes](https://developers.google.com/identity/protocols/oauth2/scopes)

---

✅ **Félicitations !** Votre intégration Google Calendar est maintenant configurée et prête à être utilisée par vos agents vocaux !
