# Deck Estimator — API Testing & Verification Report (Batch 1: API-001 to API-030)

**Date:** November 2, 2026  
**Environment:** Local Development (`http://localhost:5000/api/v1`)  
**Database:** MongoDB Atlas (`DECK_ESTIMATOR`)  
**Automated Test Suite Status:** 222 / 222 Passing (100%)  
**Batch 1 Live HTTP Testing Status:** 29 / 30 Passing (96.7%)  

---

## 1. Executive Summary

We executed live HTTP testing across the first 30 APIs against the active backend server and MongoDB database.

* **Working & Verified:** **29 out of 30 APIs** passed successfully with actual HTTP 200 / 201 status codes and verified database persistence.
* **Pending AI Removal:** **1 API (API-017)** returned 500 (`ML inference service is currently unavailable`) because it invokes the Python FastAPI computer-vision microservice. Per user instruction, this AI deck detector feature is scheduled for removal next.
* **Documentation Synchronization:** Updated [`docs/API-Manual-Testing-Guide.md`](file:///e:/DeckEstimator/docs/API-Manual-Testing-Guide.md) for API-002, API-013, API-019, API-023, API-024, API-025, API-028, API-029, and API-030 with canonical backend schemas.

---

## 2. Batch 1 (API-001 to API-030) Live HTTP Execution Results

| API ID | Method | Endpoint | Tested Status | Result | Notes |
|---|---|---|---|---|---|
| **API-001** | `GET` | `/health` | **200 OK** | **PASS** | Server uptime and environment verified. |
| **API-002** | `POST` | `/auth/register` | **201 Created** | **PASS** | Customer registered with canonical `fullName` and `phone`. |
| **API-003** | `POST` | `/auth/login` | **200 OK** | **PASS** | JWT session token and HttpOnly cookie issued. |
| **API-004** | `POST` | `/auth/logout` | **200 OK** | **PASS** | Session cleared and cookie invalidated. |
| **API-005** | `GET` | `/auth/me` | **200 OK** | **PASS** | Authenticated session verified without password leakage. |
| **API-006** | `GET` | `/users/me` | **200 OK** | **PASS** | User profile details retrieved. |
| **API-007** | `PATCH` | `/users/me` | **200 OK** | **PASS** | Profile fields (`fullName`, `phone`) updated. |
| **API-008** | `POST` | `/decks` | **201 Created** | **PASS** | Deck project created with computed area. |
| **API-009** | `GET` | `/decks` | **200 OK** | **PASS** | Customer decks retrieved with strict user isolation. |
| **API-010** | `GET` | `/decks/:id` | **200 OK** | **PASS** | Specific deck project retrieved by ID. |
| **API-011** | `PATCH` | `/decks/:id` | **200 OK** | **PASS** | Deck specifications and dimensions updated. |
| **API-012** | `DELETE` | `/decks/:id` | **200 OK** | **PASS** | Soft delete performed. |
| **API-013** | `POST` | `/decks/:id/images` | **201 Created** | **PASS** | Multipart upload handled `application/octet-stream`, verified magic numbers, saved to disk & DB. |
| **API-013 (Sec)** | `POST` | `/decks/:id/images` | **400 Bad Request** | **PASS** | Disguised fake `.png` file rejected by binary inspection before storage. |
| **API-014** | `GET` | `/decks/:id/images` | **200 OK** | **PASS** | List of uploaded deck photo metadata retrieved. |
| **API-015** | `GET` | `/decks/:id/images/:imageId` | **200 OK** | **PASS** | Private deck image stream served with `image/png` header. |
| **API-016** | `DELETE` | `/decks/:id/images/:imageId` | **200 OK** | **PASS** | Photo deleted and disk storage cleaned up. |
| **API-017** | `POST` | `/decks/:id/analyses` | **500 Error** | **PENDING** | Python ML service unavailable. Target for removal per user instruction. |
| **API-018** | `GET` | `/decks/:id/analyses` | **200 OK** | **PASS** | Returns analyses array for deck. |
| **API-019** | `POST` | `/catalog/material-categories` | **201 Created** | **PASS** | Admin created category using canonical `name`, `description`, `status`. |
| **API-020** | `GET` | `/catalog/material-categories` | **200 OK** | **PASS** | Paginated categories retrieved. |
| **API-021** | `GET` | `/catalog/material-categories/:id` | **200 OK** | **PASS** | Category retrieved by ObjectId. |
| **API-022** | `PATCH` | `/catalog/material-categories/:id` | **200 OK** | **PASS** | Description and displayOrder patched. |
| **API-023** | `PUT` | `/catalog/material-categories/:id` | **200 OK** | **PASS** | Category fully replaced via PUT. |
| **API-024** | `PATCH` | `/catalog/material-categories/:id/status` | **200 OK** | **PASS** | Status toggled to `"inactive"` via canonical `{ "status": "inactive" }`. |
| **API-025** | `POST` | `/catalog/materials` | **201 Created** | **PASS** | Material created using canonical `cost`, `coverage`, `specifications`, `materialType`. |
| **API-026** | `GET` | `/catalog/materials` | **200 OK** | **PASS** | Materials listed with surface filter. |
| **API-027** | `GET` | `/catalog/materials/:id` | **200 OK** | **PASS** | Material retrieved by ObjectId. |
| **API-028** | `PATCH` | `/catalog/materials/:id` | **200 OK** | **PASS** | Material cost and description patched. |
| **API-029** | `PUT` | `/catalog/materials/:id` | **200 OK** | **PASS** | Material fully replaced via PUT. |
| **API-030** | `PATCH` | `/catalog/materials/:id/status` | **200 OK** | **PASS** | Material status toggled to `"inactive"`. |

---

## 3. Investigation & Resolution Details for Reported Issues

### 1. API-013: Deck Image Upload (Fixed in Code)
* **Root Cause:** Postman form-data file picker defaulted the part's Content-Type to `application/octet-stream`. Multer's `fileFilter` rejected this before reading the buffer.
* **Resolution:** In [`file.routes.js`](file:///e:/DeckEstimator/backend/src/modules/files/file.routes.js#L32), permitted `application/octet-stream` through Multer when the filename has an image extension (`.jpg`, `.jpeg`, `.png`, `.webp`).
* **Security Verification:** The memory buffer is strictly verified by binary magic numbers (`validateImageBuffer` in `file.service.js`) **before** calling `storageProvider.saveFile()`. Disguised non-image files are rejected with HTTP 400.

### 2. API-002: Customer Registration (Documentation Corrected)
* **Canonical Contract:**
  ```json
  {
    "fullName": "Alice Customer",
    "email": "alice@example.com",
    "password": "Password123!",
    "phone": "555-123-4567",
    "role": "customer"
  }
  ```
* Do not send `"name"` or `"phoneNumber"`. Backend strictly requires `"fullName"`.

### 3. API-019 & API-024: Material Categories (Documentation Corrected)
* **Create Category (API-019):**
  ```json
  {
    "name": "Premium Stains & Finishes",
    "description": "High performance stains and sealers",
    "displayOrder": 1,
    "status": "active"
  }
  ```
* **Toggle Status (API-024):**
  ```json
  {
    "status": "inactive"
  }
  ```

### 4. API-025: Create Material Item (Documentation Corrected)
* **Canonical Contract:**
  ```json
  {
    "materialCode": "MAT-STN-1001",
    "materialName": "Olympic Maximum Semi-Transparent Stain",
    "categoryId": "<CATEGORY_OBJECT_ID>",
    "materialType": "stain",
    "description": "Advanced waterproof exterior stain and sealant",
    "compatibleSurfaces": ["wood"],
    "specifications": {
      "finishType": "semi-gloss",
      "baseType": "oil",
      "dryingTime": 24,
      "recommendedCoats": 2
    },
    "coverage": {
      "coverageValue": 250,
      "coverageAreaUnit": "square_foot",
      "coverageQuantity": 1,
      "coverageQuantityUnit": "gallon"
    },
    "cost": {
      "unitCost": 45.99,
      "currency": "USD",
      "costUnit": "gallon"
    },
    "status": "active"
  }
  ```

---

## 4. Pending Action: Removal of AI Deck Detector Feature

As instructed:
1. **API-017** (`POST /api/v1/decks/:deckId/analyses`) and **API-018** (`GET /api/v1/decks/:deckId/analyses`) are part of the AI condition analysis module.
2. We are waiting for your approval / instruction to cleanly decommission the AI deck detector routes, controller, model, and ML client.
