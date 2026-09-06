import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Business, BusinessProfile } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  businesses: Business[];
  activeBusiness: Business | null;
  activeProfile: BusinessProfile | null;
  requiresOnboarding: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  demoLogin: () => Promise<{ success: boolean; error?: string }>;
  socialLogin: (provider: 'google' | 'apple', email?: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchBusiness: (businessId: string) => Promise<void>;
  completeOnboarding: (data: any) => Promise<{ success: boolean; error?: string }>;
  refreshBusinesses: () => Promise<void>;
  updateUser: (updatedUser: User) => void;
  deleteAccount: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'venturevo_session_token';
const ACTIVE_BIZ_KEY = 'venturevo_active_biz_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(null);
  const [activeProfile, setActiveProfile] = useState<BusinessProfile | null>(null);
  const [requiresOnboarding, setRequiresOnboarding] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchActiveProfile = useCallback(async (businessId: string, currentToken: string) => {
    try {
      const res = await fetch(`/api/businesses/${businessId}/profile`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setActiveProfile(data.profile || null);
      }
    } catch (e) {
      console.error('Error fetching active profile:', e);
    }
  }, []);

  const loadSession = useCallback(async (currentToken: string) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setBusinesses(data.businesses || []);
        setRequiresOnboarding(data.requires_onboarding);

        const savedBizId = localStorage.getItem(ACTIVE_BIZ_KEY);
        const match = data.businesses?.find((b: Business) => b.id === savedBizId) || data.businesses?.[0] || null;
        setActiveBusiness(match);

        if (match) {
          localStorage.setItem(ACTIVE_BIZ_KEY, match.id);
          await fetchActiveProfile(match.id, currentToken);
        }
      } else {
        // Invalid token
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
        setBusinesses([]);
        setActiveBusiness(null);
        setActiveProfile(null);
      }
    } catch (e) {
      console.error('Error loading session:', e);
    } finally {
      setIsLoading(false);
    }
  }, [fetchActiveProfile]);

  useEffect(() => {
    if (token) {
      loadSession(token);
    } else {
      setIsLoading(false);
    }
  }, [token, loadSession]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      setRequiresOnboarding(data.requires_onboarding);
      await loadSession(data.token);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error during login' };
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Signup failed' };
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      setRequiresOnboarding(false);
      await loadSession(data.token);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error during signup' };
    }
  };

  const socialLogin = async (provider: 'google' | 'apple', email?: string, name?: string) => {
    try {
      const res = await fetch('/api/auth/social-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, email, name }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || `${provider} authentication failed` };
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      setRequiresOnboarding(false);
      await loadSession(data.token);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || `Error connecting to ${provider}` };
    }
  };

  const demoLogin = async () => {
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Demo login failed' };
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      setRequiresOnboarding(false);
      await loadSession(data.token);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Error initializing demo' };
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {
        console.error('Logout error:', e);
      }
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ACTIVE_BIZ_KEY);
    setToken(null);
    setUser(null);
    setBusinesses([]);
    setActiveBusiness(null);
    setActiveProfile(null);
    setRequiresOnboarding(false);
  };

  const switchBusiness = async (businessId: string) => {
    const selected = businesses.find((b) => b.id === businessId);
    if (selected && token) {
      setActiveBusiness(selected);
      localStorage.setItem(ACTIVE_BIZ_KEY, selected.id);
      await fetchActiveProfile(selected.id, token);
    }
  };

  const refreshBusinesses = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/businesses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBusinesses(data);
        if (!activeBusiness && data.length > 0) {
          setActiveBusiness(data[0]);
          await fetchActiveProfile(data[0].id, token);
        }
      }
    } catch (e) {
      console.error('Error refreshing businesses:', e);
    }
  };

  const completeOnboarding = async (formData: any) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    try {
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Onboarding failed' };
      }

      setRequiresOnboarding(false);
      await loadSession(token);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Onboarding submission error' };
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const deleteAccount = async () => {
    if (!token) return false;
    try {
      const res = await fetch('/api/auth/account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await logout();
        return true;
      }
    } catch (e) {
      console.error('Delete account error:', e);
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        businesses,
        activeBusiness,
        activeProfile,
        requiresOnboarding,
        isLoading,
        login,
        signup,
        demoLogin,
        socialLogin,
        logout,
        switchBusiness,
        completeOnboarding,
        refreshBusinesses,
        updateUser,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
