# Reunion OS

White-glove family operations: **Intake → Responsibility Matrix → Personal Punch-List → XP / Leaderboard / Audit**.

## Stack

- **Next.js 14** (App Router) · TypeScript · Tailwind
- **Vercel** — hosting
- **Supabase** — Postgres (Prisma schema ready)
- Demo mode: client `localStorage` (works before DB is wired)

## Quick start

```bash
cd apps/web
npm install
npm run dev
```

Sign in at `/login` (demo role picker).

## Deploy

See **[DEPLOY.md](./DEPLOY.md)** for GitHub → Supabase → Vercel.

| Service | Role |
|---------|------|
| GitHub | Source of truth |
| Vercel | Build + CDN (`apps/web` as root) |
| Supabase | Postgres via `DATABASE_URL` / `DIRECT_URL` |

## Docs

- `DEPLOY.md` — production deploy
- `COMPLETE_SYSTEM_UPLOAD.md` — full inventory & migration
- `docs/ARCHITECTURE.md` — system map

## Scripts (`apps/web`)

```bash
npm run dev
npm run build
npx prisma db push
npx prisma studio
```
