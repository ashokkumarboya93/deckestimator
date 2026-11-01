// =============================================
// Deck Estimator — Discount Policy Model (Phase 9)
// =============================================

const mongoose = require('mongoose');
const {
  DISCOUNT_TYPE,
  DISCOUNT_POLICY_STATUS,
  DISCOUNT_APPLICABILITY,
} = require('../../shared/constants');

const discountPolicySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Policy name is required'],
      trim: true,
      maxlength: [120, 'Policy name cannot exceed 120 characters'],
    },
    code: {
      type: String,
      required: [true, 'Policy code is required'],
      trim: true,
      uppercase: true,
      unique: true,
      minlength: [3, 'Policy code must be at least 3 characters'],
      maxlength: [30, 'Policy code cannot exceed 30 characters'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    discountType: {
      type: String,
      required: [true, 'Discount type is required'],
      enum: Object.values(DISCOUNT_TYPE),
      default: DISCOUNT_TYPE.PERCENTAGE,
      index: true,
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0.01, 'Discount value must be greater than 0'],
      validate: {
        validator(val) {
          if (this.discountType === DISCOUNT_TYPE.PERCENTAGE) {
            return val > 0 && val <= 100;
          }
          return val > 0;
        },
        message: 'Percentage discount must be between 0.01 and 100',
      },
    },
    applicability: {
      type: String,
      enum: Object.values(DISCOUNT_APPLICABILITY),
      default: DISCOUNT_APPLICABILITY.ALL,
    },
    minimumEstimateAmount: {
      type: Number,
      min: [0, 'Minimum estimate amount cannot be negative'],
      default: 0,
    },
    maximumDiscountAmount: {
      type: Number,
      min: [0, 'Maximum discount amount cannot be negative'],
      default: null,
    },
    effectiveStartDate: {
      type: Date,
      default: Date.now,
    },
    effectiveEndDate: {
      type: Date,
      default: null,
    },
    usageLimit: {
      type: Number,
      min: [1, 'Usage limit must be at least 1'],
      default: null,
    },
    timesUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(DISCOUNT_POLICY_STATUS),
      default: DISCOUNT_POLICY_STATUS.DRAFT,
      index: true,
    },
    isGeneralEligibility: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by user ID is required'],
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

discountPolicySchema.index({ status: 1, effectiveStartDate: 1, effectiveEndDate: 1 });

module.exports = mongoose.model('DiscountPolicy', discountPolicySchema);
