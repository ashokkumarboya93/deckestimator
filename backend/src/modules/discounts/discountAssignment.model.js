// =============================================
// Deck Estimator — Contractor Discount Assignment Model (Phase 9)
// =============================================

const mongoose = require('mongoose');
const { DISCOUNT_ASSIGNMENT_TYPE } = require('../../shared/constants');

const discountAssignmentSchema = new mongoose.Schema(
  {
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
      index: true,
    },
    assignmentType: {
      type: String,
      enum: Object.values(DISCOUNT_ASSIGNMENT_TYPE),
      default: DISCOUNT_ASSIGNMENT_TYPE.INDIVIDUAL,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigning admin ID is required'],
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
      enum: ['active', 'inactive', 'revoked'],
      default: 'active',
      index: true,
    },
    notes: {
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

discountAssignmentSchema.index({ contractorId: 1, discountPolicyId: 1 }, { unique: true });

module.exports = mongoose.model('DiscountAssignment', discountAssignmentSchema);
