// =============================================
// Deck Estimator — Rate Limiting Middleware
// =============================================
// Protects authentication and abuse-prone endpoints.

const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter.
 * 100 requests per 15 minutes per IP.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
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
 * Strict rate limiter for authentication endpoints.
 * 10 requests per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
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
 * 30 upload requests per 15 minutes per IP (bypassed in test environment).
 */
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
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

