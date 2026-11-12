// =============================================
// Deck Estimator — Contractor & Verification Routes (Phase 8)
// =============================================

const express = require('express');
const multer = require('multer');
const { authenticate } = require('../../middleware/authenticate');
const { authorize } = require('../../middleware/authorize');
const { validate } = require('../../middleware/validate');
const { uploadLimiter } = require('../../middleware/rateLimiters');
const { BadRequestError } = require('../../shared/errors');
const { ROLES } = require('../../shared/constants');
const contractorController = require('./contractor.controller');
const {
  updateProfileSchema,
  submitVerificationSchema,
  adminReviewVerificationSchema,
} = require('./contractor.validation');

const router = express.Router();

const ALLOWED_DOCUMENT_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

// Document upload config
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_DOCUMENT_MIMES.has(file.mimetype)) {
      return cb(
        new BadRequestError(
          `Unsupported file type '${file.mimetype}'. Supported types: PDF, JPEG, PNG, WebP.`,
          'INVALID_FILE_TYPE'
        )
      );
    }
    return cb(null, true);
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
  uploadLimiter,
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

// Delete Document (Contractor Owner or Admin)
router.delete(
  '/documents/:documentId',
  authorize(ROLES.CONTRACTOR, ROLES.ADMIN),
  contractorController.deleteDocument
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

