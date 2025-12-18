import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Send, Plus, BarChart3, Mic, FileText, Users, Activity, Phone, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAgents } from '@/hooks/useAgents';
import { AgentCard } from '@/components/AgentCard';
import { Sidebar } from '@/components/Sidebar';
import { TemplatesSection } from '@/components/TemplatesSection';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

type FilterTab = 'all' | 'active' | 'inactive' | 'maintenance';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { agents, isLoading, error } = useAgents();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  // Get user name (from localStorage or context)
  const userName = localStorage.getItem('user_name') || 'Malik';

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  const handleTest = (agentId: string) => {
    navigate(`/agents/${agentId}?tab=test`);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-[#0a0a1a]">
        <Sidebar />
        <main className="flex-1 lg:ml-[240px] transition-all duration-300">
          <div className="p-8 space-y-8">
            <Skeleton className="h-12 w-96 bg-white/5" />
            <Skeleton className="h-16 w-full max-w-2xl bg-white/5" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 bg-white/5" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-[380px] bg-white/5" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen bg-[#0a0a1a]">
        <Sidebar />
        <main className="flex-1 lg:ml-[240px] flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <p className="text-2xl font-bold text-red-500">
              Erreur de chargement
            </p>
            <p className="text-gray-400">
              Impossible de charger vos agents. Veuillez réessayer.
            </p>
            <Button onClick={() => window.location.reload()} className="bg-purple-600 hover:bg-purple-700">
              Réessayer
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Empty state
  if (!agents || agents.length === 0) {
    return (
      <div className="flex min-h-screen bg-[#0a0a1a]">
        <Sidebar />
        <main className="flex-1 lg:ml-[240px] flex items-center justify-center p-8">
          <div className="text-center space-y-6 max-w-md">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Plus size={48} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white">
              Créez votre premier agent
            </h2>
            <p className="text-gray-400">
              Commencez à automatiser vos appels avec des agents IA vocaux intelligents.
            </p>
            <Button
              onClick={() => navigate('/agents/create')}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <Plus className="mr-2" size={20} />
              Créer mon premier agent
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a1a]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-[240px] transition-all duration-300">
        <div className="p-8 space-y-8 max-w-[1800px] mx-auto">
          {/* Header with Personalized Greeting */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-2"
          >
            <h1 className="text-4xl font-serif mb-2">
              <span className="text-gray-400 italic">Ravi de te revoir, </span>
              <span className="text-white font-bold">{userName}</span>
            </h1>
            <p className="text-gray-400 text-sm">
              Gérez vos agents vocaux et optimisez vos performances
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex gap-3">
                <Input
                  type="text"
                  placeholder="Comment puis-je vous aider aujourd'hui ?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 h-14 bg-white text-gray-900 placeholder:text-gray-500 rounded-2xl shadow-2xl border-0 text-base px-6"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="h-14 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl shadow-2xl"
                >
                  <Send size={20} />
                </Button>
              </div>
            </form>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3"
          >
            <Button
              onClick={() => navigate('/agents/create')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-medium shadow-lg hover:scale-105 transition-transform"
            >
              <Plus size={18} className="mr-2" />
              Créer un agent
            </Button>
            <Button
              onClick={() => navigate('/analytics')}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium shadow-lg hover:scale-105 transition-transform"
            >
              <BarChart3 size={18} className="mr-2" />
              Analytics
            </Button>
            <Button
              onClick={() => navigate('/voice-library')}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-full font-medium shadow-lg hover:scale-105 transition-transform"
            >
              <Mic size={18} className="mr-2" />
              Bibliothèque de voix
            </Button>
            <Button
              onClick={() => navigate('/agents/create?template=true')}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-medium shadow-lg hover:scale-105 transition-transform"
            >
              <FileText size={18} className="mr-2" />
              Templates
            </Button>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <Card className="bg-white/5 backdrop-blur border border-white/10 p-4 rounded-xl hover:bg-white/10 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Users size={24} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                  <p className="text-sm text-gray-400">Total Agents</p>
                </div>
              </div>
            </Card>

            <Card className="bg-white/5 backdrop-blur border border-white/10 p-4 rounded-xl hover:bg-white/10 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Activity size={24} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.active}</p>
                  <p className="text-sm text-gray-400">Agents Actifs</p>
                </div>
              </div>
            </Card>

            <Card className="bg-white/5 backdrop-blur border border-white/10 p-4 rounded-xl hover:bg-white/10 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Phone size={24} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.calls}</p>
                  <p className="text-sm text-gray-400">Appels Aujourd'hui</p>
                </div>
              </div>
            </Card>

            <Card className="bg-white/5 backdrop-blur border border-white/10 p-4 rounded-xl hover:bg-white/10 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Star size={24} className="text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.satisfaction.toFixed(1)}/5</p>
                  <p className="text-sm text-gray-400">Satisfaction</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Templates Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <TemplatesSection />
          </motion.div>

          {/* Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as FilterTab)}>
              <TabsList className="bg-white/5 border border-white/10">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-white/10 data-[state=active]:border-b-2 data-[state=active]:border-purple-500 text-gray-400 data-[state=active]:text-white"
                >
                  Tous les Agents
                </TabsTrigger>
                <TabsTrigger
                  value="active"
                  className="data-[state=active]:bg-white/10 data-[state=active]:border-b-2 data-[state=active]:border-purple-500 text-gray-400 data-[state=active]:text-white"
                >
                  Actifs
                </TabsTrigger>
                <TabsTrigger
                  value="inactive"
                  className="data-[state=active]:bg-white/10 data-[state=active]:border-b-2 data-[state=active]:border-purple-500 text-gray-400 data-[state=active]:text-white"
                >
                  Inactifs
                </TabsTrigger>
                <TabsTrigger
                  value="maintenance"
                  className="data-[state=active]:bg-white/10 data-[state=active]:border-b-2 data-[state=active]:border-purple-500 text-gray-400 data-[state=active]:text-white"
                >
                  Maintenance
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>

          {/* Agents Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredAgents.map((agent, index) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                index={index}
                onTest={handleTest}
              />
            ))}
          </motion.div>

          {/* No Results */}
          {filteredAgents.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-gray-400 text-lg">
                Aucun agent ne correspond à vos critères de recherche.
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};
