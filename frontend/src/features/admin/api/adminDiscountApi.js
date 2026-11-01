// =============================================
// Deck Estimator — Admin Discount Policy API (Phase 9)
// =============================================

import { client } from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';

export const adminDiscountApi = {
  getPolicies: async (params = {}) => {
    const res = await client.get(ENDPOINTS.DISCOUNTS.POLICIES, { params });
    return res.data;
  },

  getPolicyById: async (id) => {
    const res = await client.get(ENDPOINTS.DISCOUNTS.POLICY_BY_ID(id));
    return res.data;
  },

  createPolicy: async (payload) => {
    const res = await client.post(ENDPOINTS.DISCOUNTS.POLICIES, payload);
    return res.data;
  },

  updatePolicy: async (id, payload) => {
    const res = await client.put(ENDPOINTS.DISCOUNTS.POLICY_BY_ID(id), payload);
    return res.data;
  },

  updatePolicyStatus: async (id, status, reason = '') => {
    const res = await client.patch(ENDPOINTS.DISCOUNTS.POLICY_STATUS(id), { status, reason });
    return res.data;
  },

  assignPolicy: async (id, payload) => {
    const res = await client.post(ENDPOINTS.DISCOUNTS.ASSIGN(id), payload);
    return res.data;
  },

  getPolicyAssignments: async (id) => {
    const res = await client.get(ENDPOINTS.DISCOUNTS.ASSIGNMENTS(id));
    return res.data;
  },

  removeAssignment: async (id, contractorId) => {
    const res = await client.delete(ENDPOINTS.DISCOUNTS.REMOVE_ASSIGNMENT(id, contractorId));
    return res.data;
  },
};
