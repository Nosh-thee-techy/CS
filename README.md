<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=FF6B00&height=180&section=header&text=🌾%20Lima%20na%20Loop&fontSize=42&fontColor=ffffff" width="100%"/>

### A Kenya-specific agricultural credit-scoring platform, powered by LOOP

**Turning a farmer's harvest history into their financial future.**

<br/>

![Status](https://img.shields.io/badge/status-hackathon%20submission-FF6B00?style=for-the-badge&logo=github)
![Team](https://img.shields.io/badge/Team-RKO-FF8C00?style=for-the-badge)
![Stack](https://img.shields.io/badge/stack-Node.js%20%7C%20TypeScript%20%7C%20PostgreSQL-E65100?style=for-the-badge)
![Payments](https://img.shields.io/badge/payments-LOOP%20API-d35400?style=for-the-badge)

</div>

---

## 🎬 Demo Recording

> 📺 **Watch the Demo Video & Pitch:**
> 
> **[▶️ Watch Lima na Loop Demo Recording](https://youtube.com/YOUR_DEMO_LINK)** *(Paste your video link here)*
> 
> **[🌐 Live Application / Presentation Slide Deck](https://YOUR_DEMO_URL)**

---

## 📋 Table of Contents

- [🎬 Demo Recording](#-demo-recording)
- [🧩 Problem Statement](#-problem-statement)
- [💡 Solution Summary](#-solution-summary)
- [✨ Core Innovation](#-core-innovation)
- [🛠 Technical Summary](#-technical-summary)
- [🔍 What Makes This Different From Others](#-what-makes-this-different-from-others)
- [👥 Team Roster (Team RKO)](#-team-roster-team-rko)

---

## 🧩 Problem Statement

Kenyan smallholder farmers generate real, verifiable economic activity every season — but almost none of it counts when they apply for credit. 

Agriculture is the backbone of the Kenyan economy, contributing **26% to the Gross Domestic Product**. Small-scale farming accounts for **78% of total agricultural production** in Kenya and contributes **23.5% of the country’s GDP**. 

Despite this, small-scale farmers in Kenya continue to face significant barriers in accessing formal credit. According to a study by AGRA, **only 15% of smallholder farmers in Kenya have access to formal credit**, with the majority relying on informal sources that are often expensive and unreliable. Most existing credit relies informally on relationships within local co-operatives.

This makes it difficult for farmers to access credit when they need it to purchase inputs like seeds, fertilizers, and equipment, or to invest in improving their farming practices and expanding operations.

| Signal | Example |
|---|---|
| 🌾 Consistent produce deliveries | Years of coffee/milk delivered to a cooperative |
| 💰 Regular cooperative payments | Predictable, if delayed, settlement income |
| 🔁 Input-loan repayment history | Advances repaid season after season |
| 🤝 Chama savings discipline | Years of consistent group contributions |
| 📆 Predictable seasonal income | Reliable, if irregular, cash flow |

**Yet all of this is fragmented** — scattered across cooperatives, chamas, informal lenders, and payment platforms that don't talk to each other. Traditional credit scoring simply can't see this farmer. 

> **The gap isn't willingness or ability to repay. It's fragmented, unreadable data.**

---

## 💡 Solution Summary

**Lima na Loop** is a Kenya-specific agricultural credit-scoring and financial infrastructure platform that aggregates verified data from existing agricultural ecosystems — cooperatives, chamas, and our own platform — into one contextual, explainable credit profile per farmer.

We don't replace cooperatives or agritech platforms. **We integrate with them.**

```
Cooperatives + Chamas + Produce History + Payment Data
                         ↓
         Agricultural Credit Scoring Engine
                         ↓
               Farmer Credit Profile
                         ↓
      LOOP API → Loan Disbursement & Bulk Payments
```

> We combine scattered cooperative records, chama behaviour, repayment history, farming activity, and agricultural risk data into a richer measure of farmer creditworthiness — then use **LOOP** as the financial execution layer for bulk cooperative payments and loan disbursement.

---

## ✨ Core Innovation

Payments are not our differentiator — **the credit score is.** LOOP is infrastructure; the intelligence layer is our IP.

### 1. Agriculture-Specific Credit Score
Built from five signal groups:

| Factor | Weight | What it captures |
|---|---|---|
| **Repayment history** | 30% | Across our platform *and* cooperative advances — no single institution's limited view |
| **Agricultural/income consistency** | 25% | Delivery frequency, volume, buyer consistency, seasonal patterns |
| **Savings & chama behaviour** | 15% | Contribution consistency, loan repayment within chamas — a distinctly Kenyan signal |
| **Cooperative activity/history** | 15% | Length and depth of cooperative participation |
| **Environmental/agricultural risk** | 10% | Climate zone, drought/flood exposure, crop-specific risk |
| **Platform data reliability** | 5% | Confidence weighting on data completeness |

### 2. Risk-Aware Credit Decisions
Environmental risk adjusts loan *context*, not farmer *character*. A farmer in a drought-prone zone with excellent repayment history isn't penalized as untrustworthy — the system recommends adjusted exposure or insurance requirements.

### 3. Explainable AI Engine
```
DATA → DETERMINISTIC CREDIT ENGINE → SCORE → AI → HUMAN-READABLE EXPLANATION
```
The AI layer explains the scoring engine's output in plain language ("strong repayment history, reduced slightly by drought exposure in this cycle"), keeping the model auditable, defensible, and safe.

---

## 🛠 Technical Summary

### Tech Stack

| Layer | Choice | Why |
|---|---|---|
| **Frontend** | React + TypeScript + Vite | Fast iteration, type-safe contract with backend |
| **Backend** | Node.js + TypeScript + Express/Fastify | Clean REST contract, modular service pattern |
| **Database** | PostgreSQL + Prisma ORM | Relational integrity for financial records |
| **Auth** | JWT | Role-based security (`FARMER`, `COOPERATIVE`, `ADMIN`) |
| **Payments** | LOOP API | Bulk disbursement + loan payout execution |

### 💳 LOOP API Integration Points
- **LOOP Bulk Payout API:** Batched, automated settlement payouts to 100+ farmers in a single call.
- **LOOP Instant Payouts:** Direct wallet/account loan disbursement upon credit score approval.
- **LOOP Webhooks:** Asynchronous settlement & transaction status processing.

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
                       CREDIT SCORE ──► AI EXPLAINER
                             │
                             ▼
                       LOOP SERVICE ──► LOOP API
```

### 🚀 Quick Start / Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/Nosh-thee-techy/CS.git
cd CS

# 2. Install dependencies
npm install

# 3. Start development environment
npm run dev
```

---

## 🔍 What Makes This Different From Others

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

## 👥 Team Roster

### **Team Name: RKO**

| Name | Role | Responsibilities |
|---|---|---|
| **Ravine Rianga** | Front End Developer | UI/UX implementation, component development & responsive design |
| **Francis Musau** | Product Designer | Product UX/UI design, user flow architecture & branding |
| **Blessings Wanjiku** | Frontend Engineer | Frontend state management, API integration & farmer portal |
| **Farouq Mohammed** | Integration's Officer / Backend Dev | LOOP API integration, payment webhooks & third-party connectors |
| **Peter Kariuki** | Backend Developer | Database architecture, credit scoring engine & REST APIs |

---

<div align="center">

<img src="https://img.shields.io/badge/UNLEASHLOOP.COM_Hackathon-FF6B00?style=for-the-badge" alt="UNLEASHLOOP Hackathon"/>

<br/>

*Sector Solutions × AI-led Business Transformation*

</div>
