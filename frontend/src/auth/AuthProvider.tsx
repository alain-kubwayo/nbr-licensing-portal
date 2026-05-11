import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/services/api";
import { AuthContext, type AuthContextValue, type AuthUser } from "./useAuth";

const TOKEN_KEY = "auth_token";

function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState(() => getToken());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  const refreshUser = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      return;
    }

    setIsLoadingUser(true);
    try {
      const res = await api.get<{ data?: AuthUser }>("/auth/me");
      const u = res.data?.data ?? null;
      setUser(u);
    } catch {
      setUser(null);
    } finally {
      setIsLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== TOKEN_KEY) return;
      const next = getToken();
      setToken(next);
      Promise.resolve().then(() => void refreshUser());
    };
    const onAuthChanged = () => {
      const next = getToken();
      setToken(next);
      Promise.resolve().then(() => void refreshUser());
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("auth:changed", onAuthChanged);
    if (token) Promise.resolve().then(() => void refreshUser());
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("auth:changed", onAuthChanged);
    };
  }, [refreshUser, token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(token),
      user,
      isLoadingUser,
      refreshUser,
      logout: () => {
        clearToken();
        setUser(null);
        window.dispatchEvent(new Event("auth:changed"));
      },
    }),
    [token, user, isLoadingUser, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

