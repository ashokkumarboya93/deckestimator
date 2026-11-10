// =============================================
// Deck Estimator — User Notifications API Client
// =============================================

import { apiClient } from '../../../api/client';

export async function getMyNotifications(params = {}) {
  const query = new URLSearchParams(params).toString();
  const endpoint = query ? `/notifications/my?${query}` : '/notifications/my';
  const res = await apiClient(endpoint, { method: 'GET' });
  return res?.data || res || { notifications: [], unreadCount: 0 };
}

export async function markNotificationRead(id) {
  const res = await apiClient(`/notifications/${id}/read`, { method: 'PATCH' });
  return res?.data || res;
}

export async function markAllNotificationsRead() {
  const res = await apiClient('/notifications/read-all', { method: 'POST' });
  return res?.data || res;
}

export const notificationsApi = {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
