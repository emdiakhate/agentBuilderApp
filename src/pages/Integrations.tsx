import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon?: string;
  badge?: string;
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

  const categories: IntegrationCategory[] = [
    {
      id: "voice-providers",
      title: "Voice Providers",
      integrations: [
        { id: "elevenlabs", name: "ElevenLabs", description: "AI voice cloning and generation with realistic voices in multiple languages" },
        { id: "cartesia", name: "Cartesia", description: "Lightning-fast text-to-speech with ultra-realistic voice generation" },
        { id: "deepgram", name: "Deepgram", description: "Fast, local realtime recognition with best accuracy and reliability" },
        { id: "lmnt", name: "LMNT", description: "Low-latency, emotionally expressive speech for conversational AI" },
        { id: "neets", name: "Neets", description: "High-quality text-to-speech with natural-sounding voices for expressive speech" },
        { id: "playht", name: "PlayHT", description: "Ultra-realistic AI voice generation with emotion and intonation support" },
        { id: "rime", name: "Rime", description: "Premium voice cloning and model voice capabilities" }
      ]
    },
    {
      id: "model-providers",
      title: "Model Providers",
      integrations: [
        { id: "openai", name: "OpenAI", description: "Industry leading LLM with unmatched flexibility" },
        { id: "anthropic", name: "Anthropic", description: "AI models for research and problem-solving capabilities" },
        { id: "groq", name: "Groq", description: "Fast inference optimized with near-zero latency for AI acceleration" },
        { id: "azure-openai", name: "Azure OpenAI", description: "Microsoft's managed platform offering OpenAI models on their Azure infrastructure", badge: "Ask AI" },
        { id: "perplexity", name: "Perplexity AI", description: "AI-powered chat and search engine designed for real-time information gathering" },
        { id: "together", name: "Together AI", description: "Unified-access based AI hub for low-cost serving" },
        { id: "anyscale", name: "Anyscale", description: "Production platform for scalable open-source AI models like Llama" },
        { id: "openrouter", name: "OpenRouter", description: "Unified API for community-curated LLM model collection" },
        { id: "deepinfra", name: "DeepInfra", description: "Cheapest managed inference for cutting edge AI/LLM models" },
        { id: "custom-llm", name: "Custom LLM", description: "Connect your own custom language model endpoints" }
      ]
    },
    {
      id: "transcriber-providers",
      title: "Transcriber Providers",
      integrations: [
        { id: "deepgram-transcriber", name: "Deepgram", description: "Fast, local realtime recognition with the lowest out-of-turn latency" },
        { id: "assemblyai", name: "AssemblyAI", description: "Speech recognition and AI models for transcriber data when analysis" },
        { id: "elevenlabs-transcriber", name: "ElevenLabs", description: "Fast, accurate transcription for real-time low-latency capabilities" },
        { id: "gladia", name: "Gladia", description: "Get-it done AI with API for speech recognition" }
      ]
    },
    {
      id: "tool-providers",
      title: "Tool Providers",
      defaultExpanded: true,
      integrations: [
        { id: "make", name: "Make", description: "Automate workflows with Make.com integration platform" },
        { id: "gohighlevel", name: "GoHighLevel", description: "CRM and marketing automation platform with all-in-one tools for business" },
        { id: "smallai", name: "SmallsAI", description: "Create custom voice agents that integrate with your existing workflows" },
        { id: "google-calendar", name: "Google Calendar", description: "Manage calendar events and schedules effortlessly", badge: "🎉" },
        { id: "google-sheets", name: "Google Sheets", description: "Add data to specific tab in Google Sheets spreadsheets" },
        { id: "gohighlevel-mcp", name: "GoHighLevel MCP", description: "Advanced GoHighLevel integration with MCP protocol" }
      ]
    },
    {
      id: "vector-store-providers",
      title: "Vector Store Providers",
      integrations: [
        { id: "telnyx", name: "Telnyx (Deprecated)", description: "Voice AI-ready and efficient platform for building integrations" }
      ]
    },
    {
      id: "phone-providers",
      title: "Phone Number Providers",
      integrations: [
        { id: "sip-trunk", name: "SIP Trunk", description: "Connect with carrier for carrier-tel number or SIP infrastructure" },
        { id: "dialys", name: "Dialys", description: "Enterprise telephony with phone, numbers and infrastructure" },
        { id: "vonage", name: "Vonage", description: "Programmable services and communication APIs" }
      ]
    },
    {
      id: "cloud-providers",
      title: "Cloud Providers",
      integrations: [
        { id: "aws-s3", name: "AWS S3", description: "Scalable cloud storage for recordings with S3" },
        { id: "azure-storage", name: "Azure Blob Storage", description: "Enterprise cloud storage service for recordings with global reach" },
        { id: "gcp-storage", name: "Google Cloud Storage", description: "Flexible cloud storage with low latency for recording archival" },
        { id: "cloudflare-r2", name: "Cloudflare R2", description: "Zero egress cloud storage with affordable alternative-cost models" },
        { id: "supabase", name: "Supabase", description: "Open-source cloud storage with ease for transcriptions" }
      ]
    },
    {
      id: "observability-providers",
      title: "Observability Providers",
      integrations: [
        { id: "langfuse", name: "Langfuse", description: "LLM observability, logging, and analytics tools" }
      ]
    },
    {
      id: "server-config",
      title: "Server Configuration",
      integrations: [
        { id: "server-config", name: "Server Configuration", description: "Configure server credentials, capabilities, and authentication" }
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
                    {category.integrations.map((integration) => (
                      <div
                        key={integration.id}
                        className="border rounded-lg p-4 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {integration.icon && (
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
                                {integration.icon}
                              </div>
                            )}
                            <h3 className="font-semibold">{integration.name}</h3>
                          </div>
                          {integration.badge && (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                              {integration.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {integration.description}
                        </p>
                        <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="outline" className="w-full">
                            Configurer
                          </Button>
                        </div>
                      </div>
                    ))}
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
    </div>
  );
};

export default Integrations;
