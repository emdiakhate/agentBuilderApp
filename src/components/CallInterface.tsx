import React, { useState, useEffect, useRef } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, PhoneOff, Volume, Volume2, User, Bot, Phone } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useVapi } from "@/hooks/useVapi";

interface UserPersona {
  id: string;
  name: string;
  type: "customer" | "agent" | "bot";
  description: string;
  scenario?: string;
}

interface CallInterfaceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  persona: UserPersona | null;
  onCallComplete?: (recordingData: RecordingData) => void;
  directCallInfo?: {
    phoneNumber: string;
    deviceSettings: {
      mic: string;
      speaker: string;
    };
  };
  vapiAssistantId?: string | null;
  agentName?: string;
}

export interface RecordingData {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  type: 'call' | 'roleplay';
  transcriptions?: string[];
}

interface TranscriptionMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export const CallInterface: React.FC<CallInterfaceProps> = ({
  open,
  onOpenChange,
  persona,
  onCallComplete,
  directCallInfo,
  vapiAssistantId,
  agentName = "Agent"
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [selectedMic, setSelectedMic] = useState<string>("");
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>("");
  const [availableMics, setAvailableMics] = useState<MediaDeviceInfo[]>([]);
  const [availableSpeakers, setAvailableSpeakers] = useState<MediaDeviceInfo[]>([]);
  const [transcriptions, setTranscriptions] = useState<TranscriptionMessage[]>([]);
  const [isDirectCall, setIsDirectCall] = useState(false);

  const timerRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const callStartTimeRef = useRef<Date | null>(null);

  // Use Vapi hook for real voice calls
  const {
    isCallActive,
    isSpeaking,
    isLoading,
    error: vapiError,
    startCall,
    endCall: stopVapiCall,
  } = useVapi({
    onCallStart: () => {
      console.log("Vapi call started");
      callStartTimeRef.current = new Date();
      toast({
        title: "Appel démarré",
        description: `Vous êtes maintenant connecté avec ${agentName}`,
      });
    },
    onCallEnd: () => {
      console.log("Vapi call ended");
      handleCallEnd();
    },
    onSpeechStart: () => {
      console.log("Assistant speaking...");
    },
    onSpeechEnd: () => {
      console.log("Assistant stopped speaking");
    },
    onMessage: (message: any) => {
      console.log("Vapi message received:", message);

      // Handle different message types from Vapi
      if (message.type === 'transcript' && message.transcript) {
        const newMessage: TranscriptionMessage = {
          role: message.role || 'assistant',
          content: message.transcript,
          timestamp: new Date()
        };
        setTranscriptions(prev => [...prev, newMessage]);
      } else if (message.type === 'conversation-update' && message.conversation) {
        // Handle full conversation updates
        const messages: TranscriptionMessage[] = message.conversation.map((msg: any) => ({
          role: msg.role,
          content: msg.content || msg.text || '',
          timestamp: new Date(msg.timestamp || Date.now())
        }));
        setTranscriptions(messages);
      } else if (message.type === 'speech-update') {
        // Handle speech updates (user or assistant)
        if (message.status === 'complete' && message.transcript) {
          const newMessage: TranscriptionMessage = {
            role: message.role === 'assistant' ? 'assistant' : 'user',
            content: message.transcript,
            timestamp: new Date()
          };
          setTranscriptions(prev => [...prev, newMessage]);
        }
      }
    },
    onError: (err: Error) => {
      console.error("Vapi error:", err);
      toast({
        title: "Erreur d'appel",
        description: err.message,
        variant: "destructive"
      });
    },
  });

  useEffect(() => {
    if (directCallInfo) {
      setIsDirectCall(true);
      if (directCallInfo.deviceSettings) {
        setSelectedMic(directCallInfo.deviceSettings.mic);
        setSelectedSpeaker(directCallInfo.deviceSettings.speaker);
      }
    } else {
      setIsDirectCall(false);
    }
  }, [directCallInfo]);

  const clearAllTimers = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Start Vapi call when dialog opens
  useEffect(() => {
    if (open && vapiAssistantId && !isCallActive && !isLoading) {
      // Start the call automatically when dialog opens
      console.log("🔵 Starting Vapi call with assistant ID:", vapiAssistantId);
      const initCall = async () => {
        try {
          await startCall(vapiAssistantId);
          console.log("✅ Vapi call started successfully");
        } catch (err) {
          console.error("❌ Failed to start Vapi call:", err);
          toast({
            title: "Erreur",
            description: `Impossible de démarrer l'appel: ${err instanceof Error ? err.message : 'Erreur inconnue'}`,
            variant: "destructive"
          });
        }
      };
      initCall();
    } else {
      console.log("🟡 Vapi call not started. Conditions:", {
        open,
        vapiAssistantId,
        isCallActive,
        isLoading
      });
    }
  }, [open, vapiAssistantId]);

  // Stop call when dialog closes
  useEffect(() => {
    if (!open) {
      if (isCallActive) {
        stopVapiCall();
      }
      const resetState = () => {
        setCallDuration(0);
        setTranscriptions([]);
        setIsMuted(false);
        setIsAudioMuted(false);
        setIsDirectCall(Boolean(directCallInfo));
        clearAllTimers();
      };

      setTimeout(resetState, 100);
    }
  }, [open, directCallInfo, isCallActive]);

  useEffect(() => {
    return () => {
      clearAllTimers();
      if (isCallActive) {
        stopVapiCall();
      }
    };
  }, []);

  // Get audio devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            stream.getTracks().forEach(track => track.stop());
          })
          .catch(error => {
            console.error("Accès au microphone refusé:", error);
            toast({
              title: "Accès au Microphone Refusé",
              description: "Veuillez autoriser l'accès au microphone pour utiliser la fonction d'appel",
            });
          });

        const devices = await navigator.mediaDevices.enumerateDevices();
        const mics = devices.filter(device => device.kind === "audioinput");
        const speakers = devices.filter(device => device.kind === "audiooutput");

        setAvailableMics(mics);
        setAvailableSpeakers(speakers);

        if (mics.length > 0 && !selectedMic) setSelectedMic(mics[0].deviceId);
        if (speakers.length > 0 && !selectedSpeaker) setSelectedSpeaker(speakers[0].deviceId);
      } catch (error) {
        console.error("Erreur lors de l'accès aux périphériques audio:", error);
        toast({
          title: "Erreur de Périphérique",
          description: "Impossible d'accéder aux périphériques audio",
        });
      }
    };

    if (open) {
      getDevices();
    }

    const deviceChangeHandler = () => {
      if (open) {
        getDevices();
      }
    };

    navigator.mediaDevices.addEventListener('devicechange', deviceChangeHandler);

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', deviceChangeHandler);
    };
  }, [open]);

  // Timer for call duration
  useEffect(() => {
    if (open && isCallActive) {
      timerRef.current = window.setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [open, isCallActive]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcriptions]);

  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    if (isCallActive) {
      stopVapiCall();
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (onCallComplete) {
      const now = new Date();
      const date = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
      const time = now.toLocaleTimeString('fr-FR', { hour: 'numeric', minute: '2-digit' });

      const recordingData: RecordingData = {
        id: Math.random().toString(36).substring(2, 9),
        title: isDirectCall
          ? `Appel avec ${directCallInfo?.phoneNumber}`
          : `Appel avec ${agentName}`,
        date,
        time,
        duration: formatDuration(callDuration),
        type: isDirectCall ? 'call' : 'roleplay',
        transcriptions: transcriptions.map(t => `${t.role === 'user' ? 'Vous' : agentName}: ${t.content}`)
      };

      onCallComplete(recordingData);
    }

    onOpenChange(false);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    // TODO: Implement actual mute/unmute with Vapi SDK if available
    toast({
      title: isMuted ? "Microphone Réactivé" : "Microphone Coupé",
      description: isMuted ? "Votre microphone est maintenant actif" : "Votre microphone a été coupé",
    });
  };

  const handleToggleAudio = () => {
    setIsAudioMuted(!isAudioMuted);
    // TODO: Implement actual audio mute/unmute
    toast({
      title: isAudioMuted ? "Audio Réactivé" : "Audio Coupé",
      description: isAudioMuted ? "Vous pouvez maintenant entendre l'appel" : "L'audio de l'appel a été coupé",
    });
  };

  // Don't render if no assistant ID and no persona
  if (!vapiAssistantId && !persona && !isDirectCall) return null;

  // Show error if no assistant ID
  if (!vapiAssistantId && !isDirectCall) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Configuration manquante</AlertDialogTitle>
            <AlertDialogDescription>
              Cet agent n'est pas encore configuré pour les appels vocaux.
              Veuillez d'abord créer un assistant Vapi pour cet agent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={() => onOpenChange(false)}>Fermer</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  const callStatus = isLoading ? "connecting" : (isCallActive ? "active" : "ended");

  return (
    <AlertDialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          handleEndCall();
        } else {
          onOpenChange(newOpen);
        }
      }}
    >
      <AlertDialogContent className="max-w-md sm:max-w-2xl bg-white dark:bg-[#0F172A] border-gray-200 dark:border-gray-800">
        <AlertDialogDescription className="sr-only">
          {isDirectCall
            ? `Appel direct vers ${directCallInfo?.phoneNumber}`
            : `Interface d'appel avec ${agentName}. Vous pouvez communiquer et vous entraîner avec cet agent.`}
        </AlertDialogDescription>

        <AlertDialogHeader className="space-y-2 border-b border-gray-200 dark:border-gray-800 pb-4">
          <AlertDialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isDirectCall ? (
                <Phone className="h-5 w-5 text-green-500 dark:text-green-400" />
              ) : (
                <Bot className="h-5 w-5 text-primary" />
              )}
              <span className="text-gray-900 dark:text-white">
                {isDirectCall
                  ? `Appel Direct: ${directCallInfo?.phoneNumber}`
                  : agentName}
              </span>
              <Badge variant="outline" className="ml-2">
                {isDirectCall
                  ? "Appel en Direct"
                  : "Appel Vocal"}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm font-normal">
              {callStatus === "connecting" ? (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                  Connexion...
                </Badge>
              ) : callStatus === "active" ? (
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    {formatDuration(callDuration)}
                  </span>
                </Badge>
              ) : null}
            </div>
          </AlertDialogTitle>

          {callStatus === "connecting" && (
            <div className="py-10 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 relative">
                {isDirectCall ? (
                  <Phone className="h-8 w-8 text-green-500 dark:text-green-400" />
                ) : (
                  <Bot className="h-8 w-8 text-primary" />
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
                {isDirectCall
                  ? `Connexion à ${directCallInfo?.phoneNumber}...`
                  : `Connexion à ${agentName}...`}
              </h3>
              <Progress value={45} className="w-48 h-1" />
            </div>
          )}

          {vapiError && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <strong>Erreur:</strong> {vapiError}
            </div>
          )}
        </AlertDialogHeader>

        {callStatus === "active" && (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-4 my-4 h-[350px]">
            <div className="space-y-4 h-full flex flex-col">
              <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-3 bg-gray-50 dark:bg-gray-900/50 text-sm flex-shrink-0">
                <h4 className="font-medium text-sm mb-1.5 text-gray-900 dark:text-white">
                  Statut de l'appel
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {isSpeaking ? (
                      <>
                        <Mic className="h-4 w-4 text-green-500 animate-pulse" />
                        <span className="text-gray-600 dark:text-gray-400">Agent en train de parler...</span>
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">À votre écoute</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Parlez naturellement, l'agent vous entend.
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-3 space-y-3 flex-grow overflow-auto">
                <h4 className="font-medium text-sm text-gray-900 dark:text-white">Périphériques Audio</h4>
                <div className="space-y-2">
                  <Label htmlFor="mic-select" className="text-xs text-gray-700 dark:text-gray-300">Microphone</Label>
                  <Select
                    value={selectedMic}
                    onValueChange={setSelectedMic}
                    disabled={isCallActive}
                  >
                    <SelectTrigger id="mic-select" className="h-8 text-xs border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                      <SelectValue placeholder="Sélectionner un microphone" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMics.map((mic) => (
                        <SelectItem key={mic.deviceId} value={mic.deviceId}>
                          {mic.label || `Microphone ${mic.deviceId.slice(0, 5)}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="speaker-select" className="text-xs text-gray-700 dark:text-gray-300">Haut-parleur</Label>
                  <Select
                    value={selectedSpeaker}
                    onValueChange={setSelectedSpeaker}
                    disabled={isCallActive}
                  >
                    <SelectTrigger id="speaker-select" className="h-8 text-xs border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                      <SelectValue placeholder="Sélectionner un haut-parleur" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSpeakers.map((speaker) => (
                        <SelectItem key={speaker.deviceId} value={speaker.deviceId}>
                          {speaker.label || `Haut-parleur ${speaker.deviceId.slice(0, 5)}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 flex flex-col h-full overflow-hidden">
              <h4 className="font-medium text-sm mb-3 text-gray-900 dark:text-white">Transcription en Direct</h4>
              <ScrollArea className="flex-1 pr-2">
                <div className="space-y-4">
                  {transcriptions.length === 0 && (
                    <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
                      La transcription apparaîtra ici pendant l'appel...
                    </div>
                  )}
                  {transcriptions.map((msg, index) => {
                    const speaker = msg.role === 'user' ? 'Vous' : agentName;

                    return (
                      <div key={index} className="pb-3 border-b border-gray-200 dark:border-gray-800 last:border-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs py-0 px-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                            {speaker}
                          </Badge>
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            {formatTimestamp(msg.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 dark:text-gray-300 break-words overflow-hidden">{msg.content}</p>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>
          </div>
        )}

        <AlertDialogFooter className="flex justify-center space-x-2 border-t border-gray-200 dark:border-gray-800 pt-4">
          <Button
            variant={isMuted ? "destructive" : "outline"}
            size="icon"
            onClick={handleToggleMute}
            disabled={!isCallActive}
            className={cn(
              isMuted ? "bg-red-500/90" : "border-gray-300 dark:border-gray-700",
              "text-gray-900 dark:text-white"
            )}
          >
            {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleToggleAudio}
            disabled={!isCallActive}
            className={cn(
              isAudioMuted ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30" : "border-gray-300 dark:border-gray-700",
              "text-gray-900 dark:text-white"
            )}
          >
            {isAudioMuted ? <Volume className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>

          <Button
            variant="destructive"
            size="icon"
            onClick={handleEndCall}
            disabled={!isCallActive && !isLoading}
          >
            <PhoneOff className="h-4 w-4" />
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
