"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { clearAccessToken, getAccessToken, getMe, saveAccessToken } from "@/lib/api/auth";
import type { AuthResponse, User } from "@/types/auth";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  acceptAuth: (result: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    queueMicrotask(() => {
      const token = getAccessToken();
      if (!token) { setLoading(false); return; }
      void getMe(token).then(setUser).catch(clearAccessToken).finally(() => setLoading(false));
    });
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    acceptAuth(result: AuthResponse) {
      saveAccessToken(result.access_token);
      setUser(result.user);
      window.dispatchEvent(new Event("easylife:favorites-changed"));
    },
    logout() {
      clearAccessToken();
      setUser(null);
      window.dispatchEvent(new Event("easylife:favorites-changed"));
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
