# Configuration Google Calendar

Ce guide explique comment configurer l'intégration Google Calendar pour votre plateforme Agent Builder.

## Prérequis

- Compte Google Cloud Platform
- Backend démarré sur http://localhost:8000
- Frontend démarré sur http://localhost:5173

## Étape 1 : Créer un projet Google Cloud

1. Allez sur https://console.cloud.google.com
2. Cliquez sur "Sélectionner un projet" puis "Nouveau projet"
3. Donnez un nom à votre projet (ex: "Agent Builder")
4. Cliquez sur "Créer"

## Étape 2 : Activer l'API Google Calendar

1. Dans le menu de gauche, allez dans "APIs & Services" > "Library"
2. Recherchez "Google Calendar API"
3. Cliquez sur "Google Calendar API"
4. Cliquez sur "Activer"

## Étape 3 : Configurer l'écran de consentement OAuth

1. Allez dans "APIs & Services" > "OAuth consent screen"
2. Sélectionnez "External" (sauf si vous avez Google Workspace)
3. Cliquez sur "Créer"
4. Remplissez les informations requises :
   - Nom de l'application : Agent Builder
   - Email d'assistance utilisateur : votre email
   - Domaine autorisé : localhost (pour le développement)
5. Cliquez sur "Enregistrer et continuer"
6. Dans "Scopes", cliquez sur "Add or Remove Scopes"
7. Ajoutez les scopes suivants :
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
   - `https://www.googleapis.com/auth/userinfo.email`
8. Cliquez sur "Enregistrer et continuer"
9. Ajoutez votre email comme utilisateur test (pour le développement)
10. Cliquez sur "Enregistrer et continuer"

## Étape 4 : Créer les credentials OAuth 2.0

1. Allez dans "APIs & Services" > "Credentials"
2. Cliquez sur "Create Credentials" > "OAuth client ID"
3. Type d'application : "Web application"
4. Nom : "Agent Builder Web Client"
5. URI de redirection autorisés :
   - Ajoutez : `http://localhost:8000/api/oauth/google-calendar/callback`
6. Cliquez sur "Créer"
7. Copiez le **Client ID** et le **Client Secret** qui s'affichent

## Étape 5 : Configurer le fichier .env

1. Ouvrez le fichier `/home/user/agentBuilderApp/backend/.env`
2. Ajoutez vos credentials Google :

```env
GOOGLE_CLIENT_ID=votre_client_id_ici
GOOGLE_CLIENT_SECRET=votre_client_secret_ici
```

## Étape 6 : Installer les dépendances

```bash
cd /home/user/agentBuilderApp/backend
pip install -r requirements.txt
```

## Étape 7 : Démarrer PostgreSQL

Si vous utilisez Docker :
```bash
docker-compose up -d postgres
```

Ou installez PostgreSQL localement et créez la base de données :
```bash
createdb agent_saas_db
```

## Étape 8 : Exécuter la migration

```bash
cd /home/user/agentBuilderApp/backend
python migrate_add_tools_and_oauth.py
```

## Étape 9 : Démarrer le backend

```bash
cd /home/user/agentBuilderApp/backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Étape 10 : Tester la connexion

1. Ouvrez le frontend sur http://localhost:5173
2. Allez dans "Paramètres"
3. Section "Intégrations"
4. Cliquez sur "Connecter" à côté de Google Calendar
5. Autorisez l'application dans la fenêtre Google OAuth
6. Vous serez redirigé vers la page Paramètres avec un message de succès

## Utilisation

Une fois connecté, vous pouvez :

1. **Créer des outils Google Calendar** dans la page "Outils" :
   - Utiliser le template "Réservation de rendez-vous"
   - Utiliser le template "Vérification de disponibilité"

2. **Configurer les agents Vapi** pour utiliser ces outils :
   - Dans la configuration de l'agent, ajoutez les outils créés
   - Les agents pourront maintenant gérer les rendez-vous par la voix

3. **Webhooks Vapi** :
   - Les endpoints de webhook sont automatiquement disponibles sur :
   - `POST http://localhost:8000/api/webhooks/tools/book-appointment`
   - `POST http://localhost:8000/api/webhooks/tools/check-availability`

## Dépannage

### Erreur "ERR_EMPTY_RESPONSE"
- Vérifiez que le backend est démarré sur le port 8000
- Vérifiez les logs du backend pour voir les erreurs

### Token expiré
- Cliquez sur "Déconnecter" puis "Connecter" à nouveau
- Les tokens sont automatiquement rafraîchis mais peuvent nécessiter une reconnexion

### Base de données non accessible
- Vérifiez que PostgreSQL est démarré
- Vérifiez la connexion dans le fichier .env

### Migration échoue
- Vérifiez que toutes les dépendances sont installées
- Vérifiez que PostgreSQL est accessible
- Les tables sont créées avec `IF NOT EXISTS` donc la migration peut être réexécutée

## Sécurité (Production)

Pour la production, assurez-vous de :

1. Utiliser HTTPS pour tous les endpoints
2. Mettre à jour les URIs de redirection OAuth avec votre domaine
3. Changer le mode OAuth de "Testing" à "Production" dans Google Cloud Console
4. Utiliser des variables d'environnement sécurisées
5. Ne jamais commiter le fichier .env dans Git
