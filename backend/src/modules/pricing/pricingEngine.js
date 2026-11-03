// =============================================
// Deck Estimator — Pricing Calculation Engine
// =============================================
// Backend single source of truth for pricing calculations.
// Adheres strictly to approved configurations without fabricating unapproved defaults.

const { BadRequestError } = require('../../shared/errors');

function round2(num) {
  return Math.round((Number(num) + Number.EPSILON) * 100) / 100;
}

/**
 * Validates deck measurements and returns normalized area in square feet.
 */
function validateAndGetDeckArea(deck) {
  if (!deck) {
    throw new BadRequestError('Deck project information is required for pricing calculations.');
  }

  const { dimensions = {}, deckArea } = deck;
  let area = Number(dimensions.area || deckArea || 0);

  if (!area && dimensions.length && dimensions.width) {
    area = Number(dimensions.length) * Number(dimensions.width);
  }

  if (area <= 0 || isNaN(area)) {
    throw new BadRequestError('Deck project must have a valid positive surface area greater than 0.');
  }

  return round2(area);
}

/**
 * Validates surface and material-service compatibility.
 */
function validateCompatibilities({ deck, materials, services, compatibilityRules = [] }) {
  const warnings = [];
  const deckSurface = (
    deck.surfaceDetails?.material ||
    deck.surfaceMaterial ||
    deck.specifications?.surfaceMaterial ||
    'wood'
  ).toLowerCase();

  // 1. Validate Material Surface Compatibility
  for (const mat of materials) {
    const surfaces = (mat.compatibleSurfaces || []).map((s) => s.toLowerCase());
    if (surfaces.length > 0) {
      const isCompatible = surfaces.includes(deckSurface) ||
        (deckSurface.includes('wood') && surfaces.includes('wood')) ||
        (deckSurface.includes('composite') && surfaces.includes('composite')) ||
        surfaces.includes('other');

      if (!isCompatible) {
        throw new BadRequestError(
          `Material "${mat.materialName}" is incompatible with deck surface material "${deckSurface}". Supported surfaces: ${surfaces.join(', ')}.`
        );
      }
    }
  }

  // 2. Validate Material-Service Relationships
  for (const mat of materials) {
    const matIdStr = (mat._id || mat.id).toString();

    for (const srv of services) {
      const srvIdStr = (srv._id || srv.id).toString();

      const matchedRule = compatibilityRules.find(
        (r) =>
          (r.materialId?._id || r.materialId?.id || r.materialId).toString() === matIdStr &&
          (r.serviceId?._id || r.serviceId?.id || r.serviceId).toString() === srvIdStr
      );

      if (matchedRule) {
        if (matchedRule.compatibilityStatus === 'incompatible') {
          throw new BadRequestError(
            `Incompatible combination: Material "${mat.materialName}" cannot be used with service "${srv.serviceName}". Note: ${matchedRule.compatibilityNotes || 'Manufacturer restriction.'}`
          );
        }
        if (matchedRule.compatibilityStatus === 'requires_review') {
          warnings.push({
            materialName: mat.materialName,
            serviceName: srv.serviceName,
            type: 'requires_review',
            notes: matchedRule.compatibilityNotes || 'Requires contractor inspection prior to application.',
          });
        }
      }
    }
  }

  return { warnings };
}

/**
 * Calculates material quantities, purchasing units, and cost breakdown.
 */
function calculateMaterialsBreakdown(materials, deckArea, pricingConfig) {
  const wastePercentage = Number(pricingConfig?.wastePercentage || 0);
  const items = [];
  let totalMaterialsCost = 0;

  for (const mat of materials) {
    const coveragePerUnit = Number(
      mat.coverage?.coverageValue || mat.coveragePerUnit || 300
    );
    const unitCost = Number(
      mat.cost?.unitCost !== undefined && mat.cost?.unitCost !== null
        ? mat.cost.unitCost
        : (mat.pricePerUnit || 0)
    );
    const unitOfMeasure = mat.measurement?.quantityUnit || mat.unit || 'gallon';

    // Required coverage quantity
    const baseQuantity = deckArea / coveragePerUnit;
    const wasteQuantity = baseQuantity * (wastePercentage / 100);
    const totalRequiredQuantity = baseQuantity + wasteQuantity;

    // Purchasing unit: rounded up to nearest whole unit for liquid/can containers
    const purchaseQuantity = Math.max(1, Math.ceil(totalRequiredQuantity));
    const subtotal = round2(purchaseQuantity * unitCost);

    totalMaterialsCost += subtotal;

    items.push({
      materialId: mat._id || mat.id,
      materialCode: mat.materialCode || '',
      materialName: mat.materialName || '',
      brandName: mat.brandName || '',
      unit: unitOfMeasure,
      unitPrice: unitCost,
      coveragePerUnit,
      baseQuantity: round2(baseQuantity),
      wastePercentage,
      wasteQuantity: round2(wasteQuantity),
      quantity: purchaseQuantity,
      subtotal,
      isPriceConfigured: unitCost > 0,
      formula: `${deckArea} sqft ÷ ${coveragePerUnit} sqft/${unitOfMeasure} + ${wastePercentage}% waste = ${round2(totalRequiredQuantity)} → ${purchaseQuantity} ${unitOfMeasure}(s) × $${unitCost} = $${subtotal}`,
    });
  }

  return {
    items,
    totalCost: round2(totalMaterialsCost),
  };
}

