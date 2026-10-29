// =============================================
// DECK PRO — Authorization Middleware
// =============================================
// Verifies role and permission checks after authentication.
// Must be used AFTER authenticate middleware.

/**
 * Create a middleware that restricts access to specific roles.
 * @param  {...string} allowedRoles - Roles permitted to access the route
 *   (e.g., 'admin', 'customer', 'contractor')
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication is required.',
        },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to perform this action.',
        },
      });
    }

    next();
  };
}

module.exports = { authorize };

