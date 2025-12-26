import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ArrowLeft, Bot, Loader2, Sparkles, Cpu, Mic, Settings, Upload, FileText, Trash2, Database, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { createAgent, uploadDocument } from "@/services/agentService";
import { AvatarSelector } from "@/components/AvatarSelector";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { TemplateDetail } from "@/services/templateService";
import { VoiceSelector, getVoiceConfig } from "@/components/VoiceSelector";
import { type AvailableVoice } from "@/services/voiceService";
import { Badge } from "@/components/ui/badge";

const AgentCreate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

  // Get template from HomePage navigation
  const homepageTemplate = location.state?.template as TemplateDetail | undefined;

  const [selectedVoice, setSelectedVoice] = useState<AvailableVoice | null>(null);

  // Document upload state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    avatar: "",
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
    voice: null as any, // Voice configuration
    background_sound: "off",
    background_denoising_enabled: false,
  });

  // Pre-fill form if template was selected from HomePage
  useEffect(() => {
    if (homepageTemplate) {
      console.log('🟢 Template received in AgentCreate:', homepageTemplate);
      console.log('🟢 Template config:', homepageTemplate.config);

      // Map template ID to proper agent type
      const getAgentType = (templateId: string): string => {
        const typeMap: Record<string, string> = {
          'customer-support-specialist': 'customer_support',
          'lead-qualification-specialist': 'lead_qualification',
          'appointment-scheduler': 'appointment_booking',
          'info-collector': 'information_provider',
          'care-coordinator': 'customer_support',
          'feedback-gatherer': 'information_provider'
        };
        return typeMap[templateId] || 'customer_support';
      };

      // Map ALL template config fields from backend API
      if (homepageTemplate.config) {
        setFormData(prev => ({
          ...prev,
          // Basic info - use config.name or template.name as fallback
          name: homepageTemplate.config.name || homepageTemplate.name,
          // Avatar is not provided by templates - user can choose their own
          description: homepageTemplate.description,

          // Agent type
          type: homepageTemplate.config.type || getAgentType(homepageTemplate.id),

          // LLM Configuration (all fields from backend)
          llm_provider: homepageTemplate.config.llm_provider,
          model: homepageTemplate.config.model,
          temperature: homepageTemplate.config.temperature,
          max_tokens: homepageTemplate.config.max_tokens,

          // System Prompt (most important field!)
          prompt: homepageTemplate.config.prompt,
          purpose: homepageTemplate.description,

          // First Message
          first_message: homepageTemplate.config.first_message,
          first_message_mode: homepageTemplate.config.first_message_mode,

          // Voice & Language
          language: homepageTemplate.config.language,
          background_sound: homepageTemplate.config.background_sound || 'off',
          background_denoising_enabled: homepageTemplate.config.background_denoising_enabled || false,
        }));

        console.log('🟢 Form data after mapping:', {
          name: homepageTemplate.config.name,
          type: homepageTemplate.config.type,
          model: homepageTemplate.config.model,
          temperature: homepageTemplate.config.temperature,
          prompt: homepageTemplate.config.prompt?.substring(0, 100) + '...',
          first_message: homepageTemplate.config.first_message,
        });
      } else {
        // Fallback for templates without config
        setFormData(prev => ({
          ...prev,
          name: homepageTemplate.name,
          description: homepageTemplate.description,
          type: getAgentType(homepageTemplate.id),
          purpose: homepageTemplate.description,
        }));
      }

      // Show toast notification (safe with try-catch)
      try {
        toast({
          title: "✨ Template chargé !",
          description: `Le template "${homepageTemplate.name}" est prêt à être personnalisé. Tous les champs ont été pré-remplis.`,
        });
      } catch (error) {
        console.log("Toast notification skipped");
      }
    }
  }, [homepageTemplate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (avatarUrl: string) => {
    setFormData(prev => ({ ...prev, avatar: avatarUrl }));
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

  const handleVoiceSelect = (voice: AvailableVoice) => {
    setSelectedVoice(voice);
    const voiceConfig = getVoiceConfig(voice);
    setFormData(prev => ({ ...prev, voice: voiceConfig }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setSelectedFiles(prev => [...prev, ...newFiles]);

      toast({
        title: "Fichiers sélectionnés",
        description: `${newFiles.length} fichier(s) seront uploadés après la création de l'agent`,
      });
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
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
        avatar: formData.avatar || undefined,
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
        voice: formData.voice || undefined,
        status: "active",
        background_sound: formData.background_sound,
        background_denoising_enabled: formData.background_denoising_enabled,
      });

      toast({
        title: "✅ Agent créé !",
        description: `${newAgent.name} a été créé avec succès.`,
      });

      // Upload documents if any were selected
      if (selectedFiles.length > 0) {
        toast({
          title: "📤 Upload des documents en cours...",
          description: `Upload de ${selectedFiles.length} document(s)`,
        });

        try {
          for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            await uploadDocument(newAgent.id, file);
          }

          toast({
            title: "✅ Documents uploadés !",
            description: `${selectedFiles.length} document(s) uploadé(s) avec succès`,
          });
        } catch (uploadError) {
          console.error("Error uploading documents:", uploadError);
          toast({
            title: "⚠️ Erreur d'upload",
            description: "L'agent a été créé mais certains documents n'ont pas pu être uploadés",
            variant: "destructive",
          });
        }
      }

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
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/agents"
          className="flex items-center text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux Agents
        </Link>

        <div className="flex items-center space-x-3">
          <Bot className="h-8 w-8 text-purple-500" />
          <div>
            <h1 className="text-3xl font-semibold text-white">
              {homepageTemplate ? `Créer ${homepageTemplate.name}` : 'Créer un Nouvel Agent'}
            </h1>
            <p className="text-gray-400 mt-1">
              {homepageTemplate ? homepageTemplate.description : 'Configurez votre agent IA en quelques clics'}
            </p>
          </div>
        </div>
      </div>

      {/* Template Info Banner */}
      {homepageTemplate && (
        <Card className="mb-6 bg-purple-500/10 border-purple-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <img
                src={homepageTemplate.image}
                alt={homepageTemplate.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-purple-500"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Template appliqué</p>
                <p className="text-sm text-gray-400">{homepageTemplate.name} - {homepageTemplate.role}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/agents/create', { replace: true, state: {} })}
                className="text-gray-400 hover:text-white"
              >
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Informations de Base
            </CardTitle>
            <CardDescription className="text-gray-400">
              Les détails essentiels de votre agent
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar Selector */}
            <div className="space-y-2">
              <Label className="text-white">Avatar de l'agent</Label>
              <div className="flex items-center gap-4">
                <AvatarSelector
                  currentAvatar={formData.avatar}
                  onAvatarChange={handleAvatarChange}
                  agentName={formData.name || "Agent"}
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-400">
                    Cliquez sur l'avatar pour choisir une photo ou en importer une.
                  </p>
                </div>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Nom de l'agent *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ex: Marie, Assistant Commercial, etc."
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Décrivez brièvement le rôle de cet agent..."
                rows={3}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type" className="text-white">Type d'agent</Label>
              <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-white/10">
                  <SelectItem value="customer_support" className="text-white hover:bg-white/10">Support Client</SelectItem>
                  <SelectItem value="sales" className="text-white hover:bg-white/10">Ventes</SelectItem>
                  <SelectItem value="appointment_booking" className="text-white hover:bg-white/10">Prise de RDV</SelectItem>
                  <SelectItem value="lead_qualification" className="text-white hover:bg-white/10">Qualification de Leads</SelectItem>
                  <SelectItem value="information_provider" className="text-white hover:bg-white/10">Fournisseur d'Informations</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* AI Configuration */}
        <CollapsibleSection
          title="Configuration IA"
          description="Paramètres du modèle de langage"
          icon={<Cpu className="h-5 w-5" />}
          defaultOpen={false}
        >
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Fournisseur LLM</Label>
                <Select value={formData.llm_provider} onValueChange={(value) => handleSelectChange("llm_provider", value)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-white/10">
                    <SelectItem value="openai" className="text-white hover:bg-white/10">OpenAI</SelectItem>
                    <SelectItem value="anthropic" className="text-white hover:bg-white/10">Anthropic</SelectItem>
                    <SelectItem value="google" className="text-white hover:bg-white/10">Google</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Modèle</Label>
                <Select value={formData.model} onValueChange={(value) => handleSelectChange("model", value)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-white/10">
                    <SelectItem value="gpt-4o" className="text-white hover:bg-white/10">GPT-4o</SelectItem>
                    <SelectItem value="gpt-4o-mini" className="text-white hover:bg-white/10">GPT-4o Mini</SelectItem>
                    <SelectItem value="gpt-4-turbo" className="text-white hover:bg-white/10">GPT-4 Turbo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Température: {formData.temperature}</Label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_tokens" className="text-white">Max Tokens</Label>
                <Input
                  id="max_tokens"
                  name="max_tokens"
                  type="number"
                  value={formData.max_tokens}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_tokens: parseInt(e.target.value) }))}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* System Prompt */}
        <CollapsibleSection
          title="System Prompt"
          description="Instructions pour l'IA"
          icon={<Sparkles className="h-5 w-5" />}
          defaultOpen={true}
        >
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-white">Mode premier message</Label>
              <Select value={formData.first_message_mode} onValueChange={(value) => handleSelectChange("first_message_mode", value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-white/10">
                  <SelectItem value="assistant-speaks-first" className="text-white hover:bg-white/10">L'assistant parle en premier</SelectItem>
                  <SelectItem value="assistant-waits" className="text-white hover:bg-white/10">L'assistant attend</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="first_message" className="text-white">Premier Message</Label>
              <Textarea
                id="first_message"
                name="first_message"
                value={formData.first_message}
                onChange={handleInputChange}
                placeholder="Bonjour ! Comment puis-je vous aider aujourd'hui ?"
                rows={3}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="prompt" className="text-white">System Prompt</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGeneratePrompt}
                  disabled={isGeneratingPrompt}
                  className="bg-purple-500/20 border-purple-500/30 text-white hover:bg-purple-500/30"
                >
                  {isGeneratingPrompt ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Générer avec IA
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                id="prompt"
                name="prompt"
                value={formData.prompt}
                onChange={handleInputChange}
                placeholder="Tu es un assistant IA spécialisé dans..."
                rows={8}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                Instructions système qui définissent le comportement de l'agent
              </p>
            </div>
          </div>
        </CollapsibleSection>

        {/* Voice & Language */}
        <CollapsibleSection
          title="Voix et Langue"
          description="Configuration vocale"
          icon={<Mic className="h-5 w-5" />}
          defaultOpen={false}
        >
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-white">Langue</Label>
              <Select value={formData.language} onValueChange={(value) => handleSelectChange("language", value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-white/10">
                  <SelectItem value="fr" className="text-white hover:bg-white/10">Français</SelectItem>
                  <SelectItem value="en" className="text-white hover:bg-white/10">English</SelectItem>
                  <SelectItem value="es" className="text-white hover:bg-white/10">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Voice Selector */}
            <VoiceSelector
              selectedVoice={selectedVoice}
              onVoiceSelect={handleVoiceSelect}
              language={formData.language}
            />

            <div className="space-y-2">
              <Label className="text-white">Bruit de fond</Label>
              <Select value={formData.background_sound} onValueChange={(value) => handleSelectChange("background_sound", value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-white/10">
                  <SelectItem value="off" className="text-white hover:bg-white/10">🔇 Aucun - Pas de bruit de fond</SelectItem>
                  <SelectItem value="office" className="text-white hover:bg-white/10">🏢 Bureau - Environnement de bureau calme</SelectItem>
                  <SelectItem value="restaurant" className="text-white hover:bg-white/10">🍽️ Restaurant - Ambiance avec conversations</SelectItem>
                  <SelectItem value="clinic" className="text-white hover:bg-white/10">🏥 Clinique - Environnement médical</SelectItem>
                  <SelectItem value="noisy" className="text-white hover:bg-white/10">📢 Bruyant - Centre d'appels, environnement très bruyant</SelectItem>
                  <SelectItem value="home" className="text-white hover:bg-white/10">🏠 Domestique - Maison avec TV/musique</SelectItem>
                  <SelectItem value="cafe" className="text-white hover:bg-white/10">☕ Café - Ambiance café avec discussions</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Ajoute un bruit de fond ambiant pour rendre les conversations plus naturelles
              </p>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <Label className="text-white">Débruitage intelligent (Krisp)</Label>
                <p className="text-sm text-gray-500">Filtre les bruits parasites de l'utilisateur</p>
              </div>
              <Switch
                checked={formData.background_denoising_enabled}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, background_denoising_enabled: checked }))}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Knowledge Base / Documents */}
        <CollapsibleSection
          title="Base de connaissances"
          description="Documents pour enrichir les connaissances de l'agent"
          icon={<BookOpen className="h-5 w-5" />}
          defaultOpen={false}
        >
          <div className="space-y-4 pt-4">
            <p className="text-sm text-gray-400">
              Ajoutez des documents (PDF, DOCX, TXT) pour créer la base de connaissances de votre agent. Les documents seront uploadés après la création de l'agent.
            </p>

            {selectedFiles.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center">
                <Database className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-white mb-2">
                  Aucun document sélectionné
                </h4>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Sélectionnez des documents pour enrichir les connaissances de votre agent
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/20 text-white gap-2 hover:bg-white/10"
                  onClick={handleUploadClick}
                >
                  <Upload className="h-4 w-4" />
                  Sélectionner des documents
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                />
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/5 p-6 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2 mb-1 text-gray-400">
                      <FileText className="h-4 w-4" />
                      <span className="text-xs font-medium">Documents</span>
                    </div>
                    <div className="flex items-end justify-between mt-auto">
                      <div className="text-3xl font-bold text-white">{selectedFiles.length}</div>
                      <div className="text-xs text-gray-500">Fichiers</div>
                    </div>
                  </div>
                  <div className="bg-white/5 p-6 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2 mb-1 text-gray-400">
                      <Database className="h-4 w-4" />
                      <span className="text-xs font-medium">Taille totale</span>
                    </div>
                    <div className="flex items-end justify-between mt-auto">
                      <div className="text-3xl font-bold text-white">
                        {formatFileSize(selectedFiles.reduce((sum, file) => sum + file.size, 0))}
                      </div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                  </div>
                  <div className="bg-white/5 p-6 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2 mb-1 text-gray-400">
                      <Upload className="h-4 w-4" />
                      <span className="text-xs font-medium">Status</span>
                    </div>
                    <div className="flex items-end justify-between mt-auto">
                      <div className="text-lg font-bold text-yellow-500">En attente</div>
                      <div className="text-xs text-gray-500">Upload après création</div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-medium text-white mb-4">Documents sélectionnés</h4>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-white/10 p-2 rounded-full">
                            <FileText className="h-5 w-5 text-gray-400" />
                          </div>
                          <div>
                            <h5 className="font-medium text-white">{file.name}</h5>
                            <p className="text-xs text-gray-500">
                              {file.type.split('/')[1]?.toUpperCase() || 'FICHIER'} • {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-yellow-500/20 text-yellow-400">
                            En attente
                          </Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={() => handleRemoveFile(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 p-6 rounded-lg border border-white/10">
                  <h4 className="font-medium text-white mb-3">Ajouter plus de documents</h4>
                  <p className="text-sm text-gray-400 mb-4">
                    Vous pouvez sélectionner des fichiers supplémentaires à ajouter
                  </p>
                  <Button
                    type="button"
                    className="bg-black text-white gap-2 hover:bg-black/80 border border-white/10"
                    onClick={handleUploadClick}
                  >
                    <Upload className="h-4 w-4" />
                    Sélectionner plus de documents
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                    multiple
                    accept=".pdf,.doc,.docx,.txt"
                  />
                </div>
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/agents")}
            className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/10"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Création...
              </>
            ) : (
              "Créer l'Agent"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AgentCreate;