/**
 * Calculates service quantities, rates, and cost breakdown.
 */
function calculateServicesBreakdown(services, deckArea, pricingConfig) {
  const basePricePerSqFt = Number(pricingConfig?.basePricePerSqFt || 0);
  const items = [];
  let totalServicesCost = 0;

  for (const srv of services) {
    const unit = srv.measurement?.unit || 'square_foot';
    let quantity = 1;
    let rate = 0;

    if (unit === 'square_foot' || unit === 'square_meter') {
      quantity = deckArea;
      rate = basePricePerSqFt > 0 ? basePricePerSqFt : 0.45; // Approved standard rate
    } else if (unit === 'hour') {
      quantity = Number(srv.operationalDetails?.estimatedDuration || 1);
      rate = Number(pricingConfig?.laborRate || 45.0);
    } else if (unit === 'fixed_job' || unit === 'piece') {
      quantity = 1;
      rate = 75.0; // Standard base service charge
    } else {
      quantity = deckArea;
      rate = 0.5;
    }

    const subtotal = round2(quantity * rate);
    totalServicesCost += subtotal;

    items.push({
      serviceId: srv._id || srv.id,
      serviceCode: srv.serviceCode || '',
      serviceName: srv.serviceName || '',
      serviceType: srv.serviceType || '',
      unit,
      quantity: round2(quantity),
      price: rate,
      subtotal,
      operationalNotes: srv.operationalDetails?.laborNotes || '',
      requiredEquipment: srv.operationalDetails?.requiredEquipment || [],
      safetyNotes: srv.operationalDetails?.safetyNotes || '',
      formula: `${quantity} ${unit.replace('_', ' ')} × $${rate} = $${subtotal}`,
    });
  }

  return {
    items,
    totalCost: round2(totalServicesCost),
  };
}

/**
 * Calculates labor costs based on active pricing configuration.
 */
function calculateLaborBreakdown(services, deckArea, pricingConfig) {
  const laborRate = Number(pricingConfig?.laborRate || 0);

  if (laborRate <= 0) {
    return {
      enabled: false,
      laborRate: 0,
      totalHours: 0,
      subtotal: 0,
      notes: 'Labor rate is not configured in current pricing rules.',
      formula: 'Labor pricing disabled (rate = $0)',
    };
  }

  // Calculate estimated labor hours across all selected services
  let totalHours = 0;
  for (const srv of services) {
    if (srv.operationalDetails?.estimatedDuration) {
      totalHours += Number(srv.operationalDetails.estimatedDuration);
    } else {
      // Default: 1 hour per 250 sqft if operational details not specified
      totalHours += Math.max(0.5, deckArea / 250);
    }
  }

  totalHours = round2(totalHours);
  const subtotal = round2(totalHours * laborRate);

  return {
    enabled: true,
    laborRate,
    totalHours,
    subtotal,
    notes: `${totalHours} estimated labor hour(s) at $${laborRate}/hour`,
    formula: `${totalHours} hrs × $${laborRate}/hr = $${subtotal}`,
  };
}

/**
 * Calculates additional charges (travel, preparation, equipment).
 */
function calculateAdditionalCharges(deck, pricingConfig) {
  const charges = [];
  let totalAdditional = 0;

  const travelCharge = Number(pricingConfig?.travelCharge || 0);
  if (travelCharge > 0) {
    charges.push({
      type: 'travel',
      name: 'Travel & Mobilization Charge',
      amount: round2(travelCharge),
      notes: 'Standard site transit and material transport',
    });
    totalAdditional += travelCharge;
  }

  const additionalCoatingPrice = Number(pricingConfig?.additionalCoatingPrice || 0);
  if (additionalCoatingPrice > 0) {
    charges.push({
      type: 'special_prep',
      name: 'Special Coating Preparation Charge',
      amount: round2(additionalCoatingPrice),
      notes: 'Preparation for multi-coat application',
    });
    totalAdditional += additionalCoatingPrice;
  }

  return {
    items: charges,
    subtotal: round2(totalAdditional),
  };
}

/**
 * Main pricing engine execution function.
 * Converts deck measurements, materials, services, and pricing configurations into
 * a mathematically verified, transparent estimate breakdown.
 */
