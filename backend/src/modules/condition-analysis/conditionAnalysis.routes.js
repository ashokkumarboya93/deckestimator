// =============================================
// Deck Estimator — Condition Analysis Routes (Phase 7)
// =============================================

const express = require('express');
const { authenticate } = require('../../middleware/authenticate');
const { authorize, requireApprovedContractor } = require('../../middleware/authorize');
const { validate } = require('../../middleware/validate');
const { ROLES } = require('../../shared/constants');
const conditionAnalysisController = require('./conditionAnalysis.controller');
const {
  idParamSchema,
  deckIdParamSchema,
  createAnalysisSchema,
  updateReviewSchema,
} = require('./conditionAnalysis.validation');

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

// ML Service Health Check
router.get('/ml-health', conditionAnalysisController.checkMLHealth);

// Deck Analysis endpoints
router.post(
  '/decks/:deckId/analyses',
  validate(createAnalysisSchema),
  conditionAnalysisController.createAnalysis
);

router.get(
  '/decks/:deckId/analyses',
  validate(deckIdParamSchema),
  conditionAnalysisController.getDeckAnalyses
);

// Direct Analysis endpoints
router.get(
  '/:id',
  validate(idParamSchema),
  conditionAnalysisController.getAnalysisById
);

router.post(
  '/:id/retry',
  validate(idParamSchema),
  conditionAnalysisController.retryAnalysis
);

router.patch(
  '/:id/review',
  validate(updateReviewSchema),
  conditionAnalysisController.updateReview
);

module.exports = router;
