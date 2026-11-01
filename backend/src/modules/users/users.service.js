// =============================================
// Deck Estimator — Users Service
// =============================================

const User = require('./users.model');
const { NotFoundError } = require('../../shared/errors');

/**
 * Update allowed profile fields for a user.
 */
async function updateUserProfile(userId, updateData) {
  const allowedUpdates = {};
  if (updateData.fullName !== undefined) allowedUpdates.fullName = updateData.fullName.trim();
  if (updateData.phone !== undefined) allowedUpdates.phone = updateData.phone.trim();

  const user = await User.findByIdAndUpdate(userId, allowedUpdates, {
    returnDocument: 'after',
    runValidators: true,
  });

  if (!user) {
    throw new NotFoundError('User not found.');
  }

  return user.toJSON();
}

module.exports = {
  updateUserProfile,
};
