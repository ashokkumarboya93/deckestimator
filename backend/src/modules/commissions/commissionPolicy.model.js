// =============================================
// Deck Estimator — Commission Policy Model (Phase 9)
// =============================================

const mongoose = require('mongoose');
const {
  COMMISSION_TYPE,
  COMMISSION_POLICY_STATUS,
  COMMISSION_CALCULATION_BASIS,
} = require('../../shared/constants');

const commissionPolicySchema = new mongoose.Schema(
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
    commissionType: {
      type: String,
      required: [true, 'Commission type is required'],
      enum: Object.values(COMMISSION_TYPE),
      default: COMMISSION_TYPE.PERCENTAGE,
      index: true,
    },
    commissionValue: {
      type: Number,
      required: [true, 'Commission value is required'],
      min: [0.01, 'Commission value must be greater than 0'],
      validate: {
        validator(val) {
          if (this.commissionType === COMMISSION_TYPE.PERCENTAGE) {
            return val > 0 && val <= 100;
          }
          return val > 0;
        },
        message: 'Percentage commission must be between 0.01 and 100',
      },
    },
    calculationBasis: {
      type: String,
      enum: Object.values(COMMISSION_CALCULATION_BASIS),
      default: COMMISSION_CALCULATION_BASIS.CONVERTED_ESTIMATE,
    },
    minimumCommissionAmount: {
      type: Number,
      min: [0, 'Minimum commission amount cannot be negative'],
      default: 0,
    },
    maximumCommissionAmount: {
      type: Number,
      min: [0, 'Maximum commission amount cannot be negative'],
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
    status: {
      type: String,
      enum: Object.values(COMMISSION_POLICY_STATUS),
      default: COMMISSION_POLICY_STATUS.DRAFT,
      index: true,
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

commissionPolicySchema.index({ status: 1, effectiveStartDate: 1, effectiveEndDate: 1 });

module.exports = mongoose.model('CommissionPolicy', commissionPolicySchema);
