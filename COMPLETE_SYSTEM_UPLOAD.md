# Reunion OS v5 — Complete System

See README.md and DEPLOY.md for run and deploy.

## Inventory

- packages/types — domain contracts
- apps/web — Next.js app
- prisma/schema.prisma — Supabase Postgres
- lib/store.ts — demo persistence + convergence + XP
- lib/gamification.ts — points, badges, streaks
- components — matrix, punch-list, intake, HUD

## Demo accounts

Login at /login — pick Alex Admin, Sarah, Marcus, etc.

## Production path

1. Set DATABASE_URL + DIRECT_URL (Supabase)
2. npx prisma db push
3. Wire API routes to Prisma
4. Replace AuthContext with real auth
