# GitHub Upload Notes

## Repo

https://github.com/estibancreations-svg/reunion-os

## What is already on main

Core config, API routes, middleware, SEO, auth context, layout, landing, types, gamification, toasts, audit, Prisma schema, admin pages (dashboard, intake, matrix, categories, activity, leaderboard), user pages (punch-list, notifications, achievements), Game HUD, Toast host, badges, AssignmentSpreadsheet, IntakeWizard, AppShell, store.ts, seed data.

## Push remaining / updates

If you have the zip or local tree:

```bash
unzip reunion-os-github.zip
cd reunion-system
git remote add origin https://github.com/estibancreations-svg/reunion-os.git   # if needed
git pull origin main --allow-unrelated-histories
git add .
git commit -m "Complete Reunion OS v5"
git push -u origin main
```

Or drag-and-drop the missing files in the GitHub UI.

## Vercel

Import the repo, set Root Directory to `apps/web`, add the env vars listed in DEPLOY.md.
