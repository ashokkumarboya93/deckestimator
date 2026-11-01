// =============================================
// Deck Estimator — Admin Commission API (Phase 9)
// =============================================

import { client } from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';

export const adminCommissionApi = {
  getPolicies: async (params = {}) => {
    const res = await client.get(ENDPOINTS.COMMISSIONS.POLICIES, { params });
    return res.data;
  },

  getPolicyById: async (id) => {
    const res = await client.get(ENDPOINTS.COMMISSIONS.POLICY_BY_ID(id));
    return res.data;
  },

  createPolicy: async (payload) => {
    const res = await client.post(ENDPOINTS.COMMISSIONS.POLICIES, payload);
    return res.data;
  },

  updatePolicy: async (id, payload) => {
    const res = await client.put(ENDPOINTS.COMMISSIONS.POLICY_BY_ID(id), payload);
    return res.data;
  },

  updatePolicyStatus: async (id, status, reason = '') => {
    const res = await client.patch(ENDPOINTS.COMMISSIONS.POLICY_STATUS(id), { status, reason });
    return res.data;
  },

  generateCommission: async (leadId, commissionPolicyId, notes = '') => {
    const res = await client.post(ENDPOINTS.COMMISSIONS.ADMIN_GENERATE, {
      leadId,
      commissionPolicyId,
      notes,
    });
    return res.data;
  },

  getAllCommissions: async (params = {}) => {
    const res = await client.get(ENDPOINTS.COMMISSIONS.ADMIN_ALL, { params });
    return res.data;
  },

  reviewCommission: async (id, action, rejectionReason = '', notes = '') => {
    const res = await client.post(ENDPOINTS.COMMISSIONS.ADMIN_REVIEW(id), {
      action,
      rejectionReason,
      notes,
    });
    return res.data;
  },

  recordPayment: async (id, payload) => {
    const res = await client.post(ENDPOINTS.COMMISSIONS.ADMIN_RECORD_PAYMENT(id), payload);
    return res.data;
  },

  getCommissionById: async (id) => {
    const res = await client.get(ENDPOINTS.COMMISSIONS.BY_ID(id));
    return res.data;
  },

  getCommissionHistory: async (id) => {
    const res = await client.get(ENDPOINTS.COMMISSIONS.HISTORY(id));
    return res.data;
  },
};
