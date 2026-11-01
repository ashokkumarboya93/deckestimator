// =============================================
// Deck Estimator — Commission Model (Phase 9)
// =============================================

const mongoose = require('mongoose');
const {
  COMMISSION_TYPE,
  COMMISSION_STATUS,
  COMMISSION_CALCULATION_BASIS,
} = require('../../shared/constants');

const commissionSchema = new mongoose.Schema(
  {
    commissionReference: {
      type: String,
      required: [true, 'Commission reference is required'],
      unique: true,
      trim: true,
      index: true,
    },
    contractorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Contractor ID is required'],
      index: true,
    },
    contractorProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ContractorProfile',
      default: null,
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: [true, 'Associated lead ID is required'],
      index: true,
    },
    estimateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Estimate',
      default: null,
    },
    commissionPolicyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommissionPolicy',
      required: [true, 'Commission policy ID is required'],
      index: true,
    },
    policySnapshot: {
      policyId: { type: mongoose.Schema.Types.ObjectId, required: true },
      name: { type: String, required: true },
      code: { type: String, required: true },
      commissionType: { type: String, required: true },
      commissionValue: { type: Number, required: true },
      calculationBasis: { type: String, required: true },
      minimumCommissionAmount: { type: Number, default: 0 },
      maximumCommissionAmount: { type: Number, default: null },
    },
    conversionReference: {
      type: String,
      trim: true,
      default: '',
    },
    calculationBasis: {
      type: String,
      enum: Object.values(COMMISSION_CALCULATION_BASIS),
      default: COMMISSION_CALCULATION_BASIS.CONVERTED_ESTIMATE,
    },
    basisAmount: {
      type: Number,
      required: [true, 'Calculation basis amount is required'],
      min: [0, 'Basis amount cannot be negative'],
    },
    commissionType: {
      type: String,
      enum: Object.values(COMMISSION_TYPE),
      required: true,
    },
    commissionValue: {
      type: Number,
      required: true,
      min: 0,
    },
    calculatedAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    approvedAmount: {
      type: Number,
      default: null,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(COMMISSION_STATUS),
      default: COMMISSION_STATUS.PENDING,
      index: true,
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true,
      uppercase: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewNotes: {
      type: String,
      trim: true,
      default: '',
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: '',
    },
    reversalReason: {
      type: String,
      trim: true,
      default: '',
    },
    paidAt: {
      type: Date,
      default: null,
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    paymentReference: {
      type: String,
      trim: true,
      default: '',
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

// Prevent duplicate commissions for the same lead and policy combination
commissionSchema.index({ leadId: 1, commissionPolicyId: 1 }, { unique: true });
commissionSchema.index({ contractorId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Commission', commissionSchema);
