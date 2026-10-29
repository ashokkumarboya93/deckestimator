// =============================================
// DECK PRO — Date Formatting
// =============================================

/**
 * Format a date string or Date object for display.
 * @param {string|Date} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  if (!date) return '';

  const defaults = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };

  return new Intl.DateTimeFormat('en-US', defaults).format(new Date(date));
}

/**
 * Format a date with time.
 */
export function formatDateTime(date) {
  return formatDate(date, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

