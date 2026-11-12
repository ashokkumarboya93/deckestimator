// =============================================
// Deck Estimator — Notification Service
// =============================================

const Notification = require('./notification.model');
const { ForbiddenError, NotFoundError } = require('../../shared/errors');

/**
 * Get notifications for a user based on user ID and role.
 */
async function getUserNotifications(user, query = {}) {
  const { limit = 25, unreadOnly = false } = query;
  const unreadOnlyBool = unreadOnly === true || unreadOnly === 'true';
  const userId = user.id || user._id;
  const role = user.role;

  const filter = {
    $or: [
      { userId },
      { recipientType: 'all' },
      { targetRole: 'all' },
      { recipientType: role },
      { targetRole: role },
    ],
  };

  if (unreadOnlyBool) {
    filter.isRead = false;
  }

  const rawNotifications = await Notification.find(filter)
    .select('-__v')
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .lean();

  const userIdStr = String(userId);
  const notifications = rawNotifications.map((n) => {
    const isUserRead = n.isRead || (Array.isArray(n.readBy) && n.readBy.some((id) => String(id) === userIdStr));
    return {
      ...n,
      id: n.id || (n._id ? n._id.toString() : ''),
      isRead: Boolean(isUserRead),
    };
  });

  const finalNotifications = unreadOnlyBool ? notifications.filter((n) => !n.isRead) : notifications;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    notifications: finalNotifications,
    unreadCount,
  };
}

/**
 * Mark a single notification as read.
 */
async function markAsRead(notificationId, user) {
  const userId = user.id || user._id;
  const notif = await Notification.findById(notificationId);
  if (!notif) {
    throw new NotFoundError('Notification not found.', 'NOTIFICATION_NOT_FOUND');
  }

  if (notif.userId) {
    if (String(notif.userId) !== String(userId)) {
      throw new ForbiddenError('You are not authorized to access this notification.', 'FORBIDDEN');
    }
    notif.isRead = true;
  } else {
    const isBroadcastTarget =
      notif.recipientType !== 'specific' &&
      (['all', user.role].includes(notif.recipientType) || ['all', user.role].includes(notif.targetRole));

    if (!isBroadcastTarget) {
      throw new ForbiddenError('You are not authorized to access this notification.', 'FORBIDDEN');
    }

    if (!notif.readBy) notif.readBy = [];
    if (!notif.readBy.some((id) => String(id) === String(userId))) {
      notif.readBy.push(userId);
    }
  }

  await notif.save();
  return notif;
}

/**
 * Mark all notifications for this user as read.
 */
async function markAllAsRead(user) {
  const userId = user.id || user._id;
  const role = user.role;

  // Direct specific notifications
  await Notification.updateMany(
    { userId, isRead: false },
    { $set: { isRead: true } }
  );

  // Broadcast notifications
  await Notification.updateMany(
    {
      $or: [
        { recipientType: 'all' },
        { targetRole: 'all' },
        { recipientType: role },
        { targetRole: role },
      ],
      readBy: { $ne: userId },
    },
    { $addToSet: { readBy: userId } }
  );

  return { success: true };
}

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
};
