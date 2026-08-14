# My Readiness — Project Brief (Cursor Context File)

> Drop this file at the root of the repo (e.g. `PROJECT.md` or `.cursor/rules/my-readiness.md`)
> so Cursor has full context on scope, architecture, and boundaries before generating code.

---

## 1. What we're building

**My Readiness** is the farmer-facing portal of the KaLI Coop platform — a public,
no-login mobile page where a co-op member can check their credit readiness score
and see exactly what to do to improve it.

- No app install, no login, no officer visit required
- Feels and behaves like a native app (smooth transitions, bottom nav, card UI)
  even though it's delivered as a mobile web page
- Lives on its own **subdomain**, e.g. `readiness.<platform-domain>.co.ke`
- Sits alongside (not replacing) the officer dashboard and USSD channel

- Explicitly out of scope for this frontend: scoring math, officer tooling, auth.
  Those live in `backend/` (Agricultural Credit Platform).

---

## 2. Architecture — where this repo fits

```
┌─────────────────────────────┐     ┌──────────────────────────┐
│   MY READINESS FRONTEND      │     │  FEATURE PHONE (USSD)    │
│   readiness.<domain>.co.ke   │     │  *384*XXXX# via AT       │
└──────────────┬───────────────┘     └────────────┬─────────────┘
               │ /api/readiness, /api/otp          │ POST /api/ussd
               ▼                                   ▼
┌─────────────────────────────────────────────────────────────┐
│   CORE PLATFORM BACKEND  (Express :3000)                     │
│   farmers, produce, credit, loans, payouts                   │
│   + readiness shape/localize                                 │
│   + Africa's Talking USSD session + SMS OTP                  │
│   + Firebase Client SDK (Firestore under security rules)     │
└─────────────────────────────────────────────────────────────┘
```

**Key rule:** scoring is owned by `CreditEngineService` in this backend.
The readiness routes only look up the farmer, map the 300–850 credit score
to the 0–100 farmer display, and localize. Demo member numbers still work
when Firebase is unset or the farmer is not registered yet.

---

## 3. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React (Vite) + Tailwind | Fast build, app-like UI without native app overhead |
| Frontend shell | PWA (manifest + service worker) | Installable-feeling, works on flaky rural connectivity |
| Backend | Node.js + Express | Matches core platform stack, thin and easy to maintain |
| API calls out | `fetch`/`axios` to core platform's internal API | No direct DB access from this service |
| Deployment | Subdomain, separate from main app | Keeps this public-facing surface isolated and lightweight |

---

## 4. Screens (app-like UI, mobile-first)

1. **Lookup screen**
   - Single input: member number / phone / national ID
   - Language selector (English, Kiswahili, others — persisted in local storage)
   - Big, thumb-friendly input and button — this is likely used on low-end phones

2. **Readiness score screen**
   - Score (0–100) as a prominent circular/gauge visual
   - Band badge: "Credit ready" / "Almost there" / "Building trust"
   - Short "why" explanation in plain language
   - Kali voice greeting (audio, auto-plays score + next step in selected language)

3. **Strengths & gaps screen**
   - Two clearly separated card lists: what's helping the score, what's holding it back

4. **Action points screen**
   - Ranked list of concrete next steps, each with a checkbox
   - Tapping a checkbox = self-report (does NOT change the score — copy should make this clear)
   - Verified vs. pending state shown distinctly (verified = field officer confirmed it)

5. **Climate advisory card** (can live on score screen or its own tab)
   - Zone-based advisory text pulled from core platform response

**App-like feel checklist:**
- Bottom tab nav (Score / Actions / Advisory) rather than scrolling everything
- Page transitions, not hard reloads
- Skeleton loaders while the lookup/score call resolves
- Offline-friendly: cache last-viewed profile so a flaky connection doesn't blank the screen

---

## 5. This backend's API (frontend ↔ this backend)

```javascript
// GET /api/readiness/:lookup?lang=sw
// Looks up a farmer and returns a display-ready readiness profile.
// This backend calls the core platform's internal scoring API,
// then reshapes/localizes the response for the frontend — it does not
// compute the score itself.
//
// Response shape:
{
  "score": 68,
  "band": "Almost there",
  "why": "Your score is driven mainly by consistent deliveries...",
  "strengths": ["Delivery consistency", "Tenure"],
  "gaps": ["Chama savings history", "Loan repayment"],
  "actions": [
    { "id": "act_1", "text": "Deliver every harvest this season", "verified": false },
    { "id": "act_2", "text": "Save with your chama monthly", "verified": true }
  ],
  "climateAdvisory": "Light rainfall expected — plan input purchases early.",
  "disbursementEligible": false,
  "voiceGreetingUrl": "https://.../greeting_sw_KTDA-43456789.mp3"
}

// POST /api/readiness/:lookup/actions/:actionId/complete
// multipart/form-data: optional photo, audio, note.
// Self-report only. Forwards the completion to the core platform,
// which queues it for field officer verification. Does not alter score.
```

---

## 6. Core platform (this monorepo)

Readiness routes are mounted on the Agricultural Credit Platform API in
`backend/`. `ReadinessService` looks up the farmer in Firestore, reads
`CreditEngineService` / `LoanService`, and maps that into the display payload
above. Scoring stays in the credit engine (300–850 → 0–100 for the farmer UI).

Demo lookups (`KTDA-43456789`, `0712345678`, `12345678`) still work when
Firebase is unset or the member is not registered yet.

---

## 7. Localization

- Minimum: English, Kiswahili
- Structure copy as translation keys from day one (e.g. `react-i18next`) —
  do not hardcode English strings, since Luganda and others are expected later
- Kali voice greeting audio is language-specific — backend should request the
  correct language variant from the core platform based on the selected locale

---

## 8. Suggested folder structure

```
my-readiness/
├── frontend/
│   ├── src/
│   │   ├── screens/          # Lookup, Score, StrengthsGaps, Actions
│   │   ├── components/       # ScoreGauge, ActionCard, BandBadge, BottomNav
│   │   ├── i18n/              # translation files
│   │   └── api/                # client for calling this repo's backend
│   └── public/
│       └── manifest.json      # PWA manifest
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   └── readiness.js   # /api/readiness/:lookup, /actions/:id/complete
│   │   ├── clients/
│   │   │   └── corePlatform.js # thin client for the internal core platform API
│   │   └── server.js
│   └── package.json
└── PROJECT.md                 # this file
```

---

## 9. Build order (suggested)

1. Backend: stub `corePlatform.js` client with mocked responses matching the
   contract in section 6, so frontend work isn't blocked waiting on the real API
2. Backend: `GET /api/readiness/:lookup` route using the mock
3. Frontend: Lookup screen → Score screen, wired to the stubbed backend
4. Frontend: Strengths/Gaps + Actions screens
5. Frontend: Kali voice greeting playback
6. Swap mock client for real core platform API once that contract is confirmed
7. PWA polish: manifest, offline caching, skeleton loaders
8. Subdomain deployment config

---

## 10. Environment variables (core platform `backend/.env`)

```
PORT=3000
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_APP_ID=
FIREBASE_AUTH_EMAIL=          # optional backend Auth user (not a service account)
FIREBASE_AUTH_PASSWORD=
AT_USERNAME=sandbox
AT_API_KEY=
AT_CALLBACK_SECRET=
DEFAULT_LOCALE=en
FEATHERLESS_API_KEY=         # optional, dynamic why/how/impact translation
```
