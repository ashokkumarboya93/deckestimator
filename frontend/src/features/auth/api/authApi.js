// =============================================
// DECK PRO — Auth API Client
// =============================================

import apiClient from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';

export const authApi = {
  /**
   * Log in user with email and password.
   */
  async login(credentials) {
    return apiClient(ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Register a new user (Customer or Contractor).
   */
  async register(userData) {
    return apiClient(ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Log out the current user session.
   */
  async logout() {
    return apiClient(ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST',
    });
  },

  /**
   * Fetch current authenticated user.
   */
  async getMe() {
    return apiClient(ENDPOINTS.AUTH.ME, {
      method: 'GET',
    });
  },
};
