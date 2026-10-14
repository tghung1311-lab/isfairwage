# IsFairWage - Prompt Log (Assignment 3)

## M1 - Scaffold monorepo
**Prompt:** (to be added)
**Result:** backend FastAPI (GET /api/health), frontend Vite React TS Tailwind, Git repo, commit 08dfd5d
**Problems:** none
**Decisions:** one monorepo (backend/ and frontend/), deploy on one Vercel project

## M2 - Supabase and environment files
**Prompt:** (to be added, use placeholders for secrets)
**Result:** Supabase project created, Confirm email OFF, backend/.env and frontend/.env.local created (ignored by Git)
**Problems:** none
**Decisions:** secrets only in env files, never committed

## M3 - Database setup
**Prompt:** (to be added)
**Result:** 4 workplaces, 9 reviews, RLS enabled, commit 9c94744
**Problems:** none
**Decisions:** RLS on with no public policies; only the backend accesses the DB via DATABASE_URL