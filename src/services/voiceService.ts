import api from '@/lib/api';

export interface VoiceData {
  id: string;
  name: string;
  accent: string;
  language: string;
  age: string;
  gender: string;
  use_case: string;
  description: string;
  preview_url: string;
  category: string;
  labels: Record<string, string>;
}

export interface VoiceFilters {
  accents?: string[];
  languages?: string[];
}

/**
 * Fetch Eleven Labs voices with optional filters
 * @param filters - Optional filters for accents and languages
 * @returns Array of voice data
 */
export const getElevenLabsVoices = async (filters?: VoiceFilters): Promise<VoiceData[]> => {
  const params = new URLSearchParams();

  if (filters?.accents && filters.accents.length > 0) {
    params.append('accents', filters.accents.join(','));
  }

  if (filters?.languages && filters.languages.length > 0) {
    params.append('languages', filters.languages.join(','));
  }

  const queryString = params.toString();
  const url = `/voices/elevenlabs${queryString ? `?${queryString}` : ''}`;

  const response = await api.get<VoiceData[]>(url);
  return response.data;
};

/**
 * Get detailed information about a specific voice
 * @param voiceId - The Eleven Labs voice ID
 * @returns Voice details
 */
export const getVoiceDetails = async (voiceId: string) => {
  const response = await api.get(`/voices/elevenlabs/${voiceId}`);
  return response.data;
};
