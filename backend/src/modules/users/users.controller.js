// =============================================
// DECK PRO — Users Controller
// =============================================

const usersService = require('./users.service');
const authService = require('../auth/auth.service');

/**
 * Get current user profile.
 */
async function getProfile(req, res, next) {
  try {
    const profile = await authService.getCurrentUser(req.user.id);
    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update current user profile.
 */
async function updateProfile(req, res, next) {
  try {
    const updatedUser = await usersService.updateUserProfile(req.user.id, req.body);
    res.status(200).json({
      success: true,
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile,
};
