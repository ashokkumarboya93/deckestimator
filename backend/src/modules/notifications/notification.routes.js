// =============================================
// Deck Estimator — Notification Routes
// =============================================

const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');
const { authenticate } = require('../../middleware/authenticate');

router.use(authenticate);

router.get('/my', notificationController.getMyNotifications);
router.patch('/:id/read', notificationController.markNotificationAsRead);
router.post('/read-all', notificationController.markAllNotificationsAsRead);
router.delete('/clear-all', notificationController.clearAllNotifications);

module.exports = router;
