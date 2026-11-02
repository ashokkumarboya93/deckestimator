// =============================================
// Deck Estimator — Authentication Middleware
// =============================================
// Verifies JWT tokens and verifies active account status in MongoDB.

const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const User = require('../modules/users/users.model');
const { ACCOUNT_STATUS } = require('../shared/constants');

/**
 * Authenticate the current request by verifying the JWT token
 * and asserting the user's active account status in MongoDB.
 * Attaches req.user with { id, role, email } on success.
 */
async function authenticate(req, res, next) {
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

    // Verify user exists and account status is active
    const user = await User.findById(decoded.id).select('accountStatus role email');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'The account associated with this session no longer exists.',
        },
      });
    }

    if (user.accountStatus === ACCOUNT_STATUS.SUSPENDED) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_SUSPENDED',
          message: 'Your account has been suspended. Please contact support.',
        },
      });
    }

    if (user.accountStatus === ACCOUNT_STATUS.DISABLED) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_DISABLED',
          message: 'Your account is disabled.',
        },
      });
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
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

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Authentication token is invalid.',
        },
      });
    }

    next(error);
  }
}

/**
 * Optional authentication — sets req.user if a valid token exists
 * and account is active, but does not reject unauthenticated requests.
 */
async function optionalAuth(req, res, next) {
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
      const user = await User.findById(decoded.id).select('accountStatus role email');
      if (user && user.accountStatus === ACCOUNT_STATUS.ACTIVE) {
        req.user = { id: user._id.toString(), role: user.role, email: user.email };
      } else {
        req.user = null;
      }
    }
  } catch {
    // Silently ignore invalid tokens for optional auth
    req.user = null;
  }
  next();
}

module.exports = { authenticate, optionalAuth };
