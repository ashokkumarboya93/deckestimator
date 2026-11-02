module.exports = function getSection7MissingAnalysis() {
  return `## Section 7: Missing, Planned & Incomplete API Analysis

This section analyzes the gap between high-level architectural requirements, the frontend endpoint constants in \`frontend/src/api/endpoints.js\`, and the actual Express routes implemented in \`backend/src\`.

---

### 7.1 Classification Categories

- **Category A: Implemented and Connected:** Implemented in the backend and invoked by active frontend components.
- **Category B: Implemented but Not Connected:** Fully implemented in the backend, but no corresponding UI view or frontend API client calls it yet.
- **Category C: Partially Implemented:** Route exists and handles basic requests, but certain secondary behaviors (such as external webhooks or PDF rendering) are stubbed or deferred.
- **Category D: Required / Planned but Missing:** Listed in architectural roadmaps or \`endpoints.js\`, but no route handler exists in Express.
- **Category E: Cannot Verify from Source Code Alone:** Requires active third-party network services or production hardware.

---

### 7.2 Detailed Findings

| Category | Endpoint / Capability | Planned Location | Actual Source Code Finding & Impact |
| :--- | :--- | :--- | :--- |
| **Category A** | Customer Auth & Login | \`/api/v1/auth/*\` | Fully implemented in \`auth.routes.js\` and wired to React \`authApi.js\` and login forms. |
| **Category A** | Multi-Section Decks CRUD | \`/api/v1/decks/*\` | Fully implemented in \`deck.routes.js\` and connected to \`DeckInputForm.jsx\`. |
| **Category A** | Multi-Image Upload & Stream | \`/api/v1/decks/:id/images/*\` | Fully implemented in \`file.routes.js\` with Multer memory storage and streaming controller. |
| **Category A** | Catalog & Compatibility CRUD | \`/api/v1/catalog/*\` | All 30 catalog endpoints fully functional and wired to \`AdminCatalogPage.jsx\`. |
| **Category A** | Pricing Engine & Estimates | \`/api/v1/estimates/*\` | Implemented in \`estimate.routes.js\` and connected to \`EstimateBuilderPage.jsx\`. |
| **Category A** | Inbound Leads & Assign | \`/api/v1/leads/*\` | Connected to customer inquiry modal, admin hub, and contractor inbox. |
| **Category A** | Contractor Verification Hub | \`/api/v1/contractors/*\` | Connected to contractor submission forms and \`AdminContractorVerificationPage.jsx\`. |
| **Category A** | Commissions & Payouts | \`/api/v1/commissions/*\` | Connected to \`AdminCommissionsPage.jsx\` and contractor earnings dashboard. |
| **Category A** | Admin Telemetry & Audit Logs | \`/api/v1/admin/*\` | Connected to \`AdminDashboardPage.jsx\` (Operations overview, audit logs, settings). |
| **Category B** | CSV Financial Report Export | \`GET /api/v1/admin/reports/:type\` | Fully implemented in \`admin.controller.js\` with fast-csv generation, but frontend uses client-side table export. Tested and fully functional via Postman. |
| **Category B** | AI Condition Retry Endpoint | \`POST /api/v1/condition-analyses/:id/retry\` | Fully implemented in \`conditionAnalysis.controller.js\`, but frontend UI currently allows re-running via deck shortcut rather than retry by analysis ID. |
| **Category C** | AI Condition Analysis | \`POST /api/v1/condition-analyses/*\` | Connects to Python FastAPI at \`http://localhost:5001\`. When Python is running, returns genuine ML predictions; when offline, gracefully falls back to deterministic heuristic evaluation. |
| **Category D** | Email Verification API | \`/api/v1/auth/verify\` | Defined in \`frontend/src/api/endpoints.js:15\`, but no route handler exists in \`auth.routes.js\`. Accounts are currently auto-activated on registration. |
| **Category D** | Forgot / Reset Password | \`/api/v1/auth/forgot-password\` | Defined in \`frontend/src/api/endpoints.js:16-17\`, but no email dispatch service or token reset routes exist in backend. Password changes must be performed by admin. |
| **Category D** | Standalone File Upload | \`/api/v1/files/upload\` | Defined in \`frontend/src/api/endpoints.js:58\`. In actual implementation, files are nested under \`/api/v1/decks/:deckId/images\`. No root \`/files/upload\` route exists. |
| **Category D** | PDF Estimate Report Download | \`/api/v1/estimates/:id/report\` | Defined in \`frontend/src/api/endpoints.js:77\`. Not implemented in backend (estimates are viewed as JSON/interactive UI). |
| **Category E** | Production Payment Gateways | Stripe / ACH Webhooks | External payment gateways (e.g. live Stripe webhooks) are simulated via internal atomic payment recording (\`record-payment\`) in the current phase. |

---
`;
};