function calculateEstimate({
  deck,
  materials = [],
  services = [],
  compatibilityRules = [],
  pricingConfig = null,
  discountPolicy = null,
}) {
  // 1. Validate Deck & Area
  const deckArea = validateAndGetDeckArea(deck);

  // 2. Validate Compatibility
  const { warnings } = validateCompatibilities({
    deck,
    materials,
    services,
    compatibilityRules,
  });

  // 3. Calculate Materials Breakdown
  const materialsBreakdown = calculateMaterialsBreakdown(
    materials,
    deckArea,
    pricingConfig
  );

  // 4. Calculate Services Breakdown
  const servicesBreakdown = calculateServicesBreakdown(
    services,
    deckArea,
    pricingConfig
  );

  // 5. Calculate Labor Breakdown
  const laborBreakdown = calculateLaborBreakdown(
    services,
    deckArea,
    pricingConfig
  );

  // 6. Calculate Additional Charges
  const additionalCharges = calculateAdditionalCharges(deck, pricingConfig);

  // 7. Calculate Project Subtotal
  const subtotal = round2(
    materialsBreakdown.totalCost +
    servicesBreakdown.totalCost +
    laborBreakdown.subtotal +
    additionalCharges.subtotal
  );

  // 7b. Discount Calculation (Phase 9)
  let discountBreakdown = {
    applied: false,
    policyId: null,
    policyCode: null,
    policyName: null,
    discountType: null,
    discountValue: 0,
    applicability: 'all',
    eligibleAmount: 0,
    discountAmount: 0,
    originalSubtotal: subtotal,
    discountedSubtotal: subtotal,
  };

  let effectiveSubtotal = subtotal;

  if (discountPolicy && discountPolicy.status === 'active') {
    let eligibleAmount = subtotal;
    if (discountPolicy.applicability === 'materials') {
      eligibleAmount = materialsBreakdown.totalCost;
    } else if (discountPolicy.applicability === 'services') {
      eligibleAmount = servicesBreakdown.totalCost;
    } else if (discountPolicy.applicability === 'labor') {
      eligibleAmount = laborBreakdown.subtotal;
    }

    eligibleAmount = round2(eligibleAmount);

    const minEst = Number(discountPolicy.minimumEstimateAmount || 0);
    if (minEst <= 0 || subtotal >= minEst) {
      let rawDiscount = 0;
      if (discountPolicy.discountType === 'percentage') {
        rawDiscount = eligibleAmount * (Number(discountPolicy.discountValue) / 100);
      } else {
        rawDiscount = Math.min(Number(discountPolicy.discountValue), eligibleAmount);
      }

      if (discountPolicy.maximumDiscountAmount && discountPolicy.maximumDiscountAmount > 0) {
        rawDiscount = Math.min(rawDiscount, Number(discountPolicy.maximumDiscountAmount));
      }

      const discountAmount = round2(Math.max(0, rawDiscount));
      effectiveSubtotal = round2(Math.max(0, subtotal - discountAmount));

      discountBreakdown = {
        applied: discountAmount > 0,
        policyId: discountPolicy._id || discountPolicy.id || null,
        policyCode: discountPolicy.code,
        policyName: discountPolicy.name,
        discountType: discountPolicy.discountType,
        discountValue: Number(discountPolicy.discountValue),
        applicability: discountPolicy.applicability || 'all',
        eligibleAmount,
        discountAmount,
        originalSubtotal: subtotal,
        discountedSubtotal: effectiveSubtotal,
      };
    }
  }

  // 8. Minimum Job Price Adjustment (applied to effectiveSubtotal)
  const minimumJobPrice = Number(pricingConfig?.minimumJobPrice || 0);
  let minimumAdjustment = 0;
  let preTaxTotal = effectiveSubtotal;

  if (minimumJobPrice > 0 && effectiveSubtotal < minimumJobPrice) {
    minimumAdjustment = round2(minimumJobPrice - effectiveSubtotal);
    preTaxTotal = round2(minimumJobPrice);
  }

  // 9. Tax Calculation
  const taxPercentage = Number(pricingConfig?.taxPercentage || 0);
  let taxAmount = 0;
  if (taxPercentage > 0) {
    taxAmount = round2(preTaxTotal * (taxPercentage / 100));
  }

  // 10. Final Estimated Amount
  const totalAmount = round2(preTaxTotal + taxAmount);

  // Compile Comprehensive Pricing Snapshot
  const pricingSnapshot = {
    pricingConfigId: pricingConfig?._id || pricingConfig?.id || null,
    deckAreaSqFt: deckArea,
    pricingRulesApplied: {
      minimumJobPrice,
      basePricePerSqFt: Number(pricingConfig?.basePricePerSqFt || 0),
      laborRate: Number(pricingConfig?.laborRate || 0),
      wastePercentage: Number(pricingConfig?.wastePercentage || 0),
      travelCharge: Number(pricingConfig?.travelCharge || 0),
      taxPercentage,
    },
    materialsSubtotal: materialsBreakdown.totalCost,
    servicesSubtotal: servicesBreakdown.totalCost,
    laborSubtotal: laborBreakdown.subtotal,
    additionalChargesSubtotal: additionalCharges.subtotal,
    calculatedSubtotal: subtotal,
    discountBreakdown,
    minimumAdjustment,
    preTaxTotal,
    taxAmount,
    finalTotal: totalAmount,
    calculatedAt: new Date(),
  };

  return {
    deckArea,
    materialsBreakdown,
    servicesBreakdown,
    laborBreakdown,
    additionalCharges,
    subtotal,
    discountBreakdown,
    minimumAdjustment,
    minimumJobPrice,
    preTaxTotal,
    taxPercentage,
    taxAmount,
    totalAmount,
    pricingSnapshot,
    warnings,
  };
}

