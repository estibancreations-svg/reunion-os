import { NextResponse } from 'next/server';
import { prisma, isDatabaseConfigured } from '@/lib/prisma';

/** Demo health — production should use Prisma aggregates */
export async function GET() {
  const dbConfigured = isDatabaseConfigured();
  let db = false;
  let note = 'Client store is source of truth in demo mode. Wire Prisma here for production.';

  if (dbConfigured) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      db = true;
      note = 'Database connected.';
    } catch {
      db = false;
      note = 'Database configured but unreachable.';
    }
  }

  return NextResponse.json({
    ok: true,
    service: 'reunion-os',
    version: '5.0',
    timestamp: new Date().toISOString(),
    status: dbConfigured ? (db ? 'healthy' : 'degraded') : 'degraded',
    dbConfigured,
    db,
    auth: true,
    api: true,
    note,
  });
}
