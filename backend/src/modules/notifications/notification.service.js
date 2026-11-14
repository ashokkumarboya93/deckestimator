// =============================================
// Deck Estimator — Notification Service
// =============================================

const Notification = require('./notification.model');

/**
 * Get notifications for a user based on user ID and role.
 */
async function getUserNotifications(user, query = {}) {
  const { limit = 25, unreadOnly = false } = query;
  const userId = user.id || user._id;
  const role = user.role;

  const filter = {
    clearedBy: { $ne: userId },
    $or: [
      { userId },
      { recipientType: 'all' },
      { targetRole: 'all' },
      { recipientType: role },
      { targetRole: role },
    ],
  };

  if (unreadOnly) {
    filter.isRead = false;
  }

  const rawNotifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .lean();

  const userIdStr = String(userId);
  const notifications = rawNotifications.map((n) => {
    const isUserRead = n.isRead || (Array.isArray(n.readBy) && n.readBy.some((id) => String(id) === userIdStr));
    return {
      ...n,
      id: n._id ? String(n._id) : '',
      isRead: Boolean(isUserRead),
    };
  });

  const finalNotifications = unreadOnly ? notifications.filter((n) => !n.isRead) : notifications;
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
  if (!notif) return null;

  if (notif.userId && String(notif.userId) === String(userId)) {
    notif.isRead = true;
  } else {
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

/**
 * Clear (dismiss) all notifications for this user.
 * Deletes direct user notifications and hides broadcast notifications for this user.
 */
async function clearAllNotifications(user) {
  const userId = user.id || user._id;
  const role = user.role;

  await Promise.all([
    Notification.deleteMany({ userId }),
    Notification.updateMany(
      {
        $or: [
          { recipientType: 'all' },
          { targetRole: 'all' },
          { recipientType: role },
          { targetRole: role },
        ],
        clearedBy: { $ne: userId },
      },
      { $addToSet: { clearedBy: userId, readBy: userId } }
    ),
  ]);

  return { success: true };
}

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  clearAllNotifications,
};
