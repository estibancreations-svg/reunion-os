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

async function isMember(channelId: string, userId: string) {
  const membership = await prisma.commsChannelMember.findUnique({
    where: { channelId_userId: { channelId, userId } },
    select: { userId: true },
  });
  return Boolean(membership);
}

function parseMentions(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return Array.from(new Set(input.map((x) => String(x)).filter(Boolean)));
}

export async function GET(req: NextRequest) {
  if (!isDatabaseConfigured()) return unavailable();

  const actor = requireApiActor(req);
  if (actor instanceof NextResponse) return actor;
  await ensureActorUser(prisma, actor);

  const channelId = req.nextUrl.searchParams.get('channelId')?.trim() ?? '';
  if (!channelId) {
    return NextResponse.json({ ok: false, message: 'channelId is required' }, { status: 400 });
  }

  if (!(await isMember(channelId, actor.userId))) {
    return NextResponse.json({ ok: false, message: 'Access denied for channel.' }, { status: 403 });
  }

  const since = req.nextUrl.searchParams.get('since');
  const sinceDate = since ? new Date(since) : null;

  const messages = await prisma.commsMessage.findMany({
    where: {
      channelId,
      ...(sinceDate && !Number.isNaN(sinceDate.getTime()) ? { createdAt: { gt: sinceDate } } : {}),
    },
    include: {
      sender: { select: { id: true, fullName: true } },
      reads: { select: { userId: true } },
    },
    orderBy: { createdAt: 'asc' },
    take: 300,
  });

  const data = messages.map((m) => ({
    id: m.id,
    channelId: m.channelId,
    senderUserId: m.senderUserId,
    senderName: m.sender.fullName,
    type: m.type,
    body: m.body,
    audioUrl: m.audioUrl,
    durationSec: m.durationSec ?? undefined,
    mentions: m.mentionsJson ? (JSON.parse(m.mentionsJson) as string[]) : [],
    createdAt: m.createdAt.toISOString(),
    readByUserIds: m.reads.map((r) => r.userId),
  }));

  return NextResponse.json({ ok: true, data });
}

export async function POST(req: NextRequest) {
  if (!isDatabaseConfigured()) return unavailable();

  const actor = requireApiActor(req);
  if (actor instanceof NextResponse) return actor;
  await ensureActorUser(prisma, actor);

  const body = await req.json().catch(() => ({}));
  const channelId = typeof body.channelId === 'string' ? body.channelId : '';
  const type = typeof body.type === 'string' ? body.type : 'text';
  const textBody = typeof body.body === 'string' ? body.body.trim() : '';
  const audioUrl = typeof body.audioUrl === 'string' ? body.audioUrl : undefined;
  const durationSec = typeof body.durationSec === 'number' ? Math.round(body.durationSec) : undefined;
  const mentions = parseMentions(body.mentions);

  if (!channelId) {
    return NextResponse.json({ ok: false, message: 'channelId is required' }, { status: 400 });
  }

  if (!(await isMember(channelId, actor.userId))) {
    return NextResponse.json({ ok: false, message: 'Access denied for channel.' }, { status: 403 });
  }

  if (type === 'text' && !textBody) {
    return NextResponse.json({ ok: false, message: 'body is required for text messages.' }, { status: 400 });
  }

  if (type === 'chirp' && !audioUrl) {
    return NextResponse.json({ ok: false, message: 'audioUrl is required for chirp messages.' }, { status: 400 });
  }

  const created = await prisma.commsMessage.create({
    data: {
      channelId,
      senderUserId: actor.userId,
      type,
      body: textBody,
      audioUrl,
      durationSec,
      mentionsJson: JSON.stringify(mentions),
      reads: { create: [{ userId: actor.userId }] },
    },
    include: {
      sender: { select: { id: true, fullName: true } },
      reads: { select: { userId: true } },
    },
  });

  return NextResponse.json({
    ok: true,
    data: {
      id: created.id,
      channelId: created.channelId,
      senderUserId: created.senderUserId,
      senderName: created.sender.fullName,
      type: created.type,
      body: created.body,
      audioUrl: created.audioUrl,
      durationSec: created.durationSec ?? undefined,
      mentions,
      createdAt: created.createdAt.toISOString(),
      readByUserIds: created.reads.map((r) => r.userId),
    },
  });
}
