// =============================================
// Deck Estimator — Users Service
// =============================================

const User = require('./users.model');
const { NotFoundError, BadRequestError } = require('../../shared/errors');
const { invalidateAuthCache } = require('../../middleware/authenticate');
const { persistAvatarIfBase64 } = require('../../shared/utils/avatarStorage');

function serializeLeanUser(doc) {
  if (!doc) return null;
  const { _id, __v, passwordHash, ...rest } = doc;
  return {
    ...rest,
    id: String(_id),
    _id: String(_id),
  };
}

/**
 * Update allowed profile fields for a user.
 * Fast path uses atomic findByIdAndUpdate + .lean() when password is unchanged.
 */
async function updateUserProfile(userId, updateData) {
  const isPasswordChange = Boolean(updateData.newPassword);

  if (isPasswordChange) {
    const user = await User.findById(userId).select('+passwordHash');
    if (!user) {
      throw new NotFoundError('User not found.');
    }
    if (!updateData.currentPassword) {
      throw new BadRequestError('Current password is required to set a new password.');
    }
    const isMatch = await user.comparePassword(updateData.currentPassword);
    if (!isMatch) {
      throw new BadRequestError('Current password does not match.');
    }

    if (updateData.fullName !== undefined) user.fullName = updateData.fullName.trim();
    if (updateData.phone !== undefined) user.phone = updateData.phone.trim();
    if (updateData.avatar !== undefined) user.avatar = persistAvatarIfBase64(user._id, updateData.avatar);
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

    user.passwordHash = await User.hashPassword(updateData.newPassword);
    await user.save();
    invalidateAuthCache(user._id);
    return user.toJSON();
  }

  // Fast single-query atomic update without loading passwordHash
  const setFields = {};
  if (updateData.fullName !== undefined) setFields.fullName = updateData.fullName.trim();
  if (updateData.phone !== undefined) setFields.phone = updateData.phone.trim();
  if (updateData.avatar !== undefined) setFields.avatar = persistAvatarIfBase64(userId, updateData.avatar);
  if (updateData.preferredContactMethod !== undefined) {
    setFields.preferredContactMethod = updateData.preferredContactMethod;
  }
  if (updateData.address !== undefined) {
    if (updateData.address.street !== undefined) setFields['address.street'] = updateData.address.street.trim();
    if (updateData.address.city !== undefined) setFields['address.city'] = updateData.address.city.trim();
    if (updateData.address.state !== undefined) setFields['address.state'] = updateData.address.state.trim();
    if (updateData.address.zipCode !== undefined) setFields['address.zipCode'] = updateData.address.zipCode.trim();
    if (updateData.address.country !== undefined) setFields['address.country'] = updateData.address.country.trim() || 'USA';
  }

  const updated = await User.findByIdAndUpdate(
    userId,
    { $set: setFields },
    { new: true, runValidators: true }
  ).lean();

  if (!updated) {
    throw new NotFoundError('User not found.');
  }

  invalidateAuthCache(updated._id);
  return serializeLeanUser(updated);
}

module.exports = {
  updateUserProfile,
};
