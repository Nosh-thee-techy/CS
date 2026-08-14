<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=FF6B00&height=180&section=header&text=🌾%20Lima%20na%20Loop&fontSize=42&fontColor=ffffff" width="100%"/>

### A Kenya-specific agricultural credit-scoring platform, powered by LOOP

**Turning a farmer's harvest history into their financial future.**

<br/>

![Status](https://img.shields.io/badge/status-hackathon%20build-FF6B00?style=for-the-badge&logo=github)
![Stack](https://img.shields.io/badge/stack-Node.js%20%7C%20TypeScript%20%7C%20PostgreSQL-FF8C00?style=for-the-badge&logo=nodedotjs)
![Payments](https://img.shields.io/badge/payments-LOOP%20API-E65100?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-d35400?style=for-the-badge)

<br/>

*"Lima" — Swahili for "to cultivate." We cultivate creditworthiness from the data farmers already generate.*

</div>

---

## 🍊 Table of Contents

- [The Problem](#-the-problem)
- [Solution Summary](#-solution-summary)
- [Core Innovation & Creativity](#-core-innovation--creativity)
- [Technical Implementation](#-technical-implementation)
- [Business & Market Impact](#-business--market-impact)
- [What Makes This Different](#-what-makes-this-different)
- [Roadmap](#-roadmap)

---

## 🧩 The Problem

Kenyan smallholder farmers generate real, verifiable economic activity every season — but almost none of it counts when they apply for credit. 

Agriculture is the backbone of the Kenyan economy, contributing 26% to the Gross Domestic Product. Small-scale farming accounts for 78% of total agricultural production in Kenya and contributes to 23.5% of the country’s GDP. Despite this, small-scale farmers in Kenya continue to face significant barriers in accessing formal credit. According to a 2021 study by the Alliance for a Green Revolution in Africa (AGRA), only 15% of smallholder farmers in Kenya have access to formal credit, with the majority relying on informal sources that are often expensive and unreliable. Most of these credits are tied to their relations with co-operatives. 

This makes it difficult for farmers to access credit when they need it to purchase inputs like seeds, fertilizers, and equipment, or to invest in improving their farming practices. It also makes it difficult for them to access loans to expand their farming operations or to invest in value-addition activities that could increase their income.

A typical farmer may have:

| Signal | Example |
|---|---|
| 🌾 Consistent produce deliveries | Years of coffee/milk delivered to a cooperative |
| 💰 Regular cooperative payments | Predictable, if delayed, settlement income |
| 🔁 Input-loan repayment history | Advances repaid season after season |
| 🤝 Chama savings discipline | Years of consistent group contributions |
| 📆 Predictable seasonal income | Reliable, if irregular, cash flow |

**Yet all of this is fragmented** — scattered across cooperatives, chamas, informal lenders, and payment platforms that don't talk to each other. Traditional credit scoring, built for salaried, formally banked applicants, simply can't see this farmer. The result: creditworthy farmers are locked out of affordable financing, not because they're risky, but because they're *invisible* to the systems that decide.

> **The gap isn't willingness or ability to repay. It's fragmented, unreadable data.**

---

## 💡 Solution Summary

**Lima na Loop** is a Kenya-specific agricultural credit-scoring and financial infrastructure platform that aggregates verified data from existing agricultural ecosystems — cooperatives, chamas, and our own platform — into one contextual, explainable credit profile per farmer.

We don't replace cooperatives or agritech platforms. **We integrate with them.**

> We combine the scattered data in cooperative records, chama behaviour, repayment history, farming activity and agricultural risk data into a richer measure of farmer creditworthiness — then use **LOOP** as the financial execution layer for bulk cooperative payments and loan disbursement.

---

## ✨ Core Innovation

Payments are not our differentiator — **the credit score is.** LOOP is infrastructure; the intelligence layer is our IP.

### 1. A credit score built *for* Kenyan farmers, not adapted from generic scoring
Instead of forcing agricultural livelihoods into a conventional financial-history template, the score is built from five signal groups:

| Factor | Weight | What it captures |
|---|---|---|
| **Repayment history** | 30% | Across our platform *and* cooperative advances — no single institution's limited view |
| **Agricultural/income consistency** | 25% | Delivery frequency, volume, buyer consistency, seasonal patterns |
| **Savings & chama behaviour** | 15% | Contribution consistency, loan repayment within chamas — a distinctly Kenyan signal |
| **Cooperative activity/history** | 15% | Length and depth of cooperative participation |
| **Environmental/agricultural risk** | 10% | Climate zone, drought/flood exposure, crop-specific risk |
| **Platform data reliability** | 5% | Confidence weighting on data completeness |

### 2. Risk-aware, not location-punitive
The most defensible design decision in the model: **environmental risk adjusts loan *context*, not farmer *character*.** A farmer in a drought-prone zone with excellent repayment history isn't penalized as untrustworthy — the system instead recommends adjusted exposure or insurance requirements. This distinction is what separates a fair agricultural score from a discriminatory postcode score.

### 3. AI explains, it doesn't decide
```
DATA → DETERMINISTIC CREDIT ENGINE → SCORE → AI → HUMAN-READABLE EXPLANATION
```
The AI layer never independently generates the score — it explains a deterministic engine's output in plain language ("strong repayment history, reduced slightly by drought exposure in this cycle"). This keeps the model auditable, defensible, and safe to put in front of a loan officer or a judge.

### 4. Designed for integration, not replacement
A farmer's history isn't lost just because they've never used our app. The architecture is built around ingesting existing cooperative and chama data from day one — the platform grows *with* the ecosystem instead of asking farmers to start from zero.

---

## 🛠 Technical Implementation

### Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + TypeScript + Vite | Fast iteration, type-safe contract with backend |
| Backend | Node.js + TypeScript + Express/Fastify | Clean REST contract, team-familiar |
| Database | PostgreSQL + Prisma ORM | Relational integrity for financial records |
| Auth | JWT | Simple, stateless, role-based (`FARMER`, `COOPERATIVE`, `ADMIN`) |
| Validation | Zod | Type-safe request validation |
| Payments | LOOP API | Bulk disbursement + loan payout execution |
| Async processing (later) | Redis + queue | For high-volume settlement batches |

### Architecture

```
                    REACT + TYPESCRIPT (Vite)
                              │
                         REST / HTTPS
                              │
                    ┌─────────────────────┐
                    │     NODE.JS API     │
                    └──────────┬──────────┘
                               │
   ┌──────────┬────────────────┼────────────────┬───────────┐
   ▼          ▼                ▼                 ▼           ▼
 AUTH     FARMERS          PRODUCE          TRANSACTIONS   LOANS
              │                                    │
              └─────────────┬──────────────────────┘
                             ▼
                      CREDIT ENGINE
                             │
                             ▼
                       CREDIT SCORE
                             │
                             ▼
                       AI EXPLAINER
                             │
   ┌─────────────────────────┘
   ▼
 PAYMENT SERVICE ─────────► LOOP API ─────────► PostgreSQL
                          (bulk payments,
                        loan disbursement,
                        webhook status)
```

**Key architectural principle:** LOOP integration lives in its own isolated module (`integrations/loop/`). Controllers never call LOOP directly — every request flows `controller → service → payment.service → loop.service → LOOP API`. If LOOP's contract changes, one file changes, not the whole backend.

### API surface (v1)

```
/auth        → login, register, me
/farmers     → CRUD + filtering (county, cooperative, crop, min credit score)
/produce     → delivery records (backend calculates payment amount, not frontend)
/transactions→ unified financial history (produce earnings, loans, repayments, deductions)
/payments    → bulk cooperative payouts, payment status, LOOP webhooks
/credit      → score + human-readable AI explanation
/loans       → application → approval → disbursement lifecycle
```

Sample: **bulk cooperative settlement**

```json
POST /api/v1/payments/bulk
{
  "cooperativeId": "COOP-001",
  "payments": [
    { "farmerId": "FARM-001", "amount": 50000 },
    { "farmerId": "FARM-002", "amount": 35000 }
  ],
  "description": "August farmer settlement"
}
```
The backend validates farmers and balances, batches the request to LOOP, and tracks status asynchronously via webhook — payment systems are never assumed synchronous.

### Design safeguards
- **Soft deletion only** — financial and produce records are deactivated/voided, never physically deleted.
- **Backend-owned scoring** — the frontend never calculates or trusts a client-side credit score.
- **Environmental risk ≠ farmer penalty** — encoded as an explicit rule in the scoring engine, not left to interpretation.

---

## 📈 Business & Market Impact

**Who this serves:**
- **Farmers** gain access to financing that reflects their actual economic behaviour, not just what a bank can see.
- **Cooperatives** get an integrated settlement and reconciliation layer instead of manual batch payouts.
- **Lenders/financiers** get a richer, more explainable risk signal — lower default risk from better-informed decisions, not just more applicants approved.

**Why now:**
Kenya's cooperative and chama ecosystems already produce the data needed for this model — mobile money penetration, cooperative digitization, and open agricultural datasets have matured enough that the missing piece is *aggregation and interpretation*, not new data collection infrastructure.

**Path to adoption:**
1. Pilot with 1–2 cooperatives (coffee or dairy — well-documented, structured delivery records).
2. Demonstrate score correlation against actual repayment outcomes to calibrate thresholds.
3. Expand chama data integration with consent-based partnerships.
4. Offer lenders an API to query the credit score directly, monetizing via a scoring-as-a-service model alongside LOOP-powered disbursement.

**Market signal:** this isn't a payments product competing with LOOP or M-Pesa — it's a *credit intelligence* layer that makes existing payment rails more useful to lenders, which is a defensible, complementary position rather than a crowded one.

---

## 🔍 What Makes This Different

| Existing systems | Our focus |
|---|---|
| Connect farmers to markets | **Assess farmer creditworthiness** |
| Record deliveries | **Turn delivery history into credit signals** |
| Facilitate payments | **Use payment behaviour as a risk signal** |
| Provide some financing | **Improve the underlying credit assessment** |
| Manage cooperatives | **Aggregate cooperative data into a farmer-level financial profile** |
| Support farmer groups | **Use chama behaviour as an additional credit signal** |
| Generic financial scoring | **Agriculture + Kenya-specific risk factors** |

We're not claiming nobody has scored farmers before. The hypothesis we're testing:

> **Can we construct a richer, more contextual credit profile for Kenyan farmers by combining fragmented agricultural, community-finance, repayment, and environmental data?**

---

## 🗺 Roadmap

- [ ] Hackathon MVP: mock cooperative CSV import, deterministic scoring engine, AI explanation endpoint, LOOP sandbox bulk-payment demo
- [ ] Calibrate score thresholds against real repayment outcomes
- [ ] Cooperative ERP integration endpoint (`/integrations/cooperatives`)
- [ ] Consent-based chama data partnerships
- [ ] Lender-facing scoring API

---

<div align="center">

<img src="https://img.shields.io/badge/Built_for-LOOP_Hackathon_2026-FF6B00?style=for-the-badge" alt="Built for LOOP Hackathon 2026"/>

*Sector Solutions × AI-led Business Transformation*

</div>
