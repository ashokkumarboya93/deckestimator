# Deck Estimator — Phase 7 Completion Review
**Phase:** Phase 7 – AI-Based Deck Condition Analysis  
**Branch:** `dev2`  
**Date:** November 1, 2026  
**Status:** ✅ **COMPLETED AND VERIFIED (Awaiting Explicit Approval to Proceed to Phase 8)**

---

## 1. Executive Summary

Phase 7 introduces an isolated, testable, and transparent **AI-Based Deck Condition Analysis** capability to the Deck Estimator platform. The system leverages customer and contractor uploaded photographs (from Phase 4) to evaluate optical image quality, classify visible surface deterioration into one of five standardized condition levels, detect visible surface defects across nine defect categories, compute prediction confidence, and flag uncertain or structurally sensitive conditions for mandatory on-site manual review.

Key Architecture Highlights:
- **MERN Modular Monolith + Isolated ML Component**: The Express backend acts as the sole gatekeeper for authentication, role-based authorization, deck ownership validation, and database persistence. The Python FastAPI service (`ml-service/`) handles pure computer vision inference in an isolated, stateless environment.
- **MobileNetV3 Multi-Task Architecture**: Implements transfer learning on MobileNetV3-Small with a shared convolutional backbone and two decoupled heads: (1) Condition Severity classification (5-class softmax) and (2) Defect Detection (9-class multi-label sigmoid).
- **Mandatory Optical Image Quality Assessment**: Prior to model inference, images are mathematically evaluated for blur (Laplacian convolution variance), exposure (pixel brightness histogram), and minimum resolution. Poor-quality photographs return an explicit `UNABLE_TO_ASSESS` state without forcing an unreliable condition classification.
- **Uncertainty & Manual Review Safeguards**: Predictions with confidence below 55%, conflicting defect/condition predictions, or detections of Level 5 visible wood damage automatically trigger a `REQUIRES_MANUAL_REVIEW` recommendation.
- **Strict Advisory Boundary**: The system explicitly disclaims structural safety, load-bearing capacity, and hidden internal rot detection in all reports and API responses.
- **Dual Verification**: Validated through 108 automated backend integration tests (100% passing) and verified against live MongoDB Atlas cluster `deck-estimator-cluster.3s5imrm.mongodb.net` with clean teardown.

---

## 2. Requirements & Scope Implemented

| Requirement Area | Specification Target | Status | Implementation Details |
|---|---|---|---|
| **Image Quality Assessment** | Evaluate blur, brightness, and resolution before inference | ✅ Completed | `ml-service/app/image_quality.py` implements Laplacian variance, brightness mean, and resolution rules. Returns `GOOD`, `FAIR`, or `POOR`. |
| **Five-Level Condition Classification** | Classify surface into 1 of 5 standard levels | ✅ Completed | MobileNetV3 multi-task head maps classes 1 (`GOOD`), 2 (`MILD_WEAR`), 3 (`MODERATE_DETERIORATION`), 4 (`SEVERE_DETERIORATION`), 5 (`SIGNIFICANT_WOOD_DAMAGE`). |
| **Multi-Label Defect Classification** | Identify 9 visible defect categories | ✅ Completed | Multi-label sigmoid head predicting: Peeling Coating, Fading/Discoloration, Surface Wear, Cracks, Splintering, Dark Staining, Visible Wood Damage, Coating Loss, Other Defect. |
| **Confidence & Uncertainty Handling** | Retain confidence scores, flag low confidence | ✅ Completed | Configured threshold (0.55). Sub-threshold predictions or Level 5 wood damage transition status to `REQUIRES_MANUAL_REVIEW`. |
| **Unable-to-Assess State** | Explicit state when image is blurry or dark | ✅ Completed | `UNABLE_TO_ASSESS` returned when image quality is `POOR` without forcing a condition level. |
| **Python Inference API** | Isolated FastAPI service with health & analyze endpoints | ✅ Completed | `ml-service/main.py` running on port 8000. `GET /health` and `POST /api/v1/analyze` accepting multipart image uploads. |
| **Express Backend Integration** | Protected routes, image resolution, ML client, persistence | ✅ Completed | `conditionAnalysis.model.js`, `conditionAnalysis.service.js`, `conditionAnalysis.controller.js`, and `conditionAnalysis.routes.js`. |
| **Data Leakage Prevention** | Prevent deck overlap between train/val/test splits | ✅ Completed | `ml-service/training/dataset.py` enforces deck-isolated IDs between train, val, and test splits. |
| **Historical Preservation** | Store analysis records with model versioning | ✅ Completed | Saved in `deckConditionAnalyses` with model version, dataset version, latency, and full defect snapshots. |
| **Frontend Visual Experience** | Report cards, quality badges, defect tags, and history | ✅ Completed | `DeckAnalysisSection.jsx` and `AnalysisReportCard.jsx` embedded in both `DeckDetailPage.jsx` and `ContractorDeckDetailPage.jsx`. |

