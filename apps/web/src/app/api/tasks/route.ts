import { NextRequest, NextResponse } from 'next/server';
import { prisma, isDatabaseConfigured } from '../../../lib/prisma';

function notConfigured() {
  return NextResponse.json(
    {
      ok: false,
      message: 'Database is not configured. Set DATABASE_URL and DIRECT_URL to enable server persistence.',
    },
    { status: 503 }
  );
}

function isDoneStatus(status: string) {
  const value = status.toUpperCase();
  return value === 'DONE' || value === 'COMPLETED';
}

export async function GET(req: NextRequest) {
  if (!isDatabaseConfigured()) return notConfigured();

  const userId = req.nextUrl.searchParams.get('userId');

  const categoryIds = userId
    ? (
        await prisma.assignmentCategory.findMany({
          where: { assignment: { userId } },
          select: { categoryId: true },
        })
      ).map((x) => x.categoryId)
    : [];

  const tasks = await prisma.task.findMany({
    where: userId
      ? {
          OR: [
            { assigneeId: userId },
            {
              assigneeId: null,
              categoryId: categoryIds.length ? { in: categoryIds } : undefined,
            },
          ],
        }
      : undefined,
    include: {
      category: true,
      assignee: true,
    },
    orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
  });

  return NextResponse.json({
    ok: true,
    data: tasks.map((task) => ({
      id: task.id,
      taskId: task.id,
      userId: task.assigneeId ?? '',
      assigneeId: task.assigneeId,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      categoryId: task.categoryId,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      dueDate: task.dueDate?.toISOString() ?? null,
      categoryName: task.category?.name,
      assigneeName: task.assignee?.fullName,
      completed: isDoneStatus(task.status),
    })),
  });
}

export async function PATCH(req: NextRequest) {
  if (!isDatabaseConfigured()) return notConfigured();

  const body = await req.json().catch(() => ({}));
  const taskId = String(body.taskId ?? body.id ?? '');

  if (!taskId) {
    return NextResponse.json({ ok: false, message: 'taskId is required' }, { status: 400 });
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      status: typeof body.status === 'string' ? body.status : undefined,
      title: typeof body.title === 'string' ? body.title : undefined,
      description: typeof body.description === 'string' ? body.description : undefined,
      priority: typeof body.priority === 'string' ? body.priority : undefined,
      assigneeId:
        typeof body.assigneeId === 'string' ? body.assigneeId : body.assigneeId === null ? null : undefined,
      dueDate:
        typeof body.dueDate === 'string'
          ? new Date(body.dueDate)
          : body.dueDate === null
            ? null
            : undefined,
    },
    include: {
      category: true,
      assignee: true,
    },
  });

  return NextResponse.json({
    ok: true,
    data: {
      id: updated.id,
      taskId: updated.id,
      userId: updated.assigneeId ?? '',
      assigneeId: updated.assigneeId,
      title: updated.title,
      description: updated.description,
      status: updated.status,
      priority: updated.priority,
      categoryId: updated.categoryId,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      dueDate: updated.dueDate?.toISOString() ?? null,
      categoryName: updated.category?.name,
      assigneeName: updated.assignee?.fullName,
      completed: isDoneStatus(updated.status),
    },
  });
}
