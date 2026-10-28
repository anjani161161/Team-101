import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { api } from "../lib/api.js";

const AuthContext = createContext(null);
let currentUserRequest;

function loadCurrentUser() {
  if (!currentUserRequest) {
    currentUserRequest = api("/auth/me").finally(() => {
      currentUserRequest = undefined;
    });
  }
  return currentUserRequest;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authUnavailable, setAuthUnavailable] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const generation = useRef(0);

  const restoreSession = useCallback(async () => {
    const requestGeneration = ++generation.current;
    setLoading(true);
    setAuthUnavailable(false);
    try {
      const data = await loadCurrentUser();
      if (generation.current !== requestGeneration) return;
      setUser(data.user);
      setSessionExpired(false);
    } catch (error) {
      if (generation.current !== requestGeneration) return;
      if (error.status === 401) {
        setUser(null);
        setSessionExpired(true);
      } else {
        setAuthUnavailable(true);
      }
    } finally {
      if (generation.current === requestGeneration) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const expireSession = () => {
      generation.current += 1;
      setUser(null);
      setAuthUnavailable(false);
      setSessionExpired(true);
      setLoading(false);
    };
    window.addEventListener("atmoswatch:session-expired", expireSession);
    void restoreSession();
    return () => window.removeEventListener("atmoswatch:session-expired", expireSession);
  }, [restoreSession]);

  const login = useCallback(async (credentials) => {
    const data = await api("/auth/login", { method: "POST", body: JSON.stringify(credentials) });
    generation.current += 1;
    setUser(data.user);
    setAuthUnavailable(false);
    setSessionExpired(false);
    setLoading(false);
    return data.user;
  }, []);

  const register = useCallback(async (details) => {
    const data = await api("/auth/register", { method: "POST", body: JSON.stringify(details) });
    generation.current += 1;
    setUser(data.user);
    setAuthUnavailable(false);
    setSessionExpired(false);
    setLoading(false);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api("/auth/logout", { method: "POST" });
    } finally {
      generation.current += 1;
      setUser(null);
      setAuthUnavailable(false);
      setSessionExpired(false);
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      authUnavailable,
      sessionExpired,
      login,
      register,
      logout,
      restoreSession,
    }),
    [user, loading, authUnavailable, sessionExpired, login, register, logout, restoreSession]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
