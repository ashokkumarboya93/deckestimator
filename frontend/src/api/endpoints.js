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

  // Leads (Phase 10)
  LEADS: {
    BASE: '/leads',
    BY_ID: (id) => `/leads/${id}`,
  },

  // Contractors (Phase 10)
  CONTRACTORS: {
    ME: '/contractors/me',
    APPLICATION: '/contractors/application',
    STATUS: '/contractors/me/status',
  },

  // Admin (Phase 11)
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
  },
};

