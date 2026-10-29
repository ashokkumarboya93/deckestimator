// =============================================
// DECK PRO — Currency Formatting
// =============================================
// Presentation formatting ONLY.
// Must NOT calculate authoritative estimate totals.

/**
 * Format a number as currency.
 * @param {number} amount - The numeric amount
 * @param {string} currency - ISO 4217 currency code (default: 'USD')
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
