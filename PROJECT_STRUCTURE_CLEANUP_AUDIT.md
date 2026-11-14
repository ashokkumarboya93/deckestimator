# DeckEstimator — Comprehensive Project Structure & Waste Cleanup Audit

> **Date:** November 14, 2026  
> **Repository:** `E:\DeckEstimator`  
> **Branch:** `dev2`  
> **Status:** Full Structural Scan Complete  

---

## 1. Executive Summary

A deep recursive audit was performed across the entire `DeckEstimator` repository. The core production application is well-organized inside `backend/src` and `frontend/src`. However, during incremental development, automated testing, demo screen recording, and migration phases, **a substantial amount of waste, obsolete scratch scripts, legacy python helper scripts, large unreferenced video files, duplicate documentation, and empty folders** have accumulated.

### Storage & File Waste Breakdown:
| Category | File/Folder Count | Approximate Size | Risk Level | Recommendation |
| :--- | :---: | :---: | :---: | :--- |
| **1. Root Typo & Garbage Files** | 3 files | ~53 KB | **Zero Risk** | Safe to Delete Immediately |
| **2. Demo Video Files & Screen Recorders** | 9 files | **~36.9 MB** | **Zero Risk** | Safe to Delete (or archive externally) |
| **3. Obsolete Root Scratch & Python Scripts** | 19 files | ~180 KB | **Zero Risk** | Safe to Delete Immediately |
| **4. Duplicate & Empty Postman Folders** | 9 items | ~8 KB | **Zero Risk** | Safe to Delete Immediately |
| **5. Duplicate & Legacy Review Folders** | 16 files | ~485 KB | **Low Risk** | Delete or Consolidate to `docs/` |
| **6. Duplicate Root Documentation Files** | 4 files | ~109 KB | **Zero Risk** | Delete Root Duplicates (kept in `docs/`) |
| **7. Empty Ghost Directories** | 1 directory | 0 KB | **Zero Risk** | Safe to Delete |
| **8. Backend Scratch, Batch Dumps & Test Photos** | 185+ files | ~2.5 MB | **Low Risk** | Clean test artifacts & keep seeds |
| **Total Waste Identified** | **240+ items** | **~40.1 MB** | — | **Massive project hygiene improvement** |

---

## 2. Detailed Breakdown of Waste Files & Folders

### Category 1: Junk, Typo & Transient Files in Root — [COMPLETED]
These were accidental files or abandoned notes in the root directory that served no purpose in the application.

| File Path | Size | Reason / Analysis | Status |
| :--- | :--- | :--- | :--- |
| `tatus` | 488 B | Accidental typo file created from an incomplete shell command (`git status > tatus`). | **DELETED** |
| `DYnamic_Estimator.txt` | 28.0 KB | Stale draft notes of pricing formulas *(officially maintained in `docs/`)*. | **DELETED** |
| `COMPLETE_DEMO_SCRIPT.txt` | 24.9 KB | Spoken verbal script for platform presentation. Preserved cleanly in `docs/`. | **PRESERVED IN `docs/`** |

---

### Category 2: Demo Video Recordings & Recording Automation — [COMPLETED]
Large MP4 video recordings and the Puppeteer scripts used solely to capture them. Cleared ~36.9 MB of repository bloat.

| File / Folder Path | Size | Reason / Analysis | Status |
| :--- | :--- | :--- | :--- |
| `videos/video_1_customer_admin.mp4` | 18.28 MB | Recorded video artifact from old demo. Bloated Git history. | **DELETED** |
| `videos/video_2_contractor_admin.mp4` | 9.43 MB | Recorded video artifact from old demo. | **DELETED** |
| `videos/video_3_admin_command_center.mp4` | 9.09 MB | Recorded video artifact from old demo. | **DELETED** |
| `videos/` (Folder) | — | Entire folder deleted. | **DELETED** |
| `demo_engine.js` | 13.0 KB | Puppeteer automation engine built only to produce the videos. | **DELETED** |
| `demo_video_1_customer_admin.js` | 8.9 KB | Video 1 recording sequence runner. | **DELETED** |
| `demo_video_2_contractor_admin.js` | 8.2 KB | Video 2 recording sequence runner. | **DELETED** |
| `demo_video_3_admin_command_center.js` | 10.2 KB | Video 3 recording sequence runner. | **DELETED** |
| `run_demo_menu.js` | 1.4 KB | CLI interactive menu for running demo scripts. | **DELETED** |
| `run_interactive_demo.js` | 18.6 KB | Interactive demo orchestrator script. | **DELETED** |

---

