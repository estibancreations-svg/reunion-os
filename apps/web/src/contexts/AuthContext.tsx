'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { SessionUser, RoleTier } from '../types';
import { getAssignments } from '../lib/store';

interface AuthContextValue {
  user: SessionUser | null;
  isLoading: boolean;
  loginAs: (userId: string) => void;
  logout: () => void;
  hasRole: (...roles: RoleTier[]) => boolean;
  canEditMatrix: boolean;
  canRunIntake: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const SESSION_KEY = 'reunion.v3.session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch { /* ignore */ }
    setIsLoading(false);
  }, []);

  const loginAs = useCallback((userId: string) => {
    const assignment = getAssignments().find((a) => a.userId === userId);
    if (!assignment) return;
    const session: SessionUser = {
      userId: assignment.userId,
      fullName: assignment.profile?.fullName ?? assignment.userName ?? assignment.userId,
      name: assignment.profile?.fullName ?? assignment.userName ?? assignment.userId,
      email: assignment.profile?.email,
      roleTier: assignment.roleTier ?? 'VOLUNTEER',
      assignmentId: assignment.assignmentId ?? assignment.id,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
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
