// =============================================
// Deck Estimator — Admin Lead Management API (Phase 8)
// =============================================

import { client } from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';

export const adminLeadApi = {
  getAllLeads: async (params = {}) => {
    return client.get(ENDPOINTS.LEADS.ADMIN_ALL, { params });
  },

  getLeadById: async (leadId) => {
    return client.get(ENDPOINTS.LEADS.BY_ID(leadId));
  },

  getLeadAnalytics: async () => {
    return client.get(ENDPOINTS.LEADS.ADMIN_ANALYTICS);
  },

  assignContractor: async (leadId, payload) => {
    return client.post(ENDPOINTS.LEADS.ADMIN_ASSIGN(leadId), payload);
  },

  closeLead: async (leadId, action, reason) => {
    return client.post(ENDPOINTS.LEADS.ADMIN_CLOSE(leadId), {
      action,
      reason,
    });
  },

  getAssignmentHistory: async (leadId) => {
    return client.get(ENDPOINTS.LEADS.ADMIN_HISTORY(leadId));
  },

  getLeadActivities: async (leadId) => {
    return client.get(ENDPOINTS.LEADS.ACTIVITIES(leadId));
  },

  addInternalNote: async (leadId, description) => {
    return client.post(ENDPOINTS.LEADS.NOTES(leadId), {
      description,
      visibility: 'INTERNAL',
    });
  },

  getEligibleContractors: async (params = {}) => {
    return client.get(ENDPOINTS.CONTRACTORS.ELIGIBLE, { params });
  },
};
