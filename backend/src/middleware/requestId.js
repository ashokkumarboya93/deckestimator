// =============================================
// DECK PRO — Request ID Middleware
// =============================================
// Attaches a unique correlation ID to each request for tracing.

const crypto = require('crypto');

/**
 * Attach a unique request ID to each incoming request.
 * Uses the X-Request-ID header if provided, otherwise generates one.
 */
function requestId(req, res, next) {
  const id = req.headers['x-request-id'] || crypto.randomUUID();
  req.requestId = id;
  res.setHeader('X-Request-ID', id);
  next();
}

module.exports = { requestId };