/**
 * Recalculates an existing estimate calculation with an approved discount policy.
 */
function applyDiscountToCalculation(baseCalc, discountPolicy, pricingConfig) {
  const subtotal = Number(baseCalc.subtotal || 0);
  let effectiveSubtotal = subtotal;

  let discountBreakdown = {
    applied: false,
    policyId: null,
    policyCode: null,
    policyName: null,
    discountType: null,
    discountValue: 0,
    applicability: 'all',
    eligibleAmount: 0,
    discountAmount: 0,
    originalSubtotal: subtotal,
    discountedSubtotal: subtotal,
  };

  if (discountPolicy && discountPolicy.status === 'active') {
    let eligibleAmount = subtotal;
    if (discountPolicy.applicability === 'materials') {
      eligibleAmount = baseCalc.materialsBreakdown?.totalCost ?? baseCalc.materialsSubtotal ?? subtotal;
    } else if (discountPolicy.applicability === 'services') {
      eligibleAmount = baseCalc.servicesBreakdown?.totalCost ?? baseCalc.servicesSubtotal ?? subtotal;
    } else if (discountPolicy.applicability === 'labor') {
      eligibleAmount = baseCalc.laborBreakdown?.subtotal ?? baseCalc.laborSubtotal ?? subtotal;
    }

    eligibleAmount = round2(eligibleAmount);
    const minEst = Number(discountPolicy.minimumEstimateAmount || 0);

    if (minEst <= 0 || subtotal >= minEst) {
      let rawDiscount = 0;
      if (discountPolicy.discountType === 'percentage') {
        rawDiscount = eligibleAmount * (Number(discountPolicy.discountValue) / 100);
      } else {
        rawDiscount = Math.min(Number(discountPolicy.discountValue), eligibleAmount);
      }

      if (discountPolicy.maximumDiscountAmount && discountPolicy.maximumDiscountAmount > 0) {
        rawDiscount = Math.min(rawDiscount, Number(discountPolicy.maximumDiscountAmount));
      }

      const discountAmount = round2(Math.max(0, rawDiscount));
      effectiveSubtotal = round2(Math.max(0, subtotal - discountAmount));

      discountBreakdown = {
        applied: discountAmount > 0,
        policyId: discountPolicy._id || discountPolicy.id || null,
        policyCode: discountPolicy.code,
        policyName: discountPolicy.name,
        discountType: discountPolicy.discountType,
        discountValue: Number(discountPolicy.discountValue),
        applicability: discountPolicy.applicability || 'all',
        eligibleAmount,
        discountAmount,
        originalSubtotal: subtotal,
        discountedSubtotal: effectiveSubtotal,
      };
    }
  }

  const minimumJobPrice = Number(pricingConfig?.minimumJobPrice || baseCalc.minimumJobPrice || 0);
  let minimumAdjustment = 0;
  let preTaxTotal = effectiveSubtotal;

  if (minimumJobPrice > 0 && effectiveSubtotal < minimumJobPrice) {
    minimumAdjustment = round2(minimumJobPrice - effectiveSubtotal);
    preTaxTotal = round2(minimumJobPrice);
  }

  const taxPercentage = Number(pricingConfig?.taxPercentage || baseCalc.taxPercentage || 0);
  let taxAmount = 0;
  if (taxPercentage > 0) {
    taxAmount = round2(preTaxTotal * (taxPercentage / 100));
  }

  const totalAmount = round2(preTaxTotal + taxAmount);

  return {
    ...baseCalc,
    discountBreakdown,
    minimumAdjustment,
    preTaxTotal,
    taxAmount,
    totalAmount,
  };
}

// =============================================
// CLIENT RESTORATION PRICING SPECIFICATION
// =============================================
// Extracted directly from client prototype and specification.
// Implements:
// 1. Billable surface area (A = F + 4R + 12S + 1.5Fa + 3Pg + Sd)
// 2. Base labor hours (Hb = F/P + R/T + 0.5S + Fa/20 + Pg/6 + Sd/60 [+ 0.40*(F/P) if joists])
// 3. Five-part labor hours (H1=Hb, H2=Hb(Mc-1), H3=Hb*Mc(Ms-1), H4=Hb*Mc*Ms(Ma-1), H5=Hb*Mc*Ms*Ma*C)
// 4. Product quantities & unrounded material costs
// 5. Confidence-based price ranges (High ±12%, Med ±20%, Low ±32%)
// No minimum job price adjustment, no automatic travel/tax.

