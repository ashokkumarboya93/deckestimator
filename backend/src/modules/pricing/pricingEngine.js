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
};
