import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Bot, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { createAgent } from "@/services/agentService";

const AgentCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "customer_support",
    llm_provider: "openai",
    model: "gpt-4o-mini",
    temperature: 0.7,
    purpose: "",
    prompt: "",
    first_message: "",
    first_message_mode: "assistant-speaks-first",
    language: "fr",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
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
        purpose: formData.purpose || undefined,
        prompt: formData.prompt || undefined,
        first_message: formData.first_message || undefined,
        first_message_mode: formData.first_message_mode,
        language: formData.language,
        status: "active",
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

      <div className="flex items-center space-x-3 mb-6">
        <Bot className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Créer un Nouvel Agent</h1>
          <p className="text-muted-foreground mt-1">Configurez votre agent IA en quelques clics</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l'Agent</CardTitle>
          <CardDescription>
            Remplissez les informations de base pour créer votre agent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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

            {/* Type et Modèle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="model">Modèle LLM</Label>
                <Select
                  value={formData.model}
                  onValueChange={(value) => handleSelectChange("model", value)}
                >
                  <SelectTrigger id="model">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o">GPT-4o (Plus performant)</SelectItem>
                    <SelectItem value="gpt-4o-mini">GPT-4o Mini (Rapide)</SelectItem>
                    <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Économique)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Langue */}
            <div className="space-y-2">
              <Label htmlFor="language">Langue</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => handleSelectChange("language", value)}
              >
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Purpose */}
            <div className="space-y-2">
              <Label htmlFor="purpose">Objectif principal</Label>
              <Textarea
                id="purpose"
                name="purpose"
                placeholder="Quel est l'objectif principal de cet agent ?"
                value={formData.purpose}
                onChange={handleInputChange}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Décrivez ce que l'agent doit accomplir (ex: répondre aux questions, générer des leads, etc.)
              </p>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentCreate;
