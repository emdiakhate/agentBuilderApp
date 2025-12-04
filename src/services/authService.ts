/**
 * Authentication Service
 * Handles user authentication, token management, and session
 */

import { apiClient, APIError } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  full_name?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

const TOKEN_KEY = 'access_token';
const USER_KEY = 'user';

class AuthService {
  /**
   * Sign up a new user
   */
  async signup(data: SignupData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/signup', data);
      this.saveAuthData(response);
      return response;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Log in an existing user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
      this.saveAuthData(response);
      return response;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<User> {
    try {
      return await apiClient.get<User>('/api/auth/me');
    } catch (error) {
      // If token is invalid, clear auth data
      if (error instanceof APIError && error.isAuthError()) {
        this.logout();
      }
      throw this.handleAuthError(error);
    }
  }

  /**
   * Log out the current user
   */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Get stored access token
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Get stored user data
   */
  getUser(): User | null {
    const userData = localStorage.getItem(USER_KEY);
    if (!userData) return null;

    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }

  /**
   * Save authentication data to localStorage
   */
  private saveAuthData(response: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, response.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
  }

  /**
   * Handle authentication errors
   */
  private handleAuthError(error: unknown): Error {
    if (error instanceof APIError) {
      if (error.statusCode === 401) {
        return new Error('Email ou mot de passe incorrect');
      }
      if (error.statusCode === 422) {
        return new Error('Données invalides. Vérifiez vos informations.');
      }
      if (error.statusCode === 409) {
        return new Error('Cet email est déjà utilisé');
      }
      return new Error(error.message);
    }

    if (error instanceof Error) {
      return error;
    }

    return new Error('Une erreur inattendue s\'est produite');
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export default for backward compatibility
export default authService;
