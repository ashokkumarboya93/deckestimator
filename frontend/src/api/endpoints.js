// =============================================
// Deck Estimator — API Endpoint Constants
// =============================================
// Central location for all API endpoint paths.

export const ENDPOINTS = {
  // Health
  HEALTH: '/health',

  // Auth (Phase 5)
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    VERIFY: '/auth/verify',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    ME: '/auth/me',
  },

  // Users (Phase 5)
  USERS: {
    ME: '/users/me',
  },

  // Decks (Phase 4)
  DECKS: {
    BASE: '/decks',
    BY_ID: (id) => `/decks/${id}`,
    IMAGES: (deckId) => `/decks/${deckId}/images`,
    IMAGE_BY_ID: (deckId, imageId) => `/decks/${deckId}/images/${imageId}`,
  },

  // Catalog Management (Phase 5)
  CATALOG: {
    MATERIAL_CATEGORIES: '/catalog/material-categories',
    MATERIAL_CATEGORY_BY_ID: (id) => `/catalog/material-categories/${id}`,
    MATERIAL_CATEGORY_STATUS: (id) => `/catalog/material-categories/${id}/status`,

    MATERIALS: '/catalog/materials',
    MATERIAL_BY_ID: (id) => `/catalog/materials/${id}`,
    MATERIAL_STATUS: (id) => `/catalog/materials/${id}/status`,

    SERVICE_CATEGORIES: '/catalog/service-categories',
    SERVICE_CATEGORY_BY_ID: (id) => `/catalog/service-categories/${id}`,
    SERVICE_CATEGORY_STATUS: (id) => `/catalog/service-categories/${id}/status`,

    SERVICES: '/catalog/services',
    SERVICE_BY_ID: (id) => `/catalog/services/${id}`,
    SERVICE_STATUS: (id) => `/catalog/services/${id}/status`,

    COMPATIBILITIES: '/catalog/compatibilities',
    COMPATIBILITY_BY_ID: (id) => `/catalog/compatibilities/${id}`,
  },

  // Files (Phase 6)
  FILES: {
    UPLOAD: '/files/upload',
    BY_ID: (id) => `/files/${id}`,
  },

  // Pricing (Phase 6)
  PRICING: {
    CONFIGURATIONS: '/pricing/configurations',
    ACTIVE: '/pricing/configurations/active',
    BY_ID: (id) => `/pricing/configurations/${id}`,
    STATUS: (id) => `/pricing/configurations/${id}/status`,
    CALCULATE: '/pricing/calculate',
  },

  // Estimates (Phase 6)
  ESTIMATES: {
    BASE: '/estimates',
    BY_ID: (id) => `/estimates/${id}`,
    RECALCULATE: (id) => `/estimates/${id}/recalculate`,
    STATUS: (id) => `/estimates/${id}/status`,
    HISTORY: (id) => `/estimates/${id}/history`,
    REPORT: (id) => `/estimates/${id}/report`,
  },

  // Condition Analysis (Phase 7)
  ANALYSES: {
    BASE: '/condition-analyses',
    DECK_ANALYSES: (deckId) => `/condition-analyses/decks/${deckId}/analyses`,
    BY_ID: (id) => `/condition-analyses/${id}`,
    RETRY: (id) => `/condition-analyses/${id}/retry`,
    REVIEW: (id) => `/condition-analyses/${id}/review`,
    ML_HEALTH: '/condition-analyses/ml-health',
  },

  // Leads (Phase 8)
  LEADS: {
    BASE: '/leads',
    MY_LEADS: '/leads/my-leads',
    CONTRACTOR_INBOX: '/leads/contractor/inbox',
    CONTRACTOR_ACCEPT: (id) => `/leads/contractor/${id}/accept`,
    CONTRACTOR_REJECT: (id) => `/leads/contractor/${id}/reject`,
    CONTRACTOR_STATUS: (id) => `/leads/contractor/${id}/status`,
    BY_ID: (id) => `/leads/${id}`,
    ACTIVITIES: (id) => `/leads/${id}/activities`,
    NOTES: (id) => `/leads/${id}/notes`,
    ADMIN_ALL: '/leads/admin/all',
    ADMIN_ANALYTICS: '/leads/admin/analytics',
    ADMIN_ASSIGN: (id) => `/leads/admin/${id}/assign`,
    ADMIN_CLOSE: (id) => `/leads/admin/${id}/close`,
  },

  // Lead Activities (Phase 8)
  LEAD_ACTIVITIES: {
    BY_LEAD: (leadId) => `/leads/${leadId}/activities`,
  },

  // Lead Notes (Phase 8)
  LEAD_NOTES: {
    BY_LEAD: (leadId) => `/leads/${leadId}/notes`,
    BY_ID: (leadId, noteId) => `/leads/${leadId}/notes/${noteId}`,
  },

  // Contractor Self-Service & Verification (Phase 8 & 10)
  CONTRACTORS: {
    ME: '/contractors/me',
    SUBMIT_VERIFICATION: '/contractors/me/verification/submit',
    DOCUMENTS: '/contractors/me/verification/documents',
    DOCUMENT_FILE: (docId) => `/contractors/documents/${docId}/file`,
    ELIGIBLE: '/contractors/eligible',
  },

  // Discounts (Phase 9)
  DISCOUNTS: {
    BASE: '/discounts',
    CONTRACTOR_ELIGIBLE: '/discounts/contractor',
    APPLY_ESTIMATE: (estimateId) => `/discounts/estimates/${estimateId}/apply`,
    REMOVE_ESTIMATE: (estimateId) => `/discounts/estimates/${estimateId}/remove`,
    ESTIMATE_HISTORY: (estimateId) => `/discounts/estimates/${estimateId}/history`,
    ADMIN_POLICIES: '/discounts/admin/policies',
    ADMIN_POLICY_BY_ID: (id) => `/discounts/admin/policies/${id}`,
  },

  // Contractor Discounts alias for backwards compatibility
  CONTRACTOR_DISCOUNTS: {
    BASE: '/discounts',
    ELIGIBLE: '/discounts/contractor',
    BY_ID: (id) => `/discounts/${id}`,
    STATUS: (id) => `/discounts/${id}/status`,
    USAGE: (id) => `/discounts/${id}/usage`,
    AUDIT: (id) => `/discounts/${id}/audit`,
  },

  // Commissions (Phase 9)
  COMMISSIONS: {
    BASE: '/commissions',
    SUMMARY: '/commissions/summary',
    CONTRACTOR_MY_COMMISSIONS: '/commissions',
    CONTRACTOR_SUMMARY: '/commissions/summary',
    BY_ID: (id) => `/commissions/${id}`,
    HISTORY: (id) => `/commissions/${id}/history`,
    ADMIN_ALL: '/commissions/admin/all',
    ADMIN_REVIEW: (id) => `/commissions/admin/${id}/review`,
    ADMIN_PAYMENT: (id) => `/commissions/admin/${id}/record-payment`,
  },

  // Contractor Verifications (Phase 10)
  VERIFICATIONS: {
    APPLY: '/contractors/me/verification/submit',
    STATUS: '/contractors/me',
    DOCUMENTS: '/contractors/me/verification/documents',
    DOCUMENT_BY_ID: (docId) => `/contractors/documents/${docId}/file`,
    ADMIN_ALL: '/contractors/admin/verifications',
    ADMIN_BY_CONTRACTOR: (contractorId) => `/contractors/admin/verifications/${contractorId}`,
    ADMIN_REVIEW_DECISION: (contractorId) => `/contractors/admin/verifications/${contractorId}/review`,
    ADMIN_DOC_REVIEW: (contractorId, docId) => `/contractors/admin/verifications/${contractorId}/documents/${docId}/review`,
  },

  // Audit Logs (Shared)
  AUDIT: {
    BASE: '/audit-logs',
    BY_ID: (id) => `/audit-logs/${id}`,
  },
};
