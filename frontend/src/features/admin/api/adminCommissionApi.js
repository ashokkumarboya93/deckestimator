// =============================================
// Deck Estimator — Admin Commission API (Phase 9)
// =============================================

import { client } from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';

export const adminCommissionApi = {
  getPolicies: async (params = {}) => {
    return client.get(ENDPOINTS.COMMISSIONS.POLICIES, { params });
  },

  getPolicyById: async (id) => {
    return client.get(ENDPOINTS.COMMISSIONS.POLICY_BY_ID(id));
  },

  createPolicy: async (payload) => {
    return client.post(ENDPOINTS.COMMISSIONS.POLICIES, payload);
  },

  updatePolicy: async (id, payload) => {
    return client.put(ENDPOINTS.COMMISSIONS.POLICY_BY_ID(id), payload);
  },

  updatePolicyStatus: async (id, status, reason = '') => {
    return client.patch(ENDPOINTS.COMMISSIONS.POLICY_STATUS(id), { status, reason });
  },

  generateCommission: async (leadId, commissionPolicyId, notes = '') => {
    return client.post(ENDPOINTS.COMMISSIONS.ADMIN_GENERATE, {
      leadId,
      commissionPolicyId,
      notes,
    });
  },

  getAllCommissions: async (params = {}) => {
    return client.get(ENDPOINTS.COMMISSIONS.ADMIN_ALL, { params });
  },

  reviewCommission: async (id, action, rejectionReason = '', notes = '') => {
    return client.post(ENDPOINTS.COMMISSIONS.ADMIN_REVIEW(id), {
      action,
      rejectionReason,
      notes,
    });
  },

  recordPayment: async (id, payload) => {
    return client.post(ENDPOINTS.COMMISSIONS.ADMIN_RECORD_PAYMENT(id), payload);
  },

  getCommissionById: async (id) => {
    return client.get(ENDPOINTS.COMMISSIONS.BY_ID(id));
  },

  getCommissionHistory: async (id) => {
    return client.get(ENDPOINTS.COMMISSIONS.HISTORY(id));
  },
};
