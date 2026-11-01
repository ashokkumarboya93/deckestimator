// =============================================
// Deck Estimator — Contractor & Verification Routes (Phase 8)
// =============================================

const express = require('express');
const multer = require('multer');
const { authenticate } = require('../../middleware/authenticate');
const { authorize } = require('../../middleware/authorize');
const { validate } = require('../../middleware/validate');
const { ROLES } = require('../../shared/constants');
const contractorController = require('./contractor.controller');
const {
  updateProfileSchema,
  submitVerificationSchema,
  adminReviewVerificationSchema,
} = require('./contractor.validation');

const router = express.Router();

// Document upload config
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1,
  },
});

// All routes require authentication
router.use(authenticate);

// ----------------------------------------------------
// Contractor Self-Service Routes (Role: CONTRACTOR)
// ----------------------------------------------------
router.get(
  '/me',
  authorize(ROLES.CONTRACTOR),
  contractorController.getProfile
);

router.patch(
  '/me',
  authorize(ROLES.CONTRACTOR),
  validate(updateProfileSchema),
  contractorController.updateProfile
);

router.post(
  '/me/verification/submit',
  authorize(ROLES.CONTRACTOR),
  validate(submitVerificationSchema),
  contractorController.submitVerification
);

router.post(
  '/me/verification/documents',
  authorize(ROLES.CONTRACTOR),
  upload.single('document'),
  contractorController.uploadDocument
);

router.get(
  '/me/verification/documents',
  authorize(ROLES.CONTRACTOR),
  contractorController.getMyDocuments
);

// Secure Document Access (Contractor Owner or Admin)
router.get(
  '/documents/:documentId/file',
  authorize(ROLES.CONTRACTOR, ROLES.ADMIN),
  contractorController.downloadDocument
);

// Eligible contractors for lead matching (Admin or authorized estimating services)
router.get(
  '/eligible',
  authorize(ROLES.ADMIN),
  contractorController.getEligibleContractors
);

// ----------------------------------------------------
// Admin Contractor Verification APIs (Role: ADMIN)
// ----------------------------------------------------
router.get(
  '/admin/verifications',
  authorize(ROLES.ADMIN),
  contractorController.adminListContractors
);

router.get(
  '/admin/verifications/:id',
  authorize(ROLES.ADMIN),
  contractorController.adminGetContractorDetails
);

router.post(
  '/admin/verifications/:id/review',
  authorize(ROLES.ADMIN),
  validate(adminReviewVerificationSchema),
  contractorController.adminReviewContractor
);

module.exports = router;

