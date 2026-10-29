// =============================================
// DECK PRO — API Endpoint Constants
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

  // Decks (Phase 6)
  DECKS: {
    BASE: '/decks',
    BY_ID: (id) => `/decks/${id}`,
  },

  // Files (Phase 6)
  FILES: {
    UPLOAD: '/files/upload',
    BY_ID: (id) => `/files/${id}`,
  },

  // Estimates (Phase 8)
  ESTIMATES: {
    BASE: '/estimates',
    BY_ID: (id) => `/estimates/${id}`,
    REPORT: (id) => `/estimates/${id}/report`,
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
