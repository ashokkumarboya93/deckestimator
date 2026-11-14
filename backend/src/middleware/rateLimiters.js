// =============================================
// Deck Estimator — Rate Limiting Middleware
// =============================================
// Protects authentication and abuse-prone endpoints.

const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter.
 * Supports high concurrency (~150-300 simultaneous active users) without false 429s.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 1200 : 5000,
  skip: () => process.env.NODE_ENV === 'test',
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
    },
  },
});

/**
 * Auth rate limiter for login/register endpoints.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 60 : 300,
  skip: () => process.env.NODE_ENV === 'test',
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please try again later.',
    },
  },
});

/**
 * Upload rate limiter to prevent denial of service and storage exhaustion.
 * Bypassed in test environment.
 */
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  skip: () => process.env.NODE_ENV === 'test',
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many upload attempts. Please try again later.',
    },
  },
});

module.exports = { apiLimiter, authLimiter, uploadLimiter };

