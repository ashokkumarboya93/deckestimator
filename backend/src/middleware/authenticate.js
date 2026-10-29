// =============================================
// DECK PRO — Authentication Middleware
// =============================================
// Verifies JWT tokens and establishes the authenticated principal.
// Full implementation in Phase 5 (Authentication).

const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

/**
 * Authenticate the current request by verifying the JWT token.
 * Attaches req.user with { id, role, email } on success.
 */
function authenticate(req, res, next) {
  try {
    // Check Authorization header first, then cookie
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication is required to access this resource.',
        },
      });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Authentication token has expired. Please log in again.',
        },
      });
    }

    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Authentication token is invalid.',
      },
    });
  }
}

/**
 * Optional authentication — sets req.user if a valid token exists
 * but does not reject unauthenticated requests.
 */
function optionalAuth(req, res, next) {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      req.user = { id: decoded.id, role: decoded.role, email: decoded.email };
    }
  } catch {
    // Silently ignore invalid tokens for optional auth
    req.user = null;
  }
  next();
}

module.exports = { authenticate, optionalAuth };

