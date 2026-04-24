# Code Sathi Backend (TeamForge Context)

Production-style Express backend powering authentication, profiles, teams, messaging, and ML recommendations for hackathon teammate formation.

## Stack

- Node.js + Express (ES Modules)
- Prisma ORM
- SQLite for local development (default)
- JWT auth
- Zod request validation
- Swagger/OpenAPI docs
- Helmet + rate-limiting + centralized error handling

## Backend Structure

```text
backend/
├── src/
│   ├── app.js                 # app setup, middleware, routes, static frontend serving
│   ├── server.js              # entrypoint
│   ├── docs/swagger.js        # OpenAPI spec
│   ├── lib/                   # prisma client, serializers, http helpers
│   ├── middleware/            # auth + errors
│   ├── modules/               # route modules
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── hackathons.js
│   │   ├── teams.js
│   │   ├── messages.js
│   │   ├── notifications.js
│   │   ├── showcase.js
│   │   └── ml.js
│   └── ml-engine/             # recommendation engine internals
├── prisma/
│   ├── schema.prisma
│   ├── seed.js
│   └── migrations/
├── scripts/smoke.js
├── Dockerfile
└── docker-compose.yml
```

## Run Locally

From `backend/`:

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Server runs on `PORT` (default `4010` from `.env`).

## Local URLs

- Health: `http://localhost:4010/health`
- Swagger: `http://localhost:4010/api/docs`

## Environment Variables

Local default `.env`:

```text
PORT=4010
JWT_SECRET=replace-with-a-strong-random-secret
JWT_EXPIRES_IN=7d
DATABASE_URL="file:./dev.db"
```

In production, set a secure `JWT_SECRET` and a production-grade `DATABASE_URL`.

## API Surface

### Core

- `GET /health`
- `GET /api/docs`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Users

- `GET /api/users`
- `GET /api/users/:id`
- `PATCH /api/users/me`
- `POST /api/users/:id/connect`

### Hackathons + Teams

- `GET /api/hackathons`
- `GET /api/hackathons/:id`
- `POST /api/hackathons/:id/toggle-going`
- `GET /api/teams`
- `POST /api/teams`
- `POST /api/teams/:id/join`

### Messages

- `GET /api/messages/inbox`
- `GET /api/messages/:id`
- `POST /api/messages/:id/send`
- `POST /api/messages/:id/accept`
- `POST /api/messages/:id/decline`

### Showcase + Notifications

- `GET /api/showcase`
- `GET /api/notifications`
- `POST /api/notifications/:id/read`

### ML Recommendation Engine

- `POST /api/ml/recommend/:userId`
  - returns ranked teammate matches with score, reasons, and role fit
- `POST /api/ml/generate-team`
  - input: `teamSize` (4 or 5), optional `theme`
  - returns optimized teammate set and summary
- `POST /api/ml/feedback`
  - input: `userId`, `recommendedId`, `action` (`accept`/`reject`), optional context

## How ML Scoring Works (Current)

Hybrid weighted score using:

- Skill overlap
- Shared hackathon interests
- Complementary roles
- Experience blend
- Prior collaboration signal
- Candidate strength index
- User feedback bias (accept/reject history)

Cold-start users still receive recommendations from profile/skills/role/experience signals even without behavior history.

## Useful Scripts

- `npm run dev` - local development
- `npm start` - start server
- `npm run prisma:migrate` - migrate dev alias
- `npm run prisma:seed` - seed database
- `npm run smoke` - smoke checks

## Data Safety Note (Dev)

`prisma migrate reset` wipes local data. Back up `prisma/dev.db` before risky migration operations.

## Docker Notes

- `docker-compose.yml` includes PostgreSQL + app services for containerized runs.
- Local non-docker default is SQLite.
- If using Docker/Postgres, set production-grade secrets and run:

```bash
npx prisma migrate deploy
```
