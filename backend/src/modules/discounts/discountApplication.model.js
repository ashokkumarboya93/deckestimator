// =============================================
// Deck Estimator — Discount Application Snapshot Model (Phase 9)
// =============================================

const mongoose = require('mongoose');

const discountApplicationSchema = new mongoose.Schema(
  {
    estimateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Estimate',
      required: [true, 'Estimate ID is required'],
      index: true,
    },
    estimateVersion: {
      type: Number,
      required: true,
      default: 1,
    },
    contractorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Contractor ID is required'],
      index: true,
    },
    discountPolicyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DiscountPolicy',
      required: [true, 'Discount policy ID is required'],
    },
    policySnapshot: {
      policyId: { type: mongoose.Schema.Types.ObjectId, required: true },
      name: { type: String, required: true },
      code: { type: String, required: true },
      discountType: { type: String, required: true },
      discountValue: { type: Number, required: true },
      applicability: { type: String, default: 'all' },
      minimumEstimateAmount: { type: Number, default: 0 },
      maximumDiscountAmount: { type: Number, default: null },
    },
    eligibleAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    discountAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    originalEstimateAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    finalEstimateAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    appliedComponents: {
      type: String,
      default: 'all',
    },
    calculationSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    appliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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

discountApplicationSchema.index({ estimateId: 1, estimateVersion: 1 }, { unique: true });

module.exports = mongoose.model('DiscountApplication', discountApplicationSchema);
