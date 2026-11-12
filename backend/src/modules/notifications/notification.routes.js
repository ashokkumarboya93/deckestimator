// =============================================
// Deck Estimator — Notification Routes
// =============================================

const express = require('express');
const Joi = require('joi');
const router = express.Router();
const notificationController = require('./notification.controller');
const { authenticate } = require('../../middleware/authenticate');
const { validate } = require('../../middleware/validate');

const notificationIdParamSchema = {
  params: Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
      'string.pattern.base': 'Notification id must be a valid 24-character hex ObjectId',
    }),
  }),
};

router.use(authenticate);

router.get('/my', notificationController.getMyNotifications);
router.patch('/:id/read', validate(notificationIdParamSchema), notificationController.markNotificationAsRead);
router.post('/read-all', notificationController.markAllNotificationsAsRead);

module.exports = router;
