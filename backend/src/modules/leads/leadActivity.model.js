// =============================================
// Deck Estimator — Lead Activity Model (Phase 8)
// =============================================

const mongoose = require('mongoose');
const { LEAD_ACTIVITY_TYPE } = require('../../shared/constants');

const leadActivitySchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: [true, 'Associated lead ID is required'],
      index: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Actor user ID is required'],
    },
    actorRole: {
      type: String,
      required: true,
    },
    activityType: {
      type: String,
      enum: Object.values(LEAD_ACTIVITY_TYPE),
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    previousStatus: {
      type: String,
      default: null,
    },
    newStatus: {
      type: String,
      default: null,
    },
    visibility: {
      type: String,
      enum: ['CUSTOMER_VISIBLE', 'INTERNAL'],
      default: 'CUSTOMER_VISIBLE',
      index: true,
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

leadActivitySchema.index({ leadId: 1, createdAt: -1 });

const LeadActivity = mongoose.model('LeadActivity', leadActivitySchema);

module.exports = LeadActivity;
