# Guide : Ajouter Google Calendar à un Agent

Ce guide t'explique comment configurer un agent Vapi pour qu'il puisse créer des rendez-vous dans Google Calendar.

## ✅ Prérequis

Avant de commencer, assure-toi que :
- ✅ Google Calendar est connecté (visible dans `/integrations`)
- ✅ Le backend est démarré sur `http://localhost:8000`
- ✅ Tu as un agent existant ou tu vas en créer un nouveau

## 🎯 Méthode 1 : Via l'API Vapi directement (pour tester rapidement)

### Étape 1 : Créer le tool Google Calendar dans Vapi

Ouvre un terminal et exécute cette commande (remplace `YOUR_VAPI_API_KEY` par ta clé API Vapi) :

```bash
curl -X POST https://api.vapi.ai/tool \
  -H "Authorization: Bearer YOUR_VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "function",
    "async": false,
    "function": {
      "name": "book_appointment",
      "description": "Créer un rendez-vous dans Google Calendar. Utiliser cette fonction quand le client souhaite prendre un rendez-vous. Demander toujours le nom complet, la date et l'heure avant d'appeler cette fonction.",
      "parameters": {
        "type": "object",
        "properties": {
          "client_name": {
            "type": "string",
            "description": "Nom complet du client"
          },
          "date": {
            "type": "string",
            "description": "Date du rendez-vous au format YYYY-MM-DD (exemple: 2024-12-25)"
          },
          "time": {
            "type": "string",
            "description": "Heure du rendez-vous au format HH:MM (exemple: 14:30)"
          },
          "duration": {
            "type": "integer",
            "description": "Durée du rendez-vous en minutes (par défaut: 60)",
            "default": 60
          },
          "service_type": {
            "type": "string",
            "description": "Type de service ou consultation (optionnel)"
          },
          "notes": {
            "type": "string",
            "description": "Notes supplémentaires (optionnel)"
          }
        },
        "required": ["client_name", "date", "time"]
      }
    },
    "server": {
      "url": "http://localhost:8000/api/tool-webhooks/google-calendar/create-event"
    }
  }'
```

**⚠️ Important** : Si ton backend est déployé en ligne (pas localhost), remplace `http://localhost:8000` par ton URL de production (exemple: `https://ton-domaine.com`).

Tu recevras une réponse JSON avec un `id` comme ceci :
```json
{
  "id": "abc123-tool-id",
  "type": "function",
  ...
}
```

