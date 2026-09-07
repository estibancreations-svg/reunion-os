import { NextRequest, NextResponse } from 'next/server';
import type { RoleTier } from '@/types';

const VALID_ROLES = new Set<RoleTier>(['SUPER_ADMIN', 'COMMITTEE_CHAIR', 'VOLUNTEER', 'GUEST', 'MEMBER']);

export interface ApiActor {
  userId: string;
  roleTier: RoleTier;
  fullName?: string;
  email?: string;
}

export function getApiActor(req: NextRequest): ApiActor | null {
  const userId = req.headers.get('x-demo-user-id')?.trim();
  const roleTierRaw = req.headers.get('x-demo-role-tier')?.trim() as RoleTier | null;
  const fullName = req.headers.get('x-demo-user-name')?.trim() ?? undefined;
  const email = req.headers.get('x-demo-user-email')?.trim() ?? undefined;

  if (!userId || !roleTierRaw || !VALID_ROLES.has(roleTierRaw)) return null;
  return { userId, roleTier: roleTierRaw, fullName, email };
}

export function requireApiActor(req: NextRequest): ApiActor | NextResponse {
  const actor = getApiActor(req);
  if (!actor) {
    return NextResponse.json(
      { ok: false, message: 'Missing or invalid auth headers.' },
      { status: 401 }
    );
  }
  return actor;
}

export function hasAdminAccess(roleTier: RoleTier) {
  return roleTier === 'SUPER_ADMIN' || roleTier === 'COMMITTEE_CHAIR';
}
