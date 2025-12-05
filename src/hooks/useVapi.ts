/**
 * useVapi Hook - React hook for Vapi.ai Web SDK
 *
 * Provides voice call functionality using Vapi.ai
 */

import { useEffect, useState, useCallback } from 'react';
import Vapi from '@vapi-ai/web';

interface UseVapiOptions {
  publicKey?: string;
  onCallStart?: () => void;
  onCallEnd?: () => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onMessage?: (message: any) => void;
  onError?: (error: Error) => void;
}

interface UseVapiReturn {
  vapi: Vapi | null;
  isCallActive: boolean;
  isSpeaking: boolean;
  isLoading: boolean;
  error: string | null;
  startCall: (assistantId: string) => Promise<void>;
  endCall: () => void;
  sendMessage: (message: string) => void;
}

export function useVapi(options: UseVapiOptions = {}): UseVapiReturn {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Vapi instance
  useEffect(() => {
    const publicKey = options.publicKey || import.meta.env.VITE_VAPI_PUBLIC_KEY;

    if (!publicKey) {
      console.warn('Vapi public key not provided');
      return;
    }

    const vapiInstance = new Vapi(publicKey);
    setVapi(vapiInstance);

    // Set up event listeners
    vapiInstance.on('call-start', () => {
      setIsCallActive(true);
      setIsLoading(false);
      setError(null);
      options.onCallStart?.();
    });

    vapiInstance.on('call-end', () => {
      setIsCallActive(false);
      setIsSpeaking(false);
      setIsLoading(false);
      options.onCallEnd?.();
    });

    vapiInstance.on('speech-start', () => {
      setIsSpeaking(true);
      options.onSpeechStart?.();
    });

    vapiInstance.on('speech-end', () => {
      setIsSpeaking(false);
      options.onSpeechEnd?.();
    });

    vapiInstance.on('message', (message: any) => {
      options.onMessage?.(message);
    });

    vapiInstance.on('error', (err: Error) => {
      setError(err.message);
      setIsLoading(false);
      setIsCallActive(false);
      options.onError?.(err);
    });

    // Cleanup
    return () => {
      vapiInstance.stop();
    };
  }, [options.publicKey]);

  // Start call with assistant ID
  const startCall = useCallback(async (assistantId: string) => {
    if (!vapi) {
      setError('Vapi not initialized');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await vapi.start(assistantId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start call';
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  }, [vapi]);

  // End call
  const endCall = useCallback(() => {
    if (vapi && isCallActive) {
      vapi.stop();
    }
  }, [vapi, isCallActive]);

  // Send message during call
  const sendMessage = useCallback((message: string) => {
    if (vapi && isCallActive) {
      vapi.send({
        type: 'add-message',
        message: {
          role: 'user',
          content: message,
        },
      });
    }
  }, [vapi, isCallActive]);

  return {
    vapi,
    isCallActive,
    isSpeaking,
    isLoading,
    error,
    startCall,
    endCall,
    sendMessage,
  };
}
