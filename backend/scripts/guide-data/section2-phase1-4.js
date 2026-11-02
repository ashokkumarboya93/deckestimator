module.exports = function getSection2Phase1To4() {
  return `## Section 2: Phase-Wise API Catalog & Manual Testing Specifications

This section documents every endpoint implemented in the Deck Estimator platform mapped across all project phases.

---

### Phase 1: Project Inspection, Requirements Analysis and Architecture

- **Status:** Complete (Planning, System Architecture, & Security Verification Matrix).
- **Associated API Endpoints:** None.
- **Architectural Mapping:** Phase 1 was dedicated to requirement specifications, structural blueprints, and verification matrices. Backend foundation began in Phase 2.

---

### Phase 2: Project Structure, Application Skeleton and Backend Foundation

This phase established the Express application skeleton, global error handling, MongoDB Atlas connection, security middleware, and system telemetry.

#### API-001: Backend API Health & Telemetry Check

- **API Identification:**
  - **API ID:** \`API-001\`
  - **Phase:** Phase 2 (Foundation)
  - **Module:** Health & Diagnostics
  - **HTTP Method:** \`GET\`
  - **Endpoint URL:** \`http://localhost:5000/api/v1/health\`
  - **Controller Reference:** Inline handler in [\`backend/src/app.js\`](file:///e:/DeckEstimator/backend/src/app.js#L47-L56)
  - **Service Reference:** Direct application response
  - **Authentication Required:** No (Public endpoint)
  - **Allowed User Roles:** All (Public / Unauthenticated)
  - **Purpose:** Verifies that the Express server is running, the Node.js event loop is operational, and reports current environment metadata.
  - **Internal Behavior:** Resolves immediately with HTTP 200, current server timestamp, and runtime environment string (\`development\`, \`test\`, or \`production\`).

- **Required Headers:**
  \`\`\`http
  Accept: application/json
  \`\`\`

- **Required Parameters:** None.

- **Example Request Data:** No request body.

- **Expected Successful Response (HTTP 200 OK):**
  \`\`\`json
  {
    "success": true,
    "data": {
      "status": "ok",
      "environment": "development",
      "timestamp": "2026-11-02T14:15:30.123Z"
    }
  }
  \`\`\`

- **Expected Error Responses:**
  - *Server Offline:* If the backend server is stopped, Postman displays \`Could not send request: connect ECONNREFUSED 127.0.0.1:5000\`. Start server via \`npm start --prefix backend\`.

- **Database Verification:** None (Stateless telemetry endpoint).

- **Manual Testing Scenarios:**
  1. *Positive Scenario:* Send \`GET {{baseUrl}}/health\` &rarr; Expect HTTP 200 with \`status: "ok"\`.
  2. *Method Not Allowed:* Send \`POST {{baseUrl}}/health\` &rarr; Expect HTTP 404 (Route not mounted for POST).

---

### Phase 3: Authentication and Authorization

This phase implements user identity lifecycle, JWT token issuance, password hashing via bcrypt, role assignment, HttpOnly session cookies, and user profile management.

#### API-002: User Account Registration

- **API Identification:**
  - **API ID:** \`API-002\`
  - **Phase:** Phase 3 (Auth)
  - **Module:** Authentication
  - **HTTP Method:** \`POST\`
  - **Endpoint URL:** \`http://localhost:5000/api/v1/auth/register\`
  - **Controller Reference:** [\`backend/src/modules/auth/auth.controller.js\`](file:///e:/DeckEstimator/backend/src/modules/auth/auth.controller.js#L14-L35)
  - **Service Reference:** [\`backend/src/modules/auth/auth.service.js\`](file:///e:/DeckEstimator/backend/src/modules/auth/auth.service.js#L25-L95)
  - **Authentication Required:** No (Public)
  - **Allowed User Roles:** Unauthenticated Guests (Can register as \`customer\` or \`contractor\`)
  - **Purpose:** Creates a new account, hashes password using bcrypt, sets default status, issues JWT, and if role is \`contractor\`, initializes a linked Contractor Profile.
  - **Internal Behavior:** Validates payload against \`registerSchema\`. Rejects duplicate emails (HTTP 409). Forbids registration with role \`admin\` (HTTP 400). Hashes password (cost 10). Persists user in MongoDB. For contractors, creates linked \`ContractorProfile\` with \`verificationStatus: "pending"\`. Sets \`Set-Cookie: token=<jwt>\` and returns user object without password hash.

- **Required Headers:**
  \`\`\`http
  Content-Type: application/json
  Accept: application/json
  \`\`\`

- **Required Parameters (JSON Body):**
  - \`fullName\` *(string, required)*: 2 to 100 characters.
  - \`email\` *(string, required)*: Valid RFC email address. Must be unique.
  - \`password\` *(string, required)*: Minimum 8 characters, maximum 128 characters.
  - \`phone\` *(string, optional)*: Phone contact number.
  - \`role\` *(string, optional)*: Allowed: \`customer\`, \`contractor\`. Default: \`customer\`.
  - \`businessName\` *(string, optional/contractor)*: Required if \`role === "contractor"\`.
  - \`licenseNumber\` *(string, optional/contractor)*: Contractor trade license.
  - \`licenseJurisdiction\` *(string, optional)*: State or jurisdiction code.

- **Example Request Data (Customer):**
  \`\`\`json
  {
    "fullName": "Alice Customer",
    "email": "alice.test@example.com",
    "password": "Password123!",
    "phone": "555-123-4567",
    "role": "customer"
  }
  \`\`\`

- **Example Request Data (Contractor):**
  \`\`\`json
  {
    "fullName": "Robert Builder",
    "email": "robert.contractor@example.com",
    "password": "Password123!",
    "phone": "555-987-6543",
    "role": "contractor",
    "businessName": "Apex Deck Solutions LLC",
    "licenseNumber": "LIC-TX-2026-99",
    "licenseJurisdiction": "TX"
  }
  \`\`\`

- **Expected Successful Response (HTTP 201 Created):**
  \`\`\`json
  {
    "success": true,
    "data": {
      "user": {
        "id": "6ae87b6db8fa5774ba5b4610",
        "email": "alice.test@example.com",
        "fullName": "Alice Customer",
        "phone": "555-123-4567",
        "role": "customer",
        "accountStatus": "active",
        "createdAt": "2026-11-02T14:20:00.000Z"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  \`\`\`

- **Expected Error Responses:**
  - *Duplicate Email (HTTP 409 Conflict):*
    - Reproduction: Send the same email twice.
    - Payload: \`{ "success": false, "error": { "code": "EMAIL_IN_USE", "message": "An account with this email already exists." } }\`
  - *Short Password (HTTP 400 Bad Request):*
    - Reproduction: Provide \`"password": "123"\`.
    - Payload: \`{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "Invalid request parameters." } }\`
  - *Privilege Escalation Attempt (HTTP 400 Bad Request):*
    - Reproduction: Provide \`"role": "admin"\`.
    - Payload: \`{ "success": false, "error": { "code": "VALIDATION_ERROR", "details": [{ "field": "role", "message": "Role \"admin\" is not allowed during public registration." }] } }\`

- **Database Verification:**
  - MongoDB Collection: \`users\`
  - Query: \`{ email: "alice.test@example.com" }\`
  - Verify: Document created with \`passwordHash\` (starts with \`$2b$10$\`), \`accountStatus: "active"\`, and no plain-text password stored. For contractors, check \`contractorProfiles\` collection for linked record with \`userId: <user_id>\`.

- **Manual Testing Scenarios:**
  1. *Positive Customer:* Register unique email &rarr; Expect 201 + JWT + User object.
  2. *Positive Contractor:* Register with \`role: "contractor"\` + \`businessName\` &rarr; Expect 201 + profile created.
  3. *Negative Duplicate:* Re-register same email &rarr; Expect 409 Conflict.
  4. *Negative Admin Role:* Provide \`"role": "admin"\` &rarr; Expect 400 Bad Request.

---

#### API-003: User Login & Session Establishment

- **API Identification:**
  - **API ID:** \`API-003\`
  - **Phase:** Phase 3 (Auth)
  - **Module:** Authentication
  - **HTTP Method:** \`POST\`
  - **Endpoint URL:** \`http://localhost:5000/api/v1/auth/login\`
  - **Controller Reference:** [\`backend/src/modules/auth/auth.controller.js\`](file:///e:/DeckEstimator/backend/src/modules/auth/auth.controller.js#L37-L55)
  - **Service Reference:** [\`backend/src/modules/auth/auth.service.js\`](file:///e:/DeckEstimator/backend/src/modules/auth/auth.service.js#L100-L145)
  - **Authentication Required:** No (Public)
  - **Allowed User Roles:** Registered Users (Customer, Contractor, Admin)
  - **Purpose:** Authenticates user credentials, updates \`lastLoginAt\`, sets HttpOnly cookie, and issues a JWT token.
  - **Internal Behavior:** Looks up user by email. Compares password with bcrypt. Rejects suspended/deactivated users (HTTP 403 / 401). Generates signed JWT containing \`{ id, role, email }\`. Updates user \`lastLoginAt\` timestamp. Sets cookie and returns response.

- **Required Headers:**
  \`\`\`http
  Content-Type: application/json
  Accept: application/json
  \`\`\`

- **Required Parameters (JSON Body):**
  - \`email\` *(string, required)*: User account email.
  - \`password\` *(string, required)*: User password.

- **Example Request Data:**
  \`\`\`json
  {
    "email": "admin@deckestimator.com",
    "password": "AdminPass123!"
  }
  \`\`\`

- **Expected Successful Response (HTTP 200 OK):**
  \`\`\`json
  {
    "success": true,
    "data": {
      "user": {
        "id": "6ae87b6db8fa5774ba5b4601",
        "email": "admin@deckestimator.com",
        "fullName": "Platform Administrator",
        "role": "admin",
        "accountStatus": "active",
        "lastLoginAt": "2026-11-02T14:25:00.000Z"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  \`\`\`

- **Expected Error Responses:**
  - *Invalid Credentials (HTTP 401 Unauthorized):*
    - Reproduction: Send wrong password or unregistered email.
    - Payload: \`{ "success": false, "error": { "code": "INVALID_CREDENTIALS", "message": "Invalid email or password." } }\`
  - *Missing Fields (HTTP 400 Bad Request):*
    - Reproduction: Send \`{ "email": "admin@deckestimator.com" }\` (missing password).
    - Payload: \`{ "success": false, "error": { "code": "VALIDATION_ERROR", "details": [{ "field": "password", "message": "Password is required" }] } }\`

- **Database Verification:**
  - MongoDB Collection: \`users\`
  - Verify field: \`lastLoginAt\` is updated to current timestamp.

- **Manual Testing Scenarios:**
  1. *Positive Login:* Valid credentials &rarr; Expect 200 OK + JWT.
  2. *Negative Bad Password:* Wrong password &rarr; Expect 401 Unauthorized.
  3. *Negative Unknown Email:* Nonexistent email &rarr; Expect 401 Unauthorized (Prevents user enumeration).

---

#### API-004: User Logout & Session Invalidation

- **API Identification:**
  - **API ID:** \`API-004\`
  - **Phase:** Phase 3 (Auth)
  - **Module:** Authentication
  - **HTTP Method:** \`POST\`
  - **Endpoint URL:** \`http://localhost:5000/api/v1/auth/logout\`
  - **Controller Reference:** [\`backend/src/modules/auth/auth.controller.js\`](file:///e:/DeckEstimator/backend/src/modules/auth/auth.controller.js#L57-L68)
  - **Service Reference:** Inline clearing of session cookie
  - **Authentication Required:** Optional / All
  - **Allowed User Roles:** All
  - **Purpose:** Clears the HttpOnly authentication session cookie from the client.
  - **Internal Behavior:** Calls \`res.clearCookie('token')\` and returns success.

- **Required Headers:**
  \`\`\`http
  Accept: application/json
  \`\`\`

- **Required Parameters:** None.

- **Expected Successful Response (HTTP 200 OK):**
  \`\`\`json
  {
    "success": true,
    "data": {
      "message": "Successfully logged out."
    }
  }
  \`\`\`

- **Database Verification:** None (Cookie expiration is handled on HTTP layer).

- **Manual Testing Scenarios:**
  1. *Positive Logout:* Send \`POST {{baseUrl}}/auth/logout\` &rarr; Expect HTTP 200 and \`Set-Cookie\` with expired timestamp.

---

#### API-005: Retrieve Current Authenticated User Session

- **API Identification:**
  - **API ID:** \`API-005\`
  - **Phase:** Phase 3 (Auth)
  - **Module:** Authentication
  - **HTTP Method:** \`GET\`
  - **Endpoint URL:** \`http://localhost:5000/api/v1/auth/me\`
  - **Controller Reference:** [\`backend/src/modules/auth/auth.controller.js\`](file:///e:/DeckEstimator/backend/src/modules/auth/auth.controller.js#L70-L82)
  - **Service Reference:** [\`backend/src/modules/auth/auth.service.js\`](file:///e:/DeckEstimator/backend/src/modules/auth/auth.service.js#L150-L165)
  - **Authentication Required:** Yes (JWT Bearer Token or Cookie)
  - **Allowed User Roles:** \`customer\`, \`contractor\`, \`admin\`
  - **Purpose:** Returns the current profile of the authenticated user. If contractor, includes linked verification status.
  - **Internal Behavior:** Reads user ID from validated JWT. Queries MongoDB \`users\` collection. If user role is \`contractor\`, populates \`contractorProfile\`. Never returns \`passwordHash\`.

- **Required Headers:**
  \`\`\`http
  Authorization: Bearer {{customerToken}}
  Accept: application/json
  \`\`\`

- **Expected Successful Response (HTTP 200 OK):**
  \`\`\`json
  {
    "success": true,
    "data": {
      "user": {
        "id": "6ae87b6db8fa5774ba5b4610",
        "email": "alice.test@example.com",
        "fullName": "Alice Customer",
        "phone": "555-123-4567",
        "role": "customer",
        "accountStatus": "active",
        "createdAt": "2026-11-02T14:20:00.000Z"
      }
    }
  }
  \`\`\`

- **Expected Error Responses:**
  - *No Token (HTTP 401 Unauthorized):* \`{ "success": false, "error": { "code": "AUTH_REQUIRED", "message": "Authentication is required to access this resource." } }\`
  - *Malformed Token (HTTP 401 Unauthorized):* \`{ "success": false, "error": { "code": "INVALID_TOKEN", "message": "Invalid or expired token." } }\`

- **Database Verification:** Read-only query to \`users\`.

- **Manual Testing Scenarios:**
  1. *Positive Check:* Valid customer token &rarr; Expect 200 OK with customer details.
  2. *Negative Missing Auth:* Omit \`Authorization\` header &rarr; Expect 401 Unauthorized.
  3. *Negative Tampered Token:* Change token string &rarr; Expect 401 Unauthorized.

---

#### API-006: User Profile Details

- **API Identification:**
  - **API ID:** \`API-006\`
  - **Phase:** Phase 3 (Auth & Users)
  - **Module:** User Profiles
  - **HTTP Method:** \`GET\`
  - **Endpoint URL:** \`http://localhost:5000/api/v1/users/me\`
  - **Controller Reference:** [\`backend/src/modules/users/users.controller.js\`](file:///e:/DeckEstimator/backend/src/modules/users/users.controller.js#L12-L24)
  - **Service Reference:** [\`backend/src/modules/users/users.service.js\`](file:///e:/DeckEstimator/backend/src/modules/users/users.service.js#L15-L35)
  - **Authentication Required:** Yes
  - **Allowed User Roles:** \`customer\`, \`contractor\`, \`admin\`
  - **Purpose:** Retrieves full profile information for the authenticated user.

- **Required Headers:**
  \`\`\`http
  Authorization: Bearer {{customerToken}}
  \`\`\`

- **Expected Successful Response (HTTP 200 OK):**
  \`\`\`json
  {
    "success": true,
    "data": {
      "id": "6ae87b6db8fa5774ba5b4610",
      "email": "alice.test@example.com",
      "fullName": "Alice Customer",
      "phone": "555-123-4567",
      "role": "customer",
      "accountStatus": "active"
    }
  }
  \`\`\`

---

#### API-007: Update User Profile Details

- **API Identification:**
  - **API ID:** \`API-007\`
  - **Phase:** Phase 3 (Auth & Users)
  - **Module:** User Profiles
  - **HTTP Method:** \`PATCH\`
  - **Endpoint URL:** \`http://localhost:5000/api/v1/users/me\`
  - **Controller Reference:** [\`backend/src/modules/users/users.controller.js\`](file:///e:/DeckEstimator/backend/src/modules/users/users.controller.js#L26-L45)
  - **Service Reference:** [\`backend/src/modules/users/users.service.js\`](file:///e:/DeckEstimator/backend/src/modules/users/users.service.js#L40-L75)
  - **Authentication Required:** Yes
  - **Allowed User Roles:** \`customer\`, \`contractor\`, \`admin\`
  - **Purpose:** Updates personal details (name, phone). Strictly forbids modification of \`role\`, \`email\`, or \`accountStatus\` (Prevents mass-assignment vulnerabilities).

- **Required Headers:**
  \`\`\`http
  Content-Type: application/json
  Authorization: Bearer {{customerToken}}
  \`\`\`

- **Required Parameters (JSON Body):**
  - \`fullName\` *(string, optional)*: 2 to 100 characters.
  - \`phone\` *(string, optional)*: Phone number.
  - *Forbidden:* \`role\`, \`email\`, \`accountStatus\`, \`passwordHash\`.

- **Example Request Data:**
  \`\`\`json
  {
    "fullName": "Alice Customer-Renovated",
    "phone": "555-999-8888"
  }
  \`\`\`

- **Expected Successful Response (HTTP 200 OK):**
  \`\`\`json
  {
    "success": true,
    "data": {
      "user": {
        "id": "6ae87b6db8fa5774ba5b4610",
        "email": "alice.test@example.com",
        "fullName": "Alice Customer-Renovated",
        "phone": "555-999-8888",
        "role": "customer"
      }
    }
  }
  \`\`\`

- **Expected Error Responses:**
  - *Mass Assignment Escalation Attempt (HTTP 400 Bad Request):*
    - Reproduction: Send \`{ "role": "admin" }\`.
    - Payload: \`{ "success": false, "error": { "code": "VALIDATION_ERROR", "details": [{ "field": "role", "message": "\"role\" is not allowed" }] } }\`

- **Database Verification:**
  - MongoDB Collection: \`users\`
  - Query: \`{ _id: ObjectId("6ae87b6db8fa5774ba5b4610") }\`
  - Verify \`fullName\` is updated; \`role\` remains unchanged.

---

### Phase 4: Deck Input Management and Secure File Uploads

This phase implements multi-section deck project creation, specification editing, deck deletion, secure photograph uploads (with Multer and memory buffers), private streaming, and image removal.

#### API-008: Create Deck Project

- **API Identification:**
  - **API ID:** \`API-008\`
  - **Phase:** Phase 4 (Decks)
  - **Module:** Deck Project Management
  - **HTTP Method:** \`POST\`
  - **Endpoint URL:** \`http://localhost:5000/api/v1/decks\`
  - **Controller Reference:** [\`backend/src/modules/decks/deck.controller.js\`](file:///e:/DeckEstimator/backend/src/modules/decks/deck.controller.js#L14-L26)
  - **Service Reference:** [\`backend/src/modules/decks/deck.service.js\`](file:///e:/DeckEstimator/backend/src/modules/decks/deck.service.js#L18-L65)
  - **Authentication Required:** Yes
  - **Allowed User Roles:** \`customer\`, \`contractor\` (must be approved), \`admin\`
  - **Purpose:** Persists a new deck project with dimensions, location, structural features, and coating condition.
  - **Internal Behavior:** Validates payload against \`createDeckSchema\`. Sets \`ownerId\` to \`req.user.id\`. Rejects client tampering of \`ownerId\` (HTTP 400). Computes area if length & width provided. Persists to \`decks\` collection.

- **Required Headers:**
  \`\`\`http
  Content-Type: application/json
  Authorization: Bearer {{customerToken}}
  \`\`\`

- **Required Parameters (JSON Body):**
  - \`projectName\` *(string, required)*: 2 to 120 characters.
  - \`projectDescription\` *(string, optional)*: Max 1000 characters.
  - \`propertyAddress\` *(object, optional)*: \`{ street, city, state, zipCode, country }\`.
  - \`measurementUnit\` *(string, optional)*: \`ft\` or \`m\`. Default: \`ft\`.
  - \`deckShape\` *(string, optional)*: \`rectangle\`, \`square\`, \`l_shaped\`, \`custom\`, \`other\`.
  - \`dimensions\` *(object, optional)*: \`{ length, width, area, isManualArea }\`.
  - \`structureDetails\` *(object, optional)*: \`{ levels, isAttached, hasRailings, railingLength, hasStairs, stairStepCount }\`.
  - \`surfaceDetails\` *(object, optional)*: \`{ material: 'wood'|'composite'|'other', coatingStatus: 'none'|'painted'|'stained'|'sealed' }\`.
  - \`visibleConditions\` *(array of strings, optional)*: e.g. \`["peeling_coating", "wood_damage"]\`.
  - \`completionStatus\` *(string, optional)*: \`draft\`, \`complete\`, or \`archived\`. Default: \`draft\`.

- **Example Request Data:**
  \`\`\`json
  {
    "projectName": "Lakefront Cedar Deck",
    "projectDescription": "Elevated cedar deck overlooking backyard, needing weather seal.",
    "propertyAddress": {
      "street": "742 Evergreen Terrace",
      "city": "Austin",
      "state": "TX",
      "zipCode": "78701",
      "country": "USA"
    },
    "measurementUnit": "ft",
    "deckShape": "rectangle",
    "dimensions": {
      "length": 24,
      "width": 16,
      "area": 384
    },
    "structureDetails": {
      "levels": 1,
      "isAttached": true,
      "hasRailings": true,
      "railingLength": 40,
      "hasStairs": true,
      "stairStepCount": 5
    },
    "surfaceDetails": {
      "material": "wood",
      "coatingStatus": "stained"
    },
    "visibleConditions": ["peeling_coating", "discoloration"],
    "completionStatus": "complete"
  }
  \`\`\`

- **Expected Successful Response (HTTP 201 Created):**
  \`\`\`json
  {
    "success": true,
    "data": {
      "deck": {
        "id": "6ae87b6db8fa5774ba5b4615",
        "ownerId": "6ae87b6db8fa5774ba5b4610",
        "projectName": "Lakefront Cedar Deck",
        "completionStatus": "complete",
        "dimensions": {
          "length": 24,
          "width": 16,
          "area": 384
        },
        "createdAt": "2026-11-02T14:30:00.000Z"
      }
    }
  }
  \`\`\`

- **Postman Test Script (Store Deck ID):**
  \`\`\`javascript
  if (pm.response.json().success) {
      pm.environment.set("deckId", pm.response.json().data.deck.id);
  }
  \`\`\`

- **Expected Error Responses:**
  - *Missing Project Name (HTTP 400 Bad Request):*
    - Reproduction: Omit \`projectName\`.
    - Payload: \`{ "success": false, "error": { "code": "VALIDATION_ERROR", "details": [{ "field": "projectName", "message": "Project name is required" }] } }\`
  - *Setting Owner ID (HTTP 400 Bad Request):*
    - Reproduction: Pass \`"ownerId": "..."\` in request body.
    - Payload: \`{ "success": false, "error": { "code": "VALIDATION_ERROR", "details": [{ "field": "ownerId", "message": "Setting or modifying ownerId is forbidden." }] } }\`

- **Database Verification:**
  - MongoDB Collection: \`decks\`
  - Query: \`{ _id: ObjectId("{{deckId}}") }\`
  - Verify \`ownerId\` strictly matches the authenticated user ID.

---

#### API-009: List User Deck Projects

- **API Identification:**
  - **API ID:** \`API-009\`
  - **Phase:** Phase 4 (Decks)
  - **Module:** Deck Project Management
  - **HTTP Method:** \`GET\`
  - **Endpoint URL:** \`http://localhost:5000/api/v1/decks?page=1&limit=10\`
  - **Controller Reference:** [\`backend/src/modules/decks/deck.controller.js\`](file:///e:/DeckEstimator/backend/src/modules/decks/deck.controller.js#L28-L40)
  - **Service Reference:** [\`backend/src/modules/decks/deck.service.js\`](file:///e:/DeckEstimator/backend/src/modules/decks/deck.service.js#L70-L105)
  - **Authentication Required:** Yes
  - **Allowed User Roles:** \`customer\`, \`contractor\`, \`admin\`
  - **Purpose:** Returns a paginated list of decks. Customers see only their own decks; admins see all decks.

- **Query Parameters:**
  - \`page\` *(integer, optional)*: Default \`1\`.
  - \`limit\` *(integer, optional)*: Default \`10\`, max \`100\`.
  - \`status\` *(string, optional)*: \`draft\`, \`complete\`, or \`archived\`.

- **Expected Successful Response (HTTP 200 OK):**
  \`\`\`json
  {
    "success": true,
    "data": {
      "decks": [
        {
          "id": "6ae87b6db8fa5774ba5b4615",
          "projectName": "Lakefront Cedar Deck",
          "completionStatus": "complete"
        }
      ]
    },
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
  \`\`\`

---

#### API-010: Get Deck Project by Identifier

- **API Identification:**
  - **API ID:** \`API-010\`
  - **Phase:** Phase 4 (Decks)
  - **HTTP Method:** \`GET\`
  - **Endpoint URL:** \`http://localhost:5000/api/v1/decks/:deckId\`
  - **Authentication Required:** Yes
  - **Allowed Roles:** Deck Owner, Assigned Contractor, or Admin (Enforces IDOR Isolation)
  - **Purpose:** Fetches full specifications of a single deck project.
  - **Expected Error on Unauthorized Access (HTTP 403 Forbidden):**
    - Reproduction: Login as User B, request User A's \`deckId\`.
    - Payload: \`{ "success": false, "error": { "code": "FORBIDDEN", "message": "You do not have access to this deck project." } }\`

---

#### API-011: Update Deck Project Specifications

- **API Identification:**
  - **API ID:** \`API-011\`
  - **Phase:** Phase 4 (Decks)
  - **HTTP Method:** \`PATCH\`
  - **Endpoint URL:** \`http://localhost:5000/api/v1/decks/:deckId\`
  - **Authentication Required:** Yes
  - **Allowed Roles:** Deck Owner or Admin
  - **Example Request Data:**
    \`\`\`json
    {
      "projectName": "Lakefront Cedar Deck - Master Renovation",
      "dimensions": {
        "length": 26,
        "width": 16,
        "area": 416
      }
    }
    \`\`\`
  - **Expected Response (HTTP 200 OK):** Returns updated deck document.

---

#### API-012: Delete Deck Project (Soft Delete)

- **API Identification:**
  - **API ID:** \`API-012\`
  - **Phase:** Phase 4 (Decks)
  - **HTTP Method:** \`DELETE\`
  - **Endpoint URL:** \`http://localhost:5000/api/v1/decks/:deckId\`
  - **Authentication Required:** Yes
  - **Allowed Roles:** Deck Owner or Admin
  - **Internal Behavior:** Sets \`isDeleted: true\` or removes deck and attached image files from disk.
  - **Expected Response (HTTP 200 OK):** \`{ "success": true, "data": { "message": "Deck project deleted successfully." } }\`

---

#### API-013: Upload Deck Photographs (Multipart/Form-Data)

- **API Identification:**
  - **API ID:** \`API-013\`
  - **Phase:** Phase 4 (Files & Uploads)
  - **Module:** File Management
  - **HTTP Method:** \`POST\`
  - **Endpoint URL:** \`http://localhost:5000/api/v1/decks/:deckId/images\`
  - **Controller Reference:** [\`backend/src/modules/files/file.controller.js\`](file:///e:/DeckEstimator/backend/src/modules/files/file.controller.js#L20-L45)
  - **Service Reference:** [\`backend/src/modules/files/file.service.js\`](file:///e:/DeckEstimator/backend/src/modules/files/file.service.js#L30-L90)
  - **Authentication Required:** Yes
  - **Allowed Roles:** Deck Owner, Approved Assigned Contractor, or Admin
  - **Purpose:** Uploads 1 to 5 image files to private disk storage (\`backend/uploads/decks\`) and creates database metadata records.
  - **Constraints:**
    - Field Name: \`images\`
    - Supported Formats: \`image/jpeg\`, \`image/png\`, \`image/webp\`
    - Max File Size: 10MB per image
    - Max Images per Deck: 10 total

- **Example Form-Data Request:**
  - \`images\`: (File binary, e.g. \`deck-board.jpg\`)
  - \`caption\`: \`Main deck surface weathered cedar\`

- **Expected Successful Response (HTTP 201 Created):**
  \`\`\`json
  {
    "success": true,
    "data": {
      "images": [
        {
          "id": "6ae87b6db8fa5774ba5b4620",
          "deckId": "6ae87b6db8fa5774ba5b4615",
          "originalFilename": "deck-board.jpg",
          "mimeType": "image/jpeg",
          "fileSizeBytes": 451200,
          "createdAt": "2026-11-02T14:35:00.000Z"
        }
      ]
    }
  }
  \`\`\`

- **Expected Error Responses:**
  - *Unsupported Format (HTTP 400 Bad Request):* Upload \`.pdf\` or \`.exe\` &rarr; \`{ "success": false, "error": { "code": "INVALID_FILE_TYPE", "message": "Only JPEG, PNG, and WebP are accepted." } }\`
  - *File Too Large (HTTP 400 Bad Request):* Upload file > 10MB &rarr; \`{ "success": false, "error": { "code": "FILE_TOO_LARGE", "message": "One or more files exceed the 10MB limit." } }\`

- **Database Verification:**
  - MongoDB Collection: \`deckImages\`
  - Verify document exists with \`deckId\` and disk filename.

---

#### API-014: List Uploaded Deck Photographs

- **API Identification:**
  - **API ID:** \`API-014\`
  - **Phase:** Phase 4 (Files)
  - **HTTP Method:** \`GET\`
  - **Endpoint URL:** \`http://localhost:5000/api/v1/decks/:deckId/images\`
  - **Authentication Required:** Yes
  - **Expected Response (HTTP 200 OK):** Returns array of image metadata objects.

---

#### API-015: Serve / Stream Private Deck Image

- **API Identification:**
  - **API ID:** \`API-015\`
  - **Phase:** Phase 4 (Files)
  - **HTTP Method:** \`GET\`
  - **Endpoint URL:** \`http://localhost:5000/api/v1/decks/:deckId/images/:imageId\`
  - **Authentication Required:** Yes
  - **Allowed Roles:** Deck Owner, Assigned Contractor, or Admin (Blocks unauthorized contractors)
  - **Purpose:** Streams binary image data directly to authorized clients.
  - **Expected Response (HTTP 200 OK):** Binary image stream with \`Content-Type: image/jpeg\` (or png/webp).

---

#### API-016: Delete Deck Photograph

- **API Identification:**
  - **API ID:** \`API-016\`
  - **Phase:** Phase 4 (Files)
  - **HTTP Method:** \`DELETE\`
  - **Endpoint URL:** \`http://localhost:5000/api/v1/decks/:deckId/images/:imageId\`
  - **Authentication Required:** Yes
  - **Allowed Roles:** Deck Owner or Admin
  - **Internal Behavior:** Removes database record and unlinks file from disk storage.
  - **Expected Response (HTTP 200 OK):** \`{ "success": true, "data": { "message": "Image deleted successfully." } }\`

---

#### API-017: Run Condition Analysis (Deck Shortcut)

- **API Identification:**
  - **API ID:** \`API-017\`
  - **Phase:** Phase 4 / Phase 7
  - **HTTP Method:** \`POST\`
  - **Endpoint URL:** \`http://localhost:5000/api/v1/decks/:deckId/analyses\`
  - **Purpose:** Convenient alias mounted on deck router that triggers AI condition analysis for the deck. (Delegates directly to \`conditionAnalysisController.runAnalysis\`).

---

#### API-018: List Condition Analyses (Deck Shortcut)

- **API Identification:**
  - **API ID:** \`API-018\`
  - **Phase:** Phase 4 / Phase 7
  - **HTTP Method:** \`GET\`
  - **Endpoint URL:** \`http://localhost:5000/api/v1/decks/:deckId/analyses\`
  - **Purpose:** Retrieves condition analysis records for a specific deck. (Delegates to \`conditionAnalysisController.listDeckAnalyses\`).

---
`;
};

