module.exports = function getSection2Phase11To12() {
  return `### Phase 11: Integration, Security and Quality Assurance

- **Status:** Complete (Hardened, Tested, and Verified).
- **Associated Dedicated API Endpoints:** None (Cross-cutting middleware and security hardening).
- **Implementation & Hardening Overview:**
  Phase 11 did not introduce new standalone endpoints; rather, it hardened the entire API surface across all previous phases against OWASP Top 10 risks:
  1. **Inactive User Session Revocation:** \`backend/src/middleware/authenticate.js\` actively checks user status in MongoDB, immediately rejecting suspended or deactivated users even if their JWT has not expired.
  2. **Atomic Commission Payment Concurrency:** \`backend/src/modules/commissions/commission.service.js\` executes an atomic conditional update preventing double-payout race conditions.
  3. **IDOR & Contractor Deck Isolation:** File serving and deck detail routes enforce strict ownership and assignment checks, preventing unassigned contractors from accessing private homeowner deck images.
  4. **Dynamic Rate Limiting:** \`backend/src/middleware/rateLimiters.js\` enforces strict production ceilings while dynamically scaling thresholds in development to permit automated test suites.
  5. **Mass-Assignment Protection:** User profile updates strictly forbid tampering with \`role\` or \`accountStatus\`.

---

### Phase 12: Deployment, Documentation and Production Readiness

- **Status:** Active / Documentation Phase.
- **Associated Dedicated API Endpoints:** None.
- **Implementation Overview:**
  Phase 12 focuses on production environment configurations, containerization, deployment runbooks, and manual API testing documentation (this guide). All APIs operating in Phase 12 are those documented in Phases 2 through 10.

---
`;
};

