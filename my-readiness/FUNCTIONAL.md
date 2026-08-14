# My Readiness — Functional Specification

> Companion to `PROJECT.md`. That file covers architecture and
> boundaries; this one covers exactly how the app should behave, screen by screen.
> This backend never computes scores — it fetches from the core platform's
> internal API and shapes the response. See the other file for that contract.

---

## 1. App structure — 3 screens, single lookup

```
Lookup (no login)
   │
   ▼
┌─────────────────────────────────────────┐
│  Bottom nav: Score  |  Loan  |  Improve   │
└─────────────────────────────────────────┘
```

One lookup at the start of a session loads all three screens' data in a single
fetch (see section 3). The farmer moves between tabs freely — no re-fetching
per tab unless they explicitly refresh.

Do not wrap score or any other data in a nested phone mockup inside the
screens. Desktop demos may frame the whole app in an iPhone device shell;
on a real phone the chrome disappears and the UI is full-bleed.

---

## 2. Screen 1: Score (combines score + explanation, no separate "why" page)

**Purpose:** answer "what's my score" and "why is it that" in one place —
these were split into two screens originally, merged per latest direction.

**Renders, top to bottom:**
1. Score number (0–100) + band label (`Credit ready` / `Almost there` / `Building trust`)
2. Climate advisory card (zone-based, pulled fresh — see freshness rule below)
3. Plain-language "why" sentence (1–2 sentences, AI-generated or rule-based fallback)
4. Strengths list (2 items max, from top-weighted signals)
5. Gaps list (2 items max, from lowest-weighted signals)

**Logic:**
- Band is derived from score, not stored separately: `<50 = Building trust`,
  `50–74 = Almost there`, `75+ = Credit ready` — confirm exact cutoffs with
  the core platform team, this is a placeholder mapping
- Strengths/gaps are picked by ranking the signal breakdown (delivery, savings,
  repayment, tenure) by % of max — top 2 = strengths, bottom 2 = gaps
- Raw sub-scores (e.g. "22/30") are NEVER shown on this screen — they only
  drive which strengths/gaps text renders. This was an explicit decision to
  avoid confusing farmers with numbers that need explaining themselves.

---

## 3. Screen 2: Loan application

**Purpose:** let a farmer apply for financing without an officer visit, gated
by their current score.

**Renders:**
1. Eligible amount (calculated from score tier, not user-entered)
2. Next tier hint — "Reach 75 for up to KES 20,000" — motivational, not a hard block
3. Amount field — **read-only**, pre-filled from eligibility, not free text
   (prevents a farmer requesting more than they qualify for)
4. Purpose dropdown (fixed list: input purchase, farm equipment, other)
5. Submit button → `POST` to backend, confirmation state, then routes to
   loan status (reuse existing "view loan status" data if the platform has it)

**Locked variant (resolved for this build):**
- Score `<50`: locked explainer — "Reach a score of 50 to apply"
- Score `50–74`: locked explainer — "Reach 75 for up to KES 20,000"
- Score `75+`: application form. Mock eligible amount is KES 20,000.

**Submit logic:**
```javascript
// Amount is NEVER taken from free user input — always server-calculated
async function submitLoanApplication(memberId, purpose) {
  const eligibility = await getCurrentEligibility(memberId);
  if (!eligibility.disbursementEligible) {
    throw new Error("Not eligible — should not reach this call if UI gates correctly");
  }

  return await api.post(`/api/readiness/${memberId}/loan-application`, {
    amount: eligibility.eligibleAmount, // server-derived, not client-supplied
    purpose,
  });
}
```

Loan POST body from this app: `{ purpose, otpCode }`. Amount is never accepted
from the client. The amount field is read-only and pre-filled from eligibility.

**Locked variant:** farmers below the disbursement threshold still see Loan,
as an explainer — not a hidden tab. Score `<50`: reach 50 to apply. Score
`50–74`: reach 75 for up to KES 20,000.

**Pay back (frontend for now):** if the farmer has an outstanding sent
disbursement, Loan can show repayment. Backend repayment is not wired yet.

**Deductions:** Loan shows harvest payouts split into harvest amount, amount
taken for the loan, and amount paid to the farmer. Live data comes from
produce payouts (`loanDeductionAmount`).

---

## 4. Screen 3: Improve

**Purpose:** turn the score into something actionable — not just "here's what's
wrong" but "here's exactly what to do and what it's worth."

**Renders, per action card:**
1. Category icon + title (short, imperative — "Deliver every harvest this season")
2. Category label (Agriculture / Savings / Climate)
3. **How** — one sentence, concrete, no jargon
4. **Impact** — one sentence explaining *why* this signal matters to the score
5. **How to show it** — a photo prompt and a voice-note prompt specific to that step
6. Capture controls: camera, gallery, record audio (max 60s), optional note
7. Points badge — `+N points` and a status: `not started` / `verified` / `recommended this month`

**Ranking logic:**
- Sort action cards by points value, descending — biggest opportunity first
- `verified` actions still show (with their already-applied points) so the
  farmer sees the full picture, not just pending work
- Header line summarizes total potential: "Three steps could raise your score
  from 68 to 84 this season" — computed as current score + sum of unclaimed
  action points, capped at 100 (shaped in the BFF from API-returned numbers)

**Self-report vs. verified — critical distinction, must not be blurred in UI or logic:**
- Tapping a step only logs a self-report — it does **not** change the score
- Farmers attach a **photo** (camera or gallery) and/or a **voice note**, plus an optional note, so an officer can verify
- Only a field officer verifying the action server-side applies the point bonus
- The `verified` badge state must come directly from the API response, never
  inferred client-side from a checkbox tap

