# 01. ADMIN DASHBOARD
## Business Overview & Quick Insights

### 1. Purpose

The Admin Dashboard is the first page displayed after Admin logs in to DECK PRO.

It should provide a quick understanding of:

- Overall business activity
- Customer and contractor registrations
- Lead status and hot priority leads
- Project activity
- Estimate generation and estimated value
- Important recent activities

The dashboard should use a combination of summary cards, meaningful charts and small information panels.

**Design principle:** Show only information that helps Admin understand the business and take action. Avoid unnecessary charts and repeated information.

---

# 2. FINAL DASHBOARD STRUCTURE

The dashboard should contain these sections:

1. Summary Cards
2. Business Activity Trend
3. Lead Overview
4. Hot Priority Leads
5. Project Overview
6. Recent Activities

---

# 3. SUMMARY CARDS

Display important business metrics at the top of the dashboard.

Use two rows of clean summary cards.

### Row 1 – Business Summary

| Card | Information |
|---|---|
| Total Users | Total registered customers and contractors |
| Customers | Total registered customers |
| Contractors | Total registered contractors |
| Total Leads | Total leads received |

### Row 2 – Business Operations

| Card | Information |
|---|---|
| Hot Priority Leads | Number of leads marked as Hot or High Priority |
| Active Projects | Number of currently active projects |
| Total Estimates | Total estimates generated |
| Estimated Value | Combined value of saved estimates |

### Example UI

```text
----------------------------------------------------------
ADMIN DASHBOARD
----------------------------------------------------------

[Total Users]   [Customers]   [Contractors]   [Total Leads]

    250             180           70              120

[Hot Priority]  [Active Projects] [Estimates] [Estimated Value]

      18               45            310         $125,000

----------------------------------------------------------
```

### Important: Hot Priority Leads Summary Card

This card is especially important.

It should display:
- Total number of Hot Priority Leads.
- A clear priority indicator.
- A quick action to open the Hot Priority Leads list.

Example:

```text
+-----------------------------+
| HOT PRIORITY LEADS          |
|                             |
|          18                 |
|                             |
| High-priority leads         |
|                             |
| [View Hot Leads →]          |
+-----------------------------+
```

Clicking this card should open the Leads page with the Hot Priority filter already applied.

The count must be calculated from actual lead records using the approved lead priority field.

---

# 4. BUSINESS ACTIVITY TREND

### Purpose

Show whether DECK PRO business activity is increasing or decreasing.

**Use one combined line chart.**

Display three important activities:

- New user registrations
- Leads received
- Estimates generated

### Example UI

```text
----------------------------------------------------------
BUSINESS ACTIVITY TREND

Period: [Last 30 Days v]

       Activity
          |
      50  |             *
      40  |        *    *
      30  |   *    *         *
      20  |   *         *
      10  | *
          |________________________
            Week 1  Week 2  Week 3  Week 4

Legend:
---- User Registrations
---- Leads Received
---- Estimates Generated
----------------------------------------------------------
```

### How it works

- Display activity over the selected period.
- Allow Admin to switch between weekly, monthly and yearly views.
- Show exact values when hovering over the chart.
- Update the chart when the date filter changes.

**Why this visual?**

Admin can understand overall platform activity without opening three separate reports.

---

# 5. LEAD OVERVIEW

### Purpose

Give Admin a quick understanding of the current lead situation.

Use a compact lead status visualization.

### Lead Status

- New
- Assigned
- In Progress
- Converted
- Lost

### Example UI

```text
----------------------------------------------------------
LEAD OVERVIEW

Total Leads: 120

New          30
Assigned     35
In Progress  25
Converted    20
Lost         10

             [View All Leads]
----------------------------------------------------------
```

### Recommended Visual

Use a horizontal stacked bar or compact donut chart with a clear legend.

Do not use both. A stacked bar is preferable when Admin needs to compare exact lead counts.

### How it works

When Admin clicks a status, open the Leads page with the corresponding status filter applied.

---

# 6. HOT PRIORITY LEADS – QUICK ACTION WINDOW

### Purpose

This is one of the most important dashboard sections.

Admin should immediately identify high-priority leads that need attention.

Show a small panel on the dashboard with the latest or most urgent Hot Priority Leads.

### Example UI

```text
----------------------------------------------------------
HOT PRIORITY LEADS                         Total: 18

Lead ID    Customer       Priority    Status
----------------------------------------------------------
LD-101     Customer A     HOT         New
LD-105     Customer B     HOT         Assigned
LD-109     Customer C     HOT         In Progress
LD-112     Customer D     HOT         New
----------------------------------------------------------

              [View All Hot Leads →]
----------------------------------------------------------
```

### Information to display

- Lead ID
- Customer name
- Priority
- Current status
- Created date or age of lead

Keep this panel compact. Display approximately 4–5 leads and provide a View All option.

### How it works

1. When a lead is marked Hot or High Priority, it becomes eligible for this panel.
2. The dashboard displays the most urgent leads first.
3. Admin can click an individual lead to open its details.
4. Admin can click View All Hot Leads to open the filtered Leads page.

### Sorting

Prioritize leads using:

1. Hot priority first.
2. Oldest unaddressed lead next.
3. Other relevant urgency rules defined by the lead workflow.

Do not classify a lead as Hot based on assumptions. Use the actual priority assigned through the lead management process.

---

# 7. PROJECT OVERVIEW

### Purpose

Show the current project situation without adding unnecessary visualizations.

### Display

- Total Projects
- Active Projects
- Completed Projects
- On-Hold Projects

### Recommended Visual

Use one donut chart showing project status distribution.

```text
----------------------------------------------------------
PROJECT OVERVIEW

Total Projects: 85

       PROJECT STATUS

        Active       45
        Completed    30
        On Hold      10

             [View Projects →]
----------------------------------------------------------
```

The actual chart should show both percentages and counts.

### How it works

Clicking a status or View Projects opens the Projects page with the relevant filter applied.

Only show statuses supported by the actual project workflow.

---

# 8. RECENT ACTIVITIES

### Purpose

Give Admin a quick view of the latest important actions across DECK PRO.

### Example UI

```text
----------------------------------------------------------
RECENT ACTIVITIES                         [View All]

Date       User          Activity
----------------------------------------------------------
05 Nov     Customer A    Estimate Created
05 Nov     Contractor A  Project Created
04 Nov     Customer B    New Registration
04 Nov     Admin         Lead Assigned
----------------------------------------------------------
```

### Display information

- Date and time
- User name
- Activity type
- Related record ID

Show only the latest 5–7 activities.

Clicking an activity should open the corresponding record when the Admin has permission.

---

# 9. FINAL DASHBOARD SCREEN DESIGN

This is the recommended arrangement for the complete dashboard.

```text
================================================================
DECK PRO                                      ADMIN PORTAL
================================================================

DASHBOARD

Date Range: [Last 30 Days v]

----------------------------------------------------------------
SUMMARY CARDS
----------------------------------------------------------------

[Total Users] [Customers] [Contractors] [Total Leads]

[Hot Priority Leads] [Active Projects] [Estimates] [Estimated Value]

----------------------------------------------------------------
BUSINESS ACTIVITY TREND
----------------------------------------------------------------

[                                                       ]
[             Combined Line Chart                      ]
[                                                       ]

----------------------------------------------------------------
LEAD OVERVIEW                     HOT PRIORITY LEADS
----------------------------------------------------------------

[Lead Status Chart]               Total Hot Leads: 18

                                  LD-101  Customer A  HOT
                                  LD-105  Customer B  HOT
                                  LD-109  Customer C  HOT
                                  LD-112  Customer D  HOT

                                  [View All Hot Leads]

----------------------------------------------------------------
PROJECT OVERVIEW                  RECENT ACTIVITIES
----------------------------------------------------------------

[Project Status Donut]            Customer A - Estimate Created
                                  Contractor A - Project Created
                                  Customer B - Registered
                                  Admin - Lead Assigned

                                  [View All Activities]

================================================================
```

---

# 10. DASHBOARD INTERACTIONS

Every dashboard component should provide a useful action.

| Dashboard Component | Expected Action |
|---|---|
| Total Users | Open Users page |
| Customers | Open filtered customer list |
| Contractors | Open filtered contractor list |
| Total Leads | Open Leads page |
| Hot Priority Leads | Open Hot Priority Leads list |
| Active Projects | Open active projects |
| Total Estimates | Open estimation records |
| Estimated Value | Open Pricing Reports |
| Lead Chart | Open filtered lead records |
| Project Chart | Open filtered project records |
| Recent Activity | Open related record |

The dashboard should help Admin navigate directly to the relevant information.

---

# 11. FILTERS

Provide one global date filter at the top.

Available options:

- Today
- Yesterday
- Last 7 Days
- Last 30 Days
- This Month
- Last Month
- This Year
- Custom Date Range

The selected date range should update relevant time-based metrics and charts.

**Important distinction:** Current totals such as Total Users and Active Projects may represent current database status, while activity charts represent records created during the selected period. Make this distinction clear in the UI.

Hot Priority Leads should show currently qualifying leads by default, with lead urgency and age used for ordering. The date filter should not silently hide urgent open leads.

---

# 12. BACKEND AND FUNCTIONAL REQUIREMENTS

All dashboard components must use actual backend data.

### Required Data

| Component | Required Backend Data |
|---|---|
| User Cards | Customer and contractor records |
| Lead Cards | Lead records and priority |
| Project Cards | Project records and status |
| Estimate Cards | Saved estimate records |
| Estimated Value | Saved estimate totals |
| Business Activity Chart | Timestamped registration, lead and estimate records |
| Lead Overview | Lead status |
| Hot Priority Leads | Priority, status, customer and creation date |
| Project Overview | Project status |
| Recent Activities | Application activity logs |

### Functional Requirements

1. All summary cards must display accurate values.
2. Hot Priority Leads count must match the filtered lead records.
3. The Hot Priority Leads panel must show the correct records.
4. Dashboard charts must use actual database data.
5. Date filters must work correctly.
6. Summary cards and charts must link to relevant pages.
7. Recent activities must update when supported actions occur.
8. Loading, empty and error states must be handled.
9. All dashboard sections must be responsive.
10. Only authorized Admin users should access this dashboard.

---

# 13. FINAL DESIGN DECISIONS

| Section | Design | Decision |
|---|---|---|
| Summary Cards | Metric cards | Must have |
| Business Activity | Combined line chart | Must have |
| Lead Overview | Compact status visualization | Must have |
| Hot Priority Leads | Small actionable list | Must have |
| Project Overview | Donut chart | Must have |
| Recent Activities | Compact table | Must have |

### Avoid Adding

- Multiple charts showing the same information.
- Separate charts for every individual metric.
- Decorative visualizations without business value.
- Large tables that belong in detailed report pages.
- Revenue and profit metrics without actual payment and expense data.
- Fake growth percentages or dummy activity values.

---

# 14. FINAL EXPECTATION

The DECK PRO Admin Dashboard should provide a clear business overview in one screen.

The most important requirements are:

1. Summary cards for important business counts.
2. A combined business activity chart to understand platform trends.
3. A clear lead status overview.
4. A dedicated Hot Priority Leads card with its count.
5. A small Hot Priority Leads list for immediate action.
6. A project status overview.
7. A recent activities panel.

**Final objective:** When Admin opens the Dashboard, they should immediately understand the business situation, identify urgent leads and navigate to important records without opening multiple pages.

Keep the UI clean, interactive and consistent with the DECK PRO blue-and-white theme.
-----------------------------------------------------------------------------------------------------------
# DECK RESTORATION PLUS
## Two Additional Admin Portal Pages – Complete Requirements

# PAGE 12: VERIFICATION & PROGRESS

## 1. Purpose

This page allows Admin to manage contractor registration requests, customer and contractor accounts, permissions and project progress.

Admin must have control over:
- Approving or rejecting contractor registration requests.
- Blocking and unblocking customers.
- Blocking and unblocking contractors.
- Deleting customer and contractor accounts.
- Managing permissions.
- Tracking and updating project progress.
- Monitoring completed and pending work.

This must be **one main sidebar page with five horizontal tabs**.

### 2. Page Navigation

```text
┌───────────────────────────────────────────────────────────────┐
│ VERIFICATION & PROGRESS                                      │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│ Verifications | Customers | Contractors | Permissions | Progress │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│                    Selected Tab Content                       │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## TAB 1: VERIFICATIONS

### Purpose

Whenever a contractor registers through the Contractor Portal and requests account creation, the registration request must appear here.

Admin is responsible for approving or rejecting the request.

### UI Layout

```text
VERIFICATIONS

┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ Pending        │ │ Approved       │ │ Rejected       │
│ Requests       │ │ Contractors    │ │ Requests       │
│      18        │ │      85        │ │       5        │
└────────────────┘ └────────────────┘ └────────────────┘

Search by name, email or phone...           [Filters]

┌───────────────────────────────────────────────────────────────┐
│ Name | Email | Phone | Registration Date | Status | Action   │
├───────────────────────────────────────────────────────────────┤
│ John  | ...   | ...   | ...               | Pending| View     │
│ David | ...   | ...   | ...               | Pending| View     │
└───────────────────────────────────────────────────────────────┘
```

### Contractor Verification Details

When Admin clicks View, display:

- Contractor Name
- Email
- Phone Number
- Registration Date
- Submitted Registration Information
- Uploaded Documents, if required by the existing registration process
- Verification Status

Actions:

**Approve**
- Admin approves the registration.
- Contractor account becomes approved and eligible for access according to the application's account activation rules.
- Status changes to Approved.
- Record the approval date and Admin action.

**Reject**
- Admin rejects the registration.
- Ask Admin to provide a rejection reason.
- Status changes to Rejected.
- Record the rejection reason and Admin action.
- Contractor should be informed through the supported notification mechanism.

Important:
- Only Admin can approve or reject contractor registration requests.
- Pending contractors must not receive approved contractor access.
- Prevent duplicate approval or rejection actions.
- Maintain verification history.

### Filters

- Search by name, email or phone.
- Verification status: Pending, Approved, Rejected.
- Registration date: Today, Last 7 Days, Last 30 Days, This Month, Custom Range.
- Sort: Newest First, Oldest First, Name A–Z, Name Z–A.

---

## TAB 2: CUSTOMERS

### Purpose

Admin can manage all customer accounts from one place.

### UI Layout

```text
CUSTOMERS

Total Customers | Active | Blocked

Search customers...                         [Filters]

