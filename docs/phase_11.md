Phase 11 – Integration, Security and Quality Assurance
Objective: Verify that all completed modules from Phases 3–10 work together correctly, enforce security controls, protect business data, and meet defined quality standards.

This is a hardening and verification phase, not a feature-development phase. Antigravity must not start Phase 12, introduce new business features, or claim completion without reproducible evidence.

The documentation below is intended to be saved in the project as:

Docs/Phase-11-Integration-Security-QA.md
1. Phase 11 – Scope and objectives
Phase 11 covers the integration and verification of:
Phase	Module	What must be verified
3	Authentication & Authorization	Login, sessions, JWT, roles, protected routes
4	Deck Input & File Uploads	Ownership, validation, secure storage, image access
5	Material & Service Catalog	Admin management, active catalog visibility, compatibility
6	Pricing & Estimate Management	Calculation accuracy, snapshots, estimate integrity
7	AI Condition Analysis	Inference workflow, failures, output handling, limitations
8	Contractor & Lead Management	Verification, lead assignment, contractor isolation
9	Discounts & Commission	Eligibility, calculations, approvals, payout records
10	Admin Dashboard	Administrative controls, settings, reports, audit logs


Primary rule: Existing functionality must be verified against its approved requirements. Do not change business rules simply to make tests pass.
2. Mandatory verification areas
A. Authentication and authorization
Verify:
- Customer registration and login.
- Contractor registration and pending-verification restrictions.
- Admin-only access to administrative endpoints.
- JWT expiration and invalid-token handling.
- Logout and session invalidation behavior, according to the existing authentication design.
- Protected frontend routes.
- Direct API access without frontend navigation.
- Role escalation prevention.
- Account deactivation and access restrictions.
- Unauthorized access returns appropriate HTTP status codes.
Mandatory negative tests:
1. Customer attempts to access Admin APIs.
2. Contractor attempts to access Admin APIs.
3. Unverified contractor attempts restricted actions.
4. Expired token accesses protected endpoint.
5. Invalid token accesses protected endpoint.
6. User attempts to modify their role through an ordinary profile update.
7. Deactivated user attempts to authenticate or reuse an existing session.
Proof required: API requests and responses, automated test results, and relevant authorization implementation.
B. Ownership and data isolation
This is one of the most important security areas.

Verify that users can only access resources they are authorized to access.

Test:
- Customer A cannot access Customer B's decks.
- Customer A cannot access Customer B's estimates.
- Customer A cannot access Customer B's uploaded images.
- Contractor A cannot access Contractor B's assigned leads.
- Contractor cannot access unassigned leads.
- Contractor cannot access private customer information outside authorized lead access.
- Customer cannot access contractor verification documents.
- Ordinary users cannot access administrative records.
- Changing MongoDB IDs in API requests cannot bypass authorization.
Required security test: Perform IDOR (Insecure Direct Object Reference) tests by replacing valid resource IDs with IDs belonging to other users.

A 403 or 404 response is acceptable depending on the existing API security design. Unauthorized data must never be returned.
C. Secure file upload and image access
Verify Phase 4 file handling.

Test:
- Supported file extensions.
- Actual image MIME type.
- File signature/magic-byte validation.
- Maximum file size.
- Maximum image count.
- Invalid image files.
- Executable files renamed as .jpg.
- Oversized uploads.
- Duplicate or malicious filenames.
- Path traversal attempts.
- Unauthorized image downloads.
- Deleted or inaccessible deck image requests.
- Upload failure rollback.
- Storage cleanup after deletion or failed operations.
Verify that:
- Images are not publicly accessible through predictable URLs.
- File paths are not exposed unnecessarily.
- Users cannot access images belonging to another user.
- Contractors can only access images associated with authorized assigned leads.
- Admin access follows the existing authorization policy.
Proof required: Upload test cases, invalid-file rejection results, unauthorized download tests, and storage verification.
D. Material catalog and service integration
Verify:
- Admin can create, update, activate and deactivate catalog entries.
- Customers and contractors only receive entries intended to be publicly selectable.
- Inactive materials cannot be selected for new estimates.
- Incompatible materials and services are rejected.
- Existing estimates retain their historical material/service information.
- Catalog changes do not silently alter previously generated estimates.
Do not invent missing material costs, coverage rates, or product compatibility rules.
E. Pricing and estimate integrity
Pricing must remain backend-controlled.

