import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json({
    ok: true,
    received: body,
    message: 'Production: persist IntakeSession, create Tasks in transaction, notify chairs.',
  });
}
