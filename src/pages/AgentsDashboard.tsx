import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Bot, Users, Activity, TrendingUp, Phone, MessageSquare, Zap, Settings, Rocket } from 'lucide-react';
import { useAgents } from '@/hooks/useAgents';
import { AgentToggle } from '@/components/AgentToggle';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const AgentsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all-agents');
  const { agents, isLoading, error } = useAgents(activeFilter);

  const handleToggleAgent = (e: React.MouseEvent, agentId: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`Basculer l'état de l'agent ${agentId}`);
  };

  const handleTestAgent = (e: React.MouseEvent, agentId: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/agents/${agentId}?test=true`);
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30';
      case 'inactive': return 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30';
      case 'maintenance': return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'maintenance': return 'Maintenance';
      default: return 'Inconnu';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'Customer Service': return 'Support';
      case 'Sales & Marketing': return 'Ventes';
      case 'Customer Onboarding': return 'Formation';
      case 'Technical Support': return 'Support Technique';
      default: return 'Général';
    }
  };

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <Card
                  key={agent.id}
                  className="bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 cursor-pointer group hover:border-emerald-500/50"
                  onClick={() => navigate(`/agents/${agent.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={agent.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${agent.id}`}
                            alt={agent.name}
                          />
                          <AvatarFallback className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold">
                            {agent.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {agent.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={cn("text-xs", getStatusColor(agent.status))}>
                              {getStatusText(agent.status)}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {getTypeText(agent.type)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <AgentToggle
                        isActive={agent.status === 'active'}
                        onToggle={(e) => handleToggleAgent(e, agent.id)}
                      />
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <CardDescription className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {agent.description}
                    </CardDescription>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Total Appels</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{agent.totalCalls || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Note Moyenne</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{agent.averageRating || 0}/5</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        size="sm"
                        className="flex-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-200 hover:bg-emerald-500/30"
                        onClick={(e) => handleTestAgent(e, agent.id)}
                      >
                        <Rocket className="mr-2 h-3 w-3" />
                        Tester
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-200 hover:bg-emerald-500/30"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/agents/${agent.id}`);
                        }}
                      >
                        <Settings className="mr-2 h-3 w-3" />
                        Configurer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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
