// =============================================
// Deck Estimator — Estimate Service
// =============================================

const mongoose = require('mongoose');
const crypto = require('crypto');
const Estimate = require('./estimate.model');
const EstimateRevision = require('./estimateRevision.model');
const Deck = require('../decks/deck.model');
const Material = require('../catalogs/material.model');
const Service = require('../catalogs/service.model');
const MaterialServiceCompatibility = require('../catalogs/materialServiceCompatibility.model');
const DiscountPolicy = require('../discounts/discountPolicy.model');
const DiscountAssignment = require('../discounts/discountAssignment.model');
const pricingService = require('../pricing/pricing.service');
const pricingEngine = require('../pricing/pricingEngine');
const AuditLog = require('../../shared/models/auditLog.model');
const Lead = require('../leads/lead.model');
const Project = require('../admin/project.model');
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} = require('../../shared/errors');
const { ROLES } = require('../../shared/constants');

async function recordAuditLog({
  performedBy,
  action,
  entityId,
  oldValue = null,
  newValue = null,
  ipAddress = null,
}) {
  try {
    await AuditLog.create({
      performedBy,
      action,
      entityType: 'ESTIMATE',
      entityId,
      oldValue,
      newValue,
      ipAddress,
    });
  } catch (err) {
    console.error('[AuditLog] Warning: Failed to record estimate audit log:', err.message);
  }
}

function generateEstimateNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `EST-${dateStr}-${randomSuffix}`;
}

/**
 * Asserts whether the given user has permission to read or modify an estimate.
 */
function assertEstimateAccess(estimate, user) {
  if (user.role === ROLES.ADMIN) return;

  const ownerIdStr = (estimate.ownerId?._id || estimate.ownerId || '').toString();
  const createdByStr = (estimate.createdBy?._id || estimate.createdBy || '').toString();
  const userIdStr = (user.id || user._id).toString();

  if (ownerIdStr !== userIdStr && createdByStr !== userIdStr) {
    throw new ForbiddenError('You do not have permission to access or modify this estimate.');
  }
}

/**
 * Asserts whether the user can generate an estimate for the specified deck.
 */
function assertDeckAccess(deck, user) {
  if (user.role === ROLES.ADMIN) return;

  const deckOwnerIdStr = (deck.ownerId?._id || deck.ownerId || '').toString();
  const userIdStr = (user.id || user._id).toString();

  if (deckOwnerIdStr !== userIdStr) {
    throw new ForbiddenError('You do not have permission to create estimates for this deck project.');
  }
}

