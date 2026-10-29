// =============================================
// DECK PRO — API Error Normalizer
// =============================================
// Turns API error responses into predictable UI messages.

/**
 * Extract a user-friendly error message from an API error.
 * @param {Error} error - Error thrown by apiClient
 * @returns {string} Human-readable error message
 */
export function getErrorMessage(error) {
  if (!error) return 'An unknown error occurred.';

  // Network errors
  if (error.message === 'Failed to fetch') {
    return 'Unable to connect to the server. Please check your connection.';
  }

  // API errors with message
  if (error.message) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Extract field-level validation errors from an API error.
 * @param {Error} error - Error thrown by apiClient
 * @returns {Object} Map of field names to error messages
 */
export function getFieldErrors(error) {
  const fieldErrors = {};

  if (error?.details && Array.isArray(error.details)) {
    error.details.forEach((detail) => {
      if (detail.field) {
        fieldErrors[detail.field] = detail.message;
      }
    });
  }

  return fieldErrors;
}