Verify:
1. Area calculations.
2. Material quantity calculations.
3. Waste calculations.
4. Material costs.
5. Service costs.
6. Labor calculations.
7. Additional charges.
8. Minimum job price.
9. Tax calculation.
10. Discount calculation.
11. Final estimate total.
12. Estimate snapshots and version history.
Mandatory negative tests:
- Client sends a modified material price.
- Client sends a modified labor rate.
- Client sends a modified discount.
- Client sends a modified tax amount.
- Client changes calculated area in the request.
- Client sends negative quantities.
- Client sends extremely large numeric values.
- Client submits incompatible catalog selections.
- Client attempts to bypass the minimum job price.
The backend must reject invalid values or recalculate using trusted server-side configuration.

Historical integrity:

Changing current catalog or pricing configuration must not silently rewrite previously issued estimates.

Important: Do not confuse estimated pipeline value with realized revenue. Preserve Phase 10's financial definitions.
F. AI condition analysis integration
Verify Phase 7 integration with the main application.

Test:
- Valid image submission.
- Invalid image submission.
- AI service unavailable.
- AI service timeout.
- Malformed AI response.
- Missing prediction fields.
- Invalid condition level.
- Invalid defect labels.
- Poor image quality.
- Unable-to-assess result.
- Repeated analysis requests.
- Partial failure when a deck contains multiple images.
Verify:
- AI failure does not crash the main application.
- The user receives an understandable status or error.
- Failed analyses are not presented as successful predictions.
- AI results remain distinguishable from human-reviewed results.
- AI predictions do not directly modify pricing.
- AI does not make structural safety claims.
Model limitation must remain visible in the project documentation:

The current ML model is experimental and trained on a limited synthetic dataset. It is not production-validated. Phase 11 must not present its accuracy as proven real-world performance.

Do not silently change the model or its classification definitions during this phase.
G. Contractor verification and lead management
Verify:
- Contractor registration.
- Pending verification restrictions.
- Admin approval and rejection.
- Verification document access restrictions.
- Lead creation through the approved customer workflow.
- Admin lead assignment.
- Contractor lead visibility.
- Lead acceptance and rejection.
- Lead status updates.
- Customer-visible notes versus internal notes.
- Lead assignment history.
- Unauthorized lead access.
- Duplicate or invalid state transitions.
Contractors must never gain access to leads merely by guessing a lead ID.
H. Discounts and commission integrity
Verify:
- Discount eligibility.
- Percentage-based discounts.
- Fixed-value discounts.
- Discount limits and effective dates.
- Minimum price restrictions, where configured.
- Estimate discount snapshots.
- Commission eligibility.
- Commission approval and rejection.
- Dispute and reversal workflows.
- Payment records.
- Duplicate payout prevention.
- Unauthorized self-approval.
- Commission calculation consistency.
Concurrency tests are mandatory for financial state transitions.

The same commission must not be approved or paid twice because two requests arrive simultaneously.

The same discount must not be applied multiple times through repeated requests.
I. Admin dashboard and platform settings
Verify:
- Admin-only dashboard access.
- Dashboard KPI aggregation.
- User management.
- Deck and estimate oversight.
- AI analysis oversight.
- Platform settings.
- Public/private setting separation.
- Audit logs.
- Reports and exports.
- Last-admin protection.
Test that private settings and sensitive configuration never appear in public API responses.

Concurrency consideration: Phase 10 uses an in-memory mutex for last-admin protection. Verify the current implementation and document its single-process limitation. Do not claim it is safe across multiple application instances. If deployment architecture requires multiple instances, identify the necessary database-level protection.
J. Audit logs and sensitive information
Verify that important administrative and business actions are auditable.

Check:
- User status changes.
- Contractor verification decisions.
- Lead assignments.
- Pricing configuration changes.
- Discount changes.
- Commission approvals and payment records.
- Platform settings changes.
- Administrative account actions.
Verify that:
- Audit history cannot be modified through ordinary user APIs.
- Unauthorized users cannot read audit records.
- Passwords, JWT secrets, tokens, and sensitive credentials are not logged.
- Private customer information is not unnecessarily exposed.
- Exported reports respect role-based access.
3. API and application security testing
Conduct a systematic review of the existing backend.
Security area	Required verification
Input validation	Joi or existing validation applied to relevant endpoints
Mass assignment	Protected fields cannot be changed through arbitrary request bodies
NoSQL injection	User-controlled MongoDB operators are rejected or safely handled
IDOR	Resource ownership and access authorization
Path traversal	File paths cannot escape configured storage directories
SSRF	User-controlled URLs cannot trigger unauthorized internal requests
Rate limiting	Authentication and sensitive endpoints are protected
CORS	Only approved origins are permitted
HTTP headers	Helmet and existing security headers are configured
Cookies	Secure, HttpOnly, SameSite and production settings are correct
CSRF	Assess protection according to the actual cookie authentication architecture
Error handling	No stack traces, secrets or internal implementation details exposed
Dependencies	Identify vulnerable and outdated dependencies
Secrets	No credentials committed or exposed in frontend bundles
Logging	No passwords, tokens or unnecessary sensitive data logged


