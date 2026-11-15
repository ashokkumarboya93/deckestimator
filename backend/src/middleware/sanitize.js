// =============================================
// Deck Estimator — NoSQL Injection Sanitizer
// =============================================
// Protects against NoSQL query operator injection ($where, $gt, $ne, etc.)
// and path injection by stripping forbidden characters from inputs.

function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    // Strip keys starting with '$' (MongoDB operator) or containing '.' (prototype / path pollution)
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    clean[key] = sanitizeObject(value);
  }
  return clean;
}

/**
 * Express middleware to sanitize body, query, and params.
 */
function sanitizeInput(req, res, next) {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  next();
}

module.exports = { sanitizeInput, sanitizeObject };

