# **MERN Stack – Senior Developer Review Preparation**
### **Deck Estimator Plus (Deck Restoration Plus) — Enterprise System Defense Guide**

---

## **Phase 1: Application Architecture**

| Topic | What You Need to Explain |
| :--- | :--- |
| **1. Requirement Analysis** | High-precision exterior wood restoration calculator, 3 role-based portals (Customer, Contractor, Admin), continuous pricing engine, lead generation, document compliance, and multi-tier contractor wholesale margins. |
| **2. System Architecture** | Decoupled client-server architecture: React 19 SPA communicating over RESTful JSON APIs to Node.js/Express 5, persisting to MongoDB Atlas with transactional Mongoose schemas. |
| **3. Project Structure** | Feature-sliced modular architecture: Backend organized into domain modules (`src/modules/*`), frontend organized into feature slices (`src/features/*`), shared utilities, and centralized theme tokens. |
| **4. Application Flow** | User interaction $\to$ React State & Validation $\to$ Client HTTP Request (with JWT) $\to$ Express Middleware (Helmet, CORS, Rate Limit, Auth, Sanitize) $\to$ Route $\to$ Controller $\to$ Domain Service $\to$ Mongoose Model $\to$ MongoDB Atlas $\to$ JSON Response $\to$ React View Render. |

---

### **Senior Review Questions & Answers (Phase 1)**

#### **1. Why did you choose MERN stack for this application?**
> **Answer in the context of Deck Estimator:**
> "We selected the MERN stack because of our need for:
> 1. **Unified Language (JavaScript/Node.js):** Allows seamless sharing of data structures, estimation formulas, validation rules, and mathematical logic across both client and server.
> 2. **Dynamic, Complex Estimation State in React:** The Continuous Estimator handles over 40 real-time inputs (deck dimensions, wood species, stair steps, railings, condition ratings, sealers, and stains). React's virtual DOM, declarative state hooks (`useState`, `useMemo`, `useCallback`), and one-way data binding make real-time price re-computation instant without UI lag.
> 3. **Polymorphic Schemas in MongoDB:** Deck structures vary widely (e.g., custom shapes, varying accessories like pergolas, privacy walls, multi-tier pricing snapshots, and contractor discounts). MongoDB’s flexible BSON document model allows storing complex nested objects (`structureDetails`, `surfaceDetails`, `pricingSnapshot`) natively without requiring dozens of relational join tables.
> 4. **Asynchronous Non-Blocking I/O in Express/Node.js:** Node.js efficiently handles hundreds of concurrent estimation calculations, document uploads, and real-time dashboard analytics with minimal resource overhead on Railway."

---

#### **2. Why did you separate frontend and backend instead of building a monolithic server-rendered app (e.g. Next.js / EJS)?**
> **Answer in the context of Deck Estimator:**
> "We separated frontend and backend into two decoupled services for four distinct architectural advantages:
> 1. **Independent Scalability:** The frontend is a static single-page application (SPA) built with Vite and served via an optimized Express static runner with gzip compression. It has minimal compute requirements and can scale independently of the API backend on Railway (`deckestimatorplus.up.railway.app` vs `deckestimatorplus-api.up.railway.app`).
> 2. **Multi-Client API Readiness:** The Express backend is a pure REST API returning standardized JSON. It can serve the React web app today and easily power future mobile applications (iOS/Android) or third-party CRM integrations (Zapier, HubSpot) without changing business logic.
> 3. **Clean Separation of Concerns:** Frontend engineers focus strictly on interactive calculation UI, responsive dashboards, and client state. Backend engineers focus on pricing algorithms, lead distribution, role-based security, and database indexing.
> 4. **Zero-Downtime Deployments & Isolation:** A bug in a frontend UI component will never crash the Node.js API server or disrupt live database transactions."

---

#### **3. Explain your application architecture.**
> **Answer in the context of Deck Estimator:**
> "Our application follows a **Decoupled 3-Tier Layered Architecture with Feature-Sliced Modules**:
> - **Client Tier (Frontend):** React 19 SPA scaffolded with Vite. It is organized into 4 primary feature modules:
>   - `features/landing`: Public landing page and teaser calculator.
>   - `features/customer`: Continuous estimator wizard, customer deck projects, and profile management.
>   - `features/contractor`: Contractor proposals, wholesale margin calculations, trade verification document upload, and projects overview.
>   - `features/admin`: System analytics, lead assignment inbox, user reactivation appeals, contractor document approvals, child admin governance, and pricing catalog management.
> - **Application / API Tier (Backend):** Node.js 24 with Express 5. Adopts an enterprise Controller-Service-Repository pattern:
>   - `middleware`: Global security (Helmet, CORS, rate limiting), request sanitization, authentication (`authenticate`), and role authorization (`authorize`).
>   - `modules/*`: Encapsulated domain boundaries (e.g., `modules/estimates`, `modules/decks`, `modules/leads`, `modules/contractors`, `modules/admin`). Each module contains its own routes, controllers, services, and Mongoose schemas.
>   - `shared`: Global error classes (`BadRequestError`, `NotFoundError`, `ConflictError`), centralized error handler, and avatar base64 storage utilities.
> - **Data Tier (Database):** Hosted MongoDB Atlas cluster with strict schema validation, compound indexes for fast lookup, and transactional audit logging."

---

#### **4. How does a frontend request reach the database and return back? Trace the complete lifecycle.**
> **Answer in the context of Deck Estimator:**
> "Let's trace when a customer clicks **'Get Estimation'** in `ContinuousEstimatorForm.jsx`:
> 1. **Client Trigger:** The user submits the form. The client-side form runs preflight validation and invokes `createEstimate(estimatePayload)` in `frontend/src/features/customer/api/estimatesApi.js`.
> 2. **HTTP Transmission:** The centralized `apiClient` (`frontend/src/api/client.js`) intercepts the request, attaches `Authorization: Bearer <JWT_TOKEN>` from `localStorage` / cookies, and dispatches a `POST` request to `https://deckestimatorplus-api.up.railway.app/api/v1/estimates`.
> 3. **Network & Ingress:** Railway's reverse proxy routes the TLS request to our Express container port (5000/PORT).
> 4. **Global Middleware Chain:** 
>    - `helmet()` secures HTTP headers.
>    - `cors()` verifies the origin is `https://deckestimatorplus.up.railway.app` or `localhost`.
>    - `express.json({ limit: '10mb' })` parses the body.
>    - `sanitize` strips potential NoSQL injection vectors.
> 5. **Route & Auth Middleware:** The request hits `src/modules/estimates/estimate.routes.js`. `authenticate` verifies the JWT signature, extracts `req.user`, and verifies the account is active.
> 6. **Controller Layer:** `estimate.controller.js` validates payload format with Joi/validation helpers and calls `estimateService.createEstimate(req.body, req.user)`.
> 7. **Domain Service Layer:** `estimate.service.js` performs business logic: verifies project name uniqueness (`assertUniqueProjectTitle`), executes the mathematical pricing calculation engine, determines labor hours and material quantities, and checks whether the mobilization floor should apply based on `applyMinJobPrice`.
> 8. **Database Layer:** The service creates a Mongoose document `new Estimate(...)` and calls `.save()`. Mongoose casts and validates against `estimate.model.js` schema and commits the BSON document to MongoDB Atlas over TLS.
> 9. **Response Pipeline:** The saved document is formatted, serialized to JSON, and returned with HTTP `201 Created` via `res.status(201).json({ success: true, data: savedEstimate })`.
> 10. **Client Reconciliation:** React receives the JSON, updates component state (`setOfficialEstimate`), highlights the calculated price, and triggers a window event to refresh dashboard cards."

