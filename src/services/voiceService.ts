import api from '@/lib/api';

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
  return response.data.voices;
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

  const response = await api.post<{ voice: VoiceData }>('/voice-library/voices/clone', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.voice;
};

/**
 * Delete a cloned voice
 * @param voiceId - The voice ID to delete
 * @returns Success status
 */
export const deleteVoice = async (voiceId: string): Promise<boolean> => {
  const response = await api.delete<{ success: boolean }>(`/voice-library/voices/${voiceId}`);
  return response.data.success;
};
