import { NextRequest, NextResponse } from 'next/server';
import { prisma, isDatabaseConfigured } from '@/lib/prisma';
import { requireApiActor } from '@/lib/apiAuth';
import { ensureActorUser } from '@/lib/commsServer';

function unavailable() {
  return NextResponse.json(
    { ok: false, message: 'Comms API requires DATABASE_URL and DIRECT_URL.' },
    { status: 503 }
  );
}

function normalizeStatus(input: unknown): 'online' | 'away' | 'offline' {
  const value = String(input ?? '').toLowerCase();
  if (value === 'online' || value === 'away') return value;
  return 'offline';
}

export async function GET(req: NextRequest) {
  if (!isDatabaseConfigured()) return unavailable();

  const actor = requireApiActor(req);
  if (actor instanceof NextResponse) return actor;
  await ensureActorUser(prisma, actor);

  const memberships = await prisma.commsChannelMember.findMany({
    where: { userId: actor.userId },
    select: { channelId: true },
  });

  const channelIds = memberships.map((m) => m.channelId);
  const memberRows = await prisma.commsChannelMember.findMany({
    where: { channelId: { in: channelIds } },
    select: { userId: true },
    distinct: ['userId'],
  });

  const memberUserIds = memberRows.map((m) => m.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: memberUserIds } },
    select: { id: true, fullName: true },
  });

  const presence = await prisma.commsPresence.findMany({
    where: { userId: { in: memberUserIds } },
    select: { userId: true, status: true, updatedAt: true },
  });

  const presenceByUser = new Map(presence.map((p) => [p.userId, p]));
  const data = users.map((u) => {
    const p = presenceByUser.get(u.id);
    return {
      userId: u.id,
      userName: u.fullName,
      status: normalizeStatus(p?.status),
      updatedAt: p?.updatedAt.toISOString() ?? new Date(0).toISOString(),
    };
  });

  return NextResponse.json({ ok: true, data });
}

export async function PATCH(req: NextRequest) {
  if (!isDatabaseConfigured()) return unavailable();

  const actor = requireApiActor(req);
  if (actor instanceof NextResponse) return actor;
  await ensureActorUser(prisma, actor);

  const body = await req.json().catch(() => ({}));
  const status = normalizeStatus(body.status);

  const user = await prisma.user.findUnique({
    where: { id: actor.userId },
    select: { id: true, fullName: true },
  });

  if (!user) {
    return NextResponse.json({ ok: false, message: 'Unknown actor user.' }, { status: 404 });
  }

  const updated = await prisma.commsPresence.upsert({
    where: { userId: actor.userId },
    create: { userId: actor.userId, status },
    update: { status },
  });

  return NextResponse.json({
    ok: true,
    data: {
      userId: user.id,
      userName: user.fullName,
      status: normalizeStatus(updated.status),
      updatedAt: updated.updatedAt.toISOString(),
    },
  });
}
