// =============================================
// Deck Estimator — Admin Discount Policy API (Phase 9)
// =============================================

import { client } from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';

export const adminDiscountApi = {
  getPolicies: async (params = {}) => {
    return client.get(ENDPOINTS.DISCOUNTS.POLICIES, { params });
  },

  getPolicyById: async (id) => {
    return client.get(ENDPOINTS.DISCOUNTS.POLICY_BY_ID(id));
  },

  createPolicy: async (payload) => {
    return client.post(ENDPOINTS.DISCOUNTS.POLICIES, payload);
  },

  updatePolicy: async (id, payload) => {
    return client.put(ENDPOINTS.DISCOUNTS.POLICY_BY_ID(id), payload);
  },

  updatePolicyStatus: async (id, status, reason = '') => {
    return client.patch(ENDPOINTS.DISCOUNTS.POLICY_STATUS(id), { status, reason });
  },

  assignPolicy: async (id, payload) => {
    return client.post(ENDPOINTS.DISCOUNTS.ASSIGN(id), payload);
  },

  getPolicyAssignments: async (id) => {
    return client.get(ENDPOINTS.DISCOUNTS.ASSIGNMENTS(id));
  },

  removeAssignment: async (id, contractorId) => {
    return client.delete(ENDPOINTS.DISCOUNTS.REMOVE_ASSIGNMENT(id, contractorId));
  },
};