---
---

## **Phase 2: MongoDB + Mongoose**

| Topic | What You Need to Explain |
| :--- | :--- |
| **1. MongoDB Fundamentals** | Document database storing flexible JSON-like BSON objects grouped into collections inside the `DECK_ESTIMATOR` database. |
| **2. Schema & Models** | Mongoose schemas enforce data types, defaults, custom validators, and lifecycle hooks; Models provide the active query interface (`User.findById`, `Estimate.create`). |
| **3. CRUD Operations** | `create()`, `find()`, `findOne()`, `updateOne()`, `findOneAndUpdate()`, `deleteOne()`, and `deleteMany()`. |
| **4. Relationships** | **Embedding:** Used for data that is tightly coupled and read together (e.g. `dimensions`, `structureDetails`, `pricingSnapshot` inside `Estimate`).<br>**Referencing:** Used for independent business entities (e.g. `ownerId` $\to$ `User`, `deckId` $\to$ `Deck`, `policyId` $\to$ `DiscountPolicy`). |
| **5. Mongoose Methods** | High performance queries using `.lean()`, `.select()`, `.populate()`, and multi-stage `$facet` aggregations. |
| **6. Validation** | Built-in rules (`required`, `enum`, `min`, `max`, `trim`) plus custom regex validations (e.g. project title uniqueness, email formatting). |
| **7. Indexing** | Single-field and compound indexes on high-frequency lookup fields (`email`, `estimateNumber`, `ownerId`, `contractorId`, `status`, `createdAt`). |

---

### **Senior Review Questions & Answers (Phase 2)**

#### **1. Why MongoDB instead of a relational database like MySQL or PostgreSQL?**
> **Answer in the context of Deck Estimator:**
> "While PostgreSQL is powerful, our business domain in Deck Estimator is inherently hierarchical and semi-structured:
> 1. An estimate contains deeply nested pricing breakdowns, individual material lines (gallon counts, coverage ratios, waste factors), multiple labor line items, and dynamic condition checklists. In SQL, saving a single estimate revision would require writing to 7 normalized tables (`estimates`, `estimate_materials`, `estimate_services`, `deck_dimensions`, `deck_conditions`, `discounts`, `pricing_snapshots`) with complex multi-table JOINs on read.
> 2. In MongoDB, an entire immutable estimate snapshot is stored as a single, cohesive document. Reading an estimate is a single indexed disk seek: $O(1)$ document retrieval.
> 3. Schema flexibility allowed our Continuous Estimator to evolve from initial release to continuous 9-section calculation without costly and risky table migration locks."

---

#### **2. What is the difference between a collection and a document?**
> **Answer in the context of Deck Estimator:**
> - **Document:** A single record in MongoDB, represented in BSON format. For example, one single user object in our database:
>   `{ _id: ObjectId("6af04582..."), email: "ashok01builder@gmail.com", role: "contractor" }`.
> - **Collection:** A grouped set of documents, analogous to a SQL table. In our application, we have separate collections: `users`, `contractorprofiles`, `decks`, `estimates`, `leads`, `materials`, `services`, `projects`, and `auditlogs`."

---

#### **3. What is Mongoose and why did you use it over the native MongoDB driver?**
> **Answer in the context of Deck Estimator:**
> "Mongoose is an Object Data Modeling (ODM) library for Node.js. While MongoDB is natively schema-less, enterprise applications require strict data integrity. We use Mongoose for:
> 1. **Schema Validation:** Enforces required fields, enums (e.g. `role: ['customer', 'contractor', 'admin']`), and numerical constraints (`areaSqFt > 0`).
> 2. **Type Casting:** Automatically casts string IDs to `mongoose.Types.ObjectId`.
> 3. **Relationship Population (`populate`):** Automatically joins related documents across collections (e.g., resolving `ownerId` into customer name and email).
> 4. **Middleware Hooks:** Pre-save password hashing and audit log triggers.
> 5. **Protection Against Inconsistent Data:** Guarantees that invalid objects never enter our database collections."

---

#### **4. What is the difference between a Schema and a Model in Mongoose?**
> **Answer in the context of Deck Estimator:**
> - **Schema (`estimate.schema.js`):** The architectural blueprint that defines the structure of documents, data types, validators, default values, and virtual properties (e.g., defining that `estimateNumber` is a String and `totalAmount` is a required Number).
> - **Model (`const Estimate = mongoose.model('Estimate', estimateSchema)`):** The compiled class constructor wrapper provided by Mongoose that enables database CRUD interactions (e.g., `Estimate.find()`, `Estimate.create()`, `Estimate.aggregate()`)."

---

#### **5. How do you establish relationships between collections in MongoDB?**
> **Answer in the context of Deck Estimator:**
> "We store the `ObjectId` of the target document and declare a `ref` attribute in the schema:
> ```javascript
> // In estimate.model.js
> createdBy: {
>   type: mongoose.Schema.Types.ObjectId,
>   ref: 'User',
>   required: true,
>   index: true
> }
> ```
> When querying, we call `.populate('createdBy', 'fullName email phone')` to automatically fetch and attach the corresponding User document."

---

