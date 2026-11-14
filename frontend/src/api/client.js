// =============================================
// Deck Estimator — API Client
// =============================================
// Shared HTTP client with safe defaults.
// All API calls go through this module.

const apiHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
export const BASE_URL = import.meta.env.VITE_API_URL || `http://${apiHost}:5000/api/v1`;

export const AUTH_TOKEN_KEY = 'deck_auth_token';
export const AUTH_SESSION_KEY = 'deck_auth_session';

/**
 * Retrieve the cached user session snapshot for instant reload hydration.
 */
export function getStoredSession() {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.user) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Persist a lightweight user session snapshot (avoids slow blocking Verifying session... on reload).
 */
export function setStoredSession(user, contractorProfile = null) {
  try {
    if (!user) {
      localStorage.removeItem(AUTH_SESSION_KEY);
      return;
    }
    const { avatar: _omitHeavyAvatar, ...lightUser } = user;
    const safeUser = {
      ...lightUser,
      ...(typeof user.avatar === 'string' && user.avatar.length < 32768 ? { avatar: user.avatar } : {}),
    };
    localStorage.setItem(
      AUTH_SESSION_KEY,
      JSON.stringify({ user: safeUser, contractorProfile: contractorProfile || null, cachedAt: Date.now() })
    );
  } catch {
    // Ignore storage quota or access errors
  }
}

/**
 * Retrieve the saved auth token from local storage.
 */
export function getStoredToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Persist the auth token in local storage.
 */
export function setStoredToken(token) {
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch {
    // Ignore storage quota or access errors
  }
}

/**
 * Remove the stored auth token and cached session.
 */
export function clearStoredToken() {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_SESSION_KEY);
  } catch {
    // Ignore storage errors
  }
}

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

  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    credentials: 'include', // Send cookies if browser permits (dual auth fallback)
    headers,
    ...options,
  };

  // Don't set Content-Type for FormData (file uploads)
  if (options.body instanceof FormData || config.headers['Content-Type'] === 'multipart/form-data') {
    delete config.headers['Content-Type'];
  }

  // Resilient execution with auto-retry on brief network blips / backend reload
  let lastError = null;
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url, config);
      let data = {};
      try {
        data = await response.json();
      } catch {
        // Non-JSON response
        data = {};
      }

      if (!response.ok) {
        // If server returns 401 with token invalid/expired/required, clear local stale token
        if (response.status === 401 && (data?.error?.code === 'TOKEN_EXPIRED' || data?.error?.code === 'INVALID_TOKEN')) {
          clearStoredToken();
        }

        const error = new Error(data?.error?.message || `Server error (${response.status})`);
        error.code = data?.error?.code || 'UNKNOWN_ERROR';
        error.status = response.status;
        error.details = data?.error?.details || [];
        throw error;
      }

      return data;
    } catch (err) {
      lastError = err;
      const isNetworkError = err.name === 'TypeError' || err.message?.toLowerCase().includes('fetch');

      // Retry up to 2 times for transient network/connection drops
      if (isNetworkError && attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, attempt * 350));
        continue;
      }

      if (isNetworkError) {
        const connError = new Error('Connection to Deck Estimator backend server failed. Please ensure the backend server is running.');
        connError.code = 'NETWORK_ERROR';
        throw connError;
      }

      throw err;
    }
  }

  throw lastError;
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

export { apiClient, apiClient as client };
export default apiClient;

