import insforge, { isInsForgeConfigured } from '@/lib/insforge';
import { apiRequest, setAuthToken, removeAuthToken, getAuthToken } from '@/lib/api';

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
  refreshToken?: string;
  requiresEmailVerification?: boolean;
}

const REFRESH_TOKEN_KEY = 'dhansetuRefreshToken';
const getRefreshToken = () => sessionStorage.getItem(REFRESH_TOKEN_KEY);
const setRefreshToken = (token?: string | null) => {
  if (token) sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
  else sessionStorage.removeItem(REFRESH_TOKEN_KEY);
};
const removeRefreshToken = () => sessionStorage.removeItem(REFRESH_TOKEN_KEY);

const asRecord = (value: unknown): Record<string, unknown> => (
  value && typeof value === 'object' ? value as Record<string, unknown> : {}
);

const normalizeInsForgeUser = (value: unknown): User => {
  const raw = asRecord(value);
  const profile = asRecord(raw.profile);
  const metadata = asRecord(raw.metadata);
  const stats = asRecord(profile.stats || metadata.stats);
  const gamification = asRecord(profile.gamification || metadata.gamification);
  const preferences = asRecord(profile.preferences || metadata.preferences);

  return {
    id: String(raw.id || ''),
    fullName: String(profile.name || profile.fullName || raw.email || 'DhanSetu user'),
    email: String(raw.email || ''),
    avatar: typeof profile.avatar_url === 'string' ? profile.avatar_url : undefined,
    isVerified: Boolean(raw.emailVerified ?? raw.email_verified),
    preferences: {
      currency: String(preferences.currency || 'INR'),
      language: String(preferences.language || 'en'),
      notifications: preferences.notifications !== false,
    },
    stats: {
      totalTransactions: Number(stats.totalTransactions || 0),
      totalIncome: Number(stats.totalIncome || 0),
      totalExpenses: Number(stats.totalExpenses || 0),
      currentStreak: Number(stats.currentStreak || 0),
    },
    gamification: {
      level: Number(gamification.level || 1),
      xp: Number(gamification.xp || 0),
      badges: Array.isArray(gamification.badges) ? gamification.badges.map(String) : [],
      achievements: Array.isArray(gamification.achievements) ? gamification.achievements.map(String) : [],
    },
  };
};

const liveFailure = (message: string, error?: unknown) => ({
  success: false,
  message,
  error: error instanceof Error ? error.message : String(error || message),
});

class AuthService {
  private storeTokens(data: { token?: string | null; refreshToken?: string | null }) {
    if (data.token) setAuthToken(data.token);
    setRefreshToken(data.refreshToken);
  }

