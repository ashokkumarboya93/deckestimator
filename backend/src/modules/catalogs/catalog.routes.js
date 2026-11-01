// =============================================
// Deck Estimator — Catalog Routes
// =============================================

const express = require('express');
const { authenticate } = require('../../middleware/authenticate');
const { authorize } = require('../../middleware/authorize');
const { validate } = require('../../middleware/validate');
const { ROLES } = require('../../shared/constants');
const catalogController = require('./catalog.controller');
const {
  idParamSchema,
  createMaterialCategorySchema,
  updateMaterialCategorySchema,
  createMaterialSchema,
  updateMaterialSchema,
  createServiceCategorySchema,
  updateServiceCategorySchema,
  createServiceSchema,
  updateServiceSchema,
  createCompatibilitySchema,
  updateCompatibilitySchema,
  toggleStatusSchema,
} = require('./catalog.validation');

const router = express.Router();

// All catalog operations require authentication
router.use(authenticate);

// ---------------------------------------------
// 1. MATERIAL CATEGORIES
// ---------------------------------------------
router.post(
  '/material-categories',
  authorize(ROLES.ADMIN),
  validate(createMaterialCategorySchema),
  catalogController.createMaterialCategory
);

router.get(
  '/material-categories',
  catalogController.getMaterialCategories
);

router.get(
  '/material-categories/:id',
  validate(idParamSchema),
  catalogController.getMaterialCategoryById
);

router.patch(
  '/material-categories/:id',
  authorize(ROLES.ADMIN),
  validate(updateMaterialCategorySchema),
  catalogController.updateMaterialCategory
);

router.put(
  '/material-categories/:id',
  authorize(ROLES.ADMIN),
  validate(updateMaterialCategorySchema),
  catalogController.updateMaterialCategory
);

router.patch(
  '/material-categories/:id/status',
  authorize(ROLES.ADMIN),
  validate(toggleStatusSchema),
  catalogController.toggleMaterialCategoryStatus
);

// ---------------------------------------------
// 2. MATERIALS
// ---------------------------------------------
router.post(
  '/materials',
  authorize(ROLES.ADMIN),
  validate(createMaterialSchema),
  catalogController.createMaterial
);

router.get(
  '/materials',
  catalogController.getMaterials
);

router.get(
  '/materials/:id',
  validate(idParamSchema),
  catalogController.getMaterialById
);

router.patch(
  '/materials/:id',
  authorize(ROLES.ADMIN),
  validate(updateMaterialSchema),
  catalogController.updateMaterial
);

router.put(
  '/materials/:id',
  authorize(ROLES.ADMIN),
  validate(updateMaterialSchema),
  catalogController.updateMaterial
);

router.patch(
  '/materials/:id/status',
  authorize(ROLES.ADMIN),
  validate(toggleStatusSchema),
  catalogController.toggleMaterialStatus
);

// ---------------------------------------------
// 3. SERVICE CATEGORIES
// ---------------------------------------------
router.post(
  '/service-categories',
  authorize(ROLES.ADMIN),
  validate(createServiceCategorySchema),
  catalogController.createServiceCategory
);

router.get(
  '/service-categories',
  catalogController.getServiceCategories
);

router.get(
  '/service-categories/:id',
  validate(idParamSchema),
  catalogController.getServiceCategoryById
);

router.patch(
  '/service-categories/:id',
  authorize(ROLES.ADMIN),
  validate(updateServiceCategorySchema),
  catalogController.updateServiceCategory
);

router.put(
  '/service-categories/:id',
  authorize(ROLES.ADMIN),
  validate(updateServiceCategorySchema),
  catalogController.updateServiceCategory
);

router.patch(
  '/service-categories/:id/status',
  authorize(ROLES.ADMIN),
  validate(toggleStatusSchema),
  catalogController.toggleServiceCategoryStatus
);

// ---------------------------------------------
// 4. SERVICES
// ---------------------------------------------
router.post(
  '/services',
  authorize(ROLES.ADMIN),
  validate(createServiceSchema),
  catalogController.createService
);

router.get(
  '/services',
  catalogController.getServices
);

router.get(
  '/services/:id',
  validate(idParamSchema),
  catalogController.getServiceById
);

router.patch(
  '/services/:id',
  authorize(ROLES.ADMIN),
  validate(updateServiceSchema),
  catalogController.updateService
);

router.put(
  '/services/:id',
  authorize(ROLES.ADMIN),
  validate(updateServiceSchema),
  catalogController.updateService
);

router.patch(
  '/services/:id/status',
  authorize(ROLES.ADMIN),
  validate(toggleStatusSchema),
  catalogController.toggleServiceStatus
);

// ---------------------------------------------
// 5. MATERIAL-SERVICE COMPATIBILITY
// ---------------------------------------------
router.post(
  '/compatibilities',
  authorize(ROLES.ADMIN),
  validate(createCompatibilitySchema),
  catalogController.createCompatibility
);

router.get(
  '/compatibilities',
  catalogController.getCompatibilities
);

router.get(
  '/compatibilities/:id',
  validate(idParamSchema),
  catalogController.getCompatibilityById
);

router.patch(
  '/compatibilities/:id',
  authorize(ROLES.ADMIN),
  validate(updateCompatibilitySchema),
  catalogController.updateCompatibility
);

router.put(
  '/compatibilities/:id',
  authorize(ROLES.ADMIN),
  validate(updateCompatibilitySchema),
  catalogController.updateCompatibility
);

router.delete(
  '/compatibilities/:id',
  authorize(ROLES.ADMIN),
  validate(idParamSchema),
  catalogController.deleteCompatibility
);

module.exports = router;

