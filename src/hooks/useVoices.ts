import { useQuery } from '@tanstack/react-query';
import { getElevenLabsVoices, VoiceData, VoiceFilters } from '@/services/voiceService';

/**
 * Hook to fetch and manage Eleven Labs voices
 * @param filters - Optional filters for accents and languages
 * @returns Query result with voices data, loading state, and error
 */
export const useElevenLabsVoices = (filters?: VoiceFilters) => {
  return useQuery<VoiceData[], Error>({
    queryKey: ['elevenlabs-voices', filters],
    queryFn: () => getElevenLabsVoices(filters),
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    gcTime: 1000 * 60 * 60, // Keep in cache for 1 hour
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch African voices in French and English
 * @returns Query result with African voices in French and English
 */
export const useAfricanVoices = () => {
  return useElevenLabsVoices({
    accents: ['african'],
    languages: ['french', 'english'],
  });
};

/**
 * Hook to fetch all available Eleven Labs voices without filters
 * @returns Query result with all voices
 */
export const useAllElevenLabsVoices = () => {
  return useElevenLabsVoices();
};
