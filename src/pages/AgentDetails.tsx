import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Bot, Trash2, AlertCircle, Loader2, History, Cpu, Calendar, Mic, Volume2, MessageSquare, Plus, Play, Pause, Phone, Copy, PhoneOutgoing, PhoneIncoming, Mail, Send, MoreVertical, Archive, UserMinus, PenSquare, Cog, Camera, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { VoiceTrait, AgentType } from "@/types/agent";
import { useAgentDetails } from "@/hooks/useAgentDetails";
import { AgentToggle } from "@/components/AgentToggle";
import { AgentChannels } from "@/components/AgentChannels";
import { AgentStats } from "@/components/AgentStats";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { updateAgent } from "@/services/agentService";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import AgentConfigSettings from "@/components/AgentConfigSettings";
import { RolePlayDialog } from "@/components/RolePlayDialog";
import { CustomTooltip } from "@/components/CustomTooltip";
import { UserPersonasSidebar } from "@/components/UserPersonasSidebar";
import { CallInterface } from "@/components/CallInterface";
import { Rocket } from "lucide-react";
import { TestAgentSidebar } from "@/components/TestAgentSidebar";
import { GoogleCalendarToolModal } from "@/components/GoogleCalendarToolModal";
import { AvatarUploadModal } from "@/components/AvatarUploadModal";
import { AgentAnalyticsTab } from "@/components/AgentAnalyticsTab";

const SAMPLE_TEXT = "Hello, I'm an AI assistant and I'm here to help you with your questions.";

interface VoiceDefinition {
  id: string;
  name: string;
  traits: VoiceTrait[];
  avatar?: string;
  audioSample: string;
}

const voiceSamples: Record<string, Record<string, VoiceDefinition>> = {
  "Eleven Labs": {
    "Emma": {
      id: "9BWtsMINqrJLrRacOk9x",
      name: "Emma",
      traits: [{
        name: "British",
        color: "bg-blue-100 text-blue-800"
      }, {
        name: "Professional",
        color: "bg-purple-100 text-purple-800"
      }],
      avatar: "/voices/avatars/emma.jpg",
      audioSample: "/voices/eleven-emma.mp3"
    },
    "Josh": {
      id: "CwhRBWXzGAHq8TQ4Fs17",
      name: "Josh",
      traits: [{
        name: "American",
        color: "bg-red-100 text-red-800"
      }, {
        name: "Casual",
        color: "bg-green-100 text-green-800"
      }],
      avatar: "/voices/avatars/josh.jpg",
      audioSample: "/voices/eleven-josh.mp3"
    },
    "Aria": {
      id: "EXAVITQu4vr4xnSDxMaL",
      name: "Aria",
      traits: [{
        name: "Young",
        color: "bg-yellow-100 text-yellow-800"
      }, {
        name: "Friendly",
        color: "bg-pink-100 text-pink-800"
      }],
      avatar: "/voices/avatars/aria.jpg",
      audioSample: "/voices/eleven-aria.mp3"
    },
    "Charlie": {
      id: "IKne3meq5aSn9XLyUdCD",
      name: "Charlie",
      traits: [{
        name: "Australian",
        color: "bg-green-100 text-green-800"
      }, {
        name: "Energetic",
        color: "bg-orange-100 text-orange-800"
      }],
      avatar: "/voices/avatars/charlie.jpg",
      audioSample: "/voices/eleven-charlie.mp3"
    }
  },
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
      avatar: "/voices/avatars/joanna.jpg",
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
      avatar: "/voices/avatars/matthew.jpg",
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
      avatar: "/voices/avatars/wavenet-a.jpg",
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
      avatar: "/voices/avatars/wavenet-b.jpg",
      audioSample: "/voices/google-wavenet-b.mp3"
    }
  }
};

