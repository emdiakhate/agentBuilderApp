import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit, Wrench, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { fetchTools, deleteTool, Tool, TOOL_TEMPLATES, createTool } from "@/services/toolService";

const Tools = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toolToDelete, setToolToDelete] = useState<Tool | null>(null);

  const { data: tools, isLoading } = useQuery({
    queryKey: ["tools"],
    queryFn: fetchTools,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTool,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tools"] });
      toast({
        title: "✅ Outil supprimé",
        description: "L'outil a été supprimé avec succès",
      });
      setDeleteDialogOpen(false);
      setToolToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'outil",
        variant: "destructive",
      });
    },
  });

  const createFromTemplateMutation = useMutation({
    mutationFn: createTool,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tools"] });
      toast({
        title: "✅ Outil créé",
        description: "L'outil a été créé depuis le template",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'outil",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (tool: Tool) => {
    setToolToDelete(tool);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (toolToDelete) {
      deleteMutation.mutate(toolToDelete.id);
    }
  };

  const handleCreateFromTemplate = async (templateKey: keyof typeof TOOL_TEMPLATES) => {
    const template = TOOL_TEMPLATES[templateKey];
    await createFromTemplateMutation.mutateAsync(template);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Outils</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les outils personnalisés utilisés par vos agents
          </p>
        </div>
        <Button onClick={() => navigate("/tools/create")} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvel Outil
        </Button>
      </div>

      {/* Quick Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Templates Rapides
          </CardTitle>
          <CardDescription>
            Créez rapidement des outils préconfigurés pour des cas d'usage courants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Card
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => handleCreateFromTemplate("google_calendar_booking")}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <Wrench className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Réservation Google Calendar</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Réservez des rendez-vous directement dans Google Calendar
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => handleCreateFromTemplate("check_availability")}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                    <Wrench className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Vérifier Disponibilité</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Vérifiez les créneaux disponibles dans le calendrier
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Tools List */}
      <Card>
        <CardHeader>
          <CardTitle>Mes Outils</CardTitle>
          <CardDescription>
            {tools?.length || 0} outil{tools?.length !== 1 ? "s" : ""} créé{tools?.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[300px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : tools && tools.length > 0 ? (
            <div className="space-y-3">
              {tools.map((tool) => (
                <div
                  key={tool.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Wrench className="h-6 w-6 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{tool.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {tool.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {tool.description || tool.function_description || "Aucune description"}
                    </p>
                    {tool.function_name && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Fonction: <code className="bg-muted px-1 py-0.5 rounded">{tool.function_name}</code>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {tool.server_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(tool.server_url, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/tools/${tool.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(tool)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun outil</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Créez votre premier outil personnalisé pour étendre les capacités de vos agents
              </p>
              <Button onClick={() => navigate("/tools/create")} className="gap-2">
                <Plus className="h-4 w-4" />
                Créer un Outil
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet outil ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'outil "{toolToDelete?.name}" ?
              Cette action est irréversible et l'outil ne sera plus disponible pour vos agents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Tools;
