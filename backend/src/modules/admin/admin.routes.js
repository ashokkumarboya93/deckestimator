// =============================================
// Deck Estimator — Admin Management Routes
// =============================================

const express = require('express');
const multer = require('multer');
const path = require('path');
const adminController = require('./admin.controller');
const { authenticate } = require('../../middleware/authenticate');
const { authorize } = require('../../middleware/authorize');
const { ROLES } = require('../../shared/constants');

// Multer storage for catalog image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../../uploads/catalog'));
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

// 3. Contractor Verifications
router.get('/verifications', adminController.listVerifications);
router.post('/verifications/:id/approve', adminController.approveContractorVerification);
router.post('/verifications/:id/reject', adminController.rejectContractorVerification);
router.get('/verifications/:contractorId/history', adminController.getVerificationHistory);

// 4. Projects & Progress Tracking
router.get('/projects', adminController.listProjects);
router.patch('/projects/:id/progress', adminController.updateProjectProgress);
router.get('/projects/export', adminController.exportProjects);

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
router.post('/catalog/upload-image', upload.single('image'), adminController.uploadCatalogImage);

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

// 11. Permissions Matrix
router.get('/permissions', adminController.getPermissionsMatrix);
router.put('/permissions', adminController.savePermissionsMatrix);

// 12. Reports & Analytics
router.get('/reports', adminController.getReportsAnalytics);

// 13. Admin Profile
router.get('/profile', adminController.getAdminProfile);
router.put('/profile', adminController.updateAdminProfile);
router.post('/profile/change-password', adminController.changeAdminPassword);

module.exports = router;
