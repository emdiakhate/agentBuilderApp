import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { VoiceCloneModal } from "@/components/VoiceCloneModal";
import { Mic, Play, Pause, Search, Filter, Loader2, Plus } from 'lucide-react';

interface Voice {
  id: string;
  name: string;
  provider: string;
  voiceId?: string;
  language?: string;
  gender?: string;
  age?: number;
  accent?: string;
  previewUrl?: string;
  publicOwnerId?: string;
}

const VoiceLibrary: React.FC = () => {
  const { toast } = useToast();
  const [voices, setVoices] = useState<Voice[]>([]);
  const [filteredVoices, setFilteredVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchVoices();
  }, []);

  useEffect(() => {
    filterVoices();
  }, [voices, searchQuery, providerFilter, languageFilter]);

  const fetchVoices = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/voice-library/voices');

      if (!response.ok) {
        throw new Error('Failed to fetch voices');
      }

      const data = await response.json();
      setVoices(data.voices || []);
    } catch (error) {
      console.error('Error fetching voices:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les voix.",
        variant: "destructive",
      });
      setVoices([]);
    } finally {
      setLoading(false);
    }
  };

  const filterVoices = () => {
    let filtered = [...voices];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(voice =>
        voice.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Provider filter
    if (providerFilter !== 'all') {
      filtered = filtered.filter(voice => voice.provider === providerFilter);
    }

    // Language filter
    if (languageFilter !== 'all') {
      filtered = filtered.filter(voice =>
        voice.language?.toLowerCase().startsWith(languageFilter.toLowerCase())
      );
    }

    setFilteredVoices(filtered);
  };

  const playVoiceSample = async (voice: Voice) => {
    // Stop current audio
    if (audioPlayer) {
      audioPlayer.pause();
      setAudioPlayer(null);
    }

    if (playingVoiceId === voice.id) {
      setPlayingVoiceId(null);
      return;
    }

    try {
      // Use direct preview URL if available, otherwise fall back to backend generation
      const previewUrl = voice.previewUrl ||
        `http://localhost:8000/api/voice-library/voices/${voice.id}/preview?provider=${voice.provider}`;

      const audio = new Audio(previewUrl);
      setAudioPlayer(audio);
      setPlayingVoiceId(voice.id);

      audio.play();
      audio.onended = () => {
        setPlayingVoiceId(null);
        setAudioPlayer(null);
      };

      audio.onerror = () => {
        toast({
          title: "Erreur",
          description: "Impossible de générer l'aperçu audio.",
          variant: "destructive",
        });
        setPlayingVoiceId(null);
        setAudioPlayer(null);
      };
    } catch (error) {
      console.error('Error playing audio:', error);
      toast({
        title: "Erreur",
        description: "Impossible de lire l'aperçu audio.",
        variant: "destructive",
      });
      setPlayingVoiceId(null);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'elevenlabs':
      case '11labs':
        return '🎵';
      case 'cartesia':
        return '🎤';
      case 'playht':
        return '🔊';
      case 'rime-ai':
        return '🎙️';
      default:
        return '🔉';
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'elevenlabs':
      case '11labs':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/20 dark:text-purple-400';
      case 'cartesia':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400';
      case 'playht':
        return 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const handleCloneComplete = (newVoice: any) => {
    setShowCloneModal(false);
    fetchVoices(); // Refresh the list
    toast({
      title: "Voix clonée!",
      description: "La nouvelle voix a été ajoutée à votre bibliothèque.",
    });
  };

  // Get unique providers and languages for filters
  const providers = Array.from(new Set(voices.map(v => v.provider)));
  const languages = Array.from(new Set(voices.map(v => v.language).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Bibliothèque de Voix</h2>
          <p className="text-muted-foreground mt-1">
            Gérez et personnalisez vos voix pour vos agents
          </p>
        </div>
        <Button onClick={() => setShowCloneModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Cloner une Voix
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher une voix..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Provider Filter */}
            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les fournisseurs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les fournisseurs</SelectItem>
                {providers.map(provider => (
                  <SelectItem key={provider} value={provider}>
                    {provider}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Language Filter */}
            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les langues" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les langues</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">Anglais</SelectItem>
                <SelectItem value="es">Espagnol</SelectItem>
                <SelectItem value="de">Allemand</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredVoices.length} voix trouvée{filteredVoices.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Voices Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredVoices.map((voice) => (
            <Card
              key={voice.id}
              className="hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg">
                      {getProviderIcon(voice.provider)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{voice.name}</CardTitle>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Provider Badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={getProviderColor(voice.provider)}>
                    {voice.provider}
                  </Badge>
                  {voice.language && (
                    <Badge variant="outline" className="text-xs">
                      {voice.language.toUpperCase()}
                    </Badge>
                  )}
                </div>

                {/* Voice Details */}
                <div className="text-sm text-muted-foreground space-y-1">
                  {voice.gender && (
                    <p className="capitalize">
                      {voice.gender}
                      {voice.age && ` • ${voice.age} ans`}
                    </p>
                  )}
                  {voice.accent && (
                    <p className="text-xs">{voice.accent}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => playVoiceSample(voice)}
                  >
                    {playingVoiceId === voice.id ? (
                      <>
                        <Pause className="h-4 w-4 mr-1" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-1" />
                        Écouter
                      </>
                    )}
                  </Button>

                  {/* Clone button for ElevenLabs */}
                  {(voice.provider.toLowerCase() === 'elevenlabs' || voice.provider.toLowerCase() === '11labs') && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setShowCloneModal(true)}
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredVoices.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <Mic className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Aucune voix trouvée</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || providerFilter !== 'all' || languageFilter !== 'all'
                ? 'Essayez de modifier vos filtres de recherche.'
                : 'Commencez par cloner une voix pour votre bibliothèque.'}
            </p>
            {!searchQuery && providerFilter === 'all' && languageFilter === 'all' && (
              <Button onClick={() => setShowCloneModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Cloner une Voix
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Clone Modal */}
      <VoiceCloneModal
        open={showCloneModal}
        onClose={() => setShowCloneModal(false)}
        onCloneComplete={handleCloneComplete}
      />
    </div>
  );
};

export default VoiceLibrary;
