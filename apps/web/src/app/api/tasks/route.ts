import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  return NextResponse.json({
    ok: true,
    userId,
    message: 'Use client store in demo. Production: Prisma findMany with convergence filter.',
    convergence: 'assignedUserId = userId OR (categoryId IN userCategories AND assignedUserId null)',
  });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json({
    ok: true,
    received: body,
    message: 'Production: update task status, write audit, award XP server-side.',
  });
}
