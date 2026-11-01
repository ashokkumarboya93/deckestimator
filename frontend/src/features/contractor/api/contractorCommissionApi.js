// =============================================
// Deck Estimator — Contractor Commission API (Phase 9)
// =============================================

import { client } from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';

export const contractorCommissionApi = {
  getMyCommissions: async (params = {}) => {
    const res = await client.get(ENDPOINTS.COMMISSIONS.CONTRACTOR_MY_COMMISSIONS, { params });
    return res.data;
  },

  getCommissionSummary: async () => {
    const res = await client.get(ENDPOINTS.COMMISSIONS.CONTRACTOR_SUMMARY);
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
