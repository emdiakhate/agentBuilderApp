import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Calendar, Clock, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Tool {
  id: string;
  type: string;
  name: string;
  description: string;
}

interface GoogleCalendarToolModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string;
  agentName: string;
}

const AVAILABLE_TOOLS = [
  {
    type: "google.calendar.event.create",
    name: "Créer des événements",
    description: "Permet de créer des événements dans Google Calendar",
    defaultName: "scheduleAppointment",
    icon: Calendar,
  },
  {
    type: "google.calendar.availability.check",
    name: "Vérifier la disponibilité",
    description: "Vérifie la disponibilité dans le calendrier",
    defaultName: "checkAvailability",
    icon: Clock,
  },
];

export function GoogleCalendarToolModal({
  open,
  onOpenChange,
  agentId,
  agentName,
}: GoogleCalendarToolModalProps) {
  const [step, setStep] = useState(1);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [createdTools, setCreatedTools] = useState<Tool[]>([]);
  const queryClient = useQueryClient();

  const createToolsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        "http://localhost:8000/api/agent-tools/vapi/tools/google-calendar",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create Google Calendar tools");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setCreatedTools(data.tools || []);
      setStep(3);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer les outils Google Calendar",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const addToolsToAgentMutation = useMutation({
    mutationFn: async () => {
      const toolIds = createdTools.map((tool) => tool.id);

      const response = await fetch(
        `http://localhost:8000/api/agent-tools/agents/${agentId}/tools`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tool_ids: toolIds,
            update_system_prompt: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add tools to agent");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Succès !",
        description: "Outils Google Calendar ajoutés avec succès à votre agent",
      });
      queryClient.invalidateQueries({ queryKey: ["agent", agentId] });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter les outils à l'agent",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const handleToolSelection = (toolType: string) => {
    setSelectedTools((prev) =>
      prev.includes(toolType)
        ? prev.filter((t) => t !== toolType)
        : [...prev, toolType]
    );
  };

  const handleCreateTools = () => {
    createToolsMutation.mutate();
  };

  const handleAddToAgent = () => {
    addToolsToAgentMutation.mutate();
  };

  const handleClose = () => {
    setStep(1);
    setSelectedTools([]);
    setCreatedTools([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            Ajouter Google Calendar à {agentName}
          </DialogTitle>
          <DialogDescription>
            Configurez les outils Google Calendar pour votre agent
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-16 h-0.5 mx-2 ${
                    step > s ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertDescription>
                Sélectionnez les outils Google Calendar que vous souhaitez
                ajouter à votre agent
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              {AVAILABLE_TOOLS.map((tool) => (
                <div
                  key={tool.type}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedTools.includes(tool.type)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => handleToolSelection(tool.type)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedTools.includes(tool.type)}
                      onCheckedChange={() => handleToolSelection(tool.type)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <tool.icon className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-medium">{tool.name}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Creating tools */}
        {step === 2 && (
          <div className="space-y-4">
            {!createToolsMutation.isPending ? (
              <>
                <Alert>
                  <Calendar className="h-4 w-4" />
                  <AlertDescription>
                    Prêt à créer les outils Google Calendar dans Vapi
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Outils à créer :</p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {AVAILABLE_TOOLS.filter((t) =>
                      selectedTools.includes(t.type)
                    ).map((tool) => (
                      <li key={tool.type}>{tool.name}</li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  Création des outils Google Calendar dans Vapi...
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Step 3: Adding to agent */}
        {step === 3 && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Outils créés avec succès ! Cliquez sur "Ajouter à l'agent" pour
                finaliser.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <p className="text-sm font-medium">
                Outils créés ({createdTools.length}) :
              </p>
              <ul className="space-y-2">
                {createdTools.map((tool) => (
                  <li
                    key={tool.id}
                    className="text-sm p-3 bg-muted rounded-lg flex items-start gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <strong>{tool.name}</strong>
                      <p className="text-muted-foreground text-xs">
                        {tool.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <AlertDescription className="text-sm">
                L'agent sera automatiquement configuré pour utiliser ces outils.
                Le message système sera mis à jour avec les instructions pour la
                planification de rendez-vous.
              </AlertDescription>
            </Alert>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>

          {step === 1 && (
            <Button
              onClick={() => setStep(2)}
              disabled={selectedTools.length === 0}
            >
              Continuer
            </Button>
          )}

          {step === 2 && (
            <Button
              onClick={handleCreateTools}
              disabled={createToolsMutation.isPending}
            >
              {createToolsMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer les outils"
              )}
            </Button>
          )}

          {step === 3 && (
            <Button
              onClick={handleAddToAgent}
              disabled={addToolsToAgentMutation.isPending}
            >
              {addToolsToAgentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ajout...
                </>
              ) : (
                "Ajouter à l'agent"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
