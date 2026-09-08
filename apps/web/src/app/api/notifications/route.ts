import { NextRequest, NextResponse } from 'next/server';
import { prisma, isDatabaseConfigured } from '@/lib/prisma';
import { hasAdminAccess, requireApiActor } from '@/lib/apiAuth';
import { ensureActorUser } from '@/lib/commsServer';

export async function GET(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { ok: false, message: 'Database is not configured.' },
      { status: 503 }
    );
  }

  const actor = requireApiActor(req);
  if (actor instanceof NextResponse) return actor;
  await ensureActorUser(prisma, actor);

  const requestedUserId = req.nextUrl.searchParams.get('userId')?.trim();
  const userId =
    requestedUserId && hasAdminAccess(actor.roleTier) ? requestedUserId : actor.userId;

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return NextResponse.json({
    ok: true,
    data: notifications.map((n) => ({
      id: n.id,
      notificationId: n.id,
      userId: n.userId,
      title: n.title,
      body: n.body,
      type: n.type,
      read: n.read,
      readAt: n.readAt?.toISOString() ?? null,
      createdAt: n.createdAt.toISOString(),
      severity: n.type === 'critical' ? 'CRITICAL' : n.type === 'warning' ? 'WARNING' : 'INFO',
    })),
  });
}

export async function PATCH(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { ok: false, message: 'Database is not configured.' },
      { status: 503 }
    );
  }

  const actor = requireApiActor(req);
  if (actor instanceof NextResponse) return actor;
  await ensureActorUser(prisma, actor);

  const body = await req.json().catch(() => ({}));
  const notificationId =
    typeof body.notificationId === 'string'
      ? body.notificationId
      : typeof body.id === 'string'
        ? body.id
        : '';

  if (!notificationId) {
    return NextResponse.json({ ok: false, message: 'notificationId is required' }, { status: 400 });
  }

  const existing = await prisma.notification.findUnique({
    where: { id: notificationId },
    select: { id: true, userId: true },
  });

  if (!existing) {
    return NextResponse.json({ ok: false, message: 'Notification not found.' }, { status: 404 });
  }

  if (!hasAdminAccess(actor.roleTier) && existing.userId !== actor.userId) {
    return NextResponse.json({ ok: false, message: 'Access denied.' }, { status: 403 });
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true, readAt: new Date() },
  });

  return NextResponse.json({
    ok: true,
    data: {
      id: updated.id,
      notificationId: updated.id,
      userId: updated.userId,
      title: updated.title,
      body: updated.body,
      type: updated.type,
      read: updated.read,
      readAt: updated.readAt?.toISOString() ?? null,
      createdAt: updated.createdAt.toISOString(),
      severity: updated.type === 'critical' ? 'CRITICAL' : updated.type === 'warning' ? 'WARNING' : 'INFO',
    },
  });
}
