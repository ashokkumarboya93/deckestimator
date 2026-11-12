// =============================================
// Deck Estimator — API Error Normalizer
// =============================================
// Turns API error responses into predictable UI messages.

/**
 * Extract the HTTP status code from an API error if present.
 * @param {Error} error - Error thrown by apiClient
 * @returns {number|null}
 */
export function getErrorStatus(error) {
  if (!error) return null;
  if (typeof error.status === 'number') return error.status;
  if (typeof error?.response?.status === 'number') return error.response.status;
  return null;
}

/**
 * Extract a user-friendly error message from an API error.
 * @param {Error} error - Error thrown by apiClient
 * @returns {string} Human-readable error message
 */
export function getErrorMessage(error, fallback = 'An unexpected error occurred. Please try again.') {
  if (!error) return fallback || 'An unknown error occurred.';

  if (error.code === 'TIMEOUT_ERROR' || error.isTimeout || error.name === 'TimeoutError') {
    return error.message || 'The request timed out. Please try again.';
  }

  if (error.code === 'NETWORK_ERROR' || error.message === 'Failed to fetch') {
    return error.message || 'Unable to connect to the server. Please check your connection.';
  }

  const nestedMessage =
    error?.data?.error?.message ||
    error?.data?.message ||
    error?.response?.data?.error?.message ||
    error?.response?.data?.message;

  if (nestedMessage) {
    return nestedMessage;
  }

  if (error.message) {
    return error.message;
  }

  return fallback;
}

/**
 * Extract field-level validation errors from an API error.
 * @param {Error} error - Error thrown by apiClient
 * @returns {Object} Map of field names to error messages
 */
export function getFieldErrors(error) {
  const fieldErrors = {};
  const details = error?.details || error?.data?.error?.details;

  if (Array.isArray(details)) {
    details.forEach((detail) => {
      if (detail.field) {
        fieldErrors[detail.field] = detail.message;
      }
    });
  }

  return fieldErrors;
}

