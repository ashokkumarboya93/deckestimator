module.exports = function getSection2Phase9To10() {
  return `### Phase 9: Contractor Discounts and Commission Management

This phase handles partner discount programs, tiered volume rebate policies, commission generation from converted leads, administrative payout reviews, and atomic duplicate-proof payment recording.

---

#### 1. Contractor Discount Policies APIs

##### API-091: Contractor View Eligible Partner Discounts
- **API ID:** \`API-091\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/discounts/contractor\`
- **Controller:** [\`discount.controller.js\`](file:///e:/DeckEstimator/backend/src/modules/discounts/discount.controller.js#L18) | **Service:** [\`discount.service.js\`](file:///e:/DeckEstimator/backend/src/modules/discounts/discount.service.js#L35)
- **Auth:** Contractor Only (\`contractor\`)
- **Purpose:** Fetches active discount policies assigned to the logged-in contractor.
- **Expected Response (HTTP 200 OK):**
  \`\`\`json
  {
    "success": true,
    "data": {
      "discounts": [
        {
          "id": "6ae87b79b8fa5774ba5b4660",
          "policyName": "Preferred Pro Partner 10%",
          "discountType": "PERCENTAGE",
          "discountValue": 10.0,
          "appliesTo": "MATERIALS_AND_SERVICES",
          "status": "ACTIVE"
        }
      ]
    }
  }
  \`\`\`

##### API-092: Apply Contractor Discount to Estimate
- **API ID:** \`API-092\` | **Method:** \`POST\` | **URL:** \`http://localhost:5000/api/v1/discounts/estimates/:estimateId/apply\`
- **Auth:** Assigned Contractor or Admin
- **Request Body:**
  \`\`\`json
  {
    "discountPolicyId": "{{discountPolicyId}}",
    "notes": "Applied seasonal contractor partner volume discount"
  }
  \`\`\`
- **Internal Behavior:** Calculates discount amount, creates snapshot record in \`estimateDiscounts\`, and recalculates estimate total.
- **Expected Response (HTTP 200 OK)**

##### API-093: Get Estimate Discount History
- **API ID:** \`API-093\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/discounts/estimates/:estimateId/history\`
- **Auth:** Stakeholders with estimate access | **Response (HTTP 200 OK)**

##### API-094: Admin Create Discount Policy
- **API ID:** \`API-094\` | **Method:** \`POST\` | **URL:** \`http://localhost:5000/api/v1/discounts/admin/policies\`
- **Auth:** Admin Only (\`admin\`)
- **Request Body:**
  \`\`\`json
  {
    "name": "Commercial Contractor High Volume 15%",
    "code": "VOL_HIGH_15",
    "discountType": "PERCENTAGE",
    "value": 15.0,
    "tier": "GOLD",
    "appliesTo": "SERVICES",
    "validFrom": "2026-11-01T00:00:00.000Z",
    "validUntil": "2027-12-31T23:59:59.000Z",
    "status": "ACTIVE"
  }
  \`\`\`
- **Expected Response (HTTP 201 Created)**

##### API-095: Admin List Discount Policies
- **API ID:** \`API-095\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/discounts/admin/policies?status=ACTIVE\`
- **Auth:** Admin Only | **Response (HTTP 200 OK)**

##### API-096: Admin Get Discount Policy by ID
- **API ID:** \`API-096\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/discounts/admin/policies/:id\`
- **Auth:** Admin Only | **Response (HTTP 200 OK)**

##### API-097: Admin Patch Discount Policy
- **API ID:** \`API-097\` | **Method:** \`PATCH\` | **URL:** \`http://localhost:5000/api/v1/discounts/admin/policies/:id\`
- **Auth:** Admin Only | **Response (HTTP 200 OK)**

##### API-098: Admin Update Discount Policy Status
- **API ID:** \`API-098\` | **Method:** \`PATCH\` | **URL:** \`http://localhost:5000/api/v1/discounts/admin/policies/:id/status\`
- **Auth:** Admin Only | **Body:** \`{ "status": "INACTIVE" }\` | **Response (HTTP 200 OK)**

##### API-099: Admin Assign Discount Policy to Contractor
- **API ID:** \`API-099\` | **Method:** \`POST\` | **URL:** \`http://localhost:5000/api/v1/discounts/admin/assignments\`
- **Auth:** Admin Only
- **Request Body:**
  \`\`\`json
  {
    "contractorId": "{{contractorId}}",
    "discountPolicyId": "{{discountPolicyId}}",
    "assignedReason": "Contractor completed 20+ verified restoration projects"
  }
  \`\`\`
- **Response (HTTP 201 Created)**

---

#### 2. Commission Calculation, Review & Payout APIs

##### API-100: Contractor Commission Summary Metrics
- **API ID:** \`API-100\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/commissions/summary\`
- **Controller:** [\`commission.controller.js\`](file:///e:/DeckEstimator/backend/src/modules/commissions/commission.controller.js#L20) | **Service:** [\`commission.service.js\`](file:///e:/DeckEstimator/backend/src/modules/commissions/commission.service.js#L560)
- **Auth:** Contractor Only (\`contractor\`)
- **Purpose:** Retrieves total lifetime earnings, pending payouts, and paid commissions for the logged-in contractor.
- **Expected Response (HTTP 200 OK):**
  \`\`\`json
  {
    "success": true,
    "data": {
      "summary": {
        "totalCommissionsCount": 12,
        "totalEarnedAmount": 2840.50,
        "pendingAmount": 425.00,
        "paidAmount": 2415.50
      }
    }
  }
  \`\`\`

##### API-101: Contractor List Own Commissions
- **API ID:** \`API-101\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/commissions?page=1&limit=10\`
- **Auth:** Contractor Only | **Response (HTTP 200 OK):** Paginated commission records.

##### API-102: Get Commission by ID
- **API ID:** \`API-102\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/commissions/:id\`
- **Auth:** Commission Contractor or Admin (Data Isolation: Contractor B cannot access Contractor A's commission)
- **Response (HTTP 200 OK)**

##### API-103: Get Commission Lifecycle History
- **API ID:** \`API-103\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/commissions/:id/history\`
- **Auth:** Authorized Stakeholders | **Response (HTTP 200 OK):** Audit timeline from \`GENERATED\` to \`PAID\`.

##### API-104: Admin Create Commission Policy
- **API ID:** \`API-104\` | **Method:** \`POST\` | **URL:** \`http://localhost:5000/api/v1/commissions/admin/policies\`
- **Auth:** Admin Only
- **Request Body:**
  \`\`\`json
  {
    "policyName": "Standard Contractor Commission 10%",
    "policyCode": "COM_STD_10",
    "rateType": "PERCENTAGE",
    "rateValue": 10.0,
    "description": "Platform fee of 10% on won jobs",
    "status": "ACTIVE"
  }
  \`\`\`
- **Response (HTTP 201 Created)**

##### API-105: Admin List Commission Policies
- **API ID:** \`API-105\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/commissions/admin/policies\`
- **Auth:** Admin Only | **Response (HTTP 200 OK)**

##### API-106: Admin Get Commission Policy by ID
- **API ID:** \`API-106\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/commissions/admin/policies/:id\`
- **Auth:** Admin Only | **Response (HTTP 200 OK)**

##### API-107: Admin Patch Commission Policy
- **API ID:** \`API-107\` | **Method:** \`PATCH\` | **URL:** \`http://localhost:5000/api/v1/commissions/admin/policies/:id\`
- **Auth:** Admin Only | **Response (HTTP 200 OK)**

##### API-108: Admin Generate Commission from Converted Lead
- **API ID:** \`API-108\` | **Method:** \`POST\` | **URL:** \`http://localhost:5000/api/v1/commissions/admin/generate\`
- **Controller:** [\`commission.controller.js\`](file:///e:/DeckEstimator/backend/src/modules/commissions/commission.controller.js#L55) | **Service:** [\`commission.service.js\`](file:///e:/DeckEstimator/backend/src/modules/commissions/commission.service.js#L140)
- **Auth:** Admin Only
- **Request Body:**
  \`\`\`json
  {
    "leadId": "{{leadId}}",
    "policyId": "{{policyId}}",
    "projectFinalValue": 1200.00,
    "notes": "Homeowner contract executed and deposit received"
  }
  \`\`\`
- **Internal Behavior:** Validates lead status (must be \`won\` or \`completed\`). Prevents duplicate commissions for the same lead & policy (HTTP 409 Conflict). Generates commission record in \`PENDING_REVIEW\` status.
- **Expected Response (HTTP 201 Created):**
  \`\`\`json
  {
    "success": true,
    "data": {
      "commission": {
        "id": "6ae87be26ee18b22cf684f00",
        "commissionNumber": "COM-20261102-C901",
        "leadId": "6ae87b79b8fa5774ba5b4650",
        "contractorId": "6ae87b6db8fa5774ba5b4618",
        "grossAmount": 1200.00,
        "commissionAmount": 120.00,
        "status": "PENDING_REVIEW",
        "createdAt": "2026-11-02T15:00:00.000Z"
      }
    }
  }
  \`\`\`
- **Postman Test Script:** \`pm.environment.set("commissionId", pm.response.json().data.commission.id);\`

##### API-109: Admin Review & Approve Commission
- **API ID:** \`API-109\` | **Method:** \`POST\` | **URL:** \`http://localhost:5000/api/v1/commissions/admin/:id/review\`
- **Auth:** Admin Only (Contractors cannot approve own commission - HTTP 403)
- **Request Body:**
  \`\`\`json
  {
    "action": "APPROVE",
    "reviewNotes": "Job completion signed off by customer"
  }
  \`\`\`
- **Internal Behavior:** Transitions status from \`PENDING_REVIEW\` to \`APPROVED\`. Calling again with \`action: "SET_PAYABLE"\` marks as \`PAYABLE\`.
- **Response (HTTP 200 OK)**

##### API-110: Admin Record Atomic Commission Payment
- **API ID:** \`API-110\` | **Method:** \`POST\` | **URL:** \`http://localhost:5000/api/v1/commissions/admin/:id/record-payment\`
- **Auth:** Admin Only
- **Request Body:**
  \`\`\`json
  {
    "paymentReference": "ACH-TRANS-990812",
    "paymentMethod": "DIRECT_DEPOSIT",
    "paidAmount": 120.00,
    "notes": "Direct deposit batch payout via SVB"
  }
  \`\`\`
- **Internal Behavior (Phase 11 Hardened):** Executes an atomic conditional database update (\`findOneAndUpdate({ _id: id, status: 'PAYABLE', isPaid: { $ne: true } })\`). Prevents duplicate payouts or race conditions. Rejects already-paid commission with HTTP 409 Conflict.
- **Expected Response (HTTP 200 OK):**
  \`\`\`json
  {
    "success": true,
    "data": {
      "commission": {
        "id": "6ae87be26ee18b22cf684f00",
        "status": "PAID",
        "isPaid": true,
        "paymentReference": "ACH-TRANS-990812",
        "paidAt": "2026-11-02T15:05:00.000Z"
      }
    }
  }
  \`\`\`

---

### Phase 10: Administrative Dashboard and Platform Management

This phase provides unified platform operations overview, live Atlas KPI aggregation, administrative user management, platform runtime settings with toggle controls, forensic audit trail querying, and analytical CSV reports.

---

#### API-111: Get Public Platform Settings
- **API ID:** \`API-111\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/settings/public\`
- **Controller:** [\`admin.controller.js\`](file:///e:/DeckEstimator/backend/src/modules/admin/admin.controller.js#L14)
- **Auth:** Public / Unauthenticated
- **Purpose:** Returns public branding, support email, maintenance mode status, and platform announcement banners.
- **Expected Response (HTTP 200 OK):**
  \`\`\`json
  {
    "success": true,
    "data": {
      "settings": {
        "maintenanceMode": false,
        "platformName": "Deck Estimator Pro",
        "supportEmail": "support@deckestimator.com"
      }
    }
  }
  \`\`\`

#### API-112: Admin Dashboard Operations Summary (Live Atlas KPIs)
- **API ID:** \`API-112\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/admin/dashboard/summary\`
- **Auth:** Admin Only (\`admin\`)
- **Purpose:** Aggregates real-time statistics across all collections (Users count, Decks count, Estimates total volume, Pending contractor verifications, Active leads).
- **Expected Response (HTTP 200 OK):**
  \`\`\`json
  {
    "success": true,
    "data": {
      "summary": {
        "totalUsers": 48,
        "totalDecks": 31,
        "totalEstimates": 29,
        "totalLeads": 17,
        "pendingVerifications": 3,
        "totalCommissionsPaid": 12850.00
      }
    }
  }
  \`\`\`

#### API-113: Admin Dashboard Recent Activity Stream
- **API ID:** \`API-113\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/admin/dashboard/activity\`
- **Auth:** Admin Only | **Response (HTTP 200 OK):** Live timeline of recent user registrations, estimates, and verifications.

#### API-114: Admin List All Users
- **API ID:** \`API-114\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/admin/users?role=customer&page=1&limit=10\`
- **Auth:** Admin Only
- **Query Parameters:** \`role\`, \`status\`, \`search\`, \`page\`, \`limit\`.
- **Response (HTTP 200 OK):** User directory list.

#### API-115: Admin Get User by ID
- **API ID:** \`API-115\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/admin/users/:id\`
- **Auth:** Admin Only | **Response (HTTP 200 OK)**

#### API-116: Admin Create User (Administrative Provisioning)
- **API ID:** \`API-116\` | **Method:** \`POST\` | **URL:** \`http://localhost:5000/api/v1/admin/users\`
- **Auth:** Admin Only
- **Request Body:**
  \`\`\`json
  {
    "fullName": "Regional Admin Two",
    "email": "admin2@deckestimator.com",
    "password": "SecurePassword123!",
    "role": "admin"
  }
  \`\`\`
- **Response (HTTP 201 Created)**

#### API-117: Admin Update User Profile
- **API ID:** \`API-117\` | **Method:** \`PATCH\` | **URL:** \`http://localhost:5000/api/v1/admin/users/:id\`
- **Auth:** Admin Only | **Response (HTTP 200 OK)**

#### API-118: Admin Update User Account Status (Suspend / Reactivate)
- **API ID:** \`API-118\` | **Method:** \`PATCH\` | **URL:** \`http://localhost:5000/api/v1/admin/users/:id/status\`
- **Auth:** Admin Only
- **Request Body:**
  \`\`\`json
  {
    "status": "suspended",
    "reason": "Suspected terms of service violation"
  }
  \`\`\`
- **Internal Behavior (Phase 11 Hardened):** Updates user in MongoDB. When this user attempts any protected endpoint, \`authenticate\` middleware queries MongoDB and instantly rejects the session with HTTP 403, even if their JWT has not expired.
- **Response (HTTP 200 OK)**

#### API-119: Admin List All Deck Records
- **API ID:** \`API-119\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/admin/decks?page=1&limit=10\`
- **Auth:** Admin Only | **Response (HTTP 200 OK)**

#### API-120: Admin List All Estimates
- **API ID:** \`API-120\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/admin/estimates?page=1&limit=10\`
- **Auth:** Admin Only | **Response (HTTP 200 OK)**

#### API-121: Admin List All AI Condition Analyses
- **API ID:** \`API-121\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/admin/analyses?page=1&limit=10\`
- **Auth:** Admin Only | **Response (HTTP 200 OK)**

#### API-122: Admin List Platform Settings
- **API ID:** \`API-122\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/admin/settings\`
- **Auth:** Admin Only | **Response (HTTP 200 OK)**

#### API-123: Admin Get Platform Setting by Key
- **API ID:** \`API-123\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/admin/settings/:key\`
- **Auth:** Admin Only | **Response (HTTP 200 OK)**

#### API-124: Admin Create Platform Setting
- **API ID:** \`API-124\` | **Method:** \`POST\` | **URL:** \`http://localhost:5000/api/v1/admin/settings\`
- **Auth:** Admin Only
- **Request Body:**
  \`\`\`json
  {
    "key": "ENABLE_AI_SURVEY",
    "value": true,
    "category": "features",
    "description": "Enables customer self-service AI condition survey",
    "isPublic": true
  }
  \`\`\`
- **Response (HTTP 201 Created)**

#### API-125: Admin Update / Toggle Platform Setting
- **API ID:** \`API-125\` | **Method:** \`PATCH\` | **URL:** \`http://localhost:5000/api/v1/admin/settings/:key\`
- **Auth:** Admin Only
- **Request Body:** \`{ "value": false }\`
- **Response (HTTP 200 OK)**

#### API-126: Admin Query Forensic Audit Trail
- **API ID:** \`API-126\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/admin/audit-logs?entityType=COMMISSION&page=1&limit=20\`
- **Auth:** Admin Only
- **Query Parameters:** \`entityType\`, \`action\`, \`performedBy\`, \`from\`, \`to\`, \`page\`, \`limit\`.
- **Purpose:** Forensic inspection of immutable audit log entries recorded by administrative, pricing, commission, and verification changes.
- **Expected Response (HTTP 200 OK):**
  \`\`\`json
  {
    "success": true,
    "data": {
      "logs": [
        {
          "id": "6ae87be26ee18b22cf684f99",
          "action": "PAYMENT_RECORDED",
          "entityType": "COMMISSION",
          "entityId": "6ae87be26ee18b22cf684f00",
          "performedBy": "6ae87b6db8fa5774ba5b4601",
          "ipAddress": "127.0.0.1",
          "timestamp": "2026-11-02T15:05:00.000Z"
        }
      ]
    }
  }
  \`\`\`

#### API-127: Admin Export Analytical Report (CSV / JSON)
- **API ID:** \`API-127\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/admin/reports/:type?format=csv\`
- **Auth:** Admin Only
- **Parameters:**
  - \`:type\` *(path)*: \`users\`, \`decks\`, \`estimates\`, \`leads\`, \`commissions\`.
  - \`format\` *(query)*: \`json\` or \`csv\`.
- **Expected Response (HTTP 200 OK):** CSV file attachment (\`Content-Type: text/csv\`) with download disposition, or formatted JSON data.

---
`;
};

