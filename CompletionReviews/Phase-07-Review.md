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

## 4. Dataset & Model Details (Targeted ML Validation Review)

### 4.1 Dataset Provenance, Licenses & Split Isolation
- **Dataset Version:** `pilot-v1`
- **Total Samples:** 125 images (75 Train, 25 Validation, 25 Held-Out Test)
- **Original Image Sources & Licenses:**
  - Zero external, crawled, or unauthorized customer photographs were used. In strict compliance with data integrity policies, 100% of the dataset was procedurally synthesized using Pillow and NumPy (`ml-service/training/pilot_dataset_generator.py`).
  - License: Internal project-generated synthetic assets under the Deck Estimator MIT license.
- **Synthetic Generation Process:**
  - Wooden plank surfaces (320 × 320 RGB) rendered with horizontal plank seams (inter-board gaps).
  - Base wood tones and Gaussian noise distributions calibrated by severity level (Amber/Cedar for Good, Weathered Grey/Brown for Mild Wear, Patchy Darker for Moderate, Severely Weathered for Severe, Deep Brown/Charcoal for Wood Damage).
  - Procedural defect primitives applied per level:
    - Level 2: Fading discoloration bands/ellipses.
    - Level 3: Peeling/flaking dark rectangular patches + discoloration + dark staining.
    - Level 4: Jagged grain-aligned surface crack lines + peeling + surface wear.
    - Level 5: Deep structural fissure lines (width=4) with jagged splinter flakes + cracks.
- **Split Isolation & Data Leakage Prevention:**
  - Each synthetic image is generated with an independent random seed and assigned to an explicitly unique simulated deck identifier:
    - Train: `deck_train_001` through `deck_train_075`
    - Validation: `deck_val_001` through `deck_val_025`
    - Test: `deck_test_001` through `deck_test_025`
  - Zero-Leakage Guarantee: `ml-service/training/dataset.py` implements `verify_no_data_leakage(train_ds, val_ds, test_ds)`, asserting that the set intersection of deck IDs across splits is strictly empty (`leakage_train_val = ∅`, `leakage_train_test = ∅`, `leakage_val_test = ∅`). Images derived from the same simulated photograph or deck cannot appear across multiple splits.
- **Annotation Format:** Standardized JSON (`annotations.json`) matching specification §8.4:
  `{ imageId, filename, deckId, deckType, conditionLevel, conditionLabel, defects, imageQuality, annotationStatus, annotatorId, reviewerId }`.

### 4.2 Model Architecture
- **Backbone:** MobileNetV3-Small (transfer learning initialized from ImageNet)
- **Input Resolution:** 224 × 224 RGB (ImageNet normalized)
- **Shared Representation:** 576 -> 256 Linear + Hardswish + Dropout (0.25)
- **Task A Head (Condition Severity):** 256 -> 128 ReLU -> 5 Linear (Softmax)
- **Task B Head (Defect Detection):** 256 -> 128 ReLU -> 9 Linear (Sigmoid)
- **Artifact Size:** ~9.8 MB (`ml-service/models/deck_condition_mobilenet_v3.pth`)

### 4.3 Test Evaluation Metrics & Confusion Matrix Analysis
From `ml-service/models/evaluation_report.json`:
- **Overall Condition Accuracy:** **80.0%** (20 / 25 test samples correct)
- **Mean Condition Confidence:** **95.4%**
- **Manual Review Flag Rate (Low Confidence):** 0.0% (all test confidences >= 55%)

#### Condition Severity Confusion Matrix (5 classes, 5 samples each):
```text
                  Predicted:
                 L1   L2   L3   L4   L5
Actual L1 (Good): [ 5,   0,   0,   0,   0 ]
Actual L2 (Mild): [ 3,   0,   0,   2,   0 ]  <-- Misclassified (3 to L1, 2 to L4)
Actual L3 (Mod):  [ 0,   0,   5,   0,   0 ]
Actual L4 (Sev):  [ 0,   0,   0,   5,   0 ]
Actual L5 (Dam):  [ 0,   0,   0,   0,   5 ]
```

