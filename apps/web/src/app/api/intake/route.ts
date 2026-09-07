import { NextRequest, NextResponse } from 'next/server';
import { prisma, isDatabaseConfigured } from '@/lib/prisma';
import { hasAdminAccess, requireApiActor } from '@/lib/apiAuth';
import { ensureActorUser } from '@/lib/commsServer';
import { levelFromXp } from '@/lib/gamification';

type IntakeAnswer = { questionId: string; value: unknown };

function asBool(value: unknown) {
  return value === true || value === 'true' || value === '1';
}

function buildSuggestedTasks(answers: IntakeAnswer[]) {
  const answerMap = new Map(answers.map((a) => [a.questionId, a.value]));
  const tasks: Array<{ title: string; description: string; priority?: string }> = [
    {
      title: 'Finalize reunion timeline',
      description: 'Publish the working plan and ownership timeline for all committees.',
      priority: 'HIGH',
    },
    {
      title: 'Confirm guest communication plan',
      description: 'Set announcement cadence, reminders, and RSVP follow-up owners.',
      priority: 'MEDIUM',
    },
  ];

  if (asBool(answerMap.get('hasVenue'))) {
    tasks.push({
      title: 'Lock venue and parking operations',
      description: 'Confirm venue contract, parking flow, and arrival logistics.',
      priority: 'HIGH',
    });
  }
  if (asBool(answerMap.get('hasCatering'))) {
    tasks.push({
      title: 'Finalize catering menu and headcount buffer',
      description: 'Validate dietary requirements and service schedule.',
      priority: 'MEDIUM',
    });
  }
  if (asBool(answerMap.get('hasEntertainment'))) {
    tasks.push({
      title: 'Confirm entertainment run sheet',
      description: 'Set performer timeline, AV checks, and contingency plan.',
      priority: 'MEDIUM',
    });
  }
  if (asBool(answerMap.get('hasKidsActivities'))) {
    tasks.push({
      title: 'Set up kids activity safety coverage',
      description: 'Assign supervision, supplies, and check-in process.',
      priority: 'MEDIUM',
    });
  }
  if (asBool(answerMap.get('hasSecurity'))) {
    tasks.push({
      title: 'Finalize safety and first-aid coverage',
      description: 'Assign emergency contacts and first-aid checkpoint.',
      priority: 'HIGH',
    });
  }

  return tasks.slice(0, 12);
}

export async function POST(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { ok: false, message: 'Database is not configured.' },
      { status: 503 }
    );
  }

  const actor = requireApiActor(req);
  if (actor instanceof NextResponse) return actor;
  await ensureActorUser(prisma, actor);
  if (!hasAdminAccess(actor.roleTier)) {
    return NextResponse.json({ ok: false, message: 'Only admins can run intake.' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const answers = Array.isArray(body.answers) ? (body.answers as IntakeAnswer[]) : [];
  const suggestedTasks = buildSuggestedTasks(answers);

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    take: 5,
  });

  const fallbackCategory = categories[0] ?? (await prisma.category.create({
    data: {
      name: 'Operations',
      description: 'Default operational category',
      isCustom: false,
      color: '#C84B31',
      sortOrder: 0,
      isActive: true,
    },
  }));

  const intake = await prisma.$transaction(async (tx) => {
    const createdSession = await tx.intakeSession.create({
      data: {
        userId: actor.userId,
        answersJson: JSON.stringify(answers),
        status: 'completed',
      },
    });

    const createdTasks = [];
    for (let i = 0; i < suggestedTasks.length; i += 1) {
      const draft = suggestedTasks[i];
      const category = categories[i % categories.length] ?? fallbackCategory;
      const task = await tx.task.create({
        data: {
          title: draft.title,
          description: draft.description,
          priority: draft.priority ?? 'MEDIUM',
          status: 'TODO',
          categoryId: category.id,
          assigneeId: null,
        },
      });
      createdTasks.push(task);
    }

    const adminUsers = await tx.user.findMany({
      where: { roleTier: { in: ['SUPER_ADMIN', 'COMMITTEE_CHAIR'] } },
      select: { id: true },
    });

    await tx.notification.createMany({
      data: adminUsers.map((u) => ({
        userId: u.id,
        title: 'Intake completed',
        body: `${actor.fullName ?? actor.userId} completed intake and generated ${createdTasks.length} tasks.`,
        type: 'info',
        read: false,
      })),
      skipDuplicates: true,
    });

    const profile = await tx.gamification.upsert({
      where: { userId: actor.userId },
      create: { userId: actor.userId, xp: 100, level: levelFromXp(100), streak: 1 },
      update: {
        xp: { increment: 100 },
        streak: { increment: 1 },
      },
    });

    if (profile.level !== levelFromXp(profile.xp)) {
      await tx.gamification.update({
        where: { userId: actor.userId },
        data: { level: levelFromXp(profile.xp) },
      });
    }

    return { createdSession, createdTasks };
  });

  return NextResponse.json({
    ok: true,
    data: {
      intakeSessionId: intake.createdSession.id,
      tasksCreated: intake.createdTasks.length,
      tasks: intake.createdTasks.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        categoryId: t.categoryId,
      })),
    },
  });
}
