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
const SESSION_VERSION = 1;
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

function isRoleTier(value: unknown): value is RoleTier {
  return ['SUPER_ADMIN', 'COMMITTEE_CHAIR', 'VOLUNTEER', 'GUEST', 'MEMBER'].includes(String(value));
}

function parseSession(raw: string | null): SessionUser | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<SessionUser>;
    if (!parsed || typeof parsed.userId !== 'string' || !isRoleTier(parsed.roleTier)) return null;
    const expiresAt = parsed.expiresAt ? new Date(parsed.expiresAt) : null;
    if (!expiresAt || Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) return null;
    return {
      userId: parsed.userId,
      fullName: parsed.fullName ?? parsed.name ?? parsed.userId,
      name: parsed.name ?? parsed.fullName ?? parsed.userId,
      email: parsed.email,
      roleTier: parsed.roleTier,
      assignmentId: parsed.assignmentId,
      sessionVersion: parsed.sessionVersion ?? SESSION_VERSION,
      issuedAt: parsed.issuedAt,
      expiresAt: parsed.expiresAt,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = parseSession(localStorage.getItem(SESSION_KEY));
    if (session) {
      setUser(session);
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
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
      sessionVersion: SESSION_VERSION,
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
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
