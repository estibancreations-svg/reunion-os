import type { PrismaClient } from '@prisma/client';
import type { ApiActor } from './apiAuth';

export async function ensureActorUser(prisma: PrismaClient, actor: ApiActor) {
  const fullName = actor.fullName?.trim() || actor.userId;
  const email = actor.email?.trim() || `${actor.userId}@reunion.local`;

  return prisma.user.upsert({
    where: { id: actor.userId },
    create: {
      id: actor.userId,
      email,
      fullName,
      roleTier: actor.roleTier,
    },
    update: {
      fullName,
      email,
      roleTier: actor.roleTier,
      lastLoginAt: new Date(),
    },
  });
}