┌───────────────────────────────────────────────────────────────┐
│ Customer ID | Name | Email | Projects | Status | Action       │
├───────────────────────────────────────────────────────────────┤
│ C-101       | John | ...   | 5        | Active | View         │
│ C-102       | Alex | ...   | 2        | Blocked| View         │
└───────────────────────────────────────────────────────────────┘
```

### Available Actions

**View**
- Open customer profile.
- Display personal information.
- Display associated projects and estimates.

**Block**
- Admin can block a customer account.
- Ask for confirmation and optionally record a reason.
- Prevent the customer from accessing restricted portal functionality.

**Unblock**
- Restore customer account access.
- Update account status.

**Delete**
- Admin can initiate customer account deletion.
- Show a confirmation dialog.
- Check associated projects, estimates and other records before deletion.
- Preserve business records and historical references according to the application's data-retention rules.
- Do not permanently erase related business records automatically.

### Filters

- Search by customer name, email, phone or customer ID.
- Account status: All, Active, Blocked.
- Registration date: Today, Last 7 Days, Last 30 Days, This Month, Custom Range.
- Project activity: All, Has Projects, No Projects.
- Estimate activity: All, Has Estimates, No Estimates.
- Sort: Newest, Oldest, Name A–Z, Name Z–A.

---

## TAB 3: CONTRACTORS

### Purpose

Admin can manage all approved contractor accounts.

### UI Layout

```text
CONTRACTORS

Total Contractors | Active | Blocked

Search contractors...                       [Filters]

┌───────────────────────────────────────────────────────────────┐
│ Contractor ID | Name | Email | Projects | Status | Action     │
├───────────────────────────────────────────────────────────────┤
│ CT-101        | David| ...   | 12       | Active | View       │
│ CT-102        | Mark | ...   | 8        | Blocked| View       │
└───────────────────────────────────────────────────────────────┘
```

### Available Actions

**View Contractor**
- Open contractor profile.
- Display registration information.
- Display associated projects.
- Display estimates and project completion history, where available.

**Block**
- Admin can block a contractor.
- Ask for confirmation and optionally record a reason.
- Prevent access to restricted contractor portal functionality.

**Unblock**
- Restore contractor account access.

**Delete**
- Admin can initiate contractor account deletion.
- Show a confirmation dialog.
- Check associated projects, estimates and historical records.
- Preserve required business records according to the application's retention rules.

### Filters

- Search by contractor name, email, phone or contractor ID.
- Account status: All, Active, Blocked.
- Registration date: Today, Last 7 Days, Last 30 Days, This Month, Custom Range.
- Project activity: All, Has Projects, No Projects.
- Project completion: All, Has Completed Projects, No Completed Projects.
- Sort: Newest, Oldest, Name A–Z, Name Z–A.

---

## TAB 4: PERMISSIONS

### Purpose

Admin should be able to manage which portal features and actions are accessible to customers and contractors.

### UI Layout

```text
PERMISSIONS

┌───────────────────────────────────────────────────────────────┐
│ Permission Name       | Customer | Contractor | Admin        │
├───────────────────────────────────────────────────────────────┤
│ View Dashboard        |    Yes   |    Yes     | Yes          │
│ View Projects         |    Yes   |    Yes     | Yes          │
│ Create Estimate       |    Yes   |    Yes     | Yes          │
│ Update Project        |    No    |    Yes     | Yes          │
│ Manage Users          |    No    |    No      | Yes          │
└───────────────────────────────────────────────────────────────┘

                                     [Save Permissions]
```

The rows above are illustrative examples, not confirmed DECK PRO permission rules.

### Requirements

- Display available application modules and supported actions.
- Show permissions separately for Customer, Contractor and Admin roles.
- Allow authorized Admin users to update configurable permissions.
- Save changes to the backend.
- Enforce permissions in backend APIs, not only by hiding frontend buttons.
- Changes should take effect according to the application's session and authorization rules.
- Maintain permission change history.

Do not invent permissions that are not supported by the application's role and authorization structure.

---

## TAB 5: PROGRESS

### Purpose

This is an important project-monitoring section.

Admin should be able to view customer and contractor projects together and track whether work is pending, in progress or completed.

Admin must also be able to update project progress.

### UI Layout

```text
PROJECT PROGRESS

┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ Total Projects │ │ In Progress   │ │ Completed      │
│      120       │ │      45        │ │      60        │
└────────────────┘ └────────────────┘ └────────────────┘

┌────────────────┐
│ Pending        │
│      15        │
└────────────────┘

Search by project, customer or contractor...       [Filters]

┌─────────────────────────────────────────────────────────────────────┐
│ Project ID | Project | Customer | Contractor | Progress | Status    │
├─────────────────────────────────────────────────────────────────────┤
│ PR-101     | Deck A  | John     | David      | 100%     | Completed │
│ PR-102     | Deck B  | Alex     | Mark       | 60%      | In Progress│
│ PR-103     | Deck C  | Sarah    | David      | 0%       | Pending   │
└─────────────────────────────────────────────────────────────────────┘

[Previous]             Page 1 of 10              [Next]

                                   [Export CSV] [Export Excel]
```

### Project Details

When Admin opens a project, display:

- Project ID
- Project Name
- Customer Name
- Contractor Name
- Project Creation Date
- Start Date, if recorded
- Expected Completion Date, if recorded
- Actual Completion Date, if recorded
- Current Progress Percentage
- Current Project Status
- Last Updated Date
- Progress Update History, if available

### Update Progress

Admin must be able to update project progress.

Example:

```text
UPDATE PROJECT PROGRESS

Project: PR-102

Current Progress: 60%

New Progress: [75%]

Project Status: [In Progress ▼]

Update Notes:
[Work completed on the deck surface...]

                 [Cancel] [Save Progress]
```

### Progress Rules

- Admin can update the progress percentage.
- Admin can update the project status.
- Save the updated information to the database.
- Record the Admin who made the change.
- Record the update date and time.
- Maintain previous progress updates as history.
- Show the latest saved progress on the project list.
- Progress and status should remain consistent.
- A completed project should show 100% progress.
- Do not automatically mark a project completed without the required completion action or confirmation.

### Project Status

Use the existing project workflow statuses.

At minimum, the requested views should distinguish:

- Pending
- In Progress
- Completed

If the application already supports additional statuses, display those as well rather than silently replacing them.

### Progress Filters

This page needs strong filtering functionality.

| Filter | Options |
|---|---|
| Search | Project ID, project name, customer name, contractor name |
| Project Status | All, Pending, In Progress, Completed |
| Customer | Select a customer |
| Contractor | Select a contractor |
| Progress | 0%, 1–25%, 26–50%, 51–75%, 76–99%, 100% |
| Project Date | Today, Last 7 Days, Last 30 Days, This Month, Custom Range |
| Completion Date | All, Completed within selected date range |
| Sort | Newest, Oldest, Progress Low–High, Progress High–Low |

Filters must work together.

Example:
Admin selects:
- Contractor: David
- Project Status: In Progress
- Progress: 51–75%

The table should show only David's projects matching all three conditions.

### Export Functionality

Mandatory:
- Export CSV.
- Export Excel.

Export must:
1. Respect the selected filters.
2. Export all matching projects.
3. Not restrict exports to the current pagination page.
4. Include project ID, project name, customer, contractor, progress, status and available dates.
5. Generate a valid CSV or XLSX file.
6. Show a clear message when no matching records exist.

---

# PAGE 13: DISCOUNTS MANAGEMENT

## 1. Purpose

The Discounts page allows Admin to manage contractor discounts applied to estimates.

DECK PRO should have a **default contractor discount of 10%**.

Admin must also be able to provide different discounts to individual contractors based on their completed project performance.

The discount should affect the applicable estimation calculation.

This must be one separate sidebar page.

---

## 2. Page Layout

```text
DISCOUNTS MANAGEMENT

┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ Default        │ │ Contractors    │ │ Active Discount│
│ Discount       │ │ With Discounts │ │ Rules          │
│      10%       │ │      85        │ │      85        │
└────────────────┘ └────────────────┘ └────────────────┘

Default Contractor Discount

┌───────────────────────────────────────────────────────────────┐
│ Default Discount: [ 10 ] %                                   │
│                                                               │
│ Applies to contractors without an individual discount rule.   │
│                                                               │
│                                            [Save Default]     │
└───────────────────────────────────────────────────────────────┘

Contractor Discount List

Search contractor name or ID...                 [Filters]

┌────────────────────────────────────────────────────────────────────┐
│ Contractor | Completed Projects | Default | Current Discount | Edit│
├────────────────────────────────────────────────────────────────────┤
│ David      | 25                 | 10%     | 15%              | Edit│
│ Mark       | 12                 | 10%     | 12%              | Edit│
│ John       |  3                 | 10%     | 10%              | Edit│
└────────────────────────────────────────────────────────────────────┘
```

All counts and contractor examples above are illustrative.

---

## 3. Default Discount Configuration

### Default Value: 10%

When a contractor does not have an individual discount configuration, the default discount should apply.

Admin can edit the default percentage.

Example:

| Setting | Value |
|---|---:|
| Default Discount | 10% |
| Applies To | Contractors without individual rules |
| Status | Active |

### Behaviour

- New eligible contractors receive the default 10% discount.
- Existing contractors without individual rules also receive the default discount.
- Changing the default discount affects contractors who rely on the default.
- Individual contractor discounts must not be overwritten when the default changes.
- Save changes to the backend.
- New estimates should use the applicable saved discount configuration.

---

## 4. Individual Contractor Discounts

### Purpose

Admin can provide different discount percentages to different contractors.

Contractors who complete more projects may qualify for higher discounts.

Admin should be able to review completed project counts and adjust discounts.

### Contractor Discount Table

| Contractor | Completed Projects | Current Discount | Discount Type | Action |
|---|---:|---:|---|---|
| David | 25 | 15% | Individual | Edit |
| Mark | 12 | 12% | Individual | Edit |
| John | 3 | 10% | Default | Edit |

These are illustrative examples, not approved discount tiers.

### Edit Contractor Discount

When Admin clicks Edit:

```text
EDIT CONTRACTOR DISCOUNT

Contractor Name: David Miller
Contractor ID: CT-101

Completed Projects: 25

Default Discount: 10%

Individual Discount: [15] %

Reason for Change:
[Consistently completed projects...]

Status: [Active ▼]

                 [Cancel] [Save Discount]
```

### Requirements

Admin should be able to:

- View contractor completed project count.
- View default discount.
- Set an individual discount.
- Edit an existing individual discount.
- Restore the contractor to the default discount.
- Activate or deactivate an individual discount rule.
- Record the reason for a discount change.

The individual discount should override the default discount while the individual rule is active.

---

## 5. Completed Projects and Discount Decisions

The completed project count should come from actual project records.

Admin can use the count to decide whether to increase a contractor's discount.

Example:

| Completed Projects | Example Discount |
|---|---:|
| 0–4 | 10% |
| 5–9 | 11% |
| 10–19 | 12% |
| 20–29 | 15% |
| 30+ | 18% |

**Important:** These percentages are examples to demonstrate the feature. They are not confirmed business rules.

Admin must be able to decide the actual discount for each contractor.

Do not automatically increase discounts based on these example tiers unless DECK PRO approves and configures an automatic tier-based rule.

---

## 6. Discount Filters

The contractor list must support:

| Filter | Options |
|---|---|
| Search | Contractor name, email, contractor ID |
| Discount Type | All, Default, Individual |
| Discount Percentage | Custom percentage range |
| Completed Projects | Custom project-count range |
| Discount Status | All, Active, Inactive |
| Registration Date | Last 7 Days, Last 30 Days, This Month, Custom Range |
| Sort | Name A–Z, Name Z–A, Highest Discount, Lowest Discount, Most Completed Projects |

All filters must work together.

Example:

Admin selects:
- Discount Type: Individual
- Completed Projects: 10–30
- Discount Status: Active

The table should show only active individual discount rules for contractors with 10–30 completed projects.

---

## 7. How Discount Applies to Estimates

The discount configuration must connect to the actual estimation calculation.

Example:

```text
Contractor: David Miller

Estimate Base Amount: ₹50,000

Applicable Discount: 15%

Discount Amount: ₹7,500

Final Estimate Amount: ₹42,500
```

The example is illustrative.

### Calculation

```text
Discount Amount =
Base Estimate Amount × Discount Percentage / 100

Final Estimate Amount =
Base Estimate Amount − Discount Amount
```

### Important Calculation Requirements

- Apply the correct contractor discount when generating an estimate.
- Use the default 10% when no active individual discount exists.
- Use the individual discount when an active individual rule exists.
- Do not apply both discounts together.
- Display the discount percentage and discount amount in the estimate breakdown.
- Display the final estimate amount after discount.
- Save the applied discount percentage and amount with the estimate.
- Existing saved estimates should retain their original applied discount values when discount settings change.
- New estimates should use the latest applicable configuration.
- Verify that the discount is applied only to the intended contractor estimates and not accidentally to customer estimates.

---

## 8. Discount History and Audit

Maintain a record whenever Admin changes:

- Default discount percentage.
- Individual contractor discount.
- Discount status.
- Contractor's discount type.
- Reason for discount change.

History should include:

| Date | Contractor | Previous Discount | New Discount | Updated By |
|---|---|---:|---:|---|
| 05-11-2026 | David | 10% | 15% | Admin |
| 04-11-2026 | Mark | 10% | 12% | Admin |

Values are illustrative.

This allows Admin to understand why a contractor has a particular discount.

---

# FINAL IMPLEMENTATION REQUIREMENTS

## Page 12 – Verification & Progress

- Five horizontal tabs: Verifications, Customers, Contractors, Permissions and Progress.
- Contractor registration approval and rejection must work.
- Customer and contractor block/unblock actions must work.
- Account deletion must follow data-retention rules.
- Permissions must be enforced by the backend.
- Project progress must be editable.
- Project updates must be saved with history.
- Filters must work across the relevant records.
- CSV and Excel exports are mandatory for Progress.

## Page 13 – Discounts Management

- Default contractor discount must be 10%.
- Admin can change the default discount.
- Admin can configure individual contractor discounts.
- Completed project counts must come from actual database records.
- Admin can increase or decrease individual discounts.
- Individual discounts override the default.
- Discount configuration must connect to the estimation calculation.
- Estimates must store the discount applied at the time of creation.
- Discount changes must be recorded in audit history.

## Overall UI Requirements

- Use the existing DECK RESTORATION PLUS branding.
- Maintain the navy-blue and bright-white theme.
- Keep the existing sidebar design consistent.
- Use horizontal tabs for the five sections of Verification & Progress.
- Use clean tables, filters, status badges, confirmation dialogs and clear action buttons.
- All actions must work with real backend data.
- Do not introduce dummy data or non-functional buttons.
- Follow the existing project architecture and reuse existing APIs and components wherever possible.
-----------------------------------------------------------------------------------------------------------


# 02. USER MANAGEMENT
## Complete UI, Filters and Functional Requirements

### 1. Purpose

User Management allows Admin to manage all registered customers and contractors in DECK PRO.

Admin should be able to view users, search records, apply filters, check individual profiles, understand user activity and manage account status.

Keep everything inside **one User Management page** with four horizontal tabs.

### 2. Page Structure

The page contains four tabs:

1. All Users
2. Customers
3. Contractors
4. User Activity

```text
┌────────────────────────────────────────────────────────────┐
│ USER MANAGEMENT                                            │
│ Manage customers and contractors                           │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ [All Users] [Customers] [Contractors] [User Activity]      │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│                 SELECTED TAB CONTENT                       │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

