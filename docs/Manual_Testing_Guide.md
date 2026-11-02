# Deck Estimator — Step-by-Step Manual Testing Guide

This guide is designed for manual testing and verification of the Deck Estimator platform in your web browser. Follow each step and copy-paste the exact dummy data provided below.

---

## Pre-requisites & Server URLs

Both servers must be running locally:
- **Frontend Application:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
- **API Health Check:** [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health) *(should show `{"status":"ok"}`)*

---

## Test Scenario 1: Customer Account Registration & Login

### Goal
Register a brand-new customer account, verify validation passes, and reach the Customer Dashboard.

### Steps:
1. Open your browser and navigate to:  
   👉 **[http://localhost:5173/register](http://localhost:5173/register)**
2. Select **Account Type**: `Customer` (default radio button)
3. Fill in the form with this exact dummy data:

| Field | Value to Enter |
|---|---|
| **Account Type** | `Customer` |
| **Full Name** | `Alice Customer` |
| **Email Address** | `alice.testing@example.com` |
| **Phone** | `555-123-4567` |
| **Password** | `Password123!` |

4. Click the **"Create Account"** button.

### Expected Result:
- The form submits cleanly without any `Document failed validation` or error banner.
- You are automatically authenticated and redirected to:  
  👉 **`http://localhost:5173/customer/dashboard`**
- The header displays **"Welcome, Alice Customer"** and shows customer navigation links (*My Decks*, *My Estimates*).

---

## Test Scenario 2: Create a Deck Project Specification

### Goal
Create and configure a multi-section deck project with realistic geometry, surface materials, and condition details.

### Steps:
1. From the Customer Dashboard, click **"New Deck Project"** or go directly to:  
   👉 **[http://localhost:5173/customer/decks/new](http://localhost:5173/customer/decks/new)**
2. Complete the multi-step form:

#### Section 0 — Basic Info:
- **Project Name:** `Lakefront Cedar Deck`
- **Project Description:** `Backyard elevated deck needing cleaning and resealing.`
- Click **"Next: Location →"**

#### Section 1 — Location:
- **Street Address:** `742 Evergreen Terrace`
- **City:** `Austin`
- **State:** `TX`
- **Zip Code:** `78701`
- **Country:** `USA`
- Click **"Next: Shape & Size →"**

#### Section 2 — Shape & Size:
- **Deck Shape:** Select `Rectangle`
- **Measurement Unit:** `Feet (ft)`
- **Length:** `24`
- **Width:** `16`
- *(The form automatically computes and previews the Area: `384 sq ft`)*
- Click **"Next: Structure →"**

#### Section 3 — Structure Details:
- **Number of Levels:** `1`
- **Attached to House?** Check `Yes`
- **Has Perimeter Railings?** Check `Yes`
  - **Railing Length:** `64`
- **Has Stairs?** Check `Yes`
  - **Number of Steps:** `4`
- **Built-in Features:** Check `Built-in Benches`
- Click **"Next: Surface Details →"**

#### Section 4 — Surface Details:
- **Surface Material:** Select `Natural Wood (Cedar, Redwood, Pressure-Treated Pine)`
- **Current Coating:** Select `Clear Sealant / Water Repellent`
- Click **"Next: Visible Condition →"**

#### Section 5 — Visible Condition:
- Check `Peeling / Flaking Coating`
- Check `Surface Splinters & Wear`
- Click **"Next: Photographs →"**

#### Section 6 — Photographs:
- *(Optional: upload any `.jpg` or `.png` photo, or click "Next: Review & Save →" to skip)*

#### Section 7 — Review & Save:
- Review the summary card showing **Lakefront Cedar Deck**, **384 sq ft**, **Natural Wood**.
- Click the blue button: **"Save Deck Project"**.

### Expected Result:
- Project saves to MongoDB Atlas and redirects to:  
  👉 **`http://localhost:5173/customer/decks/<deckId>`**
- You see the Deck Overview page with all dimensions (`24 ft x 16 ft = 384 sq ft`), surface details, and status.

---

## Test Scenario 3: Generate a Restoration Estimate

### Goal
Generate a line-item pricing estimate for your newly created deck project.

### Steps:
1. On the Deck Detail page (`http://localhost:5173/customer/decks/<deckId>`), click **"Generate Estimate"** or **"New Estimate"**.  
   *(Alternatively navigate to: `http://localhost:5173/customer/decks/<deckId>/estimate/new`)*
2. In the Estimate Builder form:

| Option | Selection |
|---|---|
| **Stain / Sealant Material** | Select any available product from the dropdown (e.g. *Olympic Maximum Semi-Transparent Stain*) |
| **Number of Coats** | `2` |
| **Restoration Services** | Check `Surface Cleaning & Pressure Washing` and `Stain Application` |
| **Project Notes** | `Please schedule for weekend inspection.` |

3. Observe the live pricing preview on the right side updating:
   - Materials Subtotal
   - Labor Subtotal
   - Taxes & Fees
   - **Estimated Total Price**
4. Click **"Save & Generate Estimate"**.

### Expected Result:
- Redirects to **`http://localhost:5173/customer/estimates/<estimateId>`**.
- Displays the official Estimate Number (e.g. `EST-XXXXXX`), financial line items, subtotal, and status `DRAFT`.

---

## Test Scenario 4: Contractor Account Registration & Onboarding

### Goal
Register as a contractor, test the contractor-specific input fields, and verify the verification pending lifecycle.

### Steps:
1. In the top navigation bar, click **"Sign Out"** to log out of Alice's account.
2. Go to:  
   👉 **[http://localhost:5173/register](http://localhost:5173/register)**
3. Select **Account Type**: **`Contractor`** (click the radio button).
4. Notice that contractor-specific fields appear. Fill in:

| Field | Value to Enter |
|---|---|
| **Account Type** | `Contractor` |
| **Full Name** | `Robert Builder` |
| **Email Address** | `robert.builder@example.com` |
| **Phone** | `555-987-6543` |
| **Password** | `Password123!` |
| **Business Name** | `Apex Deck Restorations LLC` |
| **License Number** | `LIC-TX-2026-99` |
| **License Jurisdiction** | `Texas Licensing Board` |

5. Click **"Create Account"**.

### Expected Result:
- Account is created and you are redirected to:  
  👉 **`http://localhost:5173/contractor/dashboard`**
- Notice the prominent banner at the top:  
  ⚠️ **"Verification Pending: Your contractor application is currently under review by platform administrators."**
- Restricted contractor tools are safely guarded while your profile is under review.

---

## Test Scenario 5: Platform Administrator Command Center

### Goal
Sign in with platform administrator credentials and test all 8 administrative oversight tabs.

### Steps:
1. Click **"Sign Out"** in the top navigation.
2. Go to:  
   👉 **[http://localhost:5173/login](http://localhost:5173/login)**
3. Sign in with the pre-seeded platform admin credentials:

| Field | Value to Enter |
|---|---|
| **Email Address** | `admin@deckestimator.com` |
| **Password** | `AdminPass123!` |

4. Click **"Sign In"**.

### Expected Result:
- You are authenticated with `role: admin` and redirected to:  
  👉 **`http://localhost:5173/admin/dashboard`**

---

### Step-by-Step Walkthrough of the 8 Admin Tabs:

Click each tab along the top of the Admin Workstation to verify its functionality:

#### Tab 1: 📊 Operations Overview
- Displays platform summary KPI cards computed live from MongoDB Atlas:
  - **Total Users:** Shows count (including Alice and Robert).
  - **Total Decks & Total Square Footage:** Reflects the 384 sq ft deck created.
  - **Estimates Volume:** Shows pipeline volume.
  - **Recent Activity Timeline:** Shows chronological audit actions (`CREATE_USER`, `CREATE_DECK`, `CREATE_ESTIMATE`).

#### Tab 2: 👥 User Directory
- Displays a searchable, paginated table of platform users.
- **Search Test:** Type `Robert` into the search box -> filter down to Robert Builder.
- **Role Filter Test:** Select `Contractor` from the role dropdown.

#### Tab 3: 🛠️ Deck Records
- Lists all platform deck projects.
- Locate `Lakefront Cedar Deck` created in Test Scenario 2 with dimensions `24 x 16 ft` and owner `Alice Customer`.

#### Tab 4: 📐 Estimates Oversight
- Lists all generated estimates across the platform.
- Locate the estimate created in Test Scenario 3 with status `DRAFT`.

#### Tab 5: 🧠 AI Condition Telemetry
- Displays AI visual inspection metrics, sharpness scores, detected defect tags, and manual review flags.

#### Tab 6: ⚙️ Platform Settings
- Displays runtime platform configurations.
- **Test Creating a Setting:**
  - Click **"+ Add Setting"**
  - Key: `TEST_BANNER_TEXT`
  - Category: `GENERAL`
  - Label: `Announcement Banner`
  - Value Type: `STRING`
  - Value: `Spring Deck Restoration Season is Live!`
  - Click **"Save Setting"**.
  - Setting appears in the table.

#### Tab 7: 📜 Audit Logs
- Shows the forensic tamper-resistant audit trail.
- Every user registration, status change, and deck creation has a timestamped record with user ID and action name.

#### Tab 8: 📈 Reports & CSV
- Select a report type from the dropdown (e.g. `Users Directory`, `Decks Report`, `Estimates Report`).
- Click **"Download CSV"** to verify streaming CSV export in RFC 4180 format.

---

## Test Scenario 6: Admin Approves Contractor Verification

### Goal
Verify Robert Builder's contractor profile from the Admin Console so he becomes fully operational.

### Steps:
1. While logged in as Admin, navigate to:  
   👉 **[http://localhost:5173/admin/contractor-verifications](http://localhost:5173/admin/contractor-verifications)**
2. In the list of contractor applications, locate **Apex Deck Restorations LLC** (Robert Builder, status `PENDING`).
3. Click the **"Review Application"** button.
4. Click **"Approve Application"** (with optional note `Verified license with TX board`).
5. Application status updates to **`APPROVED`**.

---

## Quick Reference Summary Table

| Test Scenario | Page URL | Role | Key Action |
|---|---|---|---|
| **1. Customer Registration** | `/register` | Guest | Fill Alice Customer, password `Password123!` |
| **2. Deck Creation** | `/customer/decks/new` | Customer | Enter 24x16 ft Lakefront Cedar Deck, save |
| **3. Estimate Builder** | `/customer/decks/<id>/estimate/new` | Customer | Select stain + 2 coats, generate estimate |
| **4. Contractor Registration**| `/register` | Guest | Select Contractor radio, enter Apex Deck Restorations LLC |
| **5. Admin Command Center** | `/admin/dashboard` | Admin (`admin@deckestimator.com`) | Click through all 8 tabs, inspect real metrics |
| **6. Contractor Approval** | `/admin/contractor-verifications` | Admin | Approve Robert Builder's pending application |