#### **6. What is the difference between embedding and referencing? When did you choose which?**
> **Answer in the context of Deck Estimator:**
> - **Embedding (Subdocuments):** We embedded `dimensions`, `structureDetails`, `surfaceDetails`, and `pricingSnapshot` directly inside the `Deck` and `Estimate` documents because:
>   - They have a 1:1 relationship with the estimate.
>   - They are always retrieved together when viewing a quote.
>   - They must remain immutable historical snapshots of the calculation at the exact time the customer booked the project.
> - **Referencing (Foreign Keys):** We referenced `User` (`ownerId`), `Lead` (`leadId`), and `DiscountPolicy` (`policyId`) because:
>   - A customer has multiple estimates over time (1:N relationship).
>   - Users update profile details (phone, email) independently, and updating a user profile should not require modifying hundreds of historical estimate documents."

---

#### **7. How do you prevent duplicate records in MongoDB?**
> **Answer in the context of Deck Estimator:**
> "We use a multi-layered approach:
> 1. **Database-Level Unique Indexes:** Enforced at the MongoDB Atlas engine level on critical unique identifiers:
>    ```javascript
>    usersSchema.index({ email: 1 }, { unique: true });
>    estimateSchema.index({ estimateNumber: 1 }, { unique: true });
>    leadSchema.index({ leadNumber: 1 }, { unique: true });
>    ```
> 2. **Application-Level Preflight Guard (`assertUniqueProjectTitle`):** Before creating an estimate in `estimate.service.js`, we run a case-insensitive regex check scoped to the active user to prevent accidental duplicate submission clicks:
>    ```javascript
>    const duplicate = await Estimate.findOne({
>      ownerId: userObjId,
>      'deckDetails.projectName': new RegExp(`^${escapeRegex(cleanTitle)}$`, 'i'),
>      estimateStatus: { $nin: ['CANCELLED', 'EXPIRED'] }
>    }).select('_id estimateNumber');
>    if (duplicate) throw new ConflictError('A project named ... already exists.');
>    ```"

---

#### **8. What is `populate()` in Mongoose, and what is its performance implication?**
> **Answer in the context of Deck Estimator:**
> "`populate()` performs client-side JOINs under the hood by issuing a secondary `$in` query to the referenced collection and stitching the resulting documents into the parent in Node memory.
> **Performance Optimization:**
> - If called carelessly, `.populate()` can lead to $N+1$ query issues.
> - In our application, we optimize populate by:
>   1. Specifying field projections: `.populate('ownerId', 'fullName email phone')` rather than pulling whole documents.
>   2. Eagerly requiring models in `app.js` to eliminate Mongoose `MissingSchemaError`.
>   3. For heavy dashboards, replacing nested populates with native MongoDB `$facet` and `$lookup` aggregation pipelines."

---

#### **9. How do you improve database query performance in Mongoose?**
> **Answer in the context of Deck Estimator:**
> "We applied five concrete database optimization techniques:
> 1. **`.lean()` for Read-Only Queries:** Bypasses Mongoose document hydration (getters, setters, change tracking), returning lightweight plain JavaScript objects. This reduced memory footprint and improved response times by over 40%.
> 2. **Strategic Field Selection (`.select()`):** In our fast deletion and listing routes, we only project necessary fields: `.select('_id leadNumber')` or `.select('-photos')`, avoiding loading megabytes of photo data across the wire.
> 3. **Targeted Compound Indexing:** Indexed `{ ownerId: 1, createdAt: -1 }` on `estimates` and `decks` so queries retrieve the latest user projects in a single index scan without an in-memory sort.
> 4. **`$facet` Parallel Aggregations:** In `admin.service.js` (`getDashboardSummary`), we combined 28 separate aggregation round-trips into a single `$facet` pipeline, cutting dashboard response latency from 1.8s down to under 120ms.
> 5. **TTL Caching:** Implemented an in-memory TTL cache (`dashboardSummaryCache`) for expensive administrator analytics."

---
---

## **Phase 3: Node.js**

| Topic | What You Need to Explain |
| :--- | :--- |
| **1. Node.js Fundamentals** | Open-source, cross-platform JavaScript runtime built on Chrome's V8 engine that executes JavaScript on the server. |
| **2. Event Loop** | Single-threaded concurrency mechanism that offloads asynchronous I/O operations to the system kernel (via libuv) and processes completed callbacks across phases. |
| **3. Async Programming** | Evolution from callbacks to Promises to `async/await` syntax for clean, sequential-looking asynchronous code. |
| **4. Modules & npm** | Node.js CommonJS (`require`/`module.exports`) and ES Modules (`import`/`export`), `package.json` lockfiles, and dependency resolution. |

---

### **Senior Review Questions & Answers (Phase 3)**

#### **1. What is Node.js and why is it suitable for web backend applications?**
> **Answer in the context of Deck Estimator:**
> "Node.js is a runtime environment that compiles JavaScript directly to native machine code using Google's V8 engine. It uses an **event-driven, non-blocking I/O model**.
> In Deck Estimator, our API server primarily performs I/O-bound tasks: parsing incoming HTTP requests, querying MongoDB Atlas, compressing images, and streaming JSON. Node.js handles thousands of simultaneous connections on a single thread with minimal RAM consumption, making it ideal for high-throughput cloud environments like Railway."

---

#### **2. Is Node.js truly single-threaded? Explain.**
> **Answer in the context of Deck Estimator:**
> "JavaScript execution on the main thread is single-threaded (one call stack, one memory heap, one event loop). However, **Node.js as a runtime is multi-threaded**.
> It relies on **libuv**, which maintains an internal C++ thread pool (default 4 threads). When our application performs heavy cryptographic operations (e.g. `bcrypt.hash` during user registration) or disk file I/O, libuv offloads these tasks to worker threads in the pool, keeping the main event loop completely unblocked and responsive to incoming user traffic."

---

#### **3. What is the Event Loop and how does it work?**
> **Answer in the context of Deck Estimator:**
> "The Event Loop is libuv's mechanism that coordinates the execution of tasks, timers, and callbacks. It runs continuously through specific phases:
> 1. **Timers Phase:** Executes callbacks scheduled by `setTimeout()` and `setInterval()`.
> 2. **Pending Callbacks:** Executes I/O callbacks deferred from the previous cycle.
> 3. **Poll Phase:** Retrieves new I/O events (e.g., incoming HTTP connections, data from MongoDB Atlas) and executes their callbacks.
> 4. **Check Phase:** Executes `setImmediate()` callbacks.
> 5. **Close Callbacks:** Executes close events (e.g., `socket.on('close')`).
> *Crucial note:* `process.nextTick()` and resolved Promise microtasks (`queueMicrotask`) execute immediately after each operation finishes before the event loop advances to the next phase."

