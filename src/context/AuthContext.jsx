import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api';
import { setToken, getToken } from '../api/client';
import { USE_API } from '../config/api';
import { ROLES } from '../constants/roles';
import {
  clearSession,
  getSessionUser,
  loginUser,
  registerUser,
  seedDefaultUsers,
  setSessionUser,
  updateUserProfile,
} from '../utils/authStorage';
import { usersApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (USE_API) {
        try {
          if (getToken()) {
            const { user: sessionUser } = await authApi.me();
            setUser(sessionUser);
          }
        } catch {
          setToken(null);
          setUser(null);
        }
      } else {
        await seedDefaultUsers();
        setUser(getSessionUser());
      }
      setLoading(false);
    };
    init();
  }, []);

  const signup = useCallback(async (credentials) => {
    if (USE_API) {
      const { user: sessionUser, token } = await authApi.register(credentials);
      setToken(token);
      setUser(sessionUser);
      return sessionUser;
    }
    const sessionUser = await registerUser(credentials);
    setSessionUser(sessionUser);
    setUser(sessionUser);
    return sessionUser;
  }, []);

  const login = useCallback(async (credentials) => {
    if (USE_API) {
      const { user: sessionUser, token } = await authApi.login(credentials);
      setToken(token);
      setUser(sessionUser);
      return sessionUser;
    }
    const sessionUser = await loginUser(credentials);
    setSessionUser(sessionUser);
    setUser(sessionUser);
    return sessionUser;
  }, []);

  const logout = useCallback(() => {
    if (USE_API) setToken(null);
    else clearSession();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (USE_API && getToken()) {
      const { user: sessionUser } = await authApi.me();
      setUser(sessionUser);
      return sessionUser;
    }
    const sessionUser = getSessionUser();
    setUser(sessionUser);
    return sessionUser;
  }, []);

  const updateProfile = useCallback(
    async (profile) => {
      if (!user) return null;
      if (USE_API) {
        const updated = await usersApi.update(user.id, profile);
        const sessionUser = {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          role: updated.role,
        };
        setUser(sessionUser);
        return sessionUser;
      }
      updateUserProfile(user.id, profile);
      const sessionUser = getSessionUser();
      setUser(sessionUser);
      return sessionUser;
    },
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      role: user?.role ?? null,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === ROLES.ADMIN,
      isCustomer: user?.role === ROLES.CUSTOMER,
      signup,
      login,
      logout,
      refreshUser,
      updateProfile,
    }),
    [user, loading, signup, login, logout, refreshUser, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