# 3. ALL USERS TAB

### Purpose
Display all registered customers and contractors in one table.

### A. Summary Cards

Display five summary cards.

| Card | Information |
|---|---|
| Total Users | All registered users |
| Customers | Total customer accounts |
| Contractors | Total contractor accounts |
| Active Users | Active accounts |
| Inactive Users | Inactive accounts |

### UI Representation

```text
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ TOTAL USERS     │ │ CUSTOMERS       │ │ CONTRACTORS     │
│      250        │ │      180        │ │       70        │
└─────────────────┘ └─────────────────┘ └─────────────────┘

┌─────────────────┐ ┌─────────────────┐
│ ACTIVE USERS    │ │ INACTIVE USERS  │
│      220        │ │       30        │
└─────────────────┘ └─────────────────┘
```

*Numbers are illustrative, not actual DECK PRO data.*

### B. Search and Filters

Place search and filters above the user table.

**Search field:**
- User name
- Email address
- User ID
- Phone number

**Filters:**

| Filter | Options |
|---|---|
| User Type | All, Customer, Contractor |
| Account Status | All, Active, Inactive |
| Registration Date | Today, Last 7 Days, Last 30 Days, This Month, Custom Range |
| Sort By | Newest First, Oldest First, Name A–Z, Name Z–A |

### UI Representation

```text
┌────────────────────────────────────────────────────────────┐
│ SEARCH AND FILTERS                                         │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Search                                                     │
│ [ Search name, email, phone or user ID             🔍 ]    │
│                                                            │
│ User Type       Account Status       Registration Date     │
│ [All Users ▼]   [All Status ▼]       [Last 30 Days ▼]      │
│                                                            │
│ Sort By         [Newest First ▼]                           │
│                                                            │
│ [Apply Filters]                         [Clear Filters]    │
└────────────────────────────────────────────────────────────┘
```

### C. User List Table

| User ID | Name | User Type | Email | Registration Date | Status | Action |
|---|---|---|---|---|---|---|
| U101 | Customer A | Customer | user1@mail.com | 05 Nov | Active | View |
| U102 | Customer B | Customer | user2@mail.com | 04 Nov | Active | View |
| U103 | Contractor A | Contractor | user3@mail.com | 03 Nov | Active | View |
| U104 | Customer C | Customer | user4@mail.com | 02 Nov | Inactive | View |

### Table Actions

- View Details
- Activate Account
- Deactivate Account

Show account actions only when the Admin has the required permission.

### D. Table Functionality

- Pagination: 10, 25, 50 or 100 records per page.
- Sorting by supported columns.
- Search across user records.
- Apply multiple filters together.
- Display total matching records.
- Clear all filters.
- Maintain filters while moving between table pages.

**Example:** If Admin selects Customer + Active + Last 30 Days, show only active customers registered during the selected period.

---

# 4. CUSTOMERS TAB

### Purpose
Display and manage customer accounts separately.

### A. Summary Cards

- Total Customers
- Active Customers
- Inactive Customers
- New Customers

### B. Filters

| Filter | Options |
|---|---|
| Search | Name, Email, Phone, User ID |
| Account Status | All, Active, Inactive |
| Registration Date | Today, Last 7 Days, Last 30 Days, This Month, Custom |
| Project Activity | All, Has Projects, No Projects |
| Estimate Activity | All, Has Estimates, No Estimates |
| Sort By | Newest, Oldest, Name A–Z |

### C. UI Representation

```text
┌────────────────────────────────────────────────────────────┐
│ CUSTOMERS                                                  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ [Total: 180] [Active: 160] [Inactive: 20] [New: 15]       │
│                                                            │
│ Search: [Customer name / email / phone             🔍]     │
│                                                            │
│ Status:       [All Status ▼]                               │
│ Registration: [Last 30 Days ▼]                             │
│ Projects:     [All ▼]                                      │
│ Estimates:    [All ▼]                                      │
│                                                            │
│ [Apply Filters]                         [Clear Filters]    │
├────────────────────────────────────────────────────────────┤
│ CUSTOMER LIST                                              │
├────────────────────────────────────────────────────────────┤
│ Name       Email       Projects  Estimates  Status         │
│ Customer A user1@mail      3         5      Active         │
│ Customer B user2@mail      2         3      Active         │
│ Customer C user3@mail      0         0      Inactive       │
├────────────────────────────────────────────────────────────┤
│ Showing 1–10 of 180                         [Next →]       │
└────────────────────────────────────────────────────────────┘
```

### D. Customer Profile

When Admin clicks View, open the customer's detailed profile.

Display:

**Personal Information**
- Customer name
- User ID
- Email
- Phone
- Registration date
- Account status

**Activity Information**
- Total projects
- Total estimates
- Recent projects
- Recent estimates
- Last activity, if recorded

### Example

```text
┌────────────────────────────────────────────────────────────┐
│ CUSTOMER PROFILE                                  [Close X]│
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Customer Name:       Customer A                            │
│ User ID:             U101                                  │
│ Email:               user1@mail.com                        │
│ Phone:               +1 XXX XXX XXXX                       │
│ Registration Date:   05-Nov-2026                           │
│ Account Status:      ACTIVE                                │
│                                                            │
├────────────────────────────────────────────────────────────┤
│ CUSTOMER ACTIVITY                                          │
├────────────────────────────────────────────────────────────┤
│ Total Projects:       3                                    │
│ Total Estimates:      5                                    │
│                                                            │
│ Recent Projects                                           │
│ PRJ-101 – Deck Project A                                   │
│ PRJ-102 – Deck Project B                                   │
│                                                            │
│ Recent Estimates                                          │
│ EST-101                                                  │
│ EST-102                                                  │
│                                                            │
│ [Deactivate Account]                                      │
└────────────────────────────────────────────────────────────┘
```

---

# 5. CONTRACTORS TAB

### Purpose
Display and manage contractor accounts separately.

### A. Summary Cards

- Total Contractors
- Active Contractors
- Inactive Contractors
- New Contractors

### B. Filters

| Filter | Options |
|---|---|
| Search | Name, Email, Phone, User ID |
| Account Status | All, Active, Inactive |
| Registration Date | Today, Last 7 Days, Last 30 Days, This Month, Custom |
| Lead Activity | All, Has Assigned Leads, No Assigned Leads |
| Project Activity | All, Has Projects, No Projects |
| Sort By | Newest, Oldest, Name A–Z |

### C. UI Representation

```text
┌────────────────────────────────────────────────────────────┐
│ CONTRACTORS                                                │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ [Total: 70] [Active: 60] [Inactive: 10] [New: 8]          │
│                                                            │
│ Search: [Contractor name / email / phone           🔍]     │
│                                                            │
│ Status:       [All Status ▼]                               │
│ Registration: [Last 30 Days ▼]                             │
│ Leads:        [All ▼]                                      │
│ Projects:     [All ▼]                                      │
│                                                            │
│ [Apply Filters]                         [Clear Filters]    │
├────────────────────────────────────────────────────────────┤
│ CONTRACTOR LIST                                            │
├────────────────────────────────────────────────────────────┤
│ Name         Leads  Projects  Estimates  Status            │
│ Contractor A   10      5          8       Active            │
│ Contractor B    8      3          6       Active            │
│ Contractor C    2      1          2       Inactive          │
├────────────────────────────────────────────────────────────┤
│ Showing 1–10 of 70                          [Next →]       │
└────────────────────────────────────────────────────────────┘
```

### D. Contractor Profile

When Admin opens a contractor profile, display:

**Personal Information**
- Contractor name
- User ID
- Email
- Phone
- Registration date
- Account status

**Contractor Activity**
- Assigned leads, where applicable
- Total projects
- Total estimates
- Recent projects
- Recent leads
- Last activity, if recorded

### Example

```text
┌────────────────────────────────────────────────────────────┐
│ CONTRACTOR PROFILE                                [Close X]│
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Name:               Contractor A                           │
│ User ID:            U103                                   │
│ Email:              contractor@mail.com                   │
│ Phone:              +1 XXX XXX XXXX                        │
│ Registration Date:  03-Nov-2026                            │
│ Status:             ACTIVE                                 │
│                                                            │
├────────────────────────────────────────────────────────────┤
│ CONTRACTOR ACTIVITY                                        │
├────────────────────────────────────────────────────────────┤
│ Assigned Leads:      10                                    │
│ Total Projects:       5                                    │
│ Total Estimates:      8                                    │
│                                                            │
│ Recent Projects:                                           │
│ PRJ-101, PRJ-102                                           │
│                                                            │
│ Recent Leads:                                              │
│ LD-101, LD-105                                             │
│                                                            │
│ [Deactivate Account]                                      │
└────────────────────────────────────────────────────────────┘
```

---

# 6. USER ACTIVITY TAB

### Purpose
Allow Admin to understand the actions performed by customers and contractors.

### A. Summary Cards

- Total Activities
- New Registrations
- Projects Created
- Estimates Generated

These should represent activities within the selected period.

### B. Search and Filters

| Filter | Options |
|---|---|
| Search | User name, User ID, Related Record ID |
| User Type | All, Customer, Contractor |
| Activity Type | All, Registration, Login, Project Created, Estimate Generated, Profile Updated, Account Status Changed |
| Date Range | Today, Last 7 Days, Last 30 Days, This Month, Custom |
| Sort By | Newest First, Oldest First |

Only display activity types that are actually recorded by the application.

### C. UI Representation

```text
┌────────────────────────────────────────────────────────────┐
│ USER ACTIVITY                                               │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ [Total Activities] [Registrations] [Projects] [Estimates]  │
│                                                            │
│ Search: [User / Activity / Record ID               🔍]     │
│                                                            │
│ User Type:    [All Users ▼]                                │
│ Activity:     [All Activities ▼]                           │
│ Date Range:   [Last 30 Days ▼]                             │
│ Sort By:      [Newest First ▼]                             │
│                                                            │
│ [Apply Filters]                         [Clear Filters]    │
├────────────────────────────────────────────────────────────┤
│ ACTIVITY HISTORY                                           │
├────────────────────────────────────────────────────────────┤
│ Date      User          Activity          Record ID         │
│ 05-Nov    Customer A    Estimate Created  EST-101          │
│ 05-Nov    Contractor A  Project Created   PRJ-102           │
│ 04-Nov    Customer B    Registered        U104              │
│ 04-Nov    Contractor B  Profile Updated   U105              │
├────────────────────────────────────────────────────────────┤
│ Showing 1–10 of 120                         [Next →]       │
└────────────────────────────────────────────────────────────┘
```

### D. Activity Details

When Admin clicks an activity, show:

- Activity type
- User name and ID
- Date and time
- Related record
- Activity details, if recorded

---

# 7. ACCOUNT MANAGEMENT ACTIONS

Admin should be able to activate and deactivate user accounts.

### Deactivate Account UI

```text
┌──────────────────────────────────────────────┐
│ DEACTIVATE USER                              │
├──────────────────────────────────────────────┤
│                                              │
│ Are you sure you want to deactivate          │
│ Customer A?                                  │
│                                              │
│ Reason:                                      │
│ [Enter reason                         ]      │
│                                              │
│ [Cancel]             [Confirm Deactivation]  │
└──────────────────────────────────────────────┘
```

### Activation UI

```text
┌──────────────────────────────────────────────┐
│ ACTIVATE USER                                │
├──────────────────────────────────────────────┤
│                                              │
│ Do you want to activate Customer A?          │
│                                              │
│ [Cancel]                  [Confirm Activate] │
└──────────────────────────────────────────────┘
```

### Expected Behaviour

1. Admin selects an account action.
2. Confirmation window appears.
3. Admin confirms the action.
4. Backend updates the account status.
5. UI refreshes the user record and summary counts.
6. A success or error message is displayed.
7. Important account changes are recorded in the audit log.

Do not permanently delete users through this page.

---

# 8. FILTER FUNCTIONALITY – IMPORTANT RULES

All filters must work together.

### Example 1: All Users

Admin selects:

- User Type: Contractor
- Status: Active
- Registration: Last 30 Days
- Sort: Newest First

Expected result: Only active contractors registered during the last 30 days, ordered by newest registration.

### Example 2: Customers

Admin selects:

- Status: Active
- Project Activity: Has Projects
- Estimate Activity: Has Estimates

Expected result: Active customers who have both projects and estimates.

### Example 3: Contractors

Admin selects:

- Status: Active
- Lead Activity: Has Assigned Leads
- Project Activity: Has Projects

Expected result: Active contractors with assigned leads and associated projects.

### Example 4: User Activity

Admin selects:

- User Type: Customer
- Activity Type: Estimate Generated
- Date: Last 7 Days

Expected result: Customer estimate-generation activities from the last seven days.

### Filter Behaviour

- Apply Filters must update the table.
- Clear Filters must reset all selected filters.
- Search should work together with filters.
- Pagination must retain the selected filters.
- Sorting must work on the filtered results.
- Display the total number of matching records.
- Use backend filtering for large datasets.

---

# 9. FINAL PAGE DESIGN

```text
================================================================
DECK PRO                                      ADMIN PORTAL
================================================================

USER MANAGEMENT

Manage customers and contractors.

[All Users] [Customers] [Contractors] [User Activity]

----------------------------------------------------------------
SUMMARY CARDS
----------------------------------------------------------------

[Total Users] [Customers] [Contractors]
[Active Users] [Inactive Users]

----------------------------------------------------------------
SEARCH AND FILTERS
----------------------------------------------------------------

[Search Name / Email / Phone / User ID]

[User Type ▼] [Account Status ▼] [Registration Date ▼]

[Sort By ▼]

[Apply Filters]                            [Clear Filters]

----------------------------------------------------------------
USER RECORDS
----------------------------------------------------------------

User ID | Name | Type | Email | Registered | Status | Action

U101    | A    | Customer | user1@mail | 05-Nov | Active | View
U102    | B    | Customer | user2@mail | 04-Nov | Active | View
U103    | C    | Contractor | user3@mail | 03-Nov | Active | View

----------------------------------------------------------------
PAGINATION
----------------------------------------------------------------

Rows per page: [10 ▼]      Showing 1–10 of 250

                         [Previous] [1] [2] [3] [Next]

================================================================
```

The content and filters should change based on the selected horizontal tab.

---

# 10. BACKEND REQUIREMENTS

| Feature | Required Backend Functionality |
|---|---|
| Summary Cards | Accurate user counts |
| Search | Search by name, email, phone and ID |
| User Type Filter | Customer and contractor filtering |
| Status Filter | Active and inactive filtering |
| Registration Filter | Date-based filtering |
| Activity Filter | Filter recorded user activities |
| Profile View | Retrieve individual user details |
| Account Actions | Activate and deactivate accounts |
| Pagination | Backend pagination |
| Sorting | Supported column sorting |
| Audit History | Record important account changes |