---

#### **4. What is non-blocking I/O?**
> **Answer in the context of Deck Estimator:**
> "In traditional blocking I/O (like older PHP or multi-threaded Apache architectures), when a database query is sent, the operating system thread halts and sleeps until the database replies.
> In Node.js non-blocking I/O, when `mongoose.connect()` or `Estimate.find()` is called, Node registers the callback with libuv and immediately returns control to the call stack to process other incoming customer requests. When MongoDB returns the results, libuv places the callback on the microtask queue to be processed by the event loop."

---

#### **5. What is the difference between synchronous and asynchronous execution?**
> **Answer in the context of Deck Estimator:**
> - **Synchronous:** Instructions execute sequentially; each statement blocks subsequent lines until it finishes (e.g., `fs.readFileSync`). If used on a web server, it freezes the entire application for all active users.
> - **Asynchronous:** Operations run in the background without blocking the execution thread (e.g., `await Estimate.findById()`). While the database is fetching records, the server continues responding to other customers calculating deck estimates."

---

#### **6. Why do we use `async/await` instead of raw Promises or callbacks?**
> **Answer in the context of Deck Estimator:**
> "`async/await` is syntactic sugar built on top of native JavaScript Promises. We use it throughout `estimate.service.js` and `admin.service.js` because:
> 1. **Eliminates Callback Hell & Promise Chaining:** Avoids unreadable `.then().then().catch()` pyramids.
> 2. **Unified Error Handling:** Enables clean `try...catch` blocks that handle both synchronous runtime exceptions and rejected asynchronous promises seamlessly.
> 3. **Linear Readability:** Code reads like sequential synchronous instructions while preserving 100% non-blocking asynchronous concurrency."

---
---

## **Phase 4: Express.js**

| Topic | What You Need to Explain |
| :--- | :--- |
| **1. Express Fundamentals** | Fast, unopinionated, minimalist web framework for Node.js providing routing, middleware pipeline, and HTTP utilities. |
| **2. Routing** | Modular routers defined with `express.Router()`, grouped by domain (`/api/v1/estimates`, `/api/v1/auth`, `/api/v1/admin`). |
| **3. Middleware** | Functions with access to `req`, `res`, and `next` that intercept, inspect, transform, or terminate HTTP requests. |
| **4. Controllers** | Request-handling functions responsible for parsing HTTP input, invoking domain services, and returning formatted HTTP responses. |
| **5. Service Layer** | Pure business logic layer decoupled from HTTP transport, facilitating testing and reusability. |
| **6. Error Handling** | Centralized 4-parameter error-handling middleware (`(err, req, res, next)`) mapping errors to standard JSON structures. |
| **7. Request & Response** | `req.body` (POST payload), `req.params` (URL parameters `/estimates/:id`), `req.query` (search/filter `/estimates?status=CREATED`), `res.status().json()`. |

---

### **Senior Review Questions & Answers (Phase 4)**

#### **1. What is Express.js and what role does it play in the backend?**
> **Answer in the context of Deck Estimator:**
> "Express.js is the HTTP server framework running on top of Node.js. It acts as our application's request router and dispatcher. It provides the middleware pipeline that authenticates incoming JSON tokens, enforces CORS policies, routes URLs to their respective controllers, and formats outbound JSON responses."

---

#### **2. What is middleware in Express and how does it work?**
> **Answer in the context of Deck Estimator:**
> "Middleware is a function with the signature `(req, res, next)` that sits in the request-response lifecycle. It can inspect incoming headers, modify `req` (e.g., attaching `req.user`), validate data, or reject the request early.
> In Deck Estimator, our pipeline consists of:
> 1. **Security Middleware:** `helmet()`, `cors()`, `rateLimit()`, `sanitize()`.
> 2. **Body Parsers:** `express.json({ limit: '10mb' })`, `cookieParser()`.
> 3. **Authentication Middleware:** `authenticate` (verifies JWT and loads `req.user`).
> 4. **Authorization Middleware:** `authorize('admin')` (validates role permissions).
> Calling `next()` passes execution to the next handler; passing an argument to `next(err)` bypasses all remaining route handlers and jumps straight to our centralized error middleware."

---

#### **3. Why do we strictly separate Routes, Controllers, and Services?**
> **Answer in the context of Deck Estimator:**
> "We follow the **Controller-Service-Repository pattern**:
> - **Routes (`estimate.routes.js`):** Defines URLs, HTTP verbs, and specifies middleware order (e.g. `router.post('/', authenticate, estimateController.create)`). Contains 0 business logic.
> - **Controllers (`estimate.controller.js`):** Handles HTTP transport concerns: extracts `req.body`, `req.params`, and `req.user`, validates parameters, calls the service, and sets status codes (`res.status(200).json(...)`).
> - **Services (`estimate.service.js`):** Contains pure business logic: calculations, discounts, unique title validations, and database mutations. Services have no knowledge of `req` or `res`, making them 100% unit-testable and reusable across CLI scripts or cron jobs."

---

#### **4. What is the difference between `req.params`, `req.query`, and `req.body`?**
> **Answer in the context of Deck Estimator:**
> - `req.params`: Route path parameters matched from dynamic URL segments.
>   Example: `GET /api/v1/estimates/6af9d933...` $\to$ `req.params.id = "6af9d933..."`.
> - `req.query`: Optional key-value query parameters appended after `?` in the URL, used for filtering, pagination, and sorting.
>   Example: `GET /api/v1/estimates?limit=10&status=CREATED` $\to$ `req.query.limit = "10"`.
> - `req.body`: The parsed JSON payload transmitted in the HTTP request body.
>   Example: In `POST /api/v1/estimates`, contains `{ floorArea: 400, woodSpecies: 'cedar', activeServices: ['wash', 'stain'] }`."

---

#### **5. What is the difference between `GET`, `POST`, `PUT`, `PATCH`, and `DELETE`?**
> **Answer in the context of Deck Estimator:**
> - `GET`: Safe, idempotent retrieval of resources. (e.g., `GET /api/v1/estimates`).
> - `POST`: Creates a new resource. Non-idempotent. (e.g., `POST /api/v1/estimates` creates a new quote).
> - `PUT`: Replaces an entire resource document with the provided payload.
> - `PATCH`: Applies partial updates to an existing resource. (e.g., `PATCH /api/v1/contractors/me` updates only business phone and license number without overwriting the rest of the profile).
> - `DELETE`: Removes a resource. (e.g., `DELETE /api/v1/leads/:id`)."

---

