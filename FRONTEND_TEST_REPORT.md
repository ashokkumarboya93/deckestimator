# Deck Estimator Frontend Test Report

**Assessment date:** 11 November 2026  
**Frontend rating:** **5/10**  
**Scope:** Read-only review of the React/Vite frontend, production build, lint output, dependency audit, route guards, API client, report generation, and browser-facing links. No frontend source code was changed.

## Executive result

The frontend builds successfully and `npm audit` reported no known dependency vulnerabilities. Authentication state is kept in React memory while the backend cookie is used for requests, and the route guards provide useful user experience protection.

The score is held to 5/10 by deployment correctness, data-handling, and maintainability risks: multiple admin API/export paths are hard-coded to `http://localhost:5000`, report generation writes record data directly into `innerHTML`, the main JavaScript bundle is very large, and lint reports a substantial warning set. These issues can cause production failures and, in the report generator, create a client-side injection risk when untrusted record fields reach the export function.

## Test results

| Check | Result | Meaning |
|---|---|---|
| `npm run build` | PASS | Vite transformed 311 modules and produced a production build. Vite warned about a large chunk. |
| `npm run lint` | PASS with warnings | Oxlint completed, but reports unused imports/variables, hook dependency issues, state-in-effect warnings, and purity warnings. |
| `npm audit --json` | PASS | 0 known vulnerabilities reported for the frontend dependency tree at test time. |
| Automated frontend unit/E2E suite | NOT PRESENT | `package.json` has no test script and no frontend test runner was found in the reviewed package configuration. |
| Runtime browser workflow | NOT EXECUTED | A running backend, database, and test credentials were not available as part of this read-only assessment. |

## Findings

### 1. High — Hard-coded localhost API URLs break deployment and can expose the wrong origin

**Evidence:** `src/features/admin/components/AdminLayout.jsx` lines 99 and 108; `src/features/admin/api/adminApi.js` lines 54, 90, 93, 106, 109, and 266; `src/features/admin/pages/AdminLeadManagementPage.jsx` line 169. Several requests and export links use `http://localhost:5000` directly. Other code uses `import.meta.env.VITE_API_URL` or the shared client.

**Impact:** In staging or production, admin dashboard counts, exports, catalog image URLs, and related actions can call the visitor's own computer instead of the deployed API. If the site is HTTPS, browser mixed-content rules may block these requests. The inconsistent origin also makes cookie, CORS, and audit behavior difficult to reason about.

**Recommended solution:** Centralize all API and file URLs through one environment-aware URL builder or the shared API client. Define a production `VITE_API_URL` and fail the build or show a clear configuration error when it is missing. Do not assemble privileged export links from hard-coded localhost values.

### 2. High — PDF report generation inserts data into `innerHTML` without escaping

**Evidence:** `src/utils/reportExport.js` line 253 assigns a large template string to `reportElement.innerHTML`. The template interpolates values such as customer name, email, address, estimate reference, descriptions, and other estimate fields. No HTML escaping helper is visible before interpolation.

**Impact:** If a record contains HTML-like content, it can be interpreted as markup in the browser DOM while generating a PDF. Depending on the exact field and browser behavior, this can alter the generated report or create a client-side injection/XSS path in the user's session. This is especially relevant for customer-entered names, descriptions, notes, and imported lead data.

**Recommended solution:** Escape every untrusted value before placing it in an HTML template, or build the report with DOM APIs/text nodes rather than string concatenation. Treat image URLs separately: allow only expected schemes and trusted origins, and reject `javascript:`, `data:` where not required, and unexpected external URLs. Add tests with HTML payloads in every exported field.

### 3. Medium — Export and document links do not consistently use the configured API origin

**Evidence:** Admin export URLs are built from localhost strings. Document links such as `/api/v1/contractors/documents/.../file` rely on the current frontend origin, while the shared API client may target a separate backend origin.

**Impact:** Downloads may work in local development but fail when frontend and backend are hosted separately. Users may be sent to a frontend server that has no API route, or cookies may not accompany a cross-origin navigation as expected. This creates broken privileged workflows and difficult-to-diagnose authorization failures.

**Recommended solution:** Use one environment-aware API origin for API calls, document links, and exports. For protected downloads, prefer an authenticated fetch that handles the response as a blob or a short-lived signed URL generated by the backend. Verify cross-origin cookie behavior in the deployed browser configuration.

### 4. Medium — No frontend automated test suite is defined