### Development Requirements

1. Connect all tabs to actual database records.
2. Do not use dummy user information.
3. Apply filters through backend APIs.
4. Validate all account actions on the backend.
5. Enforce Admin authorization.
6. Prevent duplicate or inconsistent user records.
7. Show loading, empty and error states.
8. Ensure all tables are responsive.
9. Ensure customer and contractor records are correctly separated.
10. Maintain consistent data between summary cards and tables.

---

# 11. FINAL EXPECTATION

The User Management page should be a complete user administration module.

Admin should be able to:

- View all customers and contractors.
- Search by name, email, phone and ID.
- Apply multiple filters.
- View customer and contractor profiles.
- Understand user activity.
- Check associated projects, leads and estimates.
- Activate and deactivate accounts.
- Navigate large user lists easily.

**Final UI decision:** Use summary cards at the top, search and filters below them, and a clean data table as the main content. Individual profiles should open in a detailed view without navigating away unnecessarily.

Maintain the DECK PRO blue-and-white theme, readable typography, consistent icons, proper spacing and responsive layout.
-----------------------------------------------------------------------------------------------------------

 

# DECK PRO – ADMIN PORTAL
## 03. Lead Management – Complete UI and Functional Requirements

### 1. Purpose

Lead Management is an important business page in the DECK PRO Admin Portal.

Its purpose is to capture and manage people who show interest in DECK PRO services by clicking **Contact Us** or **Reach Out** from the Customer Portal or Contractor Portal.

Admin should be able to view enquiries, identify their source, understand contact history, and access the related customer or contractor profile.

This must be a **single page with four horizontal tabs**.

---

### 2. Page Layout

```text
┌──────────────────────────────────────────────────────────────────────┐
│ LEAD MANAGEMENT                                                      │
│ Manage all customer and contractor enquiries                         │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Hot Priority | Customer Leads | Contractor Leads | All Leads       │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Search leads...                                  [Filters]          │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ Name    Type       Email       Phone      Date      Source View │  │
│  │                                                                │  │
│  │ John    Customer   ...         ...        ...       Contact Us  │  │
│  │ David   Contractor ...         ...        ...       Reach Out   │  │
│  │ Alex     Customer   ...         ...        ...       Contact Us  │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Showing 1–10 of 100 records                                        │
│                                                                      │
│  [Previous]                 Page 1 of 10                [Next]       │
│                                                                      │
│                                      [Export CSV] [Export Excel]     │
└──────────────────────────────────────────────────────────────────────┘
```

The page layout and table should remain consistent across all four tabs. Only the records and relevant filters should change.

---

### 3. Horizontal Navigation – Four Tabs

#### Tab 1: Hot Priority

**Purpose:** Display leads generated through Contact Us or Reach Out during the last 30 days.

This category includes both customer and contractor leads.

Important rules:
- A lead qualifies when its contact action occurred within the last 30 days.
- It is a time-based category, not a manually assigned priority.
- Both Customer and Contractor leads must appear.
- The latest qualifying contact date should determine whether the lead remains in this tab.
- Leads should automatically stop appearing when they fall outside the 30-day period.
- Do not require Admin to manually mark a lead as Hot.

**Example:**

| Name | Type | Contact Source | Latest Contact Date |
|---|---|---|---|
| John | Customer | Contact Us | 2 days ago |
| David | Contractor | Reach Out | 10 days ago |
| Alex | Customer | Contact Us | 25 days ago |

All three qualify for Hot Priority.

A lead whose latest qualifying contact occurred 35 days ago should not appear in this tab.

#### Tab 2: Customer Leads

**Purpose:** Display enquiries originating from the Customer Portal.

Display only customer-type leads.

Example sources:
- Contact Us
- Other qualifying contact actions, if supported by the application.

#### Tab 3: Contractor Leads

**Purpose:** Display enquiries originating from the Contractor Portal.

Display only contractor-type leads.

Example sources:
- Reach Out
- Other qualifying contact actions, if supported by the application.

#### Tab 4: All Leads

**Purpose:** Display every captured lead, regardless of customer/contractor type or contact date.

This tab must include:
- Customer leads.
- Contractor leads.
- Recent leads.
- Older leads.

No lead should disappear from All Leads simply because it is older than 30 days.

---

### 4. Search and Filter Options

Each tab must provide search and filters.

The filter panel should open when Admin clicks the Filters button. It should not permanently occupy the main table area.

#### A. Search

Search should support:

| Search Field | Behaviour |
|---|---|
| Name | Search using full or partial name. |
| Email | Search using complete or partial email address. |
| Phone | Search using complete or partial phone number. |

Search requirements:
- Search should work without requiring an exact match.
- Search should ignore unnecessary differences in letter case.
- Search should work together with the selected filters.
- Search results should update when Admin submits the search or after a short typing delay.

#### B. Date Range Filter

Admin should be able to filter leads using contact dates.

Options:

| Option | Behaviour |
|---|---|
| Today | Leads contacted today. |
| Yesterday | Leads contacted yesterday. |
| Last 7 Days | Leads contacted during the previous 7 days. |
| Last 30 Days | Leads contacted during the previous 30 days. |
| This Month | Leads contacted during the current calendar month. |
| Last Month | Leads contacted during the previous calendar month. |
| Custom Range | Admin selects a start date and end date. |

**Custom Range UI:**

```text
Date Range

Start Date: [ DD-MM-YYYY ]
End Date:   [ DD-MM-YYYY ]

[Apply]
```

Rules:
- Start date cannot be later than end date.
- Future contact dates should not be included.
- Date filtering should use the relevant contact timestamp.
- The date filter should work with the other filters.

For Hot Priority, the default date condition must remain the last 30 days. Admin can narrow the results using additional filters, but the tab must not show leads outside its qualifying period.

#### C. Lead Type Filter

Options:

```text
Lead Type

[ ] All
[ ] Customer
[ ] Contractor
```

Behaviour:
- Customer selects customer-originated leads.
- Contractor selects contractor-originated leads.
- All displays both types.

In Customer Leads and Contractor Leads, the type is already determined by the tab. The filter can be hidden or disabled there.

#### D. Contact Source Filter

This filter identifies where the enquiry originated.

Options:

```text
Contact Source

[ ] All Sources
[ ] Contact Us
[ ] Reach Out
```

Behaviour:
- Contact Us displays enquiries generated through the Contact Us action.
- Reach Out displays enquiries generated through the Reach Out action.
- All Sources displays every supported contact source.

Only display source values that are actually supported and recorded by the application.

#### E. Contact Status Filter

This filter should be included only if contact status is already tracked or is implemented in the backend.

For example, if the application supports these statuses:

```text
Contact Status

[ ] All
[ ] New
[ ] Contacted
[ ] In Progress
[ ] Closed
```

Important:
- Do not create these statuses as fixed business rules without confirmation.
- First verify the existing lead/contact status structure.
- If status is not currently tracked, do not display a non-functional filter.
- Do not automatically assign statuses without an approved workflow.

#### F. Sort Options

Provide sorting to make records easier to review.

| Sort Option | Behaviour |
|---|---|
| Newest First | Latest contact records first. |
| Oldest First | Oldest contact records first. |
| Name A–Z | Alphabetical ascending order. |
| Name Z–A | Alphabetical descending order. |
| Most Contacted | Highest contact count first, if contact count is tracked. |

#### G. Filter Panel UI

```text
┌───────────────────────────────────────────────┐
│ FILTER LEADS                              [X] │
├───────────────────────────────────────────────┤
│                                               │
│ Date Range                                    │
│ [Last 30 Days                         ▼]      │
│                                               │
│ Lead Type                                     │
│ [All                                 ▼]      │
│                                               │
│ Contact Source                                │
│ [All Sources                         ▼]      │
│                                               │
│ Contact Status                                │
│ [All                                 ▼]      │
│                                               │
│ Sort By                                       │
│ [Newest First                        ▼]      │
│                                               │
├───────────────────────────────────────────────┤
│             [Clear All] [Apply Filters]       │
└───────────────────────────────────────────────┘
```

**Filter behaviour:**
1. Admin selects one or more filters.
2. Clicking Apply Filters refreshes the table.
3. Multiple filters must work together using AND logic.
4. The selected filters should remain visible after applying.
5. Clear All resets the selected filters to the tab's default conditions.
6. Pagination must work on the filtered results.
7. Switching tabs should load the relevant records and tab-specific default conditions.
8. Display the number of records matching the filters.

---

### 5. Lead Table – Information to Display

Use the following columns consistently across all tabs:

| Column | Information |
|---|---|
| Lead ID | Unique identifier for the lead. |
| Name | Customer or contractor name. |
| Type | Customer or Contractor. |
| Email | Registered email address. |
| Phone | Registered contact number. |
| First Contact Date | Date of the first recorded contact. |
| Latest Contact Date | Date of the most recent recorded contact. |
| Contact Source | Contact Us or Reach Out. |
| Contact Count | Number of recorded contact actions, if available. |
| Action | View lead details. |

The table should support:
- Sorting.
- Search.
- Filtering.
- Pagination.
- Horizontal scrolling if required on smaller screens.
- Loading, empty and error states.

**Important:** Contact Count and contact history must be based on actual recorded events. Do not display assumed values.

---

### 6. Lead Details

When Admin clicks View, open a lead details page, panel or modal.

```text
┌───────────────────────────────────────────────┐
│ LEAD DETAILS                              [X] │
├───────────────────────────────────────────────┤
│                                               │
│ Name:               John                      │
│ Email:              john@example.com          │
│ Phone:              +91 XXXXXXXXXX            │
│ User Type:          Customer                  │
│ Contact Source:     Contact Us                │
│                                               │
│ First Contact Date: 01-11-2026                │
│ Latest Contact Date: 05-11-2026               │
│ Contact Count:      3                         │
│                                               │
│                                               │
│ [View Customer Profile]                       │
│                                               │
└───────────────────────────────────────────────┘
```

The above values are illustrative.

#### Lead Details Requirements

Display:

1. Lead ID.
2. Name.
3. Email.
4. Phone.
5. User Type.
6. Contact Source.
7. First Contact Date.
8. Latest Contact Date.
9. Contact Count.

If contact history is recorded, also display a chronological history of contact events.

Example:

| Date | Contact Source | Event |
|---|---|---|
| 01-11-2026 | Contact Us | First enquiry |
| 03-11-2026 | Contact Us | Repeat enquiry |
| 05-11-2026 | Contact Us | Latest enquiry |

Provide a profile navigation button:

- Customer lead → View Customer Profile.
- Contractor lead → View Contractor Profile.

The button should open the correct existing profile in the User Management module.

Do not create duplicate customer or contractor profiles from the Leads page.

---

### 7. Export Functionality

Every tab must support:

- Export CSV.
- Export Excel.

Export buttons should be available below or above the table.

#### Export Behaviour

**Case 1: Filters Applied**

If Admin applies filters, export only the records matching those filters.

Example:
- Tab: Customer Leads.
- Date Range: Last 30 Days.
- Contact Source: Contact Us.

The exported file should contain only customer leads matching these conditions.

**Case 2: No Filters Applied**

Export the complete list for the selected tab.

Examples:
- Hot Priority → All currently qualifying Hot Priority leads.
- Customer Leads → All customer leads.
- Contractor Leads → All contractor leads.
- All Leads → All captured leads.

**Case 3: Pagination**

Export all matching records, not only the records displayed on the current page.

For example, if 250 records match the filters and the table displays 10 records per page, the export must contain all 250 records.

#### Export File Columns

Include the available lead information:

- Lead ID
- Name
- Email
- Phone
- User Type
- Contact Source
- First Contact Date
- Latest Contact Date
- Contact Count
- Contact Status, if tracked

#### Export Technical Requirements

- CSV button must generate a valid `.csv` file.
- Excel button must generate a valid `.xlsx` file.
- File should use meaningful column headings.
- Date formats should be consistent.
- Export must respect the selected tab and applied filters.
- Export must retrieve all matching records from the backend.
- Handle empty export results with a clear message.
- Do not export unrelated user or personal information.

---

### 8. Pagination

Pagination should be available at the bottom of every tab.

```text
Showing 1–10 of 100 records

[Previous]       Page 1 of 10       [Next]

Rows per page: [10 ▼]
```

Rows per page:
- 10
- 25
- 50
- 100

Requirements:
- Previous and Next buttons must work.
- Page number should update correctly.
- Pagination should use the filtered record count.
- Changing filters should reset the table to the first page.
- Export should not be restricted by pagination.

---

### 9. Backend and Database Requirements

The frontend must connect to actual backend APIs and database records.

Verify and implement the following:

1. Capture lead events when a user performs the supported Contact Us or Reach Out action.
2. Identify whether the lead originated from the Customer Portal or Contractor Portal.
3. Store the contact source.
4. Store the contact date and time.
5. Maintain a unique lead identifier.
6. Retrieve first and latest contact dates.
7. Maintain contact count from recorded contact events.
8. Support the four tab queries.
9. Apply search and filters through backend queries.
10. Support sorting and pagination.
11. Retrieve lead details.
12. Navigate to the correct customer or contractor profile.
13. Generate CSV and Excel exports using the complete filtered dataset.

**Hot Priority backend logic:**

A lead qualifies when its latest qualifying Contact Us or Reach Out event falls within the previous 30 days.

Conceptually:

```text
Hot Priority =
Leads where latest qualifying contact date
is within the last 30 days.
```

This should be calculated from actual contact-event timestamps, not manually assigned priority values.

The 30-day calculation must use a consistent application timezone and date boundary.

---

### 10. Important Functional Rules

- Lead Management must remain one sidebar page.
- Do not create separate sidebar pages for Customer Leads, Contractor Leads or Hot Priority.
- Keep exactly four horizontal tabs.
- Hot Priority must be automatically calculated using the last 30 days.
- All Leads must include old and recent records.
- Customer Leads must show customer-originated enquiries.
- Contractor Leads must show contractor-originated enquiries.
- Every search and filter must work.
- Export must respect the selected tab and filters.
- Export must include all matching records, not only the current page.
- Lead details must show actual database information.
- Profile navigation must open the correct existing user profile.
- Do not add manual priority assignment, lead scoring or unsupported workflow features.
- Do not use dummy data in production.

---

### 11. Final Expected Result

After implementation, Admin should be able to:

1. View all captured leads in one place.
2. Quickly identify leads received during the last 30 days.
3. Separate customer and contractor enquiries.
4. Search using name, email or phone.
5. Filter by date, type, contact source and supported contact status.
6. Sort and paginate lead records.
7. Open complete lead details.
8. View the related customer or contractor profile.
9. Export filtered or complete lead records into CSV and Excel.

