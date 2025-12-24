import React, { useState, useEffect } from 'react';
import { Play, Pause, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { getAvailableVoices, getVoiceConfig, type AvailableVoice } from '@/services/voiceService';

interface VoiceSelectorProps {
  selectedVoice: AvailableVoice | null;
  onVoiceSelect: (voice: AvailableVoice) => void;
  language?: string; // Filter by language (e.g., 'en', 'fr')
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onVoiceSelect,
  language
}) => {
  const [voices, setVoices] = useState<AvailableVoice[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadVoices();
  }, [language]);

  useEffect(() => {
    // Cleanup audio on unmount
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
      }
    };
  }, [currentAudio]);

  const loadVoices = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (language) {
        filters.language = language;
      }

      const response = await getAvailableVoices(filters);
      setVoices(response.voices);
      setCategories(['all', ...response.categories]);

      // Select default voice if none selected
      if (!selectedVoice && response.voices.length > 0) {
        // Default to 'hana' (VAPI voice) or first voice
        const defaultVoice = response.voices.find(v => v.id === 'hana') || response.voices[0];
        onVoiceSelect(defaultVoice);
      }
    } catch (error) {
      console.error('Error loading voices:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les voix disponibles',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredVoices = voices.filter(voice => {
    if (selectedCategory !== 'all' && voice.category !== selectedCategory) return false;
    if (genderFilter !== 'all' && voice.gender !== genderFilter) return false;
    if (searchTerm && !voice.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const playVoiceSample = async (voice: AvailableVoice) => {
    const url = voice.sampleUrl || voice.previewUrl;
    if (!url) {
      toast({
        title: 'Aperçu indisponible',
        description: 'Aucun échantillon audio disponible pour cette voix',
        variant: 'default',
      });
      return;
    }

    // Stop current audio if playing
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = '';
    }

    if (playingVoice === voice.id) {
      setPlayingVoice(null);
      setCurrentAudio(null);
      return;
    }

    try {
      const audio = new Audio(url);
      audio.onended = () => {
        setPlayingVoice(null);
        setCurrentAudio(null);
      };
      audio.onerror = () => {
        setPlayingVoice(null);
        setCurrentAudio(null);
        toast({
          title: 'Erreur',
          description: 'Impossible de lire l\'échantillon audio',
          variant: 'destructive',
        });
      };

      setPlayingVoice(voice.id);
      setCurrentAudio(audio);
      await audio.play();
    } catch (error) {
      console.error('Error playing voice sample:', error);
      setPlayingVoice(null);
      setCurrentAudio(null);
    }
  };

  const getGenderBadgeColor = (gender: string) => {
    return gender === 'male' ? 'bg-blue-500/20 text-blue-300' : 'bg-pink-500/20 text-pink-300';
  };

  if (loading) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Choisir une voix</CardTitle>
          <CardDescription>Chargement des voix disponibles...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 bg-white/5" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Choisir une voix</CardTitle>
        <CardDescription>
          Sélectionnez une voix pour votre agent parmi {filteredVoices.length} voix disponibles
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a2e] border-white/10">
              {categories.map(category => (
                <SelectItem key={category} value={category} className="text-white">
                  {category === 'all' ? 'Toutes les catégories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger className="w-[150px] bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a2e] border-white/10">
              <SelectItem value="all" className="text-white">Tous</SelectItem>
              <SelectItem value="male" className="text-white">Masculin</SelectItem>
              <SelectItem value="female" className="text-white">Féminin</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/10 border-white/20 text-white pl-10"
              placeholder="Rechercher une voix..."
            />
          </div>
        </div>

        {/* Selected Voice Preview */}
        {selectedVoice && (
          <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-semibold">{selectedVoice.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getGenderBadgeColor(selectedVoice.gender)}>
                    {selectedVoice.gender}
                  </Badge>
                  <Badge className="bg-white/10 text-white">{selectedVoice.accent}</Badge>
                  <Badge className="bg-purple-500/20 text-purple-300">{selectedVoice.provider}</Badge>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  {selectedVoice.characteristics.slice(0, 3).join(', ')}
                </p>
              </div>
              {(selectedVoice.sampleUrl || selectedVoice.previewUrl) && (
                <Button
                  onClick={() => playVoiceSample(selectedVoice)}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  {playingVoice === selectedVoice.id ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Voice Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2">
          {filteredVoices.map(voice => (
            <div
              key={voice.id}
              onClick={() => onVoiceSelect(voice)}
              className={`
                p-4 rounded-lg cursor-pointer transition-all border
                ${selectedVoice?.id === voice.id
                  ? 'bg-purple-500/20 border-purple-500/50'
                  : 'bg-white/5 hover:bg-white/10 border-white/10'
                }
              `}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h5 className="text-white font-medium">{voice.name}</h5>
                  <p className="text-xs text-gray-400">{voice.accent}</p>
                </div>
                {(voice.sampleUrl || voice.previewUrl) && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      playVoiceSample(voice);
                    }}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-white/10"
                  >
                    {playingVoice === voice.id ? (
                      <Pause className="h-4 w-4 text-white" />
                    ) : (
                      <Play className="h-4 w-4 text-white" />
                    )}
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap gap-1 mb-2">
                <Badge className={`${getGenderBadgeColor(voice.gender)} text-xs`}>
                  {voice.gender}
                </Badge>
                <Badge className="bg-white/10 text-white text-xs">{voice.category}</Badge>
              </div>

              <div className="flex flex-wrap gap-1">
                {voice.characteristics.slice(0, 2).map(char => (
                  <span key={char} className="text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded">
                    {char}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredVoices.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            Aucune voix trouvée avec ces filtres
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { getVoiceConfig };