**Evidence:** `frontend/package.json` defines `dev`, `build`, `lint`, and `preview`, but no `test` script or test dependency. The reviewed frontend tree does not show a dedicated unit or browser E2E setup.

**Impact:** Route-guard regressions, API-origin mistakes, failed loading/error states, export behavior, and role-specific navigation can reach production without a repeatable check. A successful build only proves that the bundle compiles.

**Recommended solution:** Add focused tests for `apiClient`, auth initialization/login/logout, route guards for customer/contractor/admin/pending contractor states, API error handling, upload and export URL construction, and report escaping. Add a small browser smoke suite covering login, logout, protected-route redirects, and one export/download path per role.

### 5. Medium — Very large initial bundle and asset payload

**Evidence:** The build produced `dist/assets/index-6ZbOl0AT.js` at approximately 2.47 MB minified, with a Vite warning for chunks over 500 kB. The generated `dist` tree was approximately 35.6 MB and included several multi-megabyte images.

**Impact:** Slow first load, increased mobile data use, longer parsing/execution time, and a larger time window for failed or abandoned navigation. Large image downloads also increase CDN and hosting cost.

**Recommended solution:** Route-level lazy loading with dynamic imports, split admin/contractor/customer feature bundles, compress and resize source images, use responsive image variants, and add a performance budget to CI. Keep only assets needed for the current route in the initial chunk.

### 6. Medium — Lint warnings indicate likely lifecycle and stale-data defects

**Evidence:** `npm run lint` completed with warnings including missing React hook dependencies, synchronous state updates inside effects, impure `Date.now()` use during render, recursive callback initialization, and many unused variables/imports. Examples include `ContractorDiscountsEarningsPage.jsx`, `ContractorLeadsPage.jsx`, `ContractorProjectsPage.jsx`, `ContractorProfilePage.jsx`, and `ContinuousEstimatorForm.jsx`.

**Impact:** Missing dependencies can leave screens showing stale API data or fail to refresh after user changes. State updates in effects can cause extra renders or loops. Unused and compatibility code makes it harder to detect real defects and increases bundle size.

**Recommended solution:** Make lint warning-free in CI. Review every hook dependency warning rather than blindly suppressing it, move derived values into render-time calculations where appropriate, and split large components into smaller tested units.

### 7. Low — External image/font dependencies create privacy, availability, and supply-chain considerations

**Evidence:** Multiple pages reference Unsplash images and Google Fonts from external origins, including `index.html` and page-level background/image URLs.

**Impact:** Page rendering depends on third-party availability and sends browser requests and metadata to those services. Remote content can change, disappear, or be blocked by network policy. It also complicates a strict Content Security Policy.

**Recommended solution:** Self-host critical fonts and production imagery where licensing permits, or define an explicit asset policy and CSP allowlist. Add local fallbacks and avoid sending sensitive user data in third-party image URLs.

### 8. Low — New-tab links should use an explicit opener-safe relationship

**Evidence:** Several pages open links with `target="_blank"`; some use `rel="noreferrer"`, while the repository does not show a consistent `rel="noopener noreferrer"` policy.

**Impact:** Modern browsers commonly imply `noopener`, but relying on browser behavior is less explicit and can leave opener risks in older or embedded environments. This is more relevant for links whose destination can change.

**Recommended solution:** Use `rel="noopener noreferrer"` on every externally opened tab, and avoid opening user-controlled URLs without strict allowlisting.

## Positive controls observed

- The shared API client uses `credentials: 'include'` and does not store JWTs in `localStorage` or `sessionStorage`.
- React route guards distinguish authentication, role, contractor approval, and admin access for navigation.
- The build uses Vite production bundling and completes successfully.
- The dependency audit reported zero known vulnerabilities.
- No `dangerouslySetInnerHTML` use was found; the report generator's direct DOM `innerHTML` assignment is the exception requiring review.

## Priority remediation plan

1. Remove every hard-coded localhost API URL and centralize URL construction.
2. Escape or DOM-build every value inserted by `reportExport.js`; add malicious-input tests.
3. Add frontend unit and browser smoke tests for auth, guards, API errors, exports, and downloads.
4. Make lint warning-free and review hook dependency warnings for stale data.
5. Split route bundles and optimize the largest image assets.
6. Apply an explicit safe-link policy and decide whether external fonts/images should be self-hosted.

## Limitations

This report is based on source and local build checks. It does not establish the behavior of the deployed origin, browser security headers, CDN, reverse proxy, backend authorization, database, or real user workflows. The frontend rating should be revisited after the high-severity URL and report-generation findings are remediated and browser tests run against a staging environment.