### Category 3: Obsolete Root Scratch & Legacy Python Scripts
Temporary scripts used during development phases for one-off regex replacements or targeted test runs. None of these are imported or used in production.

#### A. Root `scratch/` Folder (10 files):
| File Path | Size | Reason / Analysis | Action |
| :--- | :--- | :--- | :--- |
| `scratch/fix_admin.js` | 558 B | One-off patch script for admin routes. | **DELETE** |
| `scratch/test_addr.js` | 660 B | Temporary test script for address parsing. | **DELETE** |
| `scratch/test_admin_speed.cjs` | 2.0 KB | Latency benchmark test script. | **DELETE** |
| `scratch/test_contractor_portal.js` | 15.7 KB | Ad-hoc contractor portal verification script. | **DELETE** |
| `scratch/test_contractor_speed.cjs` | 2.2 KB | Latency benchmark test script. | **DELETE** |
| `scratch/test_customer_admin_sync.cjs` | 4.6 KB | Ad-hoc customer-admin sync test script. | **DELETE** |
| `scratch/test_endpoints.js` | 2.9 KB | Ad-hoc endpoint test script. | **DELETE** |
| `scratch/update_files.js` | 2.1 KB | One-off file transformer script. | **DELETE** |
| `scratch/update_lead_page.js` | 14.6 KB | One-off code generation script for lead page. | **DELETE** |
| `scratch/update_verification_page.js` | 81.9 KB | One-off code generation script for verification page. | **DELETE** |
| `scratch/` (Folder) | — | Entire folder is temporary scratchpad. | **DELETE FOLDER** |

#### B. Root `scripts/` Folder (9 obsolete Python scripts):
| File Path | Size | Reason / Analysis | Action |
| :--- | :--- | :--- | :--- |
| `scripts/add_admin_endpoints.py` | 1.1 KB | Obsolete Python regex updater. | **DELETE** |
| `scripts/clean_all_emojis.py` | 4.0 KB | One-off text cleaning script. | **DELETE** |
| `scripts/test_contractor_verification_e2e.js` | 11.1 KB | Redundant contractor E2E script. | **DELETE** |
| `scripts/update_continuous_estimator.py` | 1.6 KB | Obsolete Python regex updater. | **DELETE** |
| `scripts/update_customer_dash.py` | 6.6 KB | Obsolete Python regex updater. | **DELETE** |
| `scripts/update_cust_estimates.py` | 6.0 KB | Obsolete Python regex updater. | **DELETE** |
| `scripts/update_layouts.py` | 2.2 KB | Obsolete Python regex updater. | **DELETE** |
| `scripts/update_reg_form.py` | 1.5 KB | Obsolete Python regex updater. | **DELETE** |
| `scripts/upgrade_admin_dashboard.py` | 42.8 KB | Obsolete Python regex updater. | **DELETE** |
| `scripts/` (Folder) | — | Entire folder consists of obsolete migration scripts. | **DELETE FOLDER** |

---

### Category 4: Duplicate & Obsolete Postman Folders — [COMPLETED]
Two separate Postman directories existed (`.postman` and `postman`), both containing empty stubs or duplicate markdown files.

| File / Folder Path | Size | Reason / Analysis | Status |
| :--- | :--- | :--- | :--- |
| `.postman/Deck_Estimator_API_Testing_Fix_Report.md` | 7.9 KB | Duplicate of report in `CompletionReviews/`. | **DELETED** |
| `.postman/resources.yaml` | 353 B | Unused empty Postman stub configuration. | **DELETED** |
| `.postman/` (Folder) | — | Deleted folder. | **DELETED** |
| `postman/collections/` | 0 B | Empty directory. | **DELETED** |
| `postman/documents/` | 0 B | Empty directory. | **DELETED** |
| `postman/environments/` | 0 B | Empty directory. | **DELETED** |
| `postman/flows/` | 0 B | Empty directory. | **DELETED** |
| `postman/mocks/` | 0 B | Empty directory. | **DELETED** |
| `postman/specs/` | 0 B | Empty directory. | **DELETED** |
| `postman/globals/workspace.globals.yaml` | 27 B | Default Postman template stub. | **DELETED** |
| `postman/` (Folder) | — | Deleted directory hierarchy. | **DELETED** |

---

### Category 5: Duplicate & Fragmented Completion Review Folders — [COMPLETED]
Development reviews were saved across two different folders: `completion/` and `CompletionReviews/`.

