# Technical notes

## Technical choices

- **React + Vite + Tailwind** - fast dev loop; Tailwind utilities plus a small `@layer components` set (`.btn`, `.card`, `.field-input`...) keep markup readable and styling consistent.
- **Express + Mongoose** - minimal, familiar stack. Code is layered `routes → middleware (validate) → controllers → model` so a new endpoint or field touches few, predictable places.
- **Zod for backend validation** - one declarative schema per operation; it trims/normalises input (e.g. lowercases email), applies defaults, and produces the `{ field, message }` details the frontend maps onto form fields. The Mongoose schema is a second safety net.
- **Server-side querying** - search/filter/sort/pagination are one Mongo query (`find` + `skip/limit`) plus `countDocuments` for the same filter. Sorting uses `(createdAt, _id)` so pages are stable when timestamps tie. Search input is regex-escaped so users can't inject patterns.
- **Stats endpoint** - a separate `GET /tickets/stats` using one `$group` aggregation, so counts never depend on list filters.
- **Filters in the URL** - `useSearchParams` is the single source of truth for filters/sort/page, giving refresh/back/share behaviour for free. Search is debounced (350 ms) and in-flight requests are aborted to avoid stale responses.
- **Indexes** on `createdAt`, `(status, priority, createdAt)` and `customerEmail`.
- **Tests** - API tests run against an in-memory MongoDB through the real Express app (Supertest), covering validation, querying (filters + sort + pagination + regex safety), stats and updates. A Vitest suite covers the client-side validation rules.

## Assumptions

- Only **status and priority** are editable after creation (as specified); the API rejects other fields on PATCH.
- Priority defaults to *Medium* when omitted on create (the spec only defaults status).
- "Search" is a case-insensitive *contains* match on title or customer email.
- No authentication, so any user can edit any ticket.
- Email validation is format-only (no deliverability check).

## Known limitations

- Search uses an unanchored case-insensitive regex, which can't use an index efficiently. Fine for thousands of tickets; for much larger data use a MongoDB text/Atlas Search index.
- No ticket deletion, no editing of title/description, no comments/audit history.
- Concurrent edits are last-write-wins (no optimistic locking).
- Summary counts refresh when the list page loads or reloads, not live.
- The in-memory-MongoDB tests need internet on first run (binary download); `MONGODB_URI_TEST` is the workaround.
- No end-to-end or React component tests.

## Time spent

_Fill in before submitting (e.g. backend ~Xh, frontend ~Xh, tests/docs ~Xh)._

## AI usage

_Describe honestly how you used AI tools (for example: generated the initial project scaffold and code, then reviewed it, ran it, and adjusted it). You must be able to explain and modify every file._
