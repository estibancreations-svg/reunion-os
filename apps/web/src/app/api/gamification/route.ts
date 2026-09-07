import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  return NextResponse.json({
    ok: true,
    userId,
    message: 'Production: load GamificationProfile; leaderboard = orderBy points desc',
  });
}
