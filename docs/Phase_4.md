# PHASE 04: DECK INPUT MANAGEMENT AND SECURE FILE UPLOADS

**Project:** Deck Estimator  
**Phase:** 04 of 12  
**Status:** Requirements Specification  
**Technology:** MERN Stack (MongoDB, Express.js, React.js, Node.js)  
**Architecture:** Modular Monolith  
**Primary Roles:** Customer, Contractor, Admin

---

# 1. PHASE OBJECTIVE

The objective of Phase 4 is to develop a complete Deck Input Management system that allows Customers and Contractors to enter, manage, and maintain Deck Estimatorject information.

The system must also support secure image uploads so users can upload photographs of their decks for documentation and future AI-based condition analysis.

This phase must establish the deck information that will be used by subsequent phases, particularly:

- Phase 5: Material and Service Catalog Management.
- Phase 6: Pricing Calculation Engine and Estimate Management.
- Phase 7: AI-Based Deck Condition Analysis.
- Phase 8: Contractor Verification and Lead Management.

The implementation must be reusable, secure, scalable, and integrated with the existing Phase 1–3 architecture.

# 2. USER ROLES AND ACCESS

There are exactly three primary application roles.

## 2.1 Customer

Customers must be able to:

- Create a new Deck Estimatorject.
- Enter deck information.
- Save deck information.
- Edit their own deck information.
- View their own Deck Estimatorjects.
- Upload multiple deck photographs.
- View uploaded photographs.
- Delete their own uploaded photographs.
- Delete their own Deck Estimatorject, subject to business rules.
- Maintain multiple Deck Estimatorjects.
- View project creation and update timestamps.

Customers must never access another customer's deck information or photographs.

## 2.2 Contractor

Contractors must be able to:

- Create Deck Estimatorject records for authorized business purposes.
- Enter deck measurements and project details.
- Save and edit their own authorized deck records.
- Upload multiple photographs.
- View and manage photographs belonging to their authorized records.
- Maintain multiple Deck Estimatorjects.

Contractor access must follow the existing contractor account verification and authorization rules.

Pending or rejected contractors must not gain access to restricted contractor operations.

Contractors must not access another contractor's private records unless explicitly authorized through a future business workflow.

## 2.3 Admin

Phase 4 does not introduce a new Admin deck-management dashboard.

However, the backend must preserve the existing Admin authorization model.

Admin access to deck records must follow explicit administrative authorization rules. Admin-only operations must never be exposed through public customer or contractor endpoints.

# 3. DECK INFORMATION REQUIREMENTS

The application must collect deck information through a user-friendly, organized form.

Use logical form sections rather than presenting every input in one long form.

## 3.1 Project Basic Information

Fields:

- Project Name
- Project Description
- Property Address
- ZIP / Postal Code
- City
- State
- Country

Requirements:

- Project Name must be mandatory.
- Project Description must be optional.
- Address information must be validated.
- ZIP / Postal Code must follow the selected country-specific validation rules.
- Location fields must not be treated as verified geographic coordinates.
- Latitude/longitude integration is outside this phase unless already implemented and explicitly required.

## 3.2 Deck Measurements

Collect the dimensions necessary to describe the deck.

Fields:

- Measurement Unit
- Deck Length
- Deck Width
- Deck Area

Requirements:

- Support the measurement system approved for the project.
- Store measurements consistently.
- Accept only valid positive numerical measurements.
- Reject zero and negative dimensions.
- Apply reasonable maximum-value validation to prevent invalid or malicious input.
- Calculate deck area from the entered dimensions when the deck is rectangular.
- Do not allow users to submit arbitrary calculated area values that conflict with the dimensions.
- Display calculated area clearly.

Important:

The business must confirm whether the application supports:

- Feet and inches.
- Decimal feet.
- Square feet.
- Metric measurements.

Do not silently mix measurement units.

## 3.3 Deck Shape

Support the deck shapes approved for the estimator.

