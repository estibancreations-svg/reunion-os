import type { RoleTier, SessionUser } from '@/types';

export const SESSION_COOKIE = 'reunion_session';
export const SESSION_VERSION = 1;
export const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

const VALID_ROLES = new Set<RoleTier>([
  'SUPER_ADMIN',
  'COMMITTEE_CHAIR',
  'VOLUNTEER',
  'GUEST',
  'MEMBER',
]);

interface SessionPayload {
  v: number;
  user: SessionUser;
  exp: number;
}

function toBase64Url(input: string) {
  if (typeof btoa === 'function') {
    return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }
  return Buffer.from(input, 'utf8').toString('base64url');
}

function fromBase64Url(input: string) {
  if (typeof atob === 'function') {
    const b64 = input.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
    return atob(b64 + pad);
  }
  return Buffer.from(input, 'base64url').toString('utf8');
}

export function isRoleTier(value: unknown): value is RoleTier {
  return VALID_ROLES.has(String(value) as RoleTier);
}

export function createSessionUser(partial: Partial<SessionUser>): SessionUser | null {
  if (!partial.userId || !isRoleTier(partial.roleTier)) return null;
  const now = Date.now();
  const expiresAt = new Date(now + SESSION_TTL_MS).toISOString();
  return {
    userId: partial.userId,
    fullName: partial.fullName ?? partial.name ?? partial.userId,
    name: partial.name ?? partial.fullName ?? partial.userId,
    email: partial.email,
    roleTier: partial.roleTier,
    assignmentId: partial.assignmentId,
    sessionVersion: SESSION_VERSION,
    issuedAt: new Date(now).toISOString(),
    expiresAt,
  };
}

export function encodeSessionCookie(user: SessionUser) {
  const exp = user.expiresAt ? new Date(user.expiresAt).getTime() : Date.now() + SESSION_TTL_MS;
  const payload: SessionPayload = {
    v: SESSION_VERSION,
    user,
    exp,
  };
  return toBase64Url(JSON.stringify(payload));
}

export function decodeSessionCookie(cookieValue?: string | null): SessionUser | null {
  if (!cookieValue) return null;
  try {
    const raw = fromBase64Url(cookieValue);
    const payload = JSON.parse(raw) as SessionPayload;
    if (!payload?.user || !payload?.exp) return null;
    if (payload.exp <= Date.now()) return null;
    const user = payload.user;
    if (!user.userId || !isRoleTier(user.roleTier)) return null;
    return {
      userId: user.userId,
      fullName: user.fullName ?? user.name ?? user.userId,
      name: user.name ?? user.fullName ?? user.userId,
      email: user.email,
      roleTier: user.roleTier,
      assignmentId: user.assignmentId,
      sessionVersion: user.sessionVersion ?? payload.v,
      issuedAt: user.issuedAt,
      expiresAt: user.expiresAt ?? new Date(payload.exp).toISOString(),
    };
  } catch {
    return null;
  }
}
