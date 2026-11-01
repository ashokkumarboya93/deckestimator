// =============================================
// Deck Estimator — Contractor Lead & Verification API (Phase 8)
// =============================================

import { client } from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';

export const contractorLeadApi = {
  getProfile: async () => {
    const res = await client.get(ENDPOINTS.CONTRACTORS.ME);
    return res.data;
  },

  updateProfile: async (payload) => {
    const res = await client.patch(ENDPOINTS.CONTRACTORS.ME, payload);
    return res.data;
  },

  submitVerification: async (notes = '') => {
    const res = await client.post(ENDPOINTS.CONTRACTORS.SUBMIT_VERIFICATION, { notes });
    return res.data;
  },

  uploadDocument: async (formData) => {
    const res = await client.post(ENDPOINTS.CONTRACTORS.DOCUMENTS, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getMyDocuments: async () => {
    const res = await client.get(ENDPOINTS.CONTRACTORS.DOCUMENTS);
    return res.data;
  },

  getAssignedLeads: async (params = {}) => {
    const res = await client.get(ENDPOINTS.LEADS.CONTRACTOR_INBOX, { params });
    return res.data;
  },

  acceptLead: async (leadId, notes = '') => {
    const res = await client.post(ENDPOINTS.LEADS.CONTRACTOR_ACCEPT(leadId), { notes });
    return res.data;
  },

  rejectLead: async (leadId, reason) => {
    const res = await client.post(ENDPOINTS.LEADS.CONTRACTOR_REJECT(leadId), { reason });
    return res.data;
  },

  updateLeadStatus: async (leadId, status, notes = '') => {
    const res = await client.patch(ENDPOINTS.LEADS.CONTRACTOR_STATUS(leadId), {
      status,
      notes,
    });
    return res.data;
  },

  getLeadDetails: async (leadId) => {
    const res = await client.get(ENDPOINTS.LEADS.BY_ID(leadId));
    return res.data;
  },

  getLeadActivities: async (leadId) => {
    const res = await client.get(ENDPOINTS.LEADS.ACTIVITIES(leadId));
    return res.data;
  },

  addLeadNote: async (leadId, description, visibility = 'INTERNAL') => {
    const res = await client.post(ENDPOINTS.LEADS.NOTES(leadId), {
      description,
      visibility,
    });
    return res.data;
  },
};
