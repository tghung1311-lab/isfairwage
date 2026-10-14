# IsFairWage

IsFairWage is a student-focused pay safety checker for comparing workplace pay reports. Community members can search fictional demo workplaces, view privacy-safe aggregated review data, add workplaces, and submit authenticated pay reviews to help others make more informed work decisions.

## Tech stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS
- **Backend:** FastAPI
- **Authentication and database:** Supabase Auth and PostgreSQL
- **Deployment:** Vercel

## Project structure

```text
.
├── backend/
│   ├── api/                 # FastAPI application and API routes
│   ├── sql/                 # Database schema and seed data
│   ├── setup_database.py    # Database setup script
│   └── requirements.txt     # Python dependencies
├── api/                     # Vercel FastAPI entry point
├── frontend/
│   ├── public/              # Static assets, including the favicon
│   ├── src/                 # React pages, components, API client, and types
│   └── package.json         # Frontend scripts and dependencies
├── requirements.txt         # Vercel Python dependencies
├── vercel.json              # Vercel build and routing configuration
├── PROMPT_LOG.md            # Milestone prompt and decision log
└── README.md
```

## Safety badge calculation

Safety badges are computed **only in the backend** from the average hourly pay recorded for a workplace. The minimum wage benchmark is **$33.05**, calculated as the national minimum wage of **$26.44 × 1.25** for casual loading.

| Average-pay ratio to $33.05 | Badge |
| --- | --- |
| At least `1.10` | Green — Likely Fair Pay |
| At least `0.90` and below `1.10` | Amber — Possibly Underpaid |
| Below `0.90` | Red — Likely Underpaid |
| No reviews or no usable average | Not Enough Data |

The frontend displays the badge returned by the API and does not calculate badge status itself.

## Environment variables

Copy the example files before running locally. Use real project values only in ignored local environment files; do not commit them.

### `backend/.env`

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `DATABASE_URL`
- `APP_BASE_URL`

### `frontend/.env.local`

- `VITE_API_BASE_URL`

The tracked `.env.example` files show safe placeholder formats only.

The root `requirements.txt` is used by Vercel. Keep it in sync with `backend/requirements.txt` whenever backend dependencies change.

## Run locally on Windows PowerShell

### Backend

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn api.index:app --reload
```

The API runs at `http://localhost:8000`.

### Frontend

Open a second PowerShell window:

```powershell
cd frontend
npm install
npm run dev
```

Vite prints the local browser URL when it starts.

## Set up the database

After adding `DATABASE_URL` to `backend/.env`, run this command from the repository root:

```powershell
python backend/setup_database.py
```

The script applies the schema, enables the intended database protections, and creates the fictional demo data.

## Deployment

This repository is prepared for one Vercel project that serves both the React build and the FastAPI API. Deployment itself is not performed by this repository.

### Vercel project settings

- **Root Directory:** `./`
- **Framework Preset:** `Other`
- **Build configuration:** use the committed `vercel.json`; the frontend uses its `vercel-build` script.

### Vercel environment variables

Add these variable names in the Vercel dashboard for each environment you deploy:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `DATABASE_URL`
- `APP_BASE_URL`

Set `APP_BASE_URL` to the deployed Vercel site URL for that environment. The committed frontend production configuration uses the relative `/api` path, so it calls the API served by the same Vercel project.

### Deployment considerations

- The Vercel dashboard variables are required because deployed functions do not use `backend/.env`.
- Supabase Auth and PostgreSQL must be reachable from the Vercel Python function.
- Serverless execution limits can affect slow external authentication or database requests.
- This project uses the requested `builds` configuration in `vercel.json`; verify compatibility with the selected Vercel project settings before deploying.

## Demo data

The demo businesses and review data in this project are fictional and are provided for demonstration purposes only.

## Photo credits

The workplace photos are used for fictional demo workplaces only.

- Bean & Brew Café — Photographer name, source: Unsplash
- Golden Dragon Restaurant — Photographer name, source: Unsplash
- QuickMart Convenience — Photographer name, source: Unsplash
- SparkleClean Services — Photographer name, source: Unsplash
- RiceRoll — Photographer name, source: Unsplash