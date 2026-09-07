# Reunion OS v5

Operational system for reunion / event planning — assignments, punch lists, intake wizard, gamification, admin matrix.

## Quick start (demo)

```bash
cd apps/web
npm install
npm run dev
```

Opens at http://localhost:3000. Uses `localStorage` — no database required.

## Production (Vercel + Supabase)

1. Import this repo in Vercel.
2. **Root Directory**: `apps/web`
3. Set env vars (see `DEPLOY.md` and `.env.example`):
   - `DATABASE_URL` (Supabase pooler :6543)
   - `DIRECT_URL` (direct :5432)
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy. Run `npx prisma db push` when ready for multi-user.

## Structure

- `apps/web` — Next.js app
- `packages/types` — shared TypeScript types
- `docs/` — architecture notes

## Docs

- [DEPLOY.md](./DEPLOY.md) — Vercel + Supabase
- [GITHUB_UPLOAD.md](./GITHUB_UPLOAD.md)
- [COMPLETE_SYSTEM_UPLOAD.md](./COMPLETE_SYSTEM_UPLOAD.md)

Repo: https://github.com/estibancreations-svg/reunion-os
