// =============================================
// Deck Estimator — Estimate Routes
// =============================================

const express = require('express');
const { authenticate } = require('../../middleware/authenticate');
const { authorize, requireApprovedContractor } = require('../../middleware/authorize');
const { validate } = require('../../middleware/validate');
const { ROLES } = require('../../shared/constants');
const estimateController = require('./estimate.controller');
const {
  idParamSchema,
  createEstimateSchema,
  recalculateEstimateSchema,
  updateEstimateStatusSchema,
} = require('./estimate.validation');

const router = express.Router();

async function contractorCheck(req, res, next) {
  if (req.user && req.user.role === ROLES.CONTRACTOR) {
    return requireApprovedContractor(req, res, next);
  }
  next();
}

router.use(authenticate);
router.use(authorize(ROLES.CUSTOMER, ROLES.CONTRACTOR, ROLES.ADMIN));
router.use(contractorCheck);

// Estimate endpoints
router.post('/', validate(createEstimateSchema), estimateController.createEstimate);
router.get('/', estimateController.getEstimates);
router.get('/:id', validate(idParamSchema), estimateController.getEstimateById);
router.post('/:id/recalculate', validate(recalculateEstimateSchema), estimateController.recalculateEstimate);
router.get('/:id/history', validate(idParamSchema), estimateController.getEstimateHistory);
router.patch('/:id/status', validate(updateEstimateStatusSchema), estimateController.updateEstimateStatus);

module.exports = router;

