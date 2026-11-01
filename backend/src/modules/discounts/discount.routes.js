// =============================================
// Deck Estimator — Discount Routes (Phase 9)
// =============================================

const express = require('express');
const router = express.Router();
const discountController = require('./discount.controller');
const {
  createDiscountPolicySchema,
  updateDiscountPolicySchema,
  updateDiscountPolicyStatusSchema,
  assignDiscountSchema,
  applyDiscountSchema,
} = require('./discount.validation');
const { authenticate } = require('../../middleware/authenticate');
const { authorize } = require('../../middleware/authorize');
const { validate } = require('../../middleware/validate');
const { ROLES } = require('../../shared/constants');

// --- Contractor Discount Routes ---
router.get(
  '/contractor',
  authenticate,
  authorize(ROLES.CONTRACTOR, ROLES.ADMIN),
  discountController.getContractorDiscounts
);

// --- Estimate Discount Application ---
router.post(
  '/estimates/:estimateId/apply',
  authenticate,
  validate(applyDiscountSchema),
  discountController.applyDiscount
);

router.get(
  '/estimates/:estimateId/history',
  authenticate,
  discountController.getDiscountHistory
);

// --- Admin Discount Policy & Assignment Routes ---
router.post(
  '/admin/policies',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(createDiscountPolicySchema),
  discountController.createPolicy
);

router.get(
  '/admin/policies',
  authenticate,
  authorize(ROLES.ADMIN),
  discountController.getPolicies
);

router.get(
  '/admin/policies/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  discountController.getPolicyById
);

router.patch(
  '/admin/policies/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(updateDiscountPolicySchema),
  discountController.updatePolicy
);

router.patch(
  '/admin/policies/:id/status',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(updateDiscountPolicyStatusSchema),
  discountController.updatePolicyStatus
);

router.post(
  '/admin/assignments',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(assignDiscountSchema),
  discountController.assignDiscount
);

module.exports = router;
