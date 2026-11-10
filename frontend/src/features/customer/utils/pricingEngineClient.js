// =============================================
// Deck Restoration Plus — Client-Side Pricing Engine
// =============================================
// Exact mirror of backend/src/modules/pricing/pricingEngine.js
// Guarantees immediate, 100% reliable calculations on both Customer and Contractor portals.

export function round2(num) {
  return Math.round((Number(num) + Number.EPSILON) * 100) / 100;
}

export const DEFAULT_PRICING_CONFIG = {
  version: 4,
  active: true,
  labourRate: 250,
  accessMode: 'percent',
  ratePosition: 0.5,
  addonPerSqft: 1.0,
  startRate: 2.5,
  switches: {
    applyWeatheredLabor: false,
    applyMoldLabor: false,
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
  damagePricing: {
    inspectionFee: 150,
    boardReplacementCost: 45,
    crackRepairCost: 15,
    looseRefastenCost: 12,
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

function normKey(str) {
  return String(str || '').toLowerCase().trim().replace(/[\s\/-]+/g, '_');
}

export function mapHeightFeetToAccessKey(heightFt) {
  const h = Number(heightFt);
  if (isNaN(h) || h <= 4) return 'ground';
  if (h <= 8) return 'first';
  if (h <= 12) return 'second';
  return 'roof';
}

export function calculateRepairEstimateClient(inp = {}, restorationContext = {}, customCfg = null) {
  const cfg = customCfg || DEFAULT_PRICING_CONFIG;
  const dmg = cfg.damagePricing || DEFAULT_PRICING_CONFIG.damagePricing;

  const rawConditions = Array.isArray(inp.damageConditions)
    ? inp.damageConditions
    : (inp.condition ? [inp.condition] : []);
  const condSet = new Set(rawConditions.map((c) => normKey(c)));

  const crackCount = Math.max(0, parseInt(inp.crackBoardCount || inp.crackCount || 0, 10));
  const rottedCount = Math.max(0, parseInt(inp.rottedBoardCount || inp.rottedCount || 0, 10));
  const warpedCount = Math.max(0, parseInt(inp.warpedBoardCount || inp.warpedCount || 0, 10));
  const looseCount = Math.max(0, parseInt(inp.looseBoardCount || inp.looseCount || 0, 10));
  const waterDamagedCount = Math.max(0, parseInt(inp.waterDamagedBoardCount || inp.waterDamagedCount || 0, 10));
  const crackLooseOverlap = Math.min(
    Math.max(0, parseInt(inp.crackLooseOverlapCount || 0, 10)),
    Math.min(crackCount, looseCount)
  );

  const lineItems = [];
  const overlapDeductions = [];
  let repairTotal = 0;
  let structuralInspectionRequired = false;

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
      adminSwitches: { weatheredApplied: false, moldApplied: false },
    };
  }

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

  if (hasRotted && rottedCount > 0) {
    const unitMat = 20;
    const unitLab = 25;
    const sub = rottedCount * (unitMat + unitLab);
    repairTotal += sub;
    lineItems.push({
      item: 'Rotted Board Replacement',
      description: `${rottedCount} structural boards removed and replaced with certified lumber.`,
      count: rottedCount,
      materialCost: rottedCount * unitMat,
      labourCost: rottedCount * unitLab,
      totalCost: sub,
    });
  }

  if (hasWaterDamaged && waterDamagedCount > 0) {
    const unitMat = 20;
    const unitLab = 25;
    const sub = waterDamagedCount * (unitMat + unitLab);
    repairTotal += sub;
    lineItems.push({
      item: 'Water-Damaged Structural Replacement',
      description: `${waterDamagedCount} degraded boards replaced to restore load rating.`,
      count: waterDamagedCount,
      materialCost: waterDamagedCount * unitMat,
      labourCost: waterDamagedCount * unitLab,
      totalCost: sub,
    });
  }

  const hasWarped = condSet.has('warped');
  if (hasWarped && warpedCount > 0) {
    const unitMat = 20;
    const unitLab = 25;
    const sub = warpedCount * (unitMat + unitLab);
    repairTotal += sub;
    lineItems.push({
      item: 'Cupped & Warped Board Leveling / Replacement',
      description: `${warpedCount} severely warped boards unfastened and replaced.`,
      count: warpedCount,
      materialCost: warpedCount * unitMat,
      labourCost: warpedCount * unitLab,
      totalCost: sub,
    });
  }

  const hasCracks = condSet.has('crack') || condSet.has('cracks');
  const hasLoose = condSet.has('loose_board') || condSet.has('loose_boards');

  if (crackLooseOverlap > 0) {
    const repFee = dmg.boardReplacementCost || 45;
    const overlapSub = crackLooseOverlap * repFee;
    repairTotal += overlapSub;
    lineItems.push({
      item: 'Combined Crack & Loose Fastener Board Replacement',
      description: `${crackLooseOverlap} boards with compound damage replaced entirely.`,
      count: crackLooseOverlap,
      materialCost: crackLooseOverlap * 20,
      labourCost: crackLooseOverlap * 25,
      totalCost: overlapSub,
    });
    const doubleCharge = crackLooseOverlap * ((dmg.crackRepairCost || 15) + (dmg.looseRefastenCost || 12));
    overlapDeductions.push({
      rule: 'Crack + Loose Compound Overlap Protection',
      saving: Math.max(0, doubleCharge - overlapSub),
      note: `Replaced board entirely instead of stacking epoxy ($15) and fastener ($12) fees.`,
    });
  }

  const isolatedCracks = Math.max(0, crackCount - crackLooseOverlap);
  if (hasCracks && isolatedCracks > 0) {
    const unitCost = dmg.crackRepairCost || 15;
    const sub = isolatedCracks * unitCost;
    repairTotal += sub;
    lineItems.push({
      item: 'Isolated Crack Epoxy & Fiber Infill',
      description: `${isolatedCracks} localized surface splits reinforced with flexible structural filler.`,
      count: isolatedCracks,
      materialCost: isolatedCracks * 5,
      labourCost: isolatedCracks * 10,
      totalCost: sub,
    });
  }

  const isolatedLoose = Math.max(0, looseCount - crackLooseOverlap);
  if (hasLoose && isolatedLoose > 0) {
    const unitCost = dmg.looseRefastenCost || 12;
    const sub = isolatedLoose * unitCost;
    repairTotal += sub;
    lineItems.push({
      item: 'Isolated Loose Board Structural Refastening',
      description: `${isolatedLoose} boards refastened with 3-inch 305-grade stainless screws.`,
      count: isolatedLoose,
      materialCost: isolatedLoose * 3,
      labourCost: isolatedLoose * 9,
      totalCost: sub,
    });
  }

  const hasPeeling = condSet.has('peeling');
  if (hasPeeling && restorationContext.isStripping) {
    overlapDeductions.push({
      rule: 'Peeling Coating Absorbed by Stripping Scope',
      saving: 0,
      note: 'Peeling surface removal already covered in commercial chemical stripping line ($0 add).',
    });
  }

  return {
    repairTotal: Math.round(repairTotal),
    structuralInspectionRequired,
    lineItems,
    overlapDeductions,
    adminSwitches: { weatheredApplied: false, moldApplied: false },
  };
}

export function calculateRestorationEstimateClient(inp = {}, customCfg = null) {
  const cfg = customCfg || DEFAULT_PRICING_CONFIG;
  const n = (v) => {
    const val = Number(v);
    return isNaN(val) ? 0 : val;
  };

  const a = cfg.areas || DEFAULT_PRICING_CONFIG.areas;

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
    other: 0,
  };

  const A = round2(Object.values(areas).reduce((s, v) => s + v, 0)) || 300;

  const rawServices = Array.isArray(inp.services) && inp.services.length > 0
    ? inp.services
    : ['cleaning'];

  const S = new Set(rawServices.map((s) => normKey(s)));
  const stripping = S.has('paint_removal') || S.has('stain_stripping') || S.has('stripping') || S.has('deck_stripping');
  const sanding = S.has('sanding') || S.has('mechanical_sanding') || S.has('detail_sanding') || S.has('deck_sanding');
  const hasNoCoating = S.has('no_coating');
  const finishes = hasNoCoating
    ? []
    : ['staining', 'deck_staining', 'sealing', 'deck_sealing', 'waterproofing', 'waterproofing_barrier'].filter((s) => S.has(s));

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

  const rateCard = cfg.rateCard || DEFAULT_PRICING_CONFIG.rateCard;
  const cardRow = rateCard[prep] || rateCard.clean;
  let [lo, hi] = cardRow[col] || cardRow.semi || [2.5, 3.0];

  if (sanding && !stripping) {
    const upRow = rateCard.strip_sand || DEFAULT_PRICING_CONFIG.rateCard.strip_sand;
    const dnRow = rateCard.strip || DEFAULT_PRICING_CONFIG.rateCard.strip;
    const up = upRow[col] || upRow.semi || [3.5, 4.5];
    const dn = dnRow[col] || dnRow.semi || [3.0, 3.5];
    lo += (up[0] - dn[0]);
    hi += (up[1] - dn[1]);
  }

  const addonPerSqft = cfg.addonPerSqft !== undefined ? Number(cfg.addonPerSqft) : 1.0;
  const finishAddon = Math.max(0, finishes.length - 1) * addonPerSqft;

  const rateAt = (pos) => (finish === 'none' ? lo : lo + (hi - lo) * pos) + finishAddon;

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

  const woodKey = normKey(inp.wood || inp.woodSpecies || 'pt_pine');
  const woodMap = cfg.wood || DEFAULT_PRICING_CONFIG.wood;
  const woodData = woodMap[woodKey] || woodMap.pt_pine || { pct: 0, label: 'Pressure-treated pine' };
  const woodPct = Number(woodData.pct || 0);
  const woodHours = baseHours * woodPct;

  let accessKey = normKey(inp.access || inp.accessType || inp.height || 'ground');
  if (inp.exactHeightFt !== undefined && inp.exactHeightFt !== '' && inp.exactHeightFt !== null) {
    accessKey = mapHeightFeetToAccessKey(inp.exactHeightFt);
  }
  const accessMap = cfg.access || DEFAULT_PRICING_CONFIG.access;
  const acc = accessMap[accessKey] || accessMap.ground || { pct: 0, fixedHours: 0 };
  const accessMode = cfg.accessMode || 'percent';
  const accessHours = accessMode === 'percent' ? baseHours * (acc.pct || 0) : (acc.fixedHours || 0);

  const addHours = woodHours + accessHours;
  const labourRate = Number(cfg.labourRate || 250);
  const labourAdj = addHours * labourRate;

  const travelCfg = cfg.travel || DEFAULT_PRICING_CONFIG.travel;
  const minJobCfg = cfg.minJob || DEFAULT_PRICING_CONFIG.minJob;
  const travelMinutes = n(inp.travelMinutes !== undefined ? inp.travelMinutes : 30);
  const far = travelMinutes > (travelCfg.freeMinutes || 45);
  const travelFee = far ? (travelCfg.fee || 200) : 0;
  const minJob = far ? (minJobCfg.far || 3000) : (minJobCfg.near || 2500);

  const posDefault = cfg.ratePosition !== undefined ? Number(cfg.ratePosition) : 0.5;
  const calculatedSubtotal = Math.max(0, A * rateAt(posDefault) + labourAdj + travelFee);
  const calculatedTotal = Math.round(calculatedSubtotal);

  const floorTotal = Math.max(calculatedTotal, minJob);
  const minJobApplied = calculatedTotal < minJob;

  const applyMinJobPrice = Boolean(inp.applyMinJobPrice);
  const chosenTotal = applyMinJobPrice ? floorTotal : calculatedTotal;

  const lowCalculated = Math.round(Math.max(0, A * rateAt(0) + labourAdj + travelFee));
  const highCalculated = Math.round(Math.max(0, A * rateAt(1) + labourAdj + travelFee));
  const low = applyMinJobPrice ? Math.max(lowCalculated, minJob) : lowCalculated;
  const high = applyMinJobPrice ? Math.max(highCalculated, minJob) : highCalculated;

  const repairEstimate = calculateRepairEstimateClient(inp, { isStripping: stripping, baseHours }, cfg);

  const needsPhotoReview = Boolean(sanding || S.has('paint_removal'));
  const hasRepairs = S.has('repairs') || repairEstimate.structuralInspectionRequired || repairEstimate.repairTotal > 0;
  const status = hasRepairs
    ? 'needs_contractor_quote'
    : (needsPhotoReview ? 'needs_photo_review' : 'submitted');

  const minJobNotice = minJobApplied
    ? `Important Notice: Deck Restoration Plus maintains a standard project mobilization minimum of $${minJob.toLocaleString()} for this service tier. Because your calculated estimate ($${calculatedTotal.toLocaleString()}) is below this threshold, the $${minJob.toLocaleString()} minimum job price will apply upon final dispatch and booking.`
    : null;

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
    applyMinJobPrice,
    calculatedTotal,
    floorTotal,
    total: chosenTotal,
    low,
    high,
    lowCalculated,
    highCalculated,
    needsPhotoReview,
    hasRepairs,
    status,
    rawSubtotal: round2(calculatedSubtotal),
    minJobNotice,
    repairEstimate,
    customerOutput: {
      total: chosenTotal,
      calculatedTotal,
      floorTotal,
      applyMinJobPrice,
      minJobApplied,
      minJobAmount: minJob,
      minJobNotice,
      status,
      needsPhotoReview,
      hasRepairs,
    },
  };
}

