// =============================================
// Deck Restoration Plus — Pricing Calculation Engine
// =============================================
// Single Source of Truth implementing Build Specification F1–F15:
// - Rate Card Lookup (prep level × finish column)
// - Rate position (midpoint default: 0.5)
// - Stacked-finish add-on ($1.00/sqft per finish beyond the first)
// - Pure production rates (base hours = Σ A / production[s])
// - Additive labour adjustments (wood % + access % on base hours charged at $250/hr)
// - Travel fee ($200 if >45 min) and minimum job floor ($2,500 near / $3,000 far)
// - Zero client-side pricing logic (server-calculated only)

const { BadRequestError } = require('../../shared/errors');

function round2(num) {
  return Math.round((Number(num) + Number.EPSILON) * 100) / 100;
}

const DEFAULT_PRICING_CONFIG = {
  version: 3,
  active: true,
  labourRate: 250,
  accessMode: 'percent', // 'percent' or 'fixed_hours'
  ratePosition: 0.5,
  addonPerSqft: 1.0,
  startRate: 2.5,
  rateCard: {
    clean: { sealer: [2.5, 3.0], semi: [3.0, 3.5], solid: [3.5, 4.0] },
    strip: { sealer: [3.0, 3.5], semi: [3.5, 4.0], solid: [5.0, 6.0] },
    strip_sand: { sealer: [3.5, 4.5], semi: [4.0, 4.5], solid: [5.5, 6.5] },
  },
  production: {
    cleaning: 100,
    pressure_washing: 100,
    sanding: 60,
    paint_removal: 40,
    stain_stripping: 50,
    stripping: 50,
    staining: 100,
    sealing: 100,
    waterproofing: 100,
  },
  wood: {
    pt_pine: { label: 'Pressure-treated pine', pct: 0 },
    pressure_treated_pine: { label: 'Pressure-treated pine', pct: 0 },
    cedar: { label: 'Cedar', pct: 0.10 },
    redwood: { label: 'Redwood', pct: 0.15 },
    meranti: { label: 'Meranti', pct: 0.20 },
    mahogany: { label: 'Mahogany', pct: 0.20 },
    tigerwood: { label: 'Tigerwood', pct: 0.30 },
    ipe: { label: 'Ipe', pct: 0.35 },
    trex: { label: 'Composite Trex', pct: -0.55, servicesAllowed: ['cleaning', 'pressure_washing'] },
    composite: { label: 'Composite Trex', pct: -0.55, servicesAllowed: ['cleaning', 'pressure_washing'] },
  },
  access: {
    ground: { pct: 0, fixedHours: 0, hint: '0-4 ft' },
    ground_level: { pct: 0, fixedHours: 0, hint: '0-4 ft' },
    standard_ground: { pct: 0, fixedHours: 0, hint: '0-4 ft' },
    first: { pct: 0.15, fixedHours: 4, hint: '4-8 ft' },
    first_story: { pct: 0.15, fixedHours: 4, hint: '4-8 ft' },
    low: { pct: 0.15, fixedHours: 4, hint: '4-8 ft' },
    second: { pct: 0.35, fixedHours: 8, hint: '8-12 ft' },
    second_story: { pct: 0.35, fixedHours: 8, hint: '8-12 ft' },
    medium: { pct: 0.35, fixedHours: 8, hint: '8-12 ft' },
    roof: { pct: 0.60, fixedHours: 16, hint: 'over 12 ft' },
    roof_work: { pct: 0.60, fixedHours: 16, hint: 'over 12 ft' },
    high: { pct: 0.60, fixedHours: 16, hint: 'over 12 ft' },
  },
  areas: {
    railingSqftPerLf: 4,
    stairSqftPerStep: 12,
    postSqftEach: 6,
    joistFactor: 0.4,
    fasciaSqftPerLf: 1.5,
  },
  travel: { freeMinutes: 45, fee: 200 },
  minJob: { near: 2500, far: 3000 },
};

/**
 * Normalizes input key strings
 */
function normKey(str) {
  return String(str || '').toLowerCase().trim().replace(/[\s\/-]+/g, '_');
}

/**
 * Specification Pricing Engine (F1–F15)
 * Pure calculation function implementing the official Deck Restoration Plus build specification.
 */
