# HackTeam Platform - Production Backend Engine

A highly scalable, production-ready backend engine for the HackTeam platform. Built with a focus on clean architecture, security, and developer experience.

## 🚀 Tech Stack & Architecture

- **Framework:** Node.js + Express.js (ES Modules)
- **Database:** PostgreSQL (migrated from SQLite for production scale)
- **ORM:** Prisma
- **Validation:** Zod
- **Documentation:** Swagger / OpenAPI
- **Containerization:** Docker & Docker Compose
- **Security:** Helmet, Express Rate Limit, bcryptjs, JSON Web Tokens (JWT)

## 📁 Folder Structure

```text
backend/
├── src/
│   ├── app.js               # Express application setup & middleware pipeline
│   ├── server.js            # Entry point & DB connection
│   ├── docs/                # Swagger OpenAPI specifications
│   ├── lib/                 # Reusable utilities (Prisma client, logger)
│   ├── middleware/          # Auth, error handling, rate limiting
│   ├── modules/             # Business Logic & Domains
│       ├── auth.js          # Auth routes & controllers
│       ├── users.js         # User profiles operations
│       ├── hackathons.js    # Hackathons & Team postings
│       ├── teams.js         # Team management
│       ├── messages.js      # Messaging system
│       ├── notifications.js # System notifications
│       └── showcase.js      # Project showcasing
├── prisma/
│   ├── schema.prisma        # PostgreSQL Database Models
├── Dockerfile               # Production image configuration
├── docker-compose.yml       # Postgres DB + App services
└── package.json
```

## 🛠️ API Routes List

Swagger Documentation is available locally at: `http://localhost:4010/api-docs`

**Core Endpoints:**
- `GET /health` - API Health check (Unauthenticated)
- `GET /api-docs` - Swagger UI

**Authentication:**
- `POST /api/auth/register` - Create an account
- `POST /api/auth/login` - Authenticate & get JWT
- `GET /api/auth/me` - Get current user profile

**Users:**
- `GET /api/users` - List / Filter users
- `GET /api/users/:id` - Get user profile
- `PATCH /api/users/me` - Update profile

**Hackathons & Teams:**
- `GET /api/hackathons` - List hackathons
- `GET /api/hackathons/:id` - Hackathon details
- `POST /api/hackathons/:id/toggle-going` - RSVP
- `GET /api/teams` - List team posts
- `POST /api/teams` - Create a team post
- `POST /api/teams/:id/join` - Request to join a team

**Interactions:**
- `GET /api/messages/inbox` - Private messages
- `GET /api/showcase` - Showcase projects
- `GET /api/notifications` - User notifications

## 🐳 Deployment Steps

This application is ready to be deployed to any Docker-compatible hosting provider (Render, AWS ECS, DigitalOcean App Platform, Railway).

**Step 1: Set up the Database**
Deploy a managed PostgreSQL database (e.g., Supabase, Neon, or AWS RDS).
Get your connection string and add it to `.env` as `DATABASE_URL`.

**Step 2: Environment Variables**
Configure the production `.env`:
```text
NODE_ENV=production
DATABASE_URL="postgresql://user:password@host:port/database"
JWT_SECRET="generate_a_very_strong_random_string"
PORT=4010
```

**Step 3: Docker Deployment**
Build and run the container:
```bash
docker-compose build
docker-compose up -d
```
*Alternatively, simply push to a platform like Render and specify the `Dockerfile` as the build source.*

**Step 4: Run Migrations on Prod**
Before standard traffic hits the deployed container, execute:
```bash
npx prisma migrate deploy
```

## 📈 Scaling to 10k+ Users

To ensure this backend remains robust under traffic surges (like during hackathon submissions):

1. **Database Connection Pooling:** 
   We use Prisma. At scale, add **PgBouncer** or use Prisma's Accelerate connection pooler to avoid exhausting Postgres connections during high concurrency.
2. **Horizontal Scaling:**
   Because we use stateless JWT authentication, the Express app can be replicated instantly across multiple containers/nodes behind a Load Balancer. No sticky sessions are required!
3. **Caching Layer:**
   Currently, every request hits Postgres. For 10k+ users, implement Redis. Cache the `GET /api/hackathons` and `GET /api/showcase` routes since they are high-read, low-write operations.
4. **Asynchronous Background Jobs:**
   Offload intense tasks (like processing image uploads or sending bulk email notifications) to a worker queue using BullMQ or AWS SQS.
5. **Database Indexes:**
   The `schema.prisma` is modeled cleanly. Ensure indexes exist on frequently queried fields like `User.email` and foreign keys (e.g., `TeamMember.teamId`).

## ✍️ Code Quality
- All responses are wrapped in consistent JSON structures.
- Helmet secures HTTP headers.
- Rate limits protect against Brute Force attacks.
- Centralized Error Handling prevents leaking stack traces in production.
