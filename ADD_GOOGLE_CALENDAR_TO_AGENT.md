# Comment ajouter Google Calendar à un agent

Ce guide explique comment ajouter facilement Google Calendar à votre agent **directement depuis notre application**, sans avoir besoin d'aller sur le dashboard Vapi.

## ✅ Prérequis

Avant de commencer :
- ✅ Google Calendar doit être connecté (va sur `/integrations` pour vérifier)
- ✅ Backend doit être démarré (`http://localhost:8000`)
- ✅ Frontend doit être démarré (`http://localhost:8080`)
- ✅ Tu dois avoir au moins un agent créé

## 🚀 Procédure (Super simple !)

### Étape 1 : Ouvrir la page de ton agent

1. Va sur **"Mes Agents"** dans le menu latéral
2. Clique sur un agent existant (ou crée-en un nouveau)
3. Tu arrives sur la page de détails de l'agent

### Étape 2 : Cliquer sur "Add Google Calendar"

Dans la barre d'actions en haut de la page (à côté de "Test Agent"), tu verras un bouton :

```
[📅 Add Google Calendar]
```

Clique dessus !

### Étape 3 : Suivre l'assistant (3 étapes automatiques)

Un modal s'ouvre avec un assistant en 3 étapes :

#### 📋 **Étape 1 : Sélection**
- Coche les outils que tu veux ajouter :
  - ✅ **Créer des événements** - Permet à l'agent de créer des RDV dans Google Calendar
  - ✅ **Vérifier la disponibilité** - Permet à l'agent de vérifier les créneaux disponibles

*Tu peux cocher les deux (recommandé) ou juste un seul.*

Clique sur **"Continuer"**.

#### ⚙️ **Étape 2 : Création**
- L'application crée automatiquement les outils dans Vapi
- Ça prend quelques secondes...
- Clique sur **"Créer les outils"**

#### ✅ **Étape 3 : Attribution**
- Les outils sont créés avec succès !
- Tu vois la liste des outils créés
- Clique sur **"Ajouter à l'agent"**

**C'est tout !** 🎉

L'agent est maintenant configuré avec Google Calendar. Le système a automatiquement :
- ✅ Ajouté les outils à l'agent dans Vapi
- ✅ Mis à jour le message système (system prompt) avec des instructions de planification
- ✅ Configuré l'agent pour utiliser ces outils pendant les appels

## 🧪 Tester l'agent

### Via appel téléphonique

1. Utilise le bouton **"Test Agent"** dans la page de l'agent
2. Lance un appel vocal
3. Dis quelque chose comme :
   - _"Je voudrais prendre un rendez-vous"_
   - _"Peux-tu vérifier ma disponibilité pour demain à 14h ?"_
   - _"Réserve un créneau pour moi le 20 décembre à 10h"_

L'agent va :
1. Te demander les informations nécessaires (nom, date, heure)
2. Vérifier la disponibilité dans ton Google Calendar
3. Créer l'événement si le créneau est libre
4. Te confirmer avec un lien vers l'événement

### Vérifier dans Google Calendar

1. Va sur **https://calendar.google.com**
2. Vérifie que les événements créés par l'agent apparaissent bien
3. Les événements auront le format : **"RDV - [Nom du client]"**

## 📊 Ce qui se passe en arrière-plan

Quand tu utilises l'assistant, voici ce qui se passe techniquement :

1. **Création des outils dans Vapi** :
   ```json
   {
     "type": "google.calendar.event.create",
     "name": "scheduleAppointment",
     "description": "Use this tool to schedule appointments..."
   }
   ```

2. **Ajout à l'agent** :
   ```json
   {
     "model": {
       "tools": [
         { "toolId": "abc123..." }
       ]
     }
   }
   ```

3. **Mise à jour du system prompt** :
   L'agent reçoit des instructions comme :
   ```
   "When users want to schedule an appointment, first check their
   availability using the Check Availability tool, then use the
   Create Event tool to schedule the event if they're available."
   ```

## 🔍 Vérifier les outils ajoutés

Si tu veux voir quels outils sont actuellement sur ton agent :

1. Va sur la page de l'agent
2. Ouvre l'onglet **"Settings"** ou **"Setup"**
3. Tu devrais voir les outils Google Calendar listés

Ou via API :
```bash
curl http://localhost:8000/api/agent-tools/agents/TON_AGENT_ID/tools
```

## ❌ Retirer Google Calendar

Si tu veux retirer les outils Google Calendar d'un agent :

Via API :
```bash
curl -X DELETE http://localhost:8000/api/agent-tools/agents/TON_AGENT_ID/tools/TOOL_ID
```

*(Note : Une interface de gestion sera bientôt ajoutée pour faire ça depuis l'app)*

## 🐛 Dépannage

### "Google Calendar not connected"
➡️ Va sur `/integrations` et connecte d'abord Google Calendar

### "Failed to create Google Calendar tools"
➡️ Vérifie que :
- Le backend est bien démarré
- Tu as une clé API Vapi valide dans `.env`
- Google Calendar est bien connecté

### "Failed to add tools to agent"
➡️ Vérifie que :
- L'agent existe bien
- L'agent a un `vapi_assistant_id` (synced avec Vapi)
- Le backend peut accéder à l'API Vapi

### Les outils ne fonctionnent pas dans les appels
➡️ Vérifie que :
- Google Calendar est **connecté** dans `/integrations`
- Les credentials OAuth ne sont pas expirés
- L'agent utilise bien les bons tool IDs

## 💡 Conseils

- **Recommandé** : Ajoute les deux outils (création + disponibilité) pour une meilleure expérience utilisateur
- **Performance** : L'agent vérifiera toujours la disponibilité avant de créer un événement
- **Personnalisation** : Tu peux modifier le system prompt dans les settings de l'agent si besoin
- **Multiple agents** : Tu peux ajouter Google Calendar à plusieurs agents différents

## 📝 Notes techniques

### Endpoints créés

| Endpoint | Method | Description |
|----------|---------|-------------|
| `/api/agent-tools/vapi/tools` | GET | Liste tous les outils Vapi |
| `/api/agent-tools/vapi/tools/google-calendar` | POST | Crée les outils Google Calendar |
| `/api/agent-tools/agents/{id}/tools` | POST | Ajoute des outils à un agent |
| `/api/agent-tools/agents/{id}/tools` | GET | Liste les outils d'un agent |
| `/api/agent-tools/agents/{id}/tools/{toolId}` | DELETE | Retire un outil d'un agent |

### Composants créés

- **`GoogleCalendarToolModal.tsx`** - Modal wizard en 3 étapes
- **`agent_tools.py`** - Backend API endpoints
- Intégration dans **`AgentDetails.tsx`**

---

## 🎉 C'est terminé !

Ton agent peut maintenant gérer des rendez-vous automatiquement via Google Calendar ! 🚀

Pour toute question, consulte aussi :
- `GOOGLE_OAUTH_SETUP.md` - Configuration OAuth Google
- `GOOGLE_CALENDAR_AGENT_GUIDE.md` - Guide complet avec webhooks personnalisés
