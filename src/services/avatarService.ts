/**
 * Avatar Service
 * Generates avatar URLs using DiceBear API with African-friendly styles
 */

export type AvatarStyle = 'avataaars' | 'big-smile' | 'fun-emoji' | 'bottts';

export interface AvatarOptions {
  seed?: string;
  backgroundColor?: string[];
  style?: AvatarStyle;
}

/**
 * Generate a DiceBear avatar URL
 * @param name - Agent name (used as seed for consistency)
 * @param options - Avatar generation options
 * @returns Avatar URL
 */
export const generateAvatarUrl = (
  name: string,
  options: AvatarOptions = {}
): string => {
  const {
    seed = name,
    backgroundColor = ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'],
    style = 'avataaars',
  } = options;

  // Create URL with parameters
  const params = new URLSearchParams({
    seed: seed.toLowerCase().replace(/\s+/g, '-'),
  });

  // Add background color if provided
  if (backgroundColor && backgroundColor.length > 0) {
    params.append('backgroundColor', backgroundColor.join(','));
  }

  return `https://api.dicebear.com/7.x/${style}/svg?${params.toString()}`;
};

/**
 * Generate a placeholder avatar with initials
 * Fallback if DiceBear fails
 */
export const generateInitialsAvatar = (name: string): string => {
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Using UI Avatars as fallback
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=256&background=random&color=fff&bold=true`;
};

/**
 * Get avatar URL with fallback
 * @param name - Agent name
 * @param customUrl - Custom avatar URL (if provided by user)
 * @param style - DiceBear style to use
 * @returns Avatar URL with fallback
 */
export const getAgentAvatar = (
  name: string,
  customUrl?: string,
  style: AvatarStyle = 'avataaars'
): string => {
  // Use custom URL if provided
  if (customUrl && customUrl.trim()) {
    return customUrl;
  }

  // Generate DiceBear avatar
  return generateAvatarUrl(name, { style });
};

/**
 * African-themed color palettes for avatars
 * Inspired by African textiles and art
 */
export const AFRICAN_COLOR_PALETTES = {
  warm: ['E67E22', 'F39C12', 'C0392B', 'D35400'],
  cool: ['27AE60', '2980B9', '8E44AD', '16A085'],
  earth: ['A0522D', 'D2691E', 'CD853F', 'DEB887'],
  vibrant: ['FF6B6B', 'FFA07A', '20B2AA', 'FFD700'],
  royal: ['800080', '4B0082', 'DC143C', '8B4513'],
};

/**
 * Get a color palette based on agent type or random
 */
export const getColorPalette = (agentType?: string): string[] => {
  if (agentType) {
    const normalized = agentType.toLowerCase();
    if (normalized.includes('sales') || normalized.includes('marketing')) {
      return AFRICAN_COLOR_PALETTES.vibrant;
    }
    if (normalized.includes('support') || normalized.includes('service')) {
      return AFRICAN_COLOR_PALETTES.cool;
    }
    if (normalized.includes('technical') || normalized.includes('it')) {
      return AFRICAN_COLOR_PALETTES.earth;
    }
  }

  // Random palette
  const palettes = Object.values(AFRICAN_COLOR_PALETTES);
  return palettes[Math.floor(Math.random() * palettes.length)];
};
