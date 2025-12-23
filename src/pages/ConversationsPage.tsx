import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  MessageSquare, Filter, Download, Play, FileText, Clock,
  Phone, TrendingUp, TrendingDown, Minus, Search, RefreshCw,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { Sidebar } from '@/components/Sidebar';
import { useAgents } from '@/hooks/useAgents';
import {
  fetchConversations,
  fetchConversation,
  exportConversationsCSV,
  formatDuration,
  getSentimentColor,
  getStatusColor,
  type Conversation,
  type ConversationFilters
} from '@/services/conversationService';

export const ConversationsPage: React.FC = () => {
  const { agents } = useAgents();
  const { toast } = useToast();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [filters, setFilters] = useState<ConversationFilters>({
    assistantId: 'all',
    startDate: '',
    endDate: '',
    status: 'all',
    sentiment: 'all',
    search: '',
    page: 1,
    limit: 20
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });

  useEffect(() => {
    loadConversations();
  }, [filters.page]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const response = await fetchConversations(filters);
      setConversations(response.conversations);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les conversations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ConversationFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSelectConversation = async (conversationId: string) => {
    try {
      const conversation = await fetchConversation(conversationId);
      setSelectedConversation(conversation);
    } catch (error) {
      console.error('Error loading conversation details:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les détails de la conversation',
        variant: 'destructive'
      });
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const blob = await exportConversationsCSV(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversations-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Export réussi',
        description: 'Les conversations ont été exportées en CSV'
      });
    } catch (error) {
      console.error('Error exporting conversations:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'exporter les conversations',
        variant: 'destructive'
      });
    } finally {
      setExporting(false);
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-4 w-4" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a1a]">
      <Sidebar />

      <main className="flex-1 lg:ml-[240px] transition-all duration-300 p-8">
        <div className="max-w-[1800px] mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Historique des Conversations
              </h1>
              <p className="text-gray-400">
                Consultez et analysez toutes les conversations de vos agents
              </p>
            </div>

            <Button
              onClick={handleExportCSV}
              disabled={exporting || conversations.length === 0}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {exporting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Export...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter CSV
                </>
              )}
            </Button>
          </div>

          {/* Filters */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Select
                  value={filters.assistantId}
                  onValueChange={(value) => handleFilterChange('assistantId', value)}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Tous les agents" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-white/10">
                    <SelectItem value="all" className="text-white">Tous les agents</SelectItem>
                    {agents?.map(agent => (
                      <SelectItem key={agent.id} value={agent.vapi_assistant_id || agent.id} className="text-white">
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="Date de début"
                />

                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="Date de fin"
                />

                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-white/10">
                    <SelectItem value="all" className="text-white">Tous les statuts</SelectItem>
                    <SelectItem value="ended" className="text-white">Terminé</SelectItem>
                    <SelectItem value="in-progress" className="text-white">En cours</SelectItem>
                    <SelectItem value="failed" className="text-white">Échoué</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.sentiment}
                  onValueChange={(value) => handleFilterChange('sentiment', value)}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Tous les sentiments" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-white/10">
                    <SelectItem value="all" className="text-white">Tous les sentiments</SelectItem>
                    <SelectItem value="positive" className="text-white">Positif</SelectItem>
                    <SelectItem value="neutral" className="text-white">Neutre</SelectItem>
                    <SelectItem value="negative" className="text-white">Négatif</SelectItem>
                  </SelectContent>
                </Select>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="bg-white/10 border-white/20 text-white pl-10"
                    placeholder="Rechercher..."
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  onClick={loadConversations}
                  variant="outline"
                  className="bg-transparent border-white/20 text-white hover:bg-white/10"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualiser
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Conversations List */}
            <Card className="lg:col-span-2 bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Conversations ({pagination.total})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-24 bg-white/5" />
                    ))}
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">Aucune conversation trouvée</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {conversations.map(conversation => (
                      <div
                        key={conversation.id}
                        onClick={() => handleSelectConversation(conversation.id)}
                        className={`
                          p-4 rounded-lg cursor-pointer transition-all
                          ${selectedConversation?.id === conversation.id
                            ? 'bg-purple-500/20 border-purple-500/50'
                            : 'bg-white/5 hover:bg-white/10 border-white/10'
                          }
                          border
                        `}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-white font-medium text-sm">
                            #{conversation.id.slice(-8)}
                          </span>
                          <Badge className={getStatusColor(conversation.status)}>
                            {conversation.status}
                          </Badge>
                        </div>

                        <div className="space-y-1 text-xs text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(conversation.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                          </div>

                          {conversation.duration && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              Durée: {formatDuration(conversation.duration)}
                            </div>
                          )}

                          {conversation.sentiment && (
                            <Badge className={`${getSentimentColor(conversation.sentiment)} text-xs`}>
                              {getSentimentIcon(conversation.sentiment)}
                              <span className="ml-1 capitalize">{conversation.sentiment}</span>
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {!loading && conversations.length > 0 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
                      disabled={pagination.page === 1}
                      className="bg-transparent border-white/20 text-white hover:bg-white/10"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Précédent
                    </Button>
                    <span className="text-sm text-gray-400">
                      Page {pagination.page}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                      disabled={conversations.length < pagination.limit}
                      className="bg-transparent border-white/20 text-white hover:bg-white/10"
                    >
                      Suivant
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Conversation Details */}
            <Card className="lg:col-span-3 bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Détails de la Conversation
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedConversation ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">Sélectionnez une conversation pour voir les détails</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Conversation metadata */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white/5 p-4 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">Statut</p>
                        <Badge className={getStatusColor(selectedConversation.status)}>
                          {selectedConversation.status}
                        </Badge>
                      </div>
                      <div className="bg-white/5 p-4 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">Durée</p>
                        <p className="text-white font-semibold">
                          {selectedConversation.duration ? formatDuration(selectedConversation.duration) : 'N/A'}
                        </p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">Coût</p>
                        <p className="text-white font-semibold">
                          ${selectedConversation.cost?.toFixed(4) || '0.00'}
                        </p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">Sentiment</p>
                        {selectedConversation.sentiment ? (
                          <Badge className={getSentimentColor(selectedConversation.sentiment)}>
                            {getSentimentIcon(selectedConversation.sentiment)}
                            <span className="ml-1 capitalize">{selectedConversation.sentiment}</span>
                          </Badge>
                        ) : (
                          <span className="text-gray-500 text-sm">N/A</span>
                        )}
                      </div>
                    </div>

                    {/* Summary */}
                    {selectedConversation.summary && (
                      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                        <h4 className="text-white font-semibold mb-2">Résumé</h4>
                        <p className="text-gray-300 text-sm">{selectedConversation.summary}</p>
                      </div>
                    )}

                    {/* Recording */}
                    {selectedConversation.recordingUrl && (
                      <div className="bg-white/5 p-4 rounded-lg">
                        <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                          <Play className="h-4 w-4" />
                          Enregistrement
                        </h4>
                        <audio controls className="w-full" src={selectedConversation.recordingUrl}>
                          Votre navigateur ne supporte pas la lecture audio.
                        </audio>
                        <a
                          href={selectedConversation.recordingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:text-purple-300 text-sm mt-2 inline-block"
                        >
                          Ouvrir dans un nouvel onglet →
                        </a>
                      </div>
                    )}

                    {/* Transcript */}
                    <div>
                      <h4 className="text-white font-semibold mb-4">Transcription</h4>
                      <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {selectedConversation.transcript.length === 0 ? (
                          <p className="text-gray-400 text-sm">Aucune transcription disponible</p>
                        ) : (
                          selectedConversation.transcript.map((msg, idx) => (
                            <div
                              key={idx}
                              className={`p-3 rounded-lg ${
                                msg.role === 'assistant'
                                  ? 'bg-purple-500/10 border-l-4 border-purple-500'
                                  : 'bg-blue-500/10 border-l-4 border-blue-500'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-white uppercase">
                                  {msg.role === 'assistant' ? 'Agent' : 'Client'}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {formatDuration(msg.time)}
                                </span>
                              </div>
                              <p className="text-gray-300 text-sm">{msg.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConversationsPage;