**Final requirement:** Every tab, filter, search option, profile navigation, pagination control and export button must be connected to working backend functionality. A visually complete page without working data and actions is not considered complete.

-----------------------------------------------------------------------------------------------------------

## 04. Estimator Management – Single Page

**Page Description:**

Estimator Management allows the admin to manage the input fields shown in the customer and contractor estimation forms. The admin can add or update fields and control which options appear based on user selections.

This page contains only **two tabs**:

1. Input Fields
2. Dependencies

### 1. Input Fields

**Purpose:** Manage the fields that users fill in while creating an estimate.

**Example actions:**
- Admin clicks **Add Field**.
- Creates a field named `Deck Length`.
- Selects the input type as `Number`.
- Sets the unit as `Feet`.
- Marks the field as required.
- Clicks Save.
- The new field becomes available in the estimation form.

**Text-based UI view:**

```text
ESTIMATOR MANAGEMENT

Manage the fields and options used in estimation.

------------------------------------------------
| Input Fields | Dependencies                  |
------------------------------------------------

INPUT FIELDS

[ + Add Field ]              [ Search Fields ]

------------------------------------------------
| Field Name  | Input Type | Required | Action |
------------------------------------------------
| Deck Length | Number     | Yes      | Edit   |
| Deck Width  | Number     | Yes      | Edit   |
| Deck Shape  | Dropdown   | Yes      | Edit   |
| Deck Height | Number     | No       | Edit   |
| Deck Type   | Dropdown   | Yes      | Edit   |
------------------------------------------------

                 [Previous]  1  2  [Next]
```

When the admin clicks **Add Field**:

```text
ADD ESTIMATOR FIELD

Field Name:       [ Deck Length       ]
Display Label:    [ Deck Length       ]
Input Type:       [ Number          ▼ ]
Unit:             [ Feet            ▼ ]
Required:         [ Yes             ▼ ]

             [ Cancel ] [ Save Field ]
```

**Impact:** Changes made here control which input fields customers and contractors see when providing project details for an estimate.

---

### 2. Dependencies

**Purpose:** Control which options appear based on the user's previous selections.

**Example actions:**

- Admin selects the `Deck Material` field.
- Creates a condition: If the user selects `Composite`, show composite product options.
- Creates another condition: If the user selects `Wood`, show wood product options.
- Saves the conditions.
- When users select a material, the estimator displays the corresponding options.

**Text-based UI view:**

```text
ESTIMATOR MANAGEMENT

------------------------------------------------
| Input Fields | Dependencies                  |
------------------------------------------------

FIELD DEPENDENCIES

[ + Add Dependency ]

------------------------------------------------
| Parent Field | Condition | Show Field | Action |
------------------------------------------------
| Deck Material| Composite | Composite  | Edit   |
| Deck Material| Wood      | Wood       | Edit   |
------------------------------------------------
```

When the admin clicks **Add Dependency**:

```text
ADD DEPENDENCY

Select Parent Field:
[ Deck Material              ▼ ]

Condition:
[ Is Equal To                ▼ ]

Select Value:
[ Composite                  ▼ ]

Show This Field:
[ Composite Product Options  ▼ ]

             [ Cancel ] [ Save Dependency ]
```

**Impact:** Users see only the relevant options based on their selections. This makes the estimation process easier and avoids displaying unrelated choices.

---

### Final Page Structure

```text
ADMIN SIDEBAR
    |
    |--- Estimator Management
              |
              |--- Input Fields
              |
              |--- Dependencies
```

**Important:** Both tabs belong to one page. There is no separate Validation Rules or Settings tab.
-----------------------------------------------------------------------------------------------------------

# 05. Catalog Management – Single Page

## 1. Page Description

Catalog Management is where the admin manages all materials, products, finishes, substrates and services available in DECK PRO.

**An important requirement:** Every catalog item must have an image. Images are necessary because customers and contractors need to visually identify the material or product before selecting it during estimation.

For example, when a customer selects Composite Decking, they should see its image, product options, finishes and relevant details rather than just a text name.

The catalog should support both:
- **Existing items:** Display their images and details.
- **New items:** Admin must upload an image when adding a new item.

The page contains five tabs:

1. Materials
2. Products & Finishes
3. Substrates
4. Services
5. Coverage Rates

---

# 2. Materials

### Purpose
Manage all materials available for deck construction and related projects.

Each material must have an image so users can understand what the material looks like before selecting it.

### Admin Actions

- Add a new material.
- Upload a material image.
- Update material name and description.
- Update material specifications.
- View existing material details and images.
- Activate or deactivate materials.
- Replace an existing material image.
- Search and filter materials.

### Text-Based UI

```text
CATALOG MANAGEMENT

Manage materials, products, finishes and services.

----------------------------------------------------------
| Materials | Products & Finishes | Substrates |
| Services  | Coverage Rates                         |
----------------------------------------------------------

MATERIALS

[ + Add Material ]       [ Search Materials... ] [ Filter ]

----------------------------------------------------------
| IMAGE | MATERIAL NAME       | DESCRIPTION | STATUS | ACTION |
----------------------------------------------------------
| [IMG] | Composite Decking   | Durable...  | Active | View/Edit |
| [IMG] | Cedar Wood          | Natural...  | Active | View/Edit |
| [IMG] | Pressure Treated    | Treated...  | Active | View/Edit |
----------------------------------------------------------
```

### Add Material – Form

```text
ADD NEW MATERIAL

Material Image *
[ Upload Image ]
[ Image Preview ]

Material Name *
[ Composite Decking                 ]

Description *
[ Enter material description       ]

Material Category
[ Composite                    ▼ ]

Material Specifications
[ Enter relevant specifications    ]

Status
[ Active                        ▼ ]

             [ Cancel ] [ Save Material ]
```

**Example:** Admin adds Composite Decking with an image, name and description. After saving, the material appears in the catalog and can be displayed in the estimation form.

---

# 3. Products & Finishes

### Purpose
Manage individual products under each material and their available finishes.

For example, Composite Decking can have multiple products, and each product can have different colours or finishes.

**Every product and finish must have its own image.**

### Admin Actions

- Add products under an existing material.
- Upload a product image.
- Add multiple finishes.
- Upload a separate image for each finish.
- Edit product details.
- Update finish names and images.
- Activate or deactivate products and finishes.
- View all available product options.

### Text-Based UI

```text
PRODUCTS & FINISHES

[ + Add Product ]       [ Search Products... ] [ Filter ]

----------------------------------------------------------
| IMAGE | PRODUCT NAME       | MATERIAL  | STATUS | ACTION |
----------------------------------------------------------
| [IMG] | Premium Composite  | Composite | Active | Edit    |
| [IMG] | Classic Composite  | Composite | Active | Edit    |
| [IMG] | Cedar Plank        | Cedar     | Active | Edit    |
----------------------------------------------------------
```

### Add Product – Form

```text
ADD NEW PRODUCT

Select Material *
[ Composite Decking              ▼ ]

Product Image *
[ Upload Image ]
[ Image Preview ]

Product Name *
[ Premium Composite Board        ]

Description
[ Enter product description      ]

Available Finishes

------------------------------------------------
| Finish Name | Finish Image | Action           |
------------------------------------------------
| Brown       | [Upload]     | Remove           |
| Grey        | [Upload]     | Remove           |
| Natural     | [Upload]     | Remove           |
------------------------------------------------

[ + Add Finish ]

Status
[ Active                       ▼ ]

             [ Cancel ] [ Save Product ]
```

**Example:** Admin creates Premium Composite Board under Composite Decking and adds Brown, Grey and Natural finishes with individual images.

When customers select this product, they can visually compare the available finishes.

---

# 4. Substrates

### Purpose
Manage the existing surfaces or base types on which deck installation can take place.

Users should be able to identify the existing surface visually.

### Admin Actions

- Add a substrate.
- Upload a substrate image.
- Add its name and description.
- Edit existing substrate information.
- Replace substrate images.
- Activate or deactivate substrates.

### Text-Based UI

```text
SUBSTRATES

[ + Add Substrate ]      [ Search Substrates... ] [ Filter ]

----------------------------------------------------------
| IMAGE | SUBSTRATE NAME        | STATUS | ACTION         |
----------------------------------------------------------
| [IMG] | Concrete              | Active | View / Edit    |
| [IMG] | Soil                  | Active | View / Edit    |
| [IMG] | Existing Wooden Deck  | Active | View / Edit    |
----------------------------------------------------------
```

### Add Substrate – Form

```text
ADD NEW SUBSTRATE

Substrate Image *
[ Upload Image ]
[ Image Preview ]

Substrate Name *
[ Concrete                         ]

Description
[ Describe the existing surface   ]

Status
[ Active                         ▼ ]

             [ Cancel ] [ Save Substrate ]
```

**Example:** Admin adds Concrete with an image and description. During estimation, users can see the concrete image and select it as their existing surface type.

---

# 5. Services

### Purpose
Manage the services offered by DECK PRO for deck-related projects.

Each service should have an image or visual reference to help users understand what the service includes.

### Admin Actions

- Add a new service.
- Upload a service image.
- Add service name and description.
- Edit existing services.
- Replace service images.
- Activate or deactivate services.

### Text-Based UI

```text
SERVICES

[ + Add Service ]        [ Search Services... ] [ Filter ]

----------------------------------------------------------
| IMAGE | SERVICE NAME          | STATUS | ACTION         |
----------------------------------------------------------
| [IMG] | Deck Installation     | Active | View / Edit    |
| [IMG] | Deck Removal          | Active | View / Edit    |
| [IMG] | Surface Preparation   | Active | View / Edit    |
----------------------------------------------------------
```

### Add Service – Form

```text
ADD NEW SERVICE

Service Image *
[ Upload Image ]
[ Image Preview ]

Service Name *
[ Deck Installation               ]

Description *
[ Explain what this service includes ]

Status
[ Active                         ▼ ]

             [ Cancel ] [ Save Service ]
```

**Example:** Admin adds Deck Installation with an image and description. Customers can understand the service before selecting it for their project.

---

# 6. Coverage Rates

### Purpose
Manage how much area a particular material or product covers.

This information is important for calculating the quantity of materials required for a project.

### Admin Actions

- Select an existing material or product.
- Add its coverage rate.
- Specify the coverage unit.
- Update existing coverage rates.
- View the associated product image.
- Activate or deactivate a coverage entry.

### Text-Based UI

```text
COVERAGE RATES

[ + Add Coverage Rate ]    [ Search Products... ] [ Filter ]

----------------------------------------------------------------
| IMAGE | PRODUCT NAME        | COVERAGE RATE | UNIT | ACTION   |
----------------------------------------------------------------
| [IMG] | Premium Composite   | 10            | Sq.ft| Edit     |
| [IMG] | Cedar Plank         | 8             | Sq.ft| Edit     |
| [IMG] | Classic Composite   | 12            | Sq.ft| Edit     |
----------------------------------------------------------------
```

### Add Coverage Rate – Form

```text
ADD COVERAGE RATE

Select Material
[ Composite Decking                ▼ ]

Select Product
[ Premium Composite Board          ▼ ]

Product Image
[ Existing Product Image Preview ]

Coverage Rate *
[ 10                              ]

Coverage Unit *
[ Sq. ft.                         ▼ ]

Status
[ Active                          ▼ ]

             [ Cancel ] [ Save Coverage ]
```

**Example:** Admin sets the coverage rate for Premium Composite Board. When the estimator calculates the project requirements, it uses this rate to determine the required material quantity.

*The coverage values above are illustrative only. Actual rates must come from approved DECK PRO catalog data.*

---

# 7. Important Image Requirements

Images are a core requirement of Catalog Management, not optional decoration.

| Catalog Item | Image Requirement |
|---|---|
| Materials | One mandatory image per material |
| Products | One mandatory image per product |
| Finishes | One mandatory image per finish |
| Substrates | One mandatory image per substrate |
| Services | One mandatory image per service |
| Coverage Rates | Display the associated product image |

**Image behaviour:**
- Admin must upload an image when creating an item.
- Existing images must appear when viewing or editing an item.
- Admin can replace an image.
- Show an image preview before saving.
- Do not allow saving if a mandatory image is missing.
- Images must appear in the customer and contractor selection screens.
- Images should be clear and properly sized.
- Clicking an image should allow users to view a larger version.

---

# 8. How Catalog Management Connects to Estimation

Example customer workflow:

```text
CUSTOMER OPENS ESTIMATOR
          |
          v
SELECTS MATERIAL
          |
          v
Sees material images
          |
          v
SELECTS COMPOSITE DECKING
          |
          v
SEES AVAILABLE PRODUCTS
          |
          v
Selects Premium Composite Board
          |
          v
SEES FINISH IMAGES
          |
          v
Selects Brown Finish
          |
          v
SELECTS EXISTING SUBSTRATE
          |
          v
Sees substrate images
          |
          v
SELECTS REQUIRED SERVICES
          |
          v
ESTIMATOR USES COVERAGE RATES
          |
          v
CONTINUES ESTIMATION
```

### Final Expected Impact

Catalog Management should provide a visual product-selection experience, not just a list of names.

- Admin controls all catalog items and their images.
- Customers and contractors can understand products before selecting them.
- Product and finish selection becomes easier.
- The estimator uses catalog information and coverage rates for material calculations.
- Catalog updates are reflected in the relevant estimation forms.

**Final structure: One Catalog Management sidebar page with five horizontal tabs.**
-----------------------------------------------------------------------------------------------------------
# 06. PRICING MANAGEMENT – COMPLETE PAGE REQUIREMENTS

## 1. Page Overview

### Purpose

Pricing Management is an important page in the DECK PRO Admin Portal. Its purpose is to allow the admin to control all pricing values used by the DECK PRO calculator from one place.

The calculator should not depend on manually hardcoded pricing values in different frontend pages.

Instead:

1. Admin manages pricing values in the Admin Portal.
2. Updated values are saved in the backend and database.
3. The calculator retrieves the latest saved pricing configuration.
4. Customers and contractors enter their project details.
5. The calculator uses the configured pricing values and existing calculation formulas.
6. The estimated project cost is displayed automatically.

**Main requirement:** Any pricing change made by the admin must be reflected in subsequent calculator calculations.

---

# 2. Page Layout

Pricing Management must be a single sidebar page with four horizontal tabs.

### Main UI