  async login(credentials: LoginCredentials) {
    if (isInsForgeConfigured && insforge) {
      try {
        const { data, error } = await insforge.auth.signInWithPassword(credentials);
        if (error || !data) return liveFailure(error?.message || 'Unable to sign in');
        this.storeTokens({ token: data.accessToken, refreshToken: data.refreshToken });
        return {
          success: true,
          message: 'Signed in to your live DhanSetu workspace.',
          data: { user: normalizeInsForgeUser(data.user), token: data.accessToken, refreshToken: data.refreshToken },
        };
      } catch (error) {
        return liveFailure('Unable to sign in to InsForge.', error);
      }
    }

    try {
      const response = await apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: credentials });
      if (response.success && response.data) this.storeTokens(response.data);
      return response;
    } catch (error) {
      console.error('Login error:', error);
      return liveFailure('Login failed', error);
    }
  }

  async signup(userData: SignupData) {
    if (isInsForgeConfigured && insforge) {
      try {
        const { data, error } = await insforge.auth.signUp({
          email: userData.email,
          password: userData.password,
          name: userData.fullName,
          redirectTo: `${window.location.origin}/`,
        });
        if (error || !data) return liveFailure(error?.message || 'Unable to create account');
        this.storeTokens({ token: data.accessToken, refreshToken: data.refreshToken });
        return {
          success: true,
          message: data.requireEmailVerification
            ? 'Account created. Please verify your email, then sign in.'
            : 'Your live DhanSetu account is ready.',
          data: {
            user: normalizeInsForgeUser(data.user),
            token: data.accessToken || '',
            refreshToken: data.refreshToken,
          },
          requiresEmailVerification: Boolean(data.requireEmailVerification),
        };
      } catch (error) {
        return liveFailure('Unable to create your InsForge account.', error);
      }
    }

    try {
      const response = await apiRequest<AuthResponse>('/auth/register', { method: 'POST', body: userData });
      if (response.success && response.data) this.storeTokens(response.data);
      return response;
    } catch (error) {
      console.error('Signup error:', error);
      return liveFailure('Signup failed', error);
    }
  }

  async logout() {
    try {
      if (isInsForgeConfigured && insforge) {
        await insforge.auth.signOut();
      } else {
        await apiRequest('/auth/logout', { method: 'POST', requireAuth: true });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeAuthToken();
      removeRefreshToken();
    }
  }

  async getCurrentUser() {
    if (isInsForgeConfigured && insforge) {
      try {
        const { data, error } = await insforge.auth.getCurrentUser();
        if (error) return liveFailure('Unable to restore your InsForge session.', error);
        if (!data.user) return liveFailure('No active InsForge session.');
        return { success: true, message: 'Session restored.', data: normalizeInsForgeUser(data.user) };
      } catch (error) {
        return liveFailure('Unable to restore your InsForge session.', error);
      }
    }

    try {
      const response = await apiRequest<User | { user: User }>('/auth/me', { method: 'GET', requireAuth: true });
      if (response.success && response.data && 'user' in response.data) return { ...response, data: response.data.user };
      return response;
    } catch (error) {
      console.error('Get current user error:', error);
      return liveFailure('Failed to get user info', error);
    }
  }

  async updateProfile(userData: Partial<User>) {
    if (isInsForgeConfigured && insforge) {
      try {
        const profile: Record<string, unknown> = {};
        if (userData.fullName !== undefined) profile.name = userData.fullName;
        if (userData.avatar !== undefined) profile.avatar_url = userData.avatar;
        if (userData.preferences !== undefined) profile.preferences = userData.preferences;
        if (userData.stats !== undefined) profile.stats = userData.stats;
        if (userData.gamification !== undefined) profile.gamification = userData.gamification;
        const { data, error } = await insforge.auth.setProfile(profile);
        if (error || !data) return liveFailure(error?.message || 'Unable to update profile');
        return { success: true, message: 'Profile updated in your live workspace.', data: normalizeInsForgeUser({ ...data, email: userData.email }) };
      } catch (error) {
        return liveFailure('Unable to update your InsForge profile.', error);
      }
    }

    try {
      return await apiRequest<User>('/user/profile', { method: 'PUT', body: userData, requireAuth: true });
    } catch (error) {
      console.error('Update profile error:', error);
      return liveFailure('Failed to update profile', error);
    }
  }

  async changePassword(oldPassword: string, newPassword: string) {
    if (isInsForgeConfigured) {
      return liveFailure('Password changes are managed from the InsForge account settings.');
    }
    try {
      return await apiRequest('/auth/change-password', { method: 'POST', body: { oldPassword, newPassword }, requireAuth: true });
    } catch (error) {
      console.error('Change password error:', error);
      return liveFailure('Failed to change password', error);
    }
  }

  async resetPassword(email: string) {
    if (isInsForgeConfigured && insforge) {
      try {
        const { data, error } = await insforge.auth.sendResetPasswordEmail({
          email,
          redirectTo: `${window.location.origin}/`,
        });
        if (error || !data) return liveFailure(error?.message || 'Unable to send reset email');
        return { success: true, message: data.message || 'Password reset email sent.' };
      } catch (error) {
        return liveFailure('Unable to send the InsForge reset email.', error);
      }
    }
    try {
      return await apiRequest('/auth/reset-password', { method: 'POST', body: { email } });
    } catch (error) {
      console.error('Reset password error:', error);
      return liveFailure('Failed to reset password', error);
    }
  }

  isAuthenticated(): boolean {
    return isInsForgeConfigured ? Boolean(insforge) : Boolean(getAuthToken());
  }

  async refreshToken() {
    if (isInsForgeConfigured && insforge) {
      try {
        const { data, error } = await insforge.auth.refreshSession();
        if (error || !data) return liveFailure(error?.message || 'Unable to refresh InsForge session');
        this.storeTokens({ token: data.accessToken, refreshToken: data.refreshToken });
        return { success: true, message: 'Session refreshed.', data: { token: data.accessToken, refreshToken: data.refreshToken } };
      } catch (error) {
        return liveFailure('Failed to refresh InsForge session.', error);
      }
    }

    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) return { success: false, message: 'No refresh token available' };
      const response = await apiRequest<{ token: string; refreshToken?: string }>('/auth/refresh', {
        method: 'POST', body: { refreshToken }, requireAuth: true,
      });
      if (response.success && response.data) this.storeTokens(response.data);
      return response;
    } catch (error) {
      console.error('Refresh token error:', error);
      return liveFailure('Failed to refresh token', error);
    }
  }
}

export const authService = new AuthService();
export default authService;
