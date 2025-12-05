/**
 * VapiCallButton Component
 *
 * Voice call button using Vapi.ai for agent interactions
 */

import { Phone, PhoneOff, Loader2, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useVapi } from '@/hooks/useVapi';
import { toast } from 'sonner';

interface VapiCallButtonProps {
  agentId: string;
  agentName: string;
  vapiAssistantId?: string | null;
  variant?: 'default' | 'card';
  className?: string;
}

export function VapiCallButton({
  agentId,
  agentName,
  vapiAssistantId,
  variant = 'default',
  className = '',
}: VapiCallButtonProps) {
  const {
    isCallActive,
    isSpeaking,
    isLoading,
    error,
    startCall,
    endCall,
  } = useVapi({
    onCallStart: () => {
      toast.success(`Appel démarré avec ${agentName}`);
    },
    onCallEnd: () => {
      toast.info(`Appel terminé avec ${agentName}`);
    },
    onError: (err) => {
      toast.error(`Erreur d'appel: ${err.message}`);
    },
  });

  const handleCallToggle = async () => {
    if (isCallActive) {
      endCall();
    } else {
      if (!vapiAssistantId) {
        toast.error('Cet agent n\'est pas configuré pour les appels vocaux');
        return;
      }

      try {
        await startCall(vapiAssistantId);
      } catch (err) {
        console.error('Failed to start call:', err);
      }
    }
  };

  // Simple button variant
  if (variant === 'default') {
    return (
      <div className={className}>
        <Button
          onClick={handleCallToggle}
          disabled={isLoading || !vapiAssistantId}
          variant={isCallActive ? 'destructive' : 'default'}
          className="w-full"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {!isLoading && !isCallActive && <Phone className="mr-2 h-4 w-4" />}
          {!isLoading && isCallActive && <PhoneOff className="mr-2 h-4 w-4" />}
          {isLoading && 'Connexion...'}
          {!isLoading && isCallActive && 'Raccrocher'}
          {!isLoading && !isCallActive && 'Appeler l\'agent'}
        </Button>

        {isCallActive && (
          <div className="mt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            {isSpeaking && (
              <>
                <Mic className="h-4 w-4 animate-pulse text-green-500" />
                <span>Agent en train de parler...</span>
              </>
            )}
            {!isSpeaking && (
              <>
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span>Appel en cours</span>
              </>
            )}
          </div>
        )}

        {error && (
          <div className="mt-2 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>
    );
  }

  // Card variant
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Appel vocal</span>
          {isCallActive && (
            <Badge variant="default" className="bg-green-500">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                En cours
              </div>
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Parlez directement avec {agentName}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {!vapiAssistantId && (
          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200 text-sm">
            Cet agent n'est pas encore configuré pour les appels vocaux.
            Veuillez contacter un administrateur.
          </div>
        )}

        <Button
          onClick={handleCallToggle}
          disabled={isLoading || !vapiAssistantId}
          variant={isCallActive ? 'destructive' : 'default'}
          size="lg"
          className="w-full"
        >
          {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          {!isLoading && !isCallActive && <Phone className="mr-2 h-5 w-5" />}
          {!isLoading && isCallActive && <PhoneOff className="mr-2 h-5 w-5" />}
          {isLoading && 'Connexion en cours...'}
          {!isLoading && isCallActive && 'Terminer l\'appel'}
          {!isLoading && !isCallActive && 'Démarrer l\'appel'}
        </Button>

        {isCallActive && (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
              {isSpeaking ? (
                <>
                  <Mic className="h-5 w-5 animate-pulse text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    Agent en train de parler...
                  </span>
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    À votre écoute
                  </span>
                </>
              )}
            </div>

            <div className="text-xs text-center text-muted-foreground">
              La conversation est en cours. Parlez naturellement.
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            <strong>Erreur:</strong> {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
