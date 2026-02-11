import { useMemo } from 'react';
import { getAgentAvatar } from '@/services/avatarService';

interface UseAgentAvatarOptions {
  customUrl?: string;
  index?: number;
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
  const { customUrl, index } = options;

  const avatarUrl = useMemo(() => {
    return getAgentAvatar(agentName, customUrl, index);
  }, [agentName, customUrl, index]);

  return {
    avatarUrl,
    isCustom: !!customUrl,
  };
};
