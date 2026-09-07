# Reunion OS Architecture

## Overview

Next.js 14 App Router frontend + optional Prisma/Postgres (Supabase) backend.
Demo mode uses `localStorage` via `src/lib/store.ts` so the UI works with zero config.

## Layers

1. **UI** — `apps/web/src/app` pages, `components/*`
2. **State (demo)** — `lib/store.ts` + seed data
3. **Domain** — `lib/gamification.ts`, `lib/audit.ts`, `lib/toasts.ts`
4. **Persistence (prod)** — Prisma schema → Supabase Postgres
5. **Auth (demo)** — cookie / localStorage; swap for Supabase Auth later

## Key routes

- `/` landing
- `/login`
- `/admin/*` matrix, categories, intake, activity, leaderboard
- `/user/*` punch list, notifications, achievements
- `/api/*` health, tasks, assignments, etc. (stubs ready for Prisma)

## Deploy

See `DEPLOY.md`. Root Directory on Vercel = `apps/web`.