Do not claim a vulnerability is fixed merely because a package is installed. Verify actual configuration and behavior.

For CSRF, do not blindly add middleware without understanding the existing JWT transport, cookie settings, and request architecture.
4. Frontend integration and quality assurance
Verify the real application workflows.
Customer workflow
1. Register and log in.
2. Create a deck.
3. Upload deck images.
4. View saved deck details.
5. Access the material/service catalog.
6. Generate an estimate.
7. View estimate history.
8. Request contractor contact.
9. View permitted enquiry updates.
Contractor workflow
1. Register a contractor account.
2. Submit verification information.
3. Remain restricted while pending.
4. Access the application after approval.
5. View assigned leads only.
6. Accept or reject leads.
7. Update permitted lead statuses.
8. View permitted estimate information.
9. View applicable discounts and commission information.
Admin workflow
1. Log in as Admin.
2. View dashboard metrics.
3. Manage users.
4. Verify contractors.
5. Manage decks and estimates.
6. Review AI results.
7. Manage platform settings.
8. Review audit logs.
9. Generate reports.
10. Review discounts and commission records.
Check:
- Frontend routes and role restrictions.
- API integration.
- Loading states.
- Empty states.
- Validation errors.
- Server errors.
- Session expiration.
- Refresh behavior.
- Responsive layout for major screens.
- No fake success notifications.
- No nonfunctional buttons or incomplete workflows.
A screen rendering successfully is not proof that its workflow works.
5. Integration and regression testing
Run tests across module boundaries.

Examples:
- Customer creates a deck → uploads photos → generates estimate.
- Customer generates estimate → creates enquiry → Admin assigns lead.
- Admin approves contractor → contractor accesses assigned lead.
- Admin changes catalog → new estimates use the updated configuration.
- Existing estimate retains its original snapshot.
- Admin configures a discount → eligible contractor receives the correct discount.
- Lead conversion → commission eligibility → approval → payment record.
- AI service failure → application handles the failure without losing deck data.
- Admin changes platform setting → public API exposes only approved public settings.
Required test categories:
- Unit tests.
- Integration tests.
- API authorization tests.
- Negative security tests.
- Cross-module workflow tests.
- Regression tests.
- Frontend build and lint.
- Database integration tests.
Use the existing test framework and patterns. Do not replace a working test framework without a clear technical reason.
6. Performance and database verification
Inspect performance without unnecessary optimization.

Verify:
- Important MongoDB indexes.
- Pagination on large collections.
- Filtering and sorting.
- Dashboard aggregation efficiency.
- N+1 query patterns where relevant.
- Large image upload/download behavior.
- AI service response timeout handling.
- Memory leaks or unclosed connections.
- Database connection failure handling.
Run realistic load or concurrency tests where the environment supports them.

Document:
- Test environment.
- Number of concurrent users or requests.
- Number of iterations.
- Average response time.
- P95 response time, where measurable.
- Error rate.
- Resource limitations.
Do not invent performance numbers or claim production-scale capacity based on a small local test.
7. Strict proof and evidence requirements
This is the most important part of Phase 11.

Every completion claim must be supported by evidence.

Antigravity must maintain an evidence register in the Phase 11 completion report.
Requirement	Evidence required	Status
Authentication security	Automated tests and API responses	Pending
Role authorization	Positive and negative role tests	Pending
Ownership isolation	Cross-user IDOR tests	Pending
File security	Valid/invalid upload and download tests	Pending
Pricing integrity	Calculation tests and tampering tests	Pending
AI integration	Success and failure test results	Pending
Lead isolation	Cross-contractor access tests	Pending
Discount integrity	Calculation and eligibility tests	Pending
Commission integrity	Concurrency and duplicate-payment tests	Pending
Admin security	Settings and last-admin tests	Pending
Audit integrity	Access and modification tests	Pending
Frontend workflows	End-to-end workflow evidence	Pending
Regression	Full backend test output	Pending
Frontend quality	Lint and production build output	Pending
Database	Integration test and verification output	Pending
Performance	Reproducible test results	Pending


