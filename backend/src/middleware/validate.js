// =============================================
// Deck Estimator — Request Validation Middleware
// =============================================
// Validates request body, params, and query using Joi schemas.

const Joi = require('joi');

/**
 * Normalize Joi validation error details into a consistent API shape.
 */
function mapJoiDetails(error, type) {
  return error.details.map((d) => ({
    field: d.path.join('.'),
    message: d.message,
    type,
  }));
}

/**
 * Create validation middleware for a Joi schema.
 * Supports both structured { body, params, query } schema maps
 * and single Joi schemas (validated against req[target || 'body']).
 * @param {Object|import('joi').Schema} schema
 * @param {'body'|'params'|'query'} [target]
 */
function validate(schema, target = null) {
  const resolved = Joi.isSchema(schema)
    ? { [target || 'body']: schema }
    : (schema || {});

  return (req, res, next) => {
    const errors = [];

    if (resolved.body) {
      const { error, value } = resolved.body.validate(req.body, { abortEarly: false });
      if (error) {
        errors.push(...mapJoiDetails(error, 'body'));
      } else if (value !== undefined) {
        req.body = value;
      }
    }

    if (resolved.params) {
      const { error, value } = resolved.params.validate(req.params, { abortEarly: false });
      if (error) {
        errors.push(...mapJoiDetails(error, 'params'));
      } else if (value && typeof value === 'object') {
        Object.assign(req.params, value);
      }
    }

    if (resolved.query) {
      const { error } = resolved.query.validate(req.query, { abortEarly: false });
      if (error) {
        errors.push(...mapJoiDetails(error, 'query'));
      }
    }

    if (errors.length > 0) {
      const detailedMsg = errors.map((e) => e.message).join('; ');
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: detailedMsg || 'Please correct the invalid input.',
          details: errors,
        },
      });
    }

    next();
  };
}

module.exports = { validate };