function calculateRestorationEstimate(inp = {}, customCfg = null) {
  const cfg = customCfg || DEFAULT_PRICING_CONFIG;
  const n = (v) => {
    const val = Number(v);
    return isNaN(val) ? 0 : val;
  };

  const a = cfg.areas || DEFAULT_PRICING_CONFIG.areas;

  // F1 Billable Area (A)
  const floorVal = n(inp.deckArea || inp.floorArea || inp.dimensions?.area);
  const railingSqftVal = inp.railingSqft != null && inp.railingSqft !== ''
    ? n(inp.railingSqft)
    : n(inp.railingLf || inp.railingLength) * (a.railingSqftPerLf || 4);
  const stairsSqftVal = n(inp.stairSteps || inp.stairCount) * (a.stairSqftPerStep || 12);
  const postsSqftVal = n(inp.postCount || inp.posts) * (a.postSqftEach || 6);

  const hasJoists = Boolean(inp.joists || inp.includeJoists);
  const joistsSqftVal = hasJoists
    ? (inp.joistsSqft != null && inp.joistsSqft !== '' ? n(inp.joistsSqft) : floorVal * (a.joistFactor || 0.4))
    : 0;

  const fasciaSqftVal = inp.fasciaSqft != null && inp.fasciaSqft !== ''
    ? n(inp.fasciaSqft)
    : n(inp.fasciaLf || inp.fasciaLength) * (a.fasciaSqftPerLf || 1.5);

  const otherList = Array.isArray(inp.other) ? inp.other : [];
  const otherSqftVal = otherList.reduce((s, o) => s + n(o.sqft || o.area), 0);

  const areas = {
    flooring: round2(floorVal),
    railings: round2(railingSqftVal),
    stairs: round2(stairsSqftVal),
    posts: round2(postsSqftVal),
    joists: round2(joistsSqftVal),
    fascia: round2(fasciaSqftVal),
    other: round2(otherSqftVal),
  };

  const A = round2(Object.values(areas).reduce((s, v) => s + v, 0));

  if (A <= 0) {
    throw new BadRequestError('Total billable deck surface area must be greater than 0.');
  }

  // F2 Classify the Job
  const rawServices = Array.isArray(inp.services)
    ? inp.services
    : (Array.isArray(inp.restorationScope) ? inp.restorationScope : ['cleaning']);

  const S = new Set(rawServices.map((s) => normKey(s)));
  const stripping = S.has('paint_removal') || S.has('stain_stripping') || S.has('stripping');
  const sanding = S.has('sanding');
  const finishes = ['staining', 'sealing', 'waterproofing'].filter((s) => S.has(s));

  const rawStain = normKey(inp.stainType || inp.finishType || inp.coatingType || '');
  const stainType = rawStain.includes('solid') ? 'solid' : 'semi';
  const finish = S.has('staining')
    ? stainType
    : (finishes.length > 0 ? 'sealer' : 'none');

  const prep = stripping ? (sanding ? 'strip_sand' : 'strip') : 'clean';
  const col = finish === 'none' ? 'sealer' : finish;

  // F3 Rate Lookup
  const rateCard = cfg.rateCard || DEFAULT_PRICING_CONFIG.rateCard;
  let [lo, hi] = (rateCard[prep] && rateCard[prep][col]) ? rateCard[prep][col] : [2.5, 3.0];

  // Sanding without stripping: clean rate plus the card's sanding step
  if (sanding && !stripping) {
    const up = rateCard.strip_sand ? rateCard.strip_sand[col] : [3.5, 4.5];
    const dn = rateCard.strip ? rateCard.strip[col] : [3.0, 3.5];
    lo += (up[0] - dn[0]);
    hi += (up[1] - dn[1]);
  }

  // F4 & F5 Stacked-finish Addon & Rate Position
  const addonPerSqft = cfg.addonPerSqft !== undefined ? Number(cfg.addonPerSqft) : 1.0;
  const finishAddon = Math.max(0, finishes.length - 1) * addonPerSqft;

  const rateAt = (pos) => (finish === 'none' ? lo : lo + (hi - lo) * pos) + finishAddon;

  // F8 Base Labour Hours
  const prod = cfg.production || DEFAULT_PRICING_CONFIG.production;
  const baseHours = [...S]
    .filter((s) => s !== 'repairs')
    .reduce((h, s) => {
      const pRate = prod[s] || (s === 'stripping' ? 50 : 100);
      return h + (pRate > 0 ? A / pRate : A / 100);
    }, 0);

  // F9 Wood Labour Adjustment
  const woodKey = normKey(inp.wood || inp.woodSpecies || 'pt_pine');
  const woodMap = cfg.wood || DEFAULT_PRICING_CONFIG.wood;
  const woodData = woodMap[woodKey] || woodMap.pt_pine || { pct: 0, label: 'Pressure-treated pine' };
  const woodPct = Number(woodData.pct || 0);
  const woodHours = baseHours * woodPct;

  // F10 Access Hours
  const accessKey = normKey(inp.access || inp.accessType || inp.height || 'ground');
  const accessMap = cfg.access || DEFAULT_PRICING_CONFIG.access;
  const acc = accessMap[accessKey] || accessMap.ground || { pct: 0, fixedHours: 0 };
  const accessMode = cfg.accessMode || 'percent';
  const accessHours = accessMode === 'percent' ? baseHours * (acc.pct || 0) : (acc.fixedHours || 0);

  // F11 & F12 Additional Labour Hours & Adjustment ($250/hr)
  const addHours = woodHours + accessHours;
  const labourRate = Number(cfg.labourRate || 250);
  const labourAdj = addHours * labourRate;

  // F13 Travel & Minimum Job Price Floor
  const travelCfg = cfg.travel || DEFAULT_PRICING_CONFIG.travel;
  const minJobCfg = cfg.minJob || DEFAULT_PRICING_CONFIG.minJob;
  const travelMinutes = n(inp.travelMinutes !== undefined ? inp.travelMinutes : 30);
  const far = travelMinutes > (travelCfg.freeMinutes || 45);
  const travelFee = far ? (travelCfg.fee || 200) : 0;
  const minJob = far ? (minJobCfg.far || 3000) : (minJobCfg.near || 2500);

  // F14 & F15 Totals (Rate position, Low, High)
  const posDefault = cfg.ratePosition !== undefined ? Number(cfg.ratePosition) : 0.5;
  const totalAt = (pos) => Math.max(Math.max(A * rateAt(pos) + labourAdj + travelFee, 0), minJob);

  const rawSubtotal = A * rateAt(posDefault) + labourAdj + travelFee;
  const minJobApplied = rawSubtotal < minJob;
  const total = Math.round(totalAt(posDefault));
  const low = Math.round(totalAt(0));
  const high = Math.round(totalAt(1));

  // Flags & Rules (R1 - R8)
  const flags = [];
  const needsPhotoReview = Boolean(sanding || S.has('paint_removal') || S.has('repairs'));
  if (needsPhotoReview) flags.push('needs_photo_review');

  const hasRepairs = S.has('repairs');
  if (hasRepairs) flags.push('needs_contractor_quote');
  if (minJobApplied) flags.push('min_job_applied');

  const isTrex = woodKey.includes('trex') || woodKey.includes('composite');
  if (isTrex) {
    const invalidServices = [...S].filter((s) => !['cleaning', 'pressure_washing'].includes(s));
    if (invalidServices.length > 0) {
      flags.push('trex_disallowed_services_excluded');
    }
  }

  if (A > 3000 || total > 25000) {
    flags.push('needs_contractor_review');
  }

  // Coating Hint (R4)
  const existingCoating = normKey(inp.existingCoating || inp.coating || '');
  const needsStrippingHint =
    (existingCoating.includes('paint') || existingCoating.includes('solid')) && !stripping;
  if (needsStrippingHint) {
    flags.push('coating_needs_stripping_hint');
  }

  const status = hasRepairs
    ? 'needs_contractor_quote'
    : (needsPhotoReview ? 'needs_photo_review' : 'submitted');

  return {
    areas,
    A,
    prep,
    finish,
    col,
    rateCardLookup: [lo, hi],
    rate: round2(rateAt(posDefault)),
    sqftPrice: round2(rateAt(posDefault)),
    basePrice: round2(A * rateAt(posDefault)),
    baseHours: round2(baseHours),
    woodHours: round2(woodHours),
    accessHours: round2(accessHours),
    addHours: round2(addHours),
    labourAdj: round2(labourAdj),
    labourRate,
    travelFee,
    travelMinutes,
    minJob,
    minJobApplied,
    total,
    low,
    high,
    flags,
    needsPhotoReview,
    hasRepairs,
    status,
    rawSubtotal: round2(rawSubtotal),
    notice: needsPhotoReview
      ? 'This is a preliminary estimate. Final price is confirmed after review of your photos or an on-site visit.'
      : 'Estimate based on active Deck Restoration Plus rate card. Pricing includes standard professional labor and surface preparation.',
  };
}

