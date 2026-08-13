# My Readiness

Farmer-facing portal for the KaLI Coop platform. A public, no-login mobile PWA
where a co-op member looks up their credit readiness score and sees what to do
next.

Full scope, architecture, and API contracts: [`PROJECT.md`](./PROJECT.md).

## Quick start

```bash
npm install
npm run dev
```

- Frontend: http://localhost:5173
- Backend:  http://localhost:3001/health

Leave `CORE_PLATFORM_API_URL` empty to use the mock core-platform client.

## Demo lookups

| Lookup | Band |
|---|---|
| `KTDA-43456789` | Almost there (68) |
| `0712345678` | Credit ready (82) |
| `12345678` | Building trust (41) |

Any other member number, phone, or national ID returns a generated profile.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Backend + frontend together |
| `npm run dev:backend` | Express API only |
| `npm run dev:frontend` | Vite PWA only |
| `npm run build` | Production frontend build |

## Environment

Copy `backend/.env.example` to `backend/.env`. See `PROJECT.md` section 10.
