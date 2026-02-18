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
    icon: Calendar,
  },
  {
    type: "google.calendar.availability.check",
    name: "Vérifier la disponibilité",
    description: "Vérifie la disponibilité dans le calendrier",
    icon: Clock,
  },
];

export function GoogleCalendarToolModal({
  open,
  onOpenChange,
  agentId,
  agentName,
}: GoogleCalendarToolModalProps) {
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const addToolsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `http://localhost:8000/api/agent-tools/agents/${agentId}/tools/google-calendar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tool_types: selectedTools,
            update_system_prompt: true,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to add Google Calendar tools");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Succès !",
        description: data.message || "Outils Google Calendar ajoutés avec succès à votre agent",
      });
      queryClient.invalidateQueries({ queryKey: ["agent", agentId] });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter les outils à l'agent",
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

  const handleAddToAgent = () => {
    addToolsMutation.mutate();
  };

  const handleClose = () => {
    setSelectedTools([]);
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
            Sélectionnez les outils Google Calendar pour votre agent
          </DialogDescription>
        </DialogHeader>

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

          <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <AlertDescription className="text-sm">
              L'agent sera automatiquement configuré pour utiliser ces outils.
              Le message système sera mis à jour avec les instructions pour la
              planification de rendez-vous.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button
            onClick={handleAddToAgent}
            disabled={selectedTools.length === 0 || addToolsMutation.isPending}
          >
            {addToolsMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ajout en cours...
              </>
            ) : (
              "Ajouter à l'agent"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
