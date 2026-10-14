import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { apiRequest } from "../lib/api";

const TOKEN_STORAGE_KEY = "isfairwage_token";

export interface AuthUser {
  id: string;
  email: string | null;
  full_name: string | null;
}

interface AuthPayload {
  access_token: string;
  user: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [loading, setLoading] = useState(true);

  function clearSession() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }

  function saveSession(payload: AuthPayload) {
    localStorage.setItem(TOKEN_STORAGE_KEY, payload.access_token);
    setToken(payload.access_token);
    setUser(payload.user);
  }

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!storedToken) {
      setLoading(false);
      return;
    }

    apiRequest<AuthUser>("/auth/me", { token: storedToken })
      .then((currentUser) => {
        setToken(storedToken);
        setUser(currentUser);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const payload = await apiRequest<AuthPayload>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    saveSession(payload);
  }

  async function signup(fullName: string, email: string, password: string) {
    const payload = await apiRequest<AuthPayload>("/auth/signup", {
      method: "POST",
      body: { full_name: fullName, email, password },
    });
    saveSession(payload);
  }

  const value = useMemo(
    () => ({ user, token, loading, login, signup, logout: clearSession }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}