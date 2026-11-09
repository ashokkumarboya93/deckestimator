// =============================================
// Deck Estimator — Users Controller
// =============================================

const usersService = require('./users.service');
const authService = require('../auth/auth.service');
const UserRequest = require('./userRequest.model');

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

/**
 * Submit appeal / unblock request for blocked or suspended user.
 */
async function submitUnblockRequest(req, res, next) {
  try {
    const { message, phone } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Appeal message is required.' });
    }

    const request = await UserRequest.create({
      userId: req.user.id || req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      phone: phone || req.user.phone || '',
      role: req.user.role,
      requestType: 'unblock_account',
      message: message.trim(),
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Your reactivation appeal has been submitted to Deck Restoration Plus Team.',
      data: request,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get latest unblock request status for current user.
 */
async function getUnblockRequestStatus(req, res, next) {
  try {
    const latestRequest = await UserRequest.findOne({ userId: req.user.id || req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: latestRequest || null,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  submitUnblockRequest,
  getUnblockRequestStatus,
};
