import { createContext, useContext } from "react";

export type AuthContextValue = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoadingUser: boolean;
  refreshUser: () => Promise<void>;
  logout: () => void;
};

export type AuthUser = {
  id: string;
  email: string;
  role: string;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

