// =============================================
// Deck Estimator — Notification Controller
// =============================================

const notificationService = require('./notification.service');

async function getMyNotifications(req, res, next) {
  try {
    const data = await notificationService.getUserNotifications(req.user, req.query);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function markNotificationAsRead(req, res, next) {
  try {
    const data = await notificationService.markAsRead(req.params.id, req.user);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function markAllNotificationsAsRead(req, res, next) {
  try {
    const data = await notificationService.markAllAsRead(req.user);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
