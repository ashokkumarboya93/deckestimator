module.exports = function getSection4RoleMatrix() {
  return `## Section 4: Role-Based API Testing Matrix

Deck Estimator enforces strict Role-Based Access Control (RBAC) via the \`authorize\` and \`requireApprovedContractor\` middleware.

### 4.1 Permitted Role Access Overview

| Module / Scope | Public / Guest | Customer | Contractor (Pending) | Contractor (Approved) | Administrator |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **System Health & Public Settings** | **ALLOWED** | **ALLOWED** | **ALLOWED** | **ALLOWED** | **ALLOWED** |
| **User Registration & Login** | **ALLOWED** | **ALLOWED** | **ALLOWED** | **ALLOWED** | **ALLOWED** |
| **Own Profile & Password** | BLOCKED (401) | **ALLOWED** | **ALLOWED** | **ALLOWED** | **ALLOWED** |
| **Customer Decks CRUD** | BLOCKED (401) | **ALLOWED (Own)**| BLOCKED (403) | **ALLOWED (Assigned)**| **ALLOWED (All)** |
| **Deck Photo Upload & View** | BLOCKED (401) | **ALLOWED (Own)**| BLOCKED (403) | **ALLOWED (Assigned)**| **ALLOWED (All)** |
| **Catalog Viewing (Active)** | BLOCKED (401) | **ALLOWED** | **ALLOWED** | **ALLOWED** | **ALLOWED** |
| **Catalog Management (CRUD)** | BLOCKED (401) | BLOCKED (403) | BLOCKED (403) | BLOCKED (403) | **ALLOWED** |
| **Pricing Config Management**| BLOCKED (401) | BLOCKED (403) | BLOCKED (403) | BLOCKED (403) | **ALLOWED** |
| **Estimate Creation & View** | BLOCKED (401) | **ALLOWED (Own)**| BLOCKED (403) | **ALLOWED (Assigned)**| **ALLOWED (All)** |
| **AI Condition Analysis** | BLOCKED (401) | **ALLOWED (Own)**| BLOCKED (403) | **ALLOWED (Assigned)**| **ALLOWED (All)** |
| **Contractor Profile & Submit**| BLOCKED (401) | BLOCKED (403) | **ALLOWED** | **ALLOWED** | **ALLOWED** |
| **Contractor Verification Review**| BLOCKED (401)| BLOCKED (403) | BLOCKED (403) | BLOCKED (403) | **ALLOWED** |
| **Submit Customer Lead** | BLOCKED (401) | **ALLOWED** | BLOCKED (403) | BLOCKED (403) | **ALLOWED** |
| **Contractor Lead Inbox** | BLOCKED (401) | BLOCKED (403) | BLOCKED (403) | **ALLOWED (Assigned)**| **ALLOWED (All)** |
| **Lead Assignment & Close** | BLOCKED (401) | BLOCKED (403) | BLOCKED (403) | BLOCKED (403) | **ALLOWED** |
| **Contractor Discounts View**| BLOCKED (401) | BLOCKED (403) | BLOCKED (403) | **ALLOWED** | **ALLOWED** |
| **Discount Policy CRUD** | BLOCKED (401) | BLOCKED (403) | BLOCKED (403) | BLOCKED (403) | **ALLOWED** |
| **Contractor Earnings View** | BLOCKED (401) | BLOCKED (403) | BLOCKED (403) | **ALLOWED (Own)** | **ALLOWED (All)** |
| **Commission Approval & Payout**| BLOCKED (401)| BLOCKED (403) | BLOCKED (403) | BLOCKED (403) | **ALLOWED** |
| **Admin Operations Dashboard**| BLOCKED (401) | BLOCKED (403) | BLOCKED (403) | BLOCKED (403) | **ALLOWED** |
| **Forensic Audit Logs & Reports**| BLOCKED (401)| BLOCKED (403) | BLOCKED (403) | BLOCKED (403) | **ALLOWED** |

---

### 4.2 Essential Negative Cross-Role Test Scenarios

Always execute these negative tests in Postman to confirm security boundary enforcement:

#### Test A: Customer Attempting Admin Route (Privilege Escalation)
- **Request:** \`GET {{baseUrl}}/admin/dashboard/summary\`
- **Header:** \`Authorization: Bearer {{customerToken}}\`
- **Expected Result:** HTTP **\`403 Forbidden\`**
- **Expected Payload:**
  \`\`\`json
  {
    "success": false,
    "error": {
      "code": "FORBIDDEN",
      "message": "You do not have permission to perform this action."
    }
  }
  \`\`\`

#### Test B: Unverified / Pending Contractor Accessing Lead Inbox
- **Request:** \`GET {{baseUrl}}/leads/contractor/inbox\`
- **Header:** \`Authorization: Bearer {{pendingContractorToken}}\`
- **Expected Result:** HTTP **\`403 Forbidden\`**
- **Expected Payload:**
  \`\`\`json
  {
    "success": false,
    "error": {
      "code": "CONTRACTOR_NOT_VERIFIED",
      "message": "Your contractor account is pending administrative verification."
    }
  }
  \`\`\`

#### Test C: Contractor B Attempting to View Contractor A's Commission (Horizontal IDOR)
- **Request:** \`GET {{baseUrl}}/commissions/{{contractorA_commissionId}}\`
- **Header:** \`Authorization: Bearer {{contractorB_Token}}\`
- **Expected Result:** HTTP **\`404 Not Found\`** or **\`403 Forbidden\`** (Prevents sensitive financial exposure)

#### Test D: Unassigned Contractor Accessing Homeowner Deck Images
- **Request:** \`GET {{baseUrl}}/decks/{{homeowner_deckId}}/images\`
- **Header:** \`Authorization: Bearer {{unassignedContractorToken}}\`
- **Expected Result:** HTTP **\`403 Forbidden\`** (Private property isolation enforced)

#### Test E: Unauthenticated Access to Protected Resources
- **Request:** \`GET {{baseUrl}}/users/me\`
- **Header:** *(No Authorization header)*
- **Expected Result:** HTTP **\`401 Unauthorized\`**

#### Test F: Suspended User Attempting Access with Valid JWT (Session Revocation)
- **Preparation:** Admin suspends customer account via \`PATCH {{baseUrl}}/admin/users/:id/status\` (\`status: "suspended"\`).
- **Request:** Customer attempts \`GET {{baseUrl}}/decks\` using their unexpired JWT.
- **Expected Result:** HTTP **\`401 Unauthorized\`** / **\`403 Forbidden\`** (Middleware checks database status on every call).

---
`;
};