#### **6. What are HTTP status codes and how did you use them?**
> **Answer in the context of Deck Estimator:**
> "We use standard HTTP semantic status codes:
> - `200 OK`: Successful read or update (`GET`, `PATCH`).
> - `201 Created`: Successful creation (`POST /api/v1/estimates`).
> - `400 Bad Request`: Validation failure (missing required fields, negative deck dimensions).
> - `401 Unauthorized`: Missing, expired, or invalid JWT token.
> - `403 Forbidden`: Authenticated user lacks permission (e.g. Customer trying to access `/api/v1/admin/*`).
> - `404 Not Found`: Resource does not exist (e.g., `Lead not found`).
> - `409 Conflict`: Business duplicate constraint violation (e.g., duplicate project name).
> - `429 Too Many Requests`: Rate limit reached.
> - `500 Internal Server Error`: Unhandled server exception."

---

#### **7. Why do we use a Service Layer?**
> **Answer in the context of Deck Estimator:**
> "The Service Layer decouples domain business logic from the web transport layer. 
> In Deck Estimator, the Continuous Pricing Engine requires complex calculations: calculating billable square footage, waste percentages, labor rates, condition multipliers, wholesale tier discounts, and mobilization minimums. 
> Keeping this logic in `estimate.service.js` instead of in the Express controller ensures:
> 1. Controllers remain clean and thin (5-10 lines).
> 2. The pricing engine can be reused across automated test suites without mocking HTTP objects.
> 3. Database operations can be grouped inside atomic units."

---

#### **8. How do you handle errors globally in Express?**
> **Answer in the context of Deck Estimator:**
> "We implement a **Centralized Error Handling Architecture**:
> 1. We defined custom error subclasses inheriting from `Error`: `AppError`, `BadRequestError (400)`, `UnauthorizedError (401)`, `ForbiddenError (403)`, `NotFoundError (404)`, and `ConflictError (409)`.
> 2. Controllers wrap async calls or pass errors to `next(error)`.
> 3. At the bottom of our Express middleware stack in `src/app.js`, we registered a 4-parameter error middleware:
>    ```javascript
>    app.use((err, req, res, next) => {
>      const statusCode = err.statusCode || 500;
>      res.status(statusCode).json({
>        success: false,
>        error: {
>          code: err.code || 'INTERNAL_ERROR',
>          message: err.message || 'An unexpected error occurred.',
>          details: process.env.NODE_ENV === 'development' ? err.stack : undefined
>        }
>      });
>    });
>    ```
> This prevents unhandled promise rejections from crashing the Node process and guarantees consistent error responses to the React frontend."

---

#### **9. What is CORS and how did you configure it?**
> **Answer in the context of Deck Estimator:**
> "CORS (Cross-Origin Resource Sharing) is a browser security mechanism that blocks web applications running on one domain (e.g. `https://deckestimatorplus.up.railway.app`) from querying an API hosted on another domain (`https://deckestimatorplus-api.up.railway.app`) unless the server returns explicit allow headers.
> We configured the `cors` package in `src/app.js`:
> ```javascript
> app.use(cors({
>   origin: process.env.CORS_ORIGIN.split(','), // allows live Railway frontend + localhost:5173
>   credentials: true,
>   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
>   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
> }));
> ```"

---
---

## **Phase 5: Authentication & Security**

| Topic | What You Need to Explain |
| :--- | :--- |
| **1. Registration & Login** | Multi-role registration (Customer, Contractor, Admin), email normalization, and secure login issuance. |
| **2. Password Hashing** | One-way hashing using `bcryptjs` with salt rounds (10), preventing plaintext exposure even if database is compromised. |
| **3. JWT (JSON Web Token)** | Stateless identity tokens signed with HMAC-SHA256 containing user ID, role, and expiration (`7d`). |
| **4. Authentication & Authorization** | Authentication confirms *who you are*; Authorization confirms *what you are allowed to do*. |
| **5. Protected Routes** | Guard middleware on backend (`authenticate`, `authorize`) and wrapper components on frontend (`<ProtectedRoute role="..." />`). |

---

### **Senior Review Questions & Answers (Phase 5)**

#### **1. Explain your user registration flow from frontend to backend.**
> **Answer in the context of Deck Estimator:**
> "1. The user enters full name, email, password, and role (`customer` or `contractor`) on `/register`.
> 2. The client validates input formatting and dispatches `POST /api/v1/auth/register`.
> 3. Express middleware runs Joi validation.
> 4. `auth.service.js` checks if the email already exists in MongoDB; if found, it throws `ConflictError (409)`.
> 5. The password is hashed using `bcrypt.hash(password, 10)`.
> 6. The User document is created in MongoDB Atlas. If the role is `contractor`, an associated `ContractorProfile` document is created with `verificationStatus: 'pending'`.
> 7. A signed JWT token is generated and returned with sanitized user details (excluding password hash)."

---

#### **2. Explain your user login flow.**
> **Answer in the context of Deck Estimator:**
> "1. User submits credentials to `POST /api/v1/auth/login`.
> 2. Backend queries MongoDB: `User.findOne({ email }).select('+password')`.
> 3. If user doesn't exist, throws `UnauthorizedError('Invalid email or password.')`.
> 4. If account status is `disabled` or `suspended`, access is denied with custom error code `ACCOUNT_LOCKED`.
> 5. Uses `bcrypt.compare(password, user.password)` to verify password authenticity.
> 6. On match, updates `lastLoginAt` and signs a JWT containing `{ id: user._id, role: user.role, email: user.email }`.
> 7. Returns HTTP 200 with JWT token and user profile."

---

#### **3. Why do we hash passwords and why use BCrypt instead of MD5 or SHA256?**
> **Answer in the context of Deck Estimator:**
> "MD5 and SHA-256 are fast, deterministic cryptographic hash functions designed for message integrity, making them vulnerable to brute-force attacks and rainbow table lookups ($10^9$ hashes/sec on modern GPUs).
> **BCrypt** is specifically engineered for password security:
> 1. **Adaptive Work Factor (Salting & Cost):** It incorporates a random salt to ensure two identical passwords produce completely distinct hashes, defeating rainbow tables.
> 2. **Key Derivation Work Factor:** We use 10 salt rounds ($2^{10} = 1024$ iterations), introducing deliberate CPU cost (~80ms per comparison) which makes distributed brute-force attacks computationally infeasible."

---

