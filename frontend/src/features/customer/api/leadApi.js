// =============================================
// Deck Estimator — Customer Lead API (Phase 8)
// =============================================

import { client } from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';

export const leadApi = {
  createLead: async (payload) => {
    const res = await client.post(ENDPOINTS.LEADS.BASE, payload);
    return res.data;
  },

  getMyLeads: async (params = {}) => {
    const res = await client.get(ENDPOINTS.LEADS.MY_LEADS, { params });
    return res.data;
  },

  getLeadById: async (leadId) => {
    const res = await client.get(ENDPOINTS.LEADS.BY_ID(leadId));
    return res.data;
  },

  getLeadActivities: async (leadId) => {
    const res = await client.get(ENDPOINTS.LEADS.ACTIVITIES(leadId));
    return res.data;
  },

  addNote: async (leadId, description) => {
    const res = await client.post(ENDPOINTS.LEADS.NOTES(leadId), {
      description,
      visibility: 'CUSTOMER_VISIBLE',
    });
    return res.data;
  },
};

