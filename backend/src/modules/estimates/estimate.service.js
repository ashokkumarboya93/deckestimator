// =============================================
// Deck Estimator — Estimate Service
// =============================================

const crypto = require('crypto');
const Estimate = require('./estimate.model');
const EstimateRevision = require('./estimateRevision.model');
const Deck = require('../decks/deck.model');
const Material = require('../catalogs/material.model');
const Service = require('../catalogs/service.model');
const MaterialServiceCompatibility = require('../catalogs/materialServiceCompatibility.model');
const pricingService = require('../pricing/pricing.service');
const pricingEngine = require('../pricing/pricingEngine');
const AuditLog = require('../../shared/models/auditLog.model');
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
  const { deckId, estimateName, materialIds = [], serviceIds = [], notes = '' } = data;

  // 1. Fetch & Validate Deck
  const deck = await Deck.findById(deckId);
  if (!deck) {
    throw new NotFoundError('Referenced deck project not found.');
  }
  assertDeckAccess(deck, user);

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

  // 7. Structure Location & Deck Details for Snapshot
  const deckLocation = deck.propertyAddress || deck.propertyLocation || {};
  const deckDetails = {
    deckId: deck._id,
    projectName: deck.projectName || 'Deck Project',
    areaSqFt: calculated.deckArea,
    deckLength: deck.dimensions?.length || null,
    deckWidth: deck.dimensions?.width || null,
    deckShape: deck.deckShape || 'rectangle',
    surfaceMaterial: deck.surfaceDetails?.material || deck.surfaceMaterial || 'wood',
    deckCondition: (deck.visibleConditions && deck.visibleConditions[0]) || 'fair',
    deckType: deck.structureDetails?.isAttached ? 'attached' : 'detached',
    location: {
      street: deckLocation.street || '',
      city: deckLocation.city || '',
      state: deckLocation.state || '',
      zipCode: deckLocation.zipCode || '',
      country: deckLocation.country || 'USA',
    },
  };

  const estimateType = user.role === ROLES.CONTRACTOR ? 'CONTRACTOR' : 'CUSTOMER';
  const estimateNumber = generateEstimateNumber();

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
    selectedMaterials: calculated.materialsBreakdown.items,
    selectedServices: calculated.servicesBreakdown.items,
    laborBreakdown: calculated.laborBreakdown,
    additionalCharges: calculated.additionalCharges,
    subtotal: calculated.subtotal,
    minimumAdjustment: calculated.minimumAdjustment,
    minimumJobPrice: calculated.minimumJobPrice,
    preTaxTotal: calculated.preTaxTotal,
    taxPercentage: calculated.taxPercentage,
    taxAmount: calculated.taxAmount,
    totalAmount: calculated.totalAmount,
    pricingSnapshot: calculated.pricingSnapshot,
    estimateStatus: 'DRAFT',
    version: 1,
    warnings: calculated.warnings || [],
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
      .populate('deckId', 'projectName dimensions deckArea surfaceMaterial')
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
    .populate('deckId', 'projectName dimensions deckArea surfaceMaterial propertyLocation')
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
    materialIds = (estimate.selectedMaterials || []).map((m) => m.materialId);
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

module.exports = {
  createEstimate,
  getEstimates,
  getEstimateById,
  recalculateEstimate,
  getEstimateHistory,
  updateEstimateStatus,
};
