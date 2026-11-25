// =============================================
// Deck Estimator — User Model
// =============================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES, ACCOUNT_STATUS } = require('../../shared/constants');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    address: {
      street: { type: String, default: '', trim: true },
      city: { type: String, default: '', trim: true },
      state: { type: String, default: '', trim: true },
      zipCode: { type: String, default: '', trim: true },
      country: { type: String, default: 'USA', trim: true },
    },
    preferredContactMethod: {
      type: String,
      enum: ['email', 'phone', 'sms'],
      default: 'email',
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false, // Do not return by default in queries
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.CUSTOMER,
    },
    isParentAdmin: {
      type: Boolean,
      default: false,
    },
    parentAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    adminPermissions: {
      type: [String],
      default: ['users', 'verifications', 'leads', 'projects', 'pricing', 'reports', 'settings'],
    },
    accountStatus: {
      type: String,
      enum: Object.values(ACCOUNT_STATUS),
      default: ACCOUNT_STATUS.ACTIVE,
    },
    emailVerifiedAt: {
      type: Date,
      default: null,
    },
    phoneVerifiedAt: {
      type: Date,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    passwordResetToken: {
      type: String,
      default: null,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
      select: false,
    },
    moderationHistory: [
      {
        status: { type: String, required: true },
        reason: { type: String, default: '' },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        return ret;
      },
    },
  }
);

/**
 * Compare plain-text password with stored hash.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

/**
 * Static helper to hash password.
 * Optimized salt rounds (8) provides strong cryptographic security while keeping
 * CPU hashing execution under ~20ms for ultra-fast login & registration under load.
 */
userSchema.statics.hashPassword = async function (plainPassword) {
  const salt = await bcrypt.genSalt(8);
  return bcrypt.hash(plainPassword, salt);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