```text
┌─────────────────────────────────────────────────────────────┐
│ PRICING MANAGEMENT                                          │
│                                                             │
│ Manage the pricing values used by the DECK PRO calculator.  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [ Material Costs ] [ Labor & Productivity ]                 │
│ [ Adjustment Factors ] [ Quote Settings ]                   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                  SELECTED TAB CONTENT                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

The admin should be able to switch between tabs without navigating to another sidebar page.

Each tab must have:
- Clear headings and descriptions.
- Existing pricing values.
- Edit functionality.
- Save functionality.
- Search where multiple records exist.
- Confirmation after successful updates.
- Loading and error messages.

---

# 3. TAB 01 – MATERIAL COSTS

### Purpose

This tab manages the cost of materials consumed during the restoration process.

The uploaded calculator currently uses four material cost values:

| Material | Existing Default Price | Unit |
|---|---:|---|
| Stain | $46 | Per gallon |
| Stripper | $38 | Per gallon |
| Brightener | $28 | Per gallon |
| Cleaner | $32 | Per gallon |

These values are taken directly from the uploaded calculator.

### UI View

```text
┌──────────────────────────────────────────────────────────────┐
│ MATERIAL COSTS                                               │
│                                                              │
│ Manage material prices used in restoration calculations.    │
│                                                              │
│                                      [ + Add Material Cost ] │
│                                                              │
│ Search Material: [________________________]                  │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ MATERIAL       CURRENT PRICE       UNIT          ACTION      │
├──────────────────────────────────────────────────────────────┤
│ Stain          $46                  Gallon        [Edit]      │
│ Stripper       $38                  Gallon        [Edit]      │
│ Brightener     $28                  Gallon        [Edit]      │
│ Cleaner        $32                  Gallon        [Edit]      │
├──────────────────────────────────────────────────────────────┤
│                                      [ Save Changes ]        │
└──────────────────────────────────────────────────────────────┘
```

### Example Action – Updating Stain Price

When the admin clicks Edit:

```text
┌─────────────────────────────────────────┐
│ EDIT MATERIAL PRICE                     │
│                                         │
│ Material Name                           │
│ [ Stain                         ]       │
│                                         │
│ Price                                   │
│ [ 46                            ]       │
│                                         │
│ Unit                                    │
│ [ Gallon                        ]       │
│                                         │
│                                         │
│ [ Cancel ]              [ Save Changes ]│
└─────────────────────────────────────────┘
```

Suppose the admin changes the stain price from $46 to $50.

After clicking Save:
- The backend stores the updated price.
- The calculator retrieves the updated value.
- New estimates use $50 per gallon instead of $46.

### How the Calculator Uses These Values

The calculator estimates material quantities using project area and the applicable coverage calculations.

Its existing logic includes:

- Stain quantity based on surface area and wood-species coverage.
- Stripper quantity based on surface area when stripping is required.
- Brightener quantity based on surface area.
- Cleaner quantity based on surface area.

The calculator then multiplies the required gallons by their respective prices.

**Material Cost = Total Cost of Required Materials**

### Impact

When material prices change, the material cost in new estimates changes automatically without requiring a frontend code update.

---

# 4. TAB 02 – LABOR & PRODUCTIVITY

### Purpose

This tab manages the labor billing rate and the production rate used by the calculator.

The uploaded calculator currently has the following values:

| Setting | Existing Default |
|---|---:|
| Labor Billing Rate | $75 per hour |
| Floor Production Rate | 50 sq. ft. per hour |
| Maintenance Percentage | 70% |

### UI View

```text
┌──────────────────────────────────────────────────────────────┐
│ LABOR & PRODUCTIVITY                                         │
│                                                              │
│ Manage labor cost and project production settings.           │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ SETTING                    VALUE              ACTION         │
├──────────────────────────────────────────────────────────────┤
│ Labor Billing Rate         $75 / Hour         [Edit]         │
│ Floor Production Rate      50 sq.ft. / Hour   [Edit]         │
│ Maintenance Percentage     70%                [Edit]         │
├──────────────────────────────────────────────────────────────┤
│                                      [ Save Changes ]        │
└──────────────────────────────────────────────────────────────┘
```

### Example Action 1 – Updating Labor Rate

Admin changes the labor billing rate from $75 to $85.

If the calculator estimates 20 working hours:

Previous calculation:

20 × $75 = $1,500

Updated calculation:

20 × $85 = $1,700

The calculator should automatically use the updated labor rate.

### Example Action 2 – Updating Production Rate

Admin changes floor production from 50 sq. ft. per hour to 40 sq. ft. per hour.

For a 400 sq. ft. deck:

Previous calculation:

400 ÷ 50 = 8 hours

Updated calculation:

400 ÷ 40 = 10 hours

This changes the estimated working hours and therefore affects labor cost.

### Example Action 3 – Updating Maintenance Percentage

Admin changes the maintenance percentage from 70% to 75%.

The uploaded calculator uses this percentage to calculate the next maintenance visit estimate:

Maintenance Estimate = Calculated Project Total × Maintenance Percentage

The updated percentage must be used in subsequent calculations.

### Impact

This tab controls how the calculator estimates labor hours, labor costs and the next maintenance visit estimate.

---

# 5. TAB 03 – ADJUSTMENT FACTORS

### Purpose

Different deck projects require different amounts of working time.

For example:
- Different wood species require different working effort.
- Elevated decks can require additional working time.
- Existing coatings can make restoration more difficult.
- Surface conditions can increase labor requirements.

The uploaded calculator already includes these adjustment factors.

The admin should be able to manage them without changing the calculator's formulas.

This tab contains four internal sections:

1. Wood Species
2. Access Conditions
3. Existing Coating Conditions
4. Surface Condition Factors

## A. Wood Species

### Existing Calculator Values

| Wood Species | Labor Multiplier | Coverage |
|---|---:|---:|
| Pressure Treated Pine | 1.00 | 175 |
| Cedar | 1.10 | 150 |
| Redwood | 1.10 | 160 |
| Mahogany / Meranti | 1.20 | 225 |
| Garapa / Tigerwood | 1.30 | 275 |
| Ipe / Cumaru / Massaranduba | 1.35 | 350 |
| Composite | 0.45 | Not applicable |

Coverage values are used by the calculator for stain quantity calculations. Composite is configured as a clean-only option with no stain coverage.

### UI View

```text
┌──────────────────────────────────────────────────────────────┐
│ ADJUSTMENT FACTORS                                           │
│                                                              │
│ [ Wood Species ] [ Access ] [ Coating ] [ Conditions ]       │
│                                                              │
│ WOOD SPECIES                                                 │
│                                                              │
│ [ + Add Species ]                                            │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ SPECIES           LABOR MULTIPLIER    COVERAGE     ACTION    │
├──────────────────────────────────────────────────────────────┤
│ Pressure Treated  1.00                175          [Edit]    │
│ Cedar             1.10                150          [Edit]    │
│ Redwood           1.10                160          [Edit]    │
│ Mahogany          1.20                225          [Edit]    │
│ Garapa            1.30                275          [Edit]    │
│ Ipe               1.35                350          [Edit]    │
│ Composite         0.45                N/A          [Edit]    │
└──────────────────────────────────────────────────────────────┘
```

### Example Action

Admin changes Cedar's labor multiplier from 1.10 to 1.15.

When a user selects Cedar in the calculator, the updated multiplier is used in the labor-hour calculation.

The admin should also be able to update the coverage value where applicable.

---

## B. Access Conditions

### Existing Calculator Values

| Access Type | Multiplier |
|---|---:|
| Ground Level | 1.00 |
| Elevated, One Story | 1.15 |
| Second Story | 1.35 |
| Staging or Roof Work | 1.60 |

### UI View

```text
ACCESS CONDITIONS

[ + Add Access Type ]

------------------------------------------------
| ACCESS TYPE          | MULTIPLIER | ACTION   |
------------------------------------------------
| Ground Level         | 1.00       | Edit     |
| Elevated, One Story  | 1.15       | Edit     |
| Second Story         | 1.35       | Edit     |
| Staging or Roof Work | 1.60       | Edit     |
------------------------------------------------

[ Save Changes ]
```

### Example Action

Admin changes Second Story from 1.35 to 1.45.

When a customer selects Second Story, the calculator uses 1.45 to adjust the working hours.

---

## C. Existing Coating Conditions

### Existing Calculator Values

| Coating Type | Labor Multiplier |
|---|---:|
| Bare or Weathered Gray | 1.00 |
| Maintained Penetrating Stain | 0.70 |
| Oil Penetrating, One Coat | 1.30 |
| Oil, Heavy Build-up | 1.90 |
| Film-former | 2.20 |
| Solid Stain or Paint | 2.80 |
| Unknown or Mixed | 2.20 |

### UI View

```text
EXISTING COATING CONDITIONS

------------------------------------------------
| COATING TYPE          | MULTIPLIER | ACTION  |
------------------------------------------------
| Bare / Weathered Gray | 1.00       | Edit    |
| Maintained Stain      | 0.70       | Edit    |
| Oil, One Coat         | 1.30       | Edit    |
| Oil, Heavy Build-up   | 1.90       | Edit    |
| Film-former           | 2.20       | Edit    |
| Solid Stain / Paint   | 2.80       | Edit    |
| Unknown / Mixed       | 2.20       | Edit    |
------------------------------------------------

[ Save Changes ]
```

### Example Action

Admin changes the Solid Stain or Paint multiplier from 2.80 to 3.00.

When the calculator identifies this coating, it uses the updated multiplier to calculate the working hours.

---

## D. Surface Condition Factors

### Existing Calculator Values

| Condition | Additional Labor Factor |
|---|---:|
| Heavy Mildew | 15% |
| Tannin or Rust Bleed | 10% |
| Pressure Damage / Furring | 20% |
| Mill Glaze, New Wood | 5% |

### UI View

```text
SURFACE CONDITION FACTORS

[ + Add Condition ]

------------------------------------------------
| CONDITION                | FACTOR | ACTION   |
------------------------------------------------
| Heavy Mildew             | 15%    | Edit     |
| Tannin or Rust Bleed     | 10%    | Edit     |
| Pressure Damage / Furring| 20%    | Edit     |
| Mill Glaze, New Wood     | 5%     | Edit     |
------------------------------------------------

[ Save Changes ]
```

### Example Action

Admin changes Heavy Mildew from 15% to 20%.

When the user selects Heavy Mildew, the calculator uses the updated condition factor in its labor calculation.

### Impact of Adjustment Factors

This tab helps the calculator account for different project difficulties.

The admin controls the adjustment values, while the calculator continues to apply its existing calculation logic.

---

# 6. TAB 04 – QUOTE SETTINGS

### Purpose

This tab manages how the calculator displays the estimated project price range.

The uploaded calculator does not simply show one fixed price. It calculates a range based on the calculated cost and the confidence of the coating identification.

### Existing Calculator Values

| Setting | Existing Default |
|---|---:|
| Base Quote Variation | 12% |
| Medium Confidence Additional Variation | 8% |
| Low Confidence Additional Variation | 20% |

### UI View

```text
┌──────────────────────────────────────────────────────────────┐
│ QUOTE SETTINGS                                               │
│                                                              │
│ Manage the price variation used when displaying estimates.  │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ SETTING                         VALUE        ACTION          │
├──────────────────────────────────────────────────────────────┤
│ Base Quote Variation            12%          [Edit]          │
│ Medium Confidence Variation     8%           [Edit]          │
│ Low Confidence Variation        20%          [Edit]          │
├──────────────────────────────────────────────────────────────┤
│                                      [ Save Changes ]        │
└──────────────────────────────────────────────────────────────┘
```

### Example Action

Admin changes the base quote variation from 12% to 10%.

Suppose the calculated project cost is $2,000.

With a 12% variation:

Lower estimate = $1,760

Upper estimate = $2,240

With a 10% variation:

Lower estimate = $1,800

Upper estimate = $2,200

The calculator uses the updated quote variation.

### Confidence-Based Variation

The calculator identifies the existing coating using user answers.

Depending on the identification confidence:

- High confidence: Base variation only.
- Medium confidence: Base variation plus the configured medium-confidence adjustment.
- Low confidence: Base variation plus the configured low-confidence adjustment.

This logic must remain intact.

### Impact

The admin can control the price range displayed by the calculator without manually editing its frontend code.

---

# 7. COMPLETE CALCULATOR CONNECTION

This is the most important part of Pricing Management.

The admin page must be connected to the actual calculator.

### Expected Working Flow

```text
                  ADMIN PORTAL
                       |
                       v
               PRICING MANAGEMENT
                       |
          +------------+-------------+
          |            |             |
          v            v             v
     Material       Labor        Adjustment
      Costs         Rates         Factors
          |            |             |
          +------------+-------------+
                       |
                       v
                 Quote Settings
                       |
                       v
                ADMIN SAVES DATA
                       |
                       v
                BACKEND API
                       |
                       v
                   DATABASE
                       |
                       v
             CALCULATOR FETCHES DATA
                       |
                       v
            CUSTOMER / CONTRACTOR INPUTS
                       |
                       v
              EXISTING CALCULATOR LOGIC
                       |
                       v
              CALCULATES LABOR HOURS
                       |
                       v
              CALCULATES MATERIAL COST
                       |
                       v
              CALCULATES TOTAL COST
                       |
                       v
              DISPLAYS PRICE RANGE
```

## Example of a Complete Estimate

Assume the calculator produces the following values:

| Component | Amount |
|---|---:|
| Labor Hours | 20 |
| Labor Rate | $75 |
| Labor Cost | $1,500 |
| Material Cost | $500 |
| Calculated Total | $2,000 |

With the existing base quote variation of 12%:

| Quote | Amount |
|---|---:|
| Lower Estimate | $1,760 |
| Upper Estimate | $2,240 |

If the admin changes the labor rate to $85:

| Component | Updated Amount |
|---|---:|
| Labor Hours | 20 |
| Labor Rate | $85 |
| Labor Cost | $1,700 |
| Material Cost | $500 |
| Calculated Total | $2,200 |
| Lower Estimate (12%) | $1,936 |
| Upper Estimate (12%) | $2,464 |

This demonstrates how an admin pricing change affects the calculator output.

All amounts are illustrative calculations using the calculator's existing pricing logic.

---

# 8. ADMIN PAGE FUNCTIONAL REQUIREMENTS

The following actions must work properly.

| Functionality | Expected Behaviour |
|---|---|
| View Pricing | Display saved pricing values |
| Edit Pricing | Allow admin to update values |
| Save Changes | Store updated values in the database |
| Add New Entry | Allow new supported pricing entries |
| Search | Find relevant pricing entries |
| Validation | Prevent invalid pricing values |
| Cancel | Discard unsaved changes |
| Success Message | Confirm successful updates |
| Error Message | Explain failed updates |
| Calculator Connection | Retrieve saved configuration |
| Updated Calculation | Use updated values in subsequent estimates |

### Important Behaviour

1. Do not create separate hardcoded pricing values for different portals.
2. The customer and contractor calculators must use the same approved pricing configuration unless an existing business rule specifies otherwise.
3. Do not change existing calculator formulas while connecting pricing management.
4. Changes must be saved in the database.
5. The calculator must retrieve the latest saved configuration.
6. Do not break existing estimation functionality.
7. Existing pricing values must be preserved during implementation.
8. The admin must be able to update pricing without requiring a developer to change frontend code.

---

# 9. Important Implementation Note

The uploaded HTML currently contains the calculator's pricing defaults and calculation formulas directly in JavaScript.

It demonstrates the following existing configuration:

- Labor billing rate.
- Floor production rate.
- Material costs.
- Wood-species multipliers and coverage.
- Access multipliers.
- Coating multipliers.
- Condition factors.
- Maintenance percentage.
- Quote variation percentages.

However, the uploaded HTML does not demonstrate a database connection or an Admin Pricing Management API.

Therefore, the implementation must connect these existing calculator settings to the backend and database.

The existing formulas should be preserved. The goal is to make their configuration manageable through the Admin Portal.

Do not introduce unrelated pricing modules such as discounts, tax management or additional service pricing unless they are separately established as actual DECK PRO requirements.

---

# 10. FINAL SIDEBAR STRUCTURE

```text
DECK PRO – ADMIN

