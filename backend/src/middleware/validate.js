// =============================================
// Deck Estimator — Request Validation Middleware
// =============================================
// Validates request body, params, and query using Joi schemas.

/**
 * Create validation middleware for a Joi schema.
 * @param {Object} schema - Joi schema object with optional keys:
 *   { body, params, query }
 */
function validate(schema) {
  return (req, res, next) => {
    const errors = [];

    if (schema.body) {
      const { error } = schema.body.validate(req.body, { abortEarly: false });
      if (error) {
        errors.push(
          ...error.details.map((d) => ({
            field: d.path.join('.'),
            message: d.message,
            type: 'body',
          }))
        );
      }
    }

    if (schema.params) {
      const { error } = schema.params.validate(req.params, { abortEarly: false });
      if (error) {
        errors.push(
          ...error.details.map((d) => ({
            field: d.path.join('.'),
            message: d.message,
            type: 'params',
          }))
        );
      }
    }

    if (schema.query) {
      const { error } = schema.query.validate(req.query, { abortEarly: false });
      if (error) {
        errors.push(
          ...error.details.map((d) => ({
            field: d.path.join('.'),
            message: d.message,
            type: 'query',
          }))
        );
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please correct the invalid input.',
          details: errors,
        },
      });
    }

    next();
  };
}

module.exports = { validate };

