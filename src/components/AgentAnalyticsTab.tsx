import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Download, Loader2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

interface AgentAnalyticsTabProps {
  agent: any;
}

interface AnalyticsData {
  total_calls: number;
  total_minutes: number;
  total_cost: number;
  avg_cost_per_call: number;
  avg_duration_minutes: number;
  successful_calls: number;
  success_rate: number;
  end_reasons: { [key: string]: number };
  calls: any[];
}

export const AgentAnalyticsTab: React.FC<AgentAnalyticsTabProps> = ({ agent }) => {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');
  const [selectedChannel, setSelectedChannel] = useState('all');

  useEffect(() => {
    fetchAnalytics();
  }, [agent, dateRange]);

  const fetchAnalytics = async () => {
    if (!agent?.id) return;

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
        `http://localhost:8000/api/analytics/agents/${agent.id}?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`
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
        description: "Impossible de charger les analytics. Les données mockées sont affichées.",
        variant: "destructive",
      });

      // Fallback to mock data
      setAnalytics({
        total_calls: 0,
        total_minutes: 0,
        total_cost: 0,
        avg_cost_per_call: 0,
        avg_duration_minutes: 0,
        successful_calls: 0,
        success_rate: 0,
        end_reasons: {},
        calls: []
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
            Visualisez les performances de votre agent et les statistiques d'utilisation
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Exporter
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex gap-3">
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

        <Select value={selectedChannel} onValueChange={setSelectedChannel}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Canaux" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les canaux</SelectItem>
            <SelectItem value="voice">Voix</SelectItem>
            <SelectItem value="chat">Chat</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="social">Social</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Métriques principales de Vapi */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-gray-900">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total des Minutes d'Appel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 dark:text-green-400">
              {analytics?.total_minutes.toFixed(2) || '0.00'}
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
              {analytics?.total_calls || 0}
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
              ${analytics?.total_cost.toFixed(2) || '0.00'}
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
              ${analytics?.avg_cost_per_call.toFixed(4) || '0.0000'}
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
                {Object.entries(analytics?.end_reasons || {}).map(([reason, count], idx) => (
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
                {Object.keys(analytics?.end_reasons || {}).length === 0 && (
                  <p className="text-sm text-muted-foreground">Aucune donnée disponible</p>
                )}
              </div>

              <div className="h-64 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-end gap-2 p-4">
                {Object.entries(analytics?.end_reasons || {}).map(([reason, count], idx) => {
                  const total = Object.values(analytics?.end_reasons || {}).reduce((a: number, b: number) => a + b, 0);
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

            {/* Durée Moyenne par Assistant */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Durée Moyenne des Appels</h4>
              <div className="text-4xl font-bold text-gray-900 dark:text-white">
                {analytics?.avg_duration_minutes.toFixed(2) || '0.00'} min
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Appels Réussis</span>
                  <span className="font-medium">{analytics?.successful_calls || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Taux de Réussite</span>
                  <span className="font-medium">{analytics?.success_rate.toFixed(1) || '0.0'}%</span>
                </div>
              </div>

              <div className="h-64 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-end gap-1 p-4">
                {analytics?.calls.slice(0, 20).map((call, idx) => {
                  const duration = call.duration || 0;
                  const maxDuration = Math.max(...analytics.calls.map((c: any) => c.duration || 0));
                  const height = maxDuration > 0 ? (duration / maxDuration) * 100 : 0;
                  const colors = ['bg-teal-500', 'bg-pink-500', 'bg-orange-500', 'bg-red-500'];

                  return (
                    <div key={idx} className="flex-1">
                      <div className={`w-full ${colors[idx % colors.length]} rounded-t`} style={{ height: `${height}%` }}></div>
                    </div>
                  );
                })}
                {!analytics?.calls || analytics.calls.length === 0 && (
                  <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                    Aucun appel enregistré
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message si pas de données */}
      {analytics && analytics.total_calls === 0 && (
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
                Aucune donnée disponible
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Cet agent n'a pas encore reçu d'appels. Les métriques s'afficheront dès que les premiers appels seront effectués.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
