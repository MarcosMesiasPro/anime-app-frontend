import { useCallback, useEffect, useMemo, useState } from 'react';

import { loginRequest, meRequest, registerRequest } from '../api/auth.api';
import { setAuthToken } from '../api/http';
import { clearStoredAuth, getStoredAuth, setStoredAuth } from '../utils/storage';
import AuthContext from './auth-context';

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => getStoredAuth());
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const stored = getStoredAuth();

      if (!stored?.token) {
        setIsBootstrapping(false);
        return;
      }

      try {
        setAuthToken(stored.token);
        const me = await meRequest();
        const nextAuth = { token: stored.token, user: me.user };
        setAuth(nextAuth);
        setStoredAuth(nextAuth);
      } catch {
        setAuth(null);
        clearStoredAuth();
        setAuthToken(null);
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrap();
  }, []);

  const persistAuth = useCallback((token, user) => {
    const nextAuth = { token, user };
    setAuth(nextAuth);
    setAuthToken(token);
    setStoredAuth(nextAuth);
    return nextAuth;
  }, []);

  const login = useCallback(
    async (payload) => {
      const response = await loginRequest(payload);
      return persistAuth(response.token, response.user);
    },
    [persistAuth],
  );

  const register = useCallback(
    async (payload) => {
      const response = await registerRequest(payload);
      return persistAuth(response.token, response.user);
    },
    [persistAuth],
  );

  const logout = useCallback(() => {
    setAuth(null);
    setAuthToken(null);
    clearStoredAuth();
  }, []);

  const value = useMemo(
    () => ({
      token: auth?.token || null,
      user: auth?.user || null,
      isAuthenticated: Boolean(auth?.token),
      isBootstrapping,
      login,
      register,
      logout,
      setAuth,
    }),
    [auth, isBootstrapping, login, logout, register],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
