// =============================================
// Deck Estimator — Auth Context & Hook
// =============================================

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { getErrorMessage } from '../../../api/apiErrors';
import {
  setStoredToken,
  clearStoredToken,
  getStoredToken,
  getStoredSession,
  setStoredSession,
} from '../../../api/client';

const AuthContext = createContext(null);
const SESSION_SYNC_KEY = 'drp_session_sync';

function broadcastSessionSync() {
  try {
    localStorage.setItem(SESSION_SYNC_KEY, String(Date.now()));
  } catch {
    // Ignore storage restriction
  }
}

export function AuthProvider({ children }) {
  const initialToken = typeof window !== 'undefined' ? getStoredToken() : null;
  const initialSession = initialToken ? getStoredSession() : null;

  const [user, setUser] = useState(initialSession?.user || null);
  const [contractorProfile, setContractorProfile] = useState(initialSession?.contractorProfile || null);
  // If both JWT token and cached session snapshot exist, render UI immediately without blocking on "Verifying session..."
  const [loading, setLoading] = useState(Boolean(initialToken) && !initialSession?.user);
  const [error, setError] = useState(null);

  const refreshUser = useCallback(async (nextUser = null, nextContractorProfile = undefined) => {
    if (nextUser && typeof nextUser === 'object') {
      const resolvedContractor =
        nextContractorProfile !== undefined ? nextContractorProfile : contractorProfile;
      setUser(nextUser);
      if (nextContractorProfile !== undefined) {
        setContractorProfile(nextContractorProfile);
      }
      setStoredSession(nextUser, resolvedContractor || null);
      broadcastSessionSync();
      return { user: nextUser, contractorProfile: resolvedContractor || null };
    }

    try {
      const response = await authApi.getMe();
      if (response?.data) {
        setUser(response.data.user);
        setContractorProfile(response.data.contractorProfile || null);
        setStoredSession(response.data.user, response.data.contractorProfile || null);
        return response.data;
      }
    } catch {
      // ignore
    }
    return null;
  }, [contractorProfile]);

  // Load / silently revalidate current session on mount
  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const token = getStoredToken();
      if (!token) {
        if (mounted) {
          setUser(null);
          setContractorProfile(null);
          setStoredSession(null);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await authApi.getMe();
        if (mounted && response?.data) {
          setUser(response.data.user);
          setContractorProfile(response.data.contractorProfile || null);
          setStoredSession(response.data.user, response.data.contractorProfile || null);
        }
      } catch (err) {
        // Clear session on invalid/expired/unauthorized response
        if (err?.status === 401 || err?.status === 403 || err?.status === 404 || !initialSession?.user) {
          clearStoredToken();
          if (mounted) {
            setUser(null);
            setContractorProfile(null);
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  // Sync auth state across tabs and recover cleanly when session cookie clears or expires
  useEffect(() => {
    const handleUnauthorized = () => {
      if (user) {
        refreshUser();
      }
    };
    const handleStorage = (e) => {
      if (e.key === SESSION_SYNC_KEY) {
        refreshUser();
      }
    };
    window.addEventListener('drp:unauthorized', handleUnauthorized);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('drp:unauthorized', handleUnauthorized);
      window.removeEventListener('storage', handleStorage);
    };
  }, [user, refreshUser]);

  const login = useCallback(async (credentials) => {
    setError(null);
    try {
      const response = await authApi.login(credentials);
      if (response?.data) {
        if (response.data.token) {
          setStoredToken(response.data.token);
        }
        setUser(response.data.user);
        setContractorProfile(response.data.contractorProfile || null);
        setStoredSession(response.data.user, response.data.contractorProfile || null);
        broadcastSessionSync();
        return response.data;
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw err;
    }
  }, []);

  const adminLogin = useCallback(async (credentials) => {
    setError(null);
    try {
      const response = await authApi.adminLogin(credentials);
      if (response?.data) {
        if (response.data.token) {
          setStoredToken(response.data.token);
        }
        setUser(response.data.user);
        setContractorProfile(null);
        setStoredSession(response.data.user, null);
        broadcastSessionSync();
        return response.data;
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw err;
    }
  }, []);

  const register = useCallback(async (userData) => {
    setError(null);
    try {
      const response = await authApi.register(userData);
      if (response?.data) {
        if (response.data.token) {
          setStoredToken(response.data.token);
        }
        setUser(response.data.user);
        setContractorProfile(response.data.contractorProfile || null);
        setStoredSession(response.data.user, response.data.contractorProfile || null);
        broadcastSessionSync();
        return response.data;
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearStoredToken();
      setUser(null);
      setContractorProfile(null);
      broadcastSessionSync();
    }
  }, []);

  const value = {
    user,
    contractorProfile,
    setContractorProfile,
    loading,
    error,
    isAuthenticated: !!user,
    isCustomer: user?.role === 'customer',
    isContractor: user?.role === 'contractor',
    isAdmin: user?.role === 'admin',
    login,
    adminLogin,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
