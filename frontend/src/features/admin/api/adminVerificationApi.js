// =============================================
// Deck Estimator — Admin Contractor Verification API (Phase 8)
// =============================================

import { client } from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';

export const adminVerificationApi = {
  getApplications: async (params = {}) => {
    return client.get(ENDPOINTS.CONTRACTORS.ADMIN_VERIFICATIONS, { params });
  },

  getApplicationDetails: async (id) => {
    return client.get(ENDPOINTS.CONTRACTORS.ADMIN_VERIFICATION_BY_ID(id));
  },

  reviewApplication: async (id, payload) => {
    return client.post(
      ENDPOINTS.CONTRACTORS.ADMIN_VERIFICATION_REVIEW(id),
      payload
    );
  },

  getDocumentFileUrl: (documentId) => {
    return `/api/v1/contractors/documents/${documentId}/file`;
  },
};