async function createEstimate(data, user, ipAddress) {
  const { deckId, estimateName, notes = '' } = data;
  let materialIds = data.materialIds || [];
  let serviceIds = data.serviceIds || [];

  if (materialIds.length === 0 && Array.isArray(data.selectedMaterials) && data.selectedMaterials.length > 0) {
    materialIds = data.selectedMaterials.map((m) => m.materialId || m);
  }
  if (serviceIds.length === 0 && Array.isArray(data.selectedServices) && data.selectedServices.length > 0) {
    serviceIds = data.selectedServices.map((s) => s.serviceId || s);
  }

  // 1. Fetch & Validate Deck
  const deck = await Deck.findById(deckId);
  if (!deck) {
    throw new NotFoundError('Referenced deck project not found.');
  }
  assertDeckAccess(deck, user);

  const isClientRestoration = Boolean(
    data.restorationDetails ||
    data.woodSpecies ||
    data.coatingType ||
    data.clientPricing ||
    (materialIds.length === 0 && serviceIds.length === 0)
  );

  let selectedMaterialsItems = [];
  let selectedServicesItems = [];
  let laborBreakdownData = {};
  let additionalChargesData = { items: [], subtotal: 0 };
  let subtotalAmount = 0;
  let minAdjustmentAmount = 0;
  let minJobPriceVal = 0;
  let preTaxAmount = 0;
  let taxPercentageVal = 0;
  let taxAmountVal = 0;
  let totalAmountVal = 0;
  let pricingSnapshotData = {};
  let warningsList = [];
  let calculatedDeckArea = 0;

  if (isClientRestoration) {
    const floorArea = Number(
      deck.dimensions?.area ||
      deck.deckArea ||
      data.floorArea ||
      (deck.dimensions?.length && deck.dimensions?.width
        ? Number(deck.dimensions.length) * Number(deck.dimensions.width)
        : 400)
    );
    calculatedDeckArea = floorArea;

    const clientParams = {
      floorArea,
      railingLength: data.railingLength !== undefined ? data.railingLength : (deck.railingDetails?.totalLength || 0),
      railingSqft: data.railingSqft || 0,
      railingStyle: data.railingStyle || deck.railingDetails?.style || 'plain_2x2',
      stairCount: data.stairCount !== undefined ? data.stairCount : (deck.structureDetails?.stairCount || 0),
      stairSqft: data.stairSqft || 0,
      fasciaLength: data.fasciaLength || 0,
      fasciaSqft: data.fasciaSqft || 0,
      pergolaLength: data.pergolaLength || 0,
      pergolaSqft: data.pergolaSqft || 0,
      privacyWallSqft: data.privacyWallSqft || 0,
      sidingArea: data.sidingArea || 0,
      sidingSqft: data.sidingSqft || 0,
      includeJoists: Boolean(data.includeJoists),
      joistsSqft: data.joistsSqft || 0,
      woodSpecies: data.woodSpecies || deck.surfaceDetails?.material || 'pressure_treated_pine',
      accessType: data.accessType || (deck.structureDetails?.elevation > 4 ? 'elevated_one_story' : 'ground_level'),
      coatingType: data.coatingType || 'oil_penetrating_one_coat',
      coatingConfidence: data.coatingConfidence || 'medium',
      conditionFlags: data.conditionFlags || data.conditions || deck.visibleConditions || [],
      damageConditions: data.damageConditions || data.conditions || data.conditionFlags || deck.visibleConditions || [],
      crackBoardCount: data.crackBoardCount || 0,
      rottedBoardCount: data.rottedBoardCount || 0,
      warpedBoardCount: data.warpedBoardCount || 0,
      looseBoardCount: data.looseBoardCount || 0,
      waterDamagedBoardCount: data.waterDamagedBoardCount || 0,
      crackLooseOverlapCount: data.crackLooseOverlapCount || 0,
      exactHeightFt: data.exactHeightFt,
      stainType: data.stainType || data.finishType,
      services: data.services || data.restorationScope || ['cleaning'],
      billingRate: data.billingRate || 75,
      floorProductionRate: data.floorProductionRate || 50,
      customPrices: data.customPrices || data.productPrices || {},
      isCoatingIncomplete: Boolean(data.isCoatingIncomplete),
      ...(data.restorationDetails || {}),
    };

    const activePricing = await PricingConfiguration.findOne({ isActive: true });
    const customCfg = activePricing?.restorationPricing || null;
    const clientCalc = pricingEngine.calculateRestorationEstimate(clientParams, customCfg);

    selectedMaterialsItems = [
      {
        materialId: new mongoose.Types.ObjectId(),
        materialName: `Restoration Materials & Preps (${clientCalc.prep || 'clean'})`,
        materialCode: `MAT-${(clientCalc.finish || 'standard').toUpperCase()}`,
        brandName: 'Deck Restoration Plus Pro Line',
        unit: 'package',
        quantity: 1,
        unitPrice: clientCalc.basePrice,
        coveragePerUnit: clientCalc.billableArea,
        baseQuantity: clientCalc.billableArea,
        wastePercentage: 0,
        wasteQuantity: 0,
        subtotal: clientCalc.basePrice,
        formula: `${clientCalc.billableArea} sqft @ $${clientCalc.rate}/sqft = $${clientCalc.basePrice.toFixed(2)}`,
      },
    ];

    selectedServicesItems = (data.services || data.restorationScope || ['cleaning']).map((srv) => ({
      serviceId: new mongoose.Types.ObjectId(),
      serviceName: String(srv).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      serviceCode: `SRV-${String(srv).toUpperCase().slice(0, 8)}`,
      serviceType: 'restoration',
      unit: 'service',
      quantity: 1,
      price: 0,
      subtotal: 0,
      formula: 'Included in package sqft rate card',
    }));

    laborBreakdownData = {
      enabled: true,
      laborRate: clientCalc.labourRate || 250,
      totalHours: clientCalc.addHours || 0,
      subtotal: clientCalc.labourAdj || 0,
      notes: `Additive labor adjustment: Wood hours (${clientCalc.woodHours || 0}h) + Access hours (${clientCalc.accessHours || 0}h) = ${clientCalc.addHours || 0} additional hours @ $${clientCalc.labourRate || 250}/hr`,
      formula: `${clientCalc.addHours || 0} add. hrs × $${clientCalc.labourRate || 250}/hr = $${(clientCalc.labourAdj || 0).toFixed(2)}`,
    };

    if (clientCalc.travelFee > 0) {
      additionalChargesData = {
        items: [
          {
            type: 'travel',
            name: 'Travel Fee (>45 min distance)',
            amount: clientCalc.travelFee,
            notes: 'Flat distance mobilization surcharge',
          },
        ],
        subtotal: clientCalc.travelFee,
      };
    }

    const applyMinJob = Boolean(data.applyMinJobPrice || payload.applyMinJobPrice);
    const pureCalculated = clientCalc.calculatedTotal || clientCalc.rawSubtotal || clientCalc.total || 2500;
    const minJobThreshold = clientCalc.minJob || 2500;
    const floorAmount = clientCalc.floorTotal || Math.max(pureCalculated, minJobThreshold);
    const chosenBase = applyMinJob ? floorAmount : pureCalculated;

    subtotalAmount = pureCalculated;
    minAdjustmentAmount = applyMinJob && clientCalc.minJobApplied ? (minJobThreshold - pureCalculated) : 0;
    minJobPriceVal = minJobThreshold;
    preTaxAmount = chosenBase;
    taxPercentageVal = 0;
    taxAmountVal = 0;
    totalAmountVal = chosenBase;
    pricingSnapshotData = {
      ...clientCalc,
      applyMinJobPrice: applyMinJob,
      calculatedTotal: pureCalculated,
      floorTotal: floorAmount,
      total: chosenBase,
    };
    warningsList = (clientCalc.warnings || []).map((w) => ({
      materialName: 'Restoration Scope',
      serviceName: 'Deck Restoration',
      type: w.type || 'info',
      notes: w.message || '',
    }));
  } else {
    // 2. Fetch Selected Active Materials
    let materials = [];
    if (materialIds.length > 0) {
      materials = await Material.find({
        _id: { $in: materialIds },
        status: 'active',
      });
      if (materials.length !== materialIds.length) {
        throw new BadRequestError('One or more selected materials are invalid, inactive, or unapproved.');
      }
    }

    // 3. Fetch Selected Active Services
    let services = [];
    if (serviceIds.length > 0) {
      services = await Service.find({
        _id: { $in: serviceIds },
        status: 'active',
      });
      if (services.length !== serviceIds.length) {
        throw new BadRequestError('One or more selected services are invalid, inactive, or unapproved.');
      }
    }

    // 4. Fetch Compatibility Rules
    let compatibilityRules = [];
    if (materials.length > 0 && services.length > 0) {
      compatibilityRules = await MaterialServiceCompatibility.find({
        materialId: { $in: materials.map((m) => m._id) },
        serviceId: { $in: services.map((s) => s._id) },
      });
    }

    // 5. Fetch Active Pricing Configuration
    const pricingConfig = await pricingService.getActivePricingConfiguration();

    // 6. Run Pure Calculation Engine
    const calculated = pricingEngine.calculateEstimate({
      deck,
      materials,
      services,
      compatibilityRules,
      pricingConfig,
    });

    calculatedDeckArea = calculated.deckArea;
    selectedMaterialsItems = calculated.materialsBreakdown.items;
    selectedServicesItems = calculated.servicesBreakdown.items;
    laborBreakdownData = calculated.laborBreakdown;
    additionalChargesData = calculated.additionalCharges;
    subtotalAmount = calculated.subtotal;
    minAdjustmentAmount = calculated.minimumAdjustment;
    minJobPriceVal = calculated.minimumJobPrice;
    preTaxAmount = calculated.preTaxTotal;
    taxPercentageVal = calculated.taxPercentage;
    taxAmountVal = calculated.taxAmount;
    totalAmountVal = calculated.totalAmount;
    pricingSnapshotData = {
      ...calculated.pricingSnapshot,
      spec: {
        woodSpecies: data.woodSpecies || deck.surfaceDetails?.woodSpecies || deck.surfaceDetails?.material || 'pt_pine',
        accessType: data.accessType || deck.structureDetails?.height || 'ground',
        exactHeightFt: data.exactHeightFt || deck.structureDetails?.exactHeightFt || null,
        deckShape: deck.deckShape || data.deckShape || data.shape || 'rectangle',
        length: deck.dimensions?.length || data.length || 20,
        width: deck.dimensions?.width || data.width || 15,
        floorArea: calculatedDeckArea,
        existingCoating: data.coatingType || deck.surfaceDetails?.coatingStatus || 'none',
        services: Array.isArray(data.services) && data.services.length > 0 ? data.services : ['cleaning', 'sealing'],
        stainType: data.stainType || 'semi',
        conditions: data.conditionFlags || data.conditions || deck.visibleConditions || ['good_condition'],
        components: deck.structureDetails?.components || data.components || [],
        componentSqft: {
          railings: data.railingSqft || deck.railingDetails?.totalLength || 0,
          stairs: data.stairSteps || data.stairCount || 0,
          pergola: data.pergolaSqft || 0,
          privacy_wall: data.privacyWallSqft || 0,
          siding: data.sidingSqft || 0,
          fascia: data.fasciaSqft || 0,
          joists: data.joistsSqft || 0,
        },
      },
    };
    warningsList = calculated.warnings || [];
  }

  // 7. Structure Location & Deck Details for Snapshot
  const deckLocation = deck.propertyAddress || deck.propertyLocation || {};
  const deckDetails = {
    deckId: deck._id,
    projectName: deck.projectName || 'Deck Project',
    areaSqFt: calculatedDeckArea,
    deckArea: calculatedDeckArea,
    deckLength: deck.dimensions?.length || null,
    deckWidth: deck.dimensions?.width || null,
    deckShape: deck.deckShape || 'rectangle',
    surfaceMaterial: data.woodSpecies || deck.surfaceDetails?.woodSpecies || deck.surfaceDetails?.material || deck.surfaceMaterial || 'wood',
    deckCondition: data.coatingType || deck.surfaceDetails?.coatingStatus || (deck.visibleConditions && deck.visibleConditions[0]) || 'fair',
    deckType: data.accessType || deck.structureDetails?.height || (deck.structureDetails?.isAttached ? 'attached' : 'detached'),
    location: {
      street: deckLocation.street || '',
      city: deckLocation.city || '',
      state: deckLocation.state || '',
      zipCode: deckLocation.zipCode || '',
      country: deckLocation.country || 'USA',
    },
    components: deck.structureDetails?.components || data.components || [],
    services: Array.isArray(data.services) ? data.services : ['cleaning', 'sealing'],
    visibleConditions: deck.visibleConditions || data.conditionFlags || [],
  };

  const estimateType = user.role === ROLES.CONTRACTOR ? 'CONTRACTOR' : 'CUSTOMER';
  const estimateNumber = generateEstimateNumber();

  // Apply Contractor Discount if role is Contractor
  let discountBreakdown = { applied: false, discountPercentage: 0, discountAmount: 0, originalTotal: totalAmountVal };
  if (user.role === ROLES.CONTRACTOR) {
    let appliedDiscount = Number(data.contractorDiscountPercent) || 10;
    try {
      const assignment = await DiscountAssignment.findOne({
        contractorId: user.id || user._id,
        status: 'active',
      }).populate('discountPolicyId');
      if (assignment && assignment.discountPolicyId && typeof assignment.discountPolicyId.discountValue === 'number') {
        appliedDiscount = assignment.discountPolicyId.discountValue;
      } else {
        const defaultPol = await DiscountPolicy.findOne({ code: 'CONTRACTOR_DEFAULT_10' });
        if (defaultPol && typeof defaultPol.discountValue === 'number') {
          appliedDiscount = defaultPol.discountValue;
        }
      }
    } catch (err) {
      console.warn('[Estimate Discount Warning]:', err.message);
    }

    const shouldApplyDiscount = data.applyContractorDiscount !== false && data.applyDiscount !== false;
    const originalPreDiscountTotal = totalAmountVal;

    if (shouldApplyDiscount) {
      const discountAmount = pricingEngine.round2((originalPreDiscountTotal * appliedDiscount) / 100);
      const discountedTotal = pricingEngine.round2(originalPreDiscountTotal - discountAmount);

      discountBreakdown = {
        applied: true,
        discountPercentage: appliedDiscount,
        discountAmount,
        discountedSubtotal: discountedTotal,
        originalTotal: originalPreDiscountTotal,
      };
      totalAmountVal = discountedTotal;
    } else {
      discountBreakdown = {
        applied: false,
        discountPercentage: appliedDiscount,
        discountAmount: 0,
        discountedSubtotal: originalPreDiscountTotal,
        originalTotal: originalPreDiscountTotal,
      };
      totalAmountVal = originalPreDiscountTotal;
    }

    pricingSnapshotData = {
      ...pricingSnapshotData,
      originalTotal: discountBreakdown.originalTotal,
      discountedTotal: totalAmountVal,
      calculatedTotal: totalAmountVal,
      total: totalAmountVal,
      discountBreakdown,
    };
  }

  // 8. Persist Estimate
  const estimate = await Estimate.create({
    estimateNumber,
    estimateName: estimateName || `${deck.projectName || 'Deck'} Estimate`,
    estimateType,
    deckId: deck._id,
    ownerId: deck.ownerId,
    createdBy: user.id || user._id,
    createdFor: deck.ownerId,
    deckDetails,
    selectedMaterials: selectedMaterialsItems,
    selectedServices: selectedServicesItems,
    laborBreakdown: laborBreakdownData,
    additionalCharges: additionalChargesData,
    subtotal: subtotalAmount,
    minimumAdjustment: minAdjustmentAmount,
    minimumJobPrice: minJobPriceVal,
    preTaxTotal: preTaxAmount,
    taxPercentage: taxPercentageVal,
    taxAmount: taxAmountVal,
    totalAmount: totalAmountVal,
    discountBreakdown,
    pricingSnapshot: pricingSnapshotData,
    estimateStatus: data.estimateStatus ? data.estimateStatus.toUpperCase() : 'CREATED',
    version: 1,
    warnings: warningsList,
    notes,
  });

  await recordAuditLog({
    performedBy: user.id || user._id,
    action: 'CREATE_ESTIMATE',
    entityId: estimate._id,
    newValue: estimate.toJSON(),
    ipAddress,
  });

  return estimate.toJSON();
}

