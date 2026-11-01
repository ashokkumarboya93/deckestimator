// =============================================
// Deck Estimator — Estimate Revision Model
// =============================================

const mongoose = require('mongoose');

const estimateRevisionSchema = new mongoose.Schema(
  {
    estimateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Estimate',
      required: true,
      index: true,
    },
    version: {
      type: Number,
      required: true,
    },
    revisionReason: {
      type: String,
      trim: true,
      default: 'Recalculation or project specification update',
    },
    previousSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    revisedSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    revisedBy: {
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

estimateRevisionSchema.index({ estimateId: 1, version: -1 });

const EstimateRevision = mongoose.model(
  'EstimateRevision',
  estimateRevisionSchema,
  'estimateRevisions'
);

module.exports = EstimateRevision;

