/**
 * Tool Service
 * Handles all tool-related API calls
 */

import { apiClient } from '@/lib/api';

export interface ToolParameterProperty {
  type: string;
  description?: string;
  enum?: string[];
}

export interface ToolParameters {
  type: string;
  properties: Record<string, ToolParameterProperty>;
  required?: string[];
}

export interface ToolMessages {
  request_start?: string;
  request_complete?: string;
  request_failed?: string;
  request_delayed?: string;
}

export interface Tool {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  type: string;
  vapi_tool_id?: string;
  function_name?: string;
  function_description?: string;
  parameters?: ToolParameters;
  server_url?: string;
  server_timeout: number;
  messages?: ToolMessages;
  async_mode: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CreateToolData {
  name: string;
  description?: string;
  type?: string;
  function_name?: string;
  function_description?: string;
  parameters?: ToolParameters;
  server_url?: string;
  server_timeout?: number;
  messages?: ToolMessages;
  async_mode?: boolean;
}

export interface UpdateToolData extends Partial<CreateToolData> {}

export interface OAuthStatus {
  connected: boolean;
  service?: string;
  expires_at?: string;
  is_expired?: boolean;
  has_refresh_token?: boolean;
  message?: string;
}

/**
 * Fetch all tools
 */
export async function fetchTools(): Promise<Tool[]> {
  try {
    const tools = await apiClient.get<Tool[]>('/api/tools');
    return tools;
  } catch (error) {
    console.error('Error fetching tools:', error);
    throw new Error('Impossible de récupérer les outils');
  }
}

/**
 * Fetch a single tool by ID
 */
export async function fetchToolById(toolId: string): Promise<Tool> {
  try {
    const tool = await apiClient.get<Tool>(`/api/tools/${toolId}`);
    return tool;
  } catch (error) {
    console.error(`Error fetching tool ${toolId}:`, error);
    throw new Error('Impossible de récupérer l\'outil');
  }
}

/**
 * Create a new tool
 */
export async function createTool(data: CreateToolData): Promise<Tool> {
  try {
    const tool = await apiClient.post<Tool>('/api/tools', data);
    return tool;
  } catch (error) {
    console.error('Error creating tool:', error);
    throw new Error('Impossible de créer l\'outil');
  }
}

/**
 * Update an existing tool
 */
export async function updateTool(toolId: string, data: UpdateToolData): Promise<Tool> {
  try {
    const tool = await apiClient.patch<Tool>(`/api/tools/${toolId}`, data);
    return tool;
  } catch (error) {
    console.error(`Error updating tool ${toolId}:`, error);
    throw new Error('Impossible de mettre à jour l\'outil');
  }
}

/**
 * Delete a tool
 */
export async function deleteTool(toolId: string): Promise<void> {
  try {
    await apiClient.delete(`/api/tools/${toolId}`);
  } catch (error) {
    console.error(`Error deleting tool ${toolId}:`, error);
    throw new Error('Impossible de supprimer l\'outil');
  }
}

// OAuth functions

/**
 * Check Google Calendar connection status
 */
export async function checkGoogleCalendarStatus(): Promise<OAuthStatus> {
  try {
    const status = await apiClient.get<OAuthStatus>('/api/oauth/google-calendar/status');
    return status;
  } catch (error) {
    console.error('Error checking Google Calendar status:', error);
    return {
      connected: false,
      message: 'Erreur lors de la vérification du statut'
    };
  }
}

/**
 * Connect Google Calendar
 * Opens OAuth flow in new window
 */
export function connectGoogleCalendar(): void {
  const width = 600;
  const height = 700;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;

  window.open(
    'http://localhost:8000/api/oauth/google-calendar/connect',
    'Google Calendar OAuth',
    `width=${width},height=${height},left=${left},top=${top}`
  );
}

/**
 * Disconnect Google Calendar
 */
export async function disconnectGoogleCalendar(): Promise<void> {
  try {
    await apiClient.delete('/api/oauth/google-calendar/disconnect');
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error);
    throw new Error('Impossible de déconnecter Google Calendar');
  }
}

// Predefined tool templates
export const TOOL_TEMPLATES = {
  google_calendar_booking: {
    name: "Réservation Google Calendar",
    description: "Réserve des rendez-vous dans Google Calendar",
    type: "function",
    function_name: "book_appointment",
    function_description: "Réserve un rendez-vous dans le calendrier Google",
    parameters: {
      type: "object",
      properties: {
        client_name: {
          type: "string",
          description: "Nom du client"
        },
        date: {
          type: "string",
          description: "Date du rendez-vous (YYYY-MM-DD)"
        },
        time: {
          type: "string",
          description: "Heure du rendez-vous (HH:MM)"
        },
        duration: {
          type: "number",
          description: "Durée en minutes (défaut: 60)"
        },
        service: {
          type: "string",
          description: "Type de service"
        },
        notes: {
          type: "string",
          description: "Notes additionnelles"
        }
      },
      required: ["client_name", "date", "time"]
    },
    server_url: "http://localhost:8000/api/webhooks/tools/book-appointment",
    messages: {
      request_start: "Vérification des disponibilités…",
      request_complete: "Rendez-vous confirmé avec succès.",
      request_failed: "Impossible de réserver le rendez-vous.",
      request_delayed: "Le système de réservation prend un peu plus de temps que prévu…"
    }
  },
  check_availability: {
    name: "Vérifier Disponibilité",
    description: "Vérifie la disponibilité d'un créneau dans le calendrier",
    type: "function",
    function_name: "check_availability",
    function_description: "Vérifie si un créneau horaire est disponible",
    parameters: {
      type: "object",
      properties: {
        date: {
          type: "string",
          description: "Date (YYYY-MM-DD)"
        },
        time: {
          type: "string",
          description: "Heure (HH:MM)"
        },
        duration: {
          type: "number",
          description: "Durée en minutes (défaut: 60)"
        }
      },
      required: ["date", "time"]
    },
    server_url: "http://localhost:8000/api/webhooks/tools/check-availability",
    messages: {
      request_start: "Vérification de la disponibilité…",
      request_complete: "Disponibilité vérifiée.",
      request_failed: "Impossible de vérifier la disponibilité."
    }
  }
};
