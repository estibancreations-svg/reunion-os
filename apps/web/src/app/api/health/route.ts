import { NextResponse } from 'next/server';

/** Demo health — production should use Prisma aggregates */
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'reunion-os',
    version: '5.0',
    timestamp: new Date().toISOString(),
    note: 'Client store is source of truth in demo mode. Wire Prisma here for production.',
  });
}