async function getEstimates(query = {}, user) {
  const { page = 1, limit = 10, deckId, status } = query;
  const filter = {};

  if (deckId) filter.deckId = deckId;
  if (status) filter.estimateStatus = status.toUpperCase();

  // Access isolation
  if (user.role === ROLES.CUSTOMER) {
    filter.ownerId = user.id || user._id;
  } else if (user.role === ROLES.CONTRACTOR) {
    filter.$or = [
      { createdBy: user.id || user._id },
      { ownerId: user.id || user._id },
    ];
  }

  const skip = (Math.max(1, Number(page)) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    Estimate.find(filter)
      .populate('deckId')
      .populate('createdBy', 'fullName email role')
      .populate('ownerId', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Estimate.countDocuments(filter),
  ]);

  return {
    estimates: items.map((e) => e.toJSON()),
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
}

async function getEstimateById(id, user) {
  const estimate = await Estimate.findById(id)
    .populate('deckId')
    .populate('createdBy', 'fullName email role')
    .populate('ownerId', 'fullName email');

  if (!estimate) {
    throw new NotFoundError('Estimate not found.');
  }

  assertEstimateAccess(estimate, user);

  return estimate.toJSON();
}

async function recalculateEstimate(id, updateData = {}, user, ipAddress) {
  const estimate = await Estimate.findById(id);
  if (!estimate) {
    throw new NotFoundError('Estimate not found.');
  }

  assertEstimateAccess(estimate, user);

  // Snapshot current state for historical revision preservation
  const previousSnapshot = estimate.toJSON();

  // 1. Resolve Deck
  const deck = await Deck.findById(estimate.deckId);
  if (!deck) {
    throw new NotFoundError('Referenced deck project not found.');
  }

  // 2. Resolve Materials
  let materialIds = updateData.materialIds;
  if (!materialIds) {
    materialIds = (estimate.selectedMaterials || []).map((m) => m.materialId).filter(Boolean);
  }

  const materials = await Material.find({
    _id: { $in: materialIds },
    status: 'active',
  });

  // 3. Resolve Services
  let serviceIds = updateData.serviceIds;
  if (!serviceIds) {
    serviceIds = (estimate.selectedServices || []).map((s) => s.serviceId).filter(Boolean);
  }

  const services = await Service.find({
    _id: { $in: serviceIds },
    status: 'active',
  });

  // 4. Resolve Compatibility
  let compatibilityRules = [];
  if (materials.length > 0 && services.length > 0) {
    compatibilityRules = await MaterialServiceCompatibility.find({
      materialId: { $in: materials.map((m) => m._id) },
      serviceId: { $in: services.map((s) => s._id) },
    });
  }

  // 5. Active Pricing Configuration
  const pricingConfig = await pricingService.getActivePricingConfiguration();

  // 6. Recalculate
  const calculated = pricingEngine.calculateEstimate({
    deck,
    materials,
    services,
    compatibilityRules,
    pricingConfig,
  });

  // 7. Save Revision History (archives the previous version)
  await EstimateRevision.create({
    estimateId: estimate._id,
    version: estimate.version || 1,
    revisionReason: updateData.revisionReason || 'Project recalculation with updated parameters',
    previousSnapshot,
    revisedSnapshot: calculated,
    totalAmount: previousSnapshot.totalAmount,
    revisedBy: user.id || user._id,
  });

  // 8. Update Estimate Document
  estimate.selectedMaterials = calculated.materialsBreakdown.items;
  estimate.selectedServices = calculated.servicesBreakdown.items;
  estimate.laborBreakdown = calculated.laborBreakdown;
  estimate.additionalCharges = calculated.additionalCharges;
  estimate.subtotal = calculated.subtotal;
  estimate.minimumAdjustment = calculated.minimumAdjustment;
  estimate.minimumJobPrice = calculated.minimumJobPrice;
  estimate.preTaxTotal = calculated.preTaxTotal;
  estimate.taxPercentage = calculated.taxPercentage;
  estimate.taxAmount = calculated.taxAmount;
  estimate.totalAmount = calculated.totalAmount;
  estimate.pricingSnapshot = calculated.pricingSnapshot;
  estimate.warnings = calculated.warnings || [];
  estimate.version = (estimate.version || 1) + 1;
  if (updateData.notes) estimate.notes = updateData.notes;

  await estimate.save();

  await recordAuditLog({
    performedBy: user.id || user._id,
    action: 'RECALCULATE_ESTIMATE',
    entityId: estimate._id,
    oldValue: previousSnapshot,
    newValue: estimate.toJSON(),
    ipAddress,
  });

  return estimate.toJSON();
}

async function getEstimateHistory(id, user) {
  const estimate = await Estimate.findById(id);
  if (!estimate) {
    throw new NotFoundError('Estimate not found.');
  }

  assertEstimateAccess(estimate, user);

  const revisions = await EstimateRevision.find({ estimateId: id })
    .populate('revisedBy', 'fullName email')
    .sort({ version: -1, createdAt: -1 });

  return {
    estimateId: id,
    currentVersion: estimate.version || 1,
    revisions: revisions.map((r) => r.toJSON()),
  };
}

async function updateEstimateStatus(id, newStatus, notes, user, ipAddress) {
  const estimate = await Estimate.findById(id);
  if (!estimate) {
    throw new NotFoundError('Estimate not found.');
  }

  assertEstimateAccess(estimate, user);

  const oldValues = estimate.toJSON();
  estimate.estimateStatus = newStatus.toUpperCase();
  if (notes) estimate.notes = notes;

  await estimate.save();

  await recordAuditLog({
    performedBy: user.id || user._id,
    action: 'UPDATE_ESTIMATE_STATUS',
    entityId: estimate._id,
    oldValue: oldValues,
    newValue: estimate.toJSON(),
    ipAddress,
  });

  return estimate.toJSON();
}

async function deleteEstimate(id, user, ipAddress) {
  const estimate = await Estimate.findById(id);
  if (!estimate) {
    throw new NotFoundError('Estimate not found.');
  }

  assertEstimateAccess(estimate, user);

  const oldValues = estimate.toJSON();
  await Estimate.findByIdAndDelete(id);

  if (estimate.deckId) {
    const otherCount = await Estimate.countDocuments({ deckId: estimate.deckId });
    if (otherCount === 0) {
      try {
        const Deck = require('../decks/deck.model');
        await Deck.findByIdAndDelete(estimate.deckId);
      } catch (err) {
        // Deck already removed
      }
    }
  }

  await recordAuditLog({
    performedBy: user.id || user._id,
    action: 'DELETE_ESTIMATE',
    entityId: estimate._id,
    oldValue: oldValues,
    newValue: null,
    ipAddress,
  });

  return { id, message: 'Estimate deleted successfully.' };
}

async function updateEstimate(id, payload = {}, user, ipAddress) {
  const estimate = await Estimate.findById(id);
  if (!estimate) {
    throw new NotFoundError('Estimate not found.');
  }

  assertEstimateAccess(estimate, user);

  const oldValues = estimate.toJSON();

  const floorVal = Number(payload.floorArea || estimate.deckDetails?.areaSqFt || 400);
  const activePricing = await PricingConfiguration.findOne({ isActive: true });
  const customCfg = activePricing?.restorationPricing || null;
  const clientCalc = pricingEngine.calculateRestorationEstimate({
    deckArea: floorVal,
    woodSpecies: payload.woodSpecies || estimate.deckDetails?.surfaceMaterial || 'pressure_treated_pine',
    accessType: payload.accessType || estimate.deckDetails?.deckType || 'first',
    exactHeightFt: payload.exactHeightFt ? Number(payload.exactHeightFt) : undefined,
    coatingType: payload.coatingType || payload.stainType || 'semi',
    stainType: payload.stainType || 'semi',
    sandingType: payload.sandingType || 'mechanical_sanding',
    conditionFlags: payload.conditionFlags || payload.damageConditions || [],
    services: Array.isArray(payload.services) && payload.services.length > 0 ? payload.services : ['cleaning', 'sealing'],
    railingSqft: Number(payload.railingSqft || 0),
    stairSteps: Number(payload.stairSteps || 0),
    pergolaSqft: Number(payload.pergolaSqft || 0),
    privacyWallSqft: Number(payload.privacyWallSqft || 0),
    sidingSqft: Number(payload.sidingSqft || 0),
    fasciaSqft: Number(payload.fasciaSqft || 0),
    joistsSqft: Number(payload.joistsSqft || 0),
  }, customCfg);

  if (payload.estimateName) estimate.estimateName = payload.estimateName;
  if (payload.notes !== undefined) estimate.notes = payload.notes;

  const specData = {
    woodSpecies: payload.woodSpecies || estimate.deckDetails?.surfaceMaterial || 'pt_pine',
    accessType: payload.accessType || estimate.deckDetails?.deckType || 'ground',
    exactHeightFt: payload.exactHeightFt || null,
    deckShape: payload.deckShape || payload.shape || estimate.deckDetails?.deckShape || 'rectangle',
    length: Number(payload.length || payload.deckLength || estimate.deckDetails?.deckLength || 20),
    width: Number(payload.width || payload.deckWidth || estimate.deckDetails?.deckWidth || 15),
    floorArea: floorVal,
    existingCoating: payload.coatingType || payload.existingCoating || estimate.deckDetails?.deckCondition || 'none',
    services: Array.isArray(payload.services) && payload.services.length > 0 ? payload.services : ['cleaning', 'sealing'],
    stainType: payload.stainType || 'semi',
    conditions: payload.conditionFlags || payload.damageConditions || estimate.deckDetails?.visibleConditions || ['good_condition'],
    components: payload.components || estimate.deckDetails?.components || [],
    componentSqft: {
      railings: Number(payload.railingSqft || 0),
      stairs: Number(payload.stairSteps || 0),
      pergola: Number(payload.pergolaSqft || 0),
      privacy_wall: Number(payload.privacyWallSqft || 0),
      siding: Number(payload.sidingSqft || 0),
      fascia: Number(payload.fasciaSqft || 0),
      joists: Number(payload.joistsSqft || 0),
    },
  };

  estimate.deckDetails = {
    ...estimate.deckDetails,
    areaSqFt: floorVal,
    deckLength: specData.length,
    deckWidth: specData.width,
    deckShape: specData.deckShape,
    surfaceMaterial: specData.woodSpecies,
    deckCondition: specData.existingCoating,
    deckType: specData.accessType,
    components: specData.components,
    services: specData.services,
    visibleConditions: specData.conditions,
  };

  const applyMinJob = payload.applyMinJobPrice !== undefined
    ? Boolean(payload.applyMinJobPrice)
    : Boolean(estimate.pricingSnapshot?.applyMinJobPrice);

  const pureCalculated = clientCalc.calculatedTotal || clientCalc.rawSubtotal || clientCalc.total || 2500;
  const minJobThreshold = clientCalc.minJob || 2500;
  const floorAmount = clientCalc.floorTotal || Math.max(pureCalculated, minJobThreshold);
  const chosenBase = applyMinJob ? floorAmount : pureCalculated;

  let totalAmountVal = chosenBase;
  if (user.role === ROLES.CONTRACTOR) {
    let appliedDiscount = Number(payload.contractorDiscountPercent) || 10;
    try {
      const assignment = await DiscountAssignment.findOne({
        contractorId: user.id || user._id,
        status: 'active',
      }).populate('discountPolicyId');
      if (assignment && assignment.discountPolicyId && typeof assignment.discountPolicyId.discountValue === 'number') {
        appliedDiscount = assignment.discountPolicyId.discountValue;
      } else {
        const defaultPol = await DiscountPolicy.findOne({ code: 'CONTRACTOR_DEFAULT_10' });
        if (defaultPol && typeof defaultPol.discountValue === 'number') {
          appliedDiscount = defaultPol.discountValue;
        }
      }
    } catch (err) {
      console.warn('[Estimate Discount Warning]:', err.message);
    }

    const shouldApplyDiscount = payload.applyContractorDiscount !== false && payload.applyDiscount !== false;
    const baseTotal = totalAmountVal;

    if (shouldApplyDiscount) {
      const discountAmount = pricingEngine.round2((baseTotal * appliedDiscount) / 100);
      const discountedTotal = pricingEngine.round2(baseTotal - discountAmount);
      estimate.discountBreakdown = {
        applied: true,
        discountPercentage: appliedDiscount,
        discountAmount,
        discountedSubtotal: discountedTotal,
        originalTotal: baseTotal,
      };
      totalAmountVal = discountedTotal;
    } else {
      estimate.discountBreakdown = {
        applied: false,
        discountPercentage: appliedDiscount,
        discountAmount: 0,
        discountedSubtotal: baseTotal,
        originalTotal: baseTotal,
      };
      totalAmountVal = baseTotal;
    }
  }

  estimate.pricingSnapshot = {
    ...clientCalc,
    spec: specData,
    applyMinJobPrice: applyMinJob,
    originalTotal: estimate.discountBreakdown?.originalTotal || chosenBase,
    discountedTotal: totalAmountVal,
    calculatedTotal: pureCalculated,
    floorTotal: floorAmount,
    total: totalAmountVal,
    discountBreakdown: estimate.discountBreakdown,
  };
  estimate.totalAmount = totalAmountVal;
  estimate.subtotal = pureCalculated;
  estimate.minimumAdjustment = applyMinJob && clientCalc.minJobApplied ? (minJobThreshold - pureCalculated) : 0;
  estimate.minimumJobPrice = minJobThreshold;
  estimate.version = (estimate.version || 1) + 1;

  await estimate.save();

  // Keep underlying Deck in sync if present
  if (estimate.deckId) {
    try {
      await Deck.findByIdAndUpdate(estimate.deckId, {
        $set: {
          projectName: payload.estimateName || estimate.estimateName,
          'dimensions.length': specData.length,
          'dimensions.width': specData.width,
          'dimensions.area': floorVal,
          deckShape: specData.deckShape,
          'structureDetails.height': specData.accessType,
          'structureDetails.components': specData.components,
          'surfaceDetails.woodSpecies': specData.woodSpecies,
          'surfaceDetails.coatingStatus': specData.existingCoating,
          visibleConditions: specData.conditions,
        },
      });
    } catch (deckSyncErr) {
      console.warn('[Deck Sync Warning]:', deckSyncErr.message);
    }
  }

  await recordAuditLog({
    performedBy: user.id || user._id,
    action: 'UPDATE_ESTIMATE',
    entityId: estimate._id,
    oldValue: oldValues,
    newValue: estimate.toJSON(),
    ipAddress,
  });

  return estimate.toJSON();
}

async function requestProjectEstimate(estimateId, body, user, ipAddress) {
  const estimate = await Estimate.findById(estimateId);
  if (!estimate) {
    throw new NotFoundError('Estimate not found.');
  }

  // 1. Update estimate status to REQUESTED
  estimate.estimateStatus = 'REQUESTED';
  estimate.customerFacingStatus = {
    status: 'REQUESTED',
    note: body.message || 'User requested booking and reach-out for this estimation.',
    updatedAt: new Date(),
  };
  await estimate.save();

  // 2. Create or sync a Hot Priority Lead
  const isContractor = user.role === ROLES.CONTRACTOR;
  const leadNum = `LD-${estimate.estimateReference || Date.now().toString().slice(-4)}`;

  let lead = await Lead.findOne({ estimateId: estimate._id });
  if (!lead) {
    lead = new Lead({
      leadNumber: leadNum,
      customerId: !isContractor ? user._id : null,
      contractorId: isContractor ? user._id : null,
      deckId: estimate.deckId,
      estimateId: estimate._id,
      leadSource: isContractor ? 'contractor_portal' : 'customer_estimator',
      priority: 'HOT',
      status: 'new',
      enquiry: {
        subject: body.subject || `Project Service Request (${estimate.deckDetails?.projectName || 'Deck Project'})`,
        message: body.message || `User requested booking / reach-out for estimation ${estimate.estimateReference || ''} ($${estimate.totalAmount || 0})`,
        preferredContactMethod: body.preferredContactMethod || 'any',
        preferredContactTime: body.preferredContactTime || 'any',
      },
      customerSnapshot: {
        name: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
      },
      contractorSnapshot: isContractor ? {
        name: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
      } : {},
      deckSnapshot: {
        projectName: estimate.deckDetails?.projectName || 'Project Deck',
        city: estimate.deckDetails?.city || '',
        state: estimate.deckDetails?.state || '',
        area: estimate.deckDetails?.areaSqFt || estimate.deckDetails?.area || 0,
        surfaceMaterial: estimate.deckDetails?.woodSpecies || estimate.deckDetails?.surfaceMaterial || '',
      },
      estimateSnapshot: {
        estimateId: estimate._id,
        estimateReference: estimate.estimateReference || '',
        totalAmount: estimate.totalAmount || 0,
      },
      latestContactDate: new Date(),
    });
    await lead.save();
  } else {
    lead.priority = 'HOT';
    lead.status = 'new';
    lead.latestContactDate = new Date();
    if (body.message) {
      lead.enquiry = lead.enquiry || {};
      lead.enquiry.message = body.message;
    }
    await lead.save();
  }

  // 3. Create or update Project record
  let project = await Project.findOne({ estimateId: estimate._id });
  if (!project) {
    project = new Project({
      projectId: estimate.estimateReference || `PRJ-${estimate._id.toString().slice(-6).toUpperCase()}`,
      projectName: estimate.deckDetails?.projectName || 'Deck Restoration Project',
      customerId: !isContractor ? user._id : estimate.userId,
      contractorId: isContractor ? user._id : null,
      deckId: estimate.deckId,
      estimateId: estimate._id,
      status: 'pending',
      progress: 30,
      notes: body.message || 'User booked estimation request',
    });
    await project.save();
  } else {
    project.status = 'pending';
    project.progress = 30;
    await project.save();
  }

  // 4. Audit Log
  await recordAuditLog({
    performedBy: user.id || user._id,
    action: 'REQUEST_ESTIMATE_PROJECT',
    entityId: estimate._id,
    newValue: { estimateStatus: 'REQUESTED', leadId: lead._id, projectId: project._id },
    ipAddress,
  });

  return {
    estimate: estimate.toJSON(),
    lead: lead.toJSON(),
    project: project.toJSON(),
  };
}

module.exports = {
  createEstimate,
  getEstimates,
  getEstimateById,
  recalculateEstimate,
  getEstimateHistory,
  updateEstimateStatus,
  deleteEstimate,
  updateEstimate,
  requestProjectEstimate,
};
