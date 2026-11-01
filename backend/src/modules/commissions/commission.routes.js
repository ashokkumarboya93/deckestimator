// =============================================
// Deck Estimator — Commission Routes (Phase 9)
// =============================================

const express = require('express');
const router = express.Router();
const commissionController = require('./commission.controller');
const {
  createCommissionPolicySchema,
  updateCommissionPolicySchema,
  generateCommissionSchema,
  reviewCommissionSchema,
  recordPaymentSchema,
} = require('./commission.validation');
const { authenticate } = require('../../middleware/authenticate');
const { authorize } = require('../../middleware/authorize');
const { validate } = require('../../middleware/validate');
const { ROLES } = require('../../shared/constants');

// --- Shared Contractor/Admin Commission Access ---
router.get(
  '/summary',
  authenticate,
  authorize(ROLES.CONTRACTOR, ROLES.ADMIN),
  commissionController.getSummary
);

router.get(
  '/',
  authenticate,
  authorize(ROLES.CONTRACTOR, ROLES.ADMIN),
  commissionController.getCommissions
);

router.get(
  '/:id',
  authenticate,
  authorize(ROLES.CONTRACTOR, ROLES.ADMIN),
  commissionController.getCommissionById
);

router.get(
  '/:id/history',
  authenticate,
  authorize(ROLES.CONTRACTOR, ROLES.ADMIN),
  commissionController.getHistory
);

// --- Admin Policy Management ---
router.post(
  '/admin/policies',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(createCommissionPolicySchema),
  commissionController.createPolicy
);

router.get(
  '/admin/policies',
  authenticate,
  authorize(ROLES.ADMIN),
  commissionController.getPolicies
);

router.get(
  '/admin/policies/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  commissionController.getPolicyById
);

router.patch(
  '/admin/policies/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(updateCommissionPolicySchema),
  commissionController.updatePolicy
);

// --- Admin Commission Workflow Operations ---
router.post(
  '/admin/generate',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(generateCommissionSchema),
  commissionController.generateCommission
);

router.post(
  '/admin/:id/review',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(reviewCommissionSchema),
  commissionController.reviewCommission
);

router.post(
  '/admin/:id/record-payment',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(recordPaymentSchema),
  commissionController.recordPayment
);

module.exports = router;
