// =============================================
// Deck Estimator — Commission History Model (Phase 9)
// =============================================

const mongoose = require('mongoose');

const commissionHistorySchema = new mongoose.Schema(
  {
    commissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Commission',
      required: [true, 'Associated commission ID is required'],
      index: true,
    },
    previousStatus: {
      type: String,
      default: null,
    },
    newStatus: {
      type: String,
      required: [true, 'New commission status is required'],
    },
    action: {
      type: String,
      required: [true, 'Action name is required'],
      trim: true,
    },
    reason: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
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
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
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

commissionHistorySchema.index({ commissionId: 1, createdAt: -1 });

module.exports = mongoose.model('CommissionHistory', commissionHistorySchema);
