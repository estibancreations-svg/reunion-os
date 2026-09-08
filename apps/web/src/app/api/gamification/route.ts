import { NextRequest, NextResponse } from 'next/server';
import { prisma, isDatabaseConfigured } from '@/lib/prisma';
import { hasAdminAccess, requireApiActor } from '@/lib/apiAuth';
import { ensureActorUser } from '@/lib/commsServer';
import { levelFromXp } from '@/lib/gamification';
import type { BadgeId } from '@/types';

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

  const mode = req.nextUrl.searchParams.get('mode');

  if (mode === 'leaderboard') {
    if (!hasAdminAccess(actor.roleTier)) {
      return NextResponse.json({ ok: false, message: 'Access denied.' }, { status: 403 });
    }

    const rows = await prisma.user.findMany({
      include: {
        gamification: true,
        tasks: {
          where: { status: { in: ['DONE', 'COMPLETED', 'done', 'completed'] } },
          select: { id: true },
        },
        achievements: {
          select: { badgeId: true },
        },
      },
      take: 200,
    });

    const data = rows
      .map((u) => {
        const points = u.gamification?.xp ?? 0;
        return {
          userId: u.id,
          fullName: u.fullName,
          points,
          level: u.gamification?.level ?? levelFromXp(points),
          tasksCompleted: u.tasks.length,
          badges: u.achievements.length,
        };
      })
      .sort((a, b) => b.points - a.points || b.level - a.level);

    return NextResponse.json({ ok: true, data });
  }

  const requestedUserId = req.nextUrl.searchParams.get('userId')?.trim();
  const userId =
    requestedUserId && hasAdminAccess(actor.roleTier) ? requestedUserId : actor.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      gamification: true,
      tasks: {
        where: { status: { in: ['DONE', 'COMPLETED', 'done', 'completed'] } },
        select: { id: true, categoryId: true, priority: true },
      },
      achievements: {
        select: { badgeId: true },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ ok: false, message: 'User not found.' }, { status: 404 });
  }

  const points = user.gamification?.xp ?? 0;
  const level = user.gamification?.level ?? levelFromXp(points);
  const badges = user.achievements.map((a) => a.badgeId as BadgeId);

  return NextResponse.json({
    ok: true,
    data: {
      userId: user.id,
      fullName: user.fullName,
      points,
      xp: points,
      level,
      currentStreak: user.gamification?.streak ?? 0,
      streak: user.gamification?.streak ?? 0,
      tasksCompleted: user.tasks.length,
      badges,
    },
  });
}