| File / Folder Path | Size | Reason / Analysis | Status |
| :--- | :--- | :--- | :--- |
| `completion/Admin_Portal_UI_and_Backend_Integration_Review.md` | 6.6 KB | Exact byte-for-byte duplicate of `CompletionReviews/...` | **DELETED** |
| `completion/Full_Application_SaaS_UI_and_UX_Modernization_Review.md` | 5.2 KB | Exact byte-for-byte duplicate of `CompletionReviews/...` | **DELETED** |
| `completion/Screenshot 2026-11-11 125132.png` | 370.9 KB | Unreferenced temporary screenshot. | **DELETED** |
| `completion/` (Folder) | — | Deleted folder. | **DELETED** |
| `CompletionReviews/` (13 review files + Folder) | ~170 KB | User backed up internally. Deleted from root directory. | **DELETED** |

---

### Category 6: Root vs. Docs Duplicates — [COMPLETED]
Markdown documents in the root folder that were 100% duplicate copies of files inside `docs/` or outdated test logs.

| Root File Path | Size | Duplicate Path in `docs/` | Status |
| :--- | :--- | :--- | :--- |
| `Architecture.md` | 37.4 KB | `docs/Phase_2_ARCHITECTURE.md` (Identical 37,395 B) | **DELETED ROOT COPY** |
| `DECK_PRO_HLD_LLD.md` | 41.2 KB | `docs/Phase_1_HLD_LLD.md` (Identical 41,237 B) | **DELETED ROOT COPY** |
| `Deck_Estimator_API_Fix_Report.md` | 19.7 KB | `docs/Deck_Estimator_API_Fix_Report.md` (Identical 19,732 B) | **DELETED ROOT COPY** |
| `FRONTEND_TEST_REPORT.md` | 10.8 KB | Stale Nov 11 test log; issues resolved. | **DELETED** |
| `SECURITY_REVIEW.md` | 9.5 KB | Stale Nov 11 security log; issues resolved. | **DELETED** |

---

### Category 7: Empty Ghost Folders — [COMPLETED]
| Path | Reason / Analysis | Status |
| :--- | :--- | :--- |
| `tests/` & `tests/e2e/` | Completely empty folder in project root. Actual test suite is in `backend/tests/`. | **DELETED** |

---

### Category 8: Backend Test Artifacts & Dummy Uploads — [COMPLETED]
Generated test artifacts inside `backend/` have been safely cleaned:

| Path | File Count | Size | Reason / Analysis | Status |
| :--- | :---: | :---: | :--- | :--- |
| `backend/scratch/check_photos.cjs` | 1 file | 1.1 KB | Ad-hoc scratch script. | **DELETED** |
| `backend/scripts/batch1-results.json` | 1 file | 49.1 KB | Stale batch test output. | **DELETED** |
| `backend/scripts/portal-verification-screenshots/` | 4 files | ~1.2 MB | Temporary test screenshots. | **DELETED** |
| `backend/scripts/test-screenshots/` | 8 files | ~2.5 MB | Temporary test screenshots. | **DELETED** |
| `backend/scripts/test-batch*.js` | 5 files | ~70 KB | Old batch test files; test suite in `backend/tests/`. | **DELETED** |
| `backend/scripts/verify-phase*.js` | 8 files | ~84 KB | One-off phase verification scripts. | **DELETED** |
| `backend/scripts/fix_admin.js`, `inspect_*.js`, `test_*.js`, etc. | 10 files | ~15 KB | One-off scratch scripts. | **DELETED** |
| `backend/uploads/decks/` | 148 files | ~3 KB | Dummy 12-byte and 37-byte test files. Real images kept. | **DELETED** |

> [!NOTE]
> **Backend Seed Scripts KEPT & INTACT:**  
> The following essential database auto-seeds and synchronization utilities in `backend/scripts/` are preserved:
> - `backend/scripts/seed-admin.js`
> - `backend/scripts/seed_admin_portal.js`
> - `backend/scripts/seed_estimator_config.js`
> - `backend/scripts/seed_platform_settings.js`
> - `backend/scripts/sync_projects_db.js`
> - `backend/scripts/sync-atlas-validators.js`
> - `backend/scripts/update_users_validator.js`
> - `backend/scripts/patch_admin_notifications.js`
> - `backend/scripts/guide-data/`
> - `backend/scripts/seed_platform_settings.js`
> - `backend/scripts/sync_projects_db.js`
> - `backend/scripts/sync-atlas-validators.js`

---

## 3. Essential Project Files (DO NOT TOUCH)

The following core files and directories must remain intact for the application to function in development and production:

