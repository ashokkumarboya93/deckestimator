// =============================================
// Deck Estimator — Auth API Client
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
   * Log in administrator specifically via dedicated endpoint.
   */
  async adminLogin(credentials) {
    return apiClient('/auth/admin/login', {
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

  /**
   * Request password reset token.
   */
  async forgotPassword(email) {
    return apiClient(ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Reset password with token.
   */
  async resetPassword({ token, newPassword, confirmPassword }) {
    return apiClient(ENDPOINTS.AUTH.RESET_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ token, newPassword, confirmPassword }),
    });
  },
};
