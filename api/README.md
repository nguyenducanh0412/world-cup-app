# KickOff API

Fastify backend API for World Cup 2026 match viewing and friend betting.

## Tech Stack

- **Fastify** 5 - HTTP server framework
- **TypeScript** 5.8.3
- **Prisma** + **PostgreSQL** - Database ORM
- **Supabase** - Auth verification + Realtime sync
- **node-cron** - Score polling + reminders
- **Firebase Admin** - FCM push notifications
- **Zod** - Request validation
- **Axios** - HTTP client for football-data.org

## Prerequisites

- Node.js 22.11.0+
- npm 10+
- PostgreSQL database (or Supabase hosted)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in your values in `.env`:
- `DATABASE_URL` - PostgreSQL connection string
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_KEY` - Service role key (admin)
- `FOOTBALL_DATA_API_KEY` - football-data.org API key
- `JWT_SECRET` - Min 32 characters
- `PORT` - Server port (default: 3000)
- `FIREBASE_SERVICE_ACCOUNT_JSON` - FCM service account JSON

### 3. Database setup

```bash
# Run migrations
npm run db:migrate

# Seed initial data (optional)
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

### 4. Start development server

```bash
npm run dev
```

Server will be running at `http://localhost:3000`

## Project Structure

```
src/
├── routes/        # API route handlers
├── services/      # Business logic layer
├── middleware/    # Express middleware (auth, etc.)
├── types/         # TypeScript types
│   └── shared.ts  # Shared types with mobile
└── utils/         # Utility functions
    └── scoring.ts # Scoring logic
```

## API Endpoints

### Health Check
```
GET /api/v1/health
```

Returns server status and database connection.

## Development Scripts

```bash
# Development with watch mode
npm run dev

# Build TypeScript
npm run build

# Run production build
npm start

# Run tests
npm run test

# Lint code
npm run lint

# Database operations
npm run db:migrate  # Run migrations
npm run db:seed     # Seed data
npm run db:studio   # Open Prisma Studio
npm run db:reset    # Reset database
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `SUPABASE_URL` | ✅ | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | ✅ | Service role key (admin) |
| `FOOTBALL_DATA_API_KEY` | ✅ | football-data.org API key |
| `JWT_SECRET` | ✅ | Min 32 chars |
| `PORT` | ❌ | Default: 3000 |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | ✅ | FCM push notifications |

## Important Notes

- This is a **standalone** Fastify project (not a monorepo)
- Shared types are copied from `mobile/src/types/shared.ts` - keep in sync manually
- All routes must use Fastify's built-in error handling
- Business logic goes in service layer, not route handlers
- Use Prisma for all database operations
- JWT authentication via Supabase tokens

## Deployment

### Railway (Production)

```bash
railway up --service api
```

Or push to `main` branch to trigger automatic deployment via GitHub Actions.

## Contributing

See [GITHUB_COPILOT_INSTRUCTIONS.md](../GITHUB_COPILOT_INSTRUCTIONS.md) for coding conventions.