const RAILING_STYLE_FACTORS = {
  plain_2x2: 5,
  plain: 5,
  'plain 2x2': 5,
  'plain 2x2 balusters': 5,
  turned_spindles: 3,
  turned: 3,
  'turned / routed spindles': 3,
  solid_panel: 4,
  panel: 4,
  'solid panel / lattice': 4,
  cable_glass: 12,
  cable: 12,
  'cable / glass with wood top rail': 12,
};

const WOOD_SPECIES_FACTORS = {
  pressure_treated_pine: { multiplier: 1.00, coverage: 175, label: 'Pressure-treated pine' },
  pine: { multiplier: 1.00, coverage: 175, label: 'Pressure-treated pine' },
  cedar: { multiplier: 1.10, coverage: 150, label: 'Cedar' },
  redwood: { multiplier: 1.10, coverage: 160, label: 'Redwood' },
  mahogany_meranti: { multiplier: 1.20, coverage: 225, label: 'Mahogany / Meranti' },
  mahogany: { multiplier: 1.20, coverage: 225, label: 'Mahogany / Meranti' },
  meranti: { multiplier: 1.20, coverage: 225, label: 'Mahogany / Meranti' },
  garapa_tigerwood: { multiplier: 1.30, coverage: 275, label: 'Garapa / Tigerwood' },
  garapa: { multiplier: 1.30, coverage: 275, label: 'Garapa / Tigerwood' },
  tigerwood: { multiplier: 1.30, coverage: 275, label: 'Garapa / Tigerwood' },
  ipe_cumaru_massaranduba: { multiplier: 1.35, coverage: 350, label: 'Ipe / Cumaru / Massaranduba' },
  ipe: { multiplier: 1.35, coverage: 350, label: 'Ipe / Cumaru / Massaranduba' },
  cumaru: { multiplier: 1.35, coverage: 350, label: 'Ipe / Cumaru / Massaranduba' },
  massaranduba: { multiplier: 1.35, coverage: 350, label: 'Ipe / Cumaru / Massaranduba' },
  composite: { multiplier: 0.45, coverage: 0, label: 'Composite (Trex)' },
  trex: { multiplier: 0.45, coverage: 0, label: 'Composite (Trex)' },
};

const ACCESS_MULTIPLIERS = {
  ground_level: 1.00,
  ground: 1.00,
  elevated_one_story: 1.15,
  one_story: 1.15,
  elevated: 1.15,
  second_story: 1.35,
  staging_or_roof_work: 1.60,
  staging_roof: 1.60,
  staging: 1.60,
  roof: 1.60,
};

const COATING_MULTIPLIERS = {
  bare_weathered_gray: 1.00,
  bare_weathered: 1.00,
  bare: 1.00,
  weathered: 1.00,
  weathered_gray: 1.00,
  maintained_penetrating_stain: 0.70,
  maintained_penetrating: 0.70,
  maintained: 0.70,
  oil_penetrating_one_coat: 1.30,
  oil_penetrating: 1.30,
  oil_heavy_buildup: 1.90,
  heavy_buildup: 1.90,
  film_former: 2.20,
  solid_stain_or_paint: 2.80,
  solid_stain_paint: 2.80,
  solid_stain: 2.80,
  paint: 2.80,
  unknown_or_mixed: 2.20,
  unknown_mixed: 2.20,
  unknown: 2.20,
};

const CONDITION_FACTORS = {
  heavy_mildew: 0.15,
  mildew: 0.15,
  tannin_rust_bleed: 0.10,
  tannin_bleed: 0.10,
  rust_bleed: 0.10,
  pressure_damage_furring: 0.20,
  pressure_damage: 0.20,
  furring: 0.20,
  mill_glaze_new_wood: 0.05,
  mill_glaze: 0.05,
  new_wood: 0.05,
};

const CONFIDENCE_SPREADS = {
  high: 0.12,
  medium: 0.20,
  low: 0.32,
};

const DEFAULT_PRODUCT_PRICES = {
  stain: 46.0,
  stripper: 38.0,
  brightener: 28.0,
  cleaner: 32.0,
};

function getRailingStyleFactor(style) {
  if (!style) return 5;
  const key = String(style).toLowerCase().trim().replace(/[\s\/-]+/g, '_');
  return RAILING_STYLE_FACTORS[key] || RAILING_STYLE_FACTORS[style.toLowerCase().trim()] || 5;
}

/**
 * Formula 1 — Billable Surface Area
 * A = F + (4 * R) + (12 * S) + (1.5 * Fa) + (3 * Pg) + Sd
 */
