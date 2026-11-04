// =============================================
// Deck Estimator — Admin API Service (Phase 10)
// =============================================

import { client } from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';

export const adminApi = {
  // 1. Dashboard
  getDashboardSummary: async () => {
    return client.get(ENDPOINTS.ADMIN.DASHBOARD_SUMMARY);
  },

  getRecentActivity: async (limit = 20) => {
    return client.get(ENDPOINTS.ADMIN.DASHBOARD_ACTIVITY, { params: { limit } });
  },

  // 2. Users
  getUsers: async (params = {}) => {
    return client.get(ENDPOINTS.ADMIN.USERS, { params });
  },

  getUserById: async (id) => {
    return client.get(ENDPOINTS.ADMIN.USER_BY_ID(id));
  },

  createUser: async (payload) => {
    return client.post(ENDPOINTS.ADMIN.USERS, payload);
  },

  updateUser: async (id, payload) => {
    return client.patch(ENDPOINTS.ADMIN.USER_BY_ID(id), payload);
  },

  updateUserStatus: async (id, accountStatus, reason = '') => {
    return client.patch(ENDPOINTS.ADMIN.USER_STATUS(id), { accountStatus, reason });
  },

  // 3. Oversight Modules
  getDecks: async (params = {}) => {
    return client.get(ENDPOINTS.ADMIN.DECKS, { params });
  },

  getEstimates: async (params = {}) => {
    return client.get(ENDPOINTS.ADMIN.ESTIMATES, { params });
  },

  getAnalyses: async (params = {}) => {
    return client.get(ENDPOINTS.ADMIN.ANALYSES, { params });
  },

  // 4. Platform Settings
  getSettings: async (category = '') => {
    return client.get(ENDPOINTS.ADMIN.SETTINGS, { params: { category: category || undefined } });
  },

  createSetting: async (payload) => {
    return client.post(ENDPOINTS.ADMIN.SETTINGS, payload);
  },

  updateSetting: async (key, payload) => {
    return client.patch(ENDPOINTS.ADMIN.SETTING_BY_KEY(key), payload);
  },

  // 5. Audit Logs
  getAuditLogs: async (params = {}) => {
    return client.get(ENDPOINTS.ADMIN.AUDIT_LOGS, { params });
  },

  // 6. Reports
  getReport: async (type, params = {}) => {
    return client.get(ENDPOINTS.ADMIN.REPORTS(type), { params });
  },

  downloadReportCsv: async (type, params = {}) => {
    return client.get(ENDPOINTS.ADMIN.REPORTS(type), {
      params: { ...params, format: 'csv' },
      responseType: 'blob',
    });
  },
};
