# Deck Estimator — Complete Page-by-Page Manual Testing Guide

**Project:** Deck Estimator  
**Target Environment:** Local Development ([http://localhost:5173](http://localhost:5173))  
**Database:** Live MongoDB Atlas (`DECK_ESTIMATOR`)  
**Backend API:** [http://localhost:5000/api/v1](http://localhost:5000/api/v1)  
**Total Steps:** **25 Detailed Manual Steps** across **14 Modules**  

---

## Testing Roadmap Overview

This document guides you through a complete, end-to-end manual verification of the entire application. Follow each step in order, copy and paste the provided dummy data, click the specified buttons, and verify the expected results.

```
[Module 1: Health Check] 
   └── [Module 2: Customer Registration & Login]
         └── [Module 3: Deck Specification & Image Upload]
               └── [Module 4: Estimate Builder & Pricing Engine]
                     └── [Module 5: Lead Request Submission]
                           └── [Module 6: Contractor Onboarding]
                                 └── [Module 7: Admin Command Center]
                                       └── [Module 8: Admin User Directory]
                                             └── [Module 9: Admin Contractor Verification]
                                                   └── [Module 10: Admin Catalog & Services]
                                                         └── [Module 11: Admin Lead Assignment]
                                                               └── [Module 12: Commission Lifecycle]
                                                                     └── [Module 13: Settings & Audit Logs]
                                                                           └── [Module 14: Contractor Payout Verification]
```

---

## Pre-Flight Check: Verify Servers are Running

Before opening your browser, confirm both servers are active:
- **Frontend URL:** [http://localhost:5173](http://localhost:5173)
- **Backend Health Check:** [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

---

# MODULE 1: System Health Verification

### Step 1 of 25: Verify Backend API Health
- **Page / URL:** [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)
- **Actor:** Public / Browser
- **Action:** Open the URL in a browser tab.
- **Expected Result:**
  ```json
  {
    "success": true,
    "data": {
      "status": "ok",
      "environment": "development"
    }
  }
  ```
- [ ] **Verified**

---

# MODULE 2: Customer Authentication Lifecycle

### Step 2 of 25: Customer Account Registration
- **Page / URL:** [http://localhost:5173/register](http://localhost:5173/register)
- **Actor:** Guest / New Customer
- **Inputs to Fill:**

| Field Name | Value to Copy & Paste | Notes |
|---|---|---|
| **Account Type** | `Customer` | Select Customer radio button |
| **Full Name** | `Alice Customer` | |
| **Email Address** | `alice.testing@example.com` | Standard valid email format |
| **Phone** | `555-123-4567` | Optional/standard phone |
| **Password** | `Password123!` | At least 8 characters |

- **Action:** Click the blue **"Create Account"** button.
- **Expected Result:**
  - Form submits without errors.
  - Automatic redirect to: **`http://localhost:5173/customer/dashboard`**
  - Top navigation displays: `"Welcome, Alice Customer"` and links: *My Decks*, *My Estimates*, *Sign Out*.
- [ ] **Verified**

### Step 3 of 25: Customer Logout & Login Flow
- **Page / URL:** [http://localhost:5173/customer/dashboard](http://localhost:5173/customer/dashboard)
- **Actor:** Logged in Customer
- **Action 1 (Logout):** Click **"Sign Out"** in the top-right navigation header.
  - **Expected Result:** Redirects to **`http://localhost:5173/login`**.
- **Action 2 (Login):** On [http://localhost:5173/login](http://localhost:5173/login), enter:

| Field Name | Value to Copy & Paste |
|---|---|
| **Email Address** | `alice.testing@example.com` |
| **Password** | `Password123!` |

- **Action 3:** Click **"Sign In"**.
  - **Expected Result:** Authenticated via JWT session cookie and redirected back to **`http://localhost:5173/customer/dashboard`**.
- [ ] **Verified**

---

# MODULE 3: Customer Deck Project Management

### Step 4 of 25: Create a Multi-Section Deck Project
- **Page / URL:** [http://localhost:5173/customer/decks/new](http://localhost:5173/customer/decks/new) *(or click "New Deck Project" button on dashboard)*
- **Actor:** Alice Customer
- **Step-by-Step Inputs Across the 8 Form Sections:**

#### Section 0 — Basic Info:
- **Project Name:** `Lakefront Cedar Deck`
- **Project Description:** `Elevated cedar deck overlooking backyard, needing deep cleaning and weather seal.`
- *Click button:* **"Next: Location →"**

#### Section 1 — Location:
- **Street Address:** `742 Evergreen Terrace`
- **City:** `Austin`
- **State:** `TX`
- **Zip Code:** `78701`
- **Country:** `USA`
- *Click button:* **"Next: Shape & Size →"**

#### Section 2 — Shape & Size:
- **Deck Shape:** Select `Rectangle`
- **Measurement Unit:** `Feet (ft)`
- **Length:** `24`
- **Width:** `16`
- *(Notice live area preview displays: `384 sq ft`)*
- *Click button:* **"Next: Structure →"**

#### Section 3 — Structure:
- **Levels:** `1`
- **Attached to House?** Check `Yes`
- **Has Perimeter Railings?** Check `Yes`
  - **Railing Length:** `64`
- **Has Stairs?** Check `Yes`
  - **Number of Steps:** `4`
- **Built-in Features:** Check `Built-in Benches`
- *Click button:* **"Next: Surface Details →"**

#### Section 4 — Surface Details:
- **Surface Material:** Select `Natural Wood (Cedar, Redwood, Pressure-Treated Pine)`
- **Current Coating Status:** Select `Clear Sealant / Water Repellent`
- *Click button:* **"Next: Visible Condition →"**

#### Section 5 — Visible Condition:
- Check `Peeling / Flaking Coating`
- Check `Surface Splinters & Wear`
- *Click button:* **"Next: Photographs →"**

#### Section 6 — Photographs:
- *(Optional: upload any sample `.jpg` or `.png` photo, or simply proceed)*
- *Click button:* **"Next: Review & Save →"**

#### Section 7 — Review & Save:
- Review the summary card showing **Lakefront Cedar Deck**, **384 sq ft**, **Natural Wood**, **Austin, TX**.
- *Click button:* **"Save Deck Project"**

- **Expected Result:**
  - Deck project is saved to MongoDB Atlas.
  - Automatically redirected to: **`http://localhost:5173/customer/decks/<deckId>`**.
  - Project specification card displays: `Dimensions: 24 ft x 16 ft (384 sq ft)`, `Surface: Natural Wood`, `Coating: Clear Sealant`.
- [ ] **Verified**

### Step 5 of 25: Edit Deck Project Specifications
- **Page / URL:** From the Deck Details page, click **"Edit Deck"** *(or navigate to `http://localhost:5173/customer/decks/<deckId>/edit`)*
- **Actor:** Alice Customer
- **Inputs to Modify:**
  - In **Section 0 (Basic Info)**, change **Project Name** to:  
    `Lakefront Cedar Deck - Master Renovation`
  - Jump directly to **Section 7 (Review & Save)**.
  - Click **"Save Deck Project"**.
- **Expected Result:**
  - Redirects back to **`http://localhost:5173/customer/decks/<deckId>`**.
  - Title updates to `Lakefront Cedar Deck - Master Renovation`.
- [ ] **Verified**

### Step 6 of 25: Verify Customer Dashboard Deck Listing
- **Page / URL:** [http://localhost:5173/customer/dashboard](http://localhost:5173/customer/dashboard)
- **Actor:** Alice Customer
- **Action:** Return to customer dashboard.
- **Expected Result:**
  - Summary KPI cards show: `Total Decks: 1`.
  - The deck list displays `Lakefront Cedar Deck - Master Renovation` with a **"View Project"** button.
- [ ] **Verified**

---

# MODULE 4: Pricing Engine & Estimate Generation

### Step 7 of 25: Configure and Generate a Pricing Estimate
- **Page / URL:** On the Deck Details page, click **"Generate Estimate"** *(or navigate to `http://localhost:5173/customer/decks/<deckId>/estimate/new`)*
- **Actor:** Alice Customer
- **Inputs to Select:**

| Option | Selection | Notes |
|---|---|---|
| **Stain / Sealant Material** | Select any material from the dropdown (e.g. *Olympic Maximum Semi-Transparent Stain*) | Compatible with Natural Wood |
| **Number of Coats** | `2` | Two-coat protection |
| **Restoration Services** | Check `Surface Cleaning & Pressure Washing` and `Stain Application` | Service catalog items |
| **Project Notes** | `Please schedule work for sunny weather.` | Customer notes |

- **Live Preview Verification:**
  - Look at the right-side summary box:
  - `Materials Cost:` dynamically calculated for 384 sq ft x 2 coats.
  - `Labor Cost:` dynamically calculated based on platform labor rates.
  - `Subtotal:`, `Taxes:`, and `Total Price:` update in real-time.
- **Action:** Click the blue button: **"Save & Generate Estimate"**.
- **Expected Result:**
  - Estimate is persisted to MongoDB Atlas with an immutable snapshot.
  - Redirected to: **`http://localhost:5173/customer/estimates/<estimateId>`**.
- [ ] **Verified**

### Step 8 of 25: Inspect Estimate Details Breakdown
- **Page / URL:** [http://localhost:5173/customer/estimates/<estimateId>](http://localhost:5173/customer/estimates/<estimateId>)
- **Actor:** Alice Customer
- **Action:** Inspect the estimate breakdown.
- **Expected Result:**
  - Header displays unique Estimate Number: `EST-XXXXXX` and status badge `DRAFT`.
  - Itemized tables display:
    - Selected Materials (Quantity, Coverage Units, Unit Price, Total)
    - Selected Services (Service Name, Unit Rate, Total)
    - Financial Summary (Materials Subtotal, Labor Subtotal, Tax Amount, Final Total Price)
- [ ] **Verified**

---

# MODULE 5: Customer Lead & Quote Request Submission

### Step 9 of 25: Request a Contractor Quote (Create a Lead)
- **Page / URL:** On the Deck Detail page (`http://localhost:5173/customer/decks/<deckId>`), locate the **"Request Contractor Quote"** or **"Find Contractors"** section.
- **Actor:** Alice Customer
- **Inputs to Fill:**

| Field Name | Value to Copy & Paste |
|---|---|
| **Inquiry Subject** | `Deck Restoration Quote Request` |
| **Message / Requirements** | `Looking for a licensed contractor to inspect wood splinters and apply two coats of Olympic stain.` |
| **Preferred Contact Method** | `Email` |

- **Action:** Click **"Submit Request"** / **"Request Quote"**.
- **Expected Result:**
  - Success message confirms lead submission.
  - A new Lead is created in MongoDB Atlas with status `NEW`, linked to Alice's deck snapshot.
- [ ] **Verified**

---

# MODULE 6: Contractor Registration & Verification Lifecycle

### Step 10 of 25: Contractor Account Registration
- **Action 1:** In the top header navigation, click **"Sign Out"** to exit Alice's session.
- **Page / URL:** [http://localhost:5173/register](http://localhost:5173/register)
- **Actor:** Guest / New Contractor
- **Action 2:** Click the **`Contractor`** radio button under *Account Type*.
- **Inputs to Fill:**

| Field Name | Value to Copy & Paste | Notes |
|---|---|---|
| **Account Type** | Select `Contractor` | Reveals contractor-specific inputs |
| **Full Name** | `Robert Builder` | |
| **Email Address** | `robert.builder@example.com` | Unique contractor email |
| **Phone** | `555-987-6543` | |
| **Password** | `Password123!` | |
| **Business Name** | `Apex Deck Restorations LLC` | Required contractor field |
| **License Number** | `LIC-TX-2026-99` | Required contractor field |
| **License Jurisdiction** | `Texas Licensing Board` | |

- **Action 3:** Click **"Create Account"**.
- **Expected Result:**
  - Account and contractor profile created in MongoDB Atlas.
  - Redirected to: **`http://localhost:5173/contractor/dashboard`**.
- [ ] **Verified**

### Step 11 of 25: Inspect Contractor Pending Status Banner
- **Page / URL:** [http://localhost:5173/contractor/dashboard](http://localhost:5173/contractor/dashboard)
- **Actor:** Robert Builder (Unverified Contractor)
- **Action:** Inspect the dashboard warnings and restrictions.
- **Expected Result:**
  - Notice the prominent warning banner:  
    ⚠️ **"Verification Pending: Your contractor application is currently under review by platform administrators."**
  - Operational lead bidding actions are protected until verification is granted.
- [ ] **Verified**

---

# MODULE 7: Platform Administrator Command Center

### Step 12 of 25: Administrator Login
- **Action 1:** Click **"Sign Out"** in top header navigation.
- **Page / URL:** [http://localhost:5173/login](http://localhost:5173/login)
- **Actor:** Platform Administrator
- **Inputs to Enter:**

| Field Name | Value to Copy & Paste |
|---|---|
| **Email Address** | `admin@deckestimator.com` |
| **Password** | `AdminPass123!` |

- **Action 2:** Click **"Sign In"**.
- **Expected Result:**
  - Successfully authenticated with `role: admin`.
  - Redirected directly to: **`http://localhost:5173/admin/dashboard`**.
  - Admin banner displayed in header navigation (*Admin Console* link visible).
- [ ] **Verified**

### Step 13 of 25: Admin Tab 1 — Operations Overview (Live Atlas KPIs)
- **Page / URL:** [http://localhost:5173/admin/dashboard](http://localhost:5173/admin/dashboard) *(Active Tab: `📊 Operations Overview`)*
- **Actor:** Admin
- **Action:** Review the live aggregation metrics.
- **Expected Result:**
  - **Platform Users Card:** Total users count updated (includes Alice and Robert).
  - **Decks Oversight Card:** Total decks includes Alice's `384 sq ft` deck.
  - **Estimates Volume Card:** Shows total pipeline dollar volume.
  - **Recent Activity Feed:** Shows chronological events: `CREATE_USER`, `CREATE_DECK`, `CREATE_ESTIMATE`.
- [ ] **Verified**

---

# MODULE 8: Admin User Management & Directory

### Step 14 of 25: Search, Filter, and Inspect User Profiles
- **Page / URL:** [http://localhost:5173/admin/dashboard](http://localhost:5173/admin/dashboard)
- **Action 1:** Click the **`👥 User Directory`** tab.
- **Action 2 (Search Filter):** In the search input, type: `Alice`
  - **Expected Result:** Table immediately filters to display `Alice Customer` (`alice.testing@example.com`, Role: `customer`, Status: `active`).
- **Action 3 (Role Filter):** Clear search, select `Contractor` from the Role dropdown:
  - **Expected Result:** Table shows `Robert Builder` (`Apex Deck Restorations LLC`, Status: `pending_verification`).
- [ ] **Verified**

---

# MODULE 9: Admin Contractor Verification & Approval

### Step 15 of 25: Review and Approve Contractor Application
- **Page / URL:** Navigate to:  
  👉 **[http://localhost:5173/admin/contractor-verifications](http://localhost:5173/admin/contractor-verifications)**
- **Actor:** Admin
- **Action 1:** Locate **Apex Deck Restorations LLC** (`Robert Builder`, License: `LIC-TX-2026-99`, Status: `PENDING`).
- **Action 2:** Click the **"Review Application"** button.
- **Action 3:** In the review modal, click **"Approve Contractor"** *(add review note: `Verified active standing with TX board`)*.
- **Expected Result:**
  - Verification status badge updates from `PENDING` to green **`APPROVED`**.
  - An immutable audit log entry is recorded for `CONTRACTOR_APPROVAL`.
- [ ] **Verified**

---

# MODULE 10: Admin Catalog & Pricing Administration

### Step 16 of 25: Inspect Material and Service Catalogs
- **Page / URL:** Navigate to:  
  👉 **[http://localhost:5173/admin/catalog](http://localhost:5173/admin/catalog)**
- **Actor:** Admin
- **Action:** Inspect the tabs for:
  - **Material Categories:** Decking Boards, Stains & Sealers, Fasteners & Hardware.
  - **Materials Directory:** Lists products, manufacturer specifications, coverage per unit, and unit prices.
  - **Services Directory:** Pressure Washing, Stain Application, Sanding, Board Replacement.
  - **Compatibility Matrix:** Surface-to-product compatibility rules.
- **Expected Result:** All catalog items render with active badges and edit controls.
- [ ] **Verified**

### Step 17 of 25: Add a Custom Platform Restoration Service
- **Page / URL:** [http://localhost:5173/admin/catalog](http://localhost:5173/admin/catalog) *(Click "Services" tab)*
- **Actor:** Admin
- **Action 1:** Click **"+ Add Service"**.
- **Inputs to Fill:**

| Field Name | Value to Copy & Paste |
|---|---|
| **Service Name** | `UV Inhibitor Clear Topcoat` |
| **Service Code** | `SRV-UV-TOP` |
| **Category** | Select `Sealing & Finishing` *(or any available category)* |
| **Measurement Unit** | `sq_ft` |
| **Base Price Per Unit** | `0.95` |
| **Description** | `Ultra-violet radiation protective clear sealant coat.` |

- **Action 2:** Click **"Save Service"**.
- **Expected Result:**
  - Service appears in the Services table with status `Active` and price `$0.95 / sq_ft`.
- [ ] **Verified**

---

# MODULE 11: Admin Lead Management & Contractor Assignment

### Step 18 of 25: View Inbound Leads
- **Page / URL:** Navigate to:  
  👉 **[http://localhost:5173/admin/leads](http://localhost:5173/admin/leads)**
- **Actor:** Admin
- **Action:** Locate the lead submitted by Alice Customer (`Lakefront Cedar Deck - Master Renovation`, status `NEW`).
- **Expected Result:** Lead card displays customer name, deck area (384 sq ft), inquiry text, and status badge `NEW`.
- [ ] **Verified**

### Step 19 of 25: Assign Lead to Approved Contractor
- **Page / URL:** [http://localhost:5173/admin/leads](http://localhost:5173/admin/leads)
- **Actor:** Admin
- **Action 1:** On Alice Customer's lead card, click **"Assign Contractor"**.
- **Action 2:** From the contractor dropdown, select:  
  **`Apex Deck Restorations LLC (Robert Builder)`**
- **Action 3:** Click **"Confirm Assignment"**.
- **Expected Result:**
  - Lead status updates from `NEW` to **`ASSIGNED`**.
  - Lead assignment history records timestamp, assigned contractor, and administrator ID.
- [ ] **Verified**

---

# MODULE 12: Commission Lifecycle & Payout Recording

### Step 20 of 25: Generate and Review Contractor Commission
- **Page / URL:** Navigate to:  
  👉 **[http://localhost:5173/admin/commissions](http://localhost:5173/admin/commissions)**
- **Actor:** Admin
- **Action 1:** Click the **`Commission Policies`** tab and verify default policy exists (e.g. `10% Verified Contract Value`).
- **Action 2:** Click the **`Commissions`** tab.
- **Action 3:** Click **"Generate Commission"**:
  - Select Alice Customer's lead.
  - Contract Basis Amount: `1500.00`
  - Policy: `10% Standard Commission`
  - Calculated Amount: `$150.00`
  - Click **"Generate"**.
- **Expected Result:** Commission record created with status `PENDING` ($150.00).
- [ ] **Verified**

### Step 21 of 25: Approve and Record Commission Payment
- **Page / URL:** [http://localhost:5173/admin/commissions](http://localhost:5173/admin/commissions)
- **Actor:** Admin
- **Action 1 (Approve):** On the newly created commission row, click **"Review"** -> select **"Approve"** -> click **"Confirm"**. Status changes to `APPROVED`.
- **Action 2 (Mark Payable):** Click **"Review"** -> select **"Mark Payable"**. Status changes to `PAYABLE`.
- **Action 3 (Record Payment):** Click **"Record Payment"**:

| Field Name | Value to Copy & Paste |
|---|---|
| **Payment Reference** | `ACH-TX-882291` |
| **Payment Method** | `Bank Transfer (ACH)` |
| **Amount Paid** | `150.00` |
| **Payment Notes** | `Settled via direct deposit.` |

- **Action 4:** Click **"Submit Payment Record"**.
- **Expected Result:**
  - Status updates to green **`PAID`**.
  - Payment record is permanently logged in `commissionPaymentRecords`.
  - Atomic database conditional locks prevent any duplicate payout attempt.
- [ ] **Verified**

---

# MODULE 13: Admin Platform Settings & Audit Logs

### Step 22 of 25: Create and Toggle a Runtime Platform Setting
- **Page / URL:** [http://localhost:5173/admin/dashboard](http://localhost:5173/admin/dashboard) *(Click `⚙️ Platform Settings` tab)*
- **Actor:** Admin
- **Action 1:** Click **"+ Add Setting"**.
- **Inputs to Fill:**

| Field Name | Value to Copy & Paste | Notes |
|---|---|---|
| **Setting Key** | `SPRING_PROMO_ACTIVE` | Uppercase identifier |
| **Category** | `GENERAL` | Select from dropdown |
| **Label** | `Spring Restoration Promotion` | UI title |
| **Value Type** | `BOOLEAN` | Typed validation |
| **Value** | `true` | Valid boolean string |
| **Public Setting?** | Check `Yes (Public)` | Exposed to public API |

- **Action 2:** Click **"Save Setting"**.
- **Action 3 (Toggle Status):** In the settings list, locate `SPRING_PROMO_ACTIVE` and click the status toggle switch to deactivate it (`Inactive`), then toggle back to `Active`.
- **Expected Result:**
  - Setting updates instantly in table.
  - Setting is accessible via `GET /api/v1/settings/public`.
- [ ] **Verified**

### Step 23 of 25: Inspect Forensic Audit Trail and Export CSV
- **Page / URL:** [http://localhost:5173/admin/dashboard](http://localhost:5173/admin/dashboard)
- **Action 1 (Audit Logs):** Click the **`📜 Audit Logs`** tab.
  - **Expected Result:** Shows timestamped mutation records for every action completed today (`CREATE_USER`, `UPDATE_SETTING`, `COMMISSION_PAYMENT_RECORDED`).
- **Action 2 (Reports & CSV):** Click the **`📈 Reports & CSV`** tab.
  - Select Report: `Users Directory`
  - Click the green button: **"Download CSV"**.
  - **Expected Result:** Browser immediately downloads RFC 4180 formatted CSV file (e.g. `users-report-XXXXXX.csv`).
- [ ] **Verified**

---

# MODULE 14: Contractor Verified Workspace & Commissions

### Step 24 of 25: Contractor Inactive Session & Assigned Leads Verification
- **Action 1:** Click **"Sign Out"** in top header navigation.
- **Page / URL:** [http://localhost:5173/login](http://localhost:5173/login)
- **Actor:** Robert Builder (Now an Approved Contractor)
- **Inputs to Enter:**

| Field Name | Value to Copy & Paste |
|---|---|
| **Email Address** | `robert.builder@example.com` |
| **Password** | `Password123!` |

- **Action 2:** Click **"Sign In"**.
- **Expected Result:**
  - Redirected to **`http://localhost:5173/contractor/dashboard`**.
  - The previous yellow *Verification Pending* banner is now **GONE** because the Admin approved Robert in Step 15.
  - Status badge displays green **`APPROVED`**.
- [ ] **Verified**

### Step 25 of 25: Contractor Inspects Assigned Leads & Commissions
- **Page / URL:** [http://localhost:5173/contractor/dashboard](http://localhost:5173/contractor/dashboard)
- **Actor:** Robert Builder
- **Action:** Inspect the contractor workspace:
  - **Assigned Leads Table:** Shows Alice Customer's assigned project (`Lakefront Cedar Deck - Master Renovation`). Robert can view project details and deck photos.
  - **Commissions Section:** Shows the completed commission record (`$150.00`, Status: `PAID`, Reference: `ACH-TX-882291`).
- **Expected Result:**
  - Complete end-to-end integration verified: Customer registered -> Deck built -> Estimate generated -> Lead submitted -> Contractor verified -> Lead assigned -> Commission settled and paid.
- [ ] **Verified**

---

## Verification Sign-Off Checklist

| Step # | Verification Item | Status |
|---|---|---|
| **Step 1** | API Health Endpoint (`/api/v1/health`) | [ ] Passed |
| **Step 2** | Customer Registration (`/register`) | [ ] Passed |
| **Step 3** | Customer Login & Session Handling (`/login`) | [ ] Passed |
| **Step 4** | Deck Project Multi-Step Creation (`/customer/decks/new`) | [ ] Passed |
| **Step 5** | Deck Project Editing (`/customer/decks/:id/edit`) | [ ] Passed |
| **Step 6** | Customer Dashboard Overview (`/customer/dashboard`) | [ ] Passed |
| **Step 7** | Estimate Builder with Live Math (`/customer/decks/:id/estimate/new`) | [ ] Passed |
| **Step 8** | Estimate Details Breakdown (`/customer/estimates/:id`) | [ ] Passed |
| **Step 9** | Lead & Quote Request Submission | [ ] Passed |
| **Step 10** | Contractor Registration (`/register`) | [ ] Passed |
| **Step 11** | Contractor Verification Pending Banner (`/contractor/dashboard`) | [ ] Passed |
| **Step 12** | Administrator Login (`/login`) | [ ] Passed |
| **Step 13** | Admin Dashboard Overview & Live KPIs (`/admin/dashboard`) | [ ] Passed |
| **Step 14** | Admin User Directory & Search/Filter | [ ] Passed |
| **Step 15** | Admin Contractor Review & Approval (`/admin/contractor-verifications`) | [ ] Passed |
| **Step 16** | Admin Catalog Management (`/admin/catalog`) | [ ] Passed |
| **Step 17** | Add Custom Restoration Service | [ ] Passed |
| **Step 18** | Admin Inbound Leads Oversight (`/admin/leads`) | [ ] Passed |
| **Step 19** | Admin Assign Lead to Contractor | [ ] Passed |
| **Step 20** | Admin Generate Commission Record (`/admin/commissions`) | [ ] Passed |
| **Step 21** | Admin Record Atomic Commission Payment | [ ] Passed |
| **Step 22** | Admin Platform Settings CRUD (`/admin/dashboard`) | [ ] Passed |
| **Step 23** | Forensic Audit Trail & CSV Export | [ ] Passed |
| **Step 24** | Verified Contractor Workspace & Active Standing | [ ] Passed |
| **Step 25** | Full Cross-Module Closed-Loop Verification | [ ] Passed |
