import { useQuery } from '@tanstack/react-query';
import { getVoices, VoiceData, VoiceFilters } from '@/services/voiceService';

/**
 * Hook to fetch and manage voices from the voice library
 * @param filters - Optional filters for provider, language, gender, category
 * @returns Query result with voices data, loading state, and error
 */
export const useVoices = (filters?: VoiceFilters) => {
  return useQuery<VoiceData[], Error>({
    queryKey: ['voices', filters],
    queryFn: () => getVoices(filters),
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    gcTime: 1000 * 60 * 60, // Keep in cache for 1 hour
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch all ElevenLabs voices
 * @returns Query result with all ElevenLabs voices
 */
export const useElevenLabsVoices = () => {
  return useVoices({
    provider: '11labs',
  });
};

/**
 * Hook to fetch African voices in French and English
 * Filters for voices with African accents in French or English
 * @returns Query result with African voices
 */
export const useAfricanVoices = () => {
  const { data: allVoices, ...rest } = useElevenLabsVoices();

  // Filter for African accents and French/English languages
  const africanVoices = allVoices?.filter((voice) => {
    const accent = voice.accent?.toLowerCase() || '';
    const language = voice.language?.toLowerCase() || '';

    // Check if accent contains African countries/regions
    const isAfricanAccent = [
      'nigerian', 'ghanaian', 'kenyan', 'south african', 'ethiopian',
      'ugandan', 'tanzanian', 'botswanan', 'namibian', 'zimbabwean',
      'senegalese', 'ivorian', 'malian', 'beninese', 'rwandan',
      'moroccan', 'algerian', 'tunisian', 'cameroonian', 'congolese',
      'gabonese', 'egyptian', 'african'
    ].some(country => accent.includes(country));

    // Check if language is French or English
    const isFrenchOrEnglish = language.startsWith('fr') || language.startsWith('en');

    return isAfricanAccent && isFrenchOrEnglish;
  });

  return {
    ...rest,
    data: africanVoices,
  };
};

/**
 * Hook to fetch voices by language
 * @param language - Language code (e.g., 'fr', 'en', 'es')
 * @returns Query result with voices in the specified language
 */
export const useVoicesByLanguage = (language: string) => {
  return useVoices({
    language,
  });
};

/**
 * Hook to fetch voices by gender
 * @param gender - Gender filter ('male', 'female', 'neutral')
 * @returns Query result with voices of the specified gender
 */
export const useVoicesByGender = (gender: string) => {
  return useVoices({
    gender,
  });
};

/**
 * Hook to fetch all voices without any filters
 * @returns Query result with all available voices
 */
export const useAllVoices = () => {
  return useVoices();
};