OVERVIEW
    Dashboard

USER MANAGEMENT
    Users

LEAD MANAGEMENT
    Leads

PROJECT MANAGEMENT
    Projects

ESTIMATOR MANAGEMENT
    Estimator Configuration

CATALOG MANAGEMENT
    Catalog

PRICING MANAGEMENT
    Pricing
        |
        |--- Material Costs
        |--- Labor & Productivity
        |--- Adjustment Factors
        |--- Quote Settings

REPORTS & ANALYTICS
    Reports

SYSTEM MANAGEMENT
    System Settings
```

All four pricing sections must be inside one Pricing Management page.

## Final Objective

The Pricing Management page must give the admin complete control over the existing DECK PRO calculator's pricing configuration.

Admin updates the values once. The backend saves them. The calculator retrieves them and uses them in subsequent estimates.

**The most important requirement is that the Admin Portal and the actual calculator must work together. A pricing value that can be edited in the admin page but does not affect the calculator is not considered functional.**
-----------------------------------------------------------------------------------------------------------
# 07. REPORTS & ANALYTICS
## Complete Business Insights and Reporting Centre

### 1. Purpose of This Page

The Reports & Analytics page gives Admin a complete view of DECK PRO business performance.

Instead of displaying only numbers, this page should provide meaningful insights through:

- Visual dashboards
- Charts and graphs
- Performance comparisons
- Detailed report tables
- Date-wise and user-wise analysis
- Project and estimation analysis
- Pricing and cost analysis
- Downloadable reports

**Main objective:** Admin should be able to understand what is happening in the business, identify trends, compare performance and make decisions using actual application data.

---

# 2. Overall Page Structure

Keep one main page in the sidebar called **Reports & Analytics**.

Inside the page, use horizontal tabs.

1. Business Overview
2. User Reports
3. Lead Reports
4. Project Reports
5. Estimation Reports
6. Catalog Reports
7. Pricing Reports
8. Activity Reports

Each tab should have its own filters, visualizations and detailed report tables.

Common filters should be available wherever relevant:

- Date range
- User type
- Customer
- Contractor
- Project status
- Estimate status
- Material
- Service

Not every filter needs to appear in every report. Show only the filters relevant to that report.

---

# 3. BUSINESS OVERVIEW

### Purpose

Give Admin an overall understanding of DECK PRO business performance from a single screen.

### A. Summary Cards

At the top, display important business indicators.

| Metric | What it displays |
|---|---|
| Total Users | Total registered users |
| Total Customers | Registered customers |
| Total Contractors | Registered contractors |
| Total Leads | Total leads received |
| Total Projects | Total projects created |
| Total Estimates | Total estimates generated |
| Total Estimated Value | Combined value of saved estimates |

These values must come from actual database records.

### B. User Growth Chart

Show how the number of registered users changes over time.

**Visual:** Line chart

Example:

```text
USER GROWTH

Users
  |
50|                         *
40|                    *    *
30|               *    *
20|          *    *
10|     *    *
  |____________________________
    Jan  Feb  Mar  Apr  May  Jun
```

Admin should be able to compare:
- Daily registrations
- Weekly registrations
- Monthly registrations
- Yearly registrations

### C. Project and Estimate Trends

Show the number of projects and estimates created over time.

**Visual:** Two-line chart or grouped bar chart.

This helps Admin understand whether platform activity is increasing or decreasing.

### D. Business Activity Distribution

**Visual:** Donut chart.

Example:

```text
BUSINESS ACTIVITY

Projects          40%
Estimates         30%
Leads             20%
Other Activity    10%
```

The categories and percentages should be calculated from actual records. Do not treat these illustrative percentages as real business data.

### E. Recent Business Activity

Display the latest important activities.

| Date | User | Activity | Related Record |
|---|---|---|---|
| 05 Nov | Customer A | Estimate created | EST-101 |
| 05 Nov | Contractor B | Project created | PRJ-102 |
| 04 Nov | Customer C | Registered | USER-103 |

### Insights Admin Should Get

- Is the platform growing?
- Are more users registering?
- Are users generating estimates?
- Are projects increasing?
- How active is the platform?

---

# 4. USER REPORTS

### Purpose

Understand customer and contractor registrations and their platform activity.

### A. User Summary Cards

- Total Customers
- Total Contractors
- Active Users
- Inactive Users
- New Registrations

### B. Customer vs Contractor Distribution

**Visual:** Donut chart.

```text
USER DISTRIBUTION

Customers      70%
Contractors    30%
```

Illustrative representation only.

### C. User Registration Trend

**Visual:** Monthly bar chart.

Display:
- Customer registrations
- Contractor registrations
- Total registrations

This helps Admin identify which user group is growing.

### D. User Activity Report

| User | User Type | Projects | Estimates | Status |
|---|---|---:|---:|---|
| Customer A | Customer | 3 | 5 | Active |
| Customer B | Customer | 2 | 3 | Active |
| Contractor A | Contractor | 4 | 6 | Active |

### E. Individual User Report

When Admin clicks a user, show:

- User details
- Registration date
- User type
- Projects created
- Estimates generated
- Recent activity
- Current account status

### Insights Admin Should Get

- Which user group is growing?
- Which users are most active?
- Which users have not used the platform recently?
- How many estimates and projects are associated with each user?

---

# 5. LEAD REPORTS

### Purpose

Understand lead generation, lead distribution and lead progress.

### A. Lead Summary Cards

- Total Leads
- New Leads
- Assigned Leads
- In-Progress Leads
- Converted Leads
- Lost Leads

Only show status categories that exist in the actual lead workflow.

### B. Lead Status Distribution

**Visual:** Funnel chart.

```text
LEAD FUNNEL

New Leads          100
       |
       v
Assigned Leads      80
       |
       v
In Progress         60
       |
       v
Converted           30
```

Illustrative values.

### C. Lead Trend

**Visual:** Monthly bar chart.

Display the number of leads received and converted over time.

### D. Contractor-wise Lead Report

| Contractor | Assigned Leads | Converted | Pending |
|---|---:|---:|---:|
| Contractor A | 20 | 8 | 12 |
| Contractor B | 15 | 5 | 10 |
| Contractor C | 10 | 4 | 6 |

### E. Lead Details

Admin should be able to open a lead and view:

- Lead information
- Customer details
- Assigned contractor
- Lead creation date
- Current status
- Status history
- Related project, if available

### Insights Admin Should Get

- How many leads are coming in?
- How many leads are being converted?
- Which contractors are handling leads?
- How many leads are still pending?
- Where are leads getting delayed?

---

# 6. PROJECT REPORTS

### Purpose

Understand project creation, project progress and project distribution.

### A. Project Summary Cards

- Total Projects
- New Projects
- Active Projects
- Completed Projects
- On-Hold Projects

Use only the statuses supported by the project workflow.

### B. Project Status Distribution

**Visual:** Donut chart.

```text
PROJECT STATUS

Active        45%
Completed     35%
On Hold       20%
```

Illustrative representation only.

### C. Project Creation Trend

**Visual:** Monthly bar chart.

Shows how many projects were created each month.

### D. Project Status Trend

**Visual:** Stacked bar chart.

Compare active, completed and other supported project statuses across months.

### E. Project Report Table

| Project ID | Project Name | Customer | Contractor | Status |
|---|---|---|---|---|
| PRJ-101 | Deck Project A | Customer A | Contractor A | Active |
| PRJ-102 | Deck Project B | Customer B | Contractor B | Completed |

### F. Project Details

When Admin opens a project, show:

- Project information
- Customer details
- Contractor details
- Project creation date
- Current status
- Related estimates
- Project activity history

### Insights Admin Should Get

- How many projects are active?
- How many projects are completed?
- Which contractors handle more projects?
- Are projects getting delayed?
- How is project activity changing over time?

---

# 7. ESTIMATION REPORTS

### Purpose

Understand how customers and contractors are using the DECK PRO estimator.

This is an important section because estimation is one of the main functions of the application.

### A. Estimation Summary Cards

- Total Estimates
- Estimates Created Today
- Estimates Created This Month
- Average Estimate Value
- Total Estimated Value

### B. Estimation Trend

**Visual:** Line chart.

Show the number of estimates generated daily, weekly or monthly.

### C. Estimate Value Distribution

**Visual:** Histogram or bar chart.

Group estimates into configurable value ranges.

Example:

| Estimate Range | Number of Estimates |
|---|---:|
| Below $1,000 | 10 |
| $1,000–$3,000 | 25 |
| $3,000–$5,000 | 15 |
| Above $5,000 | 8 |

Illustrative values.

### D. Customer vs Contractor Estimation

**Visual:** Grouped bar chart.

Compare the number of estimates generated by customers and contractors.

### E. Estimate Details Table

| Estimate ID | User | User Type | Amount | Created Date |
|---|---|---|---:|---|
| EST-101 | Customer A | Customer | $2,500 | 01 Nov |
| EST-102 | Contractor A | Contractor | $3,200 | 02 Nov |
| EST-103 | Customer B | Customer | $1,800 | 03 Nov |

### F. Individual Estimate Details

When Admin clicks an estimate, show:

- Estimate ID
- User information
- Deck dimensions and selected inputs
- Selected material
- Selected product and finish
- Selected substrate
- Selected services
- Material cost
- Labor cost
- Total estimated amount
- Estimate creation date

Show only fields that are actually saved for that estimate.

### Insights Admin Should Get

- How frequently is the estimator used?
- What is the average estimate amount?
- Which user group generates more estimates?
- What are the most common estimation selections?
- How are estimates distributed by value?

---

# 8. CATALOG REPORTS

### Purpose

Understand how materials, products, finishes, substrates and services are being selected in estimates.

This report connects catalog information with actual estimator usage.

### A. Catalog Summary Cards

- Total Materials
- Total Products
- Total Finishes
- Total Substrates
- Total Services

### B. Material Selection Report

**Visual:** Horizontal bar chart.

Example:

```text
MATERIAL SELECTION

Composite Decking    ███████████  45
Wood Decking         ████████     30
Other Materials      █████        18
```

Illustrative values.

### C. Product and Finish Usage

Show the most frequently selected products and finishes.

### D. Substrate Usage

Show how often each supported substrate is selected.

### E. Service Selection Report

Show the frequency of services selected in estimates.

### F. Catalog Usage Table

| Catalog Item | Category | Times Selected |
|---|---|---:|
| Composite Decking | Material | 45 |
| Brown Finish | Finish | 25 |
| Concrete | Substrate | 18 |
| Deck Installation | Service | 30 |

### Insights Admin Should Get

- Which materials are selected most often?
- Which products and finishes are popular?
- Which services are frequently requested?
- Which catalog items are rarely selected?

**Important:** Selection counts must be calculated from saved estimate records. Catalog availability alone should not be counted as customer usage.

---

# 9. PRICING REPORTS

### Purpose

Understand estimate pricing and the contribution of material and labor costs.

This report should use the actual pricing calculation data saved with estimates and the approved pricing configuration.

### A. Pricing Summary Cards

- Total Estimated Value
- Average Estimate Amount
- Average Material Cost
- Average Labor Cost
- Total Material Cost
- Total Labor Cost

### B. Material vs Labor Cost

**Visual:** Donut chart.

Example:

```text
ESTIMATED COST BREAKDOWN

Material Cost       40%
Labor Cost          60%
```

Illustrative representation only.

### C. Estimate Value Trend

**Visual:** Line chart.

Show how total estimated value changes over time.

### D. Material Cost Breakdown

**Visual:** Bar chart.

Show the contribution of:

- Stain
- Stripper
- Brightener
- Cleaner

Use actual material cost records from estimates.

### E. Labor Cost Report

Show:

- Total labor cost
- Average labor cost per estimate
- Estimated labor hours
- Billing rate applied

### F. Estimate-wise Pricing Table

| Estimate ID | Material Cost | Labor Cost | Total |
|---|---:|---:|---:|
| EST-101 | $1,000 | $1,500 | $2,500 |
| EST-102 | $1,200 | $2,000 | $3,200 |
| EST-103 | $800 | $1,000 | $1,800 |

Illustrative values.

### G. Pricing Configuration History

Where configuration history is available, show:

- Changed pricing parameter
- Previous value
- Updated value
- Updated by
- Updated date

This helps Admin understand which pricing configuration was active when an estimate was generated.

### Insights Admin Should Get

- How much of an estimate comes from materials?
- How much comes from labor?
- Which material contributes more to estimated cost?
- How are average estimate values changing?
- Have pricing configuration changes affected later estimates?

**Important:** Estimated value is not the same as actual revenue. Do not display estimate totals as collected revenue or profit unless DECK PRO has the required payment and expense records.

---

# 10. ACTIVITY REPORTS

### Purpose

Provide Admin with a clear record of important actions performed across the application.

### A. Activity Summary

- Total Recorded Activities
- User Registrations
- Projects Created
- Estimates Generated
- Lead Updates

### B. Activity Trend

**Visual:** Line or bar chart.

Show recorded activities by day, week or month.

### C. Activity Distribution

**Visual:** Donut chart.

Break down activities by type.

### D. Activity Details Table

| Date & Time | User | Activity | Record |
|---|---|---|---|
| 05 Nov | Customer A | Estimate Created | EST-101 |
| 05 Nov | Contractor A | Project Created | PRJ-102 |
| 04 Nov | Admin | Catalog Updated | CAT-103 |

### E. Activity Filters

- Date range
- User
- User type
- Activity type
- Related record

### Insights Admin Should Get

- Who is using the platform?
- What activities are happening?
- When are activities taking place?
- Which important records were recently updated?

---

# 11. VISUAL DESIGN AND REPRESENTATION

The Reports & Analytics page must have a clean dashboard design.

### A. Summary Cards

Use cards at the top of each report to highlight key numbers.

Each card should contain:
- Metric name
- Main value
- Comparison with previous period, when data supports it
- Small trend indicator

Example:

```text
+------------------+  +------------------+
| TOTAL USERS      |  | TOTAL PROJECTS   |
|                  |  |                  |
| 250              |  | 120              |
|                  |  |                  |
| +12% vs last month|  | +8% vs last month|
+------------------+  +------------------+
```

The percentage comparison must be calculated using the same period length and actual historical data.

### B. Charts and Graphs

Use different charts based on the information being represented.

| Chart Type | Best Use |
|---|---|
| Line Chart | Trends over time |
| Bar Chart | Comparing categories |
| Horizontal Bar | Ranking materials or services |
| Donut Chart | Distribution and proportions |
| Stacked Bar | Comparing multiple statuses |
| Funnel Chart | Lead progress |
| Histogram | Estimate value distribution |
| Data Table | Exact records and values |

Do not use charts just for decoration. Every chart should answer a useful business question.

### C. Chart Interaction

Charts should be interactive.

For example:
- Hover to see exact values.
- Click a chart segment to view related records.
- Select a time range to update the chart.
- Compare two periods.
- Open detailed records from chart results.

### D. Consistent Design

Maintain the existing DECK PRO blue-and-white theme.

- Clean white cards
- Blue headings and highlights
- Clear chart labels
- Consistent typography
- Proper spacing
- Readable tables
- Responsive layouts
- Icons instead of unnecessary emojis

Avoid overcrowding the page.

---

# 12. COMMON FILTERS AND SEARCH

Each report should provide relevant filters.

### Date Filters

- Today
- Yesterday
- Last 7 days
- Last 30 days
- This month
- Last month
- This year
- Custom date range

### Other Filters

Depending on the selected report:

- Customer
- Contractor
- User type
- Project status
- Lead status
- Estimate date
- Estimate value range
- Material
- Product
- Finish
- Service

### Filter Behaviour

When Admin changes a filter:

1. Summary cards update.
2. Charts update.
3. Tables update.
4. Exported data uses the same filters.

Provide a Clear Filters option.

---

# 13. EXPORT AND DOWNLOAD REPORTS

Admin must be able to download reports.

Provide:

- Export PDF
- Export Excel
- Download CSV

### Export Requirements

1. Export the currently selected report.
2. Apply the selected date range and filters.
3. Include report title and generation date.
4. Include summary metrics.
5. Include charts where appropriate in PDF.
6. Include detailed records in Excel and CSV.
7. Maintain readable formatting.
8. Respect the Admin's access permissions.

Example:

```text
REPORTS & ANALYTICS

