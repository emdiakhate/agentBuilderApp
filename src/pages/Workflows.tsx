import { GitBranch, Plus, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Workflows = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
          <p className="text-muted-foreground mt-1">
            Créez des workflows de conversation visuels pour vos agents
          </p>
        </div>
        <Button disabled className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau Workflow
        </Button>
      </div>

      {/* Coming Soon Message */}
      <Card>
        <CardHeader>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="p-4 rounded-full bg-primary/10 mb-4">
              <GitBranch className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl mb-2">Workflows - Bientôt disponible</CardTitle>
            <CardDescription className="text-center max-w-md mb-6">
              Les workflows visuels permettent de créer des conversations complexes
              avec des branches conditionnelles, des boucles et des intégrations.
            </CardDescription>
            <Badge variant="secondary" className="text-sm">
              Fonctionnalité disponible dans Vapi API Beta
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Workflow Features */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20 w-fit mb-2">
              <GitBranch className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-lg">Nœuds de Conversation</CardTitle>
            <CardDescription>
              <ul className="space-y-2 mt-2 text-sm">
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span><strong>Say</strong> : L'agent dit quelque chose</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span><strong>Gather</strong> : Collecte une réponse utilisateur</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span><strong>Condition</strong> : Branche conditionnelle</span>
                </li>
              </ul>
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20 w-fit mb-2">
              <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle className="text-lg">Intégrations</CardTitle>
            <CardDescription>
              <ul className="space-y-2 mt-2 text-sm">
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span><strong>API Request</strong> : Appel API externe</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span><strong>Tool</strong> : Utilise un outil personnalisé</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span><strong>Transfer</strong> : Transfert vers un autre agent</span>
                </li>
              </ul>
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20 w-fit mb-2">
              <GitBranch className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-lg">Cas d'Usage</CardTitle>
            <CardDescription>
              <ul className="space-y-2 mt-2 text-sm">
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Qualification de leads multi-étapes</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Processus de réservation complexe</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Support client avec escalade</span>
                </li>
              </ul>
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Example Workflow */}
      <Card>
        <CardHeader>
          <CardTitle>Exemple : Workflow de Réservation</CardTitle>
          <CardDescription>
            Voici à quoi ressemblerait un workflow de réservation de rendez-vous
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-sm">
                1
              </div>
              <div className="flex-1 p-3 rounded-lg border bg-card">
                <p className="text-sm font-medium">Say: "Bonjour, je peux vous aider à réserver un rendez-vous"</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 font-semibold text-sm">
                2
              </div>
              <div className="flex-1 p-3 rounded-lg border bg-card">
                <p className="text-sm font-medium">Gather: Demander la date souhaitée</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400 font-semibold text-sm">
                3
              </div>
              <div className="flex-1 p-3 rounded-lg border bg-card">
                <p className="text-sm font-medium">Tool: Vérifier disponibilité (check_availability)</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400 font-semibold text-sm">
                4
              </div>
              <div className="flex-1 p-3 rounded-lg border bg-card">
                <p className="text-sm font-medium">Condition: Si disponible → Réserver, Sinon → Proposer alternatives</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400 font-semibold text-sm">
                5
              </div>
              <div className="flex-1 p-3 rounded-lg border bg-card">
                <p className="text-sm font-medium">Tool: Réserver rendez-vous (book_appointment)</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-sm">
                6
              </div>
              <div className="flex-1 p-3 rounded-lg border bg-card">
                <p className="text-sm font-medium">Say: Confirmer la réservation</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documentation Link */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <GitBranch className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-1">En savoir plus sur les workflows</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Les workflows Vapi sont actuellement en version Beta. Cette fonctionnalité sera
                intégrée dans une prochaine mise à jour de l'application.
              </p>
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://docs.vapi.ai/workflows"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-2"
                >
                  Documentation Vapi
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Workflows;
