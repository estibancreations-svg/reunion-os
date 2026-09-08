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

export async function POST(req: NextRequest) {
  if (!isDatabaseConfigured()) return unavailable();

  const actor = requireApiActor(req);
  if (actor instanceof NextResponse) return actor;
  await ensureActorUser(prisma, actor);

  const body = await req.json().catch(() => ({}));
  const channelId = typeof body.channelId === 'string' ? body.channelId.trim() : '';

  if (!channelId) {
    return NextResponse.json({ ok: false, message: 'channelId is required' }, { status: 400 });
  }

  const membership = await prisma.commsChannelMember.findUnique({
    where: { channelId_userId: { channelId, userId: actor.userId } },
    select: { userId: true },
  });

  if (!membership) {
    return NextResponse.json({ ok: false, message: 'Access denied for channel.' }, { status: 403 });
  }

  const unread = await prisma.commsMessage.findMany({
    where: {
      channelId,
      NOT: { reads: { some: { userId: actor.userId } } },
    },
    select: { id: true },
    take: 500,
  });

  if (unread.length > 0) {
    await prisma.commsMessageRead.createMany({
      data: unread.map((m) => ({ messageId: m.id, userId: actor.userId })),
      skipDuplicates: true,
    });
  }

  return NextResponse.json({ ok: true, marked: unread.length });
}