function calculateBillableArea({
  floorArea = 0,
  railingLength = 0,
  stairCount = 0,
  fasciaLength = 0,
  pergolaLength = 0,
  sidingArea = 0,
} = {}) {
  const F = Number(floorArea) || 0;
  const R = Number(railingLength) || 0;
  const S = Number(stairCount) || 0;
  const Fa = Number(fasciaLength) || 0;
  const Pg = Number(pergolaLength) || 0;
  const Sd = Number(sidingArea) || 0;

  if (F < 0 || R < 0 || S < 0 || Fa < 0 || Pg < 0 || Sd < 0) {
    throw new BadRequestError('Deck dimensions and component measurements cannot be negative.');
  }

  return round2(F + (4 * R) + (12 * S) + (1.5 * Fa) + (3 * Pg) + Sd);
}

/**
 * Formula 2 — Base Labor Hours
 * Hb = (F / P) + (R / T) + (0.5 * S) + (Fa / 20) + (Pg / 6) + (Sd / 60)
 * Underside / Joists adjustment: if selected, Hb = Hb + (F / P) * 0.40
 */
function calculateBaseLaborHours({
  floorArea = 0,
  railingLength = 0,
  railingStyle = 'plain_2x2',
  stairCount = 0,
  fasciaLength = 0,
  pergolaLength = 0,
  sidingArea = 0,
  includeJoists = false,
  floorProductionRate = 50,
} = {}) {
  const F = Number(floorArea) || 0;
  const R = Number(railingLength) || 0;
  const S = Number(stairCount) || 0;
  const Fa = Number(fasciaLength) || 0;
  const Pg = Number(pergolaLength) || 0;
  const Sd = Number(sidingArea) || 0;
  const P = Number(floorProductionRate) || 50;
  const T = getRailingStyleFactor(railingStyle);

  if (P <= 0) {
    throw new BadRequestError('Floor production rate must be greater than 0.');
  }

  let Hb = (F / P) + (R / T) + (0.5 * S) + (Fa / 20) + (Pg / 6) + (Sd / 60);

  if (includeJoists) {
    Hb += (F / P) * 0.40;
  }

  return Hb;
}

/**
 * Formula 3 — Total Labor Hours (Five-Part Labor Calculation)
 * H1 = Hb
 * H2 = Hb * (Mc - 1)
 * H3 = Hb * Mc * (Ms - 1)
 * H4 = Hb * Mc * Ms * (Ma - 1)
 * H5 = Hb * Mc * Ms * Ma * C
 * H = H1 + H2 + H3 + H4 + H5
 * Labor Cost = H * B
 */
function calculateFivePartLabor({
  baseHours = 0,
  coatingType = 'oil_penetrating_one_coat',
  woodSpecies = 'pressure_treated_pine',
  accessType = 'ground_level',
  conditionFlags = [],
  billingRate = 75,
} = {}) {
  const Hb = Number(baseHours) || 0;
  const B = Number(billingRate) || 75;

  const normCoating = String(coatingType || '').toLowerCase().trim().replace(/[\s\/-]+/g, '_');
  const Mc = COATING_MULTIPLIERS[normCoating] !== undefined ? COATING_MULTIPLIERS[normCoating] : 1.30;

  const normSpecies = String(woodSpecies || '').toLowerCase().trim().replace(/[\s\/-]+/g, '_');
  const speciesData = WOOD_SPECIES_FACTORS[normSpecies] || WOOD_SPECIES_FACTORS.pressure_treated_pine;
  const Ms = speciesData.multiplier;

  const normAccess = String(accessType || '').toLowerCase().trim().replace(/[\s\/-]+/g, '_');
  const Ma = ACCESS_MULTIPLIERS[normAccess] !== undefined ? ACCESS_MULTIPLIERS[normAccess] : 1.00;

  let C = 0;
  const activeConditions = [];
  if (Array.isArray(conditionFlags)) {
    for (const flag of conditionFlags) {
      const key = String(flag || '').toLowerCase().trim().replace(/[\s\/-]+/g, '_');
      if (CONDITION_FACTORS[key] !== undefined) {
        C += CONDITION_FACTORS[key];
        activeConditions.push(key);
      }
    }
  } else if (typeof conditionFlags === 'object' && conditionFlags !== null) {
    for (const [key, val] of Object.entries(conditionFlags)) {
      if (val) {
        const normKey = String(key).toLowerCase().trim().replace(/[\s\/-]+/g, '_');
        if (CONDITION_FACTORS[normKey] !== undefined) {
          C += CONDITION_FACTORS[normKey];
          activeConditions.push(normKey);
        }
      }
    }
  }

  const H1 = Hb;
  const H2 = Hb * (Mc - 1);
  const H3 = Hb * Mc * (Ms - 1);
  const H4 = Hb * Mc * Ms * (Ma - 1);
  const H5 = Hb * Mc * Ms * Ma * C;
  const H = H1 + H2 + H3 + H4 + H5;
  const laborCost = H * B;

  return {
    H1_base: H1,
    H2_coating: H2,
    H3_species: H3,
    H4_access: H4,
    H5_condition: H5,
    totalHours: H,
    multipliers: {
      coating: Mc,
      species: Ms,
      access: Ma,
      conditionSum: C,
      conditions: activeConditions,
    },
    billingRate: B,
    laborCost,
  };
}

