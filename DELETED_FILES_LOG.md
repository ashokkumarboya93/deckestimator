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

## Batch Summary Tracker
| Batch | Category Description | Items | Space Cleared | Execution Status |
| :---: | :--- | :---: | :---: | :---: |
| **Batch 1** | Root Typo & Scrap Text Files | 3 files | 28.5 KB | **COMPLETED** |
| **Batch 2** | Demo Video Files & Screen Recorders | 10 items | **~36.9 MB** | **COMPLETED** |
| **Batch 3** | Obsolete Root Scratch & Python Scripts | 19 items | ~180 KB | **NEXT UP** |
| **Batch 4** | Duplicate & Empty Postman Folders | 9 items | ~8 KB | Queue |
| **Batch 5** | Duplicate & Legacy Review Folders | 16 items | ~485 KB | Queue |
| **Batch 6** | Root vs Docs Duplicate Documentation | 4 items | ~109 KB | Queue |
| **Batch 7** | Empty Ghost Directories | 1 item | 0 KB | Queue |
| **Batch 8** | Backend Test Scratch & Dummy Upload Stubs | 185+ items | ~2.5 MB | Queue |
| **TOTAL TO DATE** | **Batches 1 & 2 Completed** | **13 items** | **~36.93 MB** | **CLEANED** |

