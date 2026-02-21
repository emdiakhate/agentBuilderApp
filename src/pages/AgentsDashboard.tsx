import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Bot, Activity, TrendingUp, Phone } from 'lucide-react';
import { useAgents } from '@/hooks/useAgents';
import { AgentCard } from '@/components/AgentCard';
import { useNavigate } from 'react-router-dom';

const AgentsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all-agents');
  const { agents, isLoading, error } = useAgents(activeFilter);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-white/10 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-white/10 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white">Réessayer</Button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total des Agents",
      value: agents.length.toString(),
      icon: Bot,
      description: "Agents configurés"
    },
    {
      title: "Agents Actifs",
      value: agents.filter(a => a.status === 'active').length.toString(),
      icon: Activity,
      description: "En ligne maintenant"
    },
    {
      title: "Appels Aujourd'hui",
      value: "1,247",
      icon: Phone,
      description: "+12% par rapport à hier"
    },
    {
      title: "Satisfaction",
      value: "4.8/5",
      icon: TrendingUp,
      description: "Note moyenne"
    }
  ];

  return (
    <>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Tableau de Bord des Agents
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Gérez et surveillez vos agents IA
            </p>
          </div>
          <Button
            onClick={() => navigate('/agents/create')}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvel Agent
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white dark:bg-white/5 border-gray-200 dark:border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filtres par statut */}
        <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-800/50">
            <TabsTrigger value="all-agents" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white">
              Tous les Agents
            </TabsTrigger>
            <TabsTrigger value="active-agents" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white">
              Actifs
            </TabsTrigger>
            <TabsTrigger value="inactive-agents" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white">
              Inactifs
            </TabsTrigger>
            <TabsTrigger value="maintenance-agents" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white">
              Maintenance
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeFilter} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {agents.map((agent, index) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  index={index}
                  onTest={(agentId) => navigate(`/agents/${agentId}?test=true`)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {agents.length === 0 && (
          <div className="text-center py-12">
            <Bot className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucun agent trouvé
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Commencez par créer votre premier agent IA.
            </p>
            <Button
              onClick={() => navigate('/agents/create')}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Créer un Agent
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default AgentsDashboard;
