import { NextRequest, NextResponse } from 'next/server';
import { prisma, isDatabaseConfigured } from '@/lib/prisma';
import { SEED_ASSIGNMENTS } from '@/lib/seed';
import { SESSION_COOKIE, SESSION_TTL_MS, createSessionUser, encodeSessionCookie } from '@/lib/session';
import type { SessionUser, RoleTier } from '@/types';

function roleFromAssignment(raw?: string): RoleTier {
  const value = String(raw ?? '').toUpperCase();
  if (value === 'SUPER_ADMIN' || value === 'COMMITTEE_CHAIR' || value === 'VOLUNTEER' || value === 'GUEST' || value === 'MEMBER') {
    return value;
  }
  if (value.includes('LEAD') || value.includes('CHAIR')) return 'COMMITTEE_CHAIR';
  return 'VOLUNTEER';
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const userId = typeof body.userId === 'string' ? body.userId.trim() : '';

  if (!userId) {
    return NextResponse.json({ ok: false, message: 'userId is required' }, { status: 400 });
  }

  let draft: Partial<SessionUser> | null = null;

  if (isDatabaseConfigured()) {
    const assignment = await prisma.assignment.findFirst({
      where: { userId },
      include: { user: true },
      orderBy: { assignedAt: 'desc' },
    });

    if (assignment) {
      draft = {
        userId: assignment.userId,
        fullName: assignment.user.fullName,
        name: assignment.user.fullName,
        email: assignment.user.email,
        roleTier: roleFromAssignment(assignment.roleTier),
        assignmentId: assignment.id,
      };
    } else {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        draft = {
          userId: user.id,
          fullName: user.fullName,
          name: user.fullName,
          email: user.email,
          roleTier: roleFromAssignment(user.roleTier),
        };
      }
    }
  }

  if (!draft) {
    const fallback = SEED_ASSIGNMENTS.find((a) => a.userId === userId);
    if (!fallback) {
      return NextResponse.json({ ok: false, message: 'User assignment not found.' }, { status: 404 });
    }
    draft = {
      userId: fallback.userId,
      fullName: fallback.userName ?? fallback.userId,
      name: fallback.userName ?? fallback.userId,
      email: `${fallback.userId}@reunion.local`,
      roleTier: roleFromAssignment(fallback.role),
      assignmentId: fallback.id,
    };
  }

  const session = createSessionUser(draft);
  if (!session) {
    return NextResponse.json({ ok: false, message: 'Unable to create session.' }, { status: 400 });
  }

  const token = encodeSessionCookie(session);
  const res = NextResponse.json({ ok: true, data: session });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });

  return res;
}
