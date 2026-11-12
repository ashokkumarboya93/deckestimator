// =============================================
// Deck Estimator — Admin Management Routes
// =============================================

const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const adminController = require('./admin.controller');
const { authenticate } = require('../../middleware/authenticate');
const { authorize } = require('../../middleware/authorize');
const { uploadLimiter } = require('../../middleware/rateLimiters');
const { BadRequestError } = require('../../shared/errors');
const { ROLES } = require('../../shared/constants');

const catalogUploadDir = path.join(__dirname, '../../../uploads/catalog');
if (!fs.existsSync(catalogUploadDir)) {
  fs.mkdirSync(catalogUploadDir, { recursive: true });
}

const ALLOWED_CATALOG_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

// Multer storage for catalog image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, catalogUploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, 'catalog-' + uniqueSuffix + ext);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_CATALOG_IMAGE_MIMES.has(file.mimetype)) {
      return cb(
        new BadRequestError(
          `Unsupported image type '${file.mimetype}'. Supported types: JPEG, PNG, WebP, GIF.`,
          'INVALID_FILE_TYPE'
        )
      );
    }
    return cb(null, true);
  },
});

const router = express.Router();

// Strict Admin-Only Guard for all admin routes
router.use(authenticate, authorize(ROLES.ADMIN));

// 1. Dashboard
router.get('/dashboard/summary', adminController.getDashboardSummary);
router.get('/dashboard/trend', adminController.getBusinessActivityTrend);

// 2. User Management & Moderation
router.get('/users', adminController.listUsers);
router.get('/users/:id/export', adminController.exportSingleUserDossier);
router.get('/users/:id', adminController.getUserProfile);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.delete('/users/:id', adminController.softDeleteUser);

// User Appeals & Requests
router.get('/user-requests', adminController.getUserRequests);
router.patch('/user-requests/:id/action', adminController.handleUserRequest);

// 3. Contractor Verifications & Documents
router.get('/verifications', adminController.listVerifications);
router.post('/verifications/:id/approve', adminController.approveContractorVerification);
router.post('/verifications/:id/reject', adminController.rejectContractorVerification);
router.get('/verifications/:contractorId/history', adminController.getVerificationHistory);
router.get('/contractor-documents', adminController.listContractorDocuments);
router.patch('/contractor-documents/:id/review', adminController.reviewContractorDocument);

// 4. Projects & Progress Tracking
router.get('/projects', adminController.listProjects);
router.patch('/projects/:id/progress', adminController.updateProjectProgress);
router.get('/projects/export', adminController.exportProjects);
router.get('/projects/:id/export', adminController.exportSingleProjectDossier);

// 5. Lead Management (4 Tabs & Auto Hot Priority)
router.get('/leads', adminController.listLeads);
router.get('/leads/export', adminController.exportLeads);
router.get('/leads/:id/export', adminController.exportSingleLeadDossier);
router.get('/leads/:id', adminController.getLeadDetails);

// 6. Estimator Configuration (Fields & Dependencies)
router.get('/estimator-config/fields', adminController.listEstimatorFields);
router.post('/estimator-config/fields', adminController.saveEstimatorField);
router.put('/estimator-config/fields/:id', adminController.saveEstimatorField);
router.delete('/estimator-config/fields/:id', adminController.deleteEstimatorField);
router.get('/estimator-config/dependencies', adminController.listEstimatorDependencies);
router.post('/estimator-config/dependencies', adminController.saveEstimatorDependency);
router.put('/estimator-config/dependencies/:id', adminController.saveEstimatorDependency);
router.delete('/estimator-config/dependencies/:id', adminController.deleteEstimatorDependency);

// 7. Catalog Management (Materials, Products, Substrates, Services, Coverage Rates)
router.get('/catalog/overview', adminController.getCatalogOverview);
router.get('/catalog/materials', adminController.listCatalogMaterials);
router.post('/catalog/materials', adminController.saveCatalogMaterial);
router.put('/catalog/materials/:id', adminController.saveCatalogMaterial);
router.get('/catalog/products', adminController.listCatalogProducts);
router.post('/catalog/products', adminController.saveCatalogProduct);
router.put('/catalog/products/:id', adminController.saveCatalogProduct);
router.get('/catalog/substrates', adminController.listCatalogSubstrates);
router.post('/catalog/substrates', adminController.saveCatalogSubstrate);
router.put('/catalog/substrates/:id', adminController.saveCatalogSubstrate);
router.get('/catalog/services', adminController.listCatalogServices);
router.post('/catalog/services', adminController.saveCatalogService);
router.put('/catalog/services/:id', adminController.saveCatalogService);
router.get('/catalog/coverage-rates', adminController.listCatalogCoverageRates);
router.post('/catalog/coverage-rates', adminController.saveCatalogCoverageRate);
router.put('/catalog/coverage-rates/:id', adminController.saveCatalogCoverageRate);
router.post('/catalog/upload-image', uploadLimiter, upload.single('image'), adminController.uploadCatalogImage);

// 8. Pricing Management
router.get('/pricing', adminController.getPricingConfig);
router.put('/pricing', adminController.updatePricingConfig);

// 9. Discounts Management
router.get('/discounts', adminController.getDiscountsOverview);
router.put('/discounts/default', adminController.updateDefaultContractorDiscount);
router.put('/discounts/contractors/:contractorId', adminController.setContractorIndividualDiscount);

// 10. System Settings & Information
router.get('/settings', adminController.getSystemSettings);
router.put('/settings', adminController.updateSystemSettings);

// Targeted Notifications Dispatcher
router.post('/notifications/dispatch', adminController.dispatchNotification);
router.get('/notifications/history', adminController.getNotificationHistory);
router.get('/users/search-recipients', adminController.searchRecipients);

// 11. Permissions Matrix
router.get('/permissions', adminController.getPermissionsMatrix);
router.put('/permissions', adminController.savePermissionsMatrix);

// 12. Reports & Analytics
router.get('/reports/export', adminController.exportReports);
router.get('/reports', adminController.getReportsAnalytics);

// 13. Admin Profile & Hierarchy
router.get('/profile', adminController.getAdminProfile);
router.put('/profile', adminController.updateAdminProfile);
router.post('/profile/change-password', adminController.changeAdminPassword);
router.get('/hierarchy', adminController.getAdminHierarchy);
router.post('/child-admins', adminController.createChildAdmin);
router.delete('/child-admins/:id', adminController.deleteChildAdmin);

module.exports = router;