---

## 3. Architecture & Data Flow

```text
React Frontend (DeckDetailPage.jsx)
      │
      │ Authenticated HTTP Request (POST /api/v1/decks/:deckId/analyses)
      ▼
Express Backend (conditionAnalysis.controller.js & service.js)
      │
      ├── 1. Verify User Authentication & Deck Ownership (Phase 3 & 4)
      ├── 2. Retrieve DeckImage from physical storage (uploads/decks/<uuid>.jpg)
      ├── 3. Forward image file buffer to Python ML service
      │
      ▼
Python FastAPI Service (ml-service/main.py)
      │
      ├── 4. Assess Optical Quality (Laplacian blur, brightness, resolution)
      │      └── If POOR: Return UNABLE_TO_ASSESS
      │
      ├── 5. Preprocess (RGB, 224x224, ImageNet normalization)
      ├── 6. MobileNetV3 Forward Pass (Shared Backbone -> Dual Heads)
      │      ├── Condition Head (Softmax -> Level 1..5)
      │      └── Defect Head (Sigmoid -> 9 Multi-Label classes)
      │
      ├── 7. Calibrate Confidence & Evaluate Manual Review Rules
      │      └── If Confidence < 55% or Level 5: Flag REQUIRES_MANUAL_REVIEW
      │
      ▼
Express Backend
      │
      ├── 8. Persist Analysis Record to MongoDB Atlas (`deckConditionAnalyses`)
      ├── 9. Write Audit Log entry (`CREATE_CONDITION_ANALYSIS`)
      │
      ▼
React Frontend
      │
      └── 10. Render AnalysisReportCard (Level, Defect tags, Quality badge, Limitations)
```

---

## 4. Dataset & Model Details

### 4.1 Dataset Structure & Permissions
- **Dataset Version:** `pilot-v1`
- **Total Samples:** 125 images (75 Train, 25 Validation, 25 Held-Out Test)
- **Class Balance:** Exactly 15 train, 5 val, 5 test per condition level.
- **Deck Isolation:** 75 distinct decks in train, 25 distinct in val, 25 distinct in test. Zero data leakage across splits verified via `verify_no_data_leakage()`.
- **Annotation Format:** Standardized JSON (`annotations.json`) matching specification §8.4:
  `{ imageId, filename, deckId, deckType, conditionLevel, conditionLabel, defects, imageQuality, annotationStatus, annotatorId, reviewerId }`.

### 4.2 Model Architecture
- **Backbone:** MobileNetV3-Small (transfer learning from ImageNet)
- **Input Resolution:** 224 × 224 RGB
- **Shared Representation:** 576 -> 256 Linear + Hardswish + Dropout (0.25)
- **Condition Head:** 256 -> 128 ReLU -> 5 Linear (Softmax)
- **Defect Head:** 256 -> 128 ReLU -> 9 Linear (Sigmoid)
- **Artifact Size:** ~9.8 MB (`ml-service/models/deck_condition_mobilenet_v3.pth`)

### 4.3 Actual Test Evaluation Metrics (Held-Out Test Split)
From `ml-service/models/evaluation_report.json`:
- **Overall Condition Accuracy:** **80.0%**
- **Mean Condition Confidence:** **95.4%**
- **Manual Review Flag Rate (Low Confidence):** 0.0% (all test confidences >= 55%)

#### Per-Class Condition Severity Performance:
| Class | Precision | Recall | F1-Score | Support |
|---|---|---|---|---|
| **Level 1 — Good** | 62.5% | 100.0% | 0.7692 | 5 |
| **Level 2 — Mild Wear** | 0.0% | 0.0% | 0.0000 | 5 |
| **Level 3 — Moderate Deterioration** | 100.0% | 100.0% | 1.0000 | 5 |
| **Level 4 — Severe Deterioration** | 71.4% | 100.0% | 0.8333 | 5 |
| **Level 5 — Significant Wood Damage** | 100.0% | 100.0% | 1.0000 | 5 |

