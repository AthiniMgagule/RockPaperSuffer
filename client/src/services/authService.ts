// src/services/authService.ts
import axios from 'axios';
import { AuthResponse, LoginCredentials, SignupData, User } from '../types/auth.types';

const AUTH_API_URL = 'http://localhost:3000/api/auth';

class AuthService {
  private api = axios.create({
    baseURL: AUTH_API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    // Add interceptor to include access token in requests
    this.api.interceptors.request.use((config) => {
      const token = this.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add interceptor to handle token refresh on 401
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newTokens = await this.refreshToken();
            if (newTokens) {
              originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            this.logout();
            window.location.href = '/';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/signup', data);
    this.setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/login', credentials);
    this.setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  }

  async refreshToken(): Promise<AuthResponse | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await axios.post<AuthResponse>(
        `${AUTH_API_URL}/refresh`,
        { refreshToken }
      );
      this.setTokens(response.data.accessToken, response.data.refreshToken);
      return response.data;
    } catch (error) {
      this.clearTokens();
      return null;
    }
  }

  async logout(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    
    try {
      if (refreshToken) {
        await this.api.post('/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await this.api.get<{ user: User }>('/me');
      return response.data.user;
    } catch (error) {
      return null;
    }
  }

  // Token management
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const authService = new AuthService();