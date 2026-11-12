// =============================================
// Deck Estimator — API Client
// =============================================
// Shared HTTP client with safe defaults.
// All API calls go through this module.

const RAW_ENV_API_URL = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
export const API_BASE_URL =
  RAW_ENV_API_URL || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:5000/api/v1');
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1$/, '');

export function resolveAssetUrl(url) {
  if (!url) return '';
  if (/^(https?:|blob:|data:)/i.test(url)) return url;
  return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
}

const BASE_URL = API_BASE_URL;

const DEFAULT_TIMEOUT_MS = 30000;
const LONG_RUNNING_TIMEOUT_MS = 120000;
const LONG_RUNNING_PATH_PATTERNS = [
  '/analysis',
  '/condition-analysis',
  '/images',
  '/documents',
  '/upload-image',
  '/export',
  '/recalculate',
];

function resolveRequestTimeout(endpoint, options) {
  if (typeof options.timeoutMs === 'number') {
    return options.timeoutMs;
  }
  if (options.body instanceof FormData) {
    return LONG_RUNNING_TIMEOUT_MS;
  }
  const normalizedEndpoint = String(endpoint || '').toLowerCase();
  if (LONG_RUNNING_PATH_PATTERNS.some((pattern) => normalizedEndpoint.includes(pattern))) {
    return LONG_RUNNING_TIMEOUT_MS;
  }
  return DEFAULT_TIMEOUT_MS;
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

  const {
    params: _params,
    timeoutMs: _timeoutMs,
    retry: retryOption,
    signal: externalSignal,
    headers: customHeaders,
    ...restOptions
  } = options;

  const config = {
    credentials: 'include', // Send cookies for session auth
    headers: {
      'Content-Type': 'application/json',
      ...customHeaders,
    },
    ...restOptions,
  };

  // Don't set Content-Type for FormData (file uploads)
  if (options.body instanceof FormData || config.headers['Content-Type'] === 'multipart/form-data') {
    delete config.headers['Content-Type'];
  }

  const method = (config.method || 'GET').toUpperCase();
  const isSafeMethod = method === 'GET' || method === 'HEAD';
  const maxAttempts = isSafeMethod && retryOption !== false ? 3 : 1;
  const timeoutMs = resolveRequestTimeout(endpoint, options);

  // Resilient execution: auto-retry safe GET/HEAD requests only on transient network drops
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    let timedOut = false;
    let timeoutId = null;
    let removeAbortListener = null;

    if (externalSignal) {
      if (externalSignal.aborted) {
        controller.abort(externalSignal.reason);
      } else {
        const onExternalAbort = () => controller.abort(externalSignal.reason);
        externalSignal.addEventListener('abort', onExternalAbort, { once: true });
        removeAbortListener = () => externalSignal.removeEventListener('abort', onExternalAbort);
      }
    }

    if (timeoutMs > 0) {
      timeoutId = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, timeoutMs);
    }

    try {
      const response = await fetch(url, { ...config, signal: controller.signal });
      let data = {};
      try {
        data = await response.json();
      } catch {
        // Non-JSON response
        data = {};
      }

      if (!response.ok) {
        if (response.status === 401 && !endpoint.startsWith('/auth/') && typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('drp:unauthorized', {
              detail: { endpoint, code: data?.error?.code || 'AUTH_REQUIRED' },
            })
          );
        }
        const errorMessage =
          data?.error?.message ||
          data?.message ||
          `Server error (${response.status})`;
        const error = new Error(errorMessage);
        error.code = data?.error?.code || 'UNKNOWN_ERROR';
        error.status = response.status;
        error.details = data?.error?.details || [];
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      lastError = err;

      if (timedOut) {
        const timeoutError = new Error('The request timed out. Please check your connection and try again.');
        timeoutError.name = 'TimeoutError';
        timeoutError.code = 'TIMEOUT_ERROR';
        timeoutError.isTimeout = true;
        throw timeoutError;
      }

      if (err.name === 'AbortError') {
        throw err;
      }

      const isNetworkError = err.name === 'TypeError' || err.message?.toLowerCase().includes('fetch');

      // Retry only safe GET/HEAD requests up to 2 times for transient network/connection drops
      if (isSafeMethod && isNetworkError && attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, attempt * 350));
        continue;
      }

      if (isNetworkError) {
        const connError = new Error('Connection to Deck Estimator backend server failed. Please ensure the backend server is reachable.');
        connError.code = 'NETWORK_ERROR';
        throw connError;
      }

      throw err;
    } finally {
      if (timeoutId !== null) clearTimeout(timeoutId);
      if (removeAbortListener) removeAbortListener();
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

