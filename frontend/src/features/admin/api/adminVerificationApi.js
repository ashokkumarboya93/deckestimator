// =============================================
// Deck Estimator — Admin Contractor Verification API (Phase 8)
// =============================================

import { client } from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';

export const adminVerificationApi = {
  getApplications: async (params = {}) => {
    const res = await client.get(ENDPOINTS.CONTRACTORS.ADMIN_VERIFICATIONS, { params });
    return res.data;
  },

  getApplicationDetails: async (id) => {
    const res = await client.get(ENDPOINTS.CONTRACTORS.ADMIN_VERIFICATION_BY_ID(id));
    return res.data;
  },

  reviewApplication: async (id, payload) => {
    const res = await client.post(
      ENDPOINTS.CONTRACTORS.ADMIN_VERIFICATION_REVIEW(id),
      payload
    );
    return res.data;
  },

  getDocumentFileUrl: (documentId) => {
    return `/api/v1/contractors/documents/${documentId}/file`;
  },
};

