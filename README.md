# Code Sathi (TeamForge Context) ⚡

Code Sathi is a full-stack hackathon collaboration platform. In your TeamForge context, this codebase now includes an integrated ML recommendation engine for teammate matching and team generation.

## What This Project Includes

- Frontend: Vanilla HTML/CSS/JS single-page app in `frontend/`
- Backend: Node.js + Express REST API in `backend/`
- Database: Prisma ORM (SQLite by default for local dev)
- Auth: JWT-based auth with protected API routes
- ML module: teammate recommendation, team generation, and feedback learning

## Current Architecture

```text
.
├── backend/
│   ├── src/
│   │   ├── modules/          # API route modules
│   │   ├── ml-engine/        # ML recommendation engine
│   │   ├── middleware/       # auth/error/rate-limit middleware
│   │   ├── docs/             # Swagger spec
│   │   └── app.js            # app wiring + routes + static frontend serving
│   └── prisma/               # schema, migrations, seed
├── frontend/                 # SPA pages, data, app router
└── README.md
```

## ML Engine Integration (Already Included)

The ML engine is part of backend runtime and does not need a separate process.

- `backend/src/ml-engine/recommender.js`
- `backend/src/ml-engine/team_builder.js`
- `backend/src/ml-engine/feature_engineering.js`
- `backend/src/ml-engine/feedback_learning.js`
- `backend/src/ml-engine/model_loader.js`
- `backend/src/ml-engine/train.js`
- `backend/src/ml-engine/utils.js`
- API routes in `backend/src/modules/ml.js`
- detailed guide: `docs/ML_ENGINE.md`

### ML API Endpoints

All are protected and use existing JWT middleware.

- `POST /api/ml/recommend/:userId`
- `POST /api/ml/generate-team`
- `POST /api/ml/feedback`

## Local Setup

## 1) Backend

From repo root:

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Default backend port is `4010` via `backend/.env`.

Health check:

- `http://localhost:4010/health`

Swagger docs:

- `http://localhost:4010/api/docs`

## 2) Frontend

You have two options:

- Option A: Use backend-served frontend (already wired in `backend/src/app.js`) by opening `http://localhost:4010`
- Option B: Run frontend statically from `frontend/` (Live Server or any static server)

If using static frontend separately, ensure API calls still target backend on `localhost:4010`.

## Environment Variables (Backend)

`backend/.env` expected values:

```text
PORT=4010
JWT_SECRET=replace-with-a-strong-random-secret
JWT_EXPIRES_IN=7d
DATABASE_URL="file:./dev.db"
```

## Safe Database Workflow (Important)

Use this before schema/migration changes to avoid losing testing accounts.

1. Backup local SQLite DB:

```bash
cp "./prisma/dev.db" "./prisma/dev.backup.$(date +%Y%m%d-%H%M%S).db"
```

2. Apply migrations safely:

```bash
npx prisma generate
npx prisma migrate dev
```

3. Do not run `prisma migrate reset` unless you intentionally want to wipe local data.

## Commands Reference

From `backend/`:

- `npm run dev` - start dev server with nodemon
- `npm start` - start server
- `npm run prisma:migrate` - Prisma migrate dev (init script alias)
- `npm run prisma:seed` - seed DB
- `npm run smoke` - smoke test core APIs

## Core Feature Areas

- Authentication and profile management
- User discovery and connect requests
- Hackathon browsing and RSVP
- Team postings and join flow
- Inbox/messaging workflow
- Notifications
- Showcase/projects
- ML teammate recommendations and team generation

## Notes on Naming

Codebase branding and runtime logs use "Code Sathi". TeamForge is the project context/use case for the skill-based team formation workflow and ML matching features.