```javascript
// Self-report only, never mutates score locally
async function markActionAttempted(memberId, actionId) {
  await api.post(`/api/readiness/${memberId}/actions/${actionId}/complete`);
  // UI shows "pending verification" — NOT applied points — until next fetch
  // confirms the officer has verified it server-side
}
```

---

## 5. Data freshness rules

| Data | Refresh behavior |
|---|---|
| Score, why, strengths/gaps | Fetched once per lookup session; show "last updated" timestamp from API |
| Climate advisory | Same fetch as score — do not call separately |
| Loan eligibility | Same fetch as score — never let it drift out of sync with the displayed score |
| Action verification status | Re-fetch on screen focus (farmer may return after officer verified something) |

**Rule:** score, loan eligibility, and action points must always come from the
**same fetch** so numbers never contradict each other across screens (e.g.
score says 68 on one screen but loan tier implies 72 on another).

---

## 6. Error / empty states

- **Lookup not found:** "We couldn't find that number. Check it and try again." — no jargon about databases or backend
- **No actions available:** don't show an empty Improve screen — show "You're doing everything we can currently measure. Check back after your next delivery."
- **Loan submission fails:** show the actual reason if the API provides one (e.g. "already have a pending application"), otherwise "Couldn't submit right now. Try again."
- **Stale data (fetch fails but cached data exists):** show cached data with a visible "showing saved data, may be outdated" note rather than a blank screen — matters for flaky rural connectivity

---

## 7. Security and trust

These extend the anomaly/verification logic already in the score engine into
explicit, farmer- and admin-facing behavior — not new scoring logic, just
making what already happens visible and adding friction where it matters.

**Transaction outcome clarity**
- Every LOOP-originated payment (settlement, disbursement, loan repayment)
  shown to the farmer gets a plain-language status: `Sent` / `Pending` /
  `Failed, retrying` — never a raw callback code or status enum
- Status comes straight from the core platform's payment status field —
  this app maps it to copy, it doesn't infer status itself

```javascript
// Maps raw core-platform payment status to farmer-facing copy.
// Add new raw values here as the core platform introduces them —
// never let an unmapped status leak through as a raw code.
function paymentStatusLabel(rawStatus) {
  const map = {
    completed: "Sent",
    pending: "Pending",
    failed: "Failed, retrying",
  };
  return map[rawStatus] || "Checking status";
}
```

**Early risk detection (admin-facing)**
- The graph's anomaly flag (same one that applies the −10 score penalty)
  should also surface as a live list for cooperative admins — duplicate
  deliveries, ghost members, sudden score manipulation attempts
- This is a read-only admin view in this repo; it consumes a flagged-accounts
  endpoint from the core platform, it does not run detection itself
- Open at `/admin`

**Action gating — friction only where it matters**
- Viewing score, why, and improve stays completely frictionless — no login,
  no OTP, matches the "no app, no login" design goal
- Loan application submission specifically requires an SMS OTP confirmation
  step before the request reaches the core platform — this is the one place
  where money actually moves, so it's the one place that earns friction

OTP is verified on `POST /api/readiness/:lookup/loan-application` (the money
path) so the loan endpoint cannot be called without a valid code. Request a
code first via `POST /api/otp/request`.

**API misuse protection**
- Rate-limit `/api/readiness/:lookup` — without this, the endpoint can be
  hammered to enumerate valid member numbers/phones/IDs since there's no login
- Starting point: per-IP limit (10 lookups/minute)

---

## 8. Localization and accessibility (local languages)

**Goal:** local-language support so illiterate and disabled farmers aren't locked
out of a score/action system that assumes reading English or Kiswahili text.

USSD text menus do not solve illiteracy by themselves. The accessibility answer
for illiteracy is **voice** — the Kali avatar (this app), and/or an IVR alternative
to USSD (not in this repo). Localizing text helps literate non-English speakers;
it does not help illiterate farmers on its own.

**Language selection (this web app)**
- Asked on lookup, persisted for the session (`en` / `sw`; more later)
- Stored against the member lookup for later SMS push language
- Kali speaks the selected language

**Content pipeline**

| Content type | Approach |
|---|---|
| Static UI strings | i18n files (`en.json` / `sw.json`) — never Featherless |
| Dynamic content (why, action how/impact, climate advisory) | English from core (or mock keys), then `localizeDynamicContent` via Featherless when `FEATHERLESS_API_KEY` is set. Cache 7 days. If unset, fall back to static locale copy. |

USSD and SMS localization use the same pipeline when those channels exist.
USSD is implemented on the core API (`POST /api/ussd`) via Africa's Talking.
This frontend still owns the web app + Kali.

**Kali voice avatar**
- Primary channel for illiterate / low-literacy farmers
- Speaks the same why, score, next-step, and climate text shown on screen
- Voice and text input; replies are spoken and shown
- Screen-reader labels and `aria-live` on her transcript

---

## 9. What's explicitly NOT in this app's logic

- No scoring computation — this app only displays what the core platform returns
- No direct database access — everything goes through the core platform's internal API
- No login/session — every screen load is a fresh, stateless lookup
- No client-side score/points math that could drift from server truth — all
  numbers shown are exactly what the API returned, never locally recalculated
- No USSD/SMS gateway in this frontend — Africa's Talking callbacks hit `backend/` `POST /api/ussd`
