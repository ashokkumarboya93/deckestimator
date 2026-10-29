// =============================================
// DECK PRO — Centralized Error Handler
// =============================================
// Catches all errors and returns safe, consistent responses.
// NEVER exposes stack traces, credentials, or internal details in production.

const { env } = require('../config/env');

/**
 * Global Express error handler.
 * Must be registered as the last middleware.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  // Log the error (safe details only)
  console.error(`[Error] ${req.method} ${req.originalUrl}`, {
    requestId: req.requestId,
    message: err.message,
    ...(env.isDev && { stack: err.stack }),
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Database validation failed.',
        details,
      },
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_RESOURCE',
        message: `A record with this ${field} already exists.`,
      },
    });
  }

  // Mongoose cast error (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ID',
        message: `Invalid identifier format: ${err.value}`,
      },
    });
  }

  // JWT errors (handled in authenticate, but catch here as fallback)
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication error.',
      },
    });
  }

  // Joi validation error (if thrown rather than handled in validate middleware)
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed.',
        details: err.details.map((d) => ({
          field: d.path.join('.'),
          message: d.message,
        })),
      },
    });
  }

  // Application-specific errors with statusCode
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code || 'APPLICATION_ERROR',
        message: err.message || 'An application error occurred.',
      },
    });
  }

  // Default: 500 Internal Server Error
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: env.isDev
        ? err.message
        : 'An unexpected error occurred. Please try again later.',
    },
  });
}

module.exports = { errorHandler };
