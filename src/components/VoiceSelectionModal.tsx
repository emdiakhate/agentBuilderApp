
import React, { useRef, useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Volume2, Play, Pause, Loader2 } from 'lucide-react';
import { VoiceTrait } from '@/types/agent';
import { useElevenLabsVoices, useAfricanVoices } from '@/hooks/useVoices';
import { VoiceData, getVoicePreviewUrl } from '@/services/voiceService';

interface VoiceSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedVoice: string;
  onVoiceSelect: (voiceId: string) => void;
  voiceProvider: string;
  onVoiceProviderChange: (provider: string) => void;
}

// Legacy voice providers (keeping Amazon Polly and Google TTS)
const LEGACY_VOICE_PROVIDERS = {
  "Amazon Polly": {
    "Joanna": {
      id: "Joanna",
      name: "Joanna",
      traits: [{
        name: "American",
        color: "bg-red-100 text-red-800"
      }, {
        name: "Professional",
        color: "bg-purple-100 text-purple-800"
      }],
      avatar: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
      audioSample: "/voices/polly-joanna.mp3"
    },
    "Matthew": {
      id: "Matthew",
      name: "Matthew",
      traits: [{
        name: "American",
        color: "bg-red-100 text-red-800"
      }, {
        name: "Deep",
        color: "bg-blue-100 text-blue-800"
      }],
      avatar: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
      audioSample: "/voices/polly-matthew.mp3"
    }
  },
  "Google TTS": {
    "Wavenet A": {
      id: "en-US-Wavenet-A",
      name: "Wavenet A",
      traits: [{
        name: "American",
        color: "bg-red-100 text-red-800"
      }, {
        name: "Neutral",
        color: "bg-gray-100 text-gray-800"
      }],
      avatar: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
      audioSample: "/voices/google-wavenet-a.mp3"
    },
    "Wavenet B": {
      id: "en-US-Wavenet-B",
      name: "Wavenet B",
      traits: [{
        name: "British",
        color: "bg-blue-100 text-blue-800"
      }, {
        name: "Formal",
        color: "bg-indigo-100 text-indigo-800"
      }],
      avatar: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9",
      audioSample: "/voices/google-wavenet-b.mp3"
    }
  }
};

