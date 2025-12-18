import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Calendar } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import {
  LineChart,
  Line,
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

interface TimeSeriesData {
  date: string;
  calls: number;
  minutes: number;
  cost: number;
  avg_cost: number;
}

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
  time_series: TimeSeriesData[];
  avg_duration_by_assistant: { [key: string]: number };
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
        time_series: [],
        avg_duration_by_assistant: {},
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
        time_series: [],
        avg_duration_by_assistant: {},
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
      time_series: agent.analytics.time_series || [],
      avg_duration_by_assistant: { [agent.name]: agent.analytics.avg_duration_minutes || 0 },
      agents: [agent]
    };
  };

  const filteredAnalytics = getFilteredAnalytics();

  // Format end reasons for bar chart
  const endReasonsData = Object.entries(filteredAnalytics.end_reasons || {}).map(([reason, count]) => ({
    reason: reason.replace(/-/g, ' '),
    'customer-ended-call': reason === 'customer-ended-call' ? count : 0,
    'silence-timed-out': reason === 'silence-timed-out' ? count : 0,
    'assistant-ended-call': reason === 'assistant-ended-call' ? count : 0,
    'other': !['customer-ended-call', 'silence-timed-out', 'assistant-ended-call'].includes(reason) ? count : 0,
  }));

  // Format assistant duration for bar chart
  const assistantDurationData = Object.entries(filteredAnalytics.avg_duration_by_assistant || {}).map(([name, duration]) => ({
    name: name.substring(0, 20),
    duration: duration
  }));

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Métriques</h2>
          <p className="text-sm text-gray-400 mt-1">
            Visualisez les performances de tous vos agents
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 border border-white/10 bg-white/5 rounded-md">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-white">
            {dateRange === '7days' && '7 derniers jours'}
            {dateRange === '30days' && '30 derniers jours'}
            {dateRange === '90days' && '90 derniers jours'}
            {dateRange === '1year' && '1 an'}
          </span>
        </div>

        <span className="text-sm text-gray-400">grouped by</span>

        <Select value="days" disabled>
          <SelectTrigger className="w-[120px] bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Days" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="days">Days</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedAgent} onValueChange={setSelectedAgent}>
          <SelectTrigger className="w-[200px] bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Tous les Assistants" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les Assistants</SelectItem>
            {analytics?.agents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                {agent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Métriques principales avec graphiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Call Minutes */}
        <Card className="bg-[#1a2e2a] border-none">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400 text-xs">Total Call Minutes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white mb-3">
              {filteredAnalytics.total_minutes.toFixed(2)}
            </div>
            <ResponsiveContainer width="100%" height={60}>
              <AreaChart data={filteredAnalytics.time_series}>
                <defs>
                  <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="minutes"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#colorMinutes)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Number of Calls */}
        <Card className="bg-[#2a2419] border-none">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400 text-xs">Number of Calls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white mb-3">
              {filteredAnalytics.total_calls}
            </div>
            <ResponsiveContainer width="100%" height={60}>
              <AreaChart data={filteredAnalytics.time_series}>
                <defs>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="calls"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fill="url(#colorCalls)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Total Spent */}
        <Card className="bg-[#1e1a2e] border-none">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400 text-xs">Total Spent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white mb-3">
              ${filteredAnalytics.total_cost.toFixed(2)}
            </div>
            <ResponsiveContainer width="100%" height={60}>
              <AreaChart data={filteredAnalytics.time_series}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="cost"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#colorCost)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Average Cost per Call */}
        <Card className="bg-[#1a232e] border-none">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400 text-xs">Average Cost per Call</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white mb-3">
              ${filteredAnalytics.avg_cost_per_call.toFixed(2)}
            </div>
            <ResponsiveContainer width="100%" height={60}>
              <AreaChart data={filteredAnalytics.time_series}>
                <defs>
                  <linearGradient id="colorAvgCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="avg_cost"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#colorAvgCost)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Call Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Analyse des Appels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Reason Call Ended */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Raison de Fin d'Appel</h3>
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
            </div>

            {/* Average Call Duration by Assistant */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Durée Moyenne par Assistant</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={assistantDurationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fill: '#9ca3af' }} label={{ value: 'Minutes', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '6px',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="duration" fill="#10b981" radius={[4, 4, 0, 0]}>
                    {assistantDurationData.map((entry, index) => (
                      <Bar
                        key={`bar-${index}`}
                        fill={['#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899'][index % 6]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message si pas de données */}
      {analytics && analytics.total_calls === 0 && (
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="py-12">
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
