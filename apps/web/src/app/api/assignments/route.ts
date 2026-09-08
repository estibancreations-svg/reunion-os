import { NextResponse } from 'next/server';
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

export async function GET() {
  if (!isDatabaseConfigured()) return notConfigured();

  const assignments = await prisma.assignment.findMany({
    include: {
      user: true,
      categories: { include: { category: true } },
    },
    orderBy: { assignedAt: 'desc' },
  });

  return NextResponse.json({
    ok: true,
    data: assignments.map((a) => ({
      id: a.id,
      assignmentId: a.id,
      userId: a.userId,
      title: a.title,
      roleTier: a.roleTier,
      profile: {
        fullName: a.user.fullName,
        email: a.user.email,
      },
      assignedCategories: a.categories.map((link) => ({
        categoryId: link.category.id,
        name: link.category.name,
        color: link.category.color,
      })),
      notes: a.notes,
    })),
  });
}

export async function PATCH(req: Request) {
  if (!isDatabaseConfigured()) return notConfigured();

  const body = await req.json().catch(() => ({}));
  const assignmentId = String(body.assignmentId ?? body.id ?? '');
  const categoryIds = Array.isArray(body.categoryIds)
    ? body.categoryIds.map((id: unknown) => String(id)).filter(Boolean)
    : [];

  if (!assignmentId) {
    return NextResponse.json({ ok: false, message: 'assignmentId is required' }, { status: 400 });
  }

  const updated = await prisma.assignment.update({
    where: { id: assignmentId },
    data: {
      title: typeof body.title === 'string' ? body.title : undefined,
      roleTier: typeof body.roleTier === 'string' ? body.roleTier : undefined,
      specificResponsibilities:
        typeof body.specificResponsibilities === 'string'
          ? body.specificResponsibilities
          : undefined,
      notes: typeof body.notes === 'string' ? body.notes : undefined,
      ...(categoryIds.length
        ? {
            categories: {
              deleteMany: {},
              create: categoryIds.map((categoryId: string) => ({ categoryId })),
            },
          }
        : {}),
    },
    include: {
      user: true,
      categories: { include: { category: true } },
    },
  });

  return NextResponse.json({
    ok: true,
    data: {
      id: updated.id,
      assignmentId: updated.id,
      userId: updated.userId,
      title: updated.title,
      roleTier: updated.roleTier,
      profile: {
        fullName: updated.user.fullName,
        email: updated.user.email,
      },
      assignedCategories: updated.categories.map((link) => ({
        categoryId: link.category.id,
        name: link.category.name,
        color: link.category.color,
      })),
      notes: updated.notes,
    },
  });
}
