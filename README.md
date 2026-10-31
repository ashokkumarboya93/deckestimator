# Deck Estimator

A web-based Deck Restoration Estimator and Lead Management Platform.

The platform supports three primary user roles:
1. Customer
2. Contractor
3. Administrator

## Tech Stack

- **Frontend:** React + Vite + React Router + Axios
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Architecture:** Modular Monolithic Architecture

## Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- npm

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/ashokkumarboya93/deckestimator.git
cd deckestimator
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env      # Edit .env with your MongoDB URI
npm install
npm run dev                # Starts on http://localhost:5000
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev                # Starts on http://localhost:5173
```

### 4. Verify

- Health check: http://localhost:5000/api/v1/health
- Frontend: http://localhost:5173

## Official 12-Phase Development Sequence

- [x] Phase 1: Project Inspection, Requirements Analysis & Architecture
- [x] Phase 2: Project Structure, Application Skeleton & Backend Foundation
- [x] Phase 3: Authentication & Authorization
- [ ] Phase 4: Deck Input Management & Secure File Uploads
- [ ] Phase 5: Material & Service Catalog Management
- [ ] Phase 6: Pricing Calculation Engine & Estimate Management
- [ ] Phase 7: AI-Based Deck Condition Analysis
- [ ] Phase 8: Contractor Verification & Lead Management
- [ ] Phase 9: Contractor Discounts & Commission Management
- [ ] Phase 10: Administrative Dashboard & Platform Management
- [ ] Phase 11: Integration, Security & Quality Assurance
- [ ] Phase 12: Deployment, Documentation & Production Readiness

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [HLD & LLD](docs/HLD_LLD.md)
- [Phase 3 Review](CompletionReviews/Phase_3_Completion_Review.md)

## License

ISC
