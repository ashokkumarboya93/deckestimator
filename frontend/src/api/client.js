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
  let url = `${BASE_URL}${endpoint}`;

  if (options.params) {
    const query = new URLSearchParams();
    Object.entries(options.params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const config = {
    credentials: 'include', // Send cookies for session auth
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Don't set Content-Type for FormData (file uploads)
  if (options.body instanceof FormData || config.headers['Content-Type'] === 'multipart/form-data') {
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

apiClient.get = (endpoint, options = {}) => apiClient(endpoint, { method: 'GET', ...options });

apiClient.post = (endpoint, body, options = {}) =>
  apiClient(endpoint, {
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body),
    ...options,
  });

apiClient.put = (endpoint, body, options = {}) =>
  apiClient(endpoint, {
    method: 'PUT',
    body: body instanceof FormData ? body : JSON.stringify(body),
    ...options,
  });

apiClient.patch = (endpoint, body, options = {}) =>
  apiClient(endpoint, {
    method: 'PATCH',
    body: body instanceof FormData ? body : JSON.stringify(body),
    ...options,
  });

apiClient.delete = (endpoint, options = {}) => apiClient(endpoint, { method: 'DELETE', ...options });

export { apiClient as client };
export default apiClient;

