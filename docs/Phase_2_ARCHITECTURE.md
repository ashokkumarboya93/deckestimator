# DECK PRO — System Architecture and Project Structure

## 1. Purpose

This document defines the system architecture, application boundaries, folder structure, module responsibilities, security rules, and development conventions for DECK PRO.

The existing project specification remains the primary source for business requirements. This document explains how those requirements should be organized technically.

Before implementation, compare this architecture with the existing HLD/LLD and report any conflicts or missing requirements.

## 2. Architecture Decision

Use a **Modular Monolith Architecture**.

- Frontend: React
- Backend: Node.js and Express
- Database: MongoDB Atlas with Mongoose
- Authentication: secure server-side authentication and authorization
- File storage: external object storage for uploaded images and generated reports
- AI: optional condition-analysis integration
- Testing: unit tests, API integration tests, and authorization tests

The frontend and backend are separate applications, but the backend initially runs as one application with clearly separated business modules.

Do not introduce microservices, message queues, payment infrastructure, or additional databases unless a confirmed requirement justifies them.

## 3. High-Level Architecture

```text
Customer Portal
Contractor Portal
Admin Portal
       |
       v
React Frontend
       |
       v
Express REST API
       |
       v
Security Middleware
Authentication
Authorization
Validation
Error Handling
       |
       v
Business Modules
  |       |       |
  v       v       v
Pricing  Leads   Users
  |
  v
Estimate Service
       |
       v
MongoDB Atlas

Additional integrations:
- Object storage: deck photos and reports
- AI service: optional visual condition analysis
- Email provider: verification and notifications
```

The backend is the source of truth for permissions, pricing, discounts, estimate records, and lead assignments.

## 4. Root Project Structure

```text
deck-pro/
├── frontend/
├── backend/
├── docs/
├── tests/
├── .gitignore
├── .env.example
└── README.md
```

Responsibilities:

- `frontend/`: React application and role-specific interfaces.
- `backend/`: Express API and business logic.
- `docs/`: HLD, LLD, architecture, database schema, and API documentation.
- `tests/`: cross-module integration and end-to-end tests where needed.
- `.gitignore`: excludes secrets, dependencies, generated files, and local environment files.
- `.env.example`: documents required environment variable names without real secrets.
- `README.md`: setup, development, testing, and execution instructions.

## 5. Frontend Structure

```text
frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── App.jsx
│   │   ├── router.jsx
│   │   └── providers.jsx
│   ├── api/
│   │   ├── client.js
│   │   └── endpoints.js
│   ├── components/
│   │   ├── ui/
│   │   └── shared/
│   ├── layouts/
│   │   ├── PublicLayout.jsx
│   │   ├── CustomerLayout.jsx
│   │   ├── ContractorLayout.jsx
│   │   └── AdminLayout.jsx
│   ├── features/
│   │   ├── auth/
│   │   ├── customer/
│   │   ├── contractor/
│   │   └── admin/
│   ├── hooks/
│   ├── utils/
│   ├── assets/
│   └── main.jsx
├── package.json
└── vite.config.js
```

### Frontend rules

- `app/`: application initialization and routing.
- `api/`: shared HTTP client and API endpoint definitions.
- `components/ui/`: reusable buttons, inputs, dialogs, and other basic UI.
- `components/shared/`: components reused across features.
- `layouts/`: navigation and page layouts for each role.
- `features/auth/`: registration, login, and account recovery.
- `features/customer/`: deck inputs, estimates, history, photos, and contractor requests.
- `features/contractor/`: business profile, verification status, assigned leads, and permitted estimate activities.
- `features/admin/`: user management, contractor verification, catalogs, pricing, discounts, and reports.
- `hooks/`: reusable React hooks.
- `utils/`: small, general-purpose frontend utilities.
- `assets/`: local images, icons, and styles.

Keep feature-specific components, hooks, and API calls inside their respective feature directories when practical. Do not place business pricing calculations or access-control decisions exclusively in the frontend.

## 6. Backend Structure

```text
backend/
├── src/
│   ├── config/
│   │   ├── env.js
│   │   └── database.js
│   ├── middleware/
│   │   ├── authenticate.js
│   │   ├── authorize.js
│   │   ├── validate.js
│   │   ├── errorHandler.js
│   │   └── notFound.js
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── contractors/
│   │   ├── decks/
│   │   ├── files/
│   │   ├── catalogs/
│   │   ├── pricing/
│   │   ├── estimates/
│   │   ├── condition-analysis/
│   │   ├── leads/
│   │   ├── discounts/
│   │   ├── reports/
│   │   ├── notifications/
│   │   └── admin/
│   ├── utils/
│   ├── app.js
│   └── server.js
├── tests/
├── package.json
└── .env.example
```