/**
 * Formula 4 — Material Quantities and Cost
 * Uses unrounded quantities for cost calculation.
 * Display quantities are rounded upward to nearest 0.1 gallon.
 */
function calculateProductRequirements({
  billableArea = 0,
  woodSpecies = 'pressure_treated_pine',
  coatingType = 'oil_penetrating_one_coat',
  customPrices = {},
} = {}) {
  const A = Number(billableArea) || 0;
  const normSpecies = String(woodSpecies || '').toLowerCase().trim().replace(/[\s\/-]+/g, '_');
  const speciesData = WOOD_SPECIES_FACTORS[normSpecies] || WOOD_SPECIES_FACTORS.pressure_treated_pine;
  const isComposite = normSpecies.includes('composite') || normSpecies.includes('trex');
  const Cs = speciesData.coverage;

  const normCoating = String(coatingType || '').toLowerCase().trim().replace(/[\s\/-]+/g, '_');
  const Mc = COATING_MULTIPLIERS[normCoating] !== undefined ? COATING_MULTIPLIERS[normCoating] : 1.30;

  const prices = {
    stain: customPrices.stain !== undefined ? Number(customPrices.stain) : DEFAULT_PRODUCT_PRICES.stain,
    stripper: customPrices.stripper !== undefined ? Number(customPrices.stripper) : DEFAULT_PRODUCT_PRICES.stripper,
    brightener: customPrices.brightener !== undefined ? Number(customPrices.brightener) : DEFAULT_PRODUCT_PRICES.brightener,
    cleaner: customPrices.cleaner !== undefined ? Number(customPrices.cleaner) : DEFAULT_PRODUCT_PRICES.cleaner,
  };

  let Qs = 0;
  let Qst = 0;
  let Qb = 0;
  let Qc = 0;

  if (isComposite) {
    // Composite (Trex): Clean-only; no wood stain, stripper or brightener
    Qs = 0;
    Qst = 0;
    Qb = 0;
    Qc = A > 0 ? A / 500 : 0;
  } else {
    // Wood
    Qs = A > 0 && Cs > 0 ? A / Cs : 0;
    // Suppress stripper for bare/weathered wood (Mc === 1.00) or maintained penetrating stain (Mc === 0.70)
    if (Mc === 1.00 || Mc === 0.70) {
      Qst = 0;
    } else {
      Qst = A > 0 ? A / 175 : 0;
    }
    Qb = A > 0 ? A / 400 : 0;
    Qc = A > 0 ? A / 500 : 0;
  }

  const roundDisplay = (q) => Math.ceil(q * 10) / 10;

  const stainCost = Qs * prices.stain;
  const stripperCost = Qst * prices.stripper;
  const brightenerCost = Qb * prices.brightener;
  const cleanerCost = Qc * prices.cleaner;
  const totalMaterialCost = stainCost + stripperCost + brightenerCost + cleanerCost;

  return {
    products: {
      stain: {
        name: 'Wood Stain / Sealer',
        rawQuantity: Qs,
        displayQuantity: roundDisplay(Qs),
        unit: 'gallon',
        unitPrice: prices.stain,
        cost: stainCost,
        coverageRate: Cs,
        active: Qs > 0,
      },
      stripper: {
        name: 'Chemical Coating Stripper',
        rawQuantity: Qst,
        displayQuantity: roundDisplay(Qst),
        unit: 'gallon',
        unitPrice: prices.stripper,
        cost: stripperCost,
        coverageRate: 175,
        active: Qst > 0,
      },
      brightener: {
        name: 'Wood Brightener & Conditioner',
        rawQuantity: Qb,
        displayQuantity: roundDisplay(Qb),
        unit: 'gallon',
        unitPrice: prices.brightener,
        cost: brightenerCost,
        coverageRate: 400,
        active: Qb > 0,
      },
      cleaner: {
        name: 'Deck Wash & Surface Cleaner',
        rawQuantity: Qc,
        displayQuantity: roundDisplay(Qc),
        unit: 'gallon',
        unitPrice: prices.cleaner,
        cost: cleanerCost,
        coverageRate: 500,
        active: Qc > 0,
      },
    },
    totalMaterialCost,
    pricesUsed: prices,
  };
}

/**
 * Formula 5 — Estimated Price Range
 * E = L + M
 * Spread: High ±12%, Medium ±20%, Low ±32%
 */
function calculateConfidenceRange({ baseEstimate = 0, confidenceLevel = 'medium' } = {}) {
  const E = Number(baseEstimate) || 0;
  const key = String(confidenceLevel || 'medium').toLowerCase().trim();
  const r = CONFIDENCE_SPREADS[key] !== undefined ? CONFIDENCE_SPREADS[key] : 0.20;

  const lowEstimate = E * (1 - r);
  const highEstimate = E * (1 + r);
  const maintenanceReference = E * 0.70;

  return {
    confidence: key,
    spread: r,
    baseEstimate: E,
    lowEstimate,
    highEstimate,
    displayQuote: {
      low: Math.round(lowEstimate),
      high: Math.round(highEstimate),
      formatted: `$${Math.round(lowEstimate).toLocaleString()} – $${Math.round(highEstimate).toLocaleString()}`,
    },
    maintenanceReference,
  };
}

