module.exports = function getSection2Phase5To6() {
  return `### Phase 5: Material and Service Catalog Management

This phase provides administrator catalog management for deck restoration products, manufacturer materials, restoration service definitions, pricing models, and surface compatibility matrices.

---

#### 1. Material Categories APIs

##### API-019: Create Material Category
- **API ID:** \`API-019\` | **Method:** \`POST\` | **URL:** \`http://localhost:5000/api/v1/catalog/material-categories\`
- **Controller:** [\`catalog.controller.js\`](file:///e:/DeckEstimator/backend/src/modules/catalogs/catalog.controller.js#L14) | **Service:** [\`catalog.service.js\`](file:///e:/DeckEstimator/backend/src/modules/catalogs/catalog.service.js#L55)
- **Auth:** Admin Only | **Role:** \`admin\`
- **Headers:** \`Content-Type: application/json\`, \`Authorization: Bearer {{adminToken}}\`
- **Request Body:**
  \`\`\`json
  {
    "categoryName": "Premium Decking Finishes",
    "categoryCode": "FINISH_PREM",
    "description": "High performance stains, sealers, and penetrating oils",
    "displayOrder": 1,
    "isActive": true
  }
  \`\`\`
- **Expected Response (HTTP 201 Created):** Returns created category object with \`id\`.
- **Database:** MongoDB \`materialCategories\`. Audit log recorded in \`auditLogs\`.
- **Error:** Duplicate \`categoryCode\` returns HTTP 409 Conflict.

##### API-020: List Material Categories
- **API ID:** \`API-020\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/catalog/material-categories?isActive=true\`
- **Auth:** All authenticated users (\`customer\`, \`contractor\`, \`admin\`).
- **Response (HTTP 200 OK):** Array of material categories with pagination meta.

##### API-021: Get Material Category by ID
- **API ID:** \`API-021\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/catalog/material-categories/:id\`
- **Auth:** Authenticated users | **Response (HTTP 200 OK):** Detailed category object.

##### API-022: Patch Material Category
- **API ID:** \`API-022\` | **Method:** \`PATCH\` | **URL:** \`http://localhost:5000/api/v1/catalog/material-categories/:id\`
- **Auth:** Admin Only | **Body:** \`{ "description": "Updated category notes" }\` | **Response (HTTP 200 OK)**

##### API-023: Put (Replace) Material Category
- **API ID:** \`API-023\` | **Method:** \`PUT\` | **URL:** \`http://localhost:5000/api/v1/catalog/material-categories/:id\`
- **Auth:** Admin Only | **Response (HTTP 200 OK)**

##### API-024: Toggle Material Category Status
- **API ID:** \`API-024\` | **Method:** \`PATCH\` | **URL:** \`http://localhost:5000/api/v1/catalog/material-categories/:id/status\`
- **Auth:** Admin Only | **Body:** \`{ "isActive": false }\` | **Response (HTTP 200 OK)**

---

#### 2. Materials APIs

##### API-025: Create Material Item
- **API ID:** \`API-025\` | **Method:** \`POST\` | **URL:** \`http://localhost:5000/api/v1/catalog/materials\`
- **Controller:** [\`catalog.controller.js\`](file:///e:/DeckEstimator/backend/src/modules/catalogs/catalog.controller.js#L80) | **Service:** [\`catalog.service.js\`](file:///e:/DeckEstimator/backend/src/modules/catalogs/catalog.service.js#L180)
- **Auth:** Admin Only
- **Request Body:**
  \`\`\`json
  {
    "categoryId": "{{materialCategoryId}}",
    "materialName": "Olympic Maximum Cedar Natural Tone",
    "materialCode": "OLY_MAX_CEDAR",
    "brandName": "Olympic",
    "unitOfMeasure": "gallon",
    "unitCost": 48.50,
    "coverageValue": 250,
    "coverageUnit": "sq_ft_per_gallon",
    "compatibleSurfaces": ["wood"],
    "specifications": { "sheen": "flat", "base": "oil_latex_hybrid" },
    "status": "active"
  }
  \`\`\`
- **Response (HTTP 201 Created):** Returns material record with computed coverage metrics.

##### API-026: List Materials
- **API ID:** \`API-026\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/catalog/materials?surface=wood&status=active\`
- **Auth:** Authenticated users | **Response (HTTP 200 OK):** Paginated material items.

##### API-027: Get Material by ID
- **API ID:** \`API-027\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/catalog/materials/:id\`
- **Auth:** Authenticated users | **Response (HTTP 200 OK)**

##### API-028: Patch Material
- **API ID:** \`API-028\` | **Method:** \`PATCH\` | **URL:** \`http://localhost:5000/api/v1/catalog/materials/:id\`
- **Auth:** Admin Only | **Body:** \`{ "unitCost": 52.00 }\` | **Response (HTTP 200 OK)**

##### API-029: Put (Replace) Material
- **API ID:** \`API-029\` | **Method:** \`PUT\` | **URL:** \`http://localhost:5000/api/v1/catalog/materials/:id\`
- **Auth:** Admin Only | **Response (HTTP 200 OK)**

##### API-030: Update Material Status
- **API ID:** \`API-030\` | **Method:** \`PATCH\` | **URL:** \`http://localhost:5000/api/v1/catalog/materials/:id/status\`
- **Auth:** Admin Only | **Body:** \`{ "status": "discontinued" }\` | **Response (HTTP 200 OK)**

---

#### 3. Service Categories APIs

##### API-031: Create Service Category
- **API ID:** \`API-031\` | **Method:** \`POST\` | **URL:** \`http://localhost:5000/api/v1/catalog/service-categories\`
- **Auth:** Admin Only
- **Request Body:**
  \`\`\`json
  {
    "categoryName": "Surface Preparation",
    "categoryCode": "SRV_PREP",
    "description": "Cleaning, power washing, and chemical stripping services",
    "displayOrder": 1,
    "isActive": true
  }
  \`\`\`
- **Response (HTTP 201 Created)**

##### API-032: List Service Categories
- **API ID:** \`API-032\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/catalog/service-categories\`
- **Auth:** Authenticated users | **Response (HTTP 200 OK)**

##### API-033: Get Service Category by ID
- **API ID:** \`API-033\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/catalog/service-categories/:id\`
- **Auth:** Authenticated users | **Response (HTTP 200 OK)**

##### API-034: Patch Service Category
- **API ID:** \`API-034\` | **Method:** \`PATCH\` | **URL:** \`http://localhost:5000/api/v1/catalog/service-categories/:id\`
- **Auth:** Admin Only | **Response (HTTP 200 OK)**

##### API-035: Put Service Category
- **API ID:** \`API-035\` | **Method:** \`PUT\` | **URL:** \`http://localhost:5000/api/v1/catalog/service-categories/:id\`
- **Auth:** Admin Only | **Response (HTTP 200 OK)**

##### API-036: Update Service Category Status
- **API ID:** \`API-036\` | **Method:** \`PATCH\` | **URL:** \`http://localhost:5000/api/v1/catalog/service-categories/:id/status\`
- **Auth:** Admin Only | **Response (HTTP 200 OK)**

---

#### 4. Services APIs

##### API-037: Create Service Item
- **API ID:** \`API-037\` | **Method:** \`POST\` | **URL:** \`http://localhost:5000/api/v1/catalog/services\`
- **Controller:** [\`catalog.controller.js\`](file:///e:/DeckEstimator/backend/src/modules/catalogs/catalog.controller.js#L230) | **Service:** [\`catalog.service.js\`](file:///e:/DeckEstimator/backend/src/modules/catalogs/catalog.service.js#L420)
- **Auth:** Admin Only
- **Request Body:**
  \`\`\`json
  {
    "categoryId": "{{serviceCategoryId}}",
    "serviceName": "High Pressure Deck Wash & Brighten",
    "serviceCode": "SRV_WASH_BRIGHT",
    "description": "Deep power wash and oxalic acid brightening",
    "pricingModel": "per_sq_ft",
    "basePrice": 0.45,
    "estimatedHours": 3.5,
    "laborSkillLevel": "standard",
    "status": "active"
  }
  \`\`\`
- **Response (HTTP 201 Created)**

##### API-038: List Services
- **API ID:** \`API-038\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/catalog/services?status=active\`
- **Auth:** Authenticated users | **Response (HTTP 200 OK)**

##### API-039: Get Service by ID
- **API ID:** \`API-039\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/catalog/services/:id\`
- **Auth:** Authenticated users | **Response (HTTP 200 OK)**

##### API-040: Patch Service
- **API ID:** \`API-040\` | **Method:** \`PATCH\` | **URL:** \`http://localhost:5000/api/v1/catalog/services/:id\`
- **Auth:** Admin Only | **Response (HTTP 200 OK)**

##### API-041: Put Service
- **API ID:** \`API-041\` | **Method:** \`PUT\` | **URL:** \`http://localhost:5000/api/v1/catalog/services/:id\`
- **Auth:** Admin Only | **Response (HTTP 200 OK)**

##### API-042: Update Service Status
- **API ID:** \`API-042\` | **Method:** \`PATCH\` | **URL:** \`http://localhost:5000/api/v1/catalog/services/:id/status\`
- **Auth:** Admin Only | **Response (HTTP 200 OK)**

---

#### 5. Compatibility Matrix APIs

##### API-043: Create Material-Service Compatibility
- **API ID:** \`API-043\` | **Method:** \`POST\` | **URL:** \`http://localhost:5000/api/v1/catalog/compatibilities\`
- **Auth:** Admin Only
- **Request Body:**
  \`\`\`json
  {
    "materialId": "{{materialId}}",
    "serviceId": "{{serviceId}}",
    "compatibilityStatus": "compatible",
    "notes": "Surface wash required prior to penetrating oil application"
  }
  \`\`\`
- **Response (HTTP 201 Created)**

##### API-044: List Compatibilities
- **API ID:** \`API-044\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/catalog/compatibilities\`
- **Auth:** Authenticated users | **Response (HTTP 200 OK)**

##### API-045: Get Compatibility by ID
- **API ID:** \`API-045\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/catalog/compatibilities/:id\`
- **Auth:** Authenticated users | **Response (HTTP 200 OK)**

##### API-046: Patch Compatibility
- **API ID:** \`API-046\` | **Method:** \`PATCH\` | **URL:** \`http://localhost:5000/api/v1/catalog/compatibilities/:id\`
- **Auth:** Admin Only | **Response (HTTP 200 OK)**

##### API-047: Put Compatibility
- **API ID:** \`API-047\` | **Method:** \`PUT\` | **URL:** \`http://localhost:5000/api/v1/catalog/compatibilities/:id\`
- **Auth:** Admin Only | **Response (HTTP 200 OK)**

##### API-048: Delete Compatibility Link
- **API ID:** \`API-048\` | **Method:** \`DELETE\` | **URL:** \`http://localhost:5000/api/v1/catalog/compatibilities/:id\`
- **Auth:** Admin Only | **Response (HTTP 200 OK)**

---

### Phase 6: Pricing Calculation Engine and Estimate Management

This phase computes deterministic pricing estimates based on deck geometry, active catalog prices, labor rates, travel adjustments, minimum project price floors, and tax rates.

---

#### 1. Pricing Configurations APIs

##### API-049: Get Active Pricing Configuration
- **API ID:** \`API-049\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/pricing/configurations/active\`
- **Auth:** Authenticated users (\`customer\`, \`contractor\`, \`admin\`)
- **Purpose:** Fetches the currently active platform pricing parameters (labor rate, minimum job price floor, travel fee, tax rate, waste margin).
- **Expected Response (HTTP 200 OK):**
  \`\`\`json
  {
    "success": true,
    "data": {
      "configuration": {
        "id": "6ae87b6db8fa5774ba5b4630",
        "name": "Standard Regional Rate 2026",
        "laborRate": 65.00,
        "minimumJobPrice": 350.00,
        "travelCharge": 45.00,
        "taxPercentage": 8.25,
        "wastePercentage": 10.0,
        "additionalCoatingPrice": 0.25,
        "status": "ACTIVE"
      }
    }
  }
  \`\`\`

##### API-050: Create Pricing Configuration
- **API ID:** \`API-050\` | **Method:** \`POST\` | **URL:** \`http://localhost:5000/api/v1/pricing/configurations\`
- **Auth:** Admin Only
- **Request Body:**
  \`\`\`json
  {
    "name": "Q4 Commercial Restoration Matrix",
    "laborRate": 75.00,
    "minimumJobPrice": 450.00,
    "travelCharge": 50.00,
    "taxPercentage": 8.25,
    "wastePercentage": 12.0,
    "additionalCoatingPrice": 0.35,
    "description": "Updated commercial labor pricing",
    "effectiveFrom": "2026-11-01T00:00:00.000Z"
  }
  \`\`\`
- **Response (HTTP 201 Created)**

##### API-051: List Pricing Configurations
- **API ID:** \`API-051\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/pricing/configurations\`
- **Auth:** Admin Only | **Response (HTTP 200 OK)**

##### API-052: Get Pricing Configuration by ID
- **API ID:** \`API-052\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/pricing/configurations/:id\`
- **Auth:** Admin Only | **Response (HTTP 200 OK)**

##### API-053: Patch Pricing Configuration
- **API ID:** \`API-053\` | **Method:** \`PATCH\` | **URL:** \`http://localhost:5000/api/v1/pricing/configurations/:id\`
- **Auth:** Admin Only | **Response (HTTP 200 OK)**

##### API-054: Activate Pricing Configuration
- **API ID:** \`API-054\` | **Method:** \`PATCH\` | **URL:** \`http://localhost:5000/api/v1/pricing/configurations/:id/status\`
- **Auth:** Admin Only | **Body:** \`{ "status": "ACTIVE" }\`
- **Internal Behavior:** Sets selected configuration to \`ACTIVE\` and archives previously active configurations.

---

#### 2. Estimates Management APIs

##### API-055: Create & Calculate Pricing Estimate
- **API ID:** \`API-055\` | **Method:** \`POST\` | **URL:** \`http://localhost:5000/api/v1/estimates\`
- **Controller:** [\`estimate.controller.js\`](file:///e:/DeckEstimator/backend/src/modules/estimates/estimate.controller.js#L14) | **Service:** [\`estimate.service.js\`](file:///e:/DeckEstimator/backend/src/modules/estimates/estimate.service.js#L80)
- **Auth:** Deck Owner, Approved Contractor, or Admin
- **Request Body:**
  \`\`\`json
  {
    "deckId": "{{deckId}}",
    "estimateName": "Spring Full Seal & Clean",
    "materialIds": ["{{materialId}}"],
    "serviceIds": ["{{serviceId}}"],
    "numberOfCoats": 2,
    "notes": "Customer requesting low odor sealer"
  }
  \`\`\`
- **Internal Behavior:**
  1. Validates deck ownership/assignment.
  2. Pulls active catalog material and service pricing.
  3. Checks compatibility rules.
  4. Runs deterministic formula via \`pricingEngine.js\` (Waste multiplier + Labor + Travel + Subtotal + Tax).
  5. Applies \`minimumJobPrice\` floor adjustment if subtotal + tax < minimum.
  6. Generates unique human-readable \`estimateNumber\` (e.g. \`EST-20261102-A9F1B2\`).
  7. Persists initial version to \`estimateRevisions\` history table.
- **Expected Successful Response (HTTP 201 Created):**
  \`\`\`json
  {
    "success": true,
    "data": {
      "estimate": {
        "id": "6ae87b79b8fa5774ba5b4616",
        "estimateNumber": "EST-20261102-A9F1B2",
        "deckId": "6ae87b6db8fa5774ba5b4615",
        "estimateStatus": "DRAFT",
        "pricingSummary": {
          "materialsCost": 97.00,
          "servicesCost": 172.80,
          "laborCost": 227.50,
          "travelCharge": 45.00,
          "subtotal": 542.30,
          "taxAmount": 44.74,
          "minimumPriceAdjustment": 0.00,
          "totalCost": 587.04
        },
        "createdAt": "2026-11-02T14:40:00.000Z"
      }
    }
  }
  \`\`\`
- **Postman Test Script:** \`pm.environment.set("estimateId", pm.response.json().data.estimate.id);\`

##### API-056: List Estimates
- **API ID:** \`API-056\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/estimates?page=1&limit=10\`
- **Auth:** Authenticated users | **Response (HTTP 200 OK):** Paginated estimate summaries.

##### API-057: Get Estimate by ID
- **API ID:** \`API-057\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/estimates/:id\`
- **Auth:** Deck Owner, Assigned Contractor, or Admin | **Response (HTTP 200 OK):** Complete line item breakdown.

##### API-058: Recalculate Estimate (Revision)
- **API ID:** \`API-058\` | **Method:** \`POST\` | **URL:** \`http://localhost:5000/api/v1/estimates/:id/recalculate\`
- **Auth:** Deck Owner or Admin
- **Request Body:**
  \`\`\`json
  {
    "materialIds": ["{{materialId}}"],
    "serviceIds": ["{{serviceId}}"],
    "revisionReason": "Customer added additional pressure washing service"
  }
  \`\`\`
- **Response (HTTP 200 OK):** Returns updated estimate with incremented version in \`estimateRevisions\`.

##### API-059: Get Estimate Audit History
- **API ID:** \`API-059\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/estimates/:id/history\`
- **Auth:** Authenticated users with estimate access
- **Response (HTTP 200 OK):** Chronological log of revisions, author, reason, and subtotal changes.

##### API-060: Update Estimate Status
- **API ID:** \`API-060\` | **Method:** \`PATCH\` | **URL:** \`http://localhost:5000/api/v1/estimates/:id/status\`
- **Auth:** Authenticated users with estimate access
- **Request Body:** \`{ "estimateStatus": "SUBMITTED", "notes": "Approved by homeowner" }\`
- **Allowed Statuses:** \`DRAFT\`, \`SUBMITTED\`, \`COMPLETED\`, \`EXPIRED\`, \`CANCELLED\`.
- **Response (HTTP 200 OK)**

---
`;
};

