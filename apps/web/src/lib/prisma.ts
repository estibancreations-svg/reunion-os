import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __reunionPrisma: PrismaClient | undefined;
}

export const prisma = global.__reunionPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.__reunionPrisma = prisma;
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}