[Business Overview]

Date Range: 01 Nov – 30 Nov

[Export PDF] [Export Excel] [Export CSV]
```

---

# 14. REPORT DATA AND BACKEND REQUIREMENTS

The reports must be connected to actual DECK PRO backend data.

Expected data sources:

| Report | Required Data |
|---|---|
| Business Overview | Users, leads, projects, estimates |
| User Reports | User accounts and activity |
| Lead Reports | Lead records and status history |
| Project Reports | Project records and status |
| Estimation Reports | Saved estimate records and inputs |
| Catalog Reports | Catalog items and estimate selections |
| Pricing Reports | Saved estimate cost breakdowns and pricing configuration history |
| Activity Reports | Application activity logs |

### Important Backend Requirements

- Use actual database records.
- Apply date filters through backend queries.
- Calculate totals and averages accurately.
- Avoid duplicate counting.
- Use consistent date and currency formatting.
- Handle empty report results properly.
- Apply pagination to large tables.
- Ensure report APIs enforce Admin authorization.
- Avoid exposing sensitive user information unnecessarily.
- Make sure charts and tables use the same filtered dataset.

If a report depends on data that is not currently stored, identify the missing data and add the required backend support before displaying that report.

Do not display dummy numbers as actual business insights.

---

# 15. IMPORTANT FUNCTIONAL REQUIREMENTS

The Reports & Analytics module must satisfy the following:

1. All eight report tabs must open and work.
2. Every summary card must show accurate database values.
3. Every chart must display actual data.
4. Date filters must work correctly.
5. Search and category filters must work.
6. Chart interactions should open relevant detailed records.
7. Report tables must support sorting and pagination.
8. Individual user, project, lead and estimate details must be accessible where permitted.
9. PDF, Excel and CSV exports must work.
10. Reports must update when new records are created or updated.
11. Empty states and API errors must be handled properly.
12. All pages must be responsive.
13. Only authorized Admin users should access Admin reporting data.
14. Avoid calculating revenue, profit or conversion metrics without the necessary source data and clear business definitions.

---

# 16. FINAL EXPECTED PAGE VIEW

```text
------------------------------------------------------------
DECK PRO                         ADMIN PORTAL
------------------------------------------------------------

Reports & Analytics

[Business Overview] [User Reports] [Lead Reports]
[Project Reports] [Estimation Reports]
[Catalog Reports] [Pricing Reports] [Activity Reports]

Date Range: [Last 30 Days v]       [Apply Filters]

------------------------------------------------------------
SUMMARY CARDS
------------------------------------------------------------

[Total Users] [Total Leads] [Projects] [Estimates]
[Estimated Value]

------------------------------------------------------------
BUSINESS PERFORMANCE
------------------------------------------------------------

[ User Growth Chart       ] [ Project Trend Chart       ]

------------------------------------------------------------
BUSINESS DISTRIBUTION
------------------------------------------------------------

[ User Distribution      ] [ Project Status            ]

------------------------------------------------------------
RECENT ACTIVITIES
------------------------------------------------------------

Date       User          Activity          Record
------------------------------------------------------------
05 Nov     Customer A    Estimate Created  EST-101
05 Nov     Contractor A  Project Created   PRJ-102
04 Nov     Customer B    Registered        USER-103

------------------------------------------------------------
DETAILED REPORT
------------------------------------------------------------

[Search] [Filters] [Export PDF] [Export Excel]

Detailed records appear here.

------------------------------------------------------------
```

The exact charts and tables should change based on the selected report tab.

# 17. FINAL EXPECTATION

Reports & Analytics should function as a complete business insights module, not just a page containing a few summary cards.

Admin should be able to:

- Understand overall business performance.
- Track customer and contractor activity.
- Monitor leads and their progress.
- Understand project activity and status.
- Analyse estimation usage and values.
- Identify popular materials, products and services.
- Understand material and labor cost distribution.
- Review important application activities.
- Compare performance across different periods.
- Open detailed records from visual reports.
- Download complete reports for further analysis.

**Final requirement:** Every report must have meaningful visuals, accurate numbers, useful filters and detailed records. The visual dashboard and the underlying report data must remain connected and consistent.
-----------------------------------------------------------------------------------------------------------
# 08. SYSTEM SETTINGS
## Complete Page Structure and Functional Requirements

### 1. Purpose

System Settings allows Admin to manage the basic application configurations, notification preferences and security settings of DECK PRO.

The page should be simple and organized into four horizontal tabs.

1. General Settings
2. Notification Settings
3. Security Settings
4. System Information

---

# 2. Overall Page Layout

```text
-------------------------------------------------------
DECK PRO                         ADMIN PORTAL
-------------------------------------------------------

System Settings

[General Settings]
[Notification Settings]
[Security Settings]
[System Information]

-------------------------------------------------------
Selected tab content appears here.
-------------------------------------------------------
```

All four sections should work within one page. Do not create separate sidebar pages for each section.

---

# 3. GENERAL SETTINGS

### Purpose

Manage basic application preferences such as contact details, language and time zone.

### What it contains

| Setting | Description |
|---|---|
| Contact Email | Application support email |
| Contact Phone | Support contact number |
| Default Language | Application display language |
| Time Zone | Default application time zone |
| Date Format | Format used to display dates |
| Currency | Default currency used for displaying estimates |

### Example UI

```text
-------------------------------------------------------
GENERAL SETTINGS
-------------------------------------------------------

Contact Information

Contact Email:
[ support@deckpro.com                  ]

Contact Phone:
[ +1 XXX XXX XXXX                      ]

-------------------------------------------------------
APPLICATION PREFERENCES
-------------------------------------------------------

Default Language:
[ English                         v ]

Time Zone:
[ Select Time Zone                v ]

Date Format:
[ DD/MM/YYYY                      v ]

Default Currency:
[ USD                             v ]

-------------------------------------------------------

                         [Save Changes]
-------------------------------------------------------
```

### How it works

- Admin can update the support contact details.
- Admin can select the default language.
- Admin can configure the time zone.
- Admin can select the date format.
- Admin can select the default currency.

### Example

If Admin changes the date format from `MM/DD/YYYY` to `DD/MM/YYYY`, dates should display in the updated format wherever the application supports this preference.

If the default currency is changed, the application must display currency consistently. Existing saved estimates must retain their original currency and value unless an explicit conversion process is implemented.

---

# 4. NOTIFICATION SETTINGS

### Purpose

Allow Admin to control which supported system notifications are enabled.

### What it contains

| Notification | Description |
|---|---|
| New User Registration | Notify Admin when a user registers |
| New Lead Created | Notify Admin when a new lead is received |
| Lead Assignment | Notify relevant users when a lead is assigned |
| Project Updates | Notify relevant users about project updates |
| Estimate Generated | Notify Admin or relevant users when an estimate is generated |

### Example UI

```text
-------------------------------------------------------
NOTIFICATION SETTINGS
-------------------------------------------------------

EMAIL NOTIFICATIONS

New User Registration       [ ON  ]
New Lead Created            [ ON  ]
Lead Assignment             [ ON  ]
Project Updates             [ ON  ]
Estimate Generated          [ ON  ]

-------------------------------------------------------

                         [Save Changes]
-------------------------------------------------------
```

### How it works

Admin can enable or disable the available notification types.

### Example

If New User Registration is ON:

1. A customer registers.
2. The backend records the registration.
3. The notification system triggers the configured notification.
4. Admin receives the notification through the supported channel.

If it is OFF, that notification should not be sent.

**Important:** Notification controls must connect to actual notification services. A toggle that changes visually but does not affect notification delivery is not functional.

---

# 5. SECURITY SETTINGS

### Purpose

Manage supported application security configurations.

### What it contains

| Setting | Description |
|---|---|
| Minimum Password Length | Minimum number of characters required |
| Session Timeout | Time after which an inactive session expires |
| Login Security | Enable or disable supported login security features |
| Failed Login Limit | Maximum allowed failed login attempts |
| Account Lockout Duration | Duration of lockout after the configured failed attempts |

### Example UI

```text
-------------------------------------------------------
SECURITY SETTINGS
-------------------------------------------------------

PASSWORD POLICY

Minimum Password Length:
[ 8 ]

-------------------------------------------------------

SESSION SETTINGS

Session Timeout:
[ 30 Minutes v ]

-------------------------------------------------------

LOGIN SECURITY

Login Security:
[ Enabled ]

Maximum Failed Login Attempts:
[ 5 ]

Account Lockout Duration:
[ 15 Minutes v ]

-------------------------------------------------------

                         [Save Changes]
-------------------------------------------------------
```

### How it works

Admin can configure supported security rules.

### Example

Suppose the failed login limit is set to 5.

1. A user enters an incorrect password.
2. The backend tracks the failed attempt.
3. After five unsuccessful attempts, the configured account protection rule is applied.
4. The account remains restricted for the configured lockout duration, if this feature is implemented.

### Important

- Password policies must be enforced by the backend.
- Session timeout must actually expire inactive sessions.
- Failed login limits must be tracked securely.
- Security settings must not allow Admin to bypass authentication rules.
- Sensitive changes should require appropriate authorization.

---

# 6. SYSTEM INFORMATION

### Purpose

Allow Admin to check the basic operational status of DECK PRO.

This section is mainly for viewing information, not changing system configurations.

### What it contains

| Information | Description |
|---|---|
| Application Version | Currently deployed application version |
| Backend Status | Whether the backend service is reachable |
| Database Status | Database connection status |
| Last System Update | Date and time of the last deployment or update |
| API Status | Status of important application APIs |
| System Health | Basic service health information |

### Example UI

```text
-------------------------------------------------------
SYSTEM INFORMATION
-------------------------------------------------------

APPLICATION

Version:
1.0.0

Last System Update:
05-Nov-2026

-------------------------------------------------------

SERVICE STATUS

Backend Status:       Connected
Database Status:      Connected
API Status:           Operational

-------------------------------------------------------

SYSTEM HEALTH

Overall Status:       Healthy

                         [Refresh Status]
-------------------------------------------------------
```

### How it works

- The system retrieves application version information.
- Backend health checks report service availability.
- Database health checks report connection status.
- API health checks report the status of supported services.
- Admin can refresh the displayed information.

### Example

If the database becomes unavailable, the Database Status should change to an appropriate error or unavailable state.

Do not display Connected or Healthy as fixed values. These must come from actual health checks.

---

# 7. SAVE AND VALIDATION BEHAVIOUR

All editable settings must have proper save functionality.

### Expected behaviour

1. Admin opens a settings tab.
2. Admin changes one or more settings.
3. Admin clicks Save Changes.
4. Frontend validates the entered values.
5. Backend validates the settings again.
6. Updated values are saved.
7. A success message is displayed.

### Example

```text
Minimum Password Length

Before: 8
After:  10

[Save Changes]

Success: Security settings updated successfully.
```

If the entered value is invalid:

```text
Error: Minimum password length must be
within the supported range.
```

The actual validation limits should be defined by the backend security requirements.

---

# 8. BACKEND AND DATABASE REQUIREMENTS

Every setting displayed in the frontend must be connected to backend functionality.

| Section | Backend Requirement |
|---|---|
| General Settings | Store and retrieve application preferences |
| Notification Settings | Store preferences and connect them to notification triggers |
| Security Settings | Store configuration and enforce it in authentication/session logic |
| System Information | Retrieve actual service health and version information |

### Important requirements

- Load existing saved settings when the page opens.
- Save changes to the database.
- Validate settings on both frontend and backend.
- Apply updated configurations to the relevant functionality.
- Show clear success and error messages.
- Restrict modifications to authorized Admin users.
- Maintain an audit history for important security and configuration changes where supported.
- Do not use hardcoded status values.
- Handle backend failures properly.

---

# 9. FINAL SIDEBAR STRUCTURE

```text
ADMIN PORTAL
│
├── Dashboard
├── Users
├── Leads
├── Projects
├── Estimator Configuration
├── Catalog
├── Pricing
├── Reports & Analytics
├── System Settings
│     │
│     ├── General Settings
│     ├── Notification Settings
│     ├── Security Settings
│     └── System Information
│
├── My Profile
└── Logout
```

The four System Settings sections are horizontal tabs inside one page, not separate sidebar items.

---

# 10. FINAL EXPECTATION

The System Settings page should be simple, readable and fully functional.

Admin should be able to:

- Update support contact details.
- Configure application preferences.
- Manage supported notifications.
- Configure supported security rules.
- Check backend and database status.
- View application version and system health.
- Save changes and receive clear confirmation.

**Removed items:**
- Application Name
- Application Logo
- Application Description

Do not add these fields back into General Settings.

**Final development requirement:** Build only the settings that DECK PRO actually supports. If a setting does not have backend functionality, implement the required backend support before exposing it as an editable control.