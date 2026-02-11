/**
 * Conversation Service
 * Service for managing agent conversations
 */

import { apiClient } from '@/lib/api';

export interface ConversationMessage {
  role: string;
  message: string;
  time: number;
}

export interface Conversation {
  id: string;
  assistantId: string;
  status: string;
  createdAt: string;
  endedAt?: string;
  duration?: number;
  cost?: number;
  transcript: ConversationMessage[];
  recording?: string;
  recordingUrl?: string;
  logUrl?: string;
  summary?: string;
  sentiment?: string;
  successEvaluation?: string;
  phoneNumber?: string;
  customerNumber?: string;
  messages?: any[];
  variableValues?: Record<string, any>;
}

export interface ConversationFilters {
  assistantId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  sentiment?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ConversationListResponse {
  conversations: Conversation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  error?: string; // Optional error message when VAPI is not configured
}

/**
 * Fetch conversations with filters
 */
export async function fetchConversations(
  filters: ConversationFilters = {}
): Promise<ConversationListResponse> {
  const params = new URLSearchParams();

  if (filters.assistantId && filters.assistantId !== 'all') params.append('assistant_id', filters.assistantId);
  if (filters.startDate) params.append('start_date', filters.startDate);
  if (filters.endDate) params.append('end_date', filters.endDate);
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters.sentiment && filters.sentiment !== 'all') params.append('sentiment', filters.sentiment);
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());

  const response = await apiClient.get<ConversationListResponse>(
    `/api/conversations?${params.toString()}`
  );
  return response;
}

/**
 * Fetch a single conversation by ID
 */
export async function fetchConversation(callId: string): Promise<Conversation> {
  const response = await apiClient.get<Conversation>(`/api/conversations/${callId}`);
  return response;
}

/**
 * Export conversations to CSV
 */
export async function exportConversationsCSV(filters: ConversationFilters = {}): Promise<Blob> {
  const params = new URLSearchParams();

  if (filters.assistantId && filters.assistantId !== 'all') params.append('assistant_id', filters.assistantId);
  if (filters.startDate) params.append('start_date', filters.startDate);
  if (filters.endDate) params.append('end_date', filters.endDate);
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters.sentiment && filters.sentiment !== 'all') params.append('sentiment', filters.sentiment);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const token = localStorage.getItem('access_token');

  const response = await fetch(
    `${API_BASE_URL}/api/conversations/export/csv?${params.toString()}`,
    {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to export conversations');
  }

  return response.blob();
}

/**
 * Format duration in seconds to MM:SS
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get sentiment color class
 */
export function getSentimentColor(sentiment?: string): string {
  switch (sentiment) {
    case 'positive':
      return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
    case 'negative':
      return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
    case 'neutral':
      return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800/30';
    default:
      return 'text-gray-500 bg-gray-50 dark:text-gray-500 dark:bg-gray-800/20';
  }
}

/**
 * Get status color class
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'ended':
      return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
    case 'in-progress':
      return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
    case 'failed':
      return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
    default:
      return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800/30';
  }
}