#### **4. What is JWT and what are its components?**
> **Answer in the context of Deck Estimator:**
> "JWT (JSON Web Token) is an open standard (RFC 7519) for compact, stateless transmission of claims between client and server.
> It consists of 3 base64url-encoded parts separated by dots (`.`):
> 1. **Header:** Algorithm (`HS256`) and token type (`JWT`).
> 2. **Payload:** Claims data (`id`, `role`, `email`, issued-at `iat`, and expiration `exp`).
> 3. **Signature:** Calculated using the secret key: `HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), JWT_SECRET)`.
> If an attacker tampers with the payload (e.g. changing `role: 'customer'` to `'admin'`), the signature check fails."

---

#### **5. How does token verification work on the backend?**
> **Answer in the context of Deck Estimator:**
> "In `backend/src/shared/middleware/auth.middleware.js`:
> 1. Extracts the token from `req.headers.authorization` (`Bearer <token>`) or cookies.
> 2. Calls `jwt.verify(token, process.env.JWT_SECRET)`.
> 3. If expired or signature invalid, throws `UnauthorizedError`.
> 4. Queries `User.findById(decoded.id).select('accountStatus role')` to ensure the user still exists and hasn't been disabled by an admin since token issuance.
> 5. Attaches the authenticated user to `req.user` and calls `next()`."

---

#### **6. What is the difference between Authentication and Authorization?**
> **Answer in the context of Deck Estimator:**
> - **Authentication (AuthN):** Validating the identity of a user (*'Are you really Contractor Ashok?'*). Handled by `authenticate` middleware.
> - **Authorization (AuthZ):** Validating what resources the authenticated user has permission to access (*'Can Ashok access the Admin Leads inbox?'*). Handled by `authorize('admin')` middleware. Contractors receive `403 Forbidden` if attempting admin operations."

---

#### **7. How do you implement Role-Based Access Control (RBAC)?**
> **Answer in the context of Deck Estimator:**
> "We define a reusable higher-order authorization middleware in Express:
> ```javascript
> const authorize = (...allowedRoles) => {
>   return (req, res, next) => {
>     if (!req.user || !allowedRoles.includes(req.user.role)) {
>       return next(new ForbiddenError('You do not have permission to perform this action.'));
>     }
>     next();
>   };
> };
> ```
> We protect admin endpoints with: `router.get('/admin/leads', authenticate, authorize('admin'), adminController.getLeads)`."

---

#### **8. How do you protect your APIs against common attacks?**
> **Answer in the context of Deck Estimator:**
> "1. **Helmet:** Automatically sets HTTP security headers (X-Content-Type-Options, Strict-Transport-Security, X-Frame-Options against clickjacking).
> 2. **CORS:** Restricts API traffic strictly to authorized client origins.
> 3. **Rate Limiting:** Protects `/api/v1/auth/*` against brute-force attacks via `express-rate-limit` (100 requests per 15 minutes per IP).
> 4. **NoSQL Injection Defense:** Sanitizes query parameters and payloads by stripping keys starting with `$` or containing `.`.
> 5. **Payload Size Restrictions:** Limits JSON body parser to prevent denial-of-service memory exhaustion."

---

#### **9. Where should authentication tokens be stored on the frontend?**
> **Answer in the context of Deck Estimator:**
> "The most secure storage is in an `httpOnly, Secure, SameSite=Strict` cookie, which prevents access by malicious JavaScript (XSS attacks).
> For cross-domain cloud hosting between frontend and backend on Railway subdomains, our application supports both:
> - It accepts `Authorization: Bearer <token>` stored in client memory/localStorage.
> - Client-side XSS protection is reinforced by strictly sanitizing all dynamic HTML outputs, validating inputs, and using React's native string interpolation which automatically escapes HTML entities."

---
---

## **Phase 6: React.js**

| Topic | What You Need to Explain |
| :--- | :--- |
| **1. React Fundamentals** | Declarative component-based UI architecture utilizing JSX to render UI based on state. |
| **2. Props & State** | Props pass read-only data downward from parent to child; State holds mutable data local to the component. |
| **3. React Hooks** | `useState`, `useEffect`, `useContext`, `useCallback`, `useMemo`, and `useRef`. |
| **4. React Router** | Client-side routing with `react-router-dom` v7 (`<Routes>`, `<Route>`, `<Navigate>`, `useNavigate`, `useLocation`). |
| **5. Forms** | Controlled inputs where input values are bound to React state and updated via `onChange`. |
| **6. Component Communication** | Unidirectional data flow (parent to child via props, child to parent via callbacks), and global communication via React Context and Window Events. |

---

### **Senior Review Questions & Answers (Phase 6)**

#### **1. What is React.js and how does its Virtual DOM work?**
> **Answer in the context of Deck Estimator:**
> "React is a component-driven JavaScript library for building interactive user interfaces.
> It uses an in-memory representation of the real DOM called the **Virtual DOM**:
> 1. When a contractor toggles a checkbox (e.g. `applyMinJobPrice`), React creates a new Virtual DOM tree representing the new state.
> 2. React runs its **Reconciliation algorithm (Fiber)** to compare (diff) the new virtual tree against the previous virtual tree.
> 3. React calculates the minimum number of changes required and batches DOM updates, repainting only the specific quote price element rather than re-rendering the entire page. This enables 60fps real-time recalculations."

---

#### **2. What is JSX?**
> **Answer in the context of Deck Estimator:**
> "JSX (JavaScript XML) is a syntax extension for JavaScript that allows writing HTML-like markup directly inside React components.
> Under the hood, the Vite/Babel compiler transforms JSX tags into pure JavaScript function calls:
> `<div className="card">{price}</div>` $\to$ `React.createElement('div', { className: 'card' }, price)`.
> JSX safely auto-escapes expressions, preventing script injection."

---

#### **3. What is the difference between Props and State?**
> **Answer in the context of Deck Estimator:**
> - **Props (Properties):** Immutable data passed down from a parent component to a child component (e.g. passing `<SkeletonShimmer width="200px" height="24px" />`). The child cannot modify its own props.
> - **State:** Mutable data managed internally by the component that represents its current condition (e.g. `const [applyMinJobPrice, setApplyMinJobPrice] = useState(false)` in `ContinuousEstimatorForm`). Changing state triggers a component re-render."

---

#### **4. What is `useState` and how does it work?**
> **Answer in the context of Deck Estimator:**
> "`useState` is the core React hook that declares state variables in functional components.
> It returns an array with two items: the current state value and a setter function:
> `const [estimates, setEstimates] = useState([])`.
> State updates are batched by React for performance. When calling `setEstimates(newList)`, React schedules a re-render of the component with the new data."

