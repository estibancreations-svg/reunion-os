import { NextRequest, NextResponse } from 'next/server';
import { prisma, isDatabaseConfigured } from '@/lib/prisma';
import { hasAdminAccess, requireApiActor } from '@/lib/apiAuth';
import { ensureActorUser } from '@/lib/commsServer';

function unavailable() {
  return NextResponse.json(
    { ok: false, message: 'Comms API requires DATABASE_URL and DIRECT_URL.' },
    { status: 503 }
  );
}

export async function GET(req: NextRequest) {
  if (!isDatabaseConfigured()) return unavailable();

  const actor = requireApiActor(req);
  if (actor instanceof NextResponse) return actor;
  await ensureActorUser(prisma, actor);

  let memberships = await prisma.commsChannelMember.findMany({
    where: { userId: actor.userId },
    include: {
      channel: {
        include: {
          members: true,
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      },
    },
    orderBy: { joinedAt: 'desc' },
  });

  if (memberships.length === 0) {
    const boot = await prisma.commsChannel.create({
      data: {
        name: 'Family HQ',
        description: 'Primary coordination channel',
        members: { create: [{ userId: actor.userId }] },
      },
      include: {
        members: true,
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    memberships = [{ channelId: boot.id, userId: actor.userId, joinedAt: new Date(), channel: boot }];
  }

  const data = memberships.map((m) => ({
    id: m.channel.id,
    name: m.channel.name,
    description: m.channel.description,
    memberUserIds: m.channel.members.map((x) => x.userId),
    lastMessageAt: m.channel.messages[0]?.createdAt.toISOString() ?? m.channel.updatedAt.toISOString(),
  }));

  return NextResponse.json({ ok: true, data });
}

export async function POST(req: NextRequest) {
  if (!isDatabaseConfigured()) return unavailable();

  const actor = requireApiActor(req);
  if (actor instanceof NextResponse) return actor;
  await ensureActorUser(prisma, actor);
  if (!hasAdminAccess(actor.roleTier)) {
    return NextResponse.json({ ok: false, message: 'Only admins can create channels.' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';

  const requestedMembers = Array.isArray(body.memberUserIds)
    ? body.memberUserIds.map((x: unknown) => String(x)).filter(Boolean)
    : [];
  const memberUserIds = Array.from(new Set([actor.userId, ...requestedMembers]));

  if (!name) {
    return NextResponse.json({ ok: false, message: 'name is required' }, { status: 400 });
  }

  const users = await prisma.user.findMany({ where: { id: { in: memberUserIds } }, select: { id: true } });
  const existingUserIds = users.map((u) => u.id);
  if (existingUserIds.length === 0) {
    return NextResponse.json({ ok: false, message: 'No valid members found.' }, { status: 400 });
  }

  const created = await prisma.commsChannel.create({
    data: {
      name,
      description,
      members: {
        create: existingUserIds.map((userId) => ({ userId })),
      },
    },
    include: { members: true },
  });

  return NextResponse.json({
    ok: true,
    data: {
      id: created.id,
      name: created.name,
      description: created.description,
      memberUserIds: created.members.map((m) => m.userId),
      lastMessageAt: created.updatedAt.toISOString(),
    },
  });
}
