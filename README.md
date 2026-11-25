# Deck Restoration Plus (DRP) — Estimator & Platform Command Center

[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-purple.svg)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen.svg)](https://www.mongodb.com/)
[![Railway](https://img.shields.io/badge/Railway-Production%20Live-blueviolet.svg)](https://deckestimatorplus.up.railway.app)

An enterprise-grade, full-stack **Deck Restoration Estimator, Lead Dispatch, and Contractor Management Platform** built with a modular Node.js/Express + MongoDB backend and a React + Vite single-page frontend.

---

## 🌐 Live Production Deployments (Railway)

- **Web Application (Frontend):** [https://deckestimatorplus.up.railway.app](https://deckestimatorplus.up.railway.app)
- **REST API & Health Check (Backend):** [https://deckestimatorplus-api.up.railway.app/api/v1/health](https://deckestimatorplus-api.up.railway.app/api/v1/health)

---

## 🌟 Core Portals & Capabilities

### 1. 🏡 Customer Portal
- **Continuous Deck Restoration Estimator**: Real-time calculation engine supporting deck shapes, linear railings (`4 sq ft/LF`), count-based stair steps (`12 sq ft/step`), fascia, posts, joists, pergola, privacy walls, wood species modifiers, elevation access tiers, and stacked-finish add-ons.
- **Deck Condition & Photo Assessment**: Upload daylight deck photos, report structural conditions (good, weathered, mold, peeling, cracked, loose, rotted, warped, water-damaged), and convert estimates directly into verified booking inquiries (`Estimation Service`) synced with Admin Leads and Projects.
- **Role-Isolated Estimate Output**: Customers receive a clean, transparent single-number total (with optional `$2,500` local / `$3,000` extended mobilization floor notice) and one-click **PDF** and **Excel** exports.
- **Profile & Self-Service Account Deletion**: Manage contact details, address, avatar, password, or permanently delete account from MongoDB.

### 2. 🔨 Contractor Portal
- **Verification & Compliance Hub**: Upload Contractor License, General Liability Insurance, and Business Registration certificates for administrative review.
- **Wholesale Trade Discounts**: Automatic **5% default wholesale contractor discount** (or custom admin-tuned individual percentage override) applied directly inside the estimator.
- **Full Technical Breakdown & Repair Engine**: View itemized base hours, wood/access labor adjustments (`$250/hr`), low–high pricing ranges, and overlap-prevented repair estimates.
- **Leads, Projects & Commissions**: Manage assigned customer leads, track 4-stage project progress, and monitor commissions/earnings.
- **Profile & Self-Service Account Deletion**: Manage personal/business credentials, compliance documents, or permanently delete account.

### 3. 🛡️ Administrator Command Center
- **Live Executive Dashboard**: Real-time KPIs, growth percentages, activity trends, and resilient database count fallbacks so metrics never drop to zero.
- **User Management & Dossier Profiles**: Multi-tab user directory (`Active`, `Blocked`, `Inactive`), bulk/individual permanent DB deletion (allowing clean email re-registration), block/unblock moderation, and full user dossier pages with real estimates, decks, enquiries, and direct PDF downloads.
- **Verification & Progress**: Review contractor applications, compliance documents, and wholesale discount requests with live sidebar alert bubbles.
- **Lead Management & 4-Stage Projects**: Differentiated `Reach Out` vs. `Estimation Service` lead routing, uploaded photo inspection, PDF/CSV/Excel exports, and live stage updates synced to Customer/Contractor portals.
- **Pricing & Discounts Tuning Engine**: Live editing of Master Rates (`$250/hr`, `$2,500`/`$3,000` floors, `$200` travel fee), 12-cell Base Rate Card Matrix, Wood Species, Deck Components, Scope of Work production speeds, and Individual Contractor Trade Discount tuning.
- **Reports, Analytics & Audit Trail**: Real-time revenue analytics, leads & projects charts, contractor leaderboard, catalog/wood demand plots, and a **System Audit Trail** with concise summaries and **See More / See Less** expansion.
- **System Settings & Targeted Notifications**: Search and multi-select specific customers/contractors by name, email, phone, or company to dispatch in-app notifications, configure contact channels, and monitor database diagnostics.
- **Admin Guidelines & Manuals**: Interactive operational SOPs with direct one-click PDF downloads for both the **Admin Manual** and **Calculator Engine & Formulas Guide**.

---

## 🔐 Authentication, Security & UX Enhancements
- **Mandatory Mobile Phone Number** on both Customer and Contractor registration.
- **Secure Email-Based Password Reset** (`/reset-password?token=...&email=...`) requiring both token validation and email identity lookup.
- **First-Time Welcome Modal**: Role-tailored onboarding modal displayed once per newly registered user account.
- **Global Scroll-to-Top**: Every route transition resets scroll position to `(0, 0)`.
- **Pure CSS V-Grade Triple Dots Loader**: Lightweight `.ld-dots` indicator on authentication and action flows.

---

## 🧮 Calculator Engine Internal Working

The complete mathematical model (`F1–F15`), rate cards, production speeds, wood/access modifiers, damage overlap-prevention rules, and verified worked examples are documented in:
- **[Calculator Engine Specification](docs/DECK_RESTORATION_PLUS_CALCULATOR_ENGINE_SPECIFICATION.md)**

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js**: v20+
- **npm**: v9+
- **MongoDB Atlas** or local MongoDB instance

### 1. Clone & Configure
```bash
git clone https://github.com/ashokkumarboya93/deckestimator.git
cd deckestimator
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env       # Configure MONGODB_URI, JWT_SECRET, FRONTEND_URL
npm install
npm run dev                # Runs Express API on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ../frontend
cp .env.example .env       # Configure VITE_API_BASE_URL=http://localhost:5000/api/v1
npm install
npm run dev                # Runs Vite SPA on http://localhost:5173
```

---

## 🏗️ Repository Structure

```text
DeckEstimator/
├── README.md
├── backend/
│   ├── src/
│   │   ├── config/          # Database connection, env, CORS, seeders
│   │   ├── middleware/      # JWT auth, RBAC, validation, error handler
│   │   ├── modules/         # auth, users, decks, estimates, pricing,
│   │   │                    # discounts, leads, contractors, commissions, admin
│   │   ├── shared/          # Constants, custom errors, AuditLog model
│   │   ├── app.js
│   │   └── server.js
│   └── tests/
├── docs/
│   ├── DECK_RESTORATION_PLUS_CALCULATOR_ENGINE_SPECIFICATION.md
│   ├── Admin_Complete_Desc.md
│   ├── API-Manual-Testing-Guide.md
│   └── COMPLETE_PAGE_BY_PAGE_TESTING_GUIDE.md
└── frontend/
    └── src/
        ├── app/             # Router & App root (with global scroll-to-top)
        ├── assets/styles/   # Global CSS & pure CSS V-Grade loader
        ├── components/      # Shared modals, skeletons, WelcomeGreetingModal
        ├── context/         # AuthContext & notification state
        ├── features/        # auth, landing, customer, contractor, admin
        └── utils/           # reportExport.js, adminGuidelinesPdf.js, imageOptimizer.js
```

---

## 🧪 Verification & Testing

- **Frontend Production Build:** `npm --prefix frontend run build`
- **Backend Automated Tests:** `npm --prefix backend test`
- **API Health Check:** `GET /api/v1/health`

---

## 📄 License
ISC License — Deck Restoration Plus (DRP).