Evidence rules
1. Every test must identify what it verifies.
2. Negative security tests must show that unauthorized operations were rejected.
3. A test must assert the expected result, not merely execute an API request.
4. Mock tests must be identified as mock tests.
5. Live database tests must be identified as live database tests.
6. Do not present local tests as production tests.
7. Do not report tests that were not executed.
8. Do not report a test as passing if its assertion was skipped.
9. Do not hide failing tests behind exclusions or weakened assertions.
10. Do not modify tests simply to force a passing result.
11. Record any environment limitations that prevented verification.
12. Distinguish PASS, FAIL, BLOCKED, and NOT TESTED.
Mandatory evidence format
For every important test, record:
- Test ID.
- Requirement.
- Test scenario.
- Test environment.
- Execution command or test case.
- Expected result.
- Actual result.
- Evidence location.
- Final status.
Example:
Test ID: SEC-IDOR-001

Requirement:
Customer must not access another customer's deck.

Scenario:
Customer A authenticates and requests Customer B's deck ID.

Expected:
Request rejected with the application's appropriate
authorization response. No deck data returned.

Actual:
[Record actual execution result]

Evidence:
[Exact test file and test output]

Status:
PASS / FAIL / BLOCKED / NOT TESTED

The example is a template, not a claim that this test has already passed.
8. Phase 11 completion criteria
Phase 11 can be marked complete only when all applicable conditions are met.
Mandatory gates
- [ ] Phases 3–10 have been inspected and integrated.
- [ ] Authentication and role authorization verified.
- [ ] Customer and contractor ownership isolation verified.
- [ ] File upload and private image access verified.
- [ ] Pricing calculations and tampering protection verified.
- [ ] AI success and failure handling verified.
- [ ] Contractor verification and lead restrictions verified.
- [ ] Discounts and commission workflows verified.
- [ ] Admin settings and audit protections verified.
- [ ] Important concurrency scenarios verified.
- [ ] Customer end-to-end workflow verified.
- [ ] Contractor end-to-end workflow verified.
- [ ] Admin end-to-end workflow verified.
- [ ] Backend regression suite passes.
- [ ] Frontend lint passes.
- [ ] Frontend production build passes.
- [ ] Database integration verification passes.
- [ ] Security findings are documented.
- [ ] Critical and high-severity unresolved defects are fixed.
- [ ] Remaining limitations and accepted risks are documented.
- [ ] All test results have evidence references.
- [ ] Phase 11 completion review is created.
- [ ] Changes are committed and pushed to dev2.
- [ ] Working tree is clean.
Severity-based defect handling
Severity	Meaning	Completion rule
Critical	Data breach, privilege escalation, major financial manipulation	Must fix
High	Serious authorization, data integrity or workflow vulnerability	Must fix
Medium	Limited security or functional defect	Fix or document with justification and approval
Low	Minor usability or noncritical issue	Document and prioritize


A Critical or High issue cannot be marked complete merely because a workaround exists.

If a mandatory test is blocked, the phase cannot be reported as fully verified. It must remain blocked or partially completed until the issue is resolved.
9. Required documentation deliverables
Antigravity must create or update only the following Phase 11 documentation, reusing existing project documentation conventions.

Primary file:

Docs/Phase-11-Integration-Security-QA.md

Completion report:

Docs/CompletionReviews/Phase-11-Review.md

The completion review must include:
1. Executive summary.
2. Scope covered.
3. Modules and files inspected.
4. Integration workflows tested.
5. Security checks performed.
6. Test evidence register.
7. Backend regression results.
8. Frontend lint and build results.
9. Database verification results.
10. Performance test results, if executed.
11. Defects discovered.
12. Fixes implemented.
13. Unresolved risks and limitations.
14. Deferred items.
15. Files changed.
16. Git commit hash.
17. Branch and push confirmation.
18. Final phase status.
Do not create duplicate documents or overwrite earlier phase completion reports.
10. Strict execution rules
These rules are mandatory throughout Phase 11.
1. Read the existing roadmap, HLD, LLD, and completion reviews before changing code.
2. Inspect the current implementation rather than assuming previous reports prove correctness.
3. Create a verification plan before making code changes.
4. Reuse existing modules and architecture.
5. Do not introduce new business features.
6. Do not redesign the architecture unnecessarily.
7. Do not change approved pricing or business rules.
8. Do not replace the ML model or dataset as part of routine QA.
9. Do not expose production secrets in logs or reports.
10. Fix only defects confirmed by reproducible evidence.
11. Add regression tests for every confirmed defect.
12. Run relevant tests after each fix.
13. Run the complete regression suite before completion.
14. Never hide failed tests.
15. Never claim manual verification without recording the steps and result.
16. Never claim production readiness from local testing.
17. Never start Phase 12 without explicit approval.