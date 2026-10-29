# DECK PRO — Deck Restoration Estimator

A full-stack MERN application for deck restoration cost estimation, contractor management, and lead generation.

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Architecture:** Modular monolith

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

## Project Structure

```
deck-pro/
├── frontend/        # React + Vite application
├── backend/         # Express REST API
├── docs/            # Architecture, HLD, LLD, specs
├── tests/           # Cross-module E2E tests
├── .gitignore
├── .editorconfig
└── README.md
```

## Development Phases

- [x] Phase 1: Project skeleton & configuration
- [ ] Phase 2: Authentication & authorization
- [ ] Phase 3: Deck inputs & file handling
- [ ] Phase 4: Catalog & pricing configuration
- [ ] Phase 5: Estimate calculation & history
- [ ] Phase 6: AI condition analysis
- [ ] Phase 7: Contractor verification & leads
- [ ] Phase 8: Admin workflows, discounts, reports

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [HLD & LLD](docs/HLD_LLD.md)

## License

ISC