#### Per-Class Condition Severity Performance:
| Class | Precision | Recall | F1-Score | Support | Status / Misclassification Note |
|---|---|---|---|---|---|
| **Level 1 — Good** | 62.5% | 100.0% | 0.7692 | 5 | FP from 3 misclassified Level 2 samples |
| **Level 2 — Mild Wear** | **0.0%** | **0.0%** | **0.0000** | 5 | **Failed**: 3 misclassified as L1, 2 as L4 |
| **Level 3 — Moderate Deterioration** | 100.0% | 100.0% | 1.0000 | 5 | Perfect classification |
| **Level 4 — Severe Deterioration** | 71.4% | 100.0% | 0.8333 | 5 | FP from 2 misclassified Level 2 samples |
| **Level 5 — Significant Wood Damage** | 100.0% | 100.0% | 1.0000 | 5 | Perfect classification, zero false negatives |

#### Root Cause Analysis of Level 2 Failure:
1. **Feature Separability & Synthetic Annotation:** Level 2 ("Mild Wear") in the procedural generator was created with subtle color shifting (`base_color: (160, 130, 95)` vs `(195, 135, 75)` for Level 1) and small Gaussian noise (12 vs 5) with diffuse fading ellipses. Unlike Levels 3, 4, and 5 (which possess sharp geometric features like dark rectangular peeling patches, jagged crack vectors, or deep fissure lines), Level 2 has no distinct high-frequency edge artifacts.
2. **Small Support & Class Imbalance:** With only 15 training examples per class (75 total) and 5 epochs of training on CPU, convolutional filters optimized rapidly for high-contrast spatial features. The boundary between Level 1 ("clean/good") and Level 2 ("mild wear") collapsed into Level 1, while slight noise variations mapped into Level 4.
3. **Loss Formulation (Categorical vs Ordinal):** Severity levels are inherently ordinal (1 < 2 < 3 < 4 < 5), but standard multi-class cross-entropy treats them as independent unordered categories. The model lacked ordinal penalty for adjacent-class confusion.
- **Conclusion:** The issue stems from **pilot synthetic dataset subtlety and small support (15 train samples)** combined with standard categorical cross-entropy, not an architectural defect in MobileNetV3.

### 4.4 Confidence Reliability & Calibration Limitations
- **Why Mean Confidence is 95.4% Despite 80% Accuracy:**
  - Modern deep neural networks trained with cross-entropy loss suffer from uncalibrated softmax overconfidence (Guo et al., ICML 2017). Softmax exponentiates unnormalized logits, amplifying even moderate logit margins into near-saturation probabilities (90–99%).
  - For the 5 misclassified Level 2 samples, the model output high softmax scores (e.g. >90%) for Level 1 or Level 4.
  - No temperature scaling, Platt scaling, or isotonic regression was applied to the pilot model.
- **Evaluation of the 55% Reliability Threshold:**
  - On the held-out test split, `lowConfidenceCount` was 0 (0.0% flag rate) because all predicted probabilities exceeded 0.55 despite the 20% error rate.
  - Finding: An uncalibrated softmax confidence threshold of 55% **is not sufficient on its own** to catch subtle misclassifications.
  - Multi-Layer Safety Guardrails: To mitigate this, Phase 7 implements a multi-layer defense in `ml-service/app/model.py`:
    1. Confidence threshold check (<55%).
    2. Mandatory manual review on Level 5 (`SIGNIFICANT_WOOD_DAMAGE`) regardless of confidence score.
    3. Conflicting prediction check (flagging when `VISIBLE_WOOD_DAMAGE` defect is detected while overall condition is scored as Level 1 or 2).
  - Production Recommendation: Post-hoc temperature scaling on a real-world validation set will be required before production deployment.

### 4.5 Defect Detection Multi-Label Performance (All 9 Labels Verified)
All 9 defect labels specified in `Docs/phase_7.md` are present across the model architecture (`DEFECT_LABELS` in `model.py`), annotation schema (`pilot_dataset_generator.py`), FastAPI inference payload (`main.py`), and evaluation report (`evaluation_report.json`):

| Defect Label | Precision | Recall | F1-Score | Support | Notes |
|---|---|---|---|---|---|
| **Peeling Coating** | 100.0% | 100.0% | 1.0000 | 10 | Present in Levels 3 & 4 |
| **Fading / Discoloration** | 100.0% | 50.0% | 0.6667 | 10 | Present in Levels 2 & 3 |
| **Surface Wear** | 100.0% | 50.0% | 0.6667 | 10 | Present in Levels 2 & 4 |
| **Cracks** | 83.3% | 100.0% | 0.9091 | 10 | Present in Levels 4 & 5 |
| **Splintering** | 100.0% | 100.0% | 1.0000 | 5 | Present in Level 5 |
| **Dark Staining** | 100.0% | 100.0% | 1.0000 | 5 | Present in Level 3 |
| **Visible Wood Damage** | 100.0% | 100.0% | 1.0000 | 5 | Present in Level 5 (Triggers manual review) |
| **Coating Loss** | 100.0% | 100.0% | 1.0000 | 5 | Present in Level 4 |
| **Other Visible Defect** | **0.0%** | **0.0%** | **0.0000** | **0** | **Support = 0 in pilot test split** |

