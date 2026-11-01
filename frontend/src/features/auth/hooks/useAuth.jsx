// =============================================
// Deck Estimator — Auth Context & Hook
// =============================================

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { getErrorMessage } from '../../../api/apiErrors';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [contractorProfile, setContractorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load current session on mount
  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const response = await authApi.getMe();
        if (mounted && response?.data) {
          setUser(response.data.user);
          setContractorProfile(response.data.contractorProfile || null);
        }
      } catch {
        // Unauthenticated visitor is an expected normal state
        if (mounted) {
          setUser(null);
          setContractorProfile(null);
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

  const login = useCallback(async (credentials) => {
    setError(null);
    try {
      const response = await authApi.login(credentials);
      if (response?.data) {
        setUser(response.data.user);
        setContractorProfile(response.data.contractorProfile || null);
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
        setUser(response.data.user);
        setContractorProfile(response.data.contractorProfile || null);
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
      setUser(null);
      setContractorProfile(null);
    }
  }, []);

  const value = {
    user,
    contractorProfile,
    loading,
    error,
    isAuthenticated: !!user,
    isCustomer: user?.role === 'customer',
    isContractor: user?.role === 'contractor',
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
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
