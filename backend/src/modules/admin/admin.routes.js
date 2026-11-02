// =============================================
// Deck Estimator — Admin Management Routes (Phase 10)
// =============================================

const express = require('express');
const adminController = require('./admin.controller');
const {
  updateUserSchema,
  updateUserStatusSchema,
  createUserSchema,
  createSettingSchema,
  updateSettingSchema,
} = require('./admin.validation');
const { validate } = require('../../middleware/validate');
const { authenticate } = require('../../middleware/authenticate');
const { authorize } = require('../../middleware/authorize');
const { ROLES } = require('../../shared/constants');

const router = express.Router();

// Public Platform Settings (Read-only for public/active platform display preferences)
router.get('/settings/public', adminController.getPublicSettings);

// Strict Admin-Only Guard across all routes below
router.use(authenticate, authorize(ROLES.ADMIN));

// 1. Dashboard & Activities
router.get('/dashboard/summary', adminController.getDashboardSummary);
router.get('/dashboard/activity', adminController.getRecentActivity);

// 2. User Management
router.get('/users', adminController.listUsers);
router.get('/users/:id', adminController.getUserById);
router.post('/users', validate(createUserSchema), adminController.createUser);
router.patch('/users/:id', validate(updateUserSchema), adminController.updateUser);
router.patch('/users/:id/status', validate(updateUserStatusSchema), adminController.updateUserStatus);

// 3. Oversight Modules
router.get('/decks', adminController.listDecks);
router.get('/estimates', adminController.listEstimates);
router.get('/analyses', adminController.listAIAnalyses);

// 4. Platform Settings
router.get('/settings', adminController.getSettings);
router.get('/settings/:key', adminController.getSettingByKey);
router.post('/settings', validate(createSettingSchema), adminController.createSetting);
router.patch('/settings/:key', validate(updateSettingSchema), adminController.updateSetting);

// 5. Audit Logs
router.get('/audit-logs', adminController.listAuditLogs);

// 6. Reports & Analytics
router.get('/reports/:type', adminController.getReport);

module.exports = router;

