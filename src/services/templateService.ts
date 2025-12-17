/**
 * Template Service
 * Handles all template-related API calls
 */

import { apiClient } from '@/lib/api';

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

export interface TemplateDetail extends AgentTemplate {
  config: {
    name: string;
    type: string;
    llm_provider: string;
    model: string;
    temperature: number;
    max_tokens: number;
    first_message: string;
    first_message_mode: string;
    prompt: string;
    voice_provider: string;
    language: string;
    background_sound?: string;
    background_denoising_enabled?: boolean;
  };
  tools: Array<{
    type: string;
    name: string;
    description: string;
    parameters: Record<string, any>;
  }>;
}

export interface CreateFromTemplateRequest {
  template_id: string;
  customizations?: Record<string, any>;
}

/**
 * Fetch all available templates
 */
export async function fetchTemplates(category?: string): Promise<AgentTemplate[]> {
  try {
    const params = category ? { category } : {};
    const templates = await apiClient.get<AgentTemplate[]>('/api/templates', params);
    return templates;
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw new Error('Impossible de récupérer les templates');
  }
}

/**
 * Fetch template categories
 */
export async function fetchTemplateCategories(): Promise<string[]> {
  try {
    const categories = await apiClient.get<string[]>('/api/templates/categories');
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Impossible de récupérer les catégories');
  }
}

/**
 * Fetch detailed template information
 */
export async function fetchTemplateDetail(templateId: string): Promise<TemplateDetail> {
  try {
    const template = await apiClient.get<TemplateDetail>(`/api/templates/${templateId}`);
    return template;
  } catch (error) {
    console.error(`Error fetching template ${templateId}:`, error);
    throw new Error('Impossible de récupérer le template');
  }
}

/**
 * Create an agent from a template
 */
export async function createAgentFromTemplate(
  request: CreateFromTemplateRequest
): Promise<any> {
  try {
    const agent = await apiClient.post<any>('/api/templates/create', request);
    return agent;
  } catch (error) {
    console.error('Error creating agent from template:', error);
    throw new Error('Impossible de créer l\'agent depuis le template');
  }
}

/**
 * Preview template with customizations
 */
export async function previewTemplateCustomization(
  templateId: string,
  customizations: Record<string, any>
): Promise<TemplateDetail> {
  try {
    const result = await apiClient.post<TemplateDetail>('/api/templates/preview', {
      template_id: templateId,
      customizations
    });
    return result;
  } catch (error) {
    console.error('Error previewing template:', error);
    throw new Error('Impossible de prévisualiser le template');
  }
}

// Helper function to get icon component name from icon string
export function getTemplateIconName(icon: string): string {
  const iconMap: Record<string, string> = {
    'heart': 'Heart',
    'user': 'User',
    'calendar': 'Calendar',
    'clipboard': 'Clipboard',
    'star': 'Star',
    'trending-up': 'TrendingUp',
  };
  return iconMap[icon] || 'Bot';
}

// Helper function to get category display name
export function getCategoryDisplayName(category: string): string {
  const categoryMap: Record<string, string> = {
    'support': 'Support Client',
    'sales': 'Ventes',
    'scheduling': 'Planification',
    'data': 'Collecte de Données',
    'research': 'Recherche',
  };
  return categoryMap[category] || category;
}
