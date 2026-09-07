'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { SessionUser, RoleTier } from '../types';
import { store } from '../lib/store';

interface AuthContextValue {
  user: SessionUser | null;
  isLoading: boolean;
  loginAs: (userId: string) => Promise<boolean>;
  logout: () => Promise<void>;
  hasRole: (...roles: RoleTier[]) => boolean;
  canEditMatrix: boolean;
  canRunIntake: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store' });
        const json = await res.json().catch(() => ({}));
        if (mounted && res.ok && json?.ok && json?.data?.userId) {
          setUser(json.data as SessionUser);
          store.setCurrentUser(json.data.userId as string);
        }
      } catch {
        // ignore
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const loginAs = useCallback(async (userId: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok || !json?.data?.userId) return false;
      const session = json.data as SessionUser;
      setUser(session);
      store.setCurrentUser(session.userId);
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    store.setCurrentUser(null);
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (...roles: RoleTier[]) => (user ? roles.includes(user.roleTier) : false),
    [user]
  );

  const canEditMatrix = hasRole('SUPER_ADMIN', 'COMMITTEE_CHAIR');
  const canRunIntake = hasRole('SUPER_ADMIN', 'COMMITTEE_CHAIR');

  return (
    <AuthContext.Provider value={{ user, isLoading, loginAs, logout, hasRole, canEditMatrix, canRunIntake }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