Each module should contain only the files it actually needs. Use this pattern when appropriate:

```text
module-name/
├── module.routes.js
├── module.controller.js
├── module.service.js
├── module.model.js
└── module.validation.js
```

### Backend responsibilities

- `config/`: validate environment configuration and connect to MongoDB.
- `middleware/`: authentication, authorization, validation, and centralized error handling.
- `modules/`: business capabilities separated by responsibility.
- `utils/`: shared technical helpers without business-specific behavior.
- `app.js`: configure Express middleware and register routes.
- `server.js`: start the server and handle startup/shutdown.
- `tests/`: module and API tests.

### Module boundaries

- `auth/`: registration, login, verification, and account recovery.
- `users/`: user profile and account status.
- `contractors/`: business profiles, license details, and verification workflow.
- `decks/`: deck dimensions, materials, services, and saved deck inputs.
- `files/`: secure file upload and retrieval metadata.
- `catalogs/`: material and service catalog management.
- `pricing/`: approved pricing configuration and calculation rules.
- `estimates/`: estimate creation, history, revisions, and totals.
- `condition-analysis/`: AI requests, results, model metadata, and limitations.
- `leads/`: contractor requests, assignment, and lead status.
- `discounts/`: administrator-configured contractor discounts and eligibility.
- `reports/`: estimate reports and administrative reports.
- `notifications/`: email and application notifications.
- `admin/`: administrative workflows and dashboard endpoints.

Avoid duplicating pricing calculations, authorization checks, or estimate logic across modules.

## 7. Database and Data Ownership

Use MongoDB Atlas with Mongoose.

The initial candidate collections are:

- `users`
- `contractorProfiles`
- `decks`
- `materialCatalog`
- `serviceCatalog`
- `pricingConfigs`
- `estimates`
- `files`
- `conditionAnalyses`
- `leads`
- `discountPlans`
- `auditLogs`

Additional collections should be added only when justified by a confirmed workflow.

Use ObjectId references where appropriate, timestamps for auditable records, validation, and indexes for common queries.

### Estimate integrity

Every saved estimate must preserve the relevant input snapshot, pricing configuration/version, line items, applicable discount, currency, and calculated totals.

Historical estimates must not silently change when an administrator updates current pricing.

All final calculations must be performed and validated by the backend.

Pricing values mentioned in examples are not approved business rules until confirmed by the project owner.

## 8. Authorization and Security

### Customer

- Access only their own decks, files, estimates, and requests.
- Cannot change administrator pricing or contractor verification.
- Cannot access another customer's records by changing an ID.

### Contractor

- Must pass the required account and business verification process.
- Access only assigned leads and explicitly authorized related records.
- Cannot access unrelated customer records.
- Cannot modify base pricing or grant themselves discounts.
- Can perform only permitted lead and estimate actions.

### Admin

- Can perform authorized administrative operations.
- Pricing, discount, verification, and assignment changes must be validated and auditable.

### Required security rules

1. Enforce authorization on the server for every protected operation.
2. Verify record ownership and lead assignment, not just the user's role.
3. Hash passwords using a suitable password-hashing algorithm.
4. Never commit secrets or expose them in frontend code.
5. Validate request bodies, query parameters, uploaded file types, and file sizes.
6. Restrict file access and use short-lived signed URLs when appropriate.
7. Use safe error responses and avoid logging passwords, tokens, or sensitive file contents.
8. Add rate limiting to authentication and other abuse-prone endpoints.
9. Record important administrative and pricing changes in audit logs.
10. Test both permitted and denied access paths.

## 9. Pricing and Discount Flow

```text
Validated Deck Inputs
        |
        v
Active Pricing Configuration
        |
        v
Backend Pricing Service
        |
        v
Eligible Discount Evaluation
        |
        v
Estimate Totals
        |
        v
Save Estimate Snapshot
        |
        v
Return Estimate to Frontend
```

The pricing service must be deterministic and unit-tested.

The frontend may display calculated values but must never be trusted to supply authoritative totals.

Discount eligibility, discount limits, effective dates, and applicable pricing scope must come from administrator-approved configuration.

