# Deploy Reunion OS to Vercel + Supabase

## 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. **Settings → Database**
   - Copy **Connection string → URI** (Transaction / Pooler, port **6543**) → `DATABASE_URL`
   - Copy **Direct connection** (port **5432**) → `DIRECT_URL`
3. **Settings → API**
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `anon` `public` key

Optional: run migrations later with Prisma.

## 2. GitHub

Repo: `https://github.com/estibancreations-svg/reunion-os`

Ensure `main` contains the full tree under `apps/web`.

## 3. Vercel

1. [vercel.com](https://vercel.com) → **Add New… → Project**
2. Import `estibancreations-svg/reunion-os`
3. **Root Directory**: `apps/web`
4. Framework: Next.js (auto)
5. Environment Variables (Production + Preview):

```
DATABASE_URL=<supabase pooler uri port 6543>
DIRECT_URL=<supabase direct uri port 5432>
NEXT_PUBLIC_SITE_URL=https://<your-project>.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
NEXT_PUBLIC_OSIRIS_URL=https://osiris.<your-domain>
```

6. Deploy.

Every push to `main` will redeploy.

## 4. Database schema

After first deploy (or locally):

```bash
cd apps/web
npx prisma db push
# optional seed
npx tsx src/lib/seed.ts   # or wire seed into an API route
```

## 5. Demo vs full multi-user

- **Demo mode** (no env / no DB): uses `localStorage` via `src/lib/store.ts`. Works immediately.
- **Full multi-user**: set the env vars above, run `prisma db push`, then point API routes at Prisma client instead of the in-memory store.

## 6. OSIRIS deployment model

- Run OSIRIS as a separate Docker-hosted service; do not bundle it into the Reunion OS runtime.
- Expose it on its own host or reverse-proxied subdomain, then set `NEXT_PUBLIC_OSIRIS_URL` in Reunion OS.
- The current integration is admin-only and read-only. If iframe embedding is blocked by OSIRIS headers or CSP, users can still launch the standalone service from `/admin/intelligence`.

## Troubleshooting

- **Build fails on Prisma**: ensure `prisma generate` runs in `postinstall` or build command.
- **Connection refused**: use the **pooler** URI (6543) for `DATABASE_URL` on Vercel serverless.
- **Auth**: current auth is demo/localStorage. Swap `AuthContext` for Supabase Auth when ready.

See also `GITHUB_UPLOAD.md` and `COMPLETE_SYSTEM_UPLOAD.md`.
