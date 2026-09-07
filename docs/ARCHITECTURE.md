# Reunion OS — Architecture

## Flow

```
INTAKE WIZARD → categories + seed tasks
MASTER DATA → Categories · Users · Assignments · Tasks · Ledger · Gamification
ADMIN → Dashboard · Matrix · Categories · Intake · Leaderboard · Activity
USER → Punch-list · Notifications · Achievements
AUTH + ROLES gate every surface
```

## Multi-category convergence

```
tasks WHERE assignedUserId = :userId
   OR (categoryId IN :userCategoryIds AND assignedUserId IS NULL)
```

## Roles

| Role | Matrix | Intake | Own tasks only |
|------|--------|--------|----------------|
| SUPER_ADMIN | Yes | Yes | No |
| COMMITTEE_CHAIR | Yes | Yes | No |
| COMMITTEE_LEAD | Limited | No | Mostly |
| VOLUNTEER | No | No | Yes |

## Stack

- Next.js 14 App Router
- Prisma + Supabase Postgres
- Vercel deploy (`apps/web` root)
- Demo: localStorage store until API routes use Prisma

See DEPLOY.md for production setup.
