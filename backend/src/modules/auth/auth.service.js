// =============================================
// DECK PRO — Auth Service
// =============================================

const jwt = require('jsonwebtoken');
const User = require('../users/users.model');
const ContractorProfile = require('../contractors/contractorProfile.model');
const { env } = require('../../config/env');
const { ROLES, ACCOUNT_STATUS, VERIFICATION_STATUS } = require('../../shared/constants');
const { ConflictError, UnauthorizedError, ForbiddenError, NotFoundError } = require('../../shared/errors');

/**
 * Generate a JWT token for an authenticated user.
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id || user._id,
      role: user.role,
      email: user.email,
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN,
    }
  );
}

/**
 * Register a new user (Customer or Contractor).
 * Never permits public creation of Admin accounts.
 */
async function registerUser(userData) {
  const normalizedEmail = userData.email.trim().toLowerCase();

  // Check for existing user
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new ConflictError('An account with this email already exists.');
  }

  // Hash password
  const passwordHash = await User.hashPassword(userData.password);

  const role = userData.role || ROLES.CUSTOMER;
  const initialAccountStatus =
    role === ROLES.CONTRACTOR
      ? ACCOUNT_STATUS.PENDING_VERIFICATION
      : ACCOUNT_STATUS.ACTIVE;

  // Create User
  let user;
  try {
    user = await User.create({
      fullName: userData.fullName.trim(),
      email: normalizedEmail,
      phone: userData.phone ? userData.phone.trim() : '',
      passwordHash,
      role,
      accountStatus: initialAccountStatus,
    });
  } catch (err) {
    if (err.code === 11000) {
      throw new ConflictError('An account with this email already exists.');
    }
    throw err;
  }

  let contractorProfile = null;

  // Create Contractor Profile if role is contractor
  if (role === ROLES.CONTRACTOR) {
    try {
      contractorProfile = await ContractorProfile.create({
        userId: user._id,
        businessName: userData.businessName.trim(),
        businessEmail: normalizedEmail,
        businessPhone: userData.phone ? userData.phone.trim() : '',
        licenseNumber: userData.licenseNumber.trim(),
        licenseJurisdiction: userData.licenseJurisdiction ? userData.licenseJurisdiction.trim() : '',
        verificationStatus: VERIFICATION_STATUS.PENDING,
      });
    } catch (profileErr) {
      // Clean up orphaned user record if contractor profile creation fails
      await User.findByIdAndDelete(user._id);
      throw profileErr;
    }
  }

  const token = generateToken(user);

  return {
    user: user.toJSON(),
    token,
    contractorProfile: contractorProfile ? contractorProfile.toJSON() : null,
  };
}

/**
 * Login user with email and password.
 */
async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  // Find user and explicitly include passwordHash
  const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
  if (!user) {
    throw new UnauthorizedError('Invalid email or password.');
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid email or password.');
  }

  // Check account status
  if (user.accountStatus === ACCOUNT_STATUS.SUSPENDED) {
    throw new ForbiddenError('Your account has been suspended. Please contact support.');
  }
  if (user.accountStatus === ACCOUNT_STATUS.DISABLED) {
    throw new ForbiddenError('Your account is disabled.');
  }

  // Update last login timestamp
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  let contractorProfile = null;
  if (user.role === ROLES.CONTRACTOR) {
    contractorProfile = await ContractorProfile.findOne({ userId: user._id });
  }

  const token = generateToken(user);

  return {
    user: user.toJSON(),
    token,
    contractorProfile: contractorProfile ? contractorProfile.toJSON() : null,
  };
}

/**
 * Get current authenticated user details.
 */
async function getCurrentUser(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found.');
  }

  let contractorProfile = null;
  if (user.role === ROLES.CONTRACTOR) {
    contractorProfile = await ContractorProfile.findOne({ userId: user._id });
  }

  return {
    user: user.toJSON(),
    contractorProfile: contractorProfile ? contractorProfile.toJSON() : null,
  };
}

module.exports = {
  generateToken,
  registerUser,
  loginUser,
  getCurrentUser,
};