**✏️ Note cet ID** : `abc123-tool-id` (tu en auras besoin à l'étape suivante)

### Étape 2 : Ajouter le tool à ton agent

Maintenant que le tool est créé dans Vapi, tu dois l'ajouter à ton agent.

#### Option A : Via le Dashboard Vapi

1. Va sur [https://dashboard.vapi.ai](https://dashboard.vapi.ai)
2. Clique sur ton agent (ou crée-en un nouveau)
3. Dans la section **"Tools"**, clique sur **"Add Tool"**
4. Sélectionne le tool **"book_appointment"** que tu viens de créer
5. Sauvegarde l'agent

#### Option B : Via l'API Vapi

Exécute cette commande (remplace `YOUR_VAPI_API_KEY`, `AGENT_ID` et `TOOL_ID`) :

```bash
curl -X PATCH https://api.vapi.ai/assistant/AGENT_ID \
  -H "Authorization: Bearer YOUR_VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": {
      "tools": [
        {
          "type": "function",
          "function": {
            "toolId": "TOOL_ID"
          }
        }
      ]
    }
  }'
```

## 🎯 Méthode 2 : Via Python Script (recommandé)

Créons un script Python pour automatiser tout ça :

```bash
cd backend
python
```

Puis dans le REPL Python :

```python
import asyncio
from app.services.vapi_service import vapi_service
from app.core.config import settings

async def setup_google_calendar_tool():
    # Créer le tool Google Calendar
    tool = await vapi_service.create_google_calendar_tool(
        server_base_url=settings.API_URL  # http://localhost:8000
    )

    tool_id = tool['id']
    print(f"✅ Google Calendar tool créé avec succès!")
    print(f"📝 Tool ID: {tool_id}")
    print()
    print("Maintenant, ajoute ce tool ID à ton agent dans Vapi Dashboard:")
    print(f"https://dashboard.vapi.ai")
    print()
    print("Ou utilise cette commande pour l'ajouter via l'API:")
    print(f"""
curl -X PATCH https://api.vapi.ai/assistant/TON_AGENT_ID \\
  -H "Authorization: Bearer {settings.VAPI_API_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{{
    "model": {{
      "tools": [
        {{
          "type": "function",
          "function": {{
            "toolId": "{tool_id}"
          }}
        }}
      ]
    }}
  }}'
    """)

    return tool

# Exécuter
asyncio.run(setup_google_calendar_tool())
```

## 🧪 Tester l'agent

Une fois que le tool est ajouté à ton agent :

### Test 1 : Via le téléphone (Vapi Call)

1. Utilise le numéro de téléphone Vapi de ton agent
2. Appelle le numéro
3. Dis quelque chose comme :
   - _"Bonjour, je voudrais prendre un rendez-vous"_
   - _"Je m'appelle Jean Dupont"_
   - _"Le 25 décembre à 14h30"_

4. L'agent devrait :
   - Te demander ton nom complet
   - Te demander la date
   - Te demander l'heure
   - Créer le rendez-vous dans Google Calendar
   - Te confirmer avec un lien vers l'événement

### Test 2 : Via l'interface web (Vapi Dashboard)

1. Va sur [https://dashboard.vapi.ai](https://dashboard.vapi.ai)
2. Trouve ton agent
3. Clique sur **"Test in Browser"**
4. Lance une conversation et demande un rendez-vous
5. Vérifie que l'événement apparaît dans ton Google Calendar

## 🔍 Débogage

### Les logs du backend

Si le tool ne fonctionne pas, vérifie les logs du backend :

```bash
# Dans le terminal où tourne le backend
# Tu devrais voir quelque chose comme :
INFO:     172.18.0.1:53200 - "POST /api/tool-webhooks/google-calendar/create-event HTTP/1.1" 200 OK
```

### Vérifier la connexion Google Calendar

```bash
curl http://localhost:8000/api/oauth/google-calendar/status
```

Tu devrais voir `"connected": true`

### Tester le webhook manuellement

```bash
curl -X POST http://localhost:8000/api/tool-webhooks/google-calendar/create-event \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "functionCall": {
        "parameters": {
          "client_name": "Test User",
          "date": "2024-12-25",
          "time": "14:30",
          "duration": 60
        }
      }
    }
  }'
```

Tu devrais recevoir :
```json
{
  "result": "✅ Rendez-vous créé avec succès pour Test User le 2024-12-25 à 14:30. Lien: https://calendar.google.com/..."
}
```

## 📝 Notes importantes

### Pour la production (déploiement en ligne)

1. **Remplace `localhost` par ton domaine** :
   - Dans `backend/.env`, change `API_URL=http://localhost:8000` vers `API_URL=https://ton-domaine.com`
   - Recrée le tool avec la bonne URL

2. **Assure-toi que Vapi peut accéder à ton serveur** :
   - Ton backend doit être accessible publiquement
   - Le endpoint `/api/tool-webhooks/google-calendar/create-event` doit accepter les requêtes POST de Vapi

3. **Sécurité** :
   - En production, tu peux ajouter une vérification de signature pour t'assurer que les requêtes viennent vraiment de Vapi
   - Vérifier le user_id dans les requêtes si tu as plusieurs utilisateurs

## 🎉 C'est tout !

Ton agent peut maintenant créer des rendez-vous dans Google Calendar automatiquement pendant les appels vocaux ! 🚀