Do not hardcode unconfirmed minimum prices, coating rates, travel charges, taxes, or discount percentages.

## 10. AI Condition Analysis

AI condition analysis is an optional integration.

The module may accept authorized deck images and return visible-condition classifications, confidence information when supported, and recommendations for human inspection.

The system must:

- Track analysis status and model version.
- Handle failed, inconclusive, and low-quality images.
- Clearly distinguish model predictions from confirmed findings.
- Avoid claiming that photographs prove structural integrity or safety.
- Keep AI analysis separate from authoritative pricing logic unless an approved rule explicitly links them.

The application must remain usable if AI analysis is unavailable.

## 11. API Conventions

Use a versioned REST API:

`/api/v1/...`

Examples:

- `/api/v1/auth`
- `/api/v1/decks`
- `/api/v1/estimates`
- `/api/v1/condition-analyses`
- `/api/v1/leads`
- `/api/v1/contractors`
- `/api/v1/admin`

Use consistent response structures and appropriate HTTP status codes.

Validate inputs before executing business logic. Controllers should handle HTTP concerns, while services implement business rules.

Document authentication requirements, roles, request validation, response formats, and error cases for every endpoint.

## 12. Testing Strategy

Minimum test coverage should include:

- Pricing calculations and rounding.
- Minimum-price and fee rules after business approval.
- Discount eligibility and limits.
- Customer record ownership.
- Contractor lead assignment boundaries.
- Admin-only operations.
- Authentication and account verification.
- File-upload validation and access restrictions.
- Estimate snapshot preservation.
- AI failure and inconclusive-result handling.
- API validation and error responses.

Do not consider a feature complete merely because its UI renders. Its API, authorization, business rules, and tests must also pass.

## 13. Development Sequence

Phase 1: Inspect the existing project and specification.

Phase 2: Approve the architecture and folder structure.

Phase 3: Create the minimal frontend/backend skeleton and development scripts.

Phase 4: Configure environment validation, MongoDB connection, Express setup, and error handling.

Phase 5: Implement authentication and authorization.

Phase 6: Implement deck inputs and secure file handling.

Phase 7: Implement catalog and pricing configuration.

Phase 8: Implement estimate calculation, persistence, history, and reports.

Phase 9: Implement AI condition analysis.

Phase 10: Implement contractor verification, lead assignment, and contractor workflows.

Phase 11: Implement administrative workflows, discounts, reporting, and audit logs.

Phase 12: Run integration/security tests and prepare deployment.

Each phase must be implemented, tested, and reviewed before proceeding to the next.

## 14. Instructions for Antigravity

For the initial architecture task:

1. Read the existing Markdown specification completely.
2. Inspect the actual repository before making changes.
3. Compare this architecture with the requirements and identify gaps or conflicts.
4. Report the current project state and proposed directory tree.
5. Separate confirmed requirements from unresolved decisions.
6. Do not create, delete, rename, overwrite, or install anything yet.
7. Wait for explicit approval before creating the project structure.

After approval, implement only the approved phase, verify the result, and report changed files, commands run, tests passed or failed, and remaining issues.

Never claim that code, tests, database connectivity, or deployment succeeded unless the result has actually been verified.


Follow this archtecture : 
DECK PRO --- Expanded Project Structure
Status: Proposed architecture; not yet implemented or verified
against the actual repository.
Architecture: Modular monolith with separate React frontend and
Express backend.
Stack: React + Vite, Node.js + Express, MongoDB Atlas + Mongoose.
1. Architecture rules
- The frontend presents information and calls the API; it is not the
  source of truth for permissions, pricing, discounts, ownership, or
  lead assignment.
- The backend is a modular monolith. Do not introduce microservices or
  queues without a confirmed requirement.
- Keep business logic in services, request/response handling in
  controllers, and route definitions in routes.
- Each feature should own its validation, model, service, controller,
  and routes where needed. Do not create empty boilerplate files just
  to match the tree.
- Store photos and generated reports in object storage. MongoDB stores
  metadata and references, not large binary files.
- Preserve estimate input snapshots, pricing version, line items,
  discounts, currency, and totals so historical estimates do not
  silently change.
- Treat AI condition analysis as optional and uncertain; photo
  analysis cannot certify structural safety.
- All values such as minimum job price, coating rates, travel fees,
  tax, and discounts remain unapproved examples until the business
  owner confirms them.
