import { apiRequest, setAuthToken, removeAuthToken, getAuthToken } from '@/lib/api';

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  avatar?: string;
  isVerified: boolean;
  preferences: {
    currency: string;
    language: string;
    notifications: boolean;
  };
  stats: {
    totalTransactions: number;
    totalIncome: number;
    totalExpenses: number;
    currentStreak: number;
  };
  gamification: {
    level: number;
    xp: number;
    badges: string[];
    achievements: string[];
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  // Login user
  async login(credentials: LoginCredentials) {
    try {
      const response = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: credentials,
      });

      if (response.success && response.data) {
        setAuthToken(response.data.token);
        return response;
      }

      return response;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed',
        error: 'Network error occurred',
      };
    }
  }

  // Register new user
  async signup(userData: SignupData) {
    try {
      const response = await apiRequest<AuthResponse>('/auth/register', {
        method: 'POST',
        body: userData,
      });

      if (response.success && response.data) {
        setAuthToken(response.data.token);
        return response;
      }

      return response;
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        message: 'Signup failed',
        error: 'Network error occurred',
      };
    }
  }

  // Logout user
  async logout() {
    try {
      await apiRequest('/auth/logout', {
        method: 'POST',
        requireAuth: true,
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeAuthToken();
    }
  }

  // Get current user profile
  async getCurrentUser() {
    try {
      const response = await apiRequest<User>('/auth/me', {
        method: 'GET',
        requireAuth: true,
      });

      return response;
    } catch (error) {
      console.error('Get current user error:', error);
      return {
        success: false,
        message: 'Failed to get user info',
        error: 'Network error occurred',
      };
    }
  }

  // Update user profile
  async updateProfile(userData: Partial<User>) {
    try {
      const response = await apiRequest<User>('/user/profile', {
        method: 'PUT',
        body: userData,
        requireAuth: true,
      });

      return response;
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: 'Failed to update profile',
        error: 'Network error occurred',
      };
    }
  }

  // Change password
  async changePassword(oldPassword: string, newPassword: string) {
    try {
      const response = await apiRequest('/auth/change-password', {
        method: 'POST',
        body: { oldPassword, newPassword },
        requireAuth: true,
      });

      return response;
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: 'Failed to change password',
        error: 'Network error occurred',
      };
    }
  }

  // Reset password
  async resetPassword(email: string) {
    try {
      const response = await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: { email },
      });

      return response;
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: 'Failed to reset password',
        error: 'Network error occurred',
      };
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!getAuthToken();
  }

  // Refresh token
  async refreshToken() {
    try {
      const response = await apiRequest<{ token: string }>('/auth/refresh', {
        method: 'POST',
        requireAuth: true,
      });

      if (response.success && response.data) {
        setAuthToken(response.data.token);
        return response;
      }

      return response;
    } catch (error) {
      console.error('Refresh token error:', error);
      return {
        success: false,
        message: 'Failed to refresh token',
        error: 'Network error occurred',
      };
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;