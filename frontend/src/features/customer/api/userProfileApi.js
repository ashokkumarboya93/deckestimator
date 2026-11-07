// =============================================
// Deck Estimator — Customer User Profile API
// =============================================

import { apiClient } from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';

export const userProfileApi = {
  /**
   * Get current user profile details
   */
  async getProfile() {
    return apiClient(ENDPOINTS.USERS.ME, {
      method: 'GET',
    });
  },

  /**
   * Update profile fields (fullName, phone, avatar, address, preferredContactMethod, password)
   */
  async updateProfile(profileData) {
    return apiClient(ENDPOINTS.USERS.ME, {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  },
};