```
DeckEstimator/
├── backend/
│   ├── src/                    # All API routes, models, controllers, middleware
│   │   ├── config/             # DB & cloud configurations
│   │   ├── middleware/         # Auth, validation, error handling
│   │   ├── modules/            # Domain modules (auth, decks, estimates, admin, etc.)
│   │   ├── shared/             # Shared utilities & response formatters
│   │   ├── app.js              # Express app definition
│   │   └── server.js           # Production server entrypoint
│   ├── tests/                  # Automated integration & unit test suite
│   ├── package.json            # Backend dependencies & scripts
│   └── .env                    # Environment credentials
├── frontend/
│   ├── src/                    # Complete React 19 application
│   │   ├── api/                # Axios API client & interceptors
│   │   ├── app/                # App layout & routing
│   │   ├── assets/             # Static logos & imagery
│   │   ├── components/         # Shared UI components
│   │   ├── features/           # Customer, Contractor & Admin feature modules
│   │   ├── hooks/              # Custom React hooks
│   │   └── main.jsx            # React root entrypoint
│   ├── public/                 # Static web assets
│   ├── index.html              # HTML shell
│   ├── vite.config.js          # Vite bundler & reverse proxy config
│   ├── server.js               # Production Node.js static compression server
│   └── package.json            # Frontend dependencies & scripts
├── docs/                       # Official architectural & API documentation
├── .editorconfig               # Editor consistency
├── .gitignore                  # Git ignore rules
└── README.md                   # Primary project readme
```

---

## 4. Proposed Clean Project Structure (After Cleanup)

Once the redundant files and folders are cleaned up, the root repository will be pristine, professional, and production-ready:

```
DeckEstimator/
├── backend/                    # Clean Node/Express backend
├── frontend/                   # Clean React 19 frontend
├── docs/                       # Consolidated project documentation
├── .editorconfig               # Editor configuration
├── .env.example                # Sample environment template
├── .gitignore                  # Comprehensive gitignore
├── README.md                   # Clean project documentation
└── PROJECT_STRUCTURE_CLEANUP_AUDIT.md # This audit report
```

---

## 5. Automated Safe Cleanup Script (PowerShell)

When you are ready to execute the cleanup, run the following automated PowerShell script from the repository root (`E:\DeckEstimator`):

```powershell
# ==============================================================================
# DECKESTIMATOR - CLEANUP EXECUTION SCRIPT
# Run in PowerShell from E:\DeckEstimator
# ==============================================================================

Write-Host "--- 1. Removing Root Typo & Scratch Files ---" -ForegroundColor Cyan
Remove-Item -Path "tatus" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "COMPLETE_DEMO_SCRIPT.txt" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "DYnamic_Estimator.txt" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "FRONTEND_TEST_REPORT.md" -Force -ErrorAction SilentlyContinue

Write-Host "--- 2. Removing Root Duplicate Docs (Existing in docs/) ---" -ForegroundColor Cyan
Remove-Item -Path "Architecture.md" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "DECK_PRO_HLD_LLD.md" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "Deck_Estimator_API_Fix_Report.md" -Force -ErrorAction SilentlyContinue

Write-Host "--- 3. Removing Demo Video Files & Recording Scripts ---" -ForegroundColor Cyan
Remove-Item -Path "videos" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "demo_engine.js" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "demo_video_1_customer_admin.js" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "demo_video_2_contractor_admin.js" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "demo_video_3_admin_command_center.js" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "run_demo_menu.js" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "run_interactive_demo.js" -Force -ErrorAction SilentlyContinue

Write-Host "--- 4. Removing Obsolete Scratch & Python Folders ---" -ForegroundColor Cyan
Remove-Item -Path "scratch" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "scripts" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "--- 5. Removing Postman & Redundant Completion Folders ---" -ForegroundColor Cyan
Remove-Item -Path ".postman" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "postman" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "completion" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "CompletionReviews" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "tests" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "--- 6. Removing Backend Scratch & Test Artifacts ---" -ForegroundColor Cyan
Remove-Item -Path "backend/scratch" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "backend/scripts/batch1-results.json" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "backend/scripts/portal-verification-screenshots" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "backend/scripts/test-screenshots" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "backend/scripts/test-batch*.js" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "backend/scripts/verify-phase*.js" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "backend/scripts/fix_admin.js" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "backend/scripts/inspect_*.js" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "backend/scripts/test_*.js" -Force -ErrorAction SilentlyContinue

Write-Host "--- 7. Cleaning Dummy 12-byte Upload Stubs ---" -ForegroundColor Cyan
Get-ChildItem -Path "backend/uploads/decks" -File | Where-Object { $_.Length -le 100 } | Remove-Item -Force -ErrorAction SilentlyContinue

Write-Host "=== Cleanup Complete! Repository structure is now clean and optimized. ===" -ForegroundColor Green
```