*Note on `Other Visible Defect`:* In the pilot dataset, synthetic procedural generation only created specific defect primitives for the 8 primary categories. The catch-all category `OTHER_VISIBLE_DEFECT` had 0 positive instances in the test split (support = 0). Under Scikit-learn's `zero_division=0` convention, this calculates as 0.0 metrics. The label is fully wired through the model tensor output (index 8) and API response.

### 4.6 Multi-Photograph Analysis & Aggregation Boundary
- **Per-Image Analysis Storage:**
  - Predictions are stored **per image analysis request** in individual `ConditionAnalysis` MongoDB documents.
  - If a deck has multiple photos, `POST /api/v1/decks/:deckId/analyses` accepts an optional `imageId` in the request body to analyze a specific photo. If omitted, the backend defaults to the single latest uploaded image (`images[0]`).
  - The Python ML inference service operates on a single image file per request (`file: UploadFile = File(...)`).
- **Deck-Level Aggregation Limitation:**
  - There is currently **no automated multi-image aggregation algorithm implemented** (such as worst-case pooling, majority voting, confidence-weighted averaging, or spatial fusion).
  - Each uploaded photograph analyzed generates its own discrete record in the `deckConditionAnalyses` history.
  - **Explicit Architectural Boundary:** No ad-hoc deck-level aggregation formula has been invented. The customer and contractor UI displays analysis cards per analyzed photograph. Multi-photo composite scoring is reserved for future specification with structural engineering approval.

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

## 7. ML Maturity Classification & Known Limitations

### 7.1 Final ML Maturity Classification
- **Official Classification:** 🔬 **EXPERIMENTAL / PROOF-OF-CONCEPT PILOT ONLY** (Explicitly **NOT Production-Validated**).
- **Justification Based on Empirical Findings:**
  1. **Dataset Nature:** The model is trained and evaluated on 125 procedurally synthesized wood plank textures (`pilot-v1`), with 0 real customer field photographs.
  2. **Class-Level Failure:** Level 2 (Mild Wear) achieved 0% precision, 0% recall, and 0.0000 F1 on the held-out test split, collapsing into Level 1 and Level 4.
  3. **Uncalibrated Confidence:** Mean prediction confidence is 95.4% despite a 20% test classification error rate. Softmax probabilities are saturated and uncalibrated; the static 55% threshold failed to trigger on any misclassified test instances.
  4. **Defect Class Support:** `OTHER_VISIBLE_DEFECT` had 0 positive support in the test split.
  5. **Domain Diversity:** The pilot model has not been evaluated against diverse real-world environmental factors (sun glare, wet wood, leaves/dirt debris, varied camera sensors, stain finishes, and composite materials).
- **Engineering Readiness:** The software engineering foundation (MERN API routes, Joi schemas, Mongoose models, role isolation, audit logging, image quality gating, and React 19 UI) is fully production-grade and passes 108/108 integration tests. However, the machine learning weights must remain classified as experimental until trained on real-world annotated data.

### 7.2 Architectural & Functional Limitations
1. **Multi-Photograph Deck Aggregation:** Predictions are evaluated and stored per discrete image. There is currently no multi-image deck aggregation algorithm (e.g. worst-case pooling or confidence-weighted voting). Each uploaded photo has its own analysis card.
2. **Optical Physical Boundaries:** Photographic visual inspection cannot detect internal structural rot, joist decay, termite damage, or ledger board detachment. Photographic analysis is strictly advisory.
3. **Deployment Topology:** In development, the Python ML inference service runs via Uvicorn on localhost:8000. In production (Phase 12), it should be containerized as an independent sidecar or container service.

---

## 8. STOP GATE — Awaiting Approval
Phase 7 is fully completed, tested with 108 passing integration tests, verified with frontend production builds, and validated on live MongoDB Atlas. All work is ready to commit to `dev2`.

**HALTED: Do not proceed to Phase 8 without explicit user authorization.**

