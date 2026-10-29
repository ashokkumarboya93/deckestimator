// =============================================
// DECK PRO — Auth Controller
// =============================================

const authService = require('./auth.service');
const { env } = require('../../config/env');

// Cookie options for JWT
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.isProd, // true in production (HTTPS)
  sameSite: env.isProd ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * Handle user registration.
 */
async function register(req, res, next) {
  try {
    const result = await authService.registerUser(req.body);

    res.cookie('token', result.token, COOKIE_OPTIONS);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle user login.
 */
async function login(req, res, next) {
  try {
    const result = await authService.loginUser(req.body);

    res.cookie('token', result.token, COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle user logout.
 */
async function logout(req, res, next) {
  try {
    res.clearCookie('token', COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      data: {
        message: 'Logged out successfully.',
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Return current authenticated user.
 */
async function getMe(req, res, next) {
  try {
    const result = await authService.getCurrentUser(req.user.id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  logout,
  getMe,
};
