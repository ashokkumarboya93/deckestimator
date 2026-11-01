// =============================================
// Deck Estimator — Admin Lead Management API (Phase 8)
// =============================================

import { client } from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';

export const adminLeadApi = {
  getAllLeads: async (params = {}) => {
    const res = await client.get(ENDPOINTS.LEADS.ADMIN_ALL, { params });
    return res.data;
  },

  getLeadById: async (leadId) => {
    const res = await client.get(ENDPOINTS.LEADS.BY_ID(leadId));
    return res.data;
  },

  getLeadAnalytics: async () => {
    const res = await client.get(ENDPOINTS.LEADS.ADMIN_ANALYTICS);
    return res.data;
  },

  assignContractor: async (leadId, payload) => {
    const res = await client.post(ENDPOINTS.LEADS.ADMIN_ASSIGN(leadId), payload);
    return res.data;
  },

  closeLead: async (leadId, action, reason) => {
    const res = await client.post(ENDPOINTS.LEADS.ADMIN_CLOSE(leadId), {
      action,
      reason,
    });
    return res.data;
  },

  getAssignmentHistory: async (leadId) => {
    const res = await client.get(ENDPOINTS.LEADS.ADMIN_HISTORY(leadId));
    return res.data;
  },

  getLeadActivities: async (leadId) => {
    const res = await client.get(ENDPOINTS.LEADS.ACTIVITIES(leadId));
    return res.data;
  },

  addInternalNote: async (leadId, description) => {
    const res = await client.post(ENDPOINTS.LEADS.NOTES(leadId), {
      description,
      visibility: 'INTERNAL',
    });
    return res.data;
  },

  getEligibleContractors: async (params = {}) => {
    const res = await client.get(ENDPOINTS.CONTRACTORS.ELIGIBLE, { params });
    return res.data;
  },
};