---

#### **5. Why do we use `useEffect`?**
> **Answer in the context of Deck Estimator:**
> "`useEffect` lets functional components synchronize with external systems and perform side effects (data fetching, subscribing to browser events, manually manipulating timers).
> In `ContractorProjectsPage.jsx`:
> ```javascript
> useEffect(() => {
>   fetchProjects();
>   const handleSaved = () => fetchProjects(true);
>   window.addEventListener('estimation_saved', handleSaved);
>   return () => window.removeEventListener('estimation_saved', handleSaved);
> }, [fetchProjects]);
> ```
> The cleanup return function removes the event listener when the component unmounts, preventing memory leaks."

---

#### **6. What is the Dependency Array in `useEffect` and what happens if it is omitted?**
> **Answer in the context of Deck Estimator:**
> - **No Dependency Array (`useEffect(fn)`):** Runs on every single render cycle. Usually causes infinite loops if state is set inside.
> - **Empty Array (`useEffect(fn, [])`):** Runs exactly once after the initial component mount.
> - **With Dependencies (`useEffect(fn, [searchTerm, statusFilter])`):** Runs on mount and re-runs whenever any value in the array changes identity ($!==$)."

---

#### **7. What is `useContext` and when did you use it?**
> **Answer in the context of Deck Estimator:**
> "`useContext` allows subscribing to React Context without prop drilling through intermediate components.
> We implemented `AuthContext` (`features/auth/hooks/useAuth.js`):
> The root `<AuthProvider>` holds the current authenticated user and login state. Any child component—whether the Navbar profile circle, Contractor Sidebar, or Customer Dashboard—simply calls `const { user, logout } = useAuth()` to access user state directly."

---

#### **8. What causes a React component to re-render?**
> **Answer in the context of Deck Estimator:**
> "A component re-renders when:
> 1. Its local state changes via a `useState` setter.
> 2. Its parent component re-renders.
> 3. Its received props change.
> 4. A Context it subscribes to via `useContext` changes value.
> *Optimization note:* We use `useCallback` and `useMemo` in our estimator forms and admin dashboard to memoize functions and expensive calculations, preventing unnecessary child re-renders."

---

#### **9. How do you handle form submissions in React?**
> **Answer in the context of Deck Estimator:**
> "We use controlled components with synthetic event handlers:
> 1. Prevent default browser submission to keep SPA context: `e.preventDefault()`.
> 2. Run client-side validation (checking required inputs, minimum dimensions).
> 3. Set loading state (`setSubmitting(true)`).
> 4. Call the API asynchronously via `try...catch`.
> 5. On success, update UI state, display toast notification, and navigate if needed.
> 6. On failure, catch the error and display an inline alert to the user without clearing valid inputs."

---

#### **10. How do you implement Protected Routes in React Router?**
> **Answer in the context of Deck Estimator:**
> "We built a `<ProtectedRoute>` wrapper component:
> ```jsx
> export function ProtectedRoute({ children, allowedRoles }) {
>   const { user, loading } = useAuth();
>   if (loading) return <RouteLoadingFallback />;
>   if (!user) return <Navigate to="/login" replace />;
>   if (allowedRoles && !allowedRoles.includes(user.role)) {
>     return <Navigate to="/unauthorized" replace />;
>   }
>   return children;
> }
> ```
> If a customer attempts to visit `/admin/dashboard`, React Router immediately intercepts and redirects them."

---
---

## **Phase 7: Frontend & Backend Integration**

| Topic | What You Need to Explain |
| :--- | :--- |
| **1. API Integration** | Centralized client using standard `fetch` / Axios abstractions for REST API communication. |
| **2. Request & Response** | Serialization of JavaScript state into JSON payloads and deserialization of responses. |
| **3. API Error Handling** | Intercepting HTTP error codes (401, 403, 404, 409, 500) and mapping them to user-friendly UI banners. |
| **4. Authentication Integration** | Storing JWT and injecting it into `Authorization: Bearer <token>` request headers. |
| **5. Loading & State Management** | Loading flags (`loading`, `submitting`), skeleton shimmer placeholders, and optimistic UI updates. |

---

### **Senior Review Questions & Answers (Phase 7)**

#### **1. How does React communicate with Express?**
> **Answer in the context of Deck Estimator:**
> "React runs in the user's browser. It communicates with the Express backend over HTTP/HTTPS by sending asynchronous AJAX requests using the Fetch API or Axios.
> React serializes state objects into JSON strings (`JSON.stringify(payload)`), transmits them with header `Content-Type: application/json`, and Express deserializes them via `express.json()`. Express replies with JSON, which React resolves as JavaScript objects to update state."

---

#### **2. What is Axios and how does it compare to native Fetch?**
> **Answer in the context of Deck Estimator:**
> - **Native Fetch:** Built into modern browsers. Requires manual response parsing (`await res.json()`), does not reject HTTP error statuses (404/500) automatically, and has no native request interceptors.
> - **Axios / Custom Client Wrapper:** Automatically parses JSON, rejects promises on status $\ge 400$, supports request/response interceptors, and simplifies upload progress.
> *In Deck Estimator:* We engineered a robust wrapper (`client.js`) around `fetch` that provides interceptor support, automatic JWT attachment, global error parsing, and fallback handling."

---

#### **3. How do you send JWT with API requests?**
> **Answer in the context of Deck Estimator:**
> "In `frontend/src/api/client.js`, our request client automatically checks for an active session:
> ```javascript
> const token = localStorage.getItem('token') || getCookie('token');
> if (token) {
>   headers['Authorization'] = `Bearer ${token}`;
> }
> ```
> This ensures every API request to protected routes automatically presents credentials without repeating code in each component."

---

#### **4. How do you handle API errors gracefully in React?**
> **Answer in the context of Deck Estimator:**
> "1. In our API service layer, if `res.ok` is false, we extract `data?.error?.message` and throw a standard `Error`.
> 2. In React components, calls are wrapped in `try...catch`:
>    ```javascript
>    try {
>      await createEstimate(payload);
>    } catch (err) {
>      setErrorMsg(err.message || 'Failed to generate estimate.');
>    } finally {
>      setSubmitting(false);
>    }
>    ```
> 3. The error is displayed in styled alert banners rather than unhandled white screens."

---

#### **5. How do you handle session expiration (Token Expiry)?**
> **Answer in the context of Deck Estimator:**
> "In `client.js`, our response interceptor checks:
> ```javascript
> if (response.status === 401 && (data?.error?.code === 'TOKEN_EXPIRED' || data?.error?.code === 'INVALID_TOKEN')) {
>   localStorage.removeItem('auth_session');
>   window.location.href = '/login?expired=true';
> }
> ```
> This gracefully redirects users to the login screen with a friendly notification."

