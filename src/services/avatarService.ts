/**
 * Avatar Service
 * Generates realistic human avatar URLs using pravatar.cc
 * Provides diverse, professional human photos including African ethnicities
 */

export interface AvatarOptions {
  seed?: string;
  index?: number;
  customUrl?: string;
}

/**
 * Generate a realistic human avatar URL using pravatar.cc
 * pravatar.cc provides 70 diverse human photos
 *
 * @param name - Agent name (used for consistent avatar selection)
 * @param options - Customization options
 * @returns Avatar URL
 */
export const generateHumanAvatarUrl = (
  name: string,
  options: AvatarOptions = {}
): string => {
  const { index, customUrl } = options;

  // If custom URL provided, use it
  if (customUrl) {
    return customUrl;
  }

  // Generate a consistent index based on name if not provided
  let avatarIndex = index;
  if (avatarIndex === undefined) {
    // Create a simple hash from the name to get consistent avatar
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash) + name.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    // pravatar has 70 images, use modulo to get index 1-70
    avatarIndex = Math.abs(hash % 70) + 1;
  }

  // Return pravatar URL with specific image index
  // Size 300 for high quality
  return `https://i.pravatar.cc/300?img=${avatarIndex}`;
};

/**
 * Get agent avatar URL with fallback options
 * @param agentName - Agent name
 * @param customUrl - Optional custom avatar URL
 * @param index - Optional specific avatar index (1-70)
 */
export const getAgentAvatar = (
  agentName: string,
  customUrl?: string,
  index?: number
): string => {
  return generateHumanAvatarUrl(agentName, { customUrl, index });
};

/**
 * Generate initials avatar as fallback
 * (Kept for backward compatibility)
 */
export const generateInitialsAvatar = (name: string): string => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=256&background=random&color=fff&bold=true`;
};
