"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { loginRequest } from "@/lib/admin-api";
import {
  clearAuthSession,
  getStoredToken,
  getStoredUser,
  persistAuthSession,
} from "@/lib/auth-storage";
import type { AuthUser, LoginCredentials } from "@/types/auth";

interface AuthSnapshot {
  user: AuthUser | null;
  token: string | null;
  ready: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthReady: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function subscribe(onStoreChange: () => void): () => void {
  const handler = (): void => onStoreChange();
  window.addEventListener("leovorno-auth-change", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("leovorno-auth-change", handler);
    window.removeEventListener("storage", handler);
  };
}

const SERVER_SNAPSHOT: AuthSnapshot = { user: null, token: null, ready: false };
let cachedClientSnapshot: AuthSnapshot = SERVER_SNAPSHOT;
let cachedUserRaw: string | null = null;
let cachedTokenRaw: string | null = null;

function getServerSnapshot(): AuthSnapshot {
  return SERVER_SNAPSHOT;
}

function getClientSnapshot(): AuthSnapshot {
  const token = getStoredToken();
  const userRaw =
    typeof window === "undefined" ? null : window.localStorage.getItem("leovorno-auth-user");

  if (
    cachedClientSnapshot.ready &&
    cachedTokenRaw === token &&
    cachedUserRaw === userRaw
  ) {
    return cachedClientSnapshot;
  }

  cachedTokenRaw = token;
  cachedUserRaw = userRaw;
  cachedClientSnapshot = {
    user: getStoredUser(),
    token,
    ready: true,
  };

  return cachedClientSnapshot;
}

export function AuthProvider({ children }: { children: ReactNode }): React.ReactElement {
  const snapshot = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthUser> => {
    const session = await loginRequest(credentials);
    persistAuthSession(session);
    window.dispatchEvent(new Event("leovorno-auth-change"));
    return session.user;
  }, []);

  const logout = useCallback((): void => {
    clearAuthSession();
    window.dispatchEvent(new Event("leovorno-auth-change"));
  }, []);

  const value = useMemo(
    () => ({
      user: snapshot.user,
      token: snapshot.token,
      isAuthReady: snapshot.ready,
      isAuthenticated: Boolean(snapshot.user && snapshot.token),
      login,
      logout,
    }),
    [snapshot, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
