// =============================================
// Deck Estimator — Users Service
// =============================================

const User = require('./users.model');
const { NotFoundError } = require('../../shared/errors');

/**
 * Update allowed profile fields for a user.
 */
async function updateUserProfile(userId, updateData) {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) {
    throw new NotFoundError('User not found.');
  }

  if (updateData.fullName !== undefined) user.fullName = updateData.fullName.trim();
  if (updateData.phone !== undefined) user.phone = updateData.phone.trim();
  if (updateData.avatar !== undefined) user.avatar = updateData.avatar;
  if (updateData.preferredContactMethod !== undefined) {
    user.preferredContactMethod = updateData.preferredContactMethod;
  }
  if (updateData.address !== undefined) {
    user.address = {
      street: updateData.address.street !== undefined ? updateData.address.street.trim() : (user.address?.street || ''),
      city: updateData.address.city !== undefined ? updateData.address.city.trim() : (user.address?.city || ''),
      state: updateData.address.state !== undefined ? updateData.address.state.trim() : (user.address?.state || ''),
      zipCode: updateData.address.zipCode !== undefined ? updateData.address.zipCode.trim() : (user.address?.zipCode || ''),
      country: updateData.address.country !== undefined ? updateData.address.country.trim() : (user.address?.country || 'USA'),
    };
  }

  // Handle optional password change if current & new passwords are provided
  if (updateData.newPassword) {
    if (!updateData.currentPassword) {
      const { BadRequestError } = require('../../shared/errors');
      throw new BadRequestError('Current password is required to set a new password.');
    }
    const isMatch = await user.comparePassword(updateData.currentPassword);
    if (!isMatch) {
      const { BadRequestError } = require('../../shared/errors');
      throw new BadRequestError('Current password does not match.');
    }
    user.passwordHash = await User.hashPassword(updateData.newPassword);
  }

  await user.save();
  return user.toJSON();
}

module.exports = {
  updateUserProfile,
};
