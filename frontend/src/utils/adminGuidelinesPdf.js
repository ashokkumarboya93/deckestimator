// ====================================================================
// Deck Estimator — Admin Operational Manual & Calculator Formulas PDF Generator
// Generates official, downloadable, beautifully formatted PDF documents directly
// ====================================================================

import mainLogo from '../assets/images/Main_Logo_v2.png';

/**
 * Helper to dynamically load html2pdf and save PDF
 */
async function generatePdfFromElement(element, filename) {
  const opt = {
    margin: [10, 10, 10, 10],
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  };

  document.body.appendChild(element);
  try {
    const html2pdfModule = await import('html2pdf.js');
    const html2pdf = typeof html2pdfModule.default === 'function'
      ? html2pdfModule.default
      : (typeof html2pdfModule.default?.default === 'function'
        ? html2pdfModule.default.default
        : (typeof html2pdfModule === 'function' ? html2pdfModule : null));

    if (!html2pdf) {
      throw new Error('PDF export engine failed to initialize.');
    }

    await html2pdf().from(element).set(opt).save();
  } finally {
    if (document.body.contains(element)) {
      document.body.removeChild(element);
    }
  }
}

/**
 * 1. Download Complete Administrator Guidelines & Operational Manual PDF
 */
export async function downloadAdminManualPdf() {
  const container = document.createElement('div');
  container.style.width = '780px';
  container.style.padding = '24px 30px';
  container.style.backgroundColor = '#FFFFFF';
  container.style.color = '#0F2C59';
  container.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  container.style.fontSize = '12px';
  container.style.lineHeight = '1.5';

  container.innerHTML = `
    <!-- HEADER BANNER -->
    <div style="border-bottom: 2.5px solid #034EA2; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="${mainLogo}" alt="Logo" style="height: 40px; object-fit: contain;" />
          <div>
            <h1 style="margin: 0; font-size: 20px; font-weight: 900; color: #0F2C59; letter-spacing: -0.3px;">
              Deck Restoration Plus
            </h1>
            <div style="font-size: 11px; font-weight: 700; color: #034EA2; text-transform: uppercase; letter-spacing: 0.5px;">
              Central Administrator Guidelines &amp; Operational Manual
            </div>
          </div>
        </div>
      </div>
      <div style="text-align: right; font-size: 10.5px; color: #64748B;">
        <div><strong>Document ID:</strong> SOP-ADMIN-V2.4</div>
        <div><strong>Platform Version:</strong> 2.4.0 (Production)</div>
        <div><strong>Issued:</strong> ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
        <div><strong>Classification:</strong> Confidential • Operational Handbook</div>
      </div>
    </div>

    <!-- TABLE OF CONTENTS -->
    <div style="background-color: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px;">
      <h3 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 800; color: #0F2C59; text-transform: uppercase;">
        Table of Contents &amp; Core Platform Modules
      </h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px 16px; font-size: 11px; color: #334155;">
        <div>• <strong>Module 1:</strong> Architecture &amp; Platform Lifecycle</div>
        <div>• <strong>Module 2:</strong> Executive Operations Dashboard</div>
        <div>• <strong>Module 3:</strong> User Management &amp; Account Moderation</div>
        <div>• <strong>Module 4:</strong> Contractor Verification &amp; Compliance</div>
        <div>• <strong>Module 5:</strong> Lead Management &amp; Inquiries Routing</div>
        <div>• <strong>Module 6:</strong> Project Lifecycle &amp; 4-Stage Dispatch</div>
        <div>• <strong>Module 7:</strong> Pricing Engine &amp; Wholesale Trade Discounts</div>
        <div>• <strong>Module 8:</strong> Business Intelligence &amp; Reports</div>
        <div>• <strong>Module 9:</strong> System Settings &amp; Targeted Dispatcher</div>
        <div>• <strong>Module 10:</strong> Multi-Admin Hierarchy &amp; Daily SOP Checklists</div>
      </div>
    </div>

    <!-- MODULE 1 -->
    <div style="margin-bottom: 22px;">
      <h2 style="font-size: 15px; font-weight: 900; color: #034EA2; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; margin-bottom: 8px;">
        1. Architecture &amp; Platform Ecosystem
      </h2>
      <p style="margin: 0 0 8px 0; color: #334155;">
        Deck Restoration Plus operates as a synchronized three-tier ecosystem connecting Homeowners (Customers), Vetted Specialists (Contractors), and Platform Administrators via a centralized MongoDB Atlas cloud datastore.
      </p>
      <div style="background-color: #EFF6FF; border-left: 3px solid #2563EB; padding: 10px 14px; font-size: 11px; color: #1E3A8A; margin-bottom: 8px;">
        <strong>Key Platform Rules:</strong>
        <ul style="margin: 4px 0 0; padding-left: 18px; line-height: 1.5;">
          <li><strong>Customer Portal:</strong> Calculates self-service restoration estimates based on exact dimensions, wood species, and surface conditions.</li>
          <li><strong>Contractor Portal:</strong> Professional estimation tool featuring trade wholesale discounts (10% standard or customized override).</li>
          <li><strong>Admin Central Hub:</strong> Central authority controlling user accounts, contractor verification, discrete 4-stage project tracking, pricing rate cards, and live audit telemetry.</li>
        </ul>
      </div>
    </div>

    <!-- MODULE 2 -->
    <div style="margin-bottom: 22px;">
      <h2 style="font-size: 15px; font-weight: 900; color: #034EA2; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; margin-bottom: 8px;">
        2. Executive Operations Dashboard (/admin/dashboard)
      </h2>
      <p style="margin: 0 0 8px 0; color: #334155;">
        The executive dashboard provides a single-pane-of-glass overview of company performance with zero static mockups:
      </p>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 8px;">
        <thead>
          <tr style="background-color: #F1F5F9; text-align: left;">
            <th style="padding: 6px 10px; border: 1px solid #E2E8F0;">KPI Card</th>
            <th style="padding: 6px 10px; border: 1px solid #E2E8F0;">Database Source</th>
            <th style="padding: 6px 10px; border: 1px solid #E2E8F0;">Operational Capability</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 6px 10px; border: 1px solid #E2E8F0;"><strong>Total Estimates</strong></td>
            <td style="padding: 6px 10px; border: 1px solid #E2E8F0;"><code>Estimate.countDocuments()</code></td>
            <td style="padding: 6px 10px; border: 1px solid #E2E8F0;">Monitors total self-service quotes calculated by customers and contractors.</td>
          </tr>
          <tr>
            <td style="padding: 6px 10px; border: 1px solid #E2E8F0;"><strong>Completed Projects</strong></td>
            <td style="padding: 6px 10px; border: 1px solid #E2E8F0;"><code>Project.find({ status: 'completed' })</code></td>
            <td style="padding: 6px 10px; border: 1px solid #E2E8F0;">Tracks finalized physical restoration jobs delivered and customer-approved.</td>
          </tr>
          <tr>
            <td style="padding: 6px 10px; border: 1px solid #E2E8F0;"><strong>Total Revenue ($)</strong></td>
            <td style="padding: 6px 10px; border: 1px solid #E2E8F0;">Sum of completed estimate totalAmount</td>
            <td style="padding: 6px 10px; border: 1px solid #E2E8F0;">Realized platform sales from delivered restorations.</td>
          </tr>
          <tr>
            <td style="padding: 6px 10px; border: 1px solid #E2E8F0;"><strong>Hot Leads</strong></td>
            <td style="padding: 6px 10px; border: 1px solid #E2E8F0;"><code>Lead.find({ priority: 'HOT' })</code></td>
            <td style="padding: 6px 10px; border: 1px solid #E2E8F0;">Time-sensitive customer inquiries submitted within the last 30 days requiring immediate outreach.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODULE 3 -->
    <div style="margin-bottom: 22px;">
      <h2 style="font-size: 15px; font-weight: 900; color: #034EA2; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; margin-bottom: 8px;">
        3. User Management &amp; Moderation (/admin/users)
      </h2>
      <p style="margin: 0 0 6px 0; color: #334155;">
        Administrators have full governance over customer and contractor platform standings:
      </p>
      <ul style="margin: 0 0 8px 0; padding-left: 18px; font-size: 11px; color: #334155; line-height: 1.5;">
        <li><strong>Status Column:</strong> Strictly limited to 3 clean statuses: <code>ACTIVE</code> (green), <code>INACTIVE</code> (slate), and <code>BLOCKED / SUSPENDED</code> (red).</li>
        <li><strong>Account Moderation:</strong> Blocking an account immediately locks the portal. The blocked user sees a warning card directing them to submit an appeal.</li>
        <li><strong>Appeals Resolution:</strong> In the <em>User Requests</em> tab, admins review unblock appeals with user-submitted reasons and can reinstate or decline with notes.</li>
        <li><strong>Safe Record Purging:</strong> Bulk delete operations on user records erase associated calculation logs and inquiry tickets <em>without deleting the actual user account</em>, preserving credentials.</li>
      </ul>
    </div>

    <!-- MODULE 4 -->
    <div style="margin-bottom: 22px;">
      <h2 style="font-size: 15px; font-weight: 900; color: #034EA2; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; margin-bottom: 8px;">
        4. Contractor Verification &amp; Compliance (/admin/verification-progress)
      </h2>
      <p style="margin: 0 0 6px 0; color: #334155;">
        Contractor partners must be verified before bidding on customer restoration jobs:
      </p>
      <ul style="margin: 0 0 8px 0; padding-left: 18px; font-size: 11px; color: #334155; line-height: 1.5;">
        <li><strong>Credential Inspection:</strong> Verify trade license numbers, state jurisdictions, business legal names, and liability coverage certificates.</li>
        <li><strong>Document Inspection:</strong> Open uploaded PDF/image insurance binders. Mark each document as <code>Verified</code> or <code>Rejected</code>.</li>
        <li><strong>Approval Flow:</strong> Approving unlocks the contractor's trade discount and allows project dispatch. Rejection logs a mandatory explanation for compliance audit.</li>
      </ul>
    </div>

    <!-- MODULE 5 -->
    <div style="margin-bottom: 22px;">
      <h2 style="font-size: 15px; font-weight: 900; color: #034EA2; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; margin-bottom: 8px;">
        5. Lead Management &amp; Reach-Out Requests (/admin/leads)
      </h2>
      <p style="margin: 0 0 6px 0; color: #334155;">
        Captures all homeowner inquiries generated across the web platform and estimator calculation cards:
      </p>
      <ul style="margin: 0 0 8px 0; padding-left: 18px; font-size: 11px; color: #334155; line-height: 1.5;">
        <li><strong>Estimation Service Tagging:</strong> When a user generates an estimate and clicks "Request Booking", the inquiry is tagged as <code>Estimation Service</code> with the full deck specification attached.</li>
        <li><strong>Reach-Out Inquiries:</strong> Direct customer messages submitted via contact forms are tagged as <code>Direct Reach-Out</code>.</li>
        <li><strong>Red Bubble Alerts:</strong> Sidebar displays unread lead counts in a red bubble. Opening a lead marks it as viewed, reducing the bubble count until cleared.</li>
        <li><strong>Export Options:</strong> Export CSV, Excel, or PDF dossiers with full customer contact snapshots.</li>
      </ul>
    </div>

    <!-- MODULE 6 -->
    <div style="margin-bottom: 22px;">
      <h2 style="font-size: 15px; font-weight: 900; color: #034EA2; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; margin-bottom: 8px;">
        6. Project Lifecycle &amp; 4-Stage Dispatch (/admin/projects)
      </h2>
      <p style="margin: 0 0 6px 0; color: #334155;">
        Tracks deck restoration projects through 4 discrete operational phases:
      </p>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; font-size: 11px; margin-bottom: 8px;">
        <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 6px; padding: 8px;">
          <strong style="color: #1D4ED8;">1. Created (10%)</strong>
          <div style="color: #475569; font-size: 10px; margin-top: 2px;">Initial calculation generated.</div>
        </div>
        <div style="background-color: #FEF3C7; border: 1px solid #FDE68A; border-radius: 6px; padding: 8px;">
          <strong style="color: #B45309;">2. Requested (30%)</strong>
          <div style="color: #475569; font-size: 10px; margin-top: 2px;">Customer requested booking.</div>
        </div>
        <div style="background-color: #F3E8FF; border: 1px solid #E9D5FF; border-radius: 6px; padding: 8px;">
          <strong style="color: #7E22CE;">3. In Progress (65%)</strong>
          <div style="color: #475569; font-size: 10px; margin-top: 2px;">Active crew dispatched on-site.</div>
        </div>
        <div style="background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 6px; padding: 8px;">
          <strong style="color: #15803D;">4. Completed (100%)</strong>
          <div style="color: #475569; font-size: 10px; margin-top: 2px;">Restoration finished &amp; invoice paid.</div>
        </div>
      </div>
      <p style="margin: 0; font-size: 11px; color: #475569;">
        <em>Live Sync Rule:</em> When an admin updates a project stage with an optional customer note, MongoDB immediately triggers live notifications and updates the customer and contractor portals in real time.
      </p>
    </div>

    <!-- MODULE 7 -->
    <div style="margin-bottom: 22px;">
      <h2 style="font-size: 15px; font-weight: 900; color: #034EA2; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; margin-bottom: 8px;">
        7. Pricing Engine &amp; Wholesale Trade Discounts (/admin/pricing)
      </h2>
      <p style="margin: 0 0 6px 0; color: #334155;">
        Configure real-time pricing parameters across 6 tuning engines:
      </p>
      <ul style="margin: 0 0 8px 0; padding-left: 18px; font-size: 11px; color: #334155; line-height: 1.5;">
        <li><strong>Base Rate Card Matrix:</strong> 12-cell sq ft matrix (Clean, Strip, Strip &amp; Sand vs 4 coating finishes).</li>
        <li><strong>Wood Species Multipliers:</strong> Labor difficulty adders (Cedar +10%, Redwood +15%, Tigerwood +30%).</li>
        <li><strong>Architectural Components:</strong> Pricing multipliers for railings, stairs, fascia, joists, and pergolas.</li>
        <li><strong>Contractor Trade Discounts:</strong> Default global wholesale tier (10%) plus isolated custom discount tuning per contractor with live autocomplete and isolated override protection.</li>
      </ul>
    </div>

    <!-- MODULE 8 -->
    <div style="margin-bottom: 22px;">
      <h2 style="font-size: 15px; font-weight: 900; color: #034EA2; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; margin-bottom: 8px;">
        8. Business Intelligence &amp; Reports (/admin/reports)
      </h2>
      <p style="margin: 0 0 6px 0; color: #334155;">
        100% real database aggregations across 6 specialized analytical tabs:
      </p>
      <ul style="margin: 0 0 8px 0; padding-left: 18px; font-size: 11px; color: #334155; line-height: 1.5;">
        <li><strong>Business Overview:</strong> Gross Revenue Trajectory SVG and Live Lead Conversion Funnel Bar Chart.</li>
        <li><strong>Revenue Analytics:</strong> Financial streams across materials, washing, sanding, and staining with net margins.</li>
        <li><strong>Leads &amp; Projects:</strong> Visual status distribution bars, fluid inquiry flow wave, and user distribution bars.</li>
        <li><strong>Contractor Performance:</strong> Ranked leaderboard by completed restorations, conversion rate, and revenue volume.</li>
        <li><strong>Catalog &amp; Wood Demand:</strong> Wood species popularity bars, services chosen demand bars, and surface area min/max/avg sq ft statistics.</li>
        <li><strong>System Audit Trail:</strong> Searchable chronological log of all administrative actions, pricing edits, and security events.</li>
      </ul>
    </div>

    <!-- MODULE 9 & 10 -->
    <div style="margin-bottom: 16px;">
      <h2 style="font-size: 15px; font-weight: 900; color: #034EA2; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; margin-bottom: 8px;">
        9. System Settings &amp; Targeted Dispatcher (/admin/settings)
      </h2>
      <ul style="margin: 0 0 8px 0; padding-left: 18px; font-size: 11px; color: #334155; line-height: 1.5;">
        <li><strong>Targeted Notifications:</strong> Dispatch broadcast notifications to All Customers, All Contractors, Everyone, or Specific Recipients. Supports selecting multiple people (both customers and contractors) with red cross mark (✕) removal.</li>
        <li><strong>Contact Channels Live Sync:</strong> Tuning official support phone, WhatsApp business number, email, address, and hours updates MongoDB and syncs live across footers, customer portal, and contractor portal.</li>
        <li><strong>System Diagnostics &amp; DB:</strong> Live MongoDB Atlas cluster telemetry (connection state, collections registry, memory allocation, ping latency).</li>
      </ul>
    </div>

    <!-- FOOTER SIGN OFF -->
    <div style="border-top: 1.5px solid #CBD5E1; padding-top: 12px; margin-top: 20px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #64748B;">
      <div>Deck Restoration Plus Central Administration • All Rights Reserved</div>
      <div>Official Operational Guidelines • Generated for System Administrator</div>
    </div>
  `;

  await generatePdfFromElement(container, 'Deck_Estimator_Admin_Operational_Manual.pdf');
}