/**
 * Universal Client Pricing Function
 * Adapts client/customer estimator inputs and returns comprehensive estimate output.
 */
function calculateClientPricing(params = {}) {
  // Translate parameters into spec structure
  const inp = {
    deckArea: params.floorArea || params.deckArea || params.deckFloorArea || 0,
    dimensions: {
      length: params.length || params.dimensions?.length,
      width: params.width || params.dimensions?.width,
      area: params.floorArea || params.deckArea,
    },
    railingSqft: params.railingSqft,
    railingLf: params.railingLength || params.railingLf || 0,
    stairSteps: params.stairCount || params.stairs || 0,
    postCount: params.postCount || params.posts || 0,
    fasciaLf: params.fasciaLength || params.fasciaLf || 0,
    fasciaSqft: params.fasciaSqft,
    joists: Boolean(params.includeJoists || params.joists || params.undersideJoists),
    other: params.other || [],
    services: params.services || params.restorationScope || [],
    wood: params.woodSpecies || params.wood || 'pt_pine',
    access: params.accessType || params.access || params.height || 'ground',
    stainType: params.stainType || params.coatingType || 'semi',
    existingCoating: params.existingCoating || params.condition || '',
    travelMinutes: params.travelMinutes || 30,
  };

  const est = calculateRestorationEstimate(inp);

  return {
    // Spec fields
    ...est,
    // Aliases for UI compatibility
    billableArea: est.A,
    floorArea: est.areas.flooring,
    baseLaborHours: est.baseHours,
    laborCost: est.labourAdj,
    totalMaterialCost: est.basePrice,
    baseEstimate: est.total,
    lowEstimate: est.low,
    highEstimate: est.high,
    confidence: 'high',
    displayQuote: {
      low: est.low,
      high: est.high,
      formatted: `$${est.low.toLocaleString()} – $${est.high.toLocaleString()}`,
      singleAmount: `$${est.total.toLocaleString()}`,
    },
    warnings: est.flags.map((f) => ({
      code: f.toUpperCase(),
      type: f === 'needs_contractor_quote' ? 'warning' : 'info',
      message: f === 'needs_photo_review'
        ? 'Final price confirmed after photo review or site visit.'
        : f === 'coating_needs_stripping_hint'
        ? 'This existing coating usually requires chemical stripping.'
        : f === 'min_job_applied'
        ? 'Minimum job size threshold applied.'
        : f,
    })),
  };
}

