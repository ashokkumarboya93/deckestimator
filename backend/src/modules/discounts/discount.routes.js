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

// --- Contractor Discount Requests ---
router.post(
  '/requests',
  authenticate,
  authorize(ROLES.CONTRACTOR, ROLES.ADMIN),
  discountController.submitDiscountRequest
);

router.get(
  '/requests/me',
  authenticate,
  authorize(ROLES.CONTRACTOR, ROLES.ADMIN),
  discountController.getMyDiscountRequests
);

// --- Admin Discount Requests Management (Verification Progress Tab 5) ---
router.get(
  '/admin/requests',
  authenticate,
  authorize(ROLES.ADMIN),
  discountController.getAdminDiscountRequests
);

router.post(
  '/admin/requests/:id/approve',
  authenticate,
  authorize(ROLES.ADMIN),
  discountController.approveDiscountRequest
);

router.post(
  '/admin/requests/:id/reject',
  authenticate,
  authorize(ROLES.ADMIN),
  discountController.rejectDiscountRequest
);

router.post(
  '/admin/requests/bulk-delete',
  authenticate,
  authorize(ROLES.ADMIN),
  discountController.bulkDeleteDiscountRequests
);

router.delete(
  '/admin/requests/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  discountController.deleteDiscountRequest
);

router.post(
  '/admin/requests/:id/reply',
  authenticate,
  authorize(ROLES.ADMIN),
  discountController.replyDiscountRequest
);

module.exports = router;