/**
 * 2. Download Calculator Working Data, Mathematical Formulas & Worked Example PDF
 */
export async function downloadCalculatorFormulasPdf() {
  const container = document.createElement('div');
  container.style.width = '780px';
  container.style.padding = '24px 30px';
  container.style.backgroundColor = '#FFFFFF';
  container.style.color = '#0F2C59';
  container.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  container.style.fontSize = '12px';
  container.style.lineHeight = '1.5';

  container.innerHTML = `
    <!-- HEADER BANNER -->
    <div style="border-bottom: 2.5px solid #15803D; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="${mainLogo}" alt="Logo" style="height: 40px; object-fit: contain;" />
          <div>
            <h1 style="margin: 0; font-size: 20px; font-weight: 900; color: #0F2C59; letter-spacing: -0.3px;">
              Deck Restoration Plus
            </h1>
            <div style="font-size: 11px; font-weight: 700; color: #15803D; text-transform: uppercase; letter-spacing: 0.5px;">
              Continuous Estimation Engine • Mathematical Formulations &amp; Architectural Dossier
            </div>
          </div>
        </div>
      </div>
      <div style="text-align: right; font-size: 10.5px; color: #64748B;">
        <div><strong>Document ID:</strong> CALC-FORMULA-ENGINE-V2.4</div>
        <div><strong>Authoritative Standard:</strong> Continuous Rate Card Engine</div>
        <div><strong>Issued:</strong> ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
        <div><strong>Scope:</strong> Engineering Math, Rate Matrices &amp; Calculations</div>
      </div>
    </div>

    <!-- EXECUTIVE SUMMARY -->
    <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px;">
      <h3 style="margin: 0 0 6px 0; font-size: 13px; font-weight: 800; color: #166534; text-transform: uppercase;">
        Mathematical Framework Overview
      </h3>
      <p style="margin: 0; font-size: 11.5px; color: #14532D; line-height: 1.5;">
        The Deck Restoration Plus continuous calculation engine dynamically calculates restoration pricing by compounding 
        <strong>Surface Geometry Area</strong>, <strong>Wood Species &amp; Condition Rate Cards</strong>, <strong>Chemical Coating Coverage</strong>, 
        <strong>Professional Labor Hours</strong>, <strong>Structural Repairs</strong>, and applying the <strong>$2,500 Mobilization Floor Rule</strong> 
        and <strong>Contractor Trade Wholesale Discounts</strong>.
      </p>
    </div>

    <!-- FORMULA 1: SURFACE AREA -->
    <div style="margin-bottom: 20px;">
      <h2 style="font-size: 14px; font-weight: 900; color: #0F2C59; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; margin-bottom: 8px;">
        Formula 1: Total Effective Restoration Surface Area (A<sub>total</sub>)
      </h2>
      <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 10px 14px; font-family: monospace; font-size: 12px; color: #034EA2; margin-bottom: 8px;">
        A<sub>total</sub> = A<sub>floor</sub> + A<sub>railings</sub> + A<sub>stairs</sub> + A<sub>fascia</sub> + A<sub>joists</sub> + A<sub>pergola</sub> + A<sub>privacy</sub> + A<sub>siding</sub>
      </div>
      <div style="font-size: 11px; color: #334155; line-height: 1.6;">
        <div>• <strong>A<sub>floor</sub>:</strong> Primary deck footprint: <code>Length × Width</code> (for rectangular/square) or multi-tier sum.</div>
        <div>• <strong>A<sub>railings</sub>:</strong> <code>Linear Feet × 3.0 ft (height) × 2 (both sides)</code></div>
        <div>• <strong>A<sub>stairs</sub>:</strong> <code>Step Count × Stair Width × 1.5 sq ft per tread &amp; riser</code></div>
        <div>• <strong>A<sub>fascia</sub>:</strong> <code>Perimeter Linear Feet × 0.8 ft (rim joist band depth)</code></div>
        <div>• <strong>A<sub>joists</sub>:</strong> <code>A<sub>floor</sub> × 0.35</code> (when underside chemical washing is requested)</div>
        <div>• <strong>A<sub>pergola</sub>:</strong> <code>Pergola Length × Width × 0.60</code> (slat shading surface area)</div>
      </div>
    </div>

    <!-- FORMULA 2: BASE RATE CARD MATRIX LOOKUP -->
    <div style="margin-bottom: 20px;">
      <h2 style="font-size: 14px; font-weight: 900; color: #0F2C59; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; margin-bottom: 8px;">
        Formula 2: Continuous Rate Card Lookup (R<sub>base</sub>)
      </h2>
      <p style="margin: 0 0 6px 0; font-size: 11px; color: #334155;">
        Base square-foot rate card lookup determined by surface preparation method and protective coating finish:
      </p>
      <table style="width: 100%; border-collapse: collapse; font-size: 10.5px; text-align: center; margin-bottom: 8px;">
        <thead>
          <tr style="background-color: #0F2C59; color: #FFFFFF;">
            <th style="padding: 6px; border: 1px solid #CBD5E1;">Preparation Method</th>
            <th style="padding: 6px; border: 1px solid #CBD5E1;">Clear Sealer</th>
            <th style="padding: 6px; border: 1px solid #CBD5E1;">Semi-Transparent</th>
            <th style="padding: 6px; border: 1px solid #CBD5E1;">Semi-Solid Stain</th>
            <th style="padding: 6px; border: 1px solid #CBD5E1;">Solid Protective Stain</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 5px; border: 1px solid #CBD5E1; font-weight: 700; background-color: #F8FAFC;">Deck Cleaning / Pressure Wash</td>
            <td style="padding: 5px; border: 1px solid #CBD5E1;">$2.50 / sq ft</td>
            <td style="padding: 5px; border: 1px solid #CBD5E1;">$2.85 / sq ft</td>
            <td style="padding: 5px; border: 1px solid #CBD5E1;">$3.15 / sq ft</td>
            <td style="padding: 5px; border: 1px solid #CBD5E1;">$3.45 / sq ft</td>
          </tr>
          <tr>
            <td style="padding: 5px; border: 1px solid #CBD5E1; font-weight: 700; background-color: #F8FAFC;">Chemical Stripping &amp; Wash</td>
            <td style="padding: 5px; border: 1px solid #CBD5E1;">$3.25 / sq ft</td>
            <td style="padding: 5px; border: 1px solid #CBD5E1;">$3.60 / sq ft</td>
            <td style="padding: 5px; border: 1px solid #CBD5E1;">$3.95 / sq ft</td>
            <td style="padding: 5px; border: 1px solid #CBD5E1;">$4.25 / sq ft</td>
          </tr>
          <tr>
            <td style="padding: 5px; border: 1px solid #CBD5E1; font-weight: 700; background-color: #F8FAFC;">Chemical Strip &amp; Mechanical Sanding</td>
            <td style="padding: 5px; border: 1px solid #CBD5E1;">$4.50 / sq ft</td>
            <td style="padding: 5px; border: 1px solid #CBD5E1;">$4.90 / sq ft</td>
            <td style="padding: 5px; border: 1px solid #CBD5E1;">$5.25 / sq ft</td>
            <td style="padding: 5px; border: 1px solid #CBD5E1;">$5.75 / sq ft</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- FORMULA 3: LABOR HOURS & DIFFICULTY MULTIPLIERS -->
    <div style="margin-bottom: 20px;">
      <h2 style="font-size: 14px; font-weight: 900; color: #0F2C59; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; margin-bottom: 8px;">
        Formula 3: Professional Technician Labor Hours (H<sub>total</sub>)
      </h2>
      <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 10px 14px; font-family: monospace; font-size: 12px; color: #034EA2; margin-bottom: 8px;">
        H<sub>total</sub> = [ A<sub>total</sub> / ProductionSpeed ] × M<sub>wood</sub> × M<sub>access</sub>
      </div>
      <div style="font-size: 11px; color: #334155; line-height: 1.5;">
        <div>• <strong>Production Speed:</strong> Cleaning: 100 sq ft/hr | Chemical Strip: 75 sq ft/hr | Sanding: 50 sq ft/hr | Staining: 90 sq ft/hr</div>
        <div>• <strong>Wood Multiplier (M<sub>wood</sub>):</strong> PT Pine: 1.00 | Cedar: 1.10 (+10%) | Redwood: 1.15 (+15%) | Tigerwood/Ipe: 1.30 (+30%) | Mahogany: 1.20 (+20%)</div>
        <div>• <strong>Access Multiplier (M<sub>access</sub>):</strong> Ground Level: 1.00 | Second-Story Raised (&gt;8ft): 1.15 (+15% ladder &amp; safety harness rig) | Rooftop: 1.25 (+25%)</div>
        <div>• <strong>Labor Cost:</strong> <code>Labor Hours × Labor Hourly Rate ($250.00 / hr)</code></div>
      </div>
    </div>

    <!-- FORMULA 4: CHEMICAL PRODUCT CONSUMPTION -->
    <div style="margin-bottom: 20px;">
      <h2 style="font-size: 14px; font-weight: 900; color: #0F2C59; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; margin-bottom: 8px;">
        Formula 4: Chemical Product Packages &amp; Coverage Formulation
      </h2>
      <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 10px 14px; font-family: monospace; font-size: 12px; color: #034EA2; margin-bottom: 8px;">
        Gallons<sub>coating</sub> = ⌈ [ A<sub>total</sub> / CoveragePerGallon ] × Coats × (1 + WasteFactor) ⌉
      </div>
      <div style="font-size: 11px; color: #334155; line-height: 1.5;">
        <div>• <strong>CoveragePerGallon:</strong> Standard penetrative oil: 200–250 sq ft/gal on bare wood; 300 sq ft/gal on maintenance coats.</div>
        <div>• <strong>WasteFactor:</strong> Standard 10% (0.10) for end-grain absorption, rail spindles, and over-brushing.</div>
        <div>• <strong>Cleaners &amp; Strippers:</strong> 1 gallon of concentrate treats 250 sq ft at heavy weathering dilution.</div>
      </div>
    </div>

    <!-- FORMULA 5: MOBILIZATION FLOOR & TRADE DISCOUNT -->
    <div style="margin-bottom: 20px;">
      <h2 style="font-size: 14px; font-weight: 900; color: #0F2C59; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; margin-bottom: 8px;">
        Formula 5: Mobilization Minimum &amp; Contractor Wholesale Trade Discount
      </h2>
      <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 10px 14px; font-family: monospace; font-size: 12px; color: #034EA2; margin-bottom: 8px;">
        Subtotal<sub>pre-discount</sub> = max( Price<sub>calculated</sub>, MinimumJobPrice [$2,500.00] )<br />
        Quote<sub>contractor</sub> = Subtotal<sub>pre-discount</sub> × ( 1 - DiscountPercentage )
      </div>
      <div style="font-size: 11px; color: #334155; line-height: 1.5;">
        <div>• <strong>Minimum Job Price ($2,500.00):</strong> Protects technician vehicle dispatch, chemical wash setup, pressure rig transport, and EPA wash containment. If calculated amount is $1,400, the final invoice applies $2,500.00.</div>
        <div>• <strong>Wholesale Trade Discount:</strong> Applies automatically on contractor portal calculations (10% default standard tier, or customized override e.g. 12% or 15% assigned by Administrator).</div>
      </div>
    </div>

    <!-- PRACTICAL WORKED EXAMPLE WITH EXACT NUMBERS -->
    <div style="background-color: #F8FAFC; border: 1.5px solid #034EA2; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px;">
      <h3 style="margin: 0 0 8px 0; font-size: 13.5px; font-weight: 900; color: #034EA2; text-transform: uppercase;">
        Complete Practical Worked Example: Case Study 500 Sq Ft Redwood Deck
      </h3>
      <div style="font-size: 11px; color: #334155; line-height: 1.6;">
        <div><strong>Project Parameters:</strong> 500 sq ft California Redwood deck (20' × 25'), Second-Story Raised (1.15 elevation multiplier), existing weathered gray acrylic coating with peeling, 40 linear feet of 2-rail perimeter railings, 1 flight of stairs (5 steps × 4 ft wide), and contractor has standard 10% wholesale trade discount.</div>
        <hr style="border: none; border-top: 1px dashed #CBD5E1; margin: 8px 0;" />
        <div><strong>Step 1: Calculate Effective Surface Area</strong></div>
        <div>• Flooring Area: <code>20 × 25 = 500.0 sq ft</code></div>
        <div>• Railings Area: <code>40 LF × 3.0 ft × 2 = 240.0 sq ft</code></div>
        <div>• Stairs Area: <code>5 steps × 4 ft width × 1.5 sq ft = 30.0 sq ft</code></div>
        <div>• <strong>Total Area (A<sub>total</sub>):</strong> <code>500 + 240 + 30 = 770.0 sq ft</code></div>

        <div style="margin-top: 6px;"><strong>Step 2: Base Rate Card Calculation</strong></div>
        <div>• Prep &amp; Coating: Chemical Strip &amp; Pressure Wash + Semi-Transparent Protective Stain = <code>$3.60 / sq ft</code></div>
        <div>• Base Surface Price: <code>770.0 sq ft × $3.60 = $2,772.00</code></div>

        <div style="margin-top: 6px;"><strong>Step 3: Labor Difficulty &amp; Height Adjustments</strong></div>
        <div>• Redwood labor multiplier: <code>+15%</code>; Second-story raised access: <code>+15%</code></div>
        <div>• Combined Multiplier: <code>1.15 × 1.15 = 1.3225</code></div>
        <div>• Additional Technical Prep Hours: <code>5.2 hours × $250.00/hr = $1,300.00</code></div>

        <div style="margin-top: 6px;"><strong>Step 4: Chemical Package &amp; Preps</strong></div>
        <div>• Deck Restoration Plus Heavy-Duty Stripper &amp; Wood Brightener package = <code>$458.00</code></div>

        <div style="margin-top: 6px;"><strong>Step 5: Subtotal &amp; Minimum Job Floor Evaluation</strong></div>
        <div>• Calculated Total: <code>$2,772.00 + $1,300.00 + $458.00 = $4,530.00</code></div>
        <div>• Mobilization Minimum check: <code>$4,530.00 ≥ $2,500.00</code> (Threshold met, no floor adjustment required).</div>

        <div style="margin-top: 6px;"><strong>Step 6: Contractor Trade Discount Deduction (10%)</strong></div>
        <div>• Trade Wholesale Discount: <code>-$453.00 (10%)</code></div>
        <div style="font-size: 13px; font-weight: 800; color: #15803D; margin-top: 4px;">
          • Final Certified Contractor Quote: $4,077.00 (Retail Value: $4,530.00 • Partner Profit Margin: $453.00)
        </div>
      </div>
    </div>

    <!-- FOOTER SIGN OFF -->
    <div style="border-top: 1.5px solid #CBD5E1; padding-top: 12px; margin-top: 20px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #64748B;">
      <div>Deck Restoration Plus Central Calculation Engine • Proprietary Formulas</div>
      <div>Official Technical Math Reference • Continuous Estimator Formulations</div>
    </div>
  `;

  await generatePdfFromElement(container, 'Deck_Restoration_Calculator_Engine_Formulas_Guide.pdf');
}

