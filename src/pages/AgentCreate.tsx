import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Bot, Loader2, Sparkles, Cpu, Mic, Upload, Settings, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { createAgent } from "@/services/agentService";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { TemplateSelector } from "@/components/TemplateSelector";
import { AgentTemplate, fetchTemplateDetail, createAgentFromTemplate } from "@/services/templateService";

const AgentCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "customer_support",
    llm_provider: "openai",
    model: "gpt-4o-mini",
    temperature: 0.7,
    max_tokens: 1000,
    purpose: "",
    prompt: "",
    first_message: "",
    first_message_mode: "assistant-speaks-first",
    language: "fr",
    background_sound: "off",
    background_denoising_enabled: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTemplateSelect = async (template: AgentTemplate) => {
    setSelectedTemplate(template);

    // If blank template, just reset form
    if (template.id === "blank") {
      return;
    }

    try {
      // Fetch detailed template configuration
      const templateDetail = await fetchTemplateDetail(template.id);

      // Pre-fill form with template configuration
      setFormData({
        name: templateDetail.config.name,
        description: template.description,
        type: templateDetail.config.type,
        llm_provider: templateDetail.config.llm_provider,
        model: templateDetail.config.model,
        temperature: templateDetail.config.temperature,
        max_tokens: templateDetail.config.max_tokens,
        purpose: template.description,
        prompt: templateDetail.config.prompt,
        first_message: templateDetail.config.first_message,
        first_message_mode: templateDetail.config.first_message_mode,
        language: templateDetail.config.language.split('-')[0], // Convert 'fr-FR' to 'fr'
        background_sound: templateDetail.config.background_sound || "off",
        background_denoising_enabled: templateDetail.config.background_denoising_enabled || false,
      });

      toast({
        title: "✅ Template appliqué !",
        description: `Le template "${template.name}" a été chargé. Vous pouvez le personnaliser avant de créer l'agent.`,
      });
    } catch (error) {
      console.error("Error loading template:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le template",
        variant: "destructive",
      });
    }
  };

  const handleGeneratePrompt = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez d'abord renseigner le nom de l'agent",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingPrompt(true);

    try {
      const response = await fetch("http://localhost:8000/api/generate/prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || undefined,
          type: formData.type,
          purpose: formData.purpose || undefined,
          language: formData.language === "fr" ? "Français" : formData.language === "en" ? "English" : "Español",
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la génération");
      }

      const data = await response.json();
      setFormData(prev => ({ ...prev, prompt: data.system_prompt }));

      toast({
        title: "✨ Prompt généré !",
        description: "Le system prompt a été généré avec succès.",
      });
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le prompt. Vérifiez votre connexion.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de l'agent est requis",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const newAgent = await createAgent({
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type,
        llm_provider: formData.llm_provider,
        model: formData.model,
        temperature: formData.temperature,
        max_tokens: formData.max_tokens,
        purpose: formData.purpose || undefined,
        prompt: formData.prompt || undefined,
        first_message: formData.first_message || undefined,
        first_message_mode: formData.first_message_mode,
        language: formData.language,
        status: "active",
        background_sound: formData.background_sound,
        background_denoising_enabled: formData.background_denoising_enabled,
      });

      toast({
        title: "✅ Agent créé !",
        description: `${newAgent.name} a été créé avec succès.`,
      });

      // Rediriger vers la liste des agents
      navigate("/agents");
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'agent. Vérifiez votre connexion.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <Link
          to="/agents"
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux Agents
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Bot className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Créer un Nouvel Agent</h1>
            <p className="text-muted-foreground mt-1">Configurez votre agent IA en quelques clics</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => setTemplateSelectorOpen(true)}
          className="gap-2"
        >
          <Layout className="h-4 w-4" />
          Choisir un Template
        </Button>
      </div>

      {selectedTemplate && selectedTemplate.id !== "blank" && (
        <Card className="mb-6 bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Layout className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Template appliqué</p>
                  <p className="text-sm text-muted-foreground">{selectedTemplate.name}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedTemplate(null);
                  setFormData({
                    name: "",
                    description: "",
                    type: "customer_support",
                    llm_provider: "openai",
                    model: "gpt-4o-mini",
                    temperature: 0.7,
                    max_tokens: 1000,
                    purpose: "",
                    prompt: "",
                    first_message: "",
                    first_message_mode: "assistant-speaks-first",
                    language: "fr",
                    background_sound: "off",
                    background_denoising_enabled: false,
                  });
                }}
              >
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <TemplateSelector
        open={templateSelectorOpen}
        onClose={() => setTemplateSelectorOpen(false)}
        onSelectTemplate={handleTemplateSelect}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Configuration Sections */}
        <div className="space-y-4">
          {/* Model Section - Contains all main fields */}
          <CollapsibleSection
            title="Model"
            icon={<Cpu className="h-5 w-5" />}
            defaultOpen={true}
          >
            <div className="space-y-4">
              {/* Nom de l'agent */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nom de l'agent <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ex: Assistant Support Client"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Décrivez brièvement le rôle de cet agent..."
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              {/* Type d'agent */}
              <div className="space-y-2">
                <Label htmlFor="type">Type d'agent</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange("type", value)}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer_support">Support Client</SelectItem>
                    <SelectItem value="sales">Ventes</SelectItem>
                    <SelectItem value="technical_support">Support Technique</SelectItem>
                    <SelectItem value="lead_generation">Génération de Leads</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* System Prompt with Generate Button */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="prompt">System Prompt</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGeneratePrompt}
                    disabled={isGeneratingPrompt || !formData.name.trim()}
                    className="gap-2"
                  >
                    {isGeneratingPrompt ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Génération...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3" />
                        Générer avec IA
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  id="prompt"
                  name="prompt"
                  placeholder="Le system prompt définit le comportement de l'agent... (Utilisez le bouton Générer)"
                  value={formData.prompt}
                  onChange={handleInputChange}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Instructions système qui définissent le comportement et le rôle de l'agent
                </p>
              </div>

              {/* First Message */}
              <div className="space-y-2">
                <Label htmlFor="first_message">Premier Message</Label>
                <Textarea
                  id="first_message"
                  name="first_message"
                  placeholder="Bonjour ! Je suis votre assistant. Comment puis-je vous aider ?"
                  value={formData.first_message}
                  onChange={handleInputChange}
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  Le premier message que l'agent dira lors d'un appel
                </p>
              </div>

              {/* First Message Mode */}
              <div className="space-y-2">
                <Label htmlFor="first_message_mode">Mode Premier Message</Label>
                <Select
                  value={formData.first_message_mode}
                  onValueChange={(value) => handleSelectChange("first_message_mode", value)}
                >
                  <SelectTrigger id="first_message_mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assistant-speaks-first">L'assistant parle en premier</SelectItem>
                    <SelectItem value="assistant-waits">L'assistant attend</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choisissez si l'agent doit parler en premier ou attendre que l'utilisateur parle
                </p>
              </div>

              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Configuration du modèle</h4>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="llm_provider">Provider</Label>
                    <Select
                      value={formData.llm_provider}
                      onValueChange={(value) => handleSelectChange("llm_provider", value)}
                    >
                      <SelectTrigger id="llm_provider">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="anthropic">Anthropic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model_advanced">Model</Label>
                    <Select
                      value={formData.model}
                      onValueChange={(value) => handleSelectChange("model", value)}
                    >
                      <SelectTrigger id="model_advanced">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                        <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="temperature">
                        Temperature: {formData.temperature}
                      </Label>
                      <Input
                        id="temperature"
                        name="temperature"
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={formData.temperature}
                        onChange={(e) => setFormData(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                      />
                      <p className="text-xs text-muted-foreground">
                        Contrôle la créativité (0 = précis, 2 = créatif)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max_tokens">Max Tokens</Label>
                      <Input
                        id="max_tokens"
                        name="max_tokens"
                        type="number"
                        min="100"
                        max="4000"
                        step="100"
                        value={formData.max_tokens}
                        onChange={(e) => setFormData(prev => ({ ...prev, max_tokens: parseInt(e.target.value) }))}
                      />
                      <p className="text-xs text-muted-foreground">
                        Longueur maximale de la réponse
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Voice Section */}
          <CollapsibleSection
            title="Voice"
            icon={<Mic className="h-5 w-5" />}
            defaultOpen={false}
          >
            <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Provider</Label>
                      <Select value="cartesia" disabled>
                        <SelectTrigger>
                          <SelectValue placeholder="Cartesia" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cartesia">Cartesia</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Par défaut : Cartesia (meilleure qualité)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Voice</Label>
                      <Select value="helpful-french-lady" disabled>
                        <SelectTrigger>
                          <SelectValue placeholder="Helpful French Lady" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="helpful-french-lady">Helpful French Lady</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Voix française par défaut
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Model</Label>
                    <Select value="sonic-multilingual" disabled>
                      <SelectTrigger>
                        <SelectValue placeholder="Sonic Multilingual (Sonic 2)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sonic-multilingual">Sonic Multilingual (Sonic 2)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Sonic 2 - Support multilingue pour le français
                    </p>
                  </div>
                </div>
          </CollapsibleSection>

          {/* Additional Configuration Section */}
          <CollapsibleSection
            title="Configuration Additionnelle"
            icon={<Settings className="h-5 w-5" />}
            defaultOpen={false}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="background_sound">Bruit de fond</Label>
                <Select
                  value={formData.background_sound}
                  onValueChange={(value) => handleSelectChange("background_sound", value)}
                >
                  <SelectTrigger id="background_sound">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="off">🔇 Aucun - Pas de bruit de fond</SelectItem>
                    <SelectItem value="office">🏢 Bureau - Environnement de bureau calme</SelectItem>
                    <SelectItem value="restaurant">🍽️ Restaurant - Ambiance avec conversations</SelectItem>
                    <SelectItem value="cafe">☕ Café - Ambiance café avec discussions</SelectItem>
                    <SelectItem value="clinic">🏥 Clinique - Environnement médical</SelectItem>
                    <SelectItem value="noisy">📢 Bruyant - Centre d'appels, environnement très bruyant</SelectItem>
                    <SelectItem value="home">🏠 Domestique - Maison avec TV/musique</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Ajoute un bruit de fond ambiant pour rendre les conversations plus naturelles. Le bruit est ajouté côté agent.
                </p>
              </div>

              <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="background_denoising_enabled" className="cursor-pointer">
                    Débruitage intelligent (Krisp)
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Active le débruitage intelligent pour filtrer les bruits parasites de l'utilisateur
                  </p>
                </div>
                <Switch
                  id="background_denoising_enabled"
                  checked={formData.background_denoising_enabled}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, background_denoising_enabled: checked }))
                  }
                />
              </div>

              {formData.background_sound !== "off" && (
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 <strong>Recommandation</strong> : Pour un environnement {
                      formData.background_sound === "office" ? "de bureau" :
                      formData.background_sound === "restaurant" ? "de restaurant" :
                      formData.background_sound === "cafe" ? "de café" :
                      formData.background_sound === "clinic" ? "médical" :
                      formData.background_sound === "noisy" ? "bruyant" :
                      "domestique"
                    }, il est recommandé d'activer le débruitage intelligent pour une meilleure qualité audio.
                  </p>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* File Section */}
          <CollapsibleSection
            title="Files"
            icon={<Upload className="h-5 w-5" />}
            defaultOpen={false}
          >
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  💡 <strong>Astuce</strong> : Les documents peuvent être ajoutés après la création de l'agent dans l'onglet "Base de connaissances".
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Créez d'abord l'agent, puis uploadez des documents (PDF, DOCX, TXT) dans la section "Base de connaissances".
                Le prompt sera automatiquement mis à jour avec les noms des documents.
              </p>
            </div>
          </CollapsibleSection>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/agents")}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                <Bot className="h-4 w-4" />
                Créer l'Agent
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AgentCreate;
