import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Calendar } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface AgentAnalyticsTabProps {
  agent: any;
}

interface TimeSeriesData {
  date: string;
  calls: number;
  minutes: number;
  cost: number;
  avg_cost: number;
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
  time_series: TimeSeriesData[];
  avg_duration_by_assistant: { [key: string]: number };
  calls: any[];
}

export const AgentAnalyticsTab: React.FC<AgentAnalyticsTabProps> = ({ agent }) => {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');

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
        time_series: [],
        avg_duration_by_assistant: {},
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

  // Format end reasons for bar chart
  const endReasonsData = Object.entries(analytics?.end_reasons || {}).map(([reason, count]) => ({
    reason: reason.replace(/-/g, ' '),
    'customer-ended-call': reason === 'customer-ended-call' ? count : 0,
    'silence-timed-out': reason === 'silence-timed-out' ? count : 0,
    'assistant-ended-call': reason === 'assistant-ended-call' ? count : 0,
    'other': !['customer-ended-call', 'silence-timed-out', 'assistant-ended-call'].includes(reason) ? count : 0,
  }));

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
          <h3 className="text-lg font-semibold">Métriques de Performance</h3>
          <p className="text-sm text-muted-foreground">
            Statistiques d'utilisation de {agent.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 border rounded-md">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[160px] border-0 h-auto p-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">7 derniers jours</SelectItem>
                <SelectItem value="30days">30 derniers jours</SelectItem>
                <SelectItem value="90days">90 derniers jours</SelectItem>
                <SelectItem value="1year">1 an</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Métriques principales avec graphiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Call Minutes */}
        <Card className="bg-[#1a2e2a] border-none">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400 text-xs">Total des Minutes d'Appel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-3">
              {analytics?.total_minutes.toFixed(2) || '0.00'}
            </div>
            <ResponsiveContainer width="100%" height={50}>
              <AreaChart data={analytics?.time_series || []}>
                <defs>
                  <linearGradient id="colorMinutesAgent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="minutes"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#colorMinutesAgent)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Number of Calls */}
        <Card className="bg-[#2a2419] border-none">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400 text-xs">Nombre d'Appels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-3">
              {analytics?.total_calls || 0}
            </div>
            <ResponsiveContainer width="100%" height={50}>
              <AreaChart data={analytics?.time_series || []}>
                <defs>
                  <linearGradient id="colorCallsAgent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="calls"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fill="url(#colorCallsAgent)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Total Cost */}
        <Card className="bg-[#1e1a2e] border-none">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400 text-xs">Coût Total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-3">
              ${analytics?.total_cost.toFixed(2) || '0.00'}
            </div>
            <ResponsiveContainer width="100%" height={50}>
              <AreaChart data={analytics?.time_series || []}>
                <defs>
                  <linearGradient id="colorCostAgent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="cost"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#colorCostAgent)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Average Cost per Call */}
        <Card className="bg-[#1a232e] border-none">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400 text-xs">Coût Moyen par Appel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-3">
              ${analytics?.avg_cost_per_call.toFixed(4) || '0.0000'}
            </div>
            <ResponsiveContainer width="100%" height={50}>
              <AreaChart data={analytics?.time_series || []}>
                <defs>
                  <linearGradient id="colorAvgCostAgent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="avg_cost"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#colorAvgCostAgent)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
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
                {analytics?.success_rate.toFixed(1) || '0.0'}%
              </div>
              <div className="text-sm text-muted-foreground">
                {analytics?.successful_calls || 0} appels réussis sur {analytics?.total_calls || 0} total
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div
                className="bg-green-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${analytics?.success_rate || 0}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Analyse des Appels</CardTitle>
          <CardDescription>
            Détails des appels et raisons de fin d'appel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Reason Call Ended */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Raison de Fin d'Appel</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={endReasonsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="reason"
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fill: '#9ca3af' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '6px',
                      color: '#fff'
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="customer-ended-call" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="silence-timed-out" stackId="a" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="assistant-ended-call" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="other" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              {/* Legend List */}
              <div className="space-y-2">
                {Object.entries(analytics?.end_reasons || {}).map(([reason, count], idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${
                        reason === 'customer-ended-call' ? 'bg-blue-500' :
                        reason === 'silence-timed-out' ? 'bg-cyan-500' :
                        reason === 'assistant-ended-call' ? 'bg-purple-500' :
                        'bg-orange-500'
                      }`}></div>
                      <span>{reason}</span>
                    </div>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
                {Object.keys(analytics?.end_reasons || {}).length === 0 && (
                  <p className="text-sm text-muted-foreground">Aucune donnée disponible</p>
                )}
              </div>
            </div>

            {/* Duration Stats */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Statistiques de Durée</h4>
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Durée Moyenne des Appels</p>
                  <div className="text-4xl font-bold text-gray-900 dark:text-white">
                    {analytics?.avg_duration_minutes.toFixed(2) || '0.00'} min
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm">Total des Minutes</span>
                    <span className="font-bold">{analytics?.total_minutes.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm">Appels Réussis</span>
                    <span className="font-bold">{analytics?.successful_calls || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm">Taux de Réussite</span>
                    <span className="font-bold text-green-600">{analytics?.success_rate.toFixed(1) || '0.0'}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm">Coût Total</span>
                    <span className="font-bold">${analytics?.total_cost.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
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
