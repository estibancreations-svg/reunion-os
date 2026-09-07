# Reunion OS v5 — Complete System

Monorepo-style layout ready for Vercel + Supabase.

## Structure

```
reunion-system/
├── apps/web/                 # Next.js 14 app (root for Vercel)
│   ├── prisma/schema.prisma
│   ├── src/
│   │   ├── app/              # App Router pages + API routes
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── lib/              # store, seed, gamification, audit, toasts
│   │   ├── middleware.ts
│   │   └── types/
│   ├── package.json
│   └── ...
├── packages/types/
├── docs/
├── DEPLOY.md
└── package.json
```

## Features included

- Landing + login (demo auth)
- Admin dashboard, assignment matrix/spreadsheet, categories, intake wizard, activity, leaderboard
- User punch-list, notifications, achievements
- Game HUD, toasts, badges, XP/level/streak
- Prisma schema for multi-user
- SEO (sitemap, robots, JSON-LD)
- Health + API route stubs
- localStorage demo store (swap for Prisma)

## Quick start (demo)

```bash
cd apps/web
npm install
npm run dev
```

Open http://localhost:3000 — works with localStorage, no backend required.

## Production path

1. Push to GitHub (this repo).
2. Create Supabase project → copy pooler + direct URIs + anon key.
3. Vercel import → Root = `apps/web` → set env vars (see DEPLOY.md).
4. `npx prisma db push`
5. Optionally replace store calls in API routes with Prisma.

## Files of note

| Path | Role |
|------|------|
| `src/lib/store.ts` | Demo persistence |
| `src/lib/seed.ts` | Seed data |
| `src/lib/gamification.ts` | XP, levels, achievements |
| `prisma/schema.prisma` | Full data model |
| `src/middleware.ts` | Basic route protection |

Ready for Vercel + Supabase.
