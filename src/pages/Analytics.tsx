import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

interface AgentAnalytics {
  id: string;
  name: string;
  vapi_assistant_id: string;
  analytics: any;
}

interface CombinedAnalyticsData {
  total_calls: number;
  total_minutes: number;
  total_cost: number;
  avg_cost_per_call: number;
  avg_duration_minutes: number;
  successful_calls: number;
  success_rate: number;
  end_reasons: { [key: string]: number };
  agents: AgentAnalytics[];
}

const Analytics: React.FC = () => {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<CombinedAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');
  const [selectedAgent, setSelectedAgent] = useState('all');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();

      switch (dateRange) {
        case '7days':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90days':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      const response = await fetch(
        `http://localhost:8000/api/analytics/all?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les analytics.",
        variant: "destructive",
      });

      // Fallback to empty data
      setAnalytics({
        total_calls: 0,
        total_minutes: 0,
        total_cost: 0,
        avg_cost_per_call: 0,
        avg_duration_minutes: 0,
        successful_calls: 0,
        success_rate: 0,
        end_reasons: {},
        agents: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    toast({
      title: "Export en cours",
      description: "Vos données analytics sont en cours d'export...",
    });
  };

  // Filter analytics by selected agent
  const getFilteredAnalytics = (): CombinedAnalyticsData => {
    if (!analytics || selectedAgent === 'all') {
      return analytics || {
        total_calls: 0,
        total_minutes: 0,
        total_cost: 0,
        avg_cost_per_call: 0,
        avg_duration_minutes: 0,
        successful_calls: 0,
        success_rate: 0,
        end_reasons: {},
        agents: []
      };
    }

    // Find the specific agent's analytics
    const agent = analytics.agents.find(a => a.id === selectedAgent);
    if (!agent) {
      return analytics;
    }

    // Return analytics for the selected agent only
    return {
      total_calls: agent.analytics.total_calls || 0,
      total_minutes: agent.analytics.total_minutes || 0,
      total_cost: agent.analytics.total_cost || 0,
      avg_cost_per_call: agent.analytics.avg_cost_per_call || 0,
      avg_duration_minutes: agent.analytics.avg_duration_minutes || 0,
      successful_calls: agent.analytics.successful_calls || 0,
      success_rate: agent.analytics.success_rate || 0,
      end_reasons: agent.analytics.end_reasons || {},
      agents: [agent]
    };
  };

  const filteredAnalytics = getFilteredAnalytics();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec filtres */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Métriques</h2>
          <p className="text-sm text-muted-foreground">
            Visualisez les performances de tous vos agents et les statistiques d'utilisation
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Exporter
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex gap-3">
        <Select value={selectedAgent} onValueChange={setSelectedAgent}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tous les Agents" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les Agents</SelectItem>
            {analytics?.agents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                {agent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">7 derniers jours</SelectItem>
            <SelectItem value="30days">30 derniers jours</SelectItem>
            <SelectItem value="90days">90 derniers jours</SelectItem>
            <SelectItem value="1year">1 an</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-gray-900">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total des Minutes d'Appel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 dark:text-green-400">
              {filteredAnalytics.total_minutes.toFixed(2)}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-12 w-full bg-green-100 dark:bg-green-900/30 rounded">
                <svg className="w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
                  <path d="M 0 40 Q 10 35 20 38 T 40 30 T 60 25 T 80 28 T 100 20" fill="none" stroke="#16a34a" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-gray-900">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Nombre d'Appels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700 dark:text-orange-400">
              {filteredAnalytics.total_calls}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-12 w-full bg-orange-100 dark:bg-orange-900/30 rounded">
                <svg className="w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
                  <path d="M 0 45 L 20 42 L 40 38 L 60 30 L 80 25 L 100 15" fill="url(#orange-gradient)" />
                  <defs>
                    <linearGradient id="orange-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ea580c" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#ea580c" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-gray-900">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Coût Total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700 dark:text-purple-400">
              ${filteredAnalytics.total_cost.toFixed(2)}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-12 w-full bg-purple-100 dark:bg-purple-900/30 rounded flex items-end">
                {[60, 70, 55, 80, 65, 90, 75, 85].map((height, i) => (
                  <div key={i} className="flex-1 mx-0.5">
                    <div className="bg-purple-500 rounded-t" style={{ height: `${height}%` }}></div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-gray-900">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Coût Moyen par Appel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">
              ${filteredAnalytics.avg_cost_per_call.toFixed(4)}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-12 w-full bg-blue-100 dark:bg-blue-900/30 rounded">
                <svg className="w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
                  <path d="M 0 25 Q 25 20 50 22 T 100 15" fill="none" stroke="#2563eb" strokeWidth="2" />
                  {[0, 25, 50, 75, 100].map((x, i) => (
                    <circle key={i} cx={x} cy={25 - i * 2} r="2" fill="#2563eb" />
                  ))}
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call Success Card */}
      <Card>
        <CardHeader>
          <CardTitle>Taux de Réussite des Appels</CardTitle>
          <CardDescription>
            Pourcentage d'appels terminés avec succès
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-baseline gap-4">
              <div className="text-5xl font-bold text-green-700 dark:text-green-400">
                {filteredAnalytics.success_rate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">
                {filteredAnalytics.successful_calls} appels réussis sur {filteredAnalytics.total_calls} total
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div
                className="bg-green-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${filteredAnalytics.success_rate}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analyse des Appels */}
      <Card>
        <CardHeader>
          <CardTitle>Analyse des Appels</CardTitle>
          <CardDescription>
            Détails des appels et raisons de fin d'appel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Raison de Fin d'Appel */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Raison de Fin d'Appel</h4>
              <div className="space-y-2">
                {Object.entries(filteredAnalytics.end_reasons).map(([reason, count], idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${
                        reason === 'customer-ended-call' ? 'bg-blue-500' :
                        reason === 'silence-timed-out' ? 'bg-cyan-500' :
                        reason === 'assistant-ended-call' ? 'bg-purple-500' :
                        'bg-gray-500'
                      }`}></div>
                      <span className="text-sm">{reason}</span>
                    </div>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
                {Object.keys(filteredAnalytics.end_reasons).length === 0 && (
                  <p className="text-sm text-muted-foreground">Aucune donnée disponible</p>
                )}
              </div>

              <div className="h-64 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-end gap-2 p-4">
                {Object.entries(filteredAnalytics.end_reasons).map(([reason, count], idx) => {
                  const total = Object.values(filteredAnalytics.end_reasons).reduce((a: number, b: number) => a + b, 0);
                  const height = total > 0 ? (count / total) * 100 : 0;
                  const colors = ['bg-blue-500', 'bg-cyan-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500'];

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <div className={`w-full ${colors[idx % colors.length]} rounded-t`} style={{ height: `${height}%` }}></div>
                      <span className="text-xs text-muted-foreground rotate-45 origin-top-left whitespace-nowrap">
                        {reason.substring(0, 10)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Durée Moyenne */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Durée Moyenne des Appels</h4>
              <div className="text-4xl font-bold text-gray-900 dark:text-white">
                {filteredAnalytics.avg_duration_minutes.toFixed(2)} min
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Appels Réussis</span>
                  <span className="font-medium">{filteredAnalytics.successful_calls}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Taux de Réussite</span>
                  <span className="font-medium">{filteredAnalytics.success_rate.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Coût Total</span>
                  <span className="font-medium">${filteredAnalytics.total_cost.toFixed(2)}</span>
                </div>
              </div>

              {/* Simple bar chart visualization */}
              <div className="h-64 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center p-4">
                <div className="text-center text-muted-foreground">
                  <p className="text-sm">Graphique de tendance</p>
                  <p className="text-xs">Basé sur {filteredAnalytics.total_calls} appels</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agents List (when showing all agents) */}
      {selectedAgent === 'all' && analytics && analytics.agents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance par Agent</CardTitle>
            <CardDescription>
              Vue détaillée des métriques pour chaque agent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.agents.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div>
                    <h4 className="font-medium">{agent.name}</h4>
                    <p className="text-sm text-muted-foreground">ID: {agent.vapi_assistant_id || 'N/A'}</p>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-muted-foreground">Appels</p>
                      <p className="font-bold">{agent.analytics.total_calls || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Minutes</p>
                      <p className="font-bold">{(agent.analytics.total_minutes || 0).toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Coût</p>
                      <p className="font-bold">${(agent.analytics.total_cost || 0).toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Succès</p>
                      <p className="font-bold">{(agent.analytics.success_rate || 0).toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Message si pas de données */}
      {analytics && analytics.total_calls === 0 && (
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
                Aucune donnée disponible
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Vos agents n'ont pas encore reçu d'appels. Les métriques s'afficheront dès que les premiers appels seront effectués.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Analytics;
