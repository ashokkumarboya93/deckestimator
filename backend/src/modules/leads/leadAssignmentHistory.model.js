// =============================================
// Deck Estimator — Lead Assignment History Model (Phase 8)
// =============================================

const mongoose = require('mongoose');

const leadAssignmentHistorySchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: [true, 'Associated lead ID is required'],
      index: true,
    },
    previousContractorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    newContractorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'New assigned contractor ID is required'],
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigning admin ID is required'],
    },
    assignmentReason: {
      type: String,
      default: '',
      trim: true,
    },
    assignmentStatus: {
      type: String,
      enum: ['ASSIGNED', 'REASSIGNED', 'REJECTED_BY_CONTRACTOR'],
      default: 'ASSIGNED',
    },
    assignedAt: {
      type: Date,
      default: Date.now,
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

leadAssignmentHistorySchema.index({ leadId: 1, assignedAt: -1 });

const LeadAssignmentHistory = mongoose.model(
  'LeadAssignmentHistory',
  leadAssignmentHistorySchema
);

module.exports = LeadAssignmentHistory;
