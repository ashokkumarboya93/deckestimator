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
    BY_ID: (id) => `/leads/${id}`,
    ACTIVITIES: (id) => `/leads/${id}/activities`,
    NOTES: (id) => `/leads/${id}/notes`,
    ADMIN_ALL: '/leads/admin/all',
    ADMIN_ANALYTICS: '/leads/admin/analytics',
    ADMIN_ASSIGN: (id) => `/leads/admin/${id}/assign`,
    ADMIN_CLOSE: (id) => `/leads/admin/${id}/close`,
    ADMIN_HISTORY: (id) => `/leads/admin/${id}/history`,
    CONTRACTOR_INBOX: '/leads/contractor/inbox',
    CONTRACTOR_ACCEPT: (id) => `/leads/contractor/${id}/accept`,
    CONTRACTOR_REJECT: (id) => `/leads/contractor/${id}/reject`,
    CONTRACTOR_STATUS: (id) => `/leads/contractor/${id}/status`,
  },

  // Contractors & Verification (Phase 8)
  CONTRACTORS: {
    ME: '/contractors/me',
    SUBMIT_VERIFICATION: '/contractors/me/verification/submit',
    DOCUMENTS: '/contractors/me/verification/documents',
    DOCUMENT_FILE: (id) => `/contractors/documents/${id}/file`,
    ELIGIBLE: '/contractors/eligible',
    ADMIN_VERIFICATIONS: '/contractors/admin/verifications',
    ADMIN_VERIFICATION_BY_ID: (id) => `/contractors/admin/verifications/${id}`,
    ADMIN_VERIFICATION_REVIEW: (id) => `/contractors/admin/verifications/${id}/review`,
  },

  // Discounts (Phase 9)
  DISCOUNTS: {
    POLICIES: '/discounts/policies',
    POLICY_BY_ID: (id) => `/discounts/policies/${id}`,
    POLICY_STATUS: (id) => `/discounts/policies/${id}/status`,
    ASSIGN: (id) => `/discounts/policies/${id}/assign`,
    ASSIGNMENTS: (id) => `/discounts/policies/${id}/assignments`,
    REMOVE_ASSIGNMENT: (id, contractorId) => `/discounts/policies/${id}/assignments/${contractorId}`,
    APPLY_ESTIMATE: (estimateId) => `/discounts/estimates/${estimateId}/apply`,
    REMOVE_ESTIMATE: (estimateId) => `/discounts/estimates/${estimateId}/remove`,
    ESTIMATE_HISTORY: (estimateId) => `/discounts/estimates/${estimateId}/history`,
    CONTRACTOR_ELIGIBLE: '/discounts/contractor/eligible',
  },

  // Commissions (Phase 9)
  COMMISSIONS: {
    POLICIES: '/commissions/policies',
    POLICY_BY_ID: (id) => `/commissions/policies/${id}`,
    POLICY_STATUS: (id) => `/commissions/policies/${id}/status`,
    ADMIN_GENERATE: '/commissions/admin/generate',
    ADMIN_ALL: '/commissions/admin/all',
    ADMIN_REVIEW: (id) => `/commissions/admin/${id}/review`,
    ADMIN_RECORD_PAYMENT: (id) => `/commissions/admin/${id}/record-payment`,
    CONTRACTOR_MY_COMMISSIONS: '/commissions',
    CONTRACTOR_SUMMARY: '/commissions/summary',
    BY_ID: (id) => `/commissions/${id}`,
    HISTORY: (id) => `/commissions/${id}/history`,
  },

  // Admin (Phase 10/11)
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
  },
};

