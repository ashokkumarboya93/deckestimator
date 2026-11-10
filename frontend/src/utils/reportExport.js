// ====================================================================
// Deck Estimator — Template-Based PDF & Excel Report Generator
// Generates official downloadable PDF dossier without browser print dialog
// ====================================================================

import html2pdf from 'html2pdf.js';

/**
 * Format currency helper
 */
function formatMoney(val) {
  if (typeof val !== 'number' || isNaN(val)) return '$2,500.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

/**
 * Download Official Estimate PDF Dossier
 * @param {Object} est - Estimate or Project or Lead object
 * @param {Object} cust - Customer / User details
 */
export async function downloadEstimatePdf(est = {}, cust = {}) {
  const refNum =
    est.estimateNumber ||
    est.estimateReference ||
    est.ref ||
    est.leadNumber ||
    est.projectId ||
    `DP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

  const createdDate = est.createdAt || est.latestContactDate || new Date();
  const dateFormatted = new Date(createdDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const timeFormatted = new Date(createdDate).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const customerName = cust.fullName || cust.name || est.customerName || est.name || 'Valued Deck Owner';
  const customerEmail = cust.email || est.userEmail || est.email || 'customer@deckrestorationplus.com';
  const customerPhone = cust.phone || cust.phoneNumber || est.userPhone || est.phone || '(856) 678-3325';

  const projectName =
    est.projectName ||
    est.title ||
    est.deckDetails?.projectName ||
    est.deckSnapshot?.projectName ||
    'Custom Deck Restoration Project';

  const addrObj = est.propertyAddress || est.deckDetails?.propertyAddress || est.deckSnapshot?.propertyAddress || cust.address || {};
  const street = addrObj.street || est.address || est.location || 'Property Location On-File';
  const city = addrObj.city || est.city || '';
  const state = addrObj.state || est.state || '';
  const zipCode = addrObj.zipCode || est.zipCode || '';
  const fullAddress = [street, city, state, zipCode].filter(Boolean).join(', ');

  // Dimensions & Areas
  const snap = est.pricingSnapshot || est.calculationDetails || {};
  const length = est.length || est.deckDetails?.length || est.deckDetails?.deckLength || snap.length || 20;
  const width = est.width || est.deckDetails?.width || est.deckDetails?.deckWidth || snap.width || 20;
  const floorArea = est.floorArea || est.deckDetails?.areaSqFt || est.deckDetails?.area || est.deckArea || (Number(length) * Number(width)) || 400;
  const totalBillableArea = snap.A || est.billableArea || floorArea;

  const shape = (est.shape || est.deckShape || est.deckDetails?.deckShape || 'rectangle').replace(/_/g, ' ').toUpperCase();
  const wood = (est.woodSpecies || est.deckDetails?.woodSpecies || 'Pressure Treated Pine').replace(/_/g, ' ').toUpperCase();
  const elevation = (est.height || est.accessType || est.structureDetails?.height || 'Ground Level (0–4 ft)').replace(/_/g, ' ').toUpperCase();
  const exactHeight = est.exactHeightFt || est.structureDetails?.exactHeightFt ? `${est.exactHeightFt || est.structureDetails?.exactHeightFt} ft` : 'Standard';

  const coating = (est.existingCoating || est.coating || est.surfaceDetails?.coatingStatus || 'none').replace(/_/g, ' ').toUpperCase();

  // Services
  let rawServices = est.services || snap.services || [];
  if (!Array.isArray(rawServices) || rawServices.length === 0) {
    rawServices = ['cleaning', 'sealing'];
  }
  const servicesList = rawServices.map((s) => String(s).replace(/_/g, ' ').toUpperCase());

  // Components
  const componentsList = [];
  const struct = est.structureDetails || est.deckDetails?.structureDetails || {};
  const compSqft = est.componentSqft || {};
  if (struct.hasRailings || compSqft.railings) componentsList.push(`Perimeter Railings (${compSqft.railings || struct.railingSqft || 50} sq ft)`);
  if (struct.hasStairs || compSqft.stairs) componentsList.push(`Stair Steps (${compSqft.stairs || struct.stairStepCount || 4} steps)`);
  if (struct.hasPergola || compSqft.pergola) componentsList.push(`Pergola Overhead (${compSqft.pergola || struct.pergolaSqft || 0} sq ft)`);
  if (struct.hasPrivacyWall || compSqft.privacy_wall) componentsList.push(`Privacy Screen / Wall (${compSqft.privacy_wall || struct.privacyWallSqft || 0} sq ft)`);
  if (struct.hasSiding || compSqft.siding) componentsList.push(`Exterior Siding (${compSqft.siding || struct.sidingSqft || 0} sq ft)`);
  if (struct.hasFascia || compSqft.fascia) componentsList.push(`Fascia Banding (${compSqft.fascia || struct.fasciaSqft || 0} sq ft)`);
  if (struct.includeJoists || compSqft.joists) componentsList.push(`Underside Joists (${compSqft.joists || struct.joistsSqft || 0} sq ft)`);

  // Conditions
  const conditionsList = [];
  const rawConds = est.conditions || est.visibleConditions || est.conditionFlags || [];
  if (Array.isArray(rawConds) && rawConds.length > 0) {
    rawConds.forEach((c) => conditionsList.push(String(c).replace(/_/g, ' ').toUpperCase()));
  } else {
    conditionsList.push('STANDARD WEATHERED DECK');
  }

  // Board counts
  const boardIssues = [];
  if (est.crackBoardCount) boardIssues.push(`Cracks & Checks: ${est.crackBoardCount} boards`);
  if (est.rottedBoardCount) boardIssues.push(`Rotted Decay: ${est.rottedBoardCount} boards`);
  if (est.warpedBoardCount) boardIssues.push(`Warped / Cupped: ${est.warpedBoardCount} boards`);
  if (est.looseBoardCount) boardIssues.push(`Loose / Backed Out: ${est.looseBoardCount} boards`);
  if (est.waterDamagedBoardCount) boardIssues.push(`Water Damaged: ${est.waterDamagedBoardCount} boards`);

  // Photos
  const photos = est.photos || est.deckDetails?.photos || est.deckSnapshot?.photos || [];

  // Price
  const totalAmount = typeof est.total === 'number'
    ? est.total
    : typeof est.totalAmount === 'number'
    ? est.totalAmount
    : typeof snap.total === 'number'
    ? snap.total
    : 2500;

  const minJobAmount = snap.minJob || est.minJobAmount || 2500;
  const isMinJobApplies = est.minJobApplies || (totalAmount <= minJobAmount);

  // Build HTML Report Template
  const reportElement = document.createElement('div');
  reportElement.style.width = '780px';
  reportElement.style.padding = '36px 40px';
  reportElement.style.background = '#ffffff';
  reportElement.style.color = '#0f172a';
  reportElement.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  reportElement.style.fontSize = '12px';
  reportElement.style.lineHeight = '1.45';
  reportElement.style.boxSizing = 'border-box';

  reportElement.innerHTML = `
    <!-- 1. HEADER SECTION -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2.5px solid #1E3A63; padding-bottom: 16px; margin-bottom: 20px;">
      <div>
        <div style="font-size: 24px; font-weight: 800; color: #1E3A63; letter-spacing: -0.5px;">DECK RESTORATION PLUS</div>
        <div style="font-size: 11px; font-weight: 700; color: #E08131; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px;">
          Official Certified Deck Restoration Estimate Report
        </div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 14px; font-weight: 800; color: #1E3A63;">REFERENCE #: ${refNum}</div>
        <div style="font-size: 11px; color: #64748b; font-weight: 600; margin-top: 3px;">Generated: ${dateFormatted} at ${timeFormatted}</div>
        <div style="display: inline-block; padding: 3px 8px; background: #DCFCE7; color: #15803D; border: 1px solid #BBF7D0; border-radius: 4px; font-size: 10px; font-weight: 800; margin-top: 6px; text-transform: uppercase;">
          Guaranteed Estimate
        </div>
      </div>
    </div>

    <!-- 2. CUSTOMER & PROJECT DOSSIER -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 18px;">
      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px 16px;">
        <div style="font-size: 11px; font-weight: 700; color: #1E3A63; text-transform: uppercase; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px; margin-bottom: 8px;">
          Customer Contact Details
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="color: #64748b; font-weight: 500;">Customer Name:</span>
          <span style="font-weight: 700; color: #0F172A;">${customerName}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="color: #64748b; font-weight: 500;">Email Address:</span>
          <span style="font-weight: 600; color: #0F172A;">${customerEmail}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="color: #64748b; font-weight: 500;">Phone Number:</span>
          <span style="font-weight: 600; color: #0F172A;">${customerPhone}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #64748b; font-weight: 500;">Account Role:</span>
          <span style="font-weight: 700; color: #2563EB;">Verified Client</span>
        </div>
      </div>

      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px 16px;">
        <div style="font-size: 11px; font-weight: 700; color: #1E3A63; text-transform: uppercase; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px; margin-bottom: 8px;">
          Project Site Location & Time
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="color: #64748b; font-weight: 500;">Project Name:</span>
          <span style="font-weight: 700; color: #0F172A;">${projectName}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="color: #64748b; font-weight: 500;">Site Address:</span>
          <span style="font-weight: 600; color: #0F172A; text-align: right; max-width: 220px;">${fullAddress}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="color: #64748b; font-weight: 500;">Floor Area:</span>
          <span style="font-weight: 700; color: #0F172A;">${floorArea} sq ft (${length} ft × ${width} ft)</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #64748b; font-weight: 500;">Billable Surface Area:</span>
          <span style="font-weight: 700; color: #E08131;">${totalBillableArea} sq ft</span>
        </div>
      </div>
    </div>

    <!-- 3. SECTION-BY-SECTION ARCHITECTURAL BREAKDOWN -->
    <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; margin-bottom: 18px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 11.5px;">
        <thead>
          <tr style="background: #1E3A63; color: #FFFFFF;">
            <th style="padding: 9px 12px; text-align: left; font-weight: 700; width: 28%;">Scope Category</th>
            <th style="padding: 9px 12px; text-align: left; font-weight: 700; width: 34%;">Selected Specification</th>
            <th style="padding: 9px 12px; text-align: left; font-weight: 700; width: 38%;">Architectural Impact Details</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #E2E8F0; background: #FFFFFF;">
            <td style="padding: 8px 12px; font-weight: 700; color: #1E3A63;">Section 1: Footprint & Shape</td>
            <td style="padding: 8px 12px; font-weight: 600;">${shape}</td>
            <td style="padding: 8px 12px; color: #475569;">${length} ft length × ${width} ft width (${floorArea} sq ft)</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0; background: #F8FAFC;">
            <td style="padding: 8px 12px; font-weight: 700; color: #1E3A63;">Section 2: Components</td>
            <td style="padding: 8px 12px; font-weight: 600;">${componentsList.length > 0 ? componentsList.join(', ') : 'Standard Floor Only'}</td>
            <td style="padding: 8px 12px; color: #475569;">Detailed vertical & horizontal surface items included</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0; background: #FFFFFF;">
            <td style="padding: 8px 12px; font-weight: 700; color: #1E3A63;">Section 3: Wood Species</td>
            <td style="padding: 8px 12px; font-weight: 600;">${wood}</td>
            <td style="padding: 8px 12px; color: #475569;">Substrate conditioning tailored for cellular density</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0; background: #F8FAFC;">
            <td style="padding: 8px 12px; font-weight: 700; color: #1E3A63;">Section 4: Elevation Tier</td>
            <td style="padding: 8px 12px; font-weight: 600;">${elevation}</td>
            <td style="padding: 8px 12px; color: #475569;">Staging height: ${exactHeight}</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0; background: #FFFFFF;">
            <td style="padding: 8px 12px; font-weight: 700; color: #1E3A63;">Section 5: Existing Finish</td>
            <td style="padding: 8px 12px; font-weight: 600;">${coating}</td>
            <td style="padding: 8px 12px; color: #475569;">Pre-treatment chemical compatibility verified</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0; background: #F8FAFC;">
            <td style="padding: 8px 12px; font-weight: 700; color: #1E3A63;">Section 6: Services Selected</td>
            <td style="padding: 8px 12px; font-weight: 700; color: #E08131;">${servicesList.join(' • ')}</td>
            <td style="padding: 8px 12px; color: #475569;">Commercial chemical wash, prep, and protective coats</td>
          </tr>
          <tr style="background: #FFFFFF;">
            <td style="padding: 8px 12px; font-weight: 700; color: #1E3A63;">Section 7: Surface Conditions</td>
            <td style="padding: 8px 12px; font-weight: 600;">${conditionsList.join(', ')}</td>
            <td style="padding: 8px 12px; color: #475569;">${boardIssues.length > 0 ? boardIssues.join('; ') : 'No structural board decay observed'}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 4. UPLOADED INSPECTION PHOTOS (SECTION 8) -->
    ${
      photos && photos.length > 0
        ? `
      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px 16px; margin-bottom: 18px;">
        <div style="font-size: 11px; font-weight: 700; color: #1E3A63; text-transform: uppercase; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px; margin-bottom: 10px;">
          Section 8: Uploaded Deck Inspection Photos (${photos.length} On-File)
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
          ${photos
            .slice(0, 6)
            .map(
              (p, idx) => `
            <div style="border: 1px solid #CBD5E1; border-radius: 6px; overflow: hidden; background: #FFFFFF; text-align: center;">
              <img src="${p.url || p.dataUrl}" alt="Deck Photo ${idx + 1}" style="width: 100%; height: 95px; object-fit: cover; display: block;" />
              <div style="padding: 4px 6px; font-size: 9.5px; font-weight: 700; color: #475569; background: #F1F5F9; text-transform: capitalize; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${p.category ? p.category.replace(/_/g, ' ') : 'Deck View'} #${idx + 1}
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `
        : ''
    }

    <!-- 5. GUARANTEED ESTIMATE TOTAL & PRICING BOX -->
    <div style="background: #F0FDF4; border: 2px solid #BBF7D0; border-radius: 8px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <div>
        <div style="font-size: 14px; font-weight: 800; color: #15803D; text-transform: uppercase;">
          Official Guaranteed Estimate Total
        </div>
        <div style="font-size: 11px; color: #475569; margin-top: 2px;">
          Includes all labor, commercial equipment, chemical restoration agents, and protective penetrating coats.
        </div>
        ${
          isMinJobApplies
            ? `<div style="font-size: 10.5px; font-weight: 700; color: #B45309; margin-top: 4px;">
                * Standard certified crew mobilization minimum ($${Number(minJobAmount).toLocaleString()}) applies upon dispatch.
              </div>`
            : ''
        }
      </div>
      <div style="text-align: right;">
        <div style="font-size: 26px; font-weight: 900; color: #15803D; letter-spacing: -0.5px;">
          ${formatMoney(totalAmount)}
        </div>
        <div style="font-size: 10px; font-weight: 700; color: #166534; text-transform: uppercase;">
          Guaranteed Quote
        </div>
      </div>
    </div>

    <!-- 6. QUALITY GUARANTEE & WORKMANSHIP WARRANTY -->
    <div style="background: #FFFBEB; border-left: 3.5px solid #D97706; border-radius: 0 6px 6px 0; padding: 10px 14px; margin-bottom: 18px; font-size: 11px; color: #92400E; line-height: 1.45;">
      <strong>Deck Restoration Plus Certified Quality Guarantee:</strong> All restoration contracts are backed by our comprehensive 1-Year Workmanship Warranty. Performed strictly by certified, licensed, and insured exterior wood specialists using EPA-registered restoration detergents.
    </div>

    <!-- 7. OFFICIAL FOOTER -->
    <div style="border-top: 1.5px solid #E2E8F0; padding-top: 14px; display: flex; justify-content: space-between; align-items: center; font-size: 10.5px; color: #64748b;">
      <div>
        <strong style="color: #1E3A63;">Deck Restoration Plus, LLC</strong> • 152 Indian Mills Road, Shamong, NJ 08088
      </div>
      <div>
        Toll-Free Support: <strong style="color: #1E3A63;">(856) 678-3325</strong> | estimates@deckrestorationplus.com
      </div>
    </div>
  `;

  // Use html2pdf to download PDF directly
  const opt = {
    margin: [6, 6, 6, 6],
    filename: `DeckRestorationPlus-Estimate-${refNum}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  };

  document.body.appendChild(reportElement);
  try {
    await html2pdf().from(reportElement).set(opt).save();
  } finally {
    document.body.removeChild(reportElement);
  }
}

/**
 * Download Official Estimate CSV / Excel Dossier
 */
export function downloadEstimateExcel(est = {}, cust = {}) {
  const refNum =
    est.estimateNumber ||
    est.estimateReference ||
    est.ref ||
    est.leadNumber ||
    est.projectId ||
    `DP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

  const customerName = cust.fullName || cust.name || est.customerName || est.name || 'Valued Deck Owner';
  const customerEmail = cust.email || est.userEmail || est.email || 'customer@deckrestorationplus.com';
  const customerPhone = cust.phone || cust.phoneNumber || est.userPhone || est.phone || '(856) 678-3325';

  const projectName = est.projectName || est.title || est.deckDetails?.projectName || 'Deck Restoration Project';
  const totalAmount = typeof est.total === 'number'
    ? est.total
    : typeof est.totalAmount === 'number'
    ? est.totalAmount
    : 2500;

  const snap = est.pricingSnapshot || {};
  const length = est.length || est.deckDetails?.length || 20;
  const width = est.width || est.deckDetails?.width || 20;
  const floorArea = est.floorArea || est.deckDetails?.areaSqFt || (Number(length) * Number(width)) || 400;

  const rows = [
    ['DECK RESTORATION PLUS — OFFICIAL ESTIMATE DOSSIER', ''],
    ['Reference Number', refNum],
    ['Date Generated', new Date().toISOString()],
    ['', ''],
    ['CUSTOMER INFORMATION', ''],
    ['Customer Name', customerName],
    ['Customer Email', customerEmail],
    ['Customer Phone', customerPhone],
    ['', ''],
    ['PROJECT SITE & SPECIFICATIONS', ''],
    ['Project Name', projectName],
    ['Deck Shape', est.shape || est.deckShape || 'Rectangle'],
    ['Dimensions', `${length} ft x ${width} ft`],
    ['Floor Area', `${floorArea} sq ft`],
    ['Billable Surface Area', `${snap.A || floorArea} sq ft`],
    ['Wood Species', est.woodSpecies || 'Pressure Treated Pine'],
    ['Elevation Tier', est.height || est.accessType || 'Ground Level (0-4 ft)'],
    ['Existing Coating', est.existingCoating || 'None / Bare'],
    ['Services Selected', (est.services || snap.services || ['Deep Cleaning', 'Sealing']).join('; ')],
    ['Surface Conditions', (est.conditions || est.visibleConditions || ['Standard Weathered']).join('; ')],
    ['', ''],
    ['FINANCIAL SUMMARY', ''],
    ['Guaranteed Estimate Total', `$${Number(totalAmount).toFixed(2)}`],
    ['Standard Mobilization Floor', '$2,500.00'],
    ['Workmanship Warranty', '1-Year Comprehensive Warranty Included'],
    ['Company Contact', 'Deck Restoration Plus • (856) 678-3325 • estimates@deckrestorationplus.com'],
  ];

  const csvContent = '\uFEFF' + rows.map((e) => e.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `DeckRestorationPlus-Estimate-${refNum}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
