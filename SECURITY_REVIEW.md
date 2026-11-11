# Deck Estimator Security Review

**Assessment date:** 11 November 2026  
**Overall score:** **2/10**  
**Scope:** Read-only source review of the React/Vite frontend and Express/Mongoose backend, plus dependency audits using the committed lockfiles. This is not a full penetration test: no production environment, live API, database, or deployment configuration was assessed.

## Executive summary

The review found a critical authentication weakness: two hard-coded passwords are accepted for administrator accounts by both login paths. It also found a default password used when creating child administrator accounts and a registration policy that permits two-character passwords. These issues should be addressed before exposing the application to untrusted users.

The project has useful security controls, including role checks on admin routes, account-status checks during authentication, endpoint rate limiting, request validation, and content-signature checks for deck image uploads. `npm audit` reported no known vulnerabilities for either dependency tree at the time of review. Those controls do not mitigate the hard-coded credentials.

## Findings

### 1. Critical — Hard-coded administrator passwords accepted at login

**Evidence:** `backend/src/modules/auth/auth.service.js`, lines 127–131 and 171–175. Both `loginAdmin` and `loginUser` treat `AdminPass123!` or `Admin@123456` as a successful password for any admin account if the submitted password does not match its stored hash.

**Impact:** Anyone who knows either string and can identify an administrator email can obtain a valid admin session, bypassing the administrator's actual password. The regular login route has the same bypass, so restricting access to the dedicated admin login page does not remove the risk. Successful use also replaces the stored password hash with the fallback password, which may lock out the legitimate administrator.

**Recommended solution:** Remove both fallback branches completely. Authenticate only by comparing the submitted password with the stored password hash. Review administrator account activity and reset credentials for every admin account that may have been exposed. If temporary account recovery is required, use a one-time, short-lived reset token delivered through a verified channel; never accept a shared password in the login flow.

### 2. High — Child administrator accounts receive a predictable default password

**Evidence:** `backend/src/modules/admin/admin.service.js`, lines 2827–2829. When a password is omitted, the new admin account is assigned `DeckAdmin2026!`.

**Impact:** If the account creator omits a password or the creation request permits omission, the account is created with a password embedded in source code. Anyone who learns the default can attempt to sign in as the new administrator. There is no forced first-login password change visible in this flow.

**Recommended solution:** Require a password that meets the account password policy, or create the account in a pending state and send a single-use invitation/reset link. Do not create an active admin account with a shared default password. Invalidate any accounts that were provisioned with this default and issue new credentials through a verified channel.

### 3. High — Registration accepts passwords as short as two characters

**Evidence:** `backend/src/modules/auth/auth.validation.js`, lines 21–26. Registration requires only two characters plus one uppercase letter and one digit; for example, a short pattern such as `A1` can satisfy the stated rules.

**Impact:** Short passwords are much easier to guess or crack after a credential database exposure. Rate limiting reduces online attempts but cannot make weak stored credentials safe against offline cracking.

**Recommended solution:** Set a substantially stronger minimum length (commonly at least 12 characters for user-chosen passwords), allow long passphrases, and avoid relying on composition rules as the main strength measure. Apply the same server-side policy to registration, password changes, and administrator creation. Consider checking new passwords against known compromised-password lists.

### 4. Medium — Large request-body limits increase resource-exhaustion exposure

**Evidence:** `backend/src/app.js`, lines 28–29, configures both JSON and URL-encoded parsers with a 50 MB limit.

**Impact:** An unauthenticated client can send large bodies to API endpoints and cause avoidable memory, CPU, or bandwidth consumption. The general API rate limiter helps but does not prevent a small number of large concurrent requests from consuming resources.

**Recommended solution:** Set a much smaller global JSON/form limit appropriate to ordinary API payloads. Apply larger limits only to routes that need them, and prefer streaming upload handling for large files. Enforce request timeouts and body-size limits at the reverse proxy/load balancer as well.

### 5. Medium — Cross-site authentication cookie needs explicit CSRF protection review

**Evidence:** `backend/src/modules/auth/auth.controller.js`, lines 8–13, sets the production auth cookie with `SameSite=None` and `Secure`. `backend/src/app.js` enables credentialed CORS. The inspected application middleware does not show a CSRF token check.

**Impact:** `SameSite=None` allows the browser to attach the cookie to cross-site requests. If an attacker can cause a victim's browser to submit a state-changing request, cookie-based authentication may allow that action unless other route-specific defenses are in place. CORS restricts which scripts can read responses; it is not, by itself, a complete CSRF defense.

**Recommended solution:** Confirm the actual frontend/API origin arrangement. Where possible, use `SameSite=Lax` or `Strict`. If cross-site cookies are required, add a robust CSRF defense for state-changing routes (such as a validated CSRF token and Origin/Referer checks), keep the allowed CORS origin list exact, and ensure all state changes use non-GET methods. This needs deployment-level verification before choosing cookie settings.

### 6. Low / deployment-dependent — `/uploads` is mounted as a public static directory

**Evidence:** `backend/src/app.js`, line 31, serves the backend uploads directory with `express.static`. Deck-image API routes require authentication and authorize access to the deck, but static URLs do not pass through those route checks.

**Impact:** Files under the served directory may be fetched directly by anyone who learns or guesses a URL. The impact depends on which files are placed there and whether paths are predictable. Stored contractor documents use a separate directory in the storage adapter, but deployment and static-path behavior should still be checked.

**Recommended solution:** Do not put private documents or user-restricted images under a public static mount. Serve private files through authenticated, authorization-checked handlers or issue short-lived signed URLs. Keep only intentionally public assets in a public directory and use opaque identifiers for any public files.

## Positive controls observed

- Admin routes use authentication and an admin-role authorization guard (`backend/src/modules/admin/admin.routes.js`).
- Authentication checks whether the user still exists and blocks suspended or disabled accounts (`backend/src/middleware/authenticate.js`).
- API and authentication routes have rate limiters (`backend/src/middleware/rateLimiters.js`).
- Public registration restricts the role to customer or contractor (`backend/src/modules/auth/auth.validation.js`).
- Deck image uploads are size/count limited and validate file signatures after upload (`backend/src/modules/files/file.routes.js`, `backend/src/modules/files/file.validation.js`).
- `.env` files are ignored by Git; no tracked root, backend, or frontend `.env` file was found in this review.
- Helmet is enabled and the CORS allowlist is configured from `CORS_ORIGIN` (`backend/src/app.js`, `backend/src/config/cors.js`).

## Checks performed

- Read-only inspection of authentication, authorization, validation, upload/storage, CORS, error handling, application middleware, and configuration code.
- `npm audit --json` in `backend`: 0 reported vulnerabilities across the audited dependency tree.
- `npm audit --json` in `frontend`: 0 reported vulnerabilities across the audited dependency tree.
- Checked Git tracking for `.env` files and confirmed the worktree was clean before creating this report.

Dependency audit results only cover vulnerabilities known to npm at the time of the check and represented by the lockfiles. They do not prove that the deployed application or its configuration is secure.

## Suggested remediation order

1. Remove the hard-coded admin login passwords and rotate/recover potentially exposed admin credentials.
2. Remove the default child-admin password and require a secure invitation or explicit password flow.
3. Strengthen and consistently enforce the password policy.
4. Review CSRF controls and cookie/origin configuration for the actual production deployment.
5. Reduce parser body limits and verify that private uploads cannot be fetched through a public URL.
6. After remediation, run authenticated and unauthenticated API tests in a non-production environment, including role-boundary, CSRF, upload, and resource-limit cases.

