// =============================================
// Deck Estimator — Pricing Routes
// =============================================

const express = require('express');
const { authenticate } = require('../../middleware/authenticate');
const { authorize } = require('../../middleware/authorize');
const { validate } = require('../../middleware/validate');
const { ROLES } = require('../../shared/constants');
const pricingController = require('./pricing.controller');
const {
  idParamSchema,
  createPricingConfigurationSchema,
  updatePricingConfigurationSchema,
  togglePricingStatusSchema,
} = require('./pricing.validation');

const router = express.Router();

router.use(authenticate);

// Public read for active pricing configuration used in estimate creation
router.get('/configurations/active', pricingController.getActivePricingConfiguration);

// Admin-managed configurations
router.post(
  '/configurations',
  authorize(ROLES.ADMIN),
  validate(createPricingConfigurationSchema),
  pricingController.createPricingConfiguration
);

router.get(
  '/configurations',
  authorize(ROLES.ADMIN),
  pricingController.getPricingConfigurations
);

router.get(
  '/configurations/:id',
  authorize(ROLES.ADMIN),
  validate(idParamSchema),
  pricingController.getPricingConfigurationById
);

router.patch(
  '/configurations/:id',
  authorize(ROLES.ADMIN),
  validate(updatePricingConfigurationSchema),
  pricingController.updatePricingConfiguration
);

router.patch(
  '/configurations/:id/status',
  authorize(ROLES.ADMIN),
  validate(togglePricingStatusSchema),
  pricingController.togglePricingConfigurationStatus
);

module.exports = router;