Initial shape options:

- Rectangle
- Square
- L-Shaped
- Custom / Other

Requirements:

- Rectangle and Square must use length and width.
- L-Shaped and Custom decks may require additional measurement details.
- The application must not incorrectly calculate complex deck areas using the rectangular formula.
- If sufficient dimensions are unavailable, allow users to save the project with an incomplete measurement status.
- Clearly communicate when manual measurement or additional dimensions are required.

Do not invent complex shape formulas without approved business rules.

## 3.4 Deck Structure and Features

Collect applicable deck details.

Potential fields:

- Number of Deck Levels
- Attached or Detached
- Railing Present
- Stairs Present
- Built-in Features
- Additional Structure Notes

Where applicable, support:

- Number of stairs.
- Railing details.
- Multiple levels.
- Other special deck features.

Requirements:

- Use dropdowns, toggles, or structured numerical fields where appropriate.
- Avoid unrestricted text inputs when structured values are possible.
- Make additional notes optional.
- Do not derive labor or material costs from these fields in Phase 4.

## 3.5 Existing Deck Surface Information

Collect information about the existing deck surface.

Fields:

- Surface Material
- Existing Coating Status
- Previous Treatment Information
- Surface Description
- Additional Notes

Potential surface material options:

- Wood
- Composite
- Other

Potential existing coating options:

- No Coating
- Painted
- Stained
- Sealed
- Unknown

Requirements:

- Allow users to select an appropriate value.
- Support an Unknown option where the user cannot identify the material or treatment.
- Do not assume that all surface materials are compatible with every future restoration service.
- Store the selected values without applying pricing calculations.

Final supported material and coating options will be confirmed through the business requirements.

## 3.6 Visible Deck Condition

Collect user-reported visible deck conditions.

Potential options:

- Peeling Coating
- Discoloration
- Surface Wear
- Visible Wood Damage
- Cracks
- Mold / Mildew Appearance
- Other
- Not Sure

Requirements:

- Allow multiple condition selections.
- Allow optional additional descriptions.
- Provide an option for users who cannot identify the condition.
- Do not treat user-selected conditions as verified technical diagnoses.
- Do not make structural safety claims.

AI-based image assessment belongs to Phase 7.

# 4. FORM EXPERIENCE AND USER INTERFACE

Develop a responsive and user-friendly deck input experience.

## 4.1 Form Organization

Organize the form into the following sections:

1. Project Information
2. Property Location
3. Deck Measurements
4. Deck Shape
5. Deck Structure and Features
6. Existing Surface Information
7. Visible Deck Condition
8. Deck Photographs
9. Review and Save

## 4.2 Form Behavior

The form must support:

- Clear field labels.
- Helpful input descriptions.
- Required and optional field indicators.
- Appropriate input controls.
- Inline validation messages.
- Conditional fields.
- Loading states.
- Error states.
- Success notifications.
- Responsive layouts.
- Keyboard accessibility.

## 4.3 Save Behavior

Provide:

- Save Project.
- Save Changes.
- Cancel.
- View Project.

The system should preserve entered data when validation fails.

If autosave is implemented, it must not silently overwrite valid user data or create duplicate records.

Do not introduce unnecessary autosave complexity if a reliable explicit save workflow is sufficient.

## 4.4 Review Before Submission

Before saving a completed project, allow users to review:

- Project information.
- Location.
- Measurements.
- Shape.
- Structure.
- Existing surface.
- Visible conditions.
- Uploaded photographs.

Users must be able to return to previous form sections and correct information.

# 5. DECK RECORD MANAGEMENT

Implement complete CRUD operations.

## 5.1 Create Deck

- Authenticated users can create deck records.
- Associate each deck with its authenticated owner.
- Validate all submitted fields.
- Generate a unique database identifier.
- Save creation and update timestamps.

## 5.2 Read Deck

- Users can list their own authorized deck records.
- Users can open individual deck records.
- Return only fields that the user is authorized to access.
- Support pagination for deck lists.
- Provide useful empty states when no records exist.