/**
 * Catalog-based calculateEstimate (for Phase 6 custom parts/catalog items)
 */
function calculateEstimate({
  deck,
  materials = [],
  services = [],
  pricingConfig = null,
}) {
  const floorArea = Number(deck?.dimensions?.area || deck?.deckArea || 400);
  const specCalc = calculateRestorationEstimate({
    deckArea: floorArea,
    services: services.map((s) => s.serviceCode || s.serviceName || 'cleaning'),
    wood: deck?.surfaceMaterial || 'pt_pine',
    access: 'ground',
  }, pricingConfig);

  const totalAmount = specCalc.total;

  return {
    deckArea: floorArea,
    materialsBreakdown: { items: [], totalCost: specCalc.basePrice },
    servicesBreakdown: { items: [], totalCost: specCalc.labourAdj },
    laborBreakdown: {
      enabled: true,
      laborRate: specCalc.labourRate,
      totalHours: specCalc.addHours,
      subtotal: specCalc.labourAdj,
      formula: `${specCalc.addHours} hrs × $${specCalc.labourRate}/hr = $${specCalc.labourAdj}`,
    },
    additionalCharges: { items: [], subtotal: specCalc.travelFee },
    subtotal: specCalc.rawSubtotal,
    discountBreakdown: { applied: false, discountAmount: 0 },
    minimumAdjustment: specCalc.minJobApplied ? specCalc.minJob - specCalc.rawSubtotal : 0,
    minimumJobPrice: specCalc.minJob,
    preTaxTotal: totalAmount,
    taxPercentage: 0,
    taxAmount: 0,
    totalAmount,
    pricingSnapshot: specCalc,
    warnings: [],
  };
}

function applyDiscountToCalculation(baseCalc) {
  return baseCalc;
}

module.exports = {
  calculateRestorationEstimate,
  calculateClientPricing,
  calculateEstimate,
  applyDiscountToCalculation,
  DEFAULT_PRICING_CONFIG,
  round2,
};
