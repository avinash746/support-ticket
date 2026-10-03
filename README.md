# Support Ticket Dashboard

A full-stack web app for a support team to create tickets, track their status and quickly find the ones that need attention.

| Layer    | Tech                                                        |
|----------|-------------------------------------------------------------|
| Frontend | React 18, Vite, React Router, Tailwind CSS (+ small custom CSS layer) |
| Backend  | Node.js, Express 4, Zod (validation), Mongoose              |
| Database | MongoDB                                                     |
| Tests    | Jest + Supertest + mongodb-memory-server (API), Vitest (frontend) |

## Features

- Create tickets (title ≤ 120 chars, description, customer email, priority, status - default *Open*) with validation on **both** frontend and backend.
- Ticket list with **search** (title or customer email), **status** and **priority** filters, **sort** by created date, and **pagination (10 per page)** - all combined and executed by the backend.
- Filters/sort/page live in the URL, so refresh, back button and shared links keep the same view.
- Ticket detail page; update status and priority (persisted in MongoDB).
- Summary counts (total / Open / In Progress / Resolved) for the **entire dataset**, unaffected by filters. Clicking a card is a shortcut for the status filter.
- Loading, empty and error states; responsive layout (table on desktop, cards on mobile).
- Consistent API error format and meaningful HTTP status codes.
- 30 seed tickets with varied statuses and priorities.

## Project structure

```
support-ticket-dashboard/
├── backend/
│   ├── src/
│   │   ├── config/        env + DB connection
│   │   ├── models/        Mongoose Ticket model + enums
│   │   ├── validators/    Zod schemas (create / update / list query)
│   │   ├── middleware/    validate, error handler, 404
│   │   ├── controllers/   request handlers (business logic)
│   │   ├── routes/        route definitions
│   │   ├── utils/         ApiError, asyncHandler, escapeRegex
│   │   ├── seed/          seed data + seed script
│   │   ├── app.js         Express app factory (used by tests)
│   │   └── server.js      DB connect + listen
│   └── tests/             API tests
├── frontend/
│   └── src/
│       ├── api/           fetch client + ticket endpoints
│       ├── components/    reusable UI (filters, table, badges, form...)
│       ├── pages/         list, create, detail, not-found
│       ├── hooks/         useDebounce
│       └── utils/         validation, formatting (+ unit tests)
├── docs/TECHNICAL_NOTES.md
├── docker-compose.yml     optional local MongoDB
└── package.json           root scripts
```

## Prerequisites

- Node.js 18+ and npm
- MongoDB 6+ running locally **or** Docker (`docker compose up -d` starts one using the included compose file)

## Setup

```bash
# 1. Install everything (root, backend, frontend)
npm run install:all

# 2. (Optional) start MongoDB with Docker
docker compose up -d

# 3. Configure the backend
cp backend/.env.example backend/.env       # Windows: copy backend\.env.example backend\.env

# 4. Load the seed data (30 tickets; re-running resets the collection)
npm run seed

# 5. Start API (http://localhost:5000) and web app (http://localhost:5173)
npm run dev
```

Open **http://localhost:5173**.

Run the pieces separately with `npm --prefix backend run dev` and `npm --prefix frontend run dev`.

### Environment variables

**backend/.env**

| Variable          | Default                                        | Purpose |
|-------------------|------------------------------------------------|---------|
| `PORT`            | `5000`                                         | API port |
| `MONGODB_URI`     | `mongodb://127.0.0.1:27017/support_tickets`    | MongoDB connection string |
| `CLIENT_ORIGIN`   | `http://localhost:5173`                        | Allowed CORS origin(s), comma separated |
| `NODE_ENV`        | `development`                                  | `test` silences request logging |
| `MONGODB_URI_TEST`| *(unset)*                                      | Tests only: use a real MongoDB instead of the in-memory one |

**frontend/.env** (optional - defaults work for local dev)

| Variable            | Default                 | Purpose |
|---------------------|-------------------------|---------|
| `VITE_API_URL`      | `/api`                  | API base URL (leave empty in dev; Vite proxies `/api`) |
| `VITE_PROXY_TARGET` | `http://localhost:5000` | Where the dev server proxies `/api` |

## Running tests

```bash
npm test                 # backend + frontend
npm run test:backend     # Jest + Supertest (13 tests: validation, querying, stats, updates)
npm run test:frontend    # Vitest (form validation rules)
```

Backend tests use `mongodb-memory-server`, which downloads a MongoDB binary the first time it runs (needs internet). To use a MongoDB you already have instead:

```bash
MONGODB_URI_TEST=mongodb://127.0.0.1:27017/support_tickets_test npm run test:backend
```

> The test database is wiped between tests - never point `MONGODB_URI_TEST` at real data.

## API reference

Base URL: `http://localhost:5000/api`

| Method | Path               | Description | Success |
|--------|--------------------|-------------|---------|
| GET    | `/tickets`         | List tickets. Query: `search`, `status`, `priority`, `sort` (`newest`\|`oldest`), `page`, `limit` (default 10, max 50) | 200 |
| POST   | `/tickets`         | Create a ticket | 201 |
| GET    | `/tickets/stats`   | `{ total, open, inProgress, resolved }` for all tickets | 200 |
| GET    | `/tickets/:id`     | Ticket details | 200 |
| PATCH  | `/tickets/:id`     | Update `status` and/or `priority` (other fields rejected) | 200 |
| GET    | `/health`          | Liveness check | 200 |

List response:

```json
{
  "data": [{ "id": "...", "title": "...", "status": "Open", "priority": "High", "createdAt": "...", "updatedAt": "..." }],
  "pagination": { "page": 1, "limit": 10, "total": 30, "totalPages": 3 }
}
```

Every error uses one shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [{ "field": "customerEmail", "message": "Customer email must be a valid email address" }]
  }
}
```

| Status | When | `code` |
|--------|------|--------|
| 400 | invalid body/query, malformed JSON, malformed id | `VALIDATION_ERROR`, `INVALID_JSON`, `INVALID_ID` |
| 404 | unknown ticket or route | `NOT_FOUND` |
| 500 | unexpected failure (details are logged, not leaked) | `INTERNAL_ERROR` |


