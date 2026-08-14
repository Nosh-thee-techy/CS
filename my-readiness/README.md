# My Readiness

Farmer-facing portal for the KaLI Coop platform. A public, no-login mobile PWA
where a co-op member looks up their credit readiness score and sees what to do
next.

Full scope, architecture, and API contracts: [`PROJECT.md`](./PROJECT.md).

## Quick start

From the repo root:

```bash
npm install --prefix backend
npm run dev --prefix backend
```

Then in `my-readiness/frontend`:

```bash
npm install
npx vite
```

- Frontend: http://localhost:5173 (proxies `/api` to port 3000)
- API:      http://localhost:3000/health
- Lookup:   http://localhost:3000/api/readiness/KTDA-43456789

Registered farmers are served from Firestore (national ID, phone, or member
number). Leave Firebase unset to use the demo lookups below.

## Demo lookups

| Lookup | Band |
|---|---|
| `KTDA-43456789` | Almost there (68) |
| `0712345678` | Credit ready (82) |
| `12345678` | Building trust (41) |

Unknown lookups return 404.

## Environment

Copy `backend/.env.example` to `backend/.env` in the repo root. Featherless
is optional. See `PROJECT.md`.
