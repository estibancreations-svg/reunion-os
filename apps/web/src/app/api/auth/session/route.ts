import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, decodeSessionCookie } from '@/lib/session';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = decodeSessionCookie(token);

  if (!session) {
    const res = NextResponse.json({ ok: false, message: 'No active session.' }, { status: 401 });
    res.cookies.delete(SESSION_COOKIE);
    return res;
  }

  return NextResponse.json({ ok: true, data: session });
}
