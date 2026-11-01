// =============================================
// Deck Estimator — API Client
// =============================================
// Shared HTTP client with safe defaults.
// All API calls go through this module.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

/**
 * Make an API request with consistent error handling.
 * @param {string} endpoint - API path (e.g., '/auth/login')
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Parsed JSON response
 */
async function apiClient(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  const config = {
    credentials: 'include', // Send cookies for session auth
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Don't set Content-Type for FormData (file uploads)
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data?.error?.message || 'An error occurred');
    error.code = data?.error?.code || 'UNKNOWN_ERROR';
    error.status = response.status;
    error.details = data?.error?.details || [];
    throw error;
  }

  return data;
}

export default apiClient;

