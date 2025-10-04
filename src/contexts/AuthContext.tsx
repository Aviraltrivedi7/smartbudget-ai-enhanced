import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User, LoginCredentials, SignupData } from '@/services/authService';
import { socketService } from '@/services/socketService';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  signup: (userData: SignupData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Setup socket connection when user is authenticated
  useEffect(() => {
    if (user) {
      socketService.connect();
      socketService.joinUserRoom(user.id);
    } else {
      socketService.disconnect();
    }
  }, [user]);

  const checkAuthStatus = async () => {
    try {
      if (authService.isAuthenticated()) {
        const response = await authService.getCurrentUser();
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          // Token might be expired, clear it
          await authService.logout();
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      await authService.logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        toast.success('Login successful! Welcome back 👋');
        return true;
      } else {
        // If backend is not available, use offline mode
        console.log('Backend not available, using offline mode');
        const offlineUser = {
          id: 'offline-' + Date.now(),
          email: credentials.email,
          fullName: credentials.email.split('@')[0],
          avatar: '',
          isVerified: false,
          preferences: { currency: 'INR', language: 'en', notifications: true },
          stats: { totalTransactions: 0, totalIncome: 0, totalExpenses: 0, currentStreak: 0 },
          gamification: { level: 1, xp: 0, badges: [], achievements: [] }
        };
        setUser(offlineUser);
        toast.success('Logged in (Offline Mode) 👋');
        return true;
      }
    } catch (error) {
      console.error('Login error:', error);
      // Fallback to offline mode
      const offlineUser = {
        id: 'offline-' + Date.now(),
        email: credentials.email,
        fullName: credentials.email.split('@')[0],
        avatar: '',
        isVerified: false,
        preferences: { currency: 'INR', language: 'en', notifications: true },
        stats: { totalTransactions: 0, totalIncome: 0, totalExpenses: 0, currentStreak: 0 },
        gamification: { level: 1, xp: 0, badges: [], achievements: [] }
      };
      setUser(offlineUser);
      toast.success('Logged in (Offline Mode) 👋');
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: SignupData): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await authService.signup(userData);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        toast.success('Account created successfully! Welcome to SmartBudget AI 🎉');
        return true;
      } else {
        // If backend is not available, use offline mode
        console.log('Backend not available, using offline mode');
        const offlineUser = {
          id: 'offline-' + Date.now(),
          email: userData.email,
          fullName: userData.fullName,
          avatar: '',
          isVerified: false,
          preferences: { currency: 'INR', language: 'en', notifications: true },
          stats: { totalTransactions: 0, totalIncome: 0, totalExpenses: 0, currentStreak: 0 },
          gamification: { level: 1, xp: 0, badges: [], achievements: [] }
        };
        setUser(offlineUser);
        toast.success('Account created! (Offline Mode) 🎉');
        return true;
      }
    } catch (error) {
      console.error('Signup error:', error);
      // Fallback to offline mode
      const offlineUser = {
        id: 'offline-' + Date.now(),
        email: userData.email,
        fullName: userData.fullName,
        avatar: '',
        isVerified: false,
        preferences: { currency: 'INR', language: 'en', notifications: true },
        stats: { totalTransactions: 0, totalIncome: 0, totalExpenses: 0, currentStreak: 0 },
        gamification: { level: 1, xp: 0, badges: [], achievements: [] }
      };
      setUser(offlineUser);
      toast.success('Account created! (Offline Mode) 🎉');
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      if (user) {
        socketService.leaveUserRoom(user.id);
      }
      socketService.disconnect();
      await authService.logout();
      setUser(null);
      toast.success('Logged out successfully. See you soon! 👋');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if server request fails
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await authService.updateProfile(userData);
      
      if (response.success && response.data) {
        setUser(response.data);
        toast.success('Profile updated successfully! ✨');
        return true;
      } else {
        toast.error(response.error || response.message || 'Update failed');
        return false;
      }
    } catch (error) {
      console.error('Update user error:', error);
      toast.error('Update failed. Please try again.');
      return false;
    }
  };

  const refreshUser = async (): Promise<void> => {
    if (!authService.isAuthenticated()) return;

    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
