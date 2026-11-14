// =============================================
// Deck Estimator — Pricing Controller
// =============================================

const pricingService = require('./pricing.service');
const pricingEngine = require('./pricingEngine');

function getClientIp(req) {
  return req.ip || (req.connection && req.connection.remoteAddress) || null;
}

async function createPricingConfiguration(req, res, next) {
  try {
    const configuration = await pricingService.createPricingConfiguration(
      req.body,
      req.user,
      getClientIp(req)
    );
    res.status(201).json({
      success: true,
      data: { configuration },
    });
  } catch (error) {
    next(error);
  }
}

async function getPricingConfigurations(req, res, next) {
  try {
    const result = await pricingService.getPricingConfigurations(req.query, req.user);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function getPricingConfigurationById(req, res, next) {
  try {
    const configuration = await pricingService.getPricingConfigurationById(req.params.id);
    res.status(200).json({
      success: true,
      data: { configuration },
    });
  } catch (error) {
    next(error);
  }
}

async function getActivePricingConfiguration(req, res, next) {
  try {
    const configuration = await pricingService.getActivePricingConfiguration();
    res.status(200).json({
      success: true,
      data: { configuration },
    });
  } catch (error) {
    next(error);
  }
}

async function updatePricingConfiguration(req, res, next) {
  try {
    const configuration = await pricingService.updatePricingConfiguration(
      req.params.id,
      req.body,
      req.user,
      getClientIp(req)
    );
    res.status(200).json({
      success: true,
      data: { configuration },
    });
  } catch (error) {
    next(error);
  }
}

async function togglePricingConfigurationStatus(req, res, next) {
  try {
    const configuration = await pricingService.togglePricingConfigurationStatus(
      req.params.id,
      req.body.isActive,
      req.user,
      getClientIp(req)
    );
    res.status(200).json({
      success: true,
      data: { configuration },
    });
  } catch (error) {
    next(error);
  }
}

async function calculateClientPricingPreview(req, res, next) {
  try {
    const isContractor = Boolean(
      (req.user && ['contractor', 'admin', 'super_admin'].includes(req.user.role)) ||
      req.body.forContractor
    );
    const customCfg = await pricingService.getActiveRestorationPricing();
    const result = isContractor
      ? pricingEngine.calculateRestorationEstimate(req.body, customCfg)
      : pricingEngine.calculateClientPricing(req.body, customCfg);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createPricingConfiguration,
  getPricingConfigurations,
  getPricingConfigurationById,
  getActivePricingConfiguration,
  updatePricingConfiguration,
  togglePricingConfigurationStatus,
  calculateClientPricingPreview,
};

