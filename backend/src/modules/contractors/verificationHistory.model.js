// =============================================
// Deck Estimator — Contractor Verification History Model
// =============================================

const mongoose = require('mongoose');

const verificationHistorySchema = new mongoose.Schema(
  {
    contractorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ContractorProfile',
      required: [true, 'Contractor profile ID is required'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Contractor user ID is required'],
      index: true,
    },
    previousStatus: {
      type: String,
      default: null,
    },
    newStatus: {
      type: String,
      required: [true, 'New verification status is required'],
    },
    action: {
      type: String,
      required: [true, 'Verification action name is required'],
      trim: true,
    },
    reason: {
      type: String,
      default: '',
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Performing user ID is required'],
    },
    performedByRole: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
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

verificationHistorySchema.index({ contractorId: 1, createdAt: -1 });

const VerificationHistory = mongoose.model(
  'VerificationHistory',
  verificationHistorySchema
);

module.exports = VerificationHistory;

