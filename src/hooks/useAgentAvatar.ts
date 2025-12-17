import { useMemo } from 'react';
import { getAgentAvatar, AvatarStyle } from '@/services/avatarService';

interface UseAgentAvatarOptions {
  customUrl?: string;
  style?: AvatarStyle;
}

/**
 * Hook to generate and manage agent avatars
 * @param agentName - Name of the agent
 * @param options - Avatar generation options
 * @returns Avatar URL (memoized for performance)
 */
export const useAgentAvatar = (
  agentName: string,
  options: UseAgentAvatarOptions = {}
) => {
  const { customUrl, style = 'avataaars' } = options;

  const avatarUrl = useMemo(() => {
    return getAgentAvatar(agentName, customUrl, style);
  }, [agentName, customUrl, style]);

  return {
    avatarUrl,
    isCustom: !!customUrl,
  };
};