---

#### **6. How do you display backend validation errors to the user?**
> **Answer in the context of Deck Estimator:**
> "When Joi or Mongoose validation fails on the backend, it returns HTTP 400 with a detailed error structure:
> `{ success: false, error: { message: 'Deck length must be greater than 0.' } }`.
> The React component catches this message and highlights the corresponding input field in red with the specific validation text."

---

#### **7. What are Optimistic UI Updates and where did you use them?**
> **Answer in the context of Deck Estimator:**
> "Optimistic UI is where the user interface updates immediately before waiting for the server to reply over the network.
> In `AdminLeadManagementPage.jsx`:
> When an admin clicks **Delete Lead**, the lead is immediately filtered out and removed from the React state table, and the modal closes instantly. In the background, the `DELETE /api/v1/admin/leads/:id` API call executes. If the network request fails, the lead is restored and an error toast appears. This makes the administrative interface feel instantaneous."

---
---

## **Phase 8: Testing & Deployment**

| Topic | What You Need to Explain |
| :--- | :--- |
| **1. API Testing** | Automated integration tests and manual API endpoint validation. |
| **2. Backend Testing** | Automated end-to-end integration test suite (`tests/integration/mandatorySecurityVerification.test.js`) verifying the 9 Security Pillars. |
| **3. Git & GitHub** | Feature branch workflow (`dev2` $\to$ PR $\to$ `main`), clean commits, and version control. |
| **4. Environment Variables** | Managing distinct `.env` configurations across local development and Railway production. |
| **5. Deployment** | Containerized deployment on Railway PaaS (`frontend` and `backend` services) connected to MongoDB Atlas. |

---

### **Senior Review Questions & Answers (Phase 8)**

#### **1. How did you test your APIs?**
> **Answer in the context of Deck Estimator:**
> "1. **Automated Integration Testing:** We wrote an automated Node.js test suite (`backend/tests/integration/mandatorySecurityVerification.test.js`) covering authentication, RBAC authorization, pricing engine invariants, input sanitization, and lead workflow transitions.
> 2. **Manual Regression & Edge Case Testing:** Used Postman / curl to test rate limiting thresholds, malformed payloads, file upload bounds, and expired tokens."

---

#### **2. What is the difference between Unit Testing and Integration Testing?**
> **Answer in the context of Deck Estimator:**
> - **Unit Testing:** Tests isolated functions in complete isolation with zero external dependencies (e.g. testing the `pricingEngine.calculate()` mathematical formula with mock inputs).
> - **Integration Testing:** Tests how multiple layers collaborate together (e.g. making an HTTP POST request to `/api/v1/estimates`, verifying middleware execution, database insertion in MongoDB, and response JSON schema)."

---

#### **3. Why do we use Environment Variables and how do you protect secrets?**
> **Answer in the context of Deck Estimator:**
> "Environment variables separate application source code from deployment-specific credentials (Twelve-Factor App methodology).
> Secrets like `MONGODB_URI` and `JWT_SECRET` must **never** be hardcoded in repository files.
> We enforce:
> 1. Strict `.gitignore` rules preventing `.env` or `.env.local` from ever being staged or committed to Git.
> 2. Committing a clean `.env.example` with blank placeholder values.
> 3. Injecting live production secrets directly through Railway's encrypted Platform Variables interface."

---

#### **4. How did you deploy your application to production?**
> **Answer in the context of Deck Estimator:**
> "Our application is deployed on **Railway** connected to a managed **MongoDB Atlas** cluster:
> 1. **Backend Service (`deckestimatorplus-api.up.railway.app`):**
>    - Packaged and deployed via Railway Railpack.
>    - Runs `node src/server.js` on port 5000.
>    - Uses environment variables: `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN`, `NODE_ENV=production`.
> 2. **Frontend Service (`deckestimatorplus.up.railway.app`):**
>    - Deployed using Railway's sub-directory deployment (`--path-as-root`).
>    - Builds static assets with Vite (`npm run build`).
>    - Serves via `server.js` (Express static server with gzip compression and React Router client-side fallback).
> 3. **Database (MongoDB Atlas):**
>    - Multi-tenant cloud cluster with automated daily backups, IP allowlisting, and TLS encrypted connections."

---

#### **5. What was a challenging production bug you encountered and how did you resolve it?**
> **Answer in the context of Deck Estimator:**
> "One notable production issue was **missing avatars in containerized hosting**:
> - *Problem:* In local development, uploaded avatars were written to the local disk at `/uploads/avatars`. In Railway's ephemeral container environment, container restarts wiped the local disk, causing broken profile picture icons across all navigation bars.
> - *Root Cause:* Ephemeral container file storage and cross-domain asset isolation between frontend and backend domains.
> - *Solution:* We re-architected avatar storage to compress avatars client-side to $256 \times 256$ WebP format and store them directly as Base64 data URIs inside the MongoDB User document. This eliminated filesystem dependencies, made avatars immune to container redeploys, and resulted in $\$0$ extra cloud storage costs."

---

#### **6. How do you manage Development vs Production configurations?**
> **Answer in the context of Deck Estimator:**
> "We use `process.env.NODE_ENV`:
> - In **Development**: CORS allows `http://localhost:5173`, error handlers print full stack traces, and verbose logger middleware is enabled.
> - In **Production**: CORS is locked to `https://deckestimatorplus.up.railway.app`, error handlers suppress internal stack traces to prevent info disclosure, response compression is activated, and database connection pools are tuned for high concurrency."

---

## **Final Senior Developer Defense Checklist**

```
[✓] 1. Architecture: Clean separation of concerns (React 19 SPA + Express 5 REST + MongoDB Atlas).
[✓] 2. Database: Immutable historical pricing snapshots embedded in Estimate; referenced User accounts.
[✓] 3. Concurrency: Non-blocking Node event loop with libuv thread pool offloading crypto tasks.
[✓] 4. Performance: .lean() queries, selective field projections, and compound indexing on query paths.
[✓] 5. Security: BCrypt (10 rounds), signed JWT tokens, RBAC authorization, Helmet, CORS, and sanitization.
[✓] 6. Frontend: Modular feature architecture, controlled estimator state, and instant price updates.
[✓] 7. Deployment: Decoupled services on Railway with zero-downtime builds and resilient base64 avatar storage.
```

