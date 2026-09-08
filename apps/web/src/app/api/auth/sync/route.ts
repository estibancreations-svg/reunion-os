import { NextRequest, NextResponse } from 'next/server';
import { prisma, isDatabaseConfigured } from '@/lib/prisma';
import { SESSION_COOKIE, SESSION_TTL_MS, createSessionUser, encodeSessionCookie, isRoleTier } from '@/lib/session';
import type { RoleTier, SessionUser } from '@/types';

function toSafeId(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64);
}

function deriveRole(raw: unknown): RoleTier {
  if (isRoleTier(raw)) return raw;
  return 'VOLUNTEER';
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const provider = typeof body.provider === 'string' ? body.provider.toLowerCase() : 'external';
  const externalUserId = typeof body.externalUserId === 'string' ? body.externalUserId : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';

  const identityKey = externalUserId || email || phone;
  if (!identityKey) {
    return NextResponse.json({ ok: false, message: 'Missing external identity.' }, { status: 400 });
  }

  const derivedId = `ext-${toSafeId(provider)}-${toSafeId(identityKey)}`;
  let draft: Partial<SessionUser> = {
    userId: derivedId,
    fullName: fullName || email || phone || derivedId,
    name: fullName || email || phone || derivedId,
    email: email || undefined,
    roleTier: deriveRole(body.roleTier),
  };

  if (isDatabaseConfigured()) {
    const user = await prisma.user.upsert({
      where: { id: derivedId },
      create: {
        id: derivedId,
        email: email || `${derivedId}@reunion.local`,
        fullName: fullName || email || phone || derivedId,
        phone: phone || null,
        roleTier: draft.roleTier,
      },
      update: {
        fullName: fullName || email || phone || derivedId,
        phone: phone || null,
        roleTier: draft.roleTier,
        lastLoginAt: new Date(),
      },
    });

    const existingAssignment = await prisma.assignment.findFirst({
      where: { userId: user.id },
      orderBy: { assignedAt: 'desc' },
    });

    if (!existingAssignment) {
      await prisma.assignment.create({
        data: {
          userId: user.id,
          title: 'Member',
          roleTier: draft.roleTier ?? 'VOLUNTEER',
          specificResponsibilities: 'New member onboarding and communication coverage.',
          notes: `Auto-created from ${provider} login`,
          assignedBy: 'system',
        },
      });
    }

    draft = {
      userId: user.id,
      fullName: user.fullName,
      name: user.fullName,
      email: user.email,
      roleTier: deriveRole(user.roleTier),
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
