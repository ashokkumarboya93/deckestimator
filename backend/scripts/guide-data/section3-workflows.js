module.exports = function getSection3Workflows() {
  return `## Section 3: Phase-Wise Workflow Dependencies & Testing Sequences

To perform realistic manual testing in Postman, APIs must not be tested in isolation. They must follow the lifecycle dependency sequences of the platform.

\`\`\`mermaid
flowchart TD
    W1["Workflow 1: Authentication & Identity Setup"] --> W2["Workflow 2: Deck Creation & Specifications"]
    W2 --> W3["Workflow 3: Secure Photo Upload & Verification"]
    W3 --> W4["Workflow 4: Catalog Inspection & Pricing Estimate"]
    W4 --> W5["Workflow 5: Lead Submission & Quote Inquiry"]
    W5 --> W6["Workflow 6: Contractor Onboarding & Profile"]
    W6 --> W7["Workflow 7: Admin Verification & Contractor Approval"]
    W7 --> W8["Workflow 8: Admin Lead Matching & Assignment"]
    W8 --> W9["Workflow 9: Contractor Inbox & Lead Status Update"]
    W9 --> W10["Workflow 10: Contractor Discount Application"]
    W10 --> W11["Workflow 11: Commission Payout Lifecycle"]
    W11 --> W12["Workflow 12: Admin Audit Trail & Report Export"]
\`\`\`

---

### Workflow 1: Customer Authentication & Profile Verification
1. **POST** \`/api/v1/auth/register\` &rarr; Register customer (\`alice.customer@example.com\`).
2. **POST** \`/api/v1/auth/login\` &rarr; Authenticate customer; store \`customerToken\`.
3. **GET** \`/api/v1/auth/me\` &rarr; Verify active account status and \`customer\` role.
4. **PATCH** \`/api/v1/users/me\` &rarr; Update contact phone number.

### Workflow 2: Deck Project Creation & Specifications Management
1. **Prerequisite:** Active \`customerToken\`.
2. **POST** \`/api/v1/decks\` &rarr; Create deck with 24ft &times; 16ft dimensions; store \`deckId\`.
3. **GET** \`/api/v1/decks/{{deckId}}\` &rarr; Verify computed area equals 384 sq ft.
4. **PATCH** \`/api/v1/decks/{{deckId}}\` &rarr; Update specifications (e.g. rename project or adjust railing length).
5. **GET** \`/api/v1/decks\` &rarr; Confirm deck appears in customer listing.

### Workflow 3: Secure Photo Upload & Private Streaming
1. **Prerequisite:** Existing \`deckId\` and \`customerToken\`.
2. **POST** \`/api/v1/decks/{{deckId}}/images\` &rarr; Upload \`.jpg\` deck photo via multipart/form-data.
3. **GET** \`/api/v1/decks/{{deckId}}/images\` &rarr; Retrieve image list; extract \`imageId\`.
4. **GET** \`/api/v1/decks/{{deckId}}/images/{{imageId}}\` &rarr; Stream binary image in Postman; verify 200 OK.
5. **Cross-User Negative Check:** Authenticate as User B and request User A's image &rarr; Verify HTTP 403 Forbidden.

### Workflow 4: Pricing Engine & Multi-Service Estimate Generation
1. **GET** \`/api/v1/pricing/configurations/active\` &rarr; Fetch active labor rates and floor price.
2. **GET** \`/api/v1/catalog/materials?surface=wood\` &rarr; Select compatible stain material; store \`materialId\`.
3. **GET** \`/api/v1/catalog/services\` &rarr; Select prep/wash service; store \`serviceId\`.
4. **POST** \`/api/v1/estimates\` &rarr; Submit \`deckId\`, \`materialId\`, \`serviceId\`, \`numberOfCoats: 2\`; store \`estimateId\`.
5. **GET** \`/api/v1/estimates/{{estimateId}}\` &rarr; Verify calculated materials, services, labor, tax, and total.

### Workflow 5: Lead Submission & Quote Inquiry
1. **POST** \`/api/v1/leads\` &rarr; Submit customer inquiry with \`deckId\` and \`estimateId\`; store \`leadId\`.
2. **GET** \`/api/v1/leads/my-leads\` &rarr; Verify lead is in \`new\` status.

### Workflow 6: Contractor Onboarding & Verification Submission
1. **POST** \`/api/v1/auth/register\` &rarr; Register with \`role: "contractor"\` + business details.
2. **POST** \`/api/v1/auth/login\` &rarr; Authenticate contractor; store \`contractorToken\`.
3. **GET** \`/api/v1/contractors/me\` &rarr; Verify \`verificationStatus\` is \`PENDING\`.
4. **POST** \`/api/v1/contractors/me/verification/submit\` &rarr; Submit trade license and insurance details.
5. **POST** \`/api/v1/contractors/me/verification/documents\` &rarr; Upload insurance policy PDF.

### Workflow 7: Admin Verification Review & Approval
1. **POST** \`/api/v1/auth/login\` &rarr; Authenticate as \`admin@deckestimator.com\`; store \`adminToken\`.
2. **GET** \`/api/v1/contractors/admin/verifications?status=PENDING\` &rarr; Locate contractor verification application.
3. **POST** \`/api/v1/contractors/admin/verifications/{{contractorId}}/review\` &rarr; Submit approval action: \`"approve"\`.
4. **Verification:** Contractor \`GET /api/v1/contractors/me\` now returns \`verificationStatus: "approved"\`.

### Workflow 8: Admin Lead Matching & Assignment
1. **GET** \`/api/v1/leads/admin/all\` &rarr; Admin views inbound lead queue; identifies \`leadId\`.
2. **GET** \`/api/v1/contractors/eligible\` &rarr; Admin views list of verified local contractors.
3. **POST** \`/api/v1/leads/admin/{{leadId}}/assign\` &rarr; Assign lead to contractor.

### Workflow 9: Contractor Inbox & Lead Progression
1. **GET** \`/api/v1/leads/contractor/inbox\` &rarr; Contractor sees assigned lead.
2. **POST** \`/api/v1/leads/contractor/{{leadId}}/accept\` &rarr; Contractor accepts lead (\`status\` becomes \`accepted\`).
3. **PATCH** \`/api/v1/leads/contractor/{{leadId}}/status\` &rarr; Progress status: \`contacted\` &rarr; \`scheduled\` &rarr; \`won\`.

### Workflow 10: Contractor Partner Discount Application
1. **GET** \`/api/v1/discounts/contractor\` &rarr; Contractor retrieves assigned discount policy.
2. **POST** \`/api/v1/discounts/estimates/{{estimateId}}/apply\` &rarr; Apply discount to estimate.
3. **GET** \`/api/v1/estimates/{{estimateId}}\` &rarr; Verify discount deducted from final customer total.

### Workflow 11: Commission Generation, Approval & Payout
1. **Prerequisite:** Lead must be marked as \`won\` or \`completed\`.
2. **POST** \`/api/v1/commissions/admin/generate\` &rarr; Admin generates commission record from \`leadId\`; store \`commissionId\`.
3. **POST** \`/api/v1/commissions/admin/{{commissionId}}/review\` &rarr; Action \`APPROVE\` &rarr; Action \`SET_PAYABLE\`.
4. **POST** \`/api/v1/commissions/admin/{{commissionId}}/record-payment\` &rarr; Record payment reference \`ACH-998811\`.
5. **Idempotency Negative Test:** Re-submit payment recording &rarr; Expect HTTP 409 Conflict (Duplicate payment blocked).
6. **GET** \`/api/v1/commissions/summary\` &rarr; Contractor verifies updated \`paidAmount\` balance.

### Workflow 12: Admin Forensic Audit Trail & Report Export
1. **GET** \`/api/v1/admin/audit-logs?entityType=COMMISSION\` &rarr; Verify immutable payment record in audit log.
2. **GET** \`/api/v1/admin/reports/commissions?format=csv\` &rarr; Download CSV financial ledger.

---
`;
};

