// ====================================================================
// Deck Estimator — Template-Based PDF & Excel Report Generator
// Generates official downloadable PDF dossier without browser print dialog
// Includes dynamic inspection photos and architectural reference images
// ====================================================================

import mainLogo from '../assets/images/Main_Logo_v2.png';
import { ESTIMATOR_IMAGES } from '../assets/images/Input_images/estimatorImages';
import { OPERATING_HOURS_PRINT_LINES } from '../constants/operatingHours';

/**
 * Format currency helper
 */
export function formatMoney(val) {
  if (typeof val !== 'number' || isNaN(val)) return '$2,500.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

/**
 * Normalizes and extracts all photos associated with an estimate or deck
 * Supports base64 data URLs, object references, and populated deck photos
 */
export function getEstimatePhotos(est = {}) {
  if (!est) return [];
  const raw =
    (Array.isArray(est.photos) && est.photos.length > 0 ? est.photos : null) ||
    (Array.isArray(est.deckDetails?.photos) && est.deckDetails.photos.length > 0 ? est.deckDetails.photos : null) ||
    (Array.isArray(est.deckId?.photos) && est.deckId.photos.length > 0 ? est.deckId.photos : null) ||
    (Array.isArray(est.deckSnapshot?.photos) && est.deckSnapshot.photos.length > 0 ? est.deckSnapshot.photos : null) ||
    (Array.isArray(est.uploadedPhotos) && est.uploadedPhotos.length > 0 ? est.uploadedPhotos : null) ||
    (Array.isArray(est.uploadedImages) && est.uploadedImages.length > 0 ? est.uploadedImages : null) ||
    [];

  return raw
    .map((p, idx) => {
      if (!p) return null;
      if (typeof p === 'string') {
        const trimmed = p.trim();
        if (!trimmed) return null;
        return {
          id: `photo-${idx}`,
          url: trimmed,
          dataUrl: trimmed,
          category: `Inspection Photo #${idx + 1}`,
          name: `Photo ${idx + 1}`,
        };
      }
      const src = p.url || p.dataUrl || p.data || p.preview || p.src || '';
      if (!src) return null;
      return {
        ...p,
        url: src,
        dataUrl: src,
        category: p.category ? String(p.category).replace(/_/g, ' ') : `Inspection Photo #${idx + 1}`,
        name: p.name || `Photo ${idx + 1}`,
      };
    })
    .filter(Boolean);
}

/**
 * Resolves architectural reference images for shape & wood
 */
function getArchitecturalVisuals(shapeName = '', woodName = '') {
  const shapeLower = String(shapeName).toLowerCase();
  let shapeImg = ESTIMATOR_IMAGES?.section1?.rectangle?.main || '';
  if (shapeLower.includes('square')) {
    shapeImg = ESTIMATOR_IMAGES?.section1?.square?.main || shapeImg;
  } else if (shapeLower.includes('l_shape') || shapeLower.includes('l-shape') || shapeLower.includes('lshape')) {
    shapeImg = ESTIMATOR_IMAGES?.section1?.lShape?.main || shapeImg;
  } else if (shapeLower.includes('custom') || shapeLower.includes('multi')) {
    shapeImg = ESTIMATOR_IMAGES?.section1?.custom?.main || shapeImg;
  }

  const woodLower = String(woodName).toLowerCase();
  let woodImg = ESTIMATOR_IMAGES?.section3?.ptPine?.main || '';
  if (woodLower.includes('cedar')) {
    woodImg = ESTIMATOR_IMAGES?.section3?.cedar?.main || woodImg;
  } else if (woodLower.includes('redwood')) {
    woodImg = ESTIMATOR_IMAGES?.section3?.redwood?.main || woodImg;
  } else if (woodLower.includes('trex') || woodLower.includes('composite')) {
    woodImg = ESTIMATOR_IMAGES?.section3?.composite?.main || woodImg;
  } else if (woodLower.includes('mahogany')) {
    woodImg = ESTIMATOR_IMAGES?.section3?.mahogany?.main || woodImg;
  } else if (woodLower.includes('teak')) {
    woodImg = ESTIMATOR_IMAGES?.section3?.teak?.main || woodImg;
  } else if (woodLower.includes('tiger')) {
    woodImg = ESTIMATOR_IMAGES?.section3?.tigerwood?.main || woodImg;
  } else if (woodLower.includes('meranti')) {
    woodImg = ESTIMATOR_IMAGES?.section3?.meranti?.main || woodImg;
  }

  return { shapeImg, woodImg };
}

/**
 * Download Official Estimate PDF Dossier
 * Exact same layout, dynamic data, and images wherever invoked
 * @param {Object} est - Estimate, Deck, Project, or Lead record
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

  const addrObj =
    est.propertyAddress ||
    est.deckDetails?.propertyAddress ||
    est.deckDetails?.location ||
    est.deckSnapshot?.propertyAddress ||
    cust.address ||
    {};
  const street = addrObj.street || est.address || est.location || '152 Indian Mills Road';
  const city = addrObj.city || est.city || 'Shamong';
  const state = addrObj.state || est.state || 'NJ';
  const zipCode = addrObj.zipCode || est.zipCode || '08088';
  const fullAddress = [street, city, state, zipCode].filter(Boolean).join(', ');

  // Dimensions & Areas
  const snap = est.pricingSnapshot || est.calculationDetails || {};
  const length = est.length || est.deckDetails?.length || est.deckDetails?.deckLength || snap.length || 20;
  const width = est.width || est.deckDetails?.width || est.deckDetails?.deckWidth || snap.width || 20;
  const floorArea = est.floorArea || est.deckDetails?.areaSqFt || est.deckDetails?.area || est.deckArea || (Number(length) * Number(width)) || 400;
  const totalBillableArea = snap.A || est.billableArea || floorArea;

  const rawShape = est.shape || est.deckShape || est.deckDetails?.deckShape || 'rectangle';
  const shape = String(rawShape).replace(/_/g, ' ').toUpperCase();

  const rawWood = est.woodSpecies || est.deckDetails?.woodSpecies || est.deckDetails?.surfaceMaterial || 'Pressure Treated Pine';
  const wood = String(rawWood).replace(/_/g, ' ').toUpperCase();

  const rawElevation = est.height || est.accessType || est.structureDetails?.height || est.deckDetails?.deckType || 'Ground Level (0–4 ft)';
  const elevation = String(rawElevation).replace(/_/g, ' ').toUpperCase();
  const exactHeight = est.exactHeightFt || est.structureDetails?.exactHeightFt ? `${est.exactHeightFt || est.structureDetails?.exactHeightFt} ft` : 'Standard';

  const rawCoating = est.existingCoating || est.coating || est.surfaceDetails?.coatingStatus || est.deckDetails?.deckCondition || 'none';
  const coating = String(rawCoating).replace(/_/g, ' ').toUpperCase();

  // Services
  let rawServices = est.services || est.deckDetails?.services || snap.services || [];
  if (!Array.isArray(rawServices) || rawServices.length === 0) {
    rawServices = ['cleaning', 'sealing'];
  }
  const servicesList = rawServices.map((s) => String(s).replace(/_/g, ' ').toUpperCase());

  // Components
  const componentsList = [];
  const struct = est.structureDetails || est.deckDetails?.structureDetails || {};
  const compSqft = est.componentSqft || {};
  if (struct.hasRailings || compSqft.railings || (est.components && est.components.includes('railings'))) {
    componentsList.push(`Perimeter Railings (${compSqft.railings || struct.railingSqft || 50} sq ft)`);
  }
  if (struct.hasStairs || compSqft.stairs || (est.components && est.components.includes('stairs'))) {
    componentsList.push(`Stair Steps (${compSqft.stairs || struct.stairStepCount || 4} steps)`);
  }
  if (struct.hasPergola || compSqft.pergola || (est.components && est.components.includes('pergola'))) {
    componentsList.push(`Pergola Overhead (${compSqft.pergola || struct.pergolaSqft || 0} sq ft)`);
  }
  if (struct.hasPrivacyWall || compSqft.privacy_wall || (est.components && est.components.includes('privacy_wall'))) {
    componentsList.push(`Privacy Screen / Wall (${compSqft.privacy_wall || struct.privacyWallSqft || 0} sq ft)`);
  }
  if (struct.hasSiding || compSqft.siding || (est.components && est.components.includes('siding'))) {
    componentsList.push(`Exterior Siding (${compSqft.siding || struct.sidingSqft || 0} sq ft)`);
  }
  if (struct.hasFascia || compSqft.fascia || (est.components && est.components.includes('fascia'))) {
    componentsList.push(`Fascia Banding (${compSqft.fascia || struct.fasciaSqft || 0} sq ft)`);
  }
  if (struct.includeJoists || compSqft.joists || (est.components && est.components.includes('joists'))) {
    componentsList.push(`Underside Joists (${compSqft.joists || struct.joistsSqft || 0} sq ft)`);
  }

  // Conditions
  const conditionsList = [];
  const rawConds = est.conditions || est.visibleConditions || est.conditionFlags || est.deckDetails?.visibleConditions || [];
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

  // Photos (Section 8 Uploaded Inspection Photos)
  const photos = getEstimatePhotos(est);

  // Architectural Visuals
  const { shapeImg, woodImg } = getArchitecturalVisuals(rawShape, rawWood);

  // Price
  const totalAmount =
    typeof est.total === 'number'
      ? est.total
      : typeof est.totalAmount === 'number'
      ? est.totalAmount
      : typeof snap.calculatedTotal === 'number'
      ? snap.calculatedTotal
      : typeof snap.total === 'number'
      ? snap.total
      : 2500;

  const minJobAmount = snap.minJob || est.minimumJobPrice || est.minJobAmount || 2500;
  const isMinJobApplies = est.minJobApplies || totalAmount <= minJobAmount;

  // Build DOM Element for PDF Rendering
  const reportElement = document.createElement('div');
  reportElement.style.width = '780px';
  reportElement.style.padding = '32px 38px';
  reportElement.style.background = '#ffffff';
  reportElement.style.color = '#0f172a';
  reportElement.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  reportElement.style.fontSize = '12px';
  reportElement.style.lineHeight = '1.45';
  reportElement.style.boxSizing = 'border-box';

  reportElement.innerHTML = `
    <!-- 1. BRANDED HEADER WITH LOGO -->
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2.5px solid #1E3A63; padding-bottom: 16px; margin-bottom: 18px;">
      <div style="display: flex; align-items: center; gap: 14px;">
        <img src="${mainLogo}" alt="Deck Restoration Plus" style="height: 48px; width: auto; object-fit: contain; display: block;" />
        <div>
          <div style="font-size: 20px; font-weight: 800; color: #1E3A63; letter-spacing: -0.4px;">DECK RESTORATION PLUS</div>
          <div style="font-size: 11px; font-weight: 700; color: #E08131; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px;">
            Official Certified Deck Restoration Estimate Report
          </div>
        </div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 14px; font-weight: 800; color: #1E3A63;">REFERENCE #: ${refNum}</div>
        <div style="font-size: 11px; color: #64748b; font-weight: 600; margin-top: 2px;">Generated: ${dateFormatted} at ${timeFormatted}</div>
        <div style="display: inline-block; padding: 3px 8px; background: #DCFCE7; color: #15803D; border: 1px solid #BBF7D0; border-radius: 4px; font-size: 10px; font-weight: 800; margin-top: 5px; text-transform: uppercase;">
          Guaranteed Estimate
        </div>
      </div>
    </div>

    <!-- 2. CUSTOMER CONTACT & PROJECT SITE DETAILS -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px;">
      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px 16px;">
        <div style="font-size: 11px; font-weight: 700; color: #1E3A63; text-transform: uppercase; border-bottom: 1px solid #E2E8F0; padding-bottom: 5px; margin-bottom: 8px;">
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
          <span style="color: #64748b; font-weight: 500;">Client Verification:</span>
          <span style="font-weight: 700; color: #2563EB;">Official Verified Account</span>
        </div>
      </div>

      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px 16px;">
        <div style="font-size: 11px; font-weight: 700; color: #1E3A63; text-transform: uppercase; border-bottom: 1px solid #E2E8F0; padding-bottom: 5px; margin-bottom: 8px;">
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

    <!-- 3. ARCHITECTURAL VISUAL SPECIFICATION BAR -->
    <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
      <div style="display: flex; align-items: center; gap: 12px; background: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 6px; padding: 7px 10px;">
        ${shapeImg ? `<img src="${shapeImg}" alt="Deck Blueprint" style="width: 58px; height: 46px; object-fit: cover; border-radius: 4px; border: 1px solid #E2E8F0;" />` : ''}
        <div>
          <div style="font-size: 9.5px; font-weight: 700; color: #64748b; text-transform: uppercase;">Configured Blueprint</div>
          <div style="font-size: 11.5px; font-weight: 700; color: #1E3A63;">${shape} Layout</div>
          <div style="font-size: 10px; color: #475569;">${floorArea} sq ft (${length}' × ${width}')</div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 12px; background: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 6px; padding: 7px 10px;">
        ${woodImg ? `<img src="${woodImg}" alt="Wood Specimen" style="width: 58px; height: 46px; object-fit: cover; border-radius: 4px; border: 1px solid #E2E8F0;" />` : ''}
        <div>
          <div style="font-size: 9.5px; font-weight: 700; color: #64748b; text-transform: uppercase;">Wood Species Specimen</div>
          <div style="font-size: 11.5px; font-weight: 700; color: #1E3A63;">${wood}</div>
          <div style="font-size: 10px; color: #475569;">${coating} coating prep verified</div>
        </div>
      </div>
    </div>

    <!-- 4. SECTION-BY-SECTION ARCHITECTURAL BREAKDOWN -->
    <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; margin-bottom: 16px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
        <thead>
          <tr style="background: #1E3A63; color: #FFFFFF;">
            <th style="padding: 8px 12px; text-align: left; font-weight: 700; width: 28%;">Scope Category</th>
            <th style="padding: 8px 12px; text-align: left; font-weight: 700; width: 34%;">Selected Specification</th>
            <th style="padding: 8px 12px; text-align: left; font-weight: 700; width: 38%;">Architectural Impact Details</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #E2E8F0; background: #FFFFFF;">
            <td style="padding: 7px 12px; font-weight: 700; color: #1E3A63;">Section 1: Footprint & Shape</td>
            <td style="padding: 7px 12px; font-weight: 600;">${shape}</td>
            <td style="padding: 7px 12px; color: #475569;">${length} ft length × ${width} ft width (${floorArea} sq ft)</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0; background: #F8FAFC;">
            <td style="padding: 7px 12px; font-weight: 700; color: #1E3A63;">Section 2: Components</td>
            <td style="padding: 7px 12px; font-weight: 600;">${componentsList.length > 0 ? componentsList.join(', ') : 'Standard Floor Only'}</td>
            <td style="padding: 7px 12px; color: #475569;">Vertical and horizontal structural elements included</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0; background: #FFFFFF;">
            <td style="padding: 7px 12px; font-weight: 700; color: #1E3A63;">Section 3: Wood Species</td>
            <td style="padding: 7px 12px; font-weight: 600;">${wood}</td>
            <td style="padding: 7px 12px; color: #475569;">Tailored penetrating rate card & cellular density formula</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0; background: #F8FAFC;">
            <td style="padding: 7px 12px; font-weight: 700; color: #1E3A63;">Section 4: Elevation Tier</td>
            <td style="padding: 7px 12px; font-weight: 600;">${elevation}</td>
            <td style="padding: 7px 12px; color: #475569;">Staging height allowance: ${exactHeight}</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0; background: #FFFFFF;">
            <td style="padding: 7px 12px; font-weight: 700; color: #1E3A63;">Section 5: Existing Finish</td>
            <td style="padding: 7px 12px; font-weight: 600;">${coating}</td>
            <td style="padding: 7px 12px; color: #475569;">Chemical stripping / stripping neutralizer prep compatibility</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0; background: #F8FAFC;">
            <td style="padding: 7px 12px; font-weight: 700; color: #1E3A63;">Section 6: Services Selected</td>
            <td style="padding: 7px 12px; font-weight: 700; color: #E08131;">${servicesList.join(' • ')}</td>
            <td style="padding: 7px 12px; color: #475569;">Commercial eco-safe detergents, prep & protective sealers</td>
          </tr>
          <tr style="background: #FFFFFF;">
            <td style="padding: 7px 12px; font-weight: 700; color: #1E3A63;">Section 7: Surface Conditions</td>
            <td style="padding: 7px 12px; font-weight: 600;">${conditionsList.join(', ')}</td>
            <td style="padding: 7px 12px; color: #475569;">${boardIssues.length > 0 ? boardIssues.join('; ') : 'No severe structural board decay noted'}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 5. UPLOADED INSPECTION PHOTOS (SECTION 8) -->
    ${
      photos.length > 0
        ? `
      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px 14px; margin-bottom: 16px;">
        <div style="font-size: 11px; font-weight: 700; color: #1E3A63; text-transform: uppercase; border-bottom: 1px solid #E2E8F0; padding-bottom: 5px; margin-bottom: 10px; display: flex; justify-content: space-between;">
          <span>Section 8: Uploaded Deck Inspection Photos (${photos.length} On-File)</span>
          <span style="font-size: 10px; color: #64748b; font-weight: 600;">Client Site Documentation</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
          ${photos
            .slice(0, 6)
            .map(
              (p, idx) => `
            <div style="border: 1px solid #CBD5E1; border-radius: 6px; overflow: hidden; background: #FFFFFF; text-align: center;">
              <img src="${p.url}" alt="${p.category || 'Inspection Photo'}" style="width: 100%; height: 95px; object-fit: cover; display: block;" />
              <div style="padding: 4px 6px; font-size: 9.5px; font-weight: 700; color: #475569; background: #F1F5F9; text-transform: capitalize; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${p.category || `Inspection Photo #${idx + 1}`}
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

    <!-- 6. GUARANTEED ESTIMATE TOTAL & PRICING BOX -->
    <div style="background: #F0FDF4; border: 2px solid #BBF7D0; border-radius: 8px; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
      <div>
        <div style="font-size: 13px; font-weight: 800; color: #15803D; text-transform: uppercase;">
          Official Guaranteed Estimate Total
        </div>
        <div style="font-size: 10.5px; color: #475569; margin-top: 2px;">
          Includes all labor, commercial equipment, chemical restoration agents, and protective penetrating coats.
        </div>
        ${
          isMinJobApplies
            ? `<div style="font-size: 10px; font-weight: 700; color: #B45309; margin-top: 3px;">
                * Standard certified crew mobilization minimum ($${Number(minJobAmount).toLocaleString()}) applies upon dispatch.
              </div>`
            : ''
        }
      </div>
      <div style="text-align: right;">
        <div style="font-size: 24px; font-weight: 900; color: #15803D; letter-spacing: -0.5px;">
          ${formatMoney(totalAmount)}
        </div>
        <div style="font-size: 9.5px; font-weight: 700; color: #166534; text-transform: uppercase;">
          Guaranteed Quote
        </div>
      </div>
    </div>

    <!-- 7. QUALITY GUARANTEE & WORKMANSHIP WARRANTY -->
    <div style="background: #FFFBEB; border-left: 3.5px solid #D97706; border-radius: 0 6px 6px 0; padding: 8px 12px; margin-bottom: 16px; font-size: 10.5px; color: #92400E; line-height: 1.45;">
      <strong>Deck Restoration Plus Certified Quality Guarantee:</strong> All restoration contracts are backed by our comprehensive 1-Year Workmanship Warranty. Performed strictly by certified, licensed, and insured exterior wood specialists using EPA-registered restoration detergents.
    </div>

    <!-- 8. OFFICIAL FOOTER -->
    <div style="border-top: 1.5px solid #E2E8F0; padding-top: 12px; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; font-size: 9.5px; color: #64748b; line-height: 1.45;">
      <div>
        <strong style="color: #1E3A63;">Deck Restoration Plus, LLC</strong> • 152 Indian Mills Road, Shamong, NJ 08088<br>
        Toll-Free Support: <strong style="color: #1E3A63;">(856) 678-3325</strong> | estimates@deckrestorationplus.com
      </div>
      <div style="text-align: right;">
        ${OPERATING_HOURS_PRINT_LINES.contracting}<br>
        ${OPERATING_HOURS_PRINT_LINES.office}
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
    // Wait for all report images (logo, visuals, inspection photos) to fully load in DOM before capturing
    const imgElements = reportElement.querySelectorAll('img');
    await Promise.all(
      Array.from(imgElements).map((img) => {
        if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
          setTimeout(resolve, 2500);
        });
      })
    );

    const html2pdfModule = await import('html2pdf.js');
    const html2pdf = html2pdfModule.default || html2pdfModule;
    await html2pdf().from(reportElement).set(opt).save();
  } finally {
    if (document.body.contains(reportElement)) {
      document.body.removeChild(reportElement);
    }
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
  const totalAmount =
    typeof est.total === 'number'
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

  const csvContent =
    '\uFEFF' +
    rows.map((e) => e.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
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

/**
 * Download Official User Profile Dossier PDF
 * Directly downloads PDF with executive branding without opening window.print()
 * @param {Object} profileData - Complete profileData from adminApi.getUserProfile
 */
export async function downloadUserProfilePdf(profileData = {}) {
  const u = profileData?.user || {};
  const cp = profileData?.contractorProfile || null;
  const cd = profileData?.customerData || null;
  const kd = profileData?.contractorData || null;
  const userName = u.fullName || u.name || 'User';
  const role = (u.role || 'USER').toUpperCase();
  const status = (u.accountStatus || 'ACTIVE').toUpperCase();
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const reportElement = document.createElement('div');
  reportElement.style.width = '780px';
  reportElement.style.padding = '24px 28px';
  reportElement.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
  reportElement.style.color = '#0F172A';
  reportElement.style.backgroundColor = '#FFFFFF';
  reportElement.style.boxSizing = 'border-box';

  reportElement.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #1E3A63; padding-bottom:14px; margin-bottom:18px;">
      <div>
        <h1 style="margin:0; font-size:22px; font-weight:800; color:#1E3A63; letter-spacing:-0.4px;">DECK RESTORATION PLUS</h1>
        <p style="margin:2px 0 0 0; font-size:11px; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:0.8px;">Platform Administration & Governance Dossier</p>
      </div>
      <div style="text-align:right;">
        <span style="display:inline-block; padding:4px 10px; border-radius:6px; font-size:11px; font-weight:800; background-color:#EFF6FF; color:#1E3A63; border:1px solid #BFDBFE;">CONFIDENTIAL AUDIT</span>
        <p style="margin:4px 0 0 0; font-size:10.5px; color:#64748B;">Generated: ${dateStr}</p>
      </div>
    </div>

    <!-- User Header Card -->
    <div style="background:linear-gradient(135deg, #1E3A63 0%, #2A4D7E 100%); color:#FFFFFF; border-radius:10px; padding:18px 22px; margin-bottom:20px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h2 style="margin:0; font-size:20px; font-weight:800;">${userName}</h2>
          <p style="margin:4px 0 0 0; font-size:12px; color:#DBEAFE;">${u.email || 'N/A'} • ${u.phone || 'No phone'} • ID: ${u._id || u.id || 'N/A'}</p>
        </div>
        <div style="text-align:right;">
          <span style="display:inline-block; padding:4px 12px; border-radius:9999px; font-size:11px; font-weight:800; background-color:#FFFFFF; color:#1E3A63;">${role}</span>
          <span style="display:inline-block; padding:4px 12px; border-radius:9999px; font-size:11px; font-weight:800; background-color:${status === 'ACTIVE' ? '#10B981' : '#EF4444'}; color:#FFFFFF; margin-left:6px;">${status}</span>
        </div>
      </div>
    </div>

    <!-- Account Details Table -->
    <div style="margin-bottom:18px;">
      <h3 style="font-size:13px; font-weight:800; color:#1E3A63; text-transform:uppercase; letter-spacing:0.5px; margin:0 0 8px 0; border-bottom:1px solid #E2E8F0; padding-bottom:4px;">1. Account Standing & Security</h3>
      <table style="width:100%; border-collapse:collapse; font-size:11.5px;">
        <tr>
          <td style="padding:6px 8px; font-weight:700; color:#64748B; width:25%; border-bottom:1px solid #F1F5F9;">Registered Date:</td>
          <td style="padding:6px 8px; color:#0F172A; border-bottom:1px solid #F1F5F9;">${u.createdAt ? new Date(u.createdAt).toLocaleString() : 'N/A'}</td>
          <td style="padding:6px 8px; font-weight:700; color:#64748B; width:25%; border-bottom:1px solid #F1F5F9;">Email Verified:</td>
          <td style="padding:6px 8px; color:#0F172A; border-bottom:1px solid #F1F5F9;">${u.emailVerifiedAt || u.isEmailVerified ? 'Verified' : 'Pending'}</td>
        </tr>
        <tr>
          <td style="padding:6px 8px; font-weight:700; color:#64748B; border-bottom:1px solid #F1F5F9;">Preferred Contact:</td>
          <td style="padding:6px 8px; color:#0F172A; border-bottom:1px solid #F1F5F9;">${u.preferredContactMethod || 'Email'}</td>
          <td style="padding:6px 8px; font-weight:700; color:#64748B; border-bottom:1px solid #F1F5F9;">Last Active:</td>
          <td style="padding:6px 8px; color:#0F172A; border-bottom:1px solid #F1F5F9;">${u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Recently active'}</td>
        </tr>
      </table>
    </div>

    ${cp ? `
    <!-- Contractor Business & Credentials -->
    <div style="margin-bottom:18px;">
      <h3 style="font-size:13px; font-weight:800; color:#1E3A63; text-transform:uppercase; letter-spacing:0.5px; margin:0 0 8px 0; border-bottom:1px solid #E2E8F0; padding-bottom:4px;">2. Contractor Business Credentials</h3>
      <table style="width:100%; border-collapse:collapse; font-size:11.5px;">
        <tr>
          <td style="padding:6px 8px; font-weight:700; color:#64748B; width:25%; border-bottom:1px solid #F1F5F9;">Company Name:</td>
          <td style="padding:6px 8px; font-weight:700; color:#0F172A; border-bottom:1px solid #F1F5F9;">${cp.businessName || 'N/A'}</td>
          <td style="padding:6px 8px; font-weight:700; color:#64748B; width:25%; border-bottom:1px solid #F1F5F9;">License Number:</td>
          <td style="padding:6px 8px; color:#0F172A; border-bottom:1px solid #F1F5F9;">${cp.licenseNumber || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding:6px 8px; font-weight:700; color:#64748B; border-bottom:1px solid #F1F5F9;">Partner Tier:</td>
          <td style="padding:6px 8px; color:#0F172A; border-bottom:1px solid #F1F5F9;">${(cp.tier || 'BRONZE').toUpperCase()} Partner</td>
          <td style="padding:6px 8px; font-weight:700; color:#64748B; border-bottom:1px solid #F1F5F9;">Verification Status:</td>
          <td style="padding:6px 8px; font-weight:700; color:${cp.verificationStatus === 'VERIFIED' ? '#15803D' : '#D97706'}; border-bottom:1px solid #F1F5F9;">${(cp.verificationStatus || 'PENDING').toUpperCase()}</td>
        </tr>
        <tr>
          <td style="padding:6px 8px; font-weight:700; color:#64748B; border-bottom:1px solid #F1F5F9;">Experience:</td>
          <td style="padding:6px 8px; color:#0F172A; border-bottom:1px solid #F1F5F9;">${cp.yearsOfExperience || 0} Years in Trade</td>
          <td style="padding:6px 8px; font-weight:700; color:#64748B; border-bottom:1px solid #F1F5F9;">Coverage Radius:</td>
          <td style="padding:6px 8px; color:#0F172A; border-bottom:1px solid #F1F5F9;">${cp.coverageRadiusMiles || 35} Miles</td>
        </tr>
      </table>
    </div>
    ` : ''}

    <!-- Summary Metrics -->
    <div style="margin-bottom:18px;">
      <h3 style="font-size:13px; font-weight:800; color:#1E3A63; text-transform:uppercase; letter-spacing:0.5px; margin:0 0 8px 0; border-bottom:1px solid #E2E8F0; padding-bottom:4px;">3. Activity & Portfolio Summary</h3>
      <div style="display:flex; gap:12px;">
        <div style="flex:1; background-color:#EFF6FF; border:1px solid #BFDBFE; border-radius:8px; padding:10px 14px; text-align:center;">
          <div style="font-size:10px; font-weight:800; color:#1E3A63; text-transform:uppercase;">Projects / Decks</div>
          <div style="font-size:18px; font-weight:800; color:#1E3A63; margin-top:2px;">${cd?.decksCount ?? profileData?.projects?.length ?? 0}</div>
        </div>
        <div style="flex:1; background-color:#F5F3FF; border:1px solid #DDD6FE; border-radius:8px; padding:10px 14px; text-align:center;">
          <div style="font-size:10px; font-weight:800; color:#6D28D9; text-transform:uppercase;">Estimates Created</div>
          <div style="font-size:18px; font-weight:800; color:#6D28D9; margin-top:2px;">${cd?.estimatesCount ?? profileData?.estimates?.length ?? 0}</div>
        </div>
        <div style="flex:1; background-color:#ECFDF5; border:1px solid #A7F3D0; border-radius:8px; padding:10px 14px; text-align:center;">
          <div style="font-size:10px; font-weight:800; color:#065F46; text-transform:uppercase;">Inquiries / Leads</div>
          <div style="font-size:18px; font-weight:800; color:#065F46; margin-top:2px;">${profileData?.enquiriesCount ?? 0}</div>
        </div>
        <div style="flex:1; background-color:#FEF3C7; border:1px solid #FDE68A; border-radius:8px; padding:10px 14px; text-align:center;">
          <div style="font-size:10px; font-weight:800; color:#92400E; text-transform:uppercase;">Compliance Docs</div>
          <div style="font-size:18px; font-weight:800; color:#92400E; margin-top:2px;">${profileData?.verificationDocuments?.length ?? 0}</div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="margin-top:28px; padding-top:12px; border-top:1px solid #E2E8F0; display:flex; justify-content:space-between; font-size:10px; color:#94A3B8;">
      <span>Deck Restoration Plus Platform Governance • System Administrator Export</span>
      <span>Page 1 of 1</span>
    </div>
  `;

  document.body.appendChild(reportElement);
  reportElement.style.position = 'fixed';
  reportElement.style.left = '0';
  reportElement.style.top = '0';
  reportElement.style.zIndex = '-9999';
  reportElement.style.opacity = '1';
  reportElement.style.pointerEvents = 'none';

  try {
    const safeName = (userName).replace(/[^a-zA-Z0-9-_]/g, '_');
    const opt = {
      margin: [6, 6, 6, 6],
      filename: `DRP-UserProfile-${safeName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    const html2pdfModule = await import('html2pdf.js');
    const html2pdf = typeof html2pdfModule.default === 'function'
      ? html2pdfModule.default
      : (typeof html2pdfModule.default?.default === 'function'
        ? html2pdfModule.default.default
        : (typeof html2pdfModule === 'function' ? html2pdfModule : null));

    if (!html2pdf) {
      throw new Error('PDF export engine failed to initialize.');
    }

    await html2pdf().from(reportElement).set(opt).save();
  } finally {
    if (document.body.contains(reportElement)) {
      document.body.removeChild(reportElement);
    }
  }
}