- Never commit .env secrets. .env.example contains names and
  placeholders only.
2. Proposed root tree
deck-pro/
├── frontend/
├── backend/
├── docs/
│   ├── ARCHITECTURE.md
│   ├── HLD.md
│   ├── LLD.md
│   ├── database-schema.md
│   ├── api-specification.md
│   ├── pricing-rules.md
│   ├── security-model.md
│   ├── testing-plan.md
│   └── deployment-runbook.md
├── tests/
│   └── e2e/
├── .gitignore
├── .editorconfig
├── .env.example
├── README.md
└── package.json                 # Optional root scripts; only add if useful
3. Frontend --- React + Vite
frontend/
├── public/
│   ├── favicon.svg
│   └── images/                  # Only static public assets
├── src/
│   ├── app/
│   │   ├── App.jsx              # Root UI component
│   │   ├── router.jsx           # Route definitions
│   │   ├── routeGuards.jsx      # UX-level route guards; not security boundary
│   │   └── providers.jsx        # Shared React providers, if needed
│   ├── api/
│   │   ├── client.js            # Shared HTTP client and safe defaults
│   │   ├── endpoints.js         # Central endpoint constants
│   │   └── apiErrors.js         # Normalize API errors for UI
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── styles/
│   │       ├── global.css
│   │       └── variables.css
│   ├── components/
│   │   ├── ui/                  # Button, input, modal, spinner, etc.
│   │   ├── shared/              # Reusable app-wide components
│   │   ├── feedback/            # Loading, empty, and error states
│   │   └── forms/               # Shared form controls
│   ├── layouts/
│   │   ├── PublicLayout.jsx
│   │   ├── CustomerLayout.jsx
│   │   ├── ContractorLayout.jsx
│   │   └── AdminLayout.jsx
│   ├── features/
│   │   ├── auth/
│   │   │   ├── api/
│   │   │   │   └── authApi.js
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   └── RegistrationForm.jsx
│   │   │   ├── pages/
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   ├── RegisterPage.jsx
│   │   │   │   ├── VerifyAccountPage.jsx
│   │   │   │   └── AccountRecoveryPage.jsx
│   │   │   └── hooks/
│   │   │       └── useAuth.js
│   │   ├── customer/
│   │   │   ├── api/
│   │   │   │   ├── decksApi.js
│   │   │   │   ├── estimatesApi.js
│   │   │   │   └── leadsApi.js
│   │   │   ├── components/
│   │   │   │   ├── DeckInputForm.jsx
│   │   │   │   ├── PhotoUploader.jsx
│   │   │   │   ├── ConditionAnalysisPanel.jsx
│   │   │   │   ├── EstimateSummary.jsx
│   │   │   │   └── EstimateLineItems.jsx
│   │   │   └── pages/
│   │   │       ├── CustomerDashboardPage.jsx
│   │   │       ├── DeckEstimatorPage.jsx
│   │   │       ├── EstimateDetailsPage.jsx
│   │   │       ├── EstimateHistoryPage.jsx
│   │   │       ├── ContractorRequestPage.jsx
│   │   │       ├── MyRequestsPage.jsx
│   │   │       └── CustomerProfilePage.jsx
│   │   ├── contractor/
│   │   │   ├── api/
│   │   │   │   ├── contractorApi.js
│   │   │   │   └── contractorLeadsApi.js
│   │   │   ├── components/
│   │   │   │   ├── BusinessProfileForm.jsx
│   │   │   │   ├── VerificationStatus.jsx
│   │   │   │   ├── AssignedLeadList.jsx
│   │   │   │   └── LeadStatusControl.jsx
│   │   │   └── pages/
│   │   │       ├── ContractorDashboardPage.jsx
│   │   │       ├── ContractorApplicationPage.jsx
│   │   │       ├── ContractorLeadsPage.jsx
│   │   │       ├── ContractorLeadDetailsPage.jsx
│   │   │       ├── ContractorEstimatePage.jsx
│   │   │       └── ContractorProfilePage.jsx
│   │   └── admin/
│   │       ├── api/
│   │       │   ├── adminUsersApi.js
│   │       │   ├── adminContractorsApi.js
│   │       │   ├── adminCatalogsApi.js
│   │       │   ├── adminPricingApi.js
│   │       │   ├── adminDiscountsApi.js
│   │       │   └── adminLeadsApi.js
│   │       ├── components/
│   │       │   ├── AdminDataTable.jsx
│   │       │   ├── ContractorReviewPanel.jsx
│   │       │   ├── PricingConfigForm.jsx
│   │       │   └── DiscountPlanForm.jsx
│   │       └── pages/
│   │           ├── AdminDashboardPage.jsx
│   │           ├── UserManagementPage.jsx
│   │           ├── ContractorVerificationPage.jsx
│   │           ├── MaterialCatalogPage.jsx
│   │           ├── ServiceCatalogPage.jsx
│   │           ├── PricingManagementPage.jsx
│   │           ├── DiscountManagementPage.jsx
│   │           ├── LeadManagementPage.jsx
│   │           └── ReportsAuditPage.jsx
│   ├── hooks/
│   │   ├── useDebounce.js        # Add only if needed
│   │   └── usePagination.js      # Add only if needed
│   ├── utils/
│   │   ├── formatCurrency.js
│   │   ├── formatDate.js
│   │   └── formErrors.js
│   ├── main.jsx                  # React entry point
│   └── testSetup.js              # Test setup if chosen test runner requires it
├── .env.example
├── index.html
├── package.json
└── vite.config.js
Frontend file responsibilities
- App.jsx: mounts the main application shell.
- router.jsx: maps URL paths to pages and layouts.
- routeGuards.jsx: improves navigation UX based on current
  session/role; backend authorization remains mandatory.
