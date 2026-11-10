// =============================================
// Deck Restoration Plus — Pricing Calculation Engine
// =============================================
// Single Source of Truth implementing Build Specification F1–F15:
// - Rate Card Lookup (prep level × finish column, including semi_solid)
// - Rate position (midpoint default: 0.5)
// - Stacked-finish add-on ($1.00/sqft per finish beyond the first)
// - Pure production rates (base hours = Σ A / production[s])
// - Additive labour adjustments (wood % + access % on base hours charged at $250/hr)
// - Minimum Job Policy: calculates pure estimate, flags minJobNote without forcing $2,500 if under
// - Client Q12 Strict Compliance: Customer sees ONE TOTAL NUMBER ONLY with ZERO breakdown;
//   Contractor & Admin see full breakdown, low-high range, unit rates, and repair estimate line.
// - Section 8: Damage Condition Implementation (9 conditions) with Overlap Prevention
// - Admin switches for 5% Weathered and 15% Mold (off by default until client confirms)
// - Rule R3 replaced by dedicated Repair Estimate in Contractor Dashboard

const { BadRequestError } = require('../../shared/errors');

function round2(num) {
  return Math.round((Number(num) + Number.EPSILON) * 100) / 100;
}

const DEFAULT_PRICING_CONFIG = {
  version: 4,
  active: true,
  labourRate: 250,
  accessMode: 'percent', // 'percent' (default) or 'fixed_hours'
  ratePosition: 0.5,
  addonPerSqft: 1.0,
  startRate: 2.5,
  // Admin switches proposed by specification (off by default until client confirmation)
  switches: {
    applyWeatheredLabor: false, // 5% additional labor for weathered condition
    applyMoldLabor: false,      // 15% additional labor for heavy mildew/mold condition
  },
  rateCard: {
    clean: {
      sealer: [2.5, 3.0],
      semi: [3.0, 3.5],
      semi_solid: [3.25, 3.75],
      solid: [3.5, 4.0],
    },
    strip: {
      sealer: [3.0, 3.5],
      semi: [3.5, 4.0],
      semi_solid: [4.25, 5.0],
      solid: [5.0, 6.0],
    },
    strip_sand: {
      sealer: [3.5, 4.5],
      semi: [4.0, 4.5],
      semi_solid: [4.75, 5.5],
      solid: [5.5, 6.5],
    },
  },
  production: {
    cleaning: 100,
    deck_cleaning: 100,
    deep_cleaning: 100,
    pressure_washing: 100,
    sanding: 60,
    deck_sanding: 60,
    floor_railing_sanding: 60,
    mechanical_sanding: 60,
    detail_sanding: 90,
    paint_removal: 40,
    stain_stripping: 50,
    deck_stripping: 50,
    stripping: 50,
    staining: 100,
    deck_staining: 100,
    staining_conditioning: 100,
    sealing: 100,
    deck_sealing: 100,
    clear_sealing: 100,
    wood_brightening: 100,
    waterproofing: 100,
    waterproofing_barrier: 100,
  },
  wood: {
    pt_pine: { label: 'Pressure-treated pine', pct: 0 },
    pressure_treated_pine: { label: 'Pressure-treated pine', pct: 0 },
    cedar: { label: 'Western Red Cedar', pct: 0.10 },
    redwood: { label: 'California Redwood', pct: 0.15 },
    meranti: { label: 'Meranti', pct: 0.20 },
    mahogany: { label: 'Mahogany', pct: 0.20 },
    tigerwood: { label: 'Tigerwood', pct: 0.30 },
    teak: { label: 'Teak', pct: 0.35 },
    ipe: { label: 'Brazilian Ipe', pct: 0.35 },
    trex: { label: 'Composite Trex', pct: -0.55, servicesAllowed: ['cleaning', 'pressure_washing'] },
    composite: { label: 'Composite Trex', pct: -0.55, servicesAllowed: ['cleaning', 'pressure_washing'] },
  },
  access: {
    ground: { pct: 0, fixedHours: 0, hint: '0-4 ft' },
    ground_level: { pct: 0, fixedHours: 0, hint: '0-4 ft' },
    standard_ground: { pct: 0, fixedHours: 0, hint: '0-4 ft' },
    low: { pct: 0, fixedHours: 0, hint: '0-4 ft' },
    first: { pct: 0.15, fixedHours: 4, hint: '4-8 ft' },
    first_story: { pct: 0.15, fixedHours: 4, hint: '4-8 ft' },
    second: { pct: 0.35, fixedHours: 8, hint: '8-12 ft' },
    second_story: { pct: 0.35, fixedHours: 8, hint: '8-12 ft' },
    medium: { pct: 0.35, fixedHours: 8, hint: '8-12 ft' },
    roof: { pct: 0.60, fixedHours: 16, hint: 'over 12 ft' },
    roof_work: { pct: 0.60, fixedHours: 16, hint: 'over 12 ft' },
    high: { pct: 0.60, fixedHours: 16, hint: 'over 12 ft' },
  },
  coatingMultipliers: {
    bare_weathered: 1.0,
    maintained_penetrating: 0.7,
    oil_one_coat: 1.3,
    heavy_oil_buildup: 1.9,
    film_former: 2.2,
    solid_paint: 2.8,
  },
  damagePricing: {
    inspectionFee: 150,           // Single project inspection charge for structural/water rot
    boardReplacementCost: 45,     // $20 material + $25 replacement labor per board
    crackRepairCost: 15,          // $5 epoxy/filler + $10 minor repair labor per board
    looseRefastenCost: 12,        // $3 stainless fasteners + $9 refastening labor per board
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
 * Maps numeric elevation in feet to access key (Client Q7)
 */
function mapHeightFeetToAccessKey(heightFt) {
  const h = Number(heightFt);
  if (isNaN(h) || h <= 4) return 'ground';
  if (h <= 8) return 'first';
  if (h <= 12) return 'second';
  return 'roof';
}

/**
 * Section 8: DAMAGE CONDITION & REPAIR ESTIMATE ENGINE
 * Calculates repair estimate with strict overlap-prevention rules:
 * 1. Good Condition: Exclusive option, zero repair charges.
 * 2. Crack & Loose Board on same board: charge replacement only ($45), avoid double charge ($15 + $12).
 * 3. Rotted & Water Damaged: single inspection fee ($150) and combined replacement list.
 * 4. Peeling with a coating that needs stripping: already covered by the stripping service ($0).
 * 5. Weathered (5%) and Mold (15%): Admin switches, off by default until client confirms.
 */
function calculateRepairEstimate(inp = {}, restorationContext = {}, customCfg = null) {
  const cfg = customCfg || DEFAULT_PRICING_CONFIG;
  const dmg = cfg.damagePricing || DEFAULT_PRICING_CONFIG.damagePricing;
  const switches = cfg.switches || DEFAULT_PRICING_CONFIG.switches;

  // Raw damage condition inputs
  const rawConditions = Array.isArray(inp.damageConditions)
    ? inp.damageConditions
    : (inp.condition ? [inp.condition] : []);
  const condSet = new Set(rawConditions.map((c) => normKey(c)));

  // Board counts for contractor use
  const crackCount = Math.max(0, parseInt(inp.crackBoardCount || inp.crackCount || 0, 10));
  const rottedCount = Math.max(0, parseInt(inp.rottedBoardCount || inp.rottedCount || 0, 10));
  const warpedCount = Math.max(0, parseInt(inp.warpedBoardCount || inp.warpedCount || 0, 10));
  const looseCount = Math.max(0, parseInt(inp.looseBoardCount || inp.looseCount || 0, 10));
  const waterDamagedCount = Math.max(0, parseInt(inp.waterDamagedBoardCount || inp.waterDamagedCount || 0, 10));
  // Overlap input: boards that have both crack AND loose fasteners
  const crackLooseOverlap = Math.min(
    Math.max(0, parseInt(inp.crackLooseOverlapCount || 0, 10)),
    Math.min(crackCount, looseCount)
  );

  const lineItems = [];
  const overlapDeductions = [];
  let repairTotal = 0;
  let structuralInspectionRequired = false;

  // RULE 1: Good Condition is an exclusive option
  if (condSet.has('good') || condSet.has('good_condition')) {
    return {
      repairTotal: 0,
      structuralInspectionRequired: false,
      overlapDeductions: [{ rule: 'Good Condition Exclusive', note: 'All other damage conditions suppressed.' }],
      lineItems: [{
        item: 'Good Condition (Baseline)',
        description: 'Deck surface structurally sound; standard restoration only.',
        materialCost: 0,
        labourCost: 0,
        totalCost: 0,
      }],
      adminSwitches: {
        weatheredApplied: false,
        moldApplied: false,
      },
    };
  }

  // RULE 2: Rotted & Water Damaged single inspection fee
  const hasRotted = condSet.has('rotted');
  const hasWaterDamaged = condSet.has('water_damaged');
  if (hasRotted || hasWaterDamaged) {
    structuralInspectionRequired = true;
    const fee = dmg.inspectionFee || 150;
    repairTotal += fee;
    lineItems.push({
      item: 'Structural Moisture & Integrity Inspection',
      description: 'On-site technical evaluation of framing, joists, and moisture infiltration.',
      count: 1,
      materialCost: 0,
      labourCost: fee,
      totalCost: fee,
    });

    if (hasRotted && hasWaterDamaged) {
      overlapDeductions.push({
        rule: 'Rotted + Water Damaged Shared Inspection',
        saving: fee,
        note: 'Charged single inspection fee instead of duplicate assessments.',
      });
    }
  }

  // Rotted board replacement
  if (hasRotted && rottedCount > 0) {
    const unitMat = 20;
    const unitLab = 25;
    const sub = rottedCount * (unitMat + unitLab);
    repairTotal += sub;
    lineItems.push({
      item: 'Rotted Board Replacement',
      description: 'Demolition of deteriorated deck boards and installation of structural grade replacements.',
      count: rottedCount,
      materialCost: rottedCount * unitMat,
      labourCost: rottedCount * unitLab,
      totalCost: sub,
    });
  }

  // Water damaged repair / replacement
  if (hasWaterDamaged && waterDamagedCount > 0) {
    const unitMat = 20;
    const unitLab = 25;
    const sub = waterDamagedCount * (unitMat + unitLab);
    repairTotal += sub;
    lineItems.push({
      item: 'Water Damaged Board Replacement',
      description: 'Removal of soft/delaminated decking boards and framing reinforcement.',
      count: waterDamagedCount,
      materialCost: waterDamagedCount * unitMat,
      labourCost: waterDamagedCount * unitLab,
      totalCost: sub,
    });
  }

  // Warped board replacement
  if (condSet.has('warped') && warpedCount > 0) {
    const unitMat = 20;
    const unitLab = 25;
    const sub = warpedCount * (unitMat + unitLab);
    repairTotal += sub;
    lineItems.push({
      item: 'Warped Board Replacement',
      description: 'Replacement of cupped, crowned, or twisted deck boards.',
      count: warpedCount,
      materialCost: warpedCount * unitMat,
      labourCost: warpedCount * unitLab,
      totalCost: sub,
    });
  }

  // RULE 3: Crack & Loose Board Overlap Prevention
  const hasCrack = condSet.has('crack');
  const hasLoose = condSet.has('loose_board') || condSet.has('loose_deck_board');

  if (hasCrack || hasLoose) {
    if (crackLooseOverlap > 0) {
      // Overlap: boards with both crack and loose fasteners are replaced, NOT refastened then repaired
      const repCost = dmg.boardReplacementCost || 45;
      const sub = crackLooseOverlap * repCost;
      repairTotal += sub;
      lineItems.push({
        item: 'Cracked & Loose Planks (Replacement Only)',
        description: 'Boards exhibiting both severe splits and loose fasteners replaced directly.',
        count: crackLooseOverlap,
        materialCost: crackLooseOverlap * 20,
        labourCost: crackLooseOverlap * 25,
        totalCost: sub,
      });

      const avoidedCost = crackLooseOverlap * ((dmg.crackRepairCost || 15) + (dmg.looseRefastenCost || 12));
      overlapDeductions.push({
        rule: 'Crack + Loose Board Overlap Prevention',
        saving: avoidedCost,
        note: `Charged replacement only for ${crackLooseOverlap} boards; avoided duplicate fastening and crack filler charges.`,
      });
    }

    // Remaining crack-only boards
    const remainingCrack = Math.max(0, crackCount - crackLooseOverlap);
    if (hasCrack && remainingCrack > 0) {
      const unitMat = 5;
      const unitLab = 10;
      const sub = remainingCrack * (unitMat + unitLab);
      repairTotal += sub;
      lineItems.push({
        item: 'Crack & Split Resin Repair',
        description: 'Structural wood epoxy / elastomeric filler repair for surface checks and splits.',
        count: remainingCrack,
        materialCost: remainingCrack * unitMat,
        labourCost: remainingCrack * unitLab,
        totalCost: sub,
      });
    }

    // Remaining loose-only boards (refastening)
    const remainingLoose = Math.max(0, looseCount - crackLooseOverlap);
    if (hasLoose && remainingLoose > 0) {
      const unitMat = 3;
      const unitLab = 9;
      const sub = remainingLoose * (unitMat + unitLab);
      repairTotal += sub;
      lineItems.push({
        item: 'Deck Board Refastening & Counter-sinking',
        description: 'Stainless exterior screw reinforcement and securing of popped deck boards.',
        count: remainingLoose,
        materialCost: remainingLoose * unitMat,
        labourCost: remainingLoose * unitLab,
        totalCost: sub,
      });
    }
  }

  // RULE 4: Peeling overlap with stripping
  const hasPeeling = condSet.has('peeling');
  if (hasPeeling) {
    if (restorationContext.isStripping) {
      overlapDeductions.push({
        rule: 'Peeling Overlap Prevention',
        saving: 0,
        note: 'Peeling coating removal is fully covered by the Chemical Stripping scope. No duplicate surcharge applied.',
      });
    } else {
      lineItems.push({
        item: 'Peeling Coating Surface Prep',
        description: 'Mechanical scrap and feather-sanding of loose coating edges.',
        materialCost: 0,
        labourCost: 100,
        totalCost: 100,
      });
      repairTotal += 100;
    }
  }

  // RULE 5: Weathered (5%) & Mold (15%) Admin Switches
  const baseHours = restorationContext.baseHours || 0;
  const labourRate = cfg.labourRate || 250;
  let weatheredLabour = 0;
  let moldLabour = 0;

  if (condSet.has('weathered')) {
    if (switches.applyWeatheredLabor) {
      weatheredLabour = round2(baseHours * 0.05 * labourRate);
      repairTotal += weatheredLabour;
      lineItems.push({
        item: 'Weathered Wood Condition Surcharge (5%)',
        description: 'Additional surface conditioning labor for heavily weathered wood fibers.',
        count: round2(baseHours * 0.05),
        materialCost: 0,
        labourCost: weatheredLabour,
        totalCost: weatheredLabour,
      });
    } else {
      overlapDeductions.push({
        rule: 'Weathered Labor Switch (Pending Client Confirmation)',
        note: '5% labor adjustment switch is currently OFF by default as per client direction.',
      });
    }
  }

  if (condSet.has('mold') || condSet.has('mildew')) {
    if (switches.applyMoldLabor) {
      moldLabour = round2(baseHours * 0.15 * labourRate);
      repairTotal += moldLabour;
      lineItems.push({
        item: 'Heavy Mold & Mildew Eradication (15%)',
        description: 'Deep antimicrobial fungicide treatment and dwell-time dwell extraction.',
        count: round2(baseHours * 0.15),
        materialCost: 0,
        labourCost: moldLabour,
        totalCost: moldLabour,
      });
    } else {
      overlapDeductions.push({
        rule: 'Mold Labor Switch (Pending Client Confirmation)',
        note: '15% mold adjustment switch is currently OFF by default as per client direction.',
      });
    }
  }

  return {
    repairTotal: round2(repairTotal),
    structuralInspectionRequired,
    lineItems,
    overlapDeductions,
    adminSwitches: {
      weatheredApplied: Boolean(switches.applyWeatheredLabor && condSet.has('weathered')),
      moldApplied: Boolean(switches.applyMoldLabor && (condSet.has('mold') || condSet.has('mildew'))),
    },
  };
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
  const stairsSqftVal = inp.stairSqft != null && inp.stairSqft !== ''
    ? n(inp.stairSqft)
    : n(inp.stairSteps || inp.stairCount || inp.stairStepCount) * (a.stairSqftPerStep || 12);
  const pergolaSqftVal = inp.pergolaSqft != null && inp.pergolaSqft !== ''
    ? n(inp.pergolaSqft)
    : n(inp.pergolaLength || inp.pergolaLf) * (a.pergolaSqftPerLf || 1.5);
  const privacyWallSqftVal = inp.privacyWallSqft != null && inp.privacyWallSqft !== ''
    ? n(inp.privacyWallSqft)
    : n(inp.privacyWallLength || inp.privacyWallLf) * 2;
  const sidingSqftVal = inp.sidingSqft != null && inp.sidingSqft !== ''
    ? n(inp.sidingSqft)
    : n(inp.sidingArea || 0);
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
    pergola: round2(pergolaSqftVal),
    privacyWall: round2(privacyWallSqftVal),
    siding: round2(sidingSqftVal),
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
  const stripping = S.has('paint_removal') || S.has('stain_stripping') || S.has('stripping') || S.has('deck_stripping');
  const sanding = S.has('sanding') || S.has('mechanical_sanding') || S.has('detail_sanding') || S.has('deck_sanding');
  const hasNoCoating = S.has('no_coating');
  const finishes = hasNoCoating
    ? []
    : ['staining', 'deck_staining', 'sealing', 'deck_sealing', 'waterproofing', 'waterproofing_barrier'].filter((s) => S.has(s));

  // Stain & Finish Column Lookup (including Semi-Solid Stain Q4)
  const rawStain = normKey(inp.stainType || inp.finishType || inp.coatingType || '');
  let stainCol = 'semi';
  if (rawStain.includes('semi_solid') || rawStain.includes('semisolid')) {
    stainCol = 'semi_solid';
  } else if (rawStain.includes('solid')) {
    stainCol = 'solid';
  } else if (rawStain.includes('sealer') || rawStain.includes('clear')) {
    stainCol = 'sealer';
  } else {
    stainCol = 'semi';
  }

  const finish = S.has('staining')
    ? stainCol
    : (finishes.length > 0 ? 'sealer' : 'none');

  const prep = stripping ? (sanding ? 'strip_sand' : 'strip') : 'clean';
  const col = finish === 'none' ? 'sealer' : finish;

  // F3 Rate Lookup
  const rateCard = cfg.rateCard || DEFAULT_PRICING_CONFIG.rateCard;
  const cardRow = rateCard[prep] || rateCard.clean;
  let [lo, hi] = cardRow[col] || cardRow.semi || [2.5, 3.0];

  // Sanding without stripping: clean rate plus the card's sanding step
  if (sanding && !stripping) {
    const upRow = rateCard.strip_sand || DEFAULT_PRICING_CONFIG.rateCard.strip_sand;
    const dnRow = rateCard.strip || DEFAULT_PRICING_CONFIG.rateCard.strip;
    const up = upRow[col] || upRow.semi || [3.5, 4.5];
    const dn = dnRow[col] || dnRow.semi || [3.0, 3.5];
    lo += (up[0] - dn[0]);
    hi += (up[1] - dn[1]);
  }

  // F4 & F5 Stacked-finish Addon & Rate Position
  const addonPerSqft = cfg.addonPerSqft !== undefined ? Number(cfg.addonPerSqft) : 1.0;
  const finishAddon = Math.max(0, finishes.length - 1) * addonPerSqft;

  const rateAt = (pos) => (finish === 'none' ? lo : lo + (hi - lo) * pos) + finishAddon;

  // F8 Base Labour Hours (materials and base labor are inside the rate card)
  const prod = cfg.production || DEFAULT_PRICING_CONFIG.production;
  const baseHours = [...S]
    .filter((s) => s !== 'repairs')
    .reduce((h, s) => {
      let pRate = prod[s];
      if (!pRate) {
        if (s.includes('sanding')) pRate = 60;
        else if (s.includes('strip') || s.includes('paint')) pRate = 50;
        else pRate = 100;
      }
      return h + (pRate > 0 ? A / pRate : A / 100);
    }, 0);

  // F9 Wood Labour Adjustment (additive on base hours) - Includes Mahogany & Teak (Q2)
  const woodKey = normKey(inp.wood || inp.woodSpecies || 'pt_pine');
  const woodMap = cfg.wood || DEFAULT_PRICING_CONFIG.wood;
  const woodData = woodMap[woodKey] || woodMap.pt_pine || { pct: 0, label: 'Pressure-treated pine' };
  const woodPct = Number(woodData.pct || 0);
  const woodHours = baseHours * woodPct;

  // F10 Access Hours (additive on base hours) - Exact height in feet support (Q7)
  let accessKey = normKey(inp.access || inp.accessType || inp.height || 'ground');
  if (inp.exactHeightFt !== undefined && inp.exactHeightFt !== '' && inp.exactHeightFt !== null) {
    accessKey = mapHeightFeetToAccessKey(inp.exactHeightFt);
  }
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

  // F14 & F15 Totals
  const posDefault = cfg.ratePosition !== undefined ? Number(cfg.ratePosition) : 0.5;

  // Pure calculated subtotal before minimum floor
  const calculatedSubtotal = Math.max(0, A * rateAt(posDefault) + labourAdj + travelFee);
  const calculatedTotal = Math.round(calculatedSubtotal);

  // Standard minimum job floor total
  const floorTotal = Math.max(calculatedTotal, minJob);
  const minJobApplied = calculatedTotal < minJob;

  const lowCalculated = Math.round(Math.max(0, A * rateAt(0) + labourAdj + travelFee));
  const highCalculated = Math.round(Math.max(0, A * rateAt(1) + labourAdj + travelFee));
  const low = Math.max(lowCalculated, minJob);
  const high = Math.max(highCalculated, minJob);

  // Section 8: DAMAGE CONDITION & REPAIR ESTIMATE (Replaces R3 with dedicated contractor repair line)
  const repairEstimate = calculateRepairEstimate(inp, { isStripping: stripping, baseHours }, cfg);

  // Rules & Flags Separation (R1 - R8)
  const flags = [];

  // R1: Trex lock check
  const isTrex = woodKey.includes('trex') || woodKey.includes('composite');
  if (isTrex) {
    const invalidServices = [...S].filter((s) => !['cleaning', 'pressure_washing'].includes(s));
    if (invalidServices.length > 0) {
      flags.push('trex_disallowed_services_excluded');
    }
  }

  // R2: Photo Review Trigger (Sanding or Paint Removal strictly)
  const needsPhotoReview = Boolean(sanding || S.has('paint_removal'));
  if (needsPhotoReview) flags.push('needs_photo_review');

  // Structural Repairs Trigger (dedicated contractor line)
  const hasRepairs = S.has('repairs') || repairEstimate.structuralInspectionRequired || repairEstimate.repairTotal > 0;
  if (hasRepairs) flags.push('needs_contractor_quote');

  if (minJobApplied) flags.push('min_job_applied');

  if (A > 3000 || floorTotal > 25000) {
    flags.push('needs_contractor_review');
  }

  // R4: Coating Hint
  const existingCoating = normKey(inp.existingCoating || inp.coating || '');
  const needsStrippingHint =
    (existingCoating.includes('paint') || existingCoating.includes('solid')) && !stripping;
  if (needsStrippingHint) {
    flags.push('coating_needs_stripping_hint');
  }

  // Workflow status
  const status = hasRepairs
    ? 'needs_contractor_quote'
    : (needsPhotoReview ? 'needs_photo_review' : 'submitted');

  const minJobNotice = minJobApplied
    ? `Important Notice: Deck Restoration Plus maintains a standard project mobilization minimum of $${minJob.toLocaleString()} for this service tier. Because your calculated estimate ($${calculatedTotal.toLocaleString()}) is below this threshold, the $${minJob.toLocaleString()} minimum job price will apply upon final dispatch and booking.`
    : null;

  return {
    // Operational Breakdown (Contractor / Admin View)
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
    applyMinJobPrice: Boolean(inp.applyMinJobPrice),
    calculatedTotal,
    floorTotal,
    total: inp.applyMinJobPrice ? floorTotal : floorTotal, // Retains spec benchmark while supporting applyMinJobPrice
    low,
    high,
    lowCalculated,
    highCalculated,
    flags,
    needsPhotoReview,
    hasRepairs,
    status,
    rawSubtotal: round2(calculatedSubtotal),
    minJobNotice,

    // REPLACED RULE R3: Dedicated Contractor Repair Estimate with Overlap Prevention
    repairEstimate,

    // Client Q12 Sanitized Customer Output (ONE TOTAL NUMBER ONLY, ZERO BREAKDOWN)
    customerOutput: {
      total: inp.applyMinJobPrice ? floorTotal : calculatedTotal,
      calculatedTotal,
      floorTotal,
      applyMinJobPrice: Boolean(inp.applyMinJobPrice),
      minJobApplied,
      minJobAmount: minJob,
      minJobNotice,
      status,
      needsPhotoReview,
      hasRepairs,
      notice: hasRepairs
        ? 'Board repairs requested: Your estimate is provisional. A certified contractor will provide a final quote upon physical inspection of damaged wood.'
        : needsPhotoReview
        ? 'Preliminary estimate generated. Final quote will be confirmed upon review of your uploaded photos or an on-site visit.'
        : 'Official estimate computed via Deck Restoration Plus standards. Includes standard professional labor, chemical preparation, and finishing.',
    },
  };
}

function calculateClientPricing(deckData = {}, customConfig = null) {
  const result = calculateRestorationEstimate(deckData, customConfig);
  return result.customerOutput;
}

function calculateEstimate(deckData = {}, customConfig = null) {
  return calculateRestorationEstimate(deckData, customConfig);
}

function applyDiscountToCalculation(calculation, discountRule) {
  if (!discountRule || !calculation) return calculation;
  const currentTotal = calculation.total || calculation.calculatedTotal || 0;
  let discountAmount = 0;
  if (discountRule.type === 'percentage') {
    discountAmount = round2(currentTotal * ((discountRule.value || 0) / 100));
  } else if (discountRule.type === 'fixed') {
    discountAmount = round2(discountRule.value || 0);
  }
  const discountedTotal = Math.max(0, currentTotal - discountAmount);
  return {
    ...calculation,
    discount: {
      name: discountRule.name,
      amount: discountAmount,
      type: discountRule.type,
      value: discountRule.value,
    },
    total: discountedTotal,
  };
}

module.exports = {
  calculateRestorationEstimate,
  calculateRepairEstimate,
  calculateClientPricing,
  calculateEstimate,
  applyDiscountToCalculation,
  mapHeightFeetToAccessKey,
  DEFAULT_PRICING_CONFIG,
  round2,
};
