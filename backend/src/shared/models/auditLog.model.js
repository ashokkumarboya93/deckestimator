// =============================================
// Deck Estimator — Audit Log Model
// =============================================

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Performed by user ID is required'],
      index: true,
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      minlength: [2, 'Action must be at least 2 characters'],
      trim: true,
    },
    entityType: {
      type: String,
      required: [true, 'Entity type is required'],
      enum: [
        'USER',
        'CONTRACTOR',
        'ESTIMATE',
        'MATERIAL',
        'PRICING',
        'LEAD',
        'COMMISSION',
      ],
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Entity ID is required'],
      index: true,
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema, 'auditLogs');

module.exports = AuditLog;