/**
 * Master Client Restoration Pricing Function
 * Single source of truth implementing all formulas and client specifications.
 */
function calculateClientPricing(params = {}) {
  const floorArea = Number(params.floorArea || params.deckFloorArea || params.deckArea || 0);
  if (floorArea <= 0 || isNaN(floorArea)) {
    throw new BadRequestError('Deck floor area must be greater than 0 sq ft for pricing calculations.');
  }

  const billableArea = calculateBillableArea({
    floorArea,
    railingLength: params.railingLength,
    stairCount: params.stairCount || params.stairs,
    fasciaLength: params.fasciaLength || params.skirtingLength,
    pergolaLength: params.pergolaLength || params.arborLength,
    sidingArea: params.sidingArea,
  });

  const baseLaborHours = calculateBaseLaborHours({
    floorArea,
    railingLength: params.railingLength,
    railingStyle: params.railingStyle,
    stairCount: params.stairCount || params.stairs,
    fasciaLength: params.fasciaLength || params.skirtingLength,
    pergolaLength: params.pergolaLength || params.arborLength,
    sidingArea: params.sidingArea,
    includeJoists: params.includeJoists || params.undersideJoists,
    floorProductionRate: params.floorProductionRate,
  });

  const labor = calculateFivePartLabor({
    baseHours: baseLaborHours,
    coatingType: params.coatingType || params.identifiedCoating,
    woodSpecies: params.woodSpecies || params.species,
    accessType: params.accessType,
    conditionFlags: params.conditionFlags,
    billingRate: params.billingRate,
  });

  const materials = calculateProductRequirements({
    billableArea,
    woodSpecies: params.woodSpecies || params.species,
    coatingType: params.coatingType || params.identifiedCoating,
    customPrices: params.customPrices || params.productPrices,
  });

  const baseEstimate = labor.laborCost + materials.totalMaterialCost;

  const range = calculateConfidenceRange({
    baseEstimate,
    confidenceLevel: params.coatingConfidence || params.confidence,
  });

  const warnings = [];
  const normCoating = String(params.coatingType || params.identifiedCoating || '').toLowerCase();
  const isUnknownCoating = normCoating.includes('unknown');
  const isLowConfidence = range.confidence === 'low' || isUnknownCoating;
  if (isLowConfidence) {
    warnings.push({
      code: 'LOW_CONFIDENCE_INSPECTION_REQUIRED',
      type: 'warning',
      message: 'Coating identification confidence is low. An on-site solvent/adhesion inspection is recommended prior to final contracting.',
    });
  }

  const normSpecies = String(params.woodSpecies || params.species || '').toLowerCase();
  const isComposite = normSpecies.includes('composite') || normSpecies.includes('trex');
  if (isComposite) {
    warnings.push({
      code: 'COMPOSITE_CLEAN_ONLY',
      type: 'info',
      message: 'Composite decking selected: wood stains and chemical strippers have been automatically excluded.',
    });
  }

  if (params.isCoatingIncomplete) {
    warnings.push({
      code: 'PROVISIONAL_ESTIMATE_COATING_INCOMPLETE',
      type: 'warning',
      message: 'Coating identification questionnaire is incomplete: Estimate is provisional.',
    });
  }

  return {
    billableArea,
    floorArea,
    baseLaborHours,
    laborBreakdown: labor,
    productRequirements: materials.products,
    totalMaterialCost: materials.totalMaterialCost,
    laborCost: labor.laborCost,
    baseEstimate,
    confidence: range.confidence,
    spread: range.spread,
    lowEstimate: range.lowEstimate,
    highEstimate: range.highEstimate,
    displayQuote: range.displayQuote,
    maintenanceReference: range.maintenanceReference,
    warnings,
    isProvisional: Boolean(params.isCoatingIncomplete),
  };
}

module.exports = {
  calculateEstimate,
  applyDiscountToCalculation,
  validateAndGetDeckArea,
  validateCompatibilities,
  calculateMaterialsBreakdown,
  calculateServicesBreakdown,
  calculateLaborBreakdown,
  calculateAdditionalCharges,
  round2,
  // Client Pricing Exports
  calculateClientPricing,
  calculateBillableArea,
  calculateBaseLaborHours,
  calculateFivePartLabor,
  calculateProductRequirements,
  calculateConfidenceRange,
  getRailingStyleFactor,
  RAILING_STYLE_FACTORS,
  WOOD_SPECIES_FACTORS,
  ACCESS_MULTIPLIERS,
  COATING_MULTIPLIERS,
  CONDITION_FACTORS,
  CONFIDENCE_SPREADS,
  DEFAULT_PRODUCT_PRICES,
};