## 5.3 Update Deck

- Users can edit their own authorized records.
- Validate updated information.
- Preserve existing data when fields are not included in partial updates.
- Update the modification timestamp.
- Prevent modification of ownership and system-managed fields.

## 5.4 Delete Deck

- Users can delete only records they own or are explicitly authorized to manage.
- Use a safe deletion workflow.
- Handle associated photographs correctly.
- Prevent unauthorized deletion.
- Do not leave accessible orphaned files.

If soft deletion is selected, define how deleted records and their photographs are handled.

The deletion policy must be documented and consistent.

# 6. SECURE FILE UPLOAD MANAGEMENT

Photograph upload is a major requirement of Phase 4.

Users must be able to upload multiple photographs associated with a Deck Estimatorject.

## 6.1 Supported File Types

Initially support:

- JPEG / JPG
- PNG
- WebP

Reject:

- Executable files.
- HTML files.
- SVG files unless a safe sanitization strategy is explicitly approved.
- Unsupported document formats.
- Files with mismatched extensions and actual content types.

Validate actual file content rather than trusting the extension or browser-provided MIME type.

## 6.2 Upload Validation

Implement:

- Maximum individual file size.
- Maximum number of photographs per deck.
- Total upload size limits.
- Allowed MIME type validation.
- File signature validation.
- Secure filename generation.
- Duplicate upload handling where appropriate.

Initial configurable defaults:

- Maximum image size: 10 MB per file.
- Maximum images: 10 per deck.

These are proposed defaults and must remain configurable until business approval.

Do not hardcode these values throughout the application.

## 6.3 Image Storage

Use external object storage for actual image files.

MongoDB should store image metadata and storage references, not large image binaries.

The storage provider must be selected and configured before production implementation.

Possible providers include:

- AWS S3.
- Cloudinary.
- Another approved object-storage provider.

Do not assume that a provider has already been selected.

The storage integration must be modular so the provider can be changed without rewriting the deck management module.

## 6.4 Image Metadata

For every uploaded photograph, store:

- Image ID.
- Associated Deck ID.
- Owner User ID.
- Original filename.
- Generated storage filename or object key.
- MIME type.
- File size.
- Storage provider.
- Storage reference.
- Upload timestamp.
- Optional image description.

Never expose private storage credentials or internal storage paths to unauthorized users.

## 6.5 Image Access

Implement secure access to uploaded photographs.

Requirements:

- Verify authentication before accessing private images.
- Verify ownership or explicit authorization.
- Prevent users from accessing other users' photographs.
- Use signed URLs or an authenticated image-serving mechanism.
- Ensure private images are not publicly accessible by default.
- Validate that an image belongs to the requested deck.

## 6.6 Image Deletion

When a user deletes an image:

1. Verify authorization.
2. Identify the corresponding storage object.
3. Delete the storage object.
4. Update or remove the MongoDB metadata.
5. Handle storage failures safely.
6. Prevent metadata and storage from becoming permanently inconsistent.

Implement retry-safe cleanup or a documented recovery mechanism for partial failures.

## 6.7 Image Preview

The frontend must support:

- Photograph previews.
- Upload progress indicators.
- Remove image action.
- Upload success and failure messages.
- Image count display.
- Clear error messages.

Do not expose internal storage credentials or unrestricted public image URLs.

# 7. DATABASE DESIGN

Use MongoDB with Mongoose.

Create a dedicated Deck model and, where appropriate, a separate DeckImage model or embedded image metadata structure.

The final schema design must follow the existing project architecture.

## 7.1 Deck Collection

Suggested fields:

- _id
- ownerId
- projectName
- projectDescription
- propertyAddress
- location
- measurementUnit
- dimensions
- deckShape
- structureDetails
- surfaceDetails
- visibleConditions
- additionalNotes
- completionStatus
- createdAt
- updatedAt
- deletedAt (only if soft deletion is implemented)