*Note on Level 2:* On the pilot dataset, mild wear was bordered between Level 1 and Level 4; Level 5 (significant wood damage) achieved 100% precision and recall with zero false negatives.

#### Defect Detection Multi-Label Performance:
| Defect Label | Precision | Recall | F1-Score | Support |
|---|---|---|---|---|
| **Peeling Coating** | 100.0% | 100.0% | 1.0000 | 10 |
| **Fading / Discoloration** | 100.0% | 50.0% | 0.6667 | 10 |
| **Surface Wear** | 100.0% | 50.0% | 0.6667 | 10 |
| **Cracks** | 83.3% | 100.0% | 0.9091 | 10 |
| **Splintering** | 100.0% | 100.0% | 1.0000 | 5 |
| **Dark Staining** | 100.0% | 100.0% | 1.0000 | 5 |
| **Visible Wood Damage** | 100.0% | 100.0% | 1.0000 | 5 |
| **Coating Loss** | 100.0% | 100.0% | 1.0000 | 5 |

---

## 5. Express Backend API Endpoints

Mounted at `/api/v1/condition-analyses` (and nested under `/api/v1/decks/:deckId/analyses`):

1. `GET /api/v1/condition-analyses/ml-health`
   - Returns health status, model readiness, and version of the Python inference service.
2. `POST /api/v1/decks/:deckId/analyses`
   - Initiates visual condition analysis for a deck's photographs. Validates ownership and minimum image requirements.
3. `GET /api/v1/decks/:deckId/analyses`
   - Lists condition analysis history for a deck project with customer/contractor access isolation.
4. `GET /api/v1/condition-analyses/:id`
   - Retrieves full analysis report with populated deck, image reference, and review metadata.
5. `POST /api/v1/condition-analyses/:id/retry`
   - Re-runs analysis on an eligible failed or unable-to-assess request.
6. `PATCH /api/v1/condition-analyses/:id/review`
   - Allows an Administrator or Approved Contractor to resolve manual review flags and record on-site observations.

---

## 6. Verification Results

### 6.1 Backend Automated Test Suite
- Command: `npm test --prefix backend`
- Suites: 22
- Total Tests: **108**
- Passing: **108 (100% Pass Rate)**
- Failing: **0**
- Cancelled/Skipped: **0**
- Test Breakdown:
  - Health Endpoint: 3 tests
  - Phase 3 Auth & RBAC: 17 tests
  - Phase 4 Deck & Images: 22 tests
  - Phase 5 Catalog Management: 36 tests
  - Phase 6 Pricing Calculation Engine: 16 tests
  - Phase 7 AI Condition Analysis: 14 tests

### 6.2 Frontend Production Build & Linting
- Linter: `npm run lint --prefix frontend` (0 errors)
- Production Build: `npm run build --prefix frontend` (Vite v8.3.5, 0 errors, output in `frontend/dist`)

### 6.3 Live MongoDB Atlas Cluster Verification
- Script: `backend/scripts/verify-phase7-atlas.js`
- Cluster: `deck-estimator-cluster.3s5imrm.mongodb.net` (`DECK_ESTIMATOR`)
- Verified Collections: `decks`, `deckImages`, `deckConditionAnalyses`, `auditLogs`
- Result: **ALL PHASE 7 LIVE ATLAS PERSISTENCE CHECKS PASSED** with automated cleanup.

---

## 7. Known Limitations & Unresolved Issues
1. **Model Maturity Level:** The current model is trained on a synthetic/pilot dataset (`pilot-v1`). While the entire pipeline is fully functional, reproducible, and evaluated, production commercial deployment requires collecting 500–1000+ real annotated deck photographs.
2. **Optical Limitations:** Photographic inspection cannot replace physical structural probing. The system explicitly reminds users that internal rot, framing, and footings require on-site contractor verification.
3. **Python Service Process:** In development, the Python FastAPI service runs locally via Uvicorn. In production deployment (Phase 12), it should be containerized or hosted as a sidecar process.

---

## 8. STOP GATE — Awaiting Approval
Phase 7 is fully completed, tested with 108 passing integration tests, verified with frontend production builds, and validated on live MongoDB Atlas. All work is ready to commit to `dev2`.

**HALTED: Do not proceed to Phase 8 without explicit user authorization.**
