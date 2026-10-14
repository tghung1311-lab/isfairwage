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

## M4 - Authentication
**Prompt:** (to be added)
**Result:** Supabase Auth signup, login, session restore, protected write routes, commit 84f5097
**Problems:** none
**Decisions:** FastAPI calls Supabase Auth REST directly; frontend stores only the access token locally

## M5 - Read APIs
**Prompt:** (to be added)
**Result:** 4 workplaces with backend-computed badges, read APIs, frontend wired to API
**Problems:** none
**Decisions:** read screens use database APIs and backend-computed badges; localStorage writes remain temporary until M6

## M6 - Write APIs
**Prompt:** (to be added)
**Result:** authenticated workplace and review creation APIs, frontend forms connected to database
**Problems:** none
**Decisions:** database writes require backend-verified Supabase tokens; frontend no longer stores workplace or review data locally

## M7 - Polish
**Prompt:** (to be added)
**Result:** original favicon, project README, environment examples, and safe repository cleanup
**Problems:** none
**Decisions:** documentation uses environment variable names and placeholder values only; application behavior and APIs remain unchanged

## M8 - Deployment preparation
**Prompt:** (to be added)
**Result:** Vercel build, routing, and FastAPI entry-point configuration prepared without deployment
**Problems:** none
**Decisions:** one Vercel project serves the React build and FastAPI API; deployment configuration uses dashboard environment variables and the frontend calls the same-origin `/api` path