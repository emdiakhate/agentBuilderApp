/**
 * Agent Service
 * Handles all agent-related API calls
 */

import { apiClient } from '@/lib/api';
import { AgentType, AgentStatus } from '@/types/agent';

// Backend agent response interface
interface BackendAgent {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  type: string;
  status: string;
  avatar: string | null;
  llm_provider: string | null;
  model: string | null;
  temperature: number | null;
  max_tokens: number | null;
  voice: string | null;
  voice_provider: string | null;
  custom_voice_id: string | null;
  voice_traits: any;
  purpose: string | null;
  prompt: string | null;
  industry: string | null;
  custom_industry: string | null;
  bot_function: string | null;
  custom_function: string | null;
  channels: string[] | null;
  channel_configs: any;
  phone: string | null;
  email: string | null;
  avm_score: number | null;
  interactions: number | null;
  csat: number | null;
  performance: number | null;
  total_calls: number | null;
  average_rating: number | null;
  language: string | null;
  timezone: string | null;
  capabilities: any;
  is_online: boolean | null;
  response_time: string | null;
  created_at: string;
  updated_at: string;
}

interface CreateAgentData {
  name: string;
  description?: string;
  type: string;
  llm_provider?: string;
  model?: string;
  temperature?: number;
  purpose?: string;
  language?: string;
  status?: string;
}

interface UpdateAgentData extends Partial<CreateAgentData> {
  avatar?: string;
  voice?: string;
  voice_provider?: string;
  channels?: string[];
  phone?: string;
  email?: string;
  prompt?: string;
}

/**
 * Map backend agent to frontend AgentType
 */
function mapBackendAgentToFrontend(agent: BackendAgent): AgentType {
  return {
    id: agent.id,
    name: agent.name,
    description: agent.description || '',
    type: agent.type as any,
    status: (agent.status || 'draft') as AgentStatus,
    createdAt: agent.created_at,
    updatedAt: agent.updated_at,
    model: agent.model || undefined,
    voice: agent.voice || undefined,
    voiceProvider: agent.voice_provider || undefined,
    customVoiceId: agent.custom_voice_id || undefined,
    voiceTraits: agent.voice_traits || undefined,
    avmScore: agent.avm_score || undefined,
    interactions: agent.interactions || 0,
    csat: agent.csat || undefined,
    performance: agent.performance || undefined,
    channels: agent.channels || undefined,
    channelConfigs: agent.channel_configs || undefined,
    phone: agent.phone || undefined,
    email: agent.email || undefined,
    avatar: agent.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${agent.name}`,
    purpose: agent.purpose || undefined,
    prompt: agent.prompt || undefined,
    industry: agent.industry || undefined,
    customIndustry: agent.custom_industry || undefined,
    botFunction: agent.bot_function || undefined,
    customFunction: agent.custom_function || undefined,
    totalCalls: agent.total_calls || 0,
    averageRating: agent.average_rating || undefined,
    language: agent.language || 'Français',
    timezone: agent.timezone || 'Europe/Paris',
    capabilities: agent.capabilities || [],
    isOnline: agent.is_online ?? true,
    responseTime: agent.response_time || '< 2s',
  };
}

/**
 * Fetch all agents with optional status filter
 */
export async function fetchAgents(filter: string = 'all-agents'): Promise<AgentType[]> {
  try {
    const agents = await apiClient.get<BackendAgent[]>('/api/agents');

    let filteredAgents = agents.map(mapBackendAgentToFrontend);

    // Apply frontend filters
    switch (filter) {
      case 'active-agents':
        filteredAgents = filteredAgents.filter(agent => agent.status === 'active');
        break;
      case 'inactive-agents':
        filteredAgents = filteredAgents.filter(agent => agent.status === 'inactive');
        break;
      case 'maintenance-agents':
        filteredAgents = filteredAgents.filter(agent => agent.status === 'draft');
        break;
      default:
        // all-agents - no filter
        break;
    }

    return filteredAgents;
  } catch (error) {
    console.error('Error fetching agents:', error);
    throw new Error('Impossible de récupérer les agents');
  }
}

/**
 * Fetch a single agent by ID
 */
export async function fetchAgentById(id: string): Promise<AgentType> {
  try {
    const agent = await apiClient.get<BackendAgent>(`/api/agents/${id}`);
    return mapBackendAgentToFrontend(agent);
  } catch (error) {
    console.error(`Error fetching agent ${id}:`, error);
    throw new Error(`Agent avec l'id ${id} non trouvé`);
  }
}

/**
 * Create a new agent
 */
export async function createAgent(data: CreateAgentData): Promise<AgentType> {
  try {
    const agent = await apiClient.post<BackendAgent>('/api/agents', data);
    return mapBackendAgentToFrontend(agent);
  } catch (error) {
    console.error('Error creating agent:', error);
    throw new Error('Impossible de créer l\'agent');
  }
}

/**
 * Update an existing agent
 */
export async function updateAgent(id: string, updates: UpdateAgentData): Promise<AgentType> {
  try {
    const agent = await apiClient.patch<BackendAgent>(`/api/agents/${id}`, updates);
    return mapBackendAgentToFrontend(agent);
  } catch (error) {
    console.error(`Error updating agent ${id}:`, error);
    throw new Error('Impossible de mettre à jour l\'agent');
  }
}

/**
 * Delete an agent
 */
export async function deleteAgent(id: string): Promise<void> {
  try {
    await apiClient.delete(`/api/agents/${id}`);
  } catch (error) {
    console.error(`Error deleting agent ${id}:`, error);
    throw new Error('Impossible de supprimer l\'agent');
  }
}

/**
 * Upload document for an agent
 */
export async function uploadDocument(agentId: string, file: File): Promise<any> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const result = await apiClient.upload(`/api/agents/${agentId}/documents`, formData);
    return result;
  } catch (error) {
    console.error(`Error uploading document for agent ${agentId}:`, error);
    throw new Error('Impossible d\'uploader le document');
  }
}

/**
 * Fetch documents for an agent
 */
export async function fetchAgentDocuments(agentId: string): Promise<any[]> {
  try {
    const documents = await apiClient.get<any[]>(`/api/agents/${agentId}/documents`);
    return documents;
  } catch (error) {
    console.error(`Error fetching documents for agent ${agentId}:`, error);
    throw new Error('Impossible de récupérer les documents');
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(agentId: string, documentId: string): Promise<void> {
  try {
    await apiClient.delete(`/api/agents/${agentId}/documents/${documentId}`);
  } catch (error) {
    console.error(`Error deleting document ${documentId}:`, error);
    throw new Error('Impossible de supprimer le document');
  }
}

/**
 * Chat interfaces
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface ChatResponse {
  response: string;
  conversation_id: string;
  used_rag: boolean;
  num_context_chunks: number;
}

/**
 * Send a chat message to an agent
 */
export async function sendChatMessage(
  agentId: string,
  message: string,
  conversationId?: string
): Promise<ChatResponse> {
  try {
    const response = await apiClient.post<ChatResponse>(`/api/chat/${agentId}`, {
      message,
      conversation_id: conversationId,
      use_rag: true
    });
    return response;
  } catch (error) {
    console.error(`Error sending chat message to agent ${agentId}:`, error);
    throw new Error('Impossible d\'envoyer le message');
  }
}

// Export types
export type { CreateAgentData, UpdateAgentData };
