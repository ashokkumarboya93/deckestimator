// =============================================
// Deck Estimator — Pricing Configuration Service
// =============================================

const PricingConfiguration = require('./pricingConfiguration.model');
const AuditLog = require('../../shared/models/auditLog.model');
const { NotFoundError } = require('../../shared/errors');

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
      entityType: 'PRICING',
      entityId,
      oldValue,
      newValue,
      ipAddress,
    });
  } catch (err) {
    console.error('[AuditLog] Warning: Failed to record pricing audit log:', err.message);
  }
}

async function createPricingConfiguration(data, user, ipAddress) {
  // If activating this configuration, optionally deactivate older active ones
  if (data.isActive) {
    await PricingConfiguration.updateMany(
      { isActive: true },
      { $set: { isActive: false, effectiveUntil: new Date() } }
    );
  }

  const config = await PricingConfiguration.create({
    ...data,
    createdBy: user.id || user._id,
    updatedBy: user.id || user._id,
  });

  await recordAuditLog({
    performedBy: user.id || user._id,
    action: 'CREATE_PRICING',
    entityId: config._id,
    newValue: config.toJSON(),
    ipAddress,
  });

  return config.toJSON();
}

async function getPricingConfigurations(query = {}, user = null) {
  const { page = 1, limit = 20, isActive } = query;
  const filter = {};

  if (isActive !== undefined && isActive !== '') {
    filter.isActive = isActive === 'true' || isActive === true;
  }

  const skip = (Math.max(1, Number(page)) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    PricingConfiguration.find(filter)
      .populate('createdBy', 'fullName email')
      .sort({ effectiveFrom: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    PricingConfiguration.countDocuments(filter),
  ]);

  return {
    configurations: items.map((c) => c.toJSON()),
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
}

async function getPricingConfigurationById(id) {
  const config = await PricingConfiguration.findById(id).populate('createdBy', 'fullName email');
  if (!config) {
    throw new NotFoundError('Pricing configuration not found.');
  }
  return config.toJSON();
}

async function getActivePricingConfiguration() {
  const config = await PricingConfiguration.findOne({ isActive: true })
    .sort({ effectiveFrom: -1, createdAt: -1 });

  if (config) {
    return config.toJSON();
  }

  // Fallback to standard baseline if no configuration is yet created
  return {
    minimumJobPrice: 0,
    basePricePerSqFt: 0.5,
    additionalCoatingPrice: 0,
    travelCharge: 0,
    laborRate: 0,
    wastePercentage: 10,
    taxPercentage: 0,
    taxName: 'Sales Tax',
    isActive: true,
  };
}

async function updatePricingConfiguration(id, data, user, ipAddress) {
  const config = await PricingConfiguration.findById(id);
  if (!config) {
    throw new NotFoundError('Pricing configuration not found.');
  }

  const oldValues = config.toJSON();

  // If changing to active, deactivate others
  if (data.isActive === true && !config.isActive) {
    await PricingConfiguration.updateMany(
      { _id: { $ne: id }, isActive: true },
      { $set: { isActive: false, effectiveUntil: new Date() } }
    );
  }

  Object.assign(config, data, { updatedBy: user.id || user._id });
  await config.save();

  await recordAuditLog({
    performedBy: user.id || user._id,
    action: 'UPDATE_PRICING',
    entityId: config._id,
    oldValue: oldValues,
    newValue: config.toJSON(),
    ipAddress,
  });

  return config.toJSON();
}

async function togglePricingConfigurationStatus(id, isActive, user, ipAddress) {
  return updatePricingConfiguration(id, { isActive }, user, ipAddress);
}

module.exports = {
  createPricingConfiguration,
  getPricingConfigurations,
  getPricingConfigurationById,
  getActivePricingConfiguration,
  updatePricingConfiguration,
  togglePricingConfigurationStatus,
};

