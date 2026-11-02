module.exports = function getSection2Phase7To8() {
  return `### Phase 7: AI-Based Deck Condition Analysis

This phase integrates visual deck surface telemetry with an external Python ML service (or internal heuristic fallback) to classify wood weathering, coating degradation, mold, and damage.

---

#### API-061: ML Microservice Health Check
- **API ID:** \`API-061\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/condition-analyses/ml-health\`
- **Controller:** [\`conditionAnalysis.controller.js\`](file:///e:/DeckEstimator/backend/src/modules/condition-analysis/conditionAnalysis.controller.js#L18)
- **Auth:** Authenticated users (\`customer\`, \`contractor\`, \`admin\`)
- **Purpose:** Probes the Python FastAPI microservice at \`http://localhost:5001/health\`.
- **Expected Response (HTTP 200 OK):**
  \`\`\`json
  {
    "success": true,
    "data": {
      "mlService": {
        "status": "healthy",
        "url": "http://localhost:5001",
        "responseTimeMs": 14
      }
    }
  }
  \`\`\`

#### API-062: Run AI Condition Analysis for Deck
- **API ID:** \`API-062\` | **Method:** \`POST\` | **URL:** \`http://localhost:5000/api/v1/condition-analyses/decks/:deckId/analyses\`
- **Controller:** [\`conditionAnalysis.controller.js\`](file:///e:/DeckEstimator/backend/src/modules/condition-analysis/conditionAnalysis.controller.js#L30) | **Service:** [\`conditionAnalysis.service.js\`](file:///e:/DeckEstimator/backend/src/modules/condition-analysis/conditionAnalysis.service.js#L45)
- **Auth:** Deck Owner, Assigned Contractor, or Admin
- **Request Body (Optional):** \`{ "forceFresh": false }\`
- **Internal Behavior:**
  1. Checks if deck has uploaded photos.
  2. Dispatches image files to ML service or rule-based vision evaluator.
  3. Classifies weathering grade (\`light\`, \`moderate\`, \`severe\`), coating peeling percentage, splintering risk, and recommended service actions.
  4. Persists record in \`conditionAnalyses\` collection.
- **Expected Response (HTTP 201 Created):**
  \`\`\`json
  {
    "success": true,
    "data": {
      "analysis": {
        "id": "6ae87b79b8fa5774ba5b4640",
        "deckId": "6ae87b6db8fa5774ba5b4615",
        "overallCondition": "moderate_wear",
        "confidenceScore": 0.91,
        "findings": [
          { "condition": "peeling_coating", "severity": "moderate", "confidence": 0.88 },
          { "condition": "graying_wood", "severity": "high", "confidence": 0.94 }
        ],
        "recommendedServices": ["High Pressure Deck Wash & Brighten", "Two-Coat Protective Seal"],
        "status": "completed",
        "createdAt": "2026-11-02T14:45:00.000Z"
      }
    }
  }
  \`\`\`

#### API-063: List Deck Condition Analyses
- **API ID:** \`API-063\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/condition-analyses/decks/:deckId/analyses\`
- **Auth:** Authenticated users with deck access | **Response (HTTP 200 OK):** Array of historical telemetry analyses.

#### API-064: Get Condition Analysis by ID
- **API ID:** \`API-064\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/condition-analyses/:id\`
- **Auth:** Authenticated users with deck access | **Response (HTTP 200 OK):** Detailed findings and image bounding coordinates.

#### API-065: Retry Failed Condition Analysis
- **API ID:** \`API-065\` | **Method:** \`POST\` | **URL:** \`http://localhost:5000/api/v1/condition-analyses/:id/retry\`
- **Auth:** Deck Owner or Admin
- **Purpose:** Retries image analysis if initial dispatch encountered microservice timeout or network error.

#### API-066: Review / Override AI Condition Analysis
- **API ID:** \`API-066\` | **Method:** \`PATCH\` | **URL:** \`http://localhost:5000/api/v1/condition-analyses/:id/review\`
- **Auth:** Admin Only
- **Request Body:**
  \`\`\`json
  {
    "reviewedStatus": "approved",
    "overrideNotes": "Verified by structural estimator: surface wear is moderate, no dry rot detected."
  }
  \`\`\`
- **Response (HTTP 200 OK)**

---

### Phase 8: Contractor Verification and Lead Management

This phase handles contractor onboarding, compliance license verification, inbound quotation inquiries (Leads), automated eligibility matching, contractor inbox, and lead status progression.

---

#### 1. Contractor Profile & Verification APIs

##### API-067: Get Current Contractor Profile
- **API ID:** \`API-067\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/contractors/me\`
- **Auth:** Contractor Only (\`contractor\`)
- **Response (HTTP 200 OK):** Contractor profile, company details, service radius, and verification badge status.

##### API-068: Update Contractor Profile
- **API ID:** \`API-068\` | **Method:** \`PATCH\` | **URL:** \`http://localhost:5000/api/v1/contractors/me\`
- **Auth:** Contractor Only
- **Request Body:**
  \`\`\`json
  {
    "businessName": "Apex Deck Solutions LLC",
    "phone": "555-987-6543",
    "serviceRadiusMiles": 35,
    "specialties": ["wood_restoration", "composite_cleaning", "structural_repair"]
  }
  \`\`\`
- **Response (HTTP 200 OK)**

##### API-069: Submit Contractor Verification Application
- **API ID:** \`API-069\` | **Method:** \`POST\` | **URL:** \`http://localhost:5000/api/v1/contractors/me/verification/submit\`
- **Auth:** Contractor Only
- **Request Body:**
  \`\`\`json
  {
    "businessRegistrationNumber": "BRN-TX-88992",
    "insurancePolicyNumber": "POL-GL-2026-001",
    "insuranceExpiryDate": "2027-11-01T00:00:00.000Z",
    "yearsInBusiness": 8
  }
  \`\`\`
- **Internal Behavior:** Transitions verification status from \`PENDING\` to \`SUBMITTED\` (or notifies Admin queue).

##### API-070: Upload Contractor Verification Document
- **API ID:** \`API-070\` | **Method:** \`POST\` | **URL:** \`http://localhost:5000/api/v1/contractors/me/verification/documents\`
- **Auth:** Contractor Only (Multipart/form-data)
- **Parameters:** \`document\` (File), \`documentType\` (\`liability_insurance\`, \`trade_license\`, \`w9_form\`).
- **Response (HTTP 201 Created)**

##### API-071: List Contractor Uploaded Documents
- **API ID:** \`API-071\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/contractors/me/verification/documents\`
- **Auth:** Contractor Only | **Response (HTTP 200 OK)**

##### API-072: Serve Contractor Verification Document File
- **API ID:** \`API-072\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/contractors/documents/:documentId/file\`
- **Auth:** Document Owner or Admin (Blocks other contractors)
- **Response (HTTP 200 OK):** File stream.

##### API-073: List Eligible Approved Contractors
- **API ID:** \`API-073\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/contractors/eligible\`
- **Auth:** Admin Only
- **Purpose:** Lists active, approved contractors eligible for lead assignment.

##### API-074: Admin List Contractor Verification Applications
- **API ID:** \`API-074\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/contractors/admin/verifications?status=PENDING\`
- **Auth:** Admin Only | **Response (HTTP 200 OK):** Verification queue.

##### API-075: Admin Get Contractor Verification Details
- **API ID:** \`API-075\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/contractors/admin/verifications/:id\`
- **Auth:** Admin Only | **Response (HTTP 200 OK)**

##### API-076: Admin Review & Approve/Reject Contractor
- **API ID:** \`API-076\` | **Method:** \`POST\` | **URL:** \`http://localhost:5000/api/v1/contractors/admin/verifications/:id/review\`
- **Auth:** Admin Only
- **Request Body:**
  \`\`\`json
  {
    "action": "approve",
    "reviewNotes": "All Texas trade licenses and general liability policies validated."
  }
  \`\`\`
- **Internal Behavior:** Updates \`verificationStatus\` to \`approved\`. Unlocks contractor dashboard and lead assignment.
- **Response (HTTP 200 OK)**

---

#### 2. Customer Leads & Inquiries APIs

##### API-077: Create Customer Lead (Quote Inquiry)
- **API ID:** \`API-077\` | **Method:** \`POST\` | **URL:** \`http://localhost:5000/api/v1/leads\`
- **Controller:** [\`lead.controller.js\`](file:///e:/DeckEstimator/backend/src/modules/leads/lead.controller.js#L14) | **Service:** [\`lead.service.js\`](file:///e:/DeckEstimator/backend/src/modules/leads/lead.service.js#L30)
- **Auth:** Customer Only (\`customer\`)
- **Request Body:**
  \`\`\`json
  {
    "deckId": "{{deckId}}",
    "estimateId": "{{estimateId}}",
    "leadSource": "customer_estimator",
    "enquiry": {
      "subject": "Cedar Deck Weather Seal Quote",
      "message": "Looking for a contractor to inspect wood splinters and apply two coats.",
      "preferredContactMethod": "email",
      "preferredContactTime": "Weekdays 2-5 PM",
      "additionalNotes": "Gate code is #1234"
    }
  }
  \`\`\`
- **Expected Response (HTTP 201 Created):**
  \`\`\`json
  {
    "success": true,
    "data": {
      "lead": {
        "id": "6ae87b79b8fa5774ba5b4650",
        "leadNumber": "LEAD-20261102-B8E2",
        "status": "new",
        "deckId": "6ae87b6db8fa5774ba5b4615",
        "createdAt": "2026-11-02T14:50:00.000Z"
      }
    }
  }
  \`\`\`
- **Postman Test Script:** \`pm.environment.set("leadId", pm.response.json().data.lead.id);\`

##### API-078: Customer List Own Leads
- **API ID:** \`API-078\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/leads/my-leads\`
- **Auth:** Customer Only | **Response (HTTP 200 OK)**

##### API-079: Admin List All Platform Leads
- **API ID:** \`API-079\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/leads/admin/all?page=1&limit=10\`
- **Auth:** Admin Only | **Response (HTTP 200 OK)**

##### API-080: Admin Lead Analytics & Metrics
- **API ID:** \`API-080\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/leads/admin/analytics\`
- **Auth:** Admin Only | **Response (HTTP 200 OK):** Conversion rates, leads by status, avg response time.

##### API-081: Admin Assign Lead to Contractor
- **API ID:** \`API-081\` | **Method:** \`POST\` | **URL:** \`http://localhost:5000/api/v1/leads/admin/:id/assign\`
- **Auth:** Admin Only
- **Request Body:**
  \`\`\`json
  {
    "contractorId": "{{contractorId}}",
    "assignmentNotes": "Assigned to Apex Deck Solutions - local Austin specialist"
  }
  \`\`\`
- **Internal Behavior:** Sets \`assignedContractorId\` to contractor ID and status to \`assigned\`.
- **Response (HTTP 200 OK)**

##### API-082: Admin Close Lead
- **API ID:** \`API-082\` | **Method:** \`POST\` | **URL:** \`http://localhost:5000/api/v1/leads/admin/:id/close\`
- **Auth:** Admin Only
- **Request Body:** \`{ "reason": "Customer cancelled project", "closeNotes": "Project postponed to next year" }\`
- **Response (HTTP 200 OK)**

##### API-083: Admin Get Lead Lifecycle History
- **API ID:** \`API-083\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/leads/admin/:id/history\`
- **Auth:** Admin Only | **Response (HTTP 200 OK)**

##### API-084: Contractor Lead Inbox
- **API ID:** \`API-084\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/leads/contractor/inbox\`
- **Auth:** Approved Contractor Only (\`contractor\`)
- **Response (HTTP 200 OK):** Array of leads matched and assigned to this contractor.

##### API-085: Contractor Accept Lead
- **API ID:** \`API-085\` | **Method:** \`POST\` | **URL:** \`http://localhost:5000/api/v1/leads/contractor/:id/accept\`
- **Auth:** Assigned Contractor Only
- **Request Body:** \`{ "notes": "Accepting inquiry, will call customer tomorrow." }\`
- **Internal Behavior:** Changes lead status from \`assigned\` to \`accepted\`.
- **Response (HTTP 200 OK)**

##### API-086: Contractor Reject Lead
- **API ID:** \`API-086\` | **Method:** \`POST\` | **URL:** \`http://localhost:5000/api/v1/leads/contractor/:id/reject\`
- **Auth:** Assigned Contractor Only
- **Request Body:** \`{ "rejectionReason": "Current schedule fully booked this week." }\`
- **Response (HTTP 200 OK)**

##### API-087: Contractor Update Lead Operational Status
- **API ID:** \`API-087\` | **Method:** \`PATCH\` | **URL:** \`http://localhost:5000/api/v1/leads/contractor/:id/status\`
- **Auth:** Assigned Contractor Only
- **Request Body:** \`{ "status": "contacted", "notes": "Left voicemail with homeowner" }\`
- **Allowed Statuses:** \`contacted\`, \`scheduled\`, \`quoted\`, \`won\`, \`lost\`, \`completed\`.
- **Response (HTTP 200 OK)**

##### API-088: Get Lead Details by ID
- **API ID:** \`API-088\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/leads/:id\`
- **Auth:** Lead Owner (Customer), Assigned Contractor, or Admin
- **Response (HTTP 200 OK)**

##### API-089: Get Lead Activity Stream
- **API ID:** \`API-089\` | **Method:** \`GET\` | **URL:** \`http://localhost:5000/api/v1/leads/:id/activities\`
- **Auth:** Authorized Stakeholders | **Response (HTTP 200 OK)**

##### API-090: Add Communication Note to Lead
- **API ID:** \`API-090\` | **Method:** \`POST\` | **URL:** \`http://localhost:5000/api/v1/leads/:id/notes\`
- **Auth:** Stakeholders
- **Request Body:** \`{ "note": "Spoke to customer on phone, site visit planned for Friday 10 AM." }\`
- **Response (HTTP 201 Created)**

---
`;
};

