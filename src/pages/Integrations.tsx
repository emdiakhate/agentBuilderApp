import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, ChevronUp, ExternalLink, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Integration {
  id: string;
  name: string;
  description: string;
  logo?: string;
  badge?: string;
  requiresAuth?: boolean;
  authUrl?: string;
  docsUrl?: string;
}

interface IntegrationCategory {
  id: string;
  title: string;
  integrations: Integration[];
  defaultExpanded?: boolean;
}

const Integrations = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["tool-providers"])
  );
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [connectedServices, setConnectedServices] = useState<Set<string>>(new Set());

  const categories: IntegrationCategory[] = [
    {
      id: "voice-providers",
      title: "Voice Providers",
      integrations: [
        {
          id: "elevenlabs",
          name: "ElevenLabs",
          description: "AI voice cloning and generation with realistic voices in multiple languages",
          logo: "https://cdn.simpleicons.org/elevenlabs",
          docsUrl: "https://docs.vapi.ai/providers/voice/elevenlabs"
        },
        {
          id: "cartesia",
          name: "Cartesia",
          description: "Lightning-fast text-to-speech with ultra-realistic voice generation",
          logo: "https://assets.vapi.ai/providers/cartesia.png",
          docsUrl: "https://docs.vapi.ai/providers/voice/cartesia"
        },
        {
          id: "deepgram",
          name: "Deepgram",
          description: "Fast, local realtime recognition with best accuracy and reliability",
          logo: "https://cdn.simpleicons.org/deepgram",
          docsUrl: "https://docs.vapi.ai/providers/voice/deepgram"
        },
        {
          id: "lmnt",
          name: "LMNT",
          description: "Low-latency, emotionally expressive speech for conversational AI",
          logo: "https://assets.vapi.ai/providers/lmnt.png",
          docsUrl: "https://docs.vapi.ai/providers/voice/lmnt"
        },
        {
          id: "playht",
          name: "PlayHT",
          description: "Ultra-realistic AI voice generation with emotion and intonation support",
          logo: "https://cdn.simpleicons.org/playht",
          docsUrl: "https://docs.vapi.ai/providers/voice/playht"
        },
        {
          id: "rime",
          name: "Rime",
          description: "Premium voice cloning and model voice capabilities",
          logo: "https://assets.vapi.ai/providers/rime.png",
          docsUrl: "https://docs.vapi.ai/providers/voice/rime"
        }
      ]
    },
    {
      id: "model-providers",
      title: "Model Providers",
      integrations: [
        {
          id: "openai",
          name: "OpenAI",
          description: "Industry leading LLM with unmatched flexibility",
          logo: "https://cdn.simpleicons.org/openai",
          docsUrl: "https://docs.vapi.ai/providers/llm/openai"
        },
        {
          id: "anthropic",
          name: "Anthropic",
          description: "AI models for research and problem-solving capabilities",
          logo: "https://cdn.simpleicons.org/anthropic",
          docsUrl: "https://docs.vapi.ai/providers/llm/anthropic"
        },
        {
          id: "groq",
          name: "Groq",
          description: "Fast inference optimized with near-zero latency for AI acceleration",
          logo: "https://cdn.simpleicons.org/groq",
          docsUrl: "https://docs.vapi.ai/providers/llm/groq"
        },
        {
          id: "azure-openai",
          name: "Azure OpenAI",
          description: "Microsoft's managed platform offering OpenAI models on their Azure infrastructure",
          logo: "https://cdn.simpleicons.org/microsoftazure",
          badge: "Ask AI",
          docsUrl: "https://docs.vapi.ai/providers/llm/azure"
        },
        {
          id: "perplexity",
          name: "Perplexity AI",
          description: "AI-powered chat and search engine designed for real-time information gathering",
          logo: "https://assets.vapi.ai/providers/perplexity.png",
          docsUrl: "https://docs.vapi.ai/providers/llm/perplexity"
        },
        {
          id: "together",
          name: "Together AI",
          description: "Unified-access based AI hub for low-cost serving",
          logo: "https://assets.vapi.ai/providers/together.png",
          docsUrl: "https://docs.vapi.ai/providers/llm/together"
        },
        {
          id: "anyscale",
          name: "Anyscale",
          description: "Production platform for scalable open-source AI models like Llama",
          logo: "https://assets.vapi.ai/providers/anyscale.png",
          docsUrl: "https://docs.vapi.ai/providers/llm/anyscale"
        },
        {
          id: "openrouter",
          name: "OpenRouter",
          description: "Unified API for community-curated LLM model collection",
          logo: "https://assets.vapi.ai/providers/openrouter.png",
          docsUrl: "https://docs.vapi.ai/providers/llm/openrouter"
        },
        {
          id: "deepinfra",
          name: "DeepInfra",
          description: "Cheapest managed inference for cutting edge AI/LLM models",
          logo: "https://assets.vapi.ai/providers/deepinfra.png",
          docsUrl: "https://docs.vapi.ai/providers/llm/deepinfra"
        }
      ]
    },
    {
      id: "tool-providers",
      title: "Tool Providers",
      defaultExpanded: true,
      integrations: [
        {
          id: "make",
          name: "Make",
          description: "Automate workflows with Make.com integration platform",
          logo: "https://cdn.simpleicons.org/make",
          requiresAuth: true,
          docsUrl: "https://docs.vapi.ai/tools/make"
        },
        {
          id: "gohighlevel",
          name: "GoHighLevel",
          description: "CRM and marketing automation platform with all-in-one tools for business",
          logo: "https://assets.vapi.ai/providers/gohighlevel.png",
          requiresAuth: true,
          docsUrl: "https://docs.vapi.ai/tools/gohighlevel"
        },
        {
          id: "google-calendar",
          name: "Google Calendar",
          description: "Manage calendar events and schedules effortlessly",
          logo: "https://cdn.simpleicons.org/googlecalendar",
          badge: "Popular",
          requiresAuth: true,
          authUrl: "https://dashboard.vapi.ai/integrations/google-calendar",
          docsUrl: "https://docs.vapi.ai/tools/google-calendar"
        },
        {
          id: "google-sheets",
          name: "Google Sheets",
          description: "Add data to specific tab in Google Sheets spreadsheets",
          logo: "https://cdn.simpleicons.org/googlesheets",
          requiresAuth: true,
          authUrl: "https://dashboard.vapi.ai/integrations/google-sheets",
          docsUrl: "https://docs.vapi.ai/tools/google-sheets"
        }
      ]
    },
    {
      id: "cloud-providers",
      title: "Cloud Providers",
      integrations: [
        {
          id: "aws-s3",
          name: "AWS S3",
          description: "Scalable cloud storage for recordings with S3",
          logo: "https://cdn.simpleicons.org/amazons3",
          docsUrl: "https://docs.vapi.ai/storage/aws-s3"
        },
        {
          id: "azure-storage",
          name: "Azure Blob Storage",
          description: "Enterprise cloud storage service for recordings with global reach",
          logo: "https://cdn.simpleicons.org/microsoftazure",
          docsUrl: "https://docs.vapi.ai/storage/azure"
        },
        {
          id: "gcp-storage",
          name: "Google Cloud Storage",
          description: "Flexible cloud storage with low latency for recording archival",
          logo: "https://cdn.simpleicons.org/googlecloud",
          docsUrl: "https://docs.vapi.ai/storage/gcp"
        }
      ]
    }
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handleIntegrationClick = (integration: Integration) => {
    setSelectedIntegration(integration);
  };

  const handleConnect = () => {
    if (selectedIntegration) {
      if (selectedIntegration.authUrl) {
        // Ouvrir l'URL d'authentification dans un nouvel onglet
        window.open(selectedIntegration.authUrl, '_blank');
        // Simuler la connexion (dans un vrai cas, cela serait géré par le callback OAuth)
        setConnectedServices(prev => new Set([...prev, selectedIntegration.id]));
      }
      setSelectedIntegration(null);
    }
  };

  const filteredCategories = categories.map((category) => ({
    ...category,
    integrations: category.integrations.filter(
      (integration) =>
        integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        integration.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.integrations.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Intégrations</h1>
        <p className="text-muted-foreground mt-1">
          Connectez vos outils et services favoris avec Vapi
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search integrations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Integration Categories */}
      <div className="space-y-4">
        {filteredCategories.map((category) => {
          const isExpanded = expandedSections.has(category.id);

          return (
            <Card key={category.id}>
              <CardHeader
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => toggleSection(category.id)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.integrations.map((integration) => {
                      const isConnected = connectedServices.has(integration.id);

                      return (
                        <div
                          key={integration.id}
                          className="border rounded-lg p-4 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group relative"
                          onClick={() => handleIntegrationClick(integration)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {integration.logo && (
                                <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 border flex items-center justify-center p-1.5">
                                  <img
                                    src={integration.logo}
                                    alt={integration.name}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      // Fallback si l'image ne charge pas
                                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(integration.name)}&background=random`;
                                    }}
                                  />
                                </div>
                              )}
                              <h3 className="font-semibold">{integration.name}</h3>
                            </div>
                            {integration.badge && (
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                                {integration.badge}
                              </span>
                            )}
                            {isConnected && (
                              <div className="absolute top-2 right-2">
                                <div className="bg-green-500 rounded-full p-1">
                                  <Check className="h-3 w-3 text-white" />
                                </div>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {integration.description}
                          </p>
                          <div className="flex gap-2 mt-auto">
                            <Button
                              size="sm"
                              variant={isConnected ? "outline" : "default"}
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleIntegrationClick(integration);
                              }}
                            >
                              {isConnected ? "Connecté" : "Connecter"}
                            </Button>
                            {integration.docsUrl && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(integration.docsUrl, '_blank');
                                }}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Aucune intégration ne correspond à votre recherche
          </p>
        </div>
      )}

      {/* Connection Modal */}
      <Dialog open={selectedIntegration !== null} onOpenChange={(open) => !open && setSelectedIntegration(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              {selectedIntegration?.logo && (
                <div className="w-12 h-12 rounded-lg bg-white dark:bg-gray-800 border flex items-center justify-center p-2">
                  <img
                    src={selectedIntegration.logo}
                    alt={selectedIntegration.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <DialogTitle>Connecter {selectedIntegration?.name}</DialogTitle>
            </div>
            <DialogDescription>
              {selectedIntegration?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {selectedIntegration?.requiresAuth ? (
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-100">
                    Authentification requise
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Vous serez redirigé vers le dashboard Vapi pour autoriser l'accès à {selectedIntegration.name}.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Ce que vous pourrez faire :</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    {selectedIntegration.id === 'google-calendar' && (
                      <>
                        <li>Créer des événements automatiquement</li>
                        <li>Vérifier les disponibilités</li>
                        <li>Gérer les rendez-vous par la voix</li>
                      </>
                    )}
                    {selectedIntegration.id === 'google-sheets' && (
                      <>
                        <li>Ajouter des données dans vos feuilles</li>
                        <li>Enregistrer les appels et interactions</li>
                        <li>Synchroniser automatiquement</li>
                      </>
                    )}
                    {selectedIntegration.id === 'make' && (
                      <>
                        <li>Créer des workflows automatisés</li>
                        <li>Connecter plusieurs services</li>
                        <li>Déclencher des actions personnalisées</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Cette intégration nécessite une configuration via le dashboard Vapi.
                </p>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2">Étapes de configuration :</h4>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Accédez au dashboard Vapi</li>
                    <li>Allez dans la section Intégrations</li>
                    <li>Configurez vos paramètres API</li>
                    <li>Utilisez l'intégration dans vos agents</li>
                  </ol>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setSelectedIntegration(null)}>
              Annuler
            </Button>
            {selectedIntegration?.docsUrl && (
              <Button
                variant="ghost"
                onClick={() => {
                  window.open(selectedIntegration.docsUrl, '_blank');
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Documentation
              </Button>
            )}
            <Button onClick={handleConnect}>
              {selectedIntegration?.requiresAuth ? "Connecter" : "Ouvrir Dashboard"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Integrations;
