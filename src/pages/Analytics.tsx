import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Clock, Phone } from "lucide-react";

const Analytics = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Analysez les performances de vos agents vocaux
        </p>
      </div>

      {/* Coming Soon Message */}
      <Card>
        <CardHeader>
          <div className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle className="text-2xl mb-2">Analytics - Bientôt disponible</CardTitle>
            <CardDescription className="text-center max-w-md">
              Les statistiques détaillées et les analyses de performance seront bientôt disponibles.
              Vous pourrez suivre les métriques de vos agents en temps réel.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      {/* Upcoming Features */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20 w-fit mb-2">
              <Phone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-lg">Historique d'appels</CardTitle>
            <CardDescription>
              Consultez tous les appels effectués par vos agents avec transcriptions complètes
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20 w-fit mb-2">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-lg">Métriques de performance</CardTitle>
            <CardDescription>
              Suivez le taux de réussite, la satisfaction client et d'autres KPIs
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20 w-fit mb-2">
              <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle className="text-lg">Rapports en temps réel</CardTitle>
            <CardDescription>
              Visualisez les données en direct et exportez des rapports détaillés
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
