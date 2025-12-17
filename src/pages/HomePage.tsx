import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAgents } from '@/hooks/useAgents';
import { AgentCard } from '@/components/AgentCard';
import { StatsCards } from '@/components/StatsCards';
import { QuickActions } from '@/components/QuickActions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

type FilterTab = 'all' | 'active' | 'inactive' | 'maintenance';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { agents, isLoading, error } = useAgents();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  // Get user name (from auth context or localStorage)
  const userName = localStorage.getItem('user_name') || 'Malik'; // Fallback to Malik

  // Filter agents based on active filter and search query
  const filteredAgents = useMemo(() => {
    if (!agents) return [];

    let filtered = agents;

    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(agent => agent.status === activeFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(query) ||
        agent.type?.toLowerCase().includes(query) ||
        agent.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [agents, activeFilter, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!agents) return { total: 0, active: 0, calls: 0, satisfaction: 0 };

    const activeCount = agents.filter(a => a.status === 'active').length;
    const totalCalls = agents.reduce((sum, a) => sum + (a.totalCalls || 0), 0);
    const avgRating = agents.reduce((sum, a) => sum + (a.averageRating || 0), 0) / (agents.length || 1);

    return {
      total: agents.length,
      active: activeCount,
      calls: totalCalls,
      satisfaction: avgRating,
    };
  }, [agents]);

  const handleSearch = () => {
    // Could trigger a search action or just filter (already done with useMemo)
    console.log('Searching for:', searchQuery);
  };

  const handleTest = (agentId: string) => {
    navigate(`/agents/${agentId}?tab=test`);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-12 w-96" />
          <Skeleton className="h-16 w-full max-w-2xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-[340px]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-2xl font-bold text-destructive">
            Erreur de chargement
          </p>
          <p className="text-muted-foreground">
            Impossible de charger vos agents. Veuillez réessayer.
          </p>
          <Button onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!agents || agents.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold mb-2">
              <span className="font-serif italic text-muted-foreground">
                Ravi de te revoir,{' '}
              </span>
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {userName}
              </span>
            </h1>
          </motion.div>

          {/* Empty state */}
          <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
            <div className="text-center space-y-4">
              <div className="h-32 w-32 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Plus className="h-16 w-16 text-white" />
              </div>
              <h2 className="text-3xl font-bold">
                Créez votre premier agent
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Commencez à construire des agents IA vocaux intelligents
                pour automatiser vos conversations.
              </p>
              <Button
                size="lg"
                onClick={() => navigate('/agents/create')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Créer mon premier agent
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header with personalized greeting */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h1 className="text-4xl md:text-5xl font-bold">
            <span className="font-serif italic text-muted-foreground">
              Ravi de te revoir,{' '}
            </span>
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {userName}
            </span>
          </h1>

          {/* Search / Action Bar */}
          <div className="flex gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Input
                placeholder="Comment puis-je vous aider aujourd'hui ?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="h-14 pl-4 pr-12 text-lg rounded-2xl border-2 border-border/50 focus:border-primary shadow-lg"
              />
              <Button
                size="icon"
                onClick={handleSearch}
                className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <QuickActions />
        </motion.div>

        {/* Stats Cards */}
        <StatsCards
          totalAgents={stats.total}
          activeAgents={stats.active}
          callsToday={stats.calls}
          avgSatisfaction={stats.satisfaction}
        />

        {/* Filters */}
        <div className="flex items-center justify-between">
          <Tabs
            value={activeFilter}
            onValueChange={(value) => setActiveFilter(value as FilterTab)}
            className="w-full"
          >
            <TabsList className="bg-muted/50">
              <TabsTrigger value="all">Tous les Agents</TabsTrigger>
              <TabsTrigger value="active">Actifs</TabsTrigger>
              <TabsTrigger value="inactive">Inactifs</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Agents Grid */}
        {filteredAgents.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl font-semibold text-muted-foreground">
              Aucun agent trouvé
            </p>
            <p className="text-muted-foreground mt-2">
              Essayez un autre filtre ou créez un nouvel agent.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAgents.map((agent, index) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                index={index}
                onTest={handleTest}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
