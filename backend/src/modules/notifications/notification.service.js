// =============================================
// Deck Estimator — Notification Service
// =============================================

const Notification = require('./notification.model');

const notifCache = new Map();
const NOTIF_CACHE_TTL = 10000; // 10s fast response cache

function invalidateNotifCache(userId = null) {
  if (userId) {
    notifCache.delete(String(userId));
  } else {
    notifCache.clear();
  }
}

/**
 * Get notifications for a user based on user ID and role.
 */
async function getUserNotifications(user, query = {}) {
  const { limit = 25, unreadOnly = false } = query;
  const userId = user.id || user._id;
  const userIdStr = String(userId);
  const role = user.role;

  if (!unreadOnly && Number(limit) <= 25) {
    const cached = notifCache.get(userIdStr);
    if (cached && Date.now() - cached.cachedAt < NOTIF_CACHE_TTL) {
      return cached.data;
    }
  }

  // Broadcast notifications should only appear if created on or after the user's account creation
  // (ensures newly registered accounts start with 0 notifications).
  const broadcastFilter = {
    recipientType: { $in: ['all', role] },
    targetRole: { $in: ['all', role] },
    $and: [
      { $or: [{ userId: null }, { userId: { $exists: false } }] },
      { recipientType: { $ne: 'specific' } },
    ],
  };
  if (user.createdAt) {
    broadcastFilter.createdAt = { $gte: new Date(user.createdAt) };
  } else {
    // If createdAt isn't present on token/user, only return direct user-targeted notifications
    broadcastFilter._id = null;
  }

  const filter = {
    clearedBy: { $ne: userId },
    $or: [
      { userId },
      broadcastFilter,
    ],
  };

  if (unreadOnly) {
    filter.isRead = false;
  }

  let rawNotifications = [];
  try {
    rawNotifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .maxTimeMS(4000)
      .lean();
  } catch (err) {
    const stale = notifCache.get(userIdStr);
    if (stale?.data) return stale.data;
    return { notifications: [], unreadCount: 0 };
  }

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

  const result = {
    notifications: finalNotifications,
    unreadCount,
  };
  if (!unreadOnly && Number(limit) <= 25) {
    notifCache.set(userIdStr, { data: result, cachedAt: Date.now() });
  }
  return result;
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
  invalidateNotifCache(userId);
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
      recipientType: { $in: ['all', role] },
      targetRole: { $in: ['all', role] },
      recipientType: { $ne: 'specific' },
      $or: [{ userId: null }, { userId: { $exists: false } }],
      readBy: { $ne: userId },
    },
    { $addToSet: { readBy: userId } }
  );

  invalidateNotifCache(userId);
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
        recipientType: { $in: ['all', role] },
        targetRole: { $in: ['all', role] },
        recipientType: { $ne: 'specific' },
        $or: [{ userId: null }, { userId: { $exists: false } }],
        clearedBy: { $ne: userId },
      },
      { $addToSet: { clearedBy: userId, readBy: userId } }
    ),
  ]);

  invalidateNotifCache(userId);
  return { success: true };
}

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  clearAllNotifications,
};
