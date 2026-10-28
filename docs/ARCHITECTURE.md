# Architecture

## Current application structure

- `apps/web`: Vite React single-page client, React Router routes, reusable shell/UI primitives, feature pages, API client, and authentication context.
- `apps/api`: Express REST API, Zod request validation, provider adapters, Mongoose models, route modules, and domain scoring functions.
- `apps/api/src/data/curriculum.js`: reviewed educational lesson/quiz and simulation content. Correct answers are removed from public API responses and evaluated server-side.
- `docs`: research, architecture, data catalog, and privacy notes.

## Frontend boundaries

`AppShell` owns shared navigation and signed-in identity. UI primitives in `components/ui.jsx` own repeated page headings, metrics, panels, states, form fields, badges, and progress. Feature pages compose those primitives. `lib/api.js` owns credentialed API calls and request state; `state/auth.jsx` owns the current-user session. Lesson and scenario rendering receives normalized API data. Leaflet maps and Recharts forecasts are visual components without direct provider access.

Routes: public `/`, `/login`, `/register`; workspace `/dashboard`, `/academy`, `/academy/:moduleId`, `/simulations`, `/simulations/:scenarioId`, `/intelligence`, `/resources`; institution records at `/preparedness` require a session. Institution record writes are checked again by the API.

## API and data flow

The browser calls same-origin `/api/v1/*`; Vite proxies to the API in development. Provider requests, normalization, short-lived process cache, and source metadata live in `services/providers.js`. Provider calls have a 9-second timeout. A 5-minute in-memory cache limits repeated fetches per API process. USGS, GDACS, and Open-Meteo are used. NASA FIRMS is listed with a credential-required state; its key is not sent to the browser.

API route families:

- `GET /api/v1/health`
- `POST /api/v1/auth/register`, `POST /login`, `GET /me`, `POST /logout`
- `GET /api/v1/learning/modules`, `GET /modules/:id`, authenticated `GET /progress`, `PUT /progress/:id`, `POST /modules/:id/quiz`
- `GET /api/v1/simulations/scenarios`, `GET /scenarios/:id`, authenticated `GET /attempts`, `POST /attempts`
- `GET /api/v1/hazards/events`, `GET /hazards/sources`
- `GET /api/v1/weather?location=...`
- `GET /api/v1/resources?q=...&topic=...`
- authenticated institution operations: `POST /api/v1/preparedness/institutions`, `GET/POST /checklists`, `PATCH /checklists/:id`, `GET/POST /drills`, `PATCH /drills/:id`

Errors have `{ error: { code, message } }`. Provider data is normalized to a common event shape. Forecasts, observations, and simulations are labelled separately. Current cache is per-process and is lost on restart; no scheduled ingestion worker is configured.

## Persistence and tenancy

Mongoose models include `User`, `Institution`, `LessonProgress`, `Checklist`, `Drill`, `SimulationAttempt`, and immutable `AuditEvent`. The only roles are `ADMIN`, `INSTRUCTOR`, and `STUDENT`. Student signup is public; privilege is never selected by the client. Admin-created accounts are inactive until one-time token activation. Instructor user queries are scoped to server-loaded institution membership and `STUDENT` role. Admin bootstrap promotes one explicitly configured existing active account only when no active admin exists. The role migration is dry-run by default and preserves document IDs and references.

Authentication uses bcryptjs password hashing and a signed, 8-hour JWT in an HttpOnly, SameSite=Strict cookie. The API checks configured CORS origins, rejects mismatching mutation origins, limits auth attempts, validates JSON, and uses Helmet. Set `COOKIE_SECURE=true` behind HTTPS. This implementation has no refresh-token rotation or persisted session revocation list; logout clears the browser cookie. Rotate the signing secret to invalidate all sessions.

## Persistence models and fields

- `User`: name, normalized unique email, password hash, role, active state, token version, education level, optional institution reference, hashed activation token/expiry.
- `Institution`: name, type, country/state/district/city, creator.
- `LessonProgress`: user reference, module ID, completed lesson IDs, quiz score; unique user/module.
- `SimulationAttempt`: user reference, scenario ID, server-scored answers, completion time.
- `Checklist`: institution reference, category, items, last editor.
- `Drill`: institution reference, type, schedule, status, objectives, debrief, aggregate participant count, creator.

The activation token is delivered as a one-time URL by an authorized admin/instructor for manual secure sharing; automated email delivery is not configured. Scope is institution-level, with no class/group assignment model. Student incident reporting, evidence storage, curriculum publishing, and notifications are not implemented.

## User-management API

- `GET/POST /api/v1/users`: administrator-wide, or instructor's institution students only.
- `PATCH /api/v1/users/:id`: admin role/status/institution assignment; instructor profile edits only for institution-scoped students.
- `GET /api/v1/users/analytics` and `GET /api/v1/users/audit`: admins only.
- `POST /api/v1/auth/activate`: redeems one-time activation token and establishes a password.

User responses use a whitelist that excludes password hashes and activation data. Role, account-state, or institution changes bump `tokenVersion`, invalidating old cookies on the next request. Audit events are append-only through the application API; no edit route is provided. Final active admin demotion/deactivation is rejected.

## Testing strategy and current coverage

API uses Node's built-in test runner for deterministic domain scoring and response normalization. Web uses Vitest, jsdom, and React Testing Library for reusable component and workflow logic. External providers are mocked. Production build validates Vite bundling. No live MongoDB or provider is required for unit tests. No E2E suite is included yet.

## Production readiness gaps

This is a functional educational core, not a production-certified emergency platform. Before institutional deployment, review account recovery, persisted session revocation, CSRF policy under the chosen deployment, invitation issuance/rotation, audit logging, rate-limit backing store, data retention, accessibility with assistive technology, institutional approval and membership workflows, backups, monitoring, provider terms, incident response, legal/privacy review, and regional content with competent authorities. MongoDB is required for accounts and private records; public education/resource/provider routes remain usable if the database is down.
