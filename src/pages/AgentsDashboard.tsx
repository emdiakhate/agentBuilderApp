
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Bot, Users, Activity, TrendingUp, Phone, MessageSquare, Zap, Settings } from 'lucide-react';
import { useAgents } from '@/hooks/useAgents';
import { AgentToggle } from '@/components/AgentToggle';
import { Link, useNavigate } from 'react-router-dom';
import { CallInterface, RecordingData } from '@/components/CallInterface';
import { cn } from '@/lib/utils';

const AgentsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all-agents');
  const { agents, isLoading, error } = useAgents(activeFilter);
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<any>(null);
  const [recordings, setRecordings] = useState<RecordingData[]>([]);

  const handleToggleAgent = (e: React.MouseEvent, agentId: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`Basculer l'état de l'agent ${agentId}`);
  };

  const handleTestAgent = (e: React.MouseEvent, agentId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Créer un persona basé sur l'agent
    const agent = agents.find(a => a.id === agentId);
    if (agent) {
      const persona = {
        id: agentId,
        name: agent.name,
        type: "agent" as const,
        description: agent.description,
        scenario: `Vous testez ${agent.name}, un ${agent.type === 'support' ? 'assistant support' : 
                   agent.type === 'sales' ? 'assistant commercial' : 
                   agent.type === 'training' ? 'assistant formation' : 'assistant analytique'}.`
      };
      
      setSelectedPersona(persona);
      setCallDialogOpen(true);
    }
  };

  const handleCallComplete = (recordingData: RecordingData) => {
    setRecordings(prev => [recordingData, ...prev]);
    console.log('Appel terminé:', recordingData);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
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
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
      case 'support': return 'Support';
      case 'sales': return 'Ventes';
      case 'training': return 'Formation';
      case 'analytics': return 'Analytique';
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
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvel Agent
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-gray-400" />
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

        {/* Filtres */}
        <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-800">
            <TabsTrigger value="all-agents" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
              Tous les Agents
            </TabsTrigger>
            <TabsTrigger value="active-agents" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
              Actifs
            </TabsTrigger>
            <TabsTrigger value="inactive-agents" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
              Inactifs
            </TabsTrigger>
            <TabsTrigger value="maintenance-agents" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
              Maintenance
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeFilter} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <Card 
                  key={agent.id} 
                  className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                  onClick={() => navigate(`/agents/${agent.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={agent.avatar} alt={agent.name} />
                          <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                            {agent.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
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
                    <CardDescription className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {agent.description}
                    </CardDescription>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Total Appels</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{agent.totalCalls}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Note Moyenne</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{agent.averageRating}/5</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => handleTestAgent(e, agent.id)}
                      >
                        <MessageSquare className="mr-2 h-3 w-3" />
                        Tester
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
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
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Créer un Agent
            </Button>
          </div>
        )}
      </div>

      <CallInterface
        open={callDialogOpen}
        onOpenChange={setCallDialogOpen}
        persona={selectedPersona}
        onCallComplete={handleCallComplete}
      />
    </>
  );
};

export default AgentsDashboard;
