// =============================================
// Deck Estimator — Admin API Service (Phase 10)
// =============================================

import { client } from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';

export const adminApi = {
  // 1. Dashboard
  getDashboardSummary: async () => {
    const res = await client.get(ENDPOINTS.ADMIN.DASHBOARD_SUMMARY);
    return res.data;
  },

  getRecentActivity: async (limit = 20) => {
    const res = await client.get(ENDPOINTS.ADMIN.DASHBOARD_ACTIVITY, { params: { limit } });
    return res.data;
  },

  // 2. Users
  getUsers: async (params = {}) => {
    const res = await client.get(ENDPOINTS.ADMIN.USERS, { params });
    return res.data;
  },

  getUserById: async (id) => {
    const res = await client.get(ENDPOINTS.ADMIN.USER_BY_ID(id));
    return res.data;
  },

  createUser: async (payload) => {
    const res = await client.post(ENDPOINTS.ADMIN.USERS, payload);
    return res.data;
  },

  updateUser: async (id, payload) => {
    const res = await client.patch(ENDPOINTS.ADMIN.USER_BY_ID(id), payload);
    return res.data;
  },

  updateUserStatus: async (id, accountStatus, reason = '') => {
    const res = await client.patch(ENDPOINTS.ADMIN.USER_STATUS(id), { accountStatus, reason });
    return res.data;
  },

  // 3. Oversight Modules
  getDecks: async (params = {}) => {
    const res = await client.get(ENDPOINTS.ADMIN.DECKS, { params });
    return res.data;
  },

  getEstimates: async (params = {}) => {
    const res = await client.get(ENDPOINTS.ADMIN.ESTIMATES, { params });
    return res.data;
  },

  getAnalyses: async (params = {}) => {
    const res = await client.get(ENDPOINTS.ADMIN.ANALYSES, { params });
    return res.data;
  },

  // 4. Platform Settings
  getSettings: async (category = '') => {
    const res = await client.get(ENDPOINTS.ADMIN.SETTINGS, { params: { category: category || undefined } });
    return res.data;
  },

  createSetting: async (payload) => {
    const res = await client.post(ENDPOINTS.ADMIN.SETTINGS, payload);
    return res.data;
  },

  updateSetting: async (key, payload) => {
    const res = await client.patch(ENDPOINTS.ADMIN.SETTING_BY_KEY(key), payload);
    return res.data;
  },

  // 5. Audit Logs
  getAuditLogs: async (params = {}) => {
    const res = await client.get(ENDPOINTS.ADMIN.AUDIT_LOGS, { params });
    return res.data;
  },

  // 6. Reports
  getReport: async (type, params = {}) => {
    const res = await client.get(ENDPOINTS.ADMIN.REPORTS(type), { params });
    return res.data;
  },

  downloadReportCsv: async (type, params = {}) => {
    const res = await client.get(ENDPOINTS.ADMIN.REPORTS(type), {
      params: { ...params, format: 'csv' },
      responseType: 'blob',
    });
    return res.data;
  },
};