- providers.jsx: central location for providers only when the app
  needs them.
- api/client.js: shared base URL, credentials/token strategy, and
  request defaults. Do not hardcode secrets.
- api/apiErrors.js: turns API error responses into predictable UI
  messages.
- components/ui/: generic reusable controls without DECK PRO
  business logic.
- features/*/api/: API calls used by that feature.
- features/*/components/: feature-specific UI pieces.
- features/*/pages/: route-level screens.
- formatCurrency.js: presentation formatting only; it must not
  calculate authoritative estimate totals.
Use one authentication/session strategy consistently. Prefer secure,
HTTP-only cookies where the deployment and CSRF protections are designed
for them; do not store long-lived sensitive tokens in local storage by
default.
4. Backend --- Node.js + Express
backend/
├── src/
│   ├── config/
│   │   ├── env.js                # Read and validate required environment variables
│   │   ├── database.js           # Mongoose connection
│   │   ├── cors.js               # Allowed origins
│   │   └── storage.js             # Object-storage adapter configuration
│   ├── middleware/
│   │   ├── authenticate.js       # Establish the authenticated principal
│   │   ├── authorize.js          # Role/permission checks
│   │   ├── validate.js           # Request schema validation adapter
│   │   ├── rateLimiters.js       # Auth and sensitive-route rate limits
│   │   ├── requestId.js          # Correlation/request ID
│   │   ├── notFound.js            # Unknown route handler
│   │   └── errorHandler.js       # Central safe error responses
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.validation.js
│   │   │   └── auth.model.js      # Only if auth-specific records are needed
│   │   ├── users/
│   │   │   ├── users.routes.js
│   │   │   ├── users.controller.js
│   │   │   ├── users.service.js
│   │   │   ├── users.model.js
│   │   │   └── users.validation.js
│   │   ├── contractors/
│   │   │   ├── contractors.routes.js
│   │   │   ├── contractors.controller.js
│   │   │   ├── contractors.service.js
│   │   │   ├── contractorProfile.model.js
│   │   │   └── contractors.validation.js
│   │   ├── decks/
│   │   │   ├── decks.routes.js
│   │   │   ├── decks.controller.js
│   │   │   ├── decks.service.js
│   │   │   ├── deck.model.js
│   │   │   └── decks.validation.js
│   │   ├── files/
│   │   │   ├── files.routes.js
│   │   │   ├── files.controller.js
│   │   │   ├── files.service.js
│   │   │   ├── file.model.js
│   │   │   ├── storageProvider.js
│   │   │   └── files.validation.js
│   │   ├── catalogs/
│   │   │   ├── catalogs.routes.js
│   │   │   ├── catalogs.controller.js
│   │   │   ├── catalogs.service.js
│   │   │   ├── material.model.js
│   │   │   ├── service.model.js
│   │   │   └── catalogs.validation.js
│   │   ├── pricing/
│   │   │   ├── pricing.routes.js
│   │   │   ├── pricing.controller.js
│   │   │   ├── pricing.service.js
│   │   │   ├── pricingEngine.js
│   │   │   ├── pricingConfig.model.js
│   │   │   └── pricing.validation.js
│   │   ├── estimates/
│   │   │   ├── estimates.routes.js
│   │   │   ├── estimates.controller.js
│   │   │   ├── estimates.service.js
│   │   │   ├── estimate.model.js
│   │   │   └── estimates.validation.js
│   │   ├── condition-analysis/
│   │   │   ├── conditionAnalysis.routes.js
│   │   │   ├── conditionAnalysis.controller.js
│   │   │   ├── conditionAnalysis.service.js
│   │   │   ├── conditionAnalysis.model.js
│   │   │   ├── aiProvider.js
│   │   │   └── conditionAnalysis.validation.js
│   │   ├── leads/
│   │   │   ├── leads.routes.js
│   │   │   ├── leads.controller.js
│   │   │   ├── leads.service.js
│   │   │   ├── lead.model.js
│   │   │   └── leads.validation.js
│   │   ├── discounts/
│   │   │   ├── discounts.routes.js
│   │   │   ├── discounts.controller.js
│   │   │   ├── discounts.service.js
│   │   │   ├── discountPlan.model.js
│   │   │   └── discounts.validation.js
│   │   ├── reports/
│   │   │   ├── reports.routes.js
│   │   │   ├── reports.controller.js
│   │   │   ├── reports.service.js
│   │   │   └── reportRenderer.js
│   │   ├── notifications/
│   │   │   ├── notifications.service.js
│   │   │   └── emailProvider.js
│   │   └── admin/
│   │       ├── admin.routes.js
│   │       ├── admin.controller.js
│   │       ├── admin.service.js
│   │       └── admin.validation.js
│   ├── shared/
│   │   ├── constants/
│   │   ├── errors/
│   │   ├── logger/
│   │   └── validators/
│   ├── app.js                    # Configure Express and mount routes
│   └── server.js                 # Connect dependencies and start server
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── .env.example
└── package.json
Backend conventions
For most modules, the request path is:

Route → Authentication/Authorization → Validation → Controller → Service → Model/Provider
- Routes: define HTTP methods and middleware; do not contain
  business calculations.
- Controllers: translate HTTP requests into service calls and
  format responses.
- Services: implement business rules and coordinate
  models/providers.
- Models: define Mongoose schemas, indexes, and data constraints.
- Validation: validate body, parameters, and query values before
  service execution.
- Providers/adapters: isolate external services such as object
  storage, email, or AI.
- app.js: create/configure Express, mount /api/v1 routes, and
  install error handlers.
- server.js: validate configuration, connect to MongoDB, then
  start listening; handle graceful shutdown.
Do not create duplicate model files in unrelated modules. A module may
import another module's public service interface, but avoid circular
dependencies. Keep shared code genuinely generic.
5. Candidate MongoDB collections
users
contractorProfiles
decks
materialCatalog
serviceCatalog
pricingConfigs
estimates
files
conditionAnalyses
leads
discountPlans
auditLogs
Main collection purpose
- users: identity, normalized email/phone, password hash, role,
  account status, verification timestamps.
- contractorProfiles: business details, license/jurisdiction,
  application status, reviewer and decision details.
- decks: customer owner, dimensions, unit, area, material/service
  selections, validated inputs.
- materialCatalog: administrator-managed material definitions and
  active state.
- serviceCatalog: administrator-managed service definitions and
  active state.
- pricingConfigs: versioned pricing rules, currency, status,
  effective dates, change metadata.
- estimates: owner, deck, status, input snapshot, pricing version,
  line items, discount/tax/adjustment totals, final total, revision
  metadata.
- files: owner, storage provider/key, content type, size, upload
  status, related record references.
- conditionAnalyses: file/deck references, processing status,
  model/version, predictions, confidence if supplied, limitations,
  timestamps.
- leads: customer, estimate/deck, status, assigned contractor,
  assignment metadata, request details.
- discountPlans: approved discount type/value, eligibility, scope,
  limits, effective dates, status.
- auditLogs: actor, action, target, sanitized change summary,
  request/correlation ID, timestamp.
Finalize field-level schemas and indexes in docs/database-schema.md
before implementation. Add collections such as notifications,
verification challenges, or assignment history only if their workflow
requires them.
6. Access-control matrix
  Resource/action   Customer          Contractor        Admin
  Manage own        Yes               Yes               Authorized admin
  profile                                               

  Create/manage own Yes               No, unless        Authorized admin
  deck                                explicitly
                                      required          

  View own          Yes               Only authorized   Authorized admin
  estimates                           lead-related
                                      access            

  View assigned     No                Yes               Yes
  leads                                                 

  Assign/reassign   No                No                Yes
  leads                                                 

  Apply/change base No                No                Yes,
  pricing                                               permission-controlled

  Manage discount   No                No                Yes,
  plans                                                 permission-controlled

  Approve           No                No                Yes
  contractor                                            
  View audit logs   No                No                Authorized admin
Every API must also check record ownership and assignment. A role check
alone is insufficient.
7. API areas
Use /api/v1 as the API prefix.
- /auth: registration, login, logout, verification, recovery,
  current session.
- /users: current user profile and account settings.
- /contractors: business application, profile, verification status.
- /decks: create, view, update, and delete authorized deck records.
- /files: secure upload, metadata, access, and deletion where
  allowed.
- /catalogs: active material/service catalog for estimation.
- /pricing: administrator-managed pricing configuration and
  validated calculation.
- /estimates: create, retrieve, revise, finalize, history, report.
- /condition-analyses: request and retrieve optional AI analysis.
- /leads: create requests, view authorized leads, update permitted
  status.
- /discounts: authorized discount administration and eligibility
  evaluation.
- /reports: generated estimate reports and administrative reporting.
- /admin: administrative operations protected by explicit
  permissions.
Define exact request/response schemas and endpoint methods in
docs/api-specification.md; do not assume this list alone is a finished
API contract.
8. Documentation files
- docs/ARCHITECTURE.md: this architecture and folder responsibility
  guide.
- docs/HLD.md: system context, major components, and end-to-end
  flows.
- docs/LLD.md: module internals, schemas, validations, and
  algorithms.
- docs/database-schema.md: collections, fields, references, indexes,
  constraints.
- docs/api-specification.md: endpoint contract, authentication,
  request/response examples.
- docs/pricing-rules.md: approved formulas, rounding, minimums,
  taxes, fees, discount policy.
- docs/security-model.md: roles, ownership checks, file access,
  secret management.
- docs/testing-plan.md: unit, integration, authorization, and
  regression tests.
- docs/deployment-runbook.md: environment configuration, build,
  deploy, rollback, monitoring.
- README.md: quick start, prerequisites, commands, and links to
  detailed docs.
9. Root configuration responsibilities
- .gitignore: ignore node_modules/, build output, coverage, logs,
  local .env files, uploads, and generated private artifacts.
- .editorconfig: consistent indentation and line endings.
- .env.example: placeholder variable names for local configuration,
  never real credentials.
- README.md: setup and project status.
- Root package.json: optional workspace scripts only if they
  simplify running frontend/backend; do not add a monorepo tool
  without need.
Environment variable names should be finalized by the implementation,
but commonly include NODE_ENV, PORT, MONGODB_URI, frontend origin,
session/auth configuration, and storage/email/AI provider settings as
applicable. Never put backend secrets in frontend/.env variables
exposed to the browser.
10. Implementation sequence
1. Inspect the current repository and existing Markdown specification.
2. Compare the specification with this architecture; list gaps and
   conflicts.
3. Approve the proposed directory tree.
4. Create minimal frontend/backend skeleton and development scripts.
5. Configure environment validation, database connection, Express
   setup, and centralized errors.
6. Implement authentication, authorization, and user profile.
7. Implement deck inputs and secure file metadata/upload workflow.
8. Implement catalog and administrator-managed pricing configuration.
9. Implement pricing service and estimate persistence/history.
10. Implement optional AI condition analysis.
11. Implement contractor verification and lead workflows.
12. Implement discount administration, reports, and audit logs.
13. Complete integration, security, and regression tests.
14. Prepare deployment and operational documentation.
For each phase, report files changed, commands run, test results,
unresolved issues, and manual verification required.
11. Antigravity instruction
Before creating any files, inspect the existing repository and read the
existing project Markdown specification plus this architecture document.
Report: 1. Current repository state. 2. Proposed final directory tree.
3. Differences or conflicts with the specification. 4. Any files that
already exist and must be preserved. 5. The first implementation phase
and its dependencies.

Do not modify, delete, rename, overwrite, or install anything until
explicit approval is given. After approval, implement only one phase at
a time and verify it before proceeding.