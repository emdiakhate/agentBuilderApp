import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Bot, Loader2 } from "lucide-react";
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

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "customer_support",
    llm_provider: "openai",
    model: "gpt-4o-mini",
    temperature: 0.7,
    purpose: "",
    language: "fr",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
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
