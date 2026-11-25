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
    const { message, phone, fullName } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Appeal message is required.' });
    }

    const User = require('./users.model');
    const userDoc = await User.findById(req.user.id || req.user._id);

    const resolvedFullName = (fullName && fullName.trim()) || userDoc?.fullName || req.user?.fullName || 'User';
    const resolvedEmail = userDoc?.email || req.user?.email || 'unknown@deckestimator.com';
    const resolvedRole = userDoc?.role || req.user?.role || 'customer';
    const resolvedPhone = (phone && phone.trim()) || userDoc?.phone || req.user?.phone || '';

    const request = await UserRequest.create({
      userId: userDoc?._id || req.user.id || req.user._id,
      fullName: resolvedFullName,
      email: resolvedEmail,
      phone: resolvedPhone,
      role: resolvedRole,
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

/**
 * Permanently delete the authenticated user's own account and associated profile records.
 */
async function deleteMyAccount(req, res, next) {
  try {
    const userId = req.user.id || req.user._id;
    const User = require('./users.model');
    const ContractorProfile = require('../contractors/contractorProfile.model');
    const VerificationDocument = require('../contractors/verificationDocument.model');
    const DiscountAssignment = require('../discounts/discountAssignment.model');
    const Notification = require('../notifications/notification.model');
    const { invalidateAuthCache } = require('../../middleware/authenticate');

    const userDoc = await User.findById(userId).select('role email');
    if (!userDoc) {
      return res.status(404).json({ success: false, message: 'Account not found.' });
    }
    if (String(userDoc.role).toLowerCase() === 'admin') {
      return res.status(403).json({ success: false, message: 'Administrator accounts cannot be self-deleted from this endpoint.' });
    }

    await Promise.all([
      User.findByIdAndDelete(userId),
      ContractorProfile.deleteOne({ userId }),
      VerificationDocument.deleteMany({ userId }),
      DiscountAssignment.deleteMany({ contractorId: userId }),
      UserRequest.deleteMany({ userId }),
      Notification.deleteMany({ userId }),
    ]);

    invalidateAuthCache(userId);
    res.clearCookie('accessToken', { httpOnly: true, sameSite: 'lax' });

    res.status(200).json({
      success: true,
      message: 'Your account has been permanently deleted from the database.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  deleteMyAccount,
  submitUnblockRequest,
  getUnblockRequestStatus,
};
