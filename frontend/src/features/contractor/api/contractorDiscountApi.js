// =============================================
// Deck Estimator — Contractor Discount API (Phase 9)
// =============================================

import { client } from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';

export const contractorDiscountApi = {
  getEligibleDiscounts: async () => {
    const res = await client.get(ENDPOINTS.DISCOUNTS.CONTRACTOR_ELIGIBLE);
    return res.data;
  },

  applyDiscountToEstimate: async (estimateId, discountPolicyId) => {
    const res = await client.post(ENDPOINTS.DISCOUNTS.APPLY_ESTIMATE(estimateId), {
      discountPolicyId,
    });
    return res.data;
  },

  removeDiscountFromEstimate: async (estimateId, reason = '') => {
    const res = await client.delete(ENDPOINTS.DISCOUNTS.REMOVE_ESTIMATE(estimateId), {
      data: { reason },
    });
    return res.data;
  },

  getEstimateDiscountHistory: async (estimateId) => {
    const res = await client.get(ENDPOINTS.DISCOUNTS.ESTIMATE_HISTORY(estimateId));
    return res.data;
  },
};
