# Deploy Reunion OS → GitHub + Vercel + Supabase

GitHub: `estibancreations-svg/reunion-os`
Vercel team: `estibancreations101`

## 1. Supabase

1. Open supabase.com → project
2. Settings → Database: copy **pooler** URI (port 6543) → `DATABASE_URL`
3. Direct URI (port 5432) → `DIRECT_URL`
4. Settings → API: URL + anon key

```bash
cd apps/web
cp .env.example .env.local
# paste DATABASE_URL + DIRECT_URL
npx prisma db push
```

## 2. Vercel

1. Import `estibancreations-svg/reunion-os`
2. **Root Directory:** `apps/web`
3. Env vars (Production + Preview):
   - DATABASE_URL
   - DIRECT_URL
   - NEXT_PUBLIC_SITE_URL
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
4. Deploy

Demo UI works with localStorage without DB. Wire Prisma in API routes for multi-user production.
