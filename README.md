# Deck Restoration Plus (DRP) — Estimator & Platform Command Center

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-purple.svg)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen.svg)](https://www.mongodb.com/)
[![Status](https://img.shields.io/badge/All%20Phases-100%25%20Completed-success.svg)](#official-12-phase-development-status)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](#license)

An enterprise-grade, web-based Deck Restoration Estimator, Lead Matching, and Contractor Commission Management platform built with high-performance modular monolithic architecture.

---

## 🌟 Platform Capabilities & Three Core Portals

### 1. 🏡 Customer Portal
- **Continuous Deck Estimator**: Interactive calculation engine with real-time dynamic pricing based on surface square footage, board dimensions, railing types, stairs, and structural condition.
- **Deck Condition Assessment**: Upload deck photos and evaluate wood condition, previous coatings, and degradation factors to generate tailored restoration recommendations.
- **Instant Detailed Estimates**: Receive transparent, itemized quotes across Good, Better, and Best material/coating packages.
- **Contractor Lead Dispatch**: Submit estimates directly to vetted local contractors for project scheduling.

### 2. 🔨 Contractor Portal
- **Compliance & License Verification**: Document upload portal (Contractor License, General Liability Insurance, Worker's Comp) with admin verification gating.
- **Lead Pipeline Management**: View, accept, or decline assigned customer restoration leads.
- **Commercial Estimate Builder**: Custom proposal generator with adjustable labor markups and material specifications.
- **Commissions & Payout Dashboard**: Real-time earnings tracker, commission liability breakdown, and transaction history.
- **Exclusive Partner Discounts**: Access supplier material tier discounts directly through the portal.

### 3. 🛡️ Administrator Command Center
- **System Overview & Financial Telemetry**: High-level platform health, pipeline volume, completed revenue, and commission liabilities.
- **Contractor Compliance Audit**: Real-time review and 1-click approval/rejection of contractor licenses and compliance certificates.
- **User & Access Management**: Manage user accounts, enforce account activations, block abusive actors, and prevent unauthorized role demotion.
- **Catalog & Pricing Engine Administration**: Configure material prices, service rates, compatibility rules, and calculation coefficients live without code restarts.
- **Platform Settings & Policy Engine**: Global commission tiers, payout schedules, security rules, and audit logging.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB Atlas** or local MongoDB instance

### 1. Repository Setup
```bash
git clone https://github.com/ashokkumarboya93/deckestimator.git
cd deckestimator
```

### 2. Backend API Setup
```bash
cd backend
cp .env.example .env       # Configure your MONGODB_URI and JWT_SECRET
npm install
npm run dev                 # Starts Express API server on http://localhost:5000
```

### 3. Frontend Application Setup
```bash
cd ../frontend
cp .env.example .env       # Configured to http://localhost:5000/api/v1
npm install
npm run dev                 # Starts Vite dev server on http://localhost:5173
```

### 4. Live Server Endpoints
- **Web Application**: [http://localhost:5173](http://localhost:5173)
- **API Health Check**: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

---

## 🔐 Verified Demo Credentials

The platform database has been pre-configured and seeded with verified accounts:

| Role | Email Address | Default Password | Status |
| :--- | :--- | :---: | :---: |
| **System Admin** | `admin@deckestimator.com` | `DRP@2026` | Active / Superadmin |
| **Customer** | `ashok222@gmail.com` | `Password123!` | Active |
| **Customer** | `uab1@gmail.com` | `Password123!` | Active |
| **Customer** | `thrisha@gmail.com` | `Password123!` | Active |
| **Customer** | `akshithasiddam02@gmail.com` | `Password123!` | Active |
| **Customer** | `versebunny24@gmail.com` | `Password123!` | Active |
| **Contractor** | `ashok01builder@gmail.com` | `Password123!` | Verified & Approved |
| **Contractor** | `erukondathrisha123@gmail.com` | `Password123!` | Verified & Approved |
| **Contractor** | `akshitha24@gmail.com` | `Password123!` | Verified & Approved |
| **Contractor** | `sandeep@gmail.com` | `Password123!` | Verified & Approved |
| **Contractor** | `arun@gmail.com` | `Password123!` | Verified & Approved |

---

## 🏗️ Project Architecture & Clean Tree

Following a comprehensive 10-batch repository optimization and waste cleanup, the project structure is strictly streamlined:

```
E:\DeckEstimator\
├── .editorconfig
├── .env.example
├── .gitignore
├── DELETED_FILES_LOG.md                # Full chronological cleanup audit log
├── PROJECT_STRUCTURE_CLEANUP_AUDIT.md  # Master structural cleanup report
├── README.md                           # Master platform documentation
├── backend/                            # Node.js + Express REST API
│   ├── src/
│   │   ├── config/                     # Database, CORS, autoSeed, and storage configuration
│   │   ├── middleware/                 # Auth, RBAC, error handling, validation, rate limits
│   │   ├── modules/                    # Feature modules (Auth, Users, Decks, Estimates,
│   │   │                               # Catalogs, Contractors, Commissions, Admin)
│   │   ├── app.js                      # Express application assembly
│   │   └── server.js                   # HTTP server entrypoint
│   ├── scripts/                        # Database seeders and Atlas validator sync scripts
│   ├── tests/                          # Automated integration test suite
│   └── uploads/                        # User avatars, deck photos, and contractor compliance docs
├── docs/                               # Canonical technical & architectural specifications
│   ├── Phase_1_HLD_LLD.md              # High-Level & Low-Level Design Architecture
│   ├── Phase_2_ARCHITECTURE.md         # Application foundation & schema specifications
│   ├── DECK_RESTORATION_PLUS_CALCULATOR_ENGINE_SPECIFICATION.md # Mathematical pricing model
│   ├── API-Manual-Testing-Guide.md     # 7-section manual API endpoint test reference
│   ├── Admin_Complete_Desc.md          # Complete Administrator command center documentation
│   └── COMPLETE_PAGE_BY_PAGE_TESTING_GUIDE.md # 25-step visual testing runbook
└── frontend/                           # React 18 + Vite Single Page Application
    ├── public/                         # Public SVG icons and favicons
    └── src/
        ├── app/                        # Router configuration and global App entry
        ├── components/                 # Shared UI components (Modals, Navbars, Alerts)
        ├── context/                    # Authentication and Notification Contexts
        ├── features/                   # Feature slices (landing, auth, customer, contractor, admin)
        ├── layouts/                    # Role-specific portal layouts
        └── utils/                      # Formatting, math helpers, and report export engines
```

---

## 📋 Official 12-Phase Development Status

Every phase in the platform roadmap is **100% completed and fully functional**:

- [x] **Phase 1: Requirements Analysis, HLD & LLD System Design**
- [x] **Phase 2: Project Architecture, Monolithic Skeleton & Database Schema**
- [x] **Phase 3: Fast Authentication, RBAC & Cookie Token Management**
- [x] **Phase 4: Deck Input Configuration & Multi-Photo Uploads**
- [x] **Phase 5: Material & Service Catalog Engine with Compatibility Rules**
- [x] **Phase 6: Multi-Option Pricing Calculation Engine & Estimates Management**
- [x] **Phase 7: Deck Condition Analysis & Restoration Recommendations**
- [x] **Phase 8: Contractor Onboarding, Verification & Lead Dispatching**
- [x] **Phase 9: Contractor Commission Settlements & Tiered Discounts**
- [x] **Phase 10: Administrative Command Center & Audit Logging**
- [x] **Phase 11: Security Hardening, Rate Limiting & Integration Testing**
- [x] **Phase 12: Production Readiness, Database Optimization & Structure Cleanup**

---

## 🧪 Testing & Quality Assurance

### Run Automated Backend Test Suite
```bash
npm --prefix backend test
```
The test suite validates:
- Customer and Contractor registration & authentication isolation.
- Token security, HttpOnly cookie enforcement, and role-based route guards.
- Calculation engine pricing accuracy and rounding tolerance.
- Administrative self-demotion blocks and catalog CRUD operations.

---

## 📚 Technical Documentation Index

Detailed architectural and operational documentation is maintained in the [docs/](docs) directory:

1. **Architecture & Design**:
   - [High-Level & Low-Level System Design (Phase 1)](docs/Phase_1_HLD_LLD.md)
   - [System Architecture & Schema Design (Phase 2)](docs/Phase_2_ARCHITECTURE.md)
2. **Pricing Engine**:
   - [Deck Calculator Mathematical Engine Specification](docs/DECK_RESTORATION_PLUS_CALCULATOR_ENGINE_SPECIFICATION.md)
   - [Estimator Feature Review](docs/DECK_RESTORATION_PLUS_ESTIMATOR_REVIEW.md)
3. **Portal & Testing Runbooks**:
   - [Complete Administrator Command Center Guide](docs/Admin_Complete_Desc.md)
   - [25-Step Page-by-Page Visual Testing Guide](docs/COMPLETE_PAGE_BY_PAGE_TESTING_GUIDE.md)
   - [API Manual Testing Guide](docs/API-Manual-Testing-Guide.md)
4. **Maintenance & Audit**:
   - [Project Structure Cleanup Audit](PROJECT_STRUCTURE_CLEANUP_AUDIT.md)
   - [Chronological Deletion Audit Trail](DELETED_FILES_LOG.md)

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