const AgentDetails = () => {
  const {
    agentId
  } = useParams<{
    agentId: string;
  }>();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    agent,
    isLoading,
    error,
    isRolePlayOpen,
    openRolePlay,
    closeRolePlay,
    isDirectCallActive,
    directCallInfo,
    startDirectCall,
    endDirectCall
  } = useAgentDetails(agentId);
  const [isActive, setIsActive] = useState(false);
  const [model, setModel] = useState<string>("GPT-4");
  const [voice, setVoice] = useState<string>("Emma");
  const [voiceProvider, setVoiceProvider] = useState<string>("Eleven Labs");
  const [isVoiceDialogOpen, setIsVoiceDialogOpen] = useState(false);
  const [customVoiceId, setCustomVoiceId] = useState<string>("");
  const [isCustomVoice, setIsCustomVoice] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [selectedVoiceTraits, setSelectedVoiceTraits] = useState<VoiceTrait[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("");
  const [activeTab, setActiveTab] = useState("settings");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isCallTooltipOpen, setIsCallTooltipOpen] = useState(false);
  const [customCallNumber, setCustomCallNumber] = useState<string>("");
  const [isPersonasSidebarOpen, setIsPersonasSidebarOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<any>(null);
  const [isTestAgentSidebarOpen, setIsTestAgentSidebarOpen] = useState(false);
  const [isGoogleCalendarModalOpen, setIsGoogleCalendarModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  useEffect(() => {
    if (agent) {
      setIsActive(agent.status === "active");
      setModel(agent.model || "GPT-4");
      setVoice(agent.voice || "Emma");
      setVoiceProvider(agent.voiceProvider || "Eleven Labs");
      setCustomVoiceId(agent.customVoiceId || "");
      setIsCustomVoice(agent.voice === "Custom");
      if (agent.voice && agent.voiceProvider && !isCustomVoice) {
        const voiceDef = voiceSamples[agent.voiceProvider]?.[agent.voice];
        if (voiceDef) {
          setSelectedVoiceTraits(voiceDef.traits || []);
          setSelectedVoiceId(voiceDef.id || "");
        }
      }
    }
  }, [agent]);
  
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);
  
  const handleStatusToggle = () => {
    setIsActive(!isActive);
    toast({
      title: !isActive ? "Agent Activé" : "Agent Désactivé",
      description: !isActive ? "Votre agent est maintenant actif et traitera les demandes." : "Votre agent a été désactivé et ne traitera pas de nouvelles demandes.",
      variant: !isActive ? "default" : "destructive"
    });
  };
  
  const handleModelChange = async (value: string) => {
    setModel(value);
    if (agent && agentId) {
      try {
        await updateAgent(agentId, {
          ...agent,
          model: value
        });
        toast({
          title: "Modèle mis à jour",
          description: `Le modèle de l'agent a été mis à jour vers ${value}.`
        });
      } catch (error) {
        toast({
          title: "Échec de mise à jour du modèle",
          description: "Une erreur s'est produite lors de la mise à jour du modèle de l'agent.",
          variant: "destructive"
        });
      }
    }
  };
  
  const handleVoiceChange = async (voiceName: string) => {
    setVoice(voiceName);
    setIsCustomVoice(voiceName === "Custom");
    if (voiceName !== "Custom") {
      const voiceDef = voiceSamples[voiceProvider]?.[voiceName];
      if (voiceDef) {
        setSelectedVoiceTraits(voiceDef.traits || []);
        setSelectedVoiceId(voiceDef.id || "");
      }
      if (currentlyPlaying !== voiceName) {
        handlePlaySample(voiceName);
      }
    } else {
      setSelectedVoiceTraits([]);
      setSelectedVoiceId(customVoiceId);
    }
  };
  
  const handleProviderChange = async (value: string) => {
    setVoiceProvider(value);
    const voices = Object.keys(voiceSamples[value as keyof typeof voiceSamples] || {});
    if (voices.length > 0) {
      setVoice(voices[0]);
      const voiceDef = voiceSamples[value]?.[voices[0]];
      if (voiceDef) {
        setSelectedVoiceTraits(voiceDef.traits || []);
        setSelectedVoiceId(voiceDef.id || "");
      }
      setIsCustomVoice(voices[0] === "Custom");
    }
    if (audioRef.current) {
      audioRef.current.pause();
      setCurrentlyPlaying(null);
    }
  };
  
  const handleCustomVoiceIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomVoiceId(e.target.value);
    setSelectedVoiceId(e.target.value);
  };
  
  const handlePlaySample = (voiceName: string) => {
    if (currentlyPlaying === voiceName) {
      if (audioRef.current) {
        audioRef.current.pause();
        setCurrentlyPlaying(null);
      }
      return;
    }
    const voicePath = voiceSamples[voiceProvider as keyof typeof voiceSamples]?.[voiceName]?.audioSample;
    if (!voicePath) return;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(voicePath);
    audioRef.current = audio;
    audio.onended = () => {
      setCurrentlyPlaying(null);
    };
    audio.onplay = () => {
      setCurrentlyPlaying(voiceName);
    };
    audio.onerror = () => {
      toast({
        title: "Audio Error",
        description: `Could not play sample for ${voiceName}.`,
        variant: "destructive"
      });
      setCurrentlyPlaying(null);
    };
    audio.play().catch(err => {
      console.error("Error playing audio:", err);
      setCurrentlyPlaying(null);
    });
  };
  
  const handleVoiceSelectionSave = async () => {
    if (agent && agentId) {
      try {
        const updatedAgent = {
          ...agent,
          voice: isCustomVoice ? "Custom" : voice,
          voiceProvider: voiceProvider,
          customVoiceId: isCustomVoice ? customVoiceId : undefined,
          voiceTraits: isCustomVoice ? [] : selectedVoiceTraits
        };
        await updateAgent(agentId, updatedAgent);
        toast({
          title: "Paramètres vocaux mis à jour",
          description: `Les paramètres vocaux ont été mis à jour.`
        });
        setIsVoiceDialogOpen(false);
      } catch (error) {
        toast({
          title: "Échec de mise à jour des paramètres vocaux",
          description: "Une erreur s'est produite lors de la mise à jour des paramètres vocaux.",
          variant: "destructive"
        });
      }
    }
  };

  const handleDelete = async () => {
    if (!agent || !agentId) return;

    const confirmDelete = window.confirm(
      `Êtes-vous sûr de vouloir supprimer l'agent "${agent.name}" ? Cette action est irréversible.`
    );

    if (!confirmDelete) return;

    try {
      const { deleteAgent } = await import("@/services/agentService");
      await deleteAgent(agentId);

      toast({
        title: "✅ Agent supprimé",
        description: `L'agent "${agent.name}" a été supprimé avec succès.`,
      });

      navigate("/agents");
    } catch (error) {
      console.error("Error deleting agent:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'agent. Vérifiez votre connexion.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateChannel = async (channel: string, config: {
    enabled: boolean;
    details?: string;
    config?: Record<string, any>;
  }) => {
    if (!agent || !agentId) return;
    let updatedChannels: string[] = [...(agent.channels || [])];
    if (config.enabled && !updatedChannels.includes(channel)) {
      updatedChannels.push(channel);
    } else if (!config.enabled && updatedChannels.includes(channel)) {
      updatedChannels = updatedChannels.filter(c => c !== channel);
    }
    try {
      const updatedAgent = {
        ...agent,
        channels: updatedChannels,
        channelConfigs: {
          ...(agent.channelConfigs || {}),
          [channel]: config
        }
      };
      await updateAgent(agentId, updatedAgent);
      setIsActive(updatedAgent.status === "active");
      toast({
        title: config.enabled ? "Canal activé" : "Canal désactivé",
        description: `Le canal ${channel} a été mis à jour.`
      });
    } catch (error) {
      toast({
        title: "Échec de mise à jour du canal",
        description: "Une erreur s'est produite lors de la mise à jour de la configuration du canal.",
        variant: "destructive"
      });
    }
  };
  
  const handleCopyPhoneNumber = () => {
    if (voicePhoneNumber) {
      navigator.clipboard.writeText(voicePhoneNumber);
      toast({
        title: "Numéro de téléphone copié",
        description: "Le numéro de téléphone a été copié dans le presse-papiers."
      });
    }
  };
  
  const handleTestCall = () => {
    if (voicePhoneNumber) {
      window.location.href = `tel:${voicePhoneNumber}`;
      toast({
        title: "Appel de l'agent",
        description: `Lancement de l'appel vers ${voicePhoneNumber}`
      });
    } else {
      toast({
        title: "Aucun numéro de téléphone disponible",
        description: "Veuillez d'abord configurer un numéro de téléphone pour le canal vocal.",
        variant: "destructive"
      });
    }
  };
  
  const handleCopyEmail = () => {
    if (emailAddress) {
      navigator.clipboard.writeText(emailAddress);
      toast({
        title: "Adresse e-mail copiée",
        description: "L'adresse e-mail a été copiée dans le presse-papiers."
      });
    }
  };
  
  const handleTestEmail = () => {
    if (emailAddress) {
      window.location.href = `mailto:${emailAddress}?subject=E-mail de test pour ${agent?.name || 'Agent'}&body=Ceci est un e-mail de test pour votre agent IA.`;
      toast({
        title: "Rédaction d'e-mail",
        description: `Ouverture du client e-mail pour envoyer un e-mail de test à ${emailAddress}`
      });
    } else {
      toast({
        title: "Aucune adresse e-mail disponible",
        description: "Veuillez d'abord configurer une adresse e-mail pour le canal e-mail.",
        variant: "destructive"
      });
    }
  };
  
  const handleCallMe = () => {
    if (customCallNumber && customCallNumber.trim() !== "") {
      toast({
        title: "Appel sortant lancé",
        description: `Votre agent appellera ${customCallNumber} sous peu.`
      });
      setIsCallTooltipOpen(false);
    } else {
      toast({
        title: "Numéro de téléphone requis",
        description: "Veuillez entrer un numéro de téléphone valide.",
        variant: "destructive"
      });
    }
  };
  
  const handleDeactivateAgent = () => {
    setIsActive(false);
    toast({
      title: "Agent Désactivé",
      description: "Votre agent a été désactivé et ne traitera pas de nouvelles demandes.",
      variant: "destructive"
    });
  };

  const handleArchiveAgent = () => {
    toast({
      title: "Agent Archivé",
      description: "L'agent a été archivé et peut être restauré ultérieurement."
    });
    navigate("/agents");
  };
  
  const handleEditClick = () => {
    toast({
      title: "Mode Édition",
      description: "Vous pouvez maintenant modifier les détails de votre agent."
    });
    // In a real app, you might navigate to an edit page or enable edit mode
  };
  
  const handleCopyAvatar = () => {
    const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${agent?.id}`;
    if (avatarUrl) {
      navigator.clipboard.writeText(avatarUrl);
      toast({
        title: "Avatar copié",
        description: "L'URL de l'avatar a été copiée dans le presse-papiers."
      });
    }
  };

  const handleAvatarUpdate = async (avatarUrl: string) => {
    if (!agentId) return;

    try {
      const response = await fetch(`http://localhost:8000/api/agents/${agentId}/avatar`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ avatar_url: avatarUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to update avatar");
      }

      toast({
        title: "Avatar mis à jour",
        description: "La photo de profil de l'agent a été mise à jour avec succès.",
      });

      // Reload the page to show the new avatar
      window.location.reload();
    } catch (error) {
      console.error("Error updating avatar:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'avatar. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const handleAgentUpdate = (updatedAgent: AgentType) => {
    setIsActive(updatedAgent.status === "active");
    if (updatedAgent.name !== agent?.name) {
      toast({
        title: "Nom de l'agent mis à jour",
        description: `Le nom de l'agent a été mis à jour en ${updatedAgent.name}.`
      });
    }
  };
  
  const handleOpenPersonasSidebar = () => {
    setIsPersonasSidebarOpen(true);
  };
  
  const handleOpenTestAgentSidebar = () => {
    setIsTestAgentSidebarOpen(true);
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="h-8 w-8 text-agent-primary animate-spin" />
      </div>;
  }
  
  if (error || !agent) {
    return <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/agents" className="flex items-center text-gray-500 hover:text-agent-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux Agents
          </Link>
        </div>

        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            {error || "Cet agent est introuvable ou vous n'avez pas la permission de le visualiser."}
          </AlertDescription>
        </Alert>

        <Button onClick={() => navigate("/agents")}>Retour au Tableau de Bord</Button>
      </div>;
  }
  
  const lastUpdated = new Date().toLocaleString();
  const voicePhoneNumber = agent.channelConfigs?.voice?.details || null;
  const emailAddress = agent.channelConfigs?.email?.details || null;
  const activeChannels = Object.entries(agent.channelConfigs || {}).filter(([_, config]) => config.enabled).map(([channel]) => channel);
  const isNewAgent = agent.id === "new123";
  
  return <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="mb-6">
        <Link to="/agents" className="flex items-center text-gray-500 hover:text-agent-primary transition-colors duration-200">
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">Retour aux Agents</span>
        </Link>
      </div>
      
      <Card className="mb-6 overflow-hidden bg-gray-800/50 border-gray-700">
        <CardHeader className="pb-3">
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-4 items-start">
            <div className="relative group">
              <Avatar className="h-16 w-16 border-2 border-agent-primary/30">
                <AvatarImage
                  src={agent.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${agent.id}`}
                  alt={agent.name}
                />
                <AvatarFallback className="bg-agent-primary/20 text-agent-primary">
                  <Bot className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => setIsAvatarModalOpen(true)}
                className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-blue-700"
                title="Changer la photo"
              >
                <Camera className="h-3 w-3" />
              </button>
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">
                  {agent.name}
                </h1>
                {isActive ? <Badge variant="outline" className="border-green-500/30 text-green-500 bg-green-500/10">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      Actif
                    </span>
                  </Badge> : <Badge variant="outline" className="border-border">
                    {agent.type}
                  </Badge>}
              </div>
              <p className="text-muted-foreground mt-1.5 max-w-2xl">{agent.description}</p>
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <AgentToggle isActive={isActive} onToggle={handleStatusToggle} />
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenTestAgentSidebar}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <Rocket className="h-4 w-4" />
                Tester l'Agent
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsGoogleCalendarModalOpen(true)}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <Calendar className="h-4 w-4" />
                Ajouter Google Calendar
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="hover:bg-secondary">
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleEditClick} className="cursor-pointer flex items-center gap-2">
                    <PenSquare className="h-4 w-4 text-muted-foreground" />
                    <span>Modifier l'agent</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDeactivateAgent} className="cursor-pointer flex items-center gap-2">
                    <UserMinus className="h-4 w-4 text-muted-foreground" />
                    <span>Désactiver l'agent</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleArchiveAgent} className="cursor-pointer flex items-center gap-2">
                    <Archive className="h-4 w-4 text-muted-foreground" />
                    <span>Archiver l'agent</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="cursor-pointer flex items-center gap-2 text-red-400">
                    <Trash2 className="h-4 w-4" />
                    <span>Supprimer l'agent</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-3">
              {activeChannels.length > 0 && <div className="flex flex-wrap gap-2">
                  {activeChannels.includes('voice') && <Badge variant="channel">
                      <Mic className="h-3 w-3 mr-1" />
                      <span className="text-xs">Voice</span>
                    </Badge>}
                  {activeChannels.includes('chat') && <Badge variant="channel">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      <span className="text-xs">Chat</span>
                    </Badge>}
                  {activeChannels.includes('email') && <Badge variant="channel">
                      <Mail className="h-3 w-3 mr-1" />
                      <span className="text-xs">Email</span>
                    </Badge>}
                </div>}
              
              <div className="flex flex-wrap gap-3">
                {/* Phone and email information has been removed */}
              </div>
              
              <div className="mt-2">
                <AgentStats avmScore={agent.avmScore} interactionCount={agent.interactions || 0} csat={agent.csat} performance={agent.performance} isNewAgent={isNewAgent} showZeroValues={false} hideInteractions={true} />
              </div>
              
              <div className="flex justify-end text-xs text-muted-foreground mt-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Créé : {agent.createdAt}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <History className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Mis à jour : {lastUpdated.split(',')[0]}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-gray-400">AVM</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white">{agent.avm_score || 7.8}</span>
              <span className="text-sm text-gray-400">/10</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-gray-400">Interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {agent.interactions >= 1000
                ? `${(agent.interactions / 1000).toFixed(1)}k`
                : agent.interactions || '1.3k'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-gray-400">CSAT</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{agent.csat || 85}%</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-gray-400">Performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{agent.performance || 92}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mt-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="settings" className="text-sm">
            <span className="flex items-center gap-2">
              <Cog className="h-4 w-4" />
              Paramètres
            </span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-sm">
            <span className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analyse
            </span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="settings" className="space-y-6">
            <AgentConfigSettings agent={agent} onAgentUpdate={handleAgentUpdate} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AgentAnalyticsTab agent={agent} />
          </TabsContent>
        </div>
      </Tabs>

      <CallInterface
        open={isDirectCallActive}
        onOpenChange={(open) => {
          if (!open) endDirectCall();
        }}
        persona={selectedPersona}
        directCallInfo={directCallInfo}
        vapiAssistantId={agent?.vapi_assistant_id}
        agentName={agent?.name || "Agent"}
        onCallComplete={(recordingData) => {
          toast({
            title: "Appel terminé",
            description: `L'appel avec ${recordingData.title} a été enregistré.`
          });
        }}
      />

      <UserPersonasSidebar
        open={isPersonasSidebarOpen}
        onOpenChange={setIsPersonasSidebarOpen}
        onSelectPersona={(persona) => {
          setSelectedPersona(persona);
        }}
        onStartDirectCall={startDirectCall}
      />

      <TestAgentSidebar
        open={isTestAgentSidebarOpen}
        onOpenChange={setIsTestAgentSidebarOpen}
        agent={agent}
        onStartDirectCall={startDirectCall}
        onStartChat={() => {
          toast({
            title: "Interface de chat démarrée",
            description: "Vous pouvez maintenant discuter avec votre agent."
          });
        }}
      />

      <GoogleCalendarToolModal
        open={isGoogleCalendarModalOpen}
        onOpenChange={setIsGoogleCalendarModalOpen}
        agentId={agentId || ""}
        agentName={agent?.name || "Agent"}
      />

      <AvatarUploadModal
        open={isAvatarModalOpen}
        onOpenChange={setIsAvatarModalOpen}
        currentAvatar={agent?.avatar}
        agentName={agent?.name || "Agent"}
        agentId={agentId || ""}
        onAvatarUpdate={handleAvatarUpdate}
      />
    </div>;
};

export default AgentDetails;
