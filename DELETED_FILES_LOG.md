# DeckEstimator — Deleted Files Audit & Cleanup Log

This file tracks all files, assets, and folders removed or relocated during the project structure cleanup.

---

## Batch 1: Root Typo, Scrap & Transient Text Files
**Executed:** November 14, 2026 | **Git Commit:** `18931f1`

| Original File Path | File Size | Action Taken | Current Location / Status | Reason |
| :--- | :---: | :---: | :---: | :--- |
| `tatus` | 488 B | **DELETED** | Permanently Removed | Terminal pager artifact (`less` command help screen dump). Zero code dependency. |
| `DYnamic_Estimator.txt` | 28.0 KB | **DELETED** | Permanently Removed | Stale raw text draft of pricing formulas. Officially maintained in GitHub Markdown KaTeX at [docs/DECK_RESTORATION_PLUS_CALCULATOR_ENGINE_SPECIFICATION.md](file:///E:/DeckEstimator/docs/DECK_RESTORATION_PLUS_CALCULATOR_ENGINE_SPECIFICATION.md). |
| `COMPLETE_DEMO_SCRIPT.txt` | 24.9 KB | **MOVED / PRESERVED** | [docs/COMPLETE_DEMO_SCRIPT.txt](file:///E:/DeckEstimator/docs/COMPLETE_DEMO_SCRIPT.txt) | 477-line spoken presenter walkthrough script across Customer, Contractor, and Admin portals. Relocated to `docs/` to preserve documentation without root clutter. |

---

## Batch 2: Demo Video Recordings & Recording Automation
**Executed:** November 14, 2026 | **Git Commit:** `Pending`

| Original File / Folder Path | File Size | Action Taken | Status | Reason |
| :--- | :---: | :---: | :---: | :--- |
| `videos/video_1_customer_admin.mp4` | 18.28 MB | **DELETED** | Permanently Removed | Old customer & admin video recording. Not served or referenced anywhere by app. |
| `videos/video_2_contractor_admin.mp4` | 9.43 MB | **DELETED** | Permanently Removed | Old contractor verification video recording. Not served by app. |
| `videos/video_3_admin_command_center.mp4` | 9.09 MB | **DELETED** | Permanently Removed | Old admin tour video recording. Not served by app. |
| `videos/` (Folder) | — | **DELETED** | Permanently Removed | Empty folder after removing the 3 MP4 files above. |
| `demo_engine.js` | 13.0 KB | **DELETED** | Permanently Removed | Puppeteer screen recorder harness built solely to record the MP4s. Zero runtime dependency. |
| `demo_video_1_customer_admin.js` | 8.9 KB | **DELETED** | Permanently Removed | Video 1 recording sequence runner. Zero runtime dependency. |
| `demo_video_2_contractor_admin.js` | 8.2 KB | **DELETED** | Permanently Removed | Video 2 recording sequence runner. Zero runtime dependency. |
| `demo_video_3_admin_command_center.js` | 10.2 KB | **DELETED** | Permanently Removed | Video 3 recording sequence runner. Zero runtime dependency. |
| `run_demo_menu.js` | 1.4 KB | **DELETED** | Permanently Removed | Terminal launcher menu for the demo video scripts. |
| `run_interactive_demo.js` | 18.6 KB | **DELETED** | Permanently Removed | Legacy monolithic interactive demo runner. |

---

## Batch 3: Obsolete Root `scratch/` & Root `scripts/`
**Executed:** November 14, 2026 | **Git Commit:** `Pending`

| Original File / Folder Path | File Size | Action Taken | Status | Reason |
| :--- | :---: | :---: | :---: | :--- |
| `scratch/fix_admin.js` | 558 B | **DELETED** | Permanently Removed | One-off admin bcrypt test; bug permanently solved in `auth.service.js`. |
| `scratch/test_addr.js` | 660 B | **DELETED** | Permanently Removed | Ad-hoc user address schema query. Zero runtime dependency. |
| `scratch/test_admin_speed.cjs` | 2.0 KB | **DELETED** | Permanently Removed | One-time admin latency benchmark script. |
| `scratch/test_contractor_portal.js` | 15.7 KB | **DELETED** | Permanently Removed | Standalone contractor tester; superseded by `backend/tests/`. |
| `scratch/test_contractor_speed.cjs` | 2.2 KB | **DELETED** | Permanently Removed | One-time contractor benchmark script. |
| `scratch/test_customer_admin_sync.cjs` | 4.6 KB | **DELETED** | Permanently Removed | Ad-hoc lead sync test script. |
| `scratch/test_endpoints.js` | 2.9 KB | **DELETED** | Permanently Removed | Manual REST smoke test script. |
| `scratch/update_files.js` | 2.1 KB | **DELETED** | Permanently Removed | Migration script for `AdminUserProfilePage.jsx`; changes committed. |
| `scratch/update_lead_page.js` | 14.6 KB | **DELETED** | Permanently Removed | Migration script for `AdminLeadManagementPage.jsx`; changes committed. |
| `scratch/update_verification_page.js` | 81.9 KB | **DELETED** | Permanently Removed | 82 KB string literal duplicate of `AdminVerificationProgressPage.jsx`. |
| `scratch/` (Folder) | — | **DELETED** | Permanently Removed | Empty folder after removing the 10 scratch files above. |
| `scripts/add_admin_endpoints.py` | 1.1 KB | **DELETED** | Permanently Removed | Python regex updater for `endpoints.js`; routes are already in code. |
| `scripts/clean_all_emojis.py` | 4.0 KB | **DELETED** | Permanently Removed | Python emoji cleaner; codebase is already 100% clean of emojis. |
| `scripts/test_contractor_verification_e2e.js` | 11.1 KB | **DELETED** | Permanently Removed | Redundant contractor E2E tester; official tests live in `backend/tests/`. |
| `scripts/update_continuous_estimator.py` | 1.6 KB | **DELETED** | Permanently Removed | Python updater for `ContinuousEstimatorForm.jsx`; changes committed. |
| `scripts/update_customer_dash.py` | 6.6 KB | **DELETED** | Permanently Removed | Python updater for `CustomerDashboardPage.jsx`; changes committed. |
| `scripts/update_cust_estimates.py` | 6.0 KB | **DELETED** | Permanently Removed | Python updater for `CustomerEstimatesPage.jsx`; changes committed. |
| `scripts/update_layouts.py` | 2.2 KB | **DELETED** | Permanently Removed | Python updater for `AdminLayout.jsx`; changes committed. |
| `scripts/update_reg_form.py` | 1.5 KB | **DELETED** | Permanently Removed | Python updater for `RegistrationForm.jsx`; changes committed. |
| `scripts/upgrade_admin_dashboard.py` | 42.8 KB | **DELETED** | Permanently Removed | 43 KB Python generator for `AdminDashboardPage.jsx`; dashboard is live. |
| `scripts/` (Folder) | — | **DELETED** | Permanently Removed | Root folder holding the 9 obsolete helper scripts above. |

---

## Batch 4: Duplicate & Empty Postman Directories
**Executed:** November 14, 2026 | **Git Commit:** `Pending`

| Original File / Folder Path | File Size | Action Taken | Status | Reason |
| :--- | :---: | :---: | :---: | :--- |
| `.postman/resources.yaml` | 353 B | **DELETED** | Permanently Removed | Auto-generated Postman workspace sync stub. Not used. |
| `.postman/Deck_Estimator_API_Testing_Fix_Report.md` | 7.9 KB | **DELETED** | Permanently Removed | Exact duplicate of report in `CompletionReviews/`. |
| `.postman/` (Folder) | — | **DELETED** | Permanently Removed | Empty folder after removing the files above. |
| `postman/globals/workspace.globals.yaml` | 27 B | **DELETED** | Permanently Removed | Empty Postman globals placeholder stub. |
| `postman/collections/` (Folder) | — | **DELETED** | Permanently Removed | Empty folder scaffold. |
| `postman/documents/` (Folder) | — | **DELETED** | Permanently Removed | Empty folder scaffold. |
| `postman/environments/` (Folder) | — | **DELETED** | Permanently Removed | Empty folder scaffold. |
| `postman/flows/` (Folder) | — | **DELETED** | Permanently Removed | Empty folder scaffold. |
| `postman/mocks/` (Folder) | — | **DELETED** | Permanently Removed | Empty folder scaffold. |
| `postman/specs/` (Folder) | — | **DELETED** | Permanently Removed | Empty folder scaffold. |
| `postman/` (Folder) | — | **DELETED** | Permanently Removed | Empty parent folder scaffold. |

---

## Batch 5: Duplicate & Legacy Review Folders
**Executed:** November 14, 2026 | **Git Commit:** `Pending`

| Original File / Folder Path | File Size | Action Taken | Status | Reason |
| :--- | :---: | :---: | :---: | :--- |
| `completion/Admin_Portal_UI_and_Backend_Integration_Review.md` | 6.6 KB | **DELETED** | Permanently Removed | Byte-for-byte duplicate of `CompletionReviews/`. |
| `completion/Full_Application_SaaS_UI_and_UX_Modernization_Review.md` | 5.2 KB | **DELETED** | Permanently Removed | Byte-for-byte duplicate of `CompletionReviews/`. |
| `completion/Screenshot 2026-11-11 125132.png` | 370.9 KB | **DELETED** | Permanently Removed | Unreferenced temporary test screenshot image. |
| `completion/` (Folder) | — | **DELETED** | Permanently Removed | Empty folder after removing the files above. |
| `CompletionReviews/Admin_Portal_UI_and_Backend_Integration_Review.md` | 6.6 KB | **DELETED** | Permanently Removed | User backed up internally. |
| `CompletionReviews/Deck_Estimator_API_Testing_Fix_Report.md` | 7.9 KB | **DELETED** | Permanently Removed | Legacy API testing report; superseded by `docs/API-Manual-Testing-Guide.md`. |
| `CompletionReviews/Full_Application_SaaS_UI_and_UX_Modernization_Review.md` | 5.2 KB | **DELETED** | Permanently Removed | User backed up internally. |
| `CompletionReviews/MongoDB_Atlas_Connection_Review.md` | 3.7 KB | **DELETED** | Permanently Removed | User backed up internally. |
| `CompletionReviews/Phase-01-Review.md` ... `Phase-11-Review.md` (11 files) | ~130 KB | **DELETED** | Permanently Removed | User backed up internally. |
| `CompletionReviews/Project_Roadmap_Progress.md` | 16.8 KB | **DELETED** | Permanently Removed | User backed up internally. |
| `CompletionReviews/` (Folder) | — | **DELETED** | Permanently Removed | Folder removed from root directory. |

---

## Batch 6: Root vs. Docs Duplicate Documentation & Legacy Audits
**Executed:** November 14, 2026 | **Git Commit:** `Pending`

| Original File Path | File Size | Action Taken | Status | Reason |
| :--- | :---: | :---: | :---: | :--- |
| `Architecture.md` | 37.4 KB | **DELETED** | Permanently Removed | Exact duplicate of `docs/Phase_2_ARCHITECTURE.md`. |
| `DECK_PRO_HLD_LLD.md` | 41.2 KB | **DELETED** | Permanently Removed | Exact duplicate of `docs/Phase_1_HLD_LLD.md`. |
| `Deck_Estimator_API_Fix_Report.md` | 19.7 KB | **DELETED** | Permanently Removed | Exact duplicate of `docs/Deck_Estimator_API_Fix_Report.md`. |
| `FRONTEND_TEST_REPORT.md` | 10.8 KB | **DELETED** | Permanently Removed | Outdated Nov 11 audit log; all reported issues resolved. |
| `SECURITY_REVIEW.md` | 9.5 KB | **DELETED** | Permanently Removed | Outdated Nov 11 audit log; all reported issues resolved. |

---

## Batch 7: Empty Ghost Directories
**Executed:** November 14, 2026 | **Git Commit:** `8c3382f`

| Original Folder Path | Content | Action Taken | Status | Reason |
| :--- | :---: | :---: | :---: | :--- |
| `tests/` & `tests/e2e/` | 0 files (Empty) | **DELETED** | Permanently Removed | Empty scaffold folder; real test suite is in `backend/tests/`. |

---

## Batch 8: Backend Scratch & Dummy Upload Stubs
**Executed:** November 14, 2026 | **Git Commit:** `8c3382f`

| Original Path | File Count / Size | Action Taken | Status | Reason |
| :--- | :---: | :---: | :---: | :--- |
| `backend/scratch/` | 1 file (1.1 KB) | **DELETED** | Permanently Removed | Ad-hoc scratch script (`check_photos.cjs`). |
| `backend/scripts/portal-verification-screenshots/` | 4 PNGs (~1.2 MB) | **DELETED** | Permanently Removed | Stale test browser verification screenshots. |
| `backend/scripts/test-screenshots/` | 8 PNGs (~2.5 MB) | **DELETED** | Permanently Removed | Stale step-by-step test screenshots. |
| `backend/scripts/batch1-results.json` | 49 KB | **DELETED** | Permanently Removed | Stale automated test batch output log. |
| `backend/scripts/` (obsolete batch test runners) | 23 JS files (~210 KB) | **DELETED** | Permanently Removed | One-off phase verification & inspection scripts. (All seed scripts preserved). |
| `backend/uploads/decks/` | 148 dummy stubs | **DELETED** | Permanently Removed | 12-byte & 37-byte test upload stubs. Real images preserved. |

---

## Batch 9: Obsolete Test Runners, Guide Chunks & Dummy Contractor Documents
**Executed:** November 14, 2026 | **Git Commit:** `0d0a17c`

| Original Path | File Count / Size | Action Taken | Status | Reason |
| :--- | :---: | :---: | :---: | :--- |
| `backend/scripts/audit_all_pages.js` | 3.1 KB | **DELETED** | Permanently Removed | Ad-hoc manual JWT token audit runner. |
| `backend/scripts/complete-browser-test.js` | 10.3 KB | **DELETED** | Permanently Removed | Stale Puppeteer test script with hardcoded local Chrome paths. |
| `backend/scripts/execute-all-25-steps.js` | 24.5 KB | **DELETED** | Permanently Removed | Stale 25-step Puppeteer browser runner. |
| `backend/scripts/portal-browser-verification.js` | 5.4 KB | **DELETED** | Permanently Removed | Headless Chrome verification runner for old portal checks. |
| `backend/scripts/generate-api-manual-testing-guide.js` | 5.3 KB | **DELETED** | Permanently Removed | Compiler script; final output already permanently preserved in `docs/API-Manual-Testing-Guide.md`. |
| `backend/scripts/guide-data/` | 11 JS files (~45 KB) | **DELETED** | Permanently Removed | Compiler source chunks; rendered guide already saved in `docs/`. |
| `backend/uploads/deckimgsss.jpg` | 54.8 KB | **DELETED** | Permanently Removed | Stray test image dropped in root of uploads folder; unreferenced in DB. |
| `backend/uploads/contractor-documents/` (dummy stubs) | 50 dummy stubs (~2.5 KB) | **DELETED** | Permanently Removed | Automated test placeholder stubs (<200 bytes). All 7 real uploaded documents strictly preserved. |

---

## Batch Summary Tracker
| Batch | Category Description | Items | Space Cleared | Execution Status |
| :---: | :--- | :---: | :---: | :---: |
| **Batch 1** | Root Typo & Scrap Text Files | 3 files | 28.5 KB | **COMPLETED** |
| **Batch 2** | Demo Video Files & Screen Recorders | 10 items | ~36.9 MB | **COMPLETED** |
| **Batch 3** | Obsolete Root Scratch & Python Scripts | 21 items | ~207 KB | **COMPLETED** |
| **Batch 4** | Duplicate & Empty Postman Folders | 11 items | ~8.3 KB | **COMPLETED** |
| **Batch 5** | Duplicate & Legacy Review Folders | 19 items | ~545 KB | **COMPLETED** |
| **Batch 6** | Root vs Docs Duplicate Documentation | 5 files | ~119 KB | **COMPLETED** |
| **Batch 7** | Empty Ghost Directories | 1 folder | 0 B | **COMPLETED** |
| **Batch 8** | Backend Test Scratch & Dummy Upload Stubs | 185 items | ~4.0 MB | **COMPLETED** |
| **Batch 9** | Obsolete Test Runners & Dummy Contractor Documents | 67 items | ~150 KB | **COMPLETED** |
| **TOTAL COMPLETED** | **All 9 Batches Fully Cleaned** | **322 items** | **~42.0 MB** | **CLEANED & OPTIMIZED** |

