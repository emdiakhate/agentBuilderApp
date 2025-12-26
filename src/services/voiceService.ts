import { apiClient as api } from '@/lib/api';

export interface VoiceData {
  id: string;
  name: string;
  provider: string;
  language: string;
  gender: string;
  accent: string;
  age: number;
  description: string;
  use_case: string;
  category: string;
  previewUrl?: string;
}

export interface VoiceFilters {
  provider?: string;
  language?: string;
  gender?: string;
  category?: string;
}

export interface VoicesResponse {
  voices: VoiceData[];
}

/**
 * Fetch voices from the voice library API
 * @param filters - Optional filters for provider, language, gender, category
 * @returns Array of voice data
 */
export const getVoices = async (filters?: VoiceFilters): Promise<VoiceData[]> => {
  const params = new URLSearchParams();

  if (filters?.provider) {
    params.append('provider', filters.provider);
  }

  if (filters?.language) {
    params.append('language', filters.language);
  }

  if (filters?.gender) {
    params.append('gender', filters.gender);
  }

  if (filters?.category) {
    params.append('category', filters.category);
  }

  const queryString = params.toString();
  const url = `/voice-library/voices${queryString ? `?${queryString}` : ''}`;

  const response = await api.get<VoicesResponse>(url);
  return response.voices;
};

/**
 * Get preview URL for a specific voice
 * @param voiceId - The voice ID
 * @param text - Optional custom text for preview
 * @returns Preview audio URL
 */
export const getVoicePreviewUrl = (voiceId: string, text?: string): string => {
  const params = new URLSearchParams();
  if (text) {
    params.append('text', text);
  }
  const queryString = params.toString();
  return `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/voice-library/voices/${voiceId}/preview${queryString ? `?${queryString}` : ''}`;
};

/**
 * Clone a voice using audio files
 * @param name - Name for the cloned voice
 * @param files - Audio files for cloning
 * @param description - Optional description
 * @returns Cloned voice information
 */
export const cloneVoice = async (
  name: string,
  files: File[],
  description?: string
): Promise<VoiceData> => {
  const formData = new FormData();
  formData.append('name', name);

  if (description) {
    formData.append('description', description);
  }

  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await api.upload<{ voice: VoiceData }>('/voice-library/voices/clone', formData);

  return response.voice;
};

/**
 * Delete a cloned voice
 * @param voiceId - The voice ID to delete
 * @returns Success status
 */
export const deleteVoice = async (voiceId: string): Promise<boolean> => {
  const response = await api.delete<{ success: boolean }>(`/voice-library/voices/${voiceId}`);
  return response.success;
};

/**
 * Fetch all available voices for agent creation (VAPI, ElevenLabs, etc.)
 * @param filters - Optional filters
 * @returns List of voices with full details
 */
export interface AvailableVoice {
  id: string;
  name: string;
  provider: string;
  gender: string;
  accent: string;
  age?: number;
  language: string;
  characteristics: string[];
  sampleUrl?: string;
  previewUrl?: string;
  category: string;
}

export interface AvailableVoicesResponse {
  voices: AvailableVoice[];
  categories: string[];
  total: number;
}

export const getAvailableVoices = async (filters?: {
  provider?: string;
  gender?: string;
  language?: string;
}): Promise<AvailableVoicesResponse> => {
  const params = new URLSearchParams();

  if (filters?.provider) params.append('provider', filters.provider);
  if (filters?.gender) params.append('gender', filters.gender);
  if (filters?.language) params.append('language', filters.language);

  const queryString = params.toString();
  const endpoint = queryString ? `/api/voices?${queryString}` : '/api/voices';

  const response = await api.get<AvailableVoicesResponse>(endpoint);
  return response;
};

/**
 * Get voice configuration for VAPI based on provider
 */
export function getVoiceConfig(voice: AvailableVoice): any {
  switch (voice.provider) {
    case 'vapi':
      return {
        provider: 'vapi',
        voiceId: voice.id
      };
    case 'cartesia':
      return {
        provider: 'cartesia',
        voiceId: voice.id,
        model: 'sonic-english'
      };
    case 'eleven-labs':
      return {
        provider: '11labs',
        voiceId: voice.id,
        model: 'eleven_multilingual_v2',
        stability: 0.5,
        similarityBoost: 0.75
      };
    case 'azure':
      return {
        provider: 'azure',
        voiceId: voice.id
      };
    case 'openai':
      return {
        provider: 'openai',
        voice: voice.id
      };
    default:
      return {
        provider: voice.provider,
        voiceId: voice.id
      };
  }
}