The owner reference must point to the existing User model.

Do not duplicate user authentication information in the Deck collection.

## 7.2 Deck Image Collection / Metadata

Suggested fields:

- _id
- deckId
- ownerId
- originalFilename
- storageKey
- storageProvider
- mimeType
- fileSize
- imageDescription
- uploadedAt
- createdAt
- updatedAt

Choose embedded metadata or a separate collection based on expected access patterns and scalability.

Document the decision.

## 7.3 Database Indexes

Create appropriate indexes.

Potential indexes:

- ownerId.
- ownerId + createdAt.
- deckId for image metadata.
- Any additional index justified by actual queries.

Avoid unnecessary indexes.

Verify indexes against real query patterns.

## 7.4 Data Integrity

Ensure:

- Every deck has a valid owner.
- Every image belongs to a valid deck.
- The image owner matches the deck owner.
- Deleted decks cannot expose their photographs.
- Ownership cannot be changed through normal user update requests.

# 8. BACKEND IMPLEMENTATION

Follow the existing backend modular structure.

Suggested structure:

backend/src/modules/decks/
- deck.model.js
- deck.validation.js
- deck.service.js
- deck.controller.js
- deck.routes.js

backend/src/modules/files/
- file.validation.js
- file.service.js
- file.controller.js
- file.routes.js
- storage.provider.js

The exact structure must match existing repository conventions.

## 8.1 Deck API Endpoints

Implement endpoints equivalent to:

POST /api/decks

Create a deck.

GET /api/decks

List the authenticated user's authorized decks.

GET /api/decks/:deckId

Retrieve a specific authorized deck.

PATCH /api/decks/:deckId

Update an authorized deck.

DELETE /api/decks/:deckId

Delete an authorized deck.

## 8.2 Image API Endpoints

Implement endpoints equivalent to:

POST /api/decks/:deckId/images

Upload photographs to a deck.

GET /api/decks/:deckId/images

List photographs associated with a deck.

GET /api/decks/:deckId/images/:imageId

Retrieve an authorized photograph or secure image-access reference.

DELETE /api/decks/:deckId/images/:imageId

Delete a photograph.

These endpoints must follow existing API naming and versioning conventions.

## 8.3 Backend Requirements

Implement:

- Authentication middleware.
- Role authorization.
- Ownership verification.
- Contractor approval checks.
- Request validation.
- File validation.
- Centralized error handling.
- Consistent API response structure.
- Safe database operations.
- Secure upload processing.
- Logging without exposing sensitive information.

Never trust ownerId, role, or account status supplied by the frontend.

Derive identity and authorization from the authenticated server-side session or token.

# 9. FRONTEND IMPLEMENTATION

Integrate with the existing React + Vite application.

Suggested pages:

- Deck List Page.
- Create Deck Page.
- Edit Deck Page.
- Deck Details Page.
- Photograph Upload Component.
- Photograph Preview Component.

Suggested reusable components:

- ProjectInformationForm.
- LocationForm.
- DeckMeasurementForm.
- DeckShapeSelector.
- DeckStructureForm.
- SurfaceInformationForm.
- ConditionSelector.
- ImageUploader.
- ImageGallery.
- DeckReviewSummary.

Requirements:

- Reuse the existing authentication context.
- Use existing route protection.
- Provide role-aware access.
- Use a consistent UI design system.
- Support mobile, tablet, and desktop.
- Implement loading, empty, error, and success states.
- Prevent duplicate submissions.
- Ensure frontend validation complements, but never replaces, backend validation.

Customer and Contractor interfaces may share reusable components, but their permissions and data access must remain separate.

# 10. SECURITY REQUIREMENTS

Security is mandatory.

Implement and verify:

1. Authentication on all protected deck endpoints.
2. Role-based authorization.
3. Customer ownership checks.
4. Contractor ownership and authorization checks.
5. Approved-contractor restrictions.
6. Server-side input validation.
7. Mass-assignment protection.
8. Protected ownerId and system fields.
9. Secure image upload validation.
10. File size and upload count limits.
11. Private image access.
12. Secure storage credentials.
13. Safe deletion and cleanup.
14. Protection against path traversal.
15. Protection against unauthorized resource enumeration.
16. Safe error messages.
17. Rate limiting for upload endpoints.
18. Logging of relevant security failures.

Test horizontal privilege escalation:

A Customer A must never access Customer B's deck or photographs by changing IDs in API requests.

Test the equivalent scenario for Contractors.

# 11. TESTING REQUIREMENTS

All relevant tests must be implemented and executed.

## 11.1 Deck CRUD Tests

- Create a deck successfully.
- Reject invalid input.
- Reject missing mandatory fields.
- Reject invalid dimensions.
- Retrieve authorized deck records.
- Reject unauthorized deck access.
- Update an authorized deck.
- Reject unauthorized updates.
- Delete an authorized deck.
- Reject unauthorized deletion.
- Verify ownership is preserved.
- Verify pagination.

## 11.2 Role-Based Access Tests

Customer:

- Can create and manage own decks.
- Cannot access another customer's decks.
- Cannot access contractor-only resources.
- Cannot access admin-only resources.

Contractor:

- Approved contractor can perform authorized operations.
- Pending contractor is blocked from restricted operations.
- Rejected contractor is blocked from restricted operations.
- Cannot access another contractor's private records.
- Cannot access unrelated customer records.

Admin:

- Existing Admin authorization remains protected.
- Public users cannot access administrative operations.

## 11.3 File Upload Tests

- Upload valid JPEG.
- Upload valid PNG.
- Upload valid WebP.
- Reject unsupported formats.
- Reject oversized files.
- Reject excessive image counts.
- Reject invalid file contents.
- Verify uploaded metadata.
- Verify image ownership.
- Reject unauthorized image access.
- Delete image successfully.
- Handle storage failures.
- Verify no permanent orphaned metadata or files.

## 11.4 Frontend Tests

- Form rendering.
- Required field validation.
- Conditional fields.
- Measurement calculation.
- Save and edit workflows.
- Image preview.
- Upload progress.
- Error handling.
- Responsive behavior.
- Role-specific access.

## 11.5 Regression Tests

Run all existing authentication and authorization tests from Phase 3.

Phase 4 must not break previously approved functionality.

# 12. PHASE 4 OUT OF SCOPE

The following must NOT be implemented in Phase 4:

- Material catalog management.
- Service catalog management.
- Pricing formulas.
- Material quantity calculations for estimates.
- Labor cost calculations.
- Tax calculations.
- Travel charge calculations.
- Minimum project price calculations.
- Estimate generation.
- PDF estimate generation.
- AI image classification.
- AI condition analysis.
- Contractor lead assignment.
- Contractor discounts.
- Commission management.
- Admin analytics dashboard.

These belong to later phases.

Phase 4 must collect and securely maintain the input data required by those future modules.

# 13. FUTURE PHASE INTEGRATION REQUIREMENTS

Although future functionality must not be implemented now, Phase 4 data structures must support future integration.

## Phase 5 Integration

Deck surface and project information should be compatible with future material and service catalog selection.

Do not implement catalog logic now.

## Phase 6 Integration

Deck dimensions and measurements must be stored consistently so the pricing engine can consume them.

The pricing engine must not be developed now.

## Phase 7 Integration

Uploaded photographs must be accessible through secure references for future AI image analysis.

Do not implement AI processing now.

## Phase 8 Integration

Deck records must be structured so future lead creation and contractor assignment can reference them.

Do not implement lead assignment now.

# 14. ACCEPTANCE CRITERIA

Phase 4 can be marked Complete only when all applicable criteria below are satisfied.

### Deck Information