const VoiceSelectionModal: React.FC<VoiceSelectionModalProps> = ({
  open,
  onOpenChange,
  selectedVoice,
  onVoiceSelect,
  voiceProvider,
  onVoiceProviderChange
}) => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [hoveredVoice, setHoveredVoice] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>(voiceProvider || "Eleven Labs");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch all Eleven Labs voices
  const { data: allElevenLabsVoices, isLoading: isLoadingAll } = useElevenLabsVoices();

  // Fetch African voices (French and English)
  const { data: africanVoices, isLoading: isLoadingAfrican } = useAfricanVoices();

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (voiceProvider && voiceProvider !== selectedTab) {
      setSelectedTab(voiceProvider);
    }
  }, [voiceProvider]);

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    onVoiceProviderChange(value);
  };

  const transformVoiceToDisplay = (voice: VoiceData) => {
    const traits: VoiceTrait[] = [];

    if (voice.accent) {
      traits.push({
        name: voice.accent,
        color: "bg-blue-100 text-blue-800"
      });
    }

    if (voice.gender) {
      traits.push({
        name: voice.gender,
        color: "bg-purple-100 text-purple-800"
      });
    }

    if (voice.language) {
      const languageMap: Record<string, string> = {
        'en': 'English',
        'fr': 'French',
        'es': 'Spanish',
        'de': 'German',
        'pt': 'Portuguese',
      };
      const langName = languageMap[voice.language] || voice.language;
      traits.push({
        name: langName,
        color: "bg-green-100 text-green-800"
      });
    }

    // Use the preview URL from the API or generate one dynamically
    const previewUrl = voice.previewUrl || getVoicePreviewUrl(voice.id);

    return {
      id: voice.id,
      name: voice.name,
      traits,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${voice.id}`,
      audioSample: previewUrl,
      description: voice.description,
      use_case: voice.use_case
    };
  };

  const handlePlaySample = (voiceId: string, audioUrl: string) => {
    // If currently playing this voice, stop it
    if (currentlyPlaying === voiceId) {
      if (audioRef.current) {
        audioRef.current.pause();
        setCurrentlyPlaying(null);
      }
      return;
    }

    // Set as playing immediately for UI feedback
    setCurrentlyPlaying(voiceId);

    if (!audioUrl) {
      // Simulate playback for 15 seconds if no audio file
      setTimeout(() => {
        setCurrentlyPlaying(null);
      }, 15000);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onended = () => {
      setCurrentlyPlaying(null);
    };

    audio.onerror = () => {
      console.error("Error playing audio sample");
      setTimeout(() => {
        setCurrentlyPlaying(null);
      }, 15000);
    };

    audio.play().catch(err => {
      console.error("Error playing audio:", err);
      setTimeout(() => {
        setCurrentlyPlaying(null);
      }, 15000);
    });
  };

  const renderVoiceCard = (voiceData: any, isLegacy: boolean = false) => {
    const isPlaying = currentlyPlaying === voiceData.id;

    return (
      <div
        key={voiceData.id}
        className={`flex items-start gap-4 p-3 rounded-lg cursor-pointer hover:bg-muted transition-colors ${selectedVoice === voiceData.id ? 'bg-muted border border-agent-primary/30' : ''}`}
        onClick={() => onVoiceSelect(voiceData.id)}
        onMouseEnter={() => setHoveredVoice(voiceData.id)}
        onMouseLeave={() => setHoveredVoice(null)}
      >
        <div className="relative">
          <Avatar className="h-14 w-14 rounded-full overflow-hidden">
            <AvatarImage
              src={voiceData.avatar}
              alt={voiceData.name}
              className="object-cover aspect-square"
            />
            <AvatarFallback>
              <Volume2 className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          {(hoveredVoice === voiceData.id || isPlaying) && (
            <Button
              variant="play"
              size="play"
              className={`absolute top-0 left-0 w-full h-full rounded-full shadow-md flex items-center justify-center ${
                isPlaying
                  ? 'bg-primary text-white'
                  : 'bg-black/60 hover:bg-primary/90'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handlePlaySample(voiceData.id, voiceData.audioSample);
              }}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 text-white" />
              ) : (
                <Play className="h-5 w-5 text-white ml-0.5" />
              )}
            </Button>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">{voiceData.name}</h4>
            {selectedVoice === voiceData.id && (
              <Badge variant="outline" className="bg-agent-primary/10 text-xs">
                Selected
              </Badge>
            )}
          </div>
          {voiceData.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{voiceData.description}</p>
          )}
          <div className="flex gap-1 mt-2 flex-wrap">
            {voiceData.traits?.map((trait: VoiceTrait, idx: number) => (
              <Badge key={idx} className={trait.color || "bg-gray-100 text-gray-800"}>
                {trait.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Select Voice</DialogTitle>
        </DialogHeader>

        <Tabs value={selectedTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="Eleven Labs">All Voices</TabsTrigger>
            <TabsTrigger value="African Voices">African</TabsTrigger>
            <TabsTrigger value="Amazon Polly">Polly</TabsTrigger>
            <TabsTrigger value="Google TTS">Google</TabsTrigger>
          </TabsList>

          <TabsContent value="Eleven Labs" className="mt-4">
            <ScrollArea className="h-[350px] w-full rounded-md border">
              <div className="p-4 space-y-4">
                {isLoadingAll ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Loading voices...</span>
                  </div>
                ) : allElevenLabsVoices && allElevenLabsVoices.length > 0 ? (
                  allElevenLabsVoices.map((voice) => renderVoiceCard(transformVoiceToDisplay(voice)))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <p className="font-medium">No voices available</p>
                    <p className="text-sm mt-1">Please configure your Eleven Labs API key in the backend.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="African Voices" className="mt-4">
            <ScrollArea className="h-[350px] w-full rounded-md border">
              <div className="p-4 space-y-4">
                {isLoadingAfrican ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Loading African voices...</span>
                  </div>
                ) : africanVoices && africanVoices.length > 0 ? (
                  <>
                    <div className="mb-3 p-2 bg-blue-50 rounded-md border border-blue-200">
                      <p className="text-xs text-blue-700 font-medium">
                        🌍 {africanVoices.length} African voices available in French & English
                      </p>
                    </div>
                    {africanVoices.map((voice) => renderVoiceCard(transformVoiceToDisplay(voice)))}
                  </>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <p className="font-medium">No African voices found</p>
                    <p className="text-sm mt-1">African voices in French and English are not currently available.</p>
                    <p className="text-sm mt-1">Please check your Eleven Labs subscription or API key.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {Object.keys(LEGACY_VOICE_PROVIDERS).map((provider) => (
            <TabsContent key={provider} value={provider} className="mt-4">
              <ScrollArea className="h-[350px] w-full rounded-md border">
                <div className="p-4 space-y-4">
                  {Object.keys(LEGACY_VOICE_PROVIDERS[provider as keyof typeof LEGACY_VOICE_PROVIDERS]).map((voiceName) => {
                    const voiceObj = LEGACY_VOICE_PROVIDERS[provider as keyof typeof LEGACY_VOICE_PROVIDERS][voiceName];
                    return renderVoiceCard(voiceObj, true);
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceSelectionModal;
