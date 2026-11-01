// =============================================
// Deck Estimator — File & Deck Image Routes
// =============================================

const express = require('express');
const multer = require('multer');
const { authenticate } = require('../../middleware/authenticate');
const { authorize, requireApprovedContractor } = require('../../middleware/authorize');
const { validate } = require('../../middleware/validate');
const { uploadLimiter } = require('../../middleware/rateLimiters');
const { ROLES } = require('../../shared/constants');
const fileController = require('./file.controller');
const {
  MAX_FILE_SIZE,
  MAX_IMAGES_PER_DECK,
  ALLOWED_MIME_TYPES,
  deckIdParamSchema,
  deckImageParamsSchema,
  uploadImageMetadataSchema,
} = require('./file.validation');
const { BadRequestError } = require('../../shared/errors');

const router = express.Router({ mergeParams: true });

// Setup Multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_IMAGES_PER_DECK,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new BadRequestError(
          `Invalid file type "${file.mimetype}". Only JPEG, PNG, and WebP are accepted.`
        ),
        false
      );
    }
  },
});

// Wrapper to handle Multer errors gracefully
function handleUpload(req, res, next) {
  upload.array('images', MAX_IMAGES_PER_DECK)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new BadRequestError(`One or more files exceed the 10MB limit.`));
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return next(
          new BadRequestError(
            `Cannot upload more than ${MAX_IMAGES_PER_DECK} images at once.`
          )
        );
      }
      return next(new BadRequestError(`Upload error: ${err.message}`));
    }
    if (err) {
      return next(err);
    }
    next();
  });
}

// Role eligibility check
async function deckRoleCheck(req, res, next) {
  if (req.user && req.user.role === ROLES.CONTRACTOR) {
    return requireApprovedContractor(req, res, next);
  }
  next();
}

// All deck image routes require authentication & role eligibility
router.use(authenticate);
router.use(authorize(ROLES.CUSTOMER, ROLES.CONTRACTOR, ROLES.ADMIN));
router.use(deckRoleCheck);

// POST /api/v1/decks/:deckId/images - Upload deck images
router.post(
  '/',
  uploadLimiter,
  validate(deckIdParamSchema, 'params'),
  handleUpload,
  validate(uploadImageMetadataSchema, 'body'),
  fileController.uploadImages
);

// GET /api/v1/decks/:deckId/images - List deck images metadata
router.get(
  '/',
  validate(deckIdParamSchema, 'params'),
  fileController.getDeckImages
);

// GET /api/v1/decks/:deckId/images/:imageId - Stream authenticated image file
router.get(
  '/:imageId',
  validate(deckImageParamsSchema, 'params'),
  fileController.serveImage
);

// DELETE /api/v1/decks/:deckId/images/:imageId - Delete deck image
router.delete(
  '/:imageId',
  validate(deckImageParamsSchema, 'params'),
  fileController.deleteImage
);

module.exports = router;