- [ ] Customer can create a deck.
- [ ] Contractor can create an authorized deck.
- [ ] All approved input sections are implemented.
- [ ] Required field validations work.
- [ ] Measurement validation works.
- [ ] Supported deck shapes are handled correctly.
- [ ] Incomplete measurements are handled safely.
- [ ] Users can view their authorized records.
- [ ] Users can edit their authorized records.
- [ ] Users can delete their authorized records.
- [ ] Multiple deck records are supported.

### File Uploads

- [ ] Multiple images can be uploaded.
- [ ] File type validation works.
- [ ] File size validation works.
- [ ] Upload count limits work.
- [ ] Image metadata is stored correctly.
- [ ] Actual image files are stored securely.
- [ ] Private image access is enforced.
- [ ] Unauthorized image access is blocked.
- [ ] Image deletion works.
- [ ] Storage failure handling is implemented.

### Security

- [ ] Authentication is enforced.
- [ ] Role-based authorization is enforced.
- [ ] Customer ownership isolation is tested.
- [ ] Contractor authorization isolation is tested.
- [ ] Pending contractors are restricted appropriately.
- [ ] Mass-assignment protection is tested.
- [ ] File upload security tests pass.

### Frontend and Backend

- [ ] All required frontend screens work.
- [ ] All required API endpoints work.
- [ ] Backend validation is implemented.
- [ ] Error handling is consistent.
- [ ] Responsive UI is verified.
- [ ] Existing Phase 3 functionality remains functional.

### Quality Assurance

- [ ] Unit tests pass.
- [ ] Integration tests pass.
- [ ] Relevant frontend tests pass.
- [ ] Regression tests pass.
- [ ] Production build succeeds.
- [ ] No unresolved critical or high-severity issues remain.

# 15. REQUIRED COMPLETION REPORT

After implementation and testing, create:

CompletionReviews/Phase-04-Review.md

The report must include:

1. Phase objective.
2. Original requirements from this document.
3. Implementation summary.
4. Customer functionality.
5. Contractor functionality.
6. Admin authorization considerations.
7. Frontend implementation.
8. Backend implementation.
9. Database schema and indexes.
10. File storage implementation.
11. Security implementation.
12. Files created and modified.
13. API endpoints.
14. Test commands executed.
15. Actual test results.
16. Acceptance criteria checklist.
17. Screenshots or other verification evidence where useful.
18. Known issues and pending requirements.
19. Future phase dependencies.
20. Final status: Complete or Incomplete.

Do not claim completion without implementation and test evidence.

# 16. MANDATORY DEVELOPMENT RULES

Follow these instructions strictly:

1. Read this complete document before starting Phase 4.
2. Inspect the existing repository and approved Phase 1–3 implementation.
3. Reuse existing models, middleware, utilities, and architecture wherever appropriate.
4. Do not unnecessarily rewrite approved Phase 1–3 code.
5. Do not invent unapproved business rules.
6. Identify unclear requirements and ask for clarification.
7. Implement Phase 4 end-to-end.
8. Execute and verify the required tests.
9. Fix failures before reporting completion.
10. Create CompletionReviews/Phase-04-Review.md.
11. Stop after producing the review report.
12. Wait for explicit user approval.
13. Do not start Phase 5 without approval.

---

# FINAL DEVELOPMENT WORKFLOW

READ PHASE 4 DOCUMENTATION  
↓  
INSPECT EXISTING PROJECT  
↓  
PLAN IMPLEMENTATION  
↓  
DEVELOP FRONTEND  
↓  
DEVELOP BACKEND  
↓  
IMPLEMENT DATABASE AND FILE STORAGE  
↓  
INTEGRATE ALL PHASE 4 MODULES  
↓  
TEST ALL FUNCTIONALITY  
↓  
FIX AND RETEST ISSUES  
↓  
CREATE PHASE-04-REVIEW.md  
↓  
STOP AND WAIT FOR USER APPROVAL

**Phase 4 is complete only when every applicable acceptance criterion is satisfied and the user explicitly approves the completion report.**